/**
 * @file main.cpp
 * @brief Main program for ESP32 with CAN bus, Modbus RTU functionality, and resistor measurements
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
#include "../CAN_bus.h"

// Define CAN message types if CAN_bus.h is not accessible
#ifndef MAKE_EXTENDED_CAN_ID
#define MAKE_EXTENDED_CAN_ID(priority, src, dest, msg_type) \
    (0x80000000UL | \
     ((uint32_t)(priority & 0x1F) << 24) | \
     ((uint32_t)(src & 0xFF) << 16) | \
     ((uint32_t)(dest & 0xFF) << 8) | \
     ((uint32_t)(msg_type & 0xFF)))

#define PRIORITY_SENSOR_DATA    8
#define PRIORITY_NORMAL_13      13
#define EXT_DEST_BROADCAST      0xFF
#define MSG_ARCHITECTURE_ID     0x01
#define MSG_ENV_HUMIDITY        0x50
#define MSG_ELECTRICAL_DC_VOLTAGE 0x80
#define MSG_ELECTRICAL_DC_CURRENT 0x82
#define MSG_ELECTRICAL_ACTIVE_POWER 0x84
#endif
// Define pins
#define RXPin         17  // Serial Receive pin
#define TXPin         16  // Serial Transmit pin
#define LED_BUILTIN   2   // Built-in LED on ESP32
#define RS485_CONTROL 25  // RS485 direction control pin
#define DISTANCE_PIN  27
#define RG_GREEN      21
#define RG_RED        22

// Define standard delay time
#define STANDARD_DELAY 100 // 100ms standard delay

// Define ESP32 node ID for CAN communication
#define ESP32_NODE_ID 0x02

// Define ADC pins for resistor measurements
#define ANALOG_PIN1   34  // Junction between R1 and R2
#define ANALOG_PIN2   36  // Junction between R2 and R3
#define ANALOG_PIN3   39  // Junction between R3 and R4

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

/**
 * @brief Connect to WiFi network
 */
void connectToWiFi() {
  Serial.print("Connecting to ");
  Serial.println(ssid);
  
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(STANDARD_DELAY);
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
  Serial.println("\n=== SYSTEM STATUS ======================");
  Serial.println("Device Type    : ESP32 Environmental Monitor");
  Serial.println("CAN Bus Status : Active (Extended IDs)");
  Serial.println("ModBus Status  : Active");
  Serial.println("DHT Sensor     : Active");
  Serial.println("WiFi Status    : " + String(WiFi.status() == WL_CONNECTED ? "Connected" : "Disconnected"));
  Serial.print("CAN Node ID    : 0x");
  Serial.println(ESP32_NODE_ID, HEX);
  Serial.print("Processor Freq : ");
  Serial.print(F_CPU / 1000000);
  Serial.println(" MHz");
  
  Serial.println("\n=== RESISTOR MEASUREMENTS ============");
  Serial.print("Voltage R1     : ");
  Serial.print(voltage1, 3);
  Serial.println(" V");
  Serial.print("Voltage R2     : ");
  Serial.print(voltage2, 3);
  Serial.println(" V");
  Serial.print("Voltage R3     : ");
  Serial.print(voltage3, 3);
  Serial.println(" V");
  Serial.print("Current        : ");
  Serial.print(current * 1000.0, 3);
  Serial.println(" mA");
  Serial.print("Power R1       : ");
  Serial.print(power1 * 1000.0, 3);
  Serial.println(" mW");
  Serial.print("Power R2       : ");
  Serial.print(power2 * 1000.0, 3);
  Serial.println(" mW");
  Serial.print("Power R3       : ");
  Serial.print(power3 * 1000.0, 3);
  Serial.println(" mW");
  Serial.println("=====================================");
}

/**
 * @brief Setup function
 */
void setup() {
  // Initialize serial for debugging
  Serial.begin(115200);
  Serial.println("ESP32 Modbus RTU Slave with DHT11, CAN, and Resistor Measurements");
  
  // Initialize pins
  pinMode(LED_BUILTIN, OUTPUT);
  digitalWrite(LED_BUILTIN, LOW);
  
  pinMode(RG_GREEN, OUTPUT);
  pinMode(RG_RED, OUTPUT);
  
  // Initialize RS485 direction control
  pinMode(RS485_CONTROL, OUTPUT);
  digitalWrite(RS485_CONTROL, RS485_RX_PIN_VALUE);  // Start in receive mode
  
// Initialize RS485Serial with proper settings for Modbus RTU
  RS485Serial.begin(9600);
  delay(100); // Allow time for the serial port to initialize
  
  // Initialize DHT sensor
  dht.begin();
  
  // Configure ADC
  analogSetAttenuation(ADC_11db);  // This allows measuring up to 3.3V
  
  // Connect to WiFi
  connectToWiFi();
  
  // Initialize CAN bus with extended frame support
  mcp2515.reset();
  mcp2515.setBitrate(CAN_500KBPS, MCP_8MHZ);
  mcp2515.setNormalMode();
  Serial.println("CAN bus initialized with extended frame support");
  
  // Initialize dummy data
  initializeDummyData();
  
  // Send architecture info via CAN on startup using extended ID
  canMsg.can_id = MAKE_EXTENDED_CAN_ID(PRIORITY_NORMAL_13, ESP32_NODE_ID, EXT_DEST_BROADCAST, MSG_ARCHITECTURE_ID);
  sendArchitectureViaCAN();
  
  Serial.println("Sending architecture info with extended CAN ID: 0x" + String(canMsg.can_id, HEX));
  
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
  Serial.println("Voltage values stored in Input Registers 2-4 (×1000)");
  Serial.println("Current value stored in Input Register 5 (×1000)");
  Serial.println("Power values stored in Input Registers 6-8 (×1000)");
  Serial.println("Note: Coil 0 controls the built-in LED");
}

/**
 * @brief Main loop
 */
void loop() {
  // Prioritize Modbus communication - check several times per loop
  for(int i = 0; i < 5; i++) {
    // Check for incoming Modbus data
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
        // Give extra time for processing and response
        delay(50);
      }
    }
    delay(10); // Short delay between Modbus checks
  }
  
  // Update sensor data and registers (happens once per main loop)
  updateSensorData();
  delay(50); // Short delay after updating sensors
  
  // Update resistor measurements and update modbus registers
  updateResistorMeasurements();
  delay(50); // Short delay after resistor measurements
  
  // Update dummy data
  updateDummyData();
  
  // Send CAN messages - do this less frequently than Modbus checking
  static int canCounter = 0;
  canCounter++;
  
  if(canCounter % 5 == 0) { // Only send every 5th loop iteration
    // Send architecture via CAN - architecture information
    canMsg.can_id = MAKE_EXTENDED_CAN_ID(PRIORITY_NORMAL_13, ESP32_NODE_ID, EXT_DEST_BROADCAST, MSG_ARCHITECTURE_ID);
    sendArchitectureViaCAN();
    delay(20);
    
    // Configure extended CAN ID before sending temperature/humidity
    canMsg.can_id = MAKE_EXTENDED_CAN_ID(PRIORITY_SENSOR_DATA, ESP32_NODE_ID, EXT_DEST_BROADCAST, MSG_ENV_HUMIDITY);
    sendCANMessage();
    delay(20);
    
    // Use appropriate message type for voltage measurements
    canMsg.can_id = MAKE_EXTENDED_CAN_ID(PRIORITY_SENSOR_DATA, ESP32_NODE_ID, EXT_DEST_BROADCAST, MSG_ELECTRICAL_DC_VOLTAGE);
    sendVoltageViaCAN();
    delay(20);
    
    // Use appropriate message type for current measurements
    canMsg.can_id = MAKE_EXTENDED_CAN_ID(PRIORITY_SENSOR_DATA, ESP32_NODE_ID, EXT_DEST_BROADCAST, MSG_ELECTRICAL_DC_CURRENT);
    sendCurrentViaCAN();
    delay(20);
    
    // Use appropriate message type for power measurements
    canMsg.can_id = MAKE_EXTENDED_CAN_ID(PRIORITY_SENSOR_DATA, ESP32_NODE_ID, EXT_DEST_BROADCAST, MSG_ELECTRICAL_ACTIVE_POWER);
    sendPowerViaCAN();
    
    // Print system info with power data
    printSystemInfo();
    
    // Reset counter if it gets too large
    if(canCounter > 100) {
      canCounter = 0;
    }
  }
  
  // Receive CAN messages (including extended frame formats)
  receiveCANMessage();
  
  delay(50); // Short delay for stability
}