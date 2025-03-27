#include <SPI.h>
#include <mcp2515.h>
#include "DHT.h"
#include <WiFi.h>
#include <ModbusTCPServer.h>

// WiFi credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Modbus TCP Server
WiFiServer wifiServer(502);  // Modbus TCP default port
ModbusTCPServer modbusTCPServer;

// Modbus registers (Holding Registers)
#define TEMP_REG 0    // Temperature register address
#define HUMID_REG 1   // Humidity register address

struct can_frame canMsg;
MCP2515 mcp2515(5);
bool ledState = false;

#define DHTPIN  26 // DHT 11 PIN
#define DHTTYPE DHT11 // DHT 11 Type
DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(9600);
  
  // Connect to WiFi
  connectToWiFi();
  
  // Start Modbus TCP server
  wifiServer.begin();
  modbusTCPServer.begin(wifiServer);
  
  // Configure Modbus registers (2 holding registers)
  modbusTCPServer.configureHoldingRegisters(0x00, 2);
  
  mcp2515.reset();
  mcp2515.setBitrate(CAN_500KBPS, MCP_8MHZ);
  mcp2515.setNormalMode();
  pinMode(LED_BUILTIN, OUTPUT);
  Serial.println("CAN Send & Receive Ready");
  Serial.println("Modbus TCP Server Ready");
}

void connectToWiFi() {
  Serial.print("Connecting to ");
  Serial.println(ssid);
  
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("\nWiFi connected");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
}

float readDHTTemperature() {
  float temp = dht.readTemperature();
  if (isnan(temp)) {
    Serial.println("Failed to read temperature from DHT sensor!");
    return -1.0;
  }
  return temp;
}

float readDHTHumidity() {
  float humid = dht.readHumidity();
  if (isnan(humid)) {
    Serial.println("Failed to read humidity from DHT sensor!");
    return -1.0;
  }
  return humid;
}

void loop() {
  printSystemInfo();
  sendCANMessage();
  receiveCANMessage();
  handleModbusRequests();
  
  Serial.println("======================================");
  float temp = readDHTTemperature();
  float humid = readDHTHumidity();
  if (!isnan(temp) && !isnan(humid)) {
    Serial.println("Temperature : " + String(temp) + " *C");
    Serial.println("Humidity    : " + String(humid) + " %");
    // Update Modbus registers
    modbusTCPServer.holdingRegisterWrite(TEMP_REG, (uint16_t)(temp * 10));  // Scale by 10 for precision
    modbusTCPServer.holdingRegisterWrite(HUMID_REG, (uint16_t)(humid * 10));
  }
  Serial.println("======================================");
  delay(500);
}

void handleModbusRequests() {
  // Accept incoming connections and process Modbus requests
  int packetSize = modbusTCPServer.accept();
  if (packetSize > 0) {
    int requestResult = modbusTCPServer.poll();
    
    if (requestResult > 0) {
      Serial.println("Modbus request processed successfully");
    } else if (requestResult < 0) {
      Serial.println("Modbus request processing failed");
    }
  }
}

void sendCANMessage() {
  float temp = readDHTTemperature();
  float humid = readDHTHumidity();
  
  if (!isnan(temp) && !isnan(humid)) {
    canMsg.can_id = 0x124;
    canMsg.can_dlc = 8;
    
    uint32_t tempBits;
    memcpy(&tempBits, &temp, sizeof(temp));
    uint32_t humidBits;
    memcpy(&humidBits, &humid, sizeof(humid));
    
    canMsg.data[0] = (tempBits >> 24) & 0xFF;
    canMsg.data[1] = (tempBits >> 16) & 0xFF;
    canMsg.data[2] = (tempBits >> 8) & 0xFF;
    canMsg.data[3] = tempBits & 0xFF;
    
    canMsg.data[4] = (humidBits >> 24) & 0xFF;
    canMsg.data[5] = (humidBits >> 16) & 0xFF;
    canMsg.data[6] = (humidBits >> 8) & 0xFF;
    canMsg.data[7] = humidBits & 0xFF;
    
    if (mcp2515.sendMessage(&canMsg) == MCP2515::ERROR_OK) {
      Serial.print("Sent CAN Message - Temp: ");
      Serial.print(temp);
      Serial.print("°C, Humid: ");
      Serial.print(humid);
      Serial.println("%");
    } else {
      Serial.println("Error sending message");
    }
  } else {
    Serial.println("Skipping CAN message due to invalid sensor data");
  }
}

void receiveCANMessage() {
  if (mcp2515.readMessage(&canMsg) == MCP2515::ERROR_OK) {
    Serial.println("\n==== CAN MESSAGE RECEIVED ====");
    Serial.print("[");
    Serial.print(millis() / 1000.0, 2);
    Serial.println("s]");
    
    Serial.print("CAN ID: 0x");
    Serial.println(canMsg.can_id, HEX);
    
    Serial.print("Data Length: ");
    Serial.println(canMsg.can_dlc);
    
    Serial.print("HEX: ");
    for (int i = 0; i < canMsg.can_dlc; i++) {
      if (canMsg.data[i] < 0x10) Serial.print("0");
      Serial.print(canMsg.data[i], HEX);
      Serial.print(" ");
    }
    Serial.println();
    
    if (canMsg.can_id == 0x124 && canMsg.can_dlc == 8) {
      uint32_t tempBits = ((uint32_t)canMsg.data[0] << 24) |
                         ((uint32_t)canMsg.data[1] << 16) |
                         ((uint32_t)canMsg.data[2] << 8) |
                         canMsg.data[3];
      uint32_t humidBits = ((uint32_t)canMsg.data[4] << 24) |
                          ((uint32_t)canMsg.data[5] << 16) |
                          ((uint32_t)canMsg.data[6] << 8) |
                          canMsg.data[7];
      
      float receivedTemp, receivedHumid;
      memcpy(&receivedTemp, &tempBits, sizeof(float));
      memcpy(&receivedHumid, &humidBits, sizeof(float));
      
      Serial.println("\nData Interpretation:");
      Serial.println("Message Type: Sensor Data");
      Serial.print("Temperature: ");
      Serial.print(receivedTemp);
      Serial.println("°C");
      Serial.print("Humidity: ");
      Serial.print(receivedHumid);
      Serial.println("%");
    }
    
    toggleLED();
  }
}

void toggleLED() {
  ledState = !ledState;
  digitalWrite(LED_BUILTIN, ledState);
}

void printSystemInfo() {
  Serial.println("Arduino System Info:");
  Serial.print("Processor Frequency: ");
  Serial.print(F_CPU / 1000000);
  Serial.println(" MHz");
  
  Serial.print("WiFi Status: ");
  Serial.println(WiFi.status() == WL_CONNECTED ? "Connected" : "Disconnected");
  
  #if defined(__AVR__)
    Serial.println("Architecture: AVR");
  #elif defined(__arm__)
    Serial.println("Architecture: ARM");
  #elif defined(__xtensa__)
    Serial.println("Architecture: Xtensa (ESP32/ESP8266)");
  #elif defined(__riscv)
    Serial.println("Architecture: RISC-V");
  #elif defined(__SAM3X8E__)
    Serial.println("Architecture: SAM3X (Arduino Due)");
  #elif defined(ARDUINO_ARCH_STM32)
    Serial.println("Architecture: STM32");
  #elif defined(ARDUINO_ARCH_MEGAAVR)
    Serial.println("Architecture: MegaAVR");
  #else
    Serial.println("Architecture: Unknown");
  #endif
  
  Serial.print("Uptime: ");
  Serial.print(millis() / 1000);
  Serial.println(" seconds\n");
}
