/**
 * @file main.cpp
 * @brief Main program for ESP32 with CAN bus and Modbus RTU functionality
 */

#include <Arduino.h>
#include <SoftwareSerial.h>
#include <SPI.h>
#include <mcp2515.h>
#include "DHT.h"
#include <WiFi.h>

// Include our custom header files
#include "can_functions.h"
#include "rtu_functions.h"

// Define pins
#define RXPin         17  // Serial Receive pin
#define TXPin         16  // Serial Transmit pin
#define LED_BUILTIN   2   // Built-in LED on ESP32
#define RS485_CONTROL 25  // RS485 direction control pin
#define DISTANCE_PIN  27
#define RG_GREEN      21
#define RG_RED        22

// DHT sensor setup
#define DHTPIN  26 // DHT 11 PIN
#define DHTTYPE DHT11 // DHT 11 Type

// WiFi credentials
const char* ssid = "Huawei-NET";
const char* password = "extremehacktivist";

// Time tracking for RS485 response
unsigned long lastRS485SendTime = 0;
const unsigned long RS485_SEND_INTERVAL = 1000; // 1 second interval

// Fixed message to send via RS485
#define RS485_MESSAGE "ESP32 MAX485"

// Global variables needed by the header files
bool coils[COIL_COUNT];
bool discreteInputs[DISCRETE_COUNT];
uint16_t holdingRegisters[HOLDING_COUNT];
uint16_t inputRegisters[INPUT_COUNT];

// CAN variables
struct can_frame canMsg;
MCP2515 mcp2515(5);  // CS pin
bool ledState = false;

// RS485 variables
SoftwareSerial RS485Serial(RXPin, TXPin);

// DHT sensor
DHT dht(DHTPIN, DHTTYPE);

/**
 * @brief Connect to WiFi network
 */
void connectToWiFi() {
  Serial.print("Connecting to ");
  Serial.println(ssid);
  
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi connected");
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\nWiFi connection failed!");
  }
}

/**
 * @brief Update sensor data and store in input registers
 */
void updateSensorData() {
  float temp = readDHTTemperature();
  float humid = readDHTHumidity();
  
  if (!isnan(temp) && !isnan(humid)) {
    // Store temperature and humidity in input registers (scaled by 10)
    // Register 0: Temperature (×10)
    // Register 1: Humidity (×10)
    inputRegisters[0] = (uint16_t)(temp * 10.0);
    inputRegisters[1] = (uint16_t)(humid * 10.0);
    
    Serial.println("======================================");
    Serial.println("Temperature : " + String(temp) + " *C");
    Serial.println("Humidity    : " + String(humid) + " %");
    Serial.println("ModBus Register 0 (Temp): " + String(inputRegisters[0]));
    Serial.println("ModBus Register 1 (Humidity): " + String(inputRegisters[1]));
    Serial.println("======================================");
    
    // Update LED indicators based on sensor values
    if (humid > 58.0 || temp < 22.0) {
      digitalWrite(RG_GREEN, LOW);
      digitalWrite(RG_RED, HIGH);
    } else if (humid < 58.0 || temp > 22.0) {
      digitalWrite(RG_GREEN, HIGH);
      digitalWrite(RG_RED, LOW);
    }
  }
}

/**
 * @brief Print system information
 */
void printSystemInfo() {
  Serial.println("Arduino System Info:");
  Serial.print("Processor Frequency: ");
  Serial.print(F_CPU / 1000000);
  Serial.println(" MHz");
  
  Serial.print("WiFi Status: ");
  Serial.println(WiFi.status() == WL_CONNECTED ? "Connected" : "Disconnected");
  
  Serial.print("Architecture: ");
  Serial.println(getArchitectureName(getArchitectureID()));
  
  Serial.print("Uptime: ");
  Serial.print(millis() / 1000);
  Serial.println(" seconds\n");
}

/**
 * @brief Setup function
 */
void setup() {
  // Initialize serial for debugging
  Serial.begin(115200);
  Serial.println("ESP32 Modbus RTU Slave with DHT11 and CAN");
  
  // Initialize pins
  pinMode(LED_BUILTIN, OUTPUT);
  digitalWrite(LED_BUILTIN, LOW);
  
  pinMode(RG_GREEN, OUTPUT);
  pinMode(RG_RED, OUTPUT);
  
  // Initialize RS485 direction control
  pinMode(RS485_CONTROL, OUTPUT);
  digitalWrite(RS485_CONTROL, RS485_RX_PIN_VALUE);  // Start in receive mode
  
  // Initialize RS485Serial
  RS485Serial.begin(9600);
  
  // Initialize DHT sensor
  dht.begin();
  
  // Connect to WiFi
  connectToWiFi();
  
  // Initialize CAN bus
  mcp2515.reset();
  mcp2515.setBitrate(CAN_500KBPS, MCP_8MHZ);
  mcp2515.setNormalMode();
  
  // Initialize dummy data
  initializeDummyData();
  
  // Send architecture info via CAN on startup
  sendArchitectureViaCAN();
  
  Serial.println("Ready for Modbus RTU commands");
  Serial.println("Implemented functions:");
  Serial.println("0x01: Read Coils");
  Serial.println("0x02: Read Discrete Inputs");
  Serial.println("0x03: Read Holding Registers");
  Serial.println("0x04: Read Input Registers");
  Serial.println("0x05: Write Single Coil");
  Serial.println("0x06: Write Single Register");
  Serial.println("0x0F: Write Multiple Coils");
  Serial.println("0x10: Write Multiple Registers");
  Serial.println();
  Serial.println("Temperature stored in Input Register 0 (×10)");
  Serial.println("Humidity stored in Input Register 1 (×10)");
  Serial.println("Note: Coil 0 controls the built-in LED");
}

/**
 * @brief Main loop
 */
void loop() {
  // Check for incoming Modbus data
  if (RS485Serial.available()) {
    // Wait to ensure complete message
    delay(100);
    
    // Read the data
    uint8_t buffer[256];
    uint8_t byteCount = 0;
    
    while (RS485Serial.available() && byteCount < 256) {
      buffer[byteCount++] = RS485Serial.read();
    }
    
    // Debug print
    if (byteCount > 0) {
      Serial.print("Received frame (");
      Serial.print(byteCount);
      Serial.print(" bytes): ");
      for (int i = 0; i < byteCount; i++) {
        Serial.print(buffer[i], HEX);
        Serial.print(" ");
      }
      Serial.println();
      
      // Process the Modbus frame
      processModbusFrame(buffer, byteCount);
    }
  }
  
  // Read sensor data and update modbus registers
  static unsigned long lastSensorUpdateTime = 0;
  if (millis() - lastSensorUpdateTime > 2000) {
    updateSensorData();
    lastSensorUpdateTime = millis();
  }
  
  // Update dummy data
  updateDummyData();
  
  // Send architecture via CAN periodically
  static unsigned long lastArchSendTime = 0;
  if (millis() - lastArchSendTime > 5000) {
    sendArchitectureViaCAN();
    lastArchSendTime = millis();
  }
  
  // Send temperature and humidity via CAN periodically
  static unsigned long lastCANSendTime = 0;
  if (millis() - lastCANSendTime > 1000) {
    sendCANMessage();
    lastCANSendTime = millis();
    
    // Print system info periodically
    printSystemInfo();
  }
  
  // Receive CAN messages
  receiveCANMessage();
  
  delay(10); // Short delay for stability
}