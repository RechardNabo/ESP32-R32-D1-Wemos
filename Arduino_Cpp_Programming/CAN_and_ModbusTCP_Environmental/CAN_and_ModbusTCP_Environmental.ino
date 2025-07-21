/**
 * @file main.cpp
 * @brief Main program for ESP32 with CAN bus, Modbus TCP and Modbus RTU functionality
 */

#include <Arduino.h>
#include <SoftwareSerial.h>
#include <SPI.h>
#include <mcp2515.h>
#include "DHT.h"
#include <WiFi.h>
#include "../CAN_bus.h"  // Include extended CAN ID protocol definitions

// Include our custom header files
#include "can_functions.h"
#include "modbus_tcp_functions.h"
#include "rtu_functions.h"

// WiFi credentials
const char* ssid = "Huawei-NET";
const char* password = "extremehacktivist";

// Modbus TCP Settings
#define MODBUS_TCP_PORT 502
WiFiServer modbusServer(MODBUS_TCP_PORT);
WiFiClient modbusClient;

// Define pins
#define RXPin         17  // Serial Receive pin for RS485
#define TXPin         16  // Serial Transmit pin for RS485
#define LED_BUILTIN   2   // Built-in LED on ESP32
#define RS485_CONTROL 25  // RS485 direction control pin
#define DISTANCE_PIN  27
#define RG_GREEN      21
#define RG_RED        22

// Define ADC pins for resistor measurements
#define ANALOG_PIN1 32
#define ANALOG_PIN2 33
#define ANALOG_PIN3 34

// DHT sensor setup
#define DHTPIN  26 // DHT 11 PIN
#define DHTTYPE DHT11 // DHT 11 Type

// Time tracking for RS485 response
unsigned long lastRS485SendTime = 0;
const unsigned long RS485_SEND_INTERVAL = 1000; // 1 second interval

// Fixed message to send via RS485
#define RS485_MESSAGE "ESP32 MAX485"

// Global variables needed by the header files
// CAN variables
struct can_frame canMsg;
MCP2515 mcp2515(5);  // CS pin
bool ledState = false;

// RS485 variables
SoftwareSerial RS485Serial(RXPin, TXPin);

// DHT sensor
DHT dht(DHTPIN, DHTTYPE);

// Resistor values in ohms
const float R1 = 2000.0;
const float R2 = 2000.0;
const float R3 = 2000.0;
const float R4 = 2000.0;

// ADC resolution
const float adcMax = 4095.0;  // ESP32 has 12-bit ADC (2^12 - 1)
// Reference voltage
const float vRef = 3.3;  // ESP32 reference voltage is 3.3V
// Supply voltage
const float supplyVoltage = 5.0;  // 5V power supply

// Variables for resistor measurements
float voltage1 = 0.0;
float voltage2 = 0.0;
float voltage3 = 0.0;
float current = 0.0;
float power1 = 0.0;
float power2 = 0.0;
float power3 = 0.0;

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
 * @brief Measure resistor values and calculate voltage, current, and power
 */
void updateResistorMeasurements() {
  // Read analog values
  int adc1 = analogRead(ANALOG_PIN1);
  int adc2 = analogRead(ANALOG_PIN2);
  int adc3 = analogRead(ANALOG_PIN3);
  
  // Convert ADC values to voltage
  float junctionVoltage1 = (adc1 / adcMax) * vRef;
  float junctionVoltage2 = (adc2 / adcMax) * vRef;
  float junctionVoltage3 = (adc3 / adcMax) * vRef;
  
  // Calculate the measured voltage across each resistor
  voltage1 = supplyVoltage - junctionVoltage1;
  voltage2 = junctionVoltage1 - junctionVoltage2;
  voltage3 = junctionVoltage2 - junctionVoltage3;
  
  // Calculate current (should be the same through all resistors in series)
  float current1 = voltage1 / R1;
  float current2 = voltage2 / R2;
  float current3 = voltage3 / R3;
  
  // Average the current calculations for better accuracy
  current = (current1 + current2 + current3) / 3.0;
  
  // Calculate power dissipation
  power1 = voltage1 * current;
  power2 = voltage2 * current;
  power3 = voltage3 * current;
  
  // Store measurements in input registers for Modbus access
  // Storing values with 3 decimal places precision (multiply by 1000)
  // Register 2-4: Voltages (×1000)
  inputRegisters[2] = (uint16_t)(voltage1 * 1000.0);
  inputRegisters[3] = (uint16_t)(voltage2 * 1000.0);
  inputRegisters[4] = (uint16_t)(voltage3 * 1000.0);
  
  // Register 5: Current (×1000) in mA
  inputRegisters[5] = (uint16_t)(current * 1000.0);
  
  // Register 6-8: Power (×1000) in mW
  inputRegisters[6] = (uint16_t)(power1 * 1000.0);
  inputRegisters[7] = (uint16_t)(power2 * 1000.0);
  inputRegisters[8] = (uint16_t)(power3 * 1000.0);
  
  Serial.println("\nRESISTOR MEASUREMENTS:");
  
  Serial.println("Voltages:");
  Serial.print("R1: ");
  Serial.print(voltage1, 3);
  Serial.print("V, R2: ");
  Serial.print(voltage2, 3);
  Serial.print("V, R3: ");
  Serial.print(voltage3, 3);
  Serial.println("V");
  
  Serial.print("Current: ");
  Serial.print(current * 1000.0, 3);
  Serial.println(" mA");
  
  Serial.println("Power:");
  Serial.print("R1: ");
  Serial.print(power1 * 1000.0, 3);
  Serial.print("mW, R2: ");
  Serial.print(power2 * 1000.0, 3);
  Serial.print("mW, R3: ");
  Serial.print(power3 * 1000.0, 3);
  Serial.println("mW");
  
  Serial.println("ModBus Registers Updated (2-8)");
  Serial.println("======================================");
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
  
  // Initialize RS485 communication for Modbus RTU
  RS485Serial.begin(9600);
  pinMode(RS485_CONTROL, OUTPUT);
  digitalWrite(RS485_CONTROL, LOW);  // Set to receive mode initially
  Serial.println("RS485 communication initialized for Modbus RTU");
  
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
  initializeDummyDataTCP();  // Initialize for Modbus TCP
  initializeDummyData();    // Initialize for Modbus RTU
  
  // Send architecture info via CAN on startup
  sendArchitectureViaCAN();
  
  Serial.println("Ready for Modbus TCP and RTU commands");
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
  // Prioritize Modbus communication - check several times per loop
  
  // Handle Modbus TCP connections
  handleModbusTCP();
  
  // Check for incoming Modbus RTU data
  for(int i = 0; i < 5; i++) {
    if (RS485Serial.available()) {
      // Wait a short time to ensure complete message
      delay(20);
      
      // Read the data
      uint8_t buffer[256];
      uint8_t byteCount = 0;
      
      while (RS485Serial.available() && byteCount < 256) {
        buffer[byteCount++] = RS485Serial.read();
      }
      
      // Debug print
      if (byteCount > 0) {
        Serial.print("Received RTU frame (");
        Serial.print(byteCount);
        Serial.print(" bytes): ");
        for (int i = 0; i < byteCount; i++) {
          Serial.print(buffer[i], HEX);
          Serial.print(" ");
        }
        Serial.println();
        
        // Process the Modbus RTU frame
        processModbusFrame(buffer, byteCount);
        // Give extra time for processing and response
        delay(50);
      }
    }
    delay(10); // Short delay between Modbus checks
  }
  
  // Read sensor data and update modbus registers
  updateSensorData();
  delay(50);  // Short delay after reading sensors
  
  // Update resistor measurements and update modbus registers
  updateResistorMeasurements();
  delay(50); // Short delay after resistor measurements
  
  // Update dummy data for both protocols
  updateDummyDataTCP(); // TCP version
  updateDummyData();    // RTU version
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
  
  delay(50);  // Main loop delay
}