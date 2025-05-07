/**
 * @file main.cpp
 * @brief Main program for ESP32 with CAN bus and Modbus TCP functionality
 */

#include <Arduino.h>
#include <SPI.h>
#include <mcp2515.h>
#include "DHT.h"
#include <WiFi.h>

// Include our custom header files
#include "can_functions.h"
#include "modbus_tcp_functions.h"

// WiFi credentials
const char* ssid = "Huawei-NET";
const char* password = "extremehacktivist";

// Modbus TCP Settings
#define MODBUS_TCP_PORT 502
WiFiServer modbusServer(MODBUS_TCP_PORT);
WiFiClient modbusClient;

// Define pins
#define LED_BUILTIN   2   // Built-in LED on ESP32
#define DISTANCE_PIN  27
#define RG_GREEN      21
#define RG_RED        22

// DHT sensor setup
#define DHTPIN  26 // DHT 11 PIN
#define DHTTYPE DHT11 // DHT 11 Type

// Global variables needed by the header files
// CAN variables
struct can_frame canMsg;
MCP2515 mcp2515(5);  // CS pin
bool ledState = false;

// DHT sensor
DHT dht(DHTPIN, DHTTYPE);

// Modbus memory maps
bool coils[COIL_COUNT];
bool discreteInputs[DISCRETE_COUNT];
uint16_t holdingRegisters[HOLDING_COUNT];
uint16_t inputRegisters[INPUT_COUNT];

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
  Serial.println("ESP32 Modbus TCP Slave with DHT11 and CAN");
  
  // Initialize pins
  pinMode(LED_BUILTIN, OUTPUT);
  digitalWrite(LED_BUILTIN, LOW);
  
  pinMode(RG_GREEN, OUTPUT);
  pinMode(RG_RED, OUTPUT);
  
  // Initialize DHT sensor
  dht.begin();
  
  // Connect to WiFi
  connectToWiFi();
  
  // Start Modbus TCP server
  modbusServer.begin();
  Serial.print("Modbus TCP server started on port ");
  Serial.println(MODBUS_TCP_PORT);
  
  // Initialize CAN bus with enhanced debugging
  Serial.println("\n=== CAN Bus Initialization ===");
  Serial.println("Resetting MCP2515 controller...");
  MCP2515::ERROR resetResult = mcp2515.reset();
  
  if (resetResult != MCP2515::ERROR_OK) {
    Serial.print("Error resetting MCP2515. Error code: ");
    Serial.println((int)resetResult);
  } else {
    Serial.println("MCP2515 reset successful");
  }
  
  delay(100);  // Short delay after reset
  
  Serial.println("Setting CAN bitrate...");
  MCP2515::ERROR bitrateResult = mcp2515.setBitrate(CAN_500KBPS, MCP_8MHZ);
  
  if (bitrateResult != MCP2515::ERROR_OK) {
    Serial.print("Error setting bitrate. Error code: ");
    Serial.println((int)bitrateResult);
  } else {
    Serial.println("Bitrate set successfully");
  }
  
  delay(100);  // Short delay after setting bitrate
  
  Serial.println("Setting CAN normal mode...");
  MCP2515::ERROR modeResult = mcp2515.setNormalMode();
  
  if (modeResult != MCP2515::ERROR_OK) {
    Serial.print("Error setting normal mode. Error code: ");
    Serial.println((int)modeResult);
  } else {
    Serial.println("Normal mode set successfully");
  }
  
  delay(100);  // Short delay after setting mode
  
  // Initialize dummy data
  initializeDummyData();
  
  // Send architecture info via CAN on startup
  sendArchitectureViaCAN();
  
  Serial.println("Ready for Modbus TCP commands");
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
  // Handle Modbus TCP connections
  handleModbusTCP();
  
  // Read sensor data and update modbus registers
  updateSensorData();
  delay(50);  // Short delay after reading sensors
  
  // Update dummy data
  updateDummyData();
  delay(50);  // Short delay after updating dummy data
  
  // Send architecture via CAN
  static unsigned long archCount = 0;
  if (archCount++ % 50 == 0) {  // Send architecture info every ~5 seconds
    sendArchitectureViaCAN();
    delay(100);  // Longer delay after sending CAN message
  }
  
  // Send temperature and humidity via CAN
  static unsigned long msgCount = 0;
  if (msgCount++ % 10 == 0) {  // Send data every ~1 second
    sendCANMessage();
    delay(100);  // Longer delay after sending CAN message
    
    // Print system info
    printSystemInfo();
    delay(50);  // Short delay after printing info
  }
  
  // Receive CAN messages
  receiveCANMessage();
  
  delay(100);  // Main loop delay - increased for stability
}