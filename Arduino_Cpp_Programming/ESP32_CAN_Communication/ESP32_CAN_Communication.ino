#include <SPI.h>
#include <mcp2515.h>
#include "DHT.h"
#include <WiFi.h>

// WiFi credentials
const char* ssid = "Huawei-NET";
const char* password = "extremehacktivist";

struct can_frame canMsg;
MCP2515 mcp2515(5);
bool ledState = false;

#define DHTPIN  26 // DHT 11 PIN
#define DHTTYPE DHT11 // DHT 11 Type
DHT dht(DHTPIN, DHTTYPE);

// Architecture ID enum
enum ArchitectureID {
  ARCH_UNKNOWN = 0,
  ARCH_AVR = 1,
  ARCH_ARM = 2,
  ARCH_XTENSA = 3,  // ESP32/ESP8266
  ARCH_RISCV = 4,
  ARCH_SAM3X = 5,   // Arduino Due
  ARCH_STM32 = 6,
  ARCH_MEGAAVR = 7
};

// Get architecture ID
uint8_t getArchitectureID() {
  #if defined(__AVR__)
    return ARCH_AVR;
  #elif defined(__arm__)
    return ARCH_ARM;
  #elif defined(__xtensa__)
    return ARCH_XTENSA;
  #elif defined(__riscv)
    return ARCH_RISCV;
  #elif defined(__SAM3X8E__)
    return ARCH_SAM3X;
  #elif defined(ARDUINO_ARCH_STM32)
    return ARCH_STM32;
  #elif defined(ARDUINO_ARCH_MEGAAVR)
    return ARCH_MEGAAVR;
  #else
    return ARCH_UNKNOWN;
  #endif
}

// Get architecture name
String getArchitectureName(uint8_t archID) {
  switch (archID) {
    case ARCH_AVR:
      return "AVR";
    case ARCH_ARM:
      return "ARM";
    case ARCH_XTENSA:
      return "Xtensa";
    case ARCH_RISCV:
      return "RISC-V";
    case ARCH_SAM3X:
      return "SAM3X (Arduino Due)";
    case ARCH_STM32:
      return "STM32";
    case ARCH_MEGAAVR:
      return "MegaAVR";
    default:
      return "Unknown";
  }
}

void setup() {
  Serial.begin(9600);
  
  // Initialize DHT sensor
  dht.begin();
  
  // Connect to WiFi
  connectToWiFi();
  
  mcp2515.reset();
  mcp2515.setBitrate(CAN_500KBPS, MCP_8MHZ);
  mcp2515.setNormalMode();
  pinMode(LED_BUILTIN, OUTPUT);
  Serial.println("CAN Send & Receive Ready");
  
  // Send architecture info via CAN on startup
  sendArchitectureViaCAN();
}

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
  // Print system info
  printSystemInfo();
  
  // Send architecture via CAN every 5 seconds
  static unsigned long lastSendTime = 0;
  if (millis() - lastSendTime > 5000) {
    sendArchitectureViaCAN();
    lastSendTime = millis();
  }
  
  // Send temperature and humidity data
  sendCANMessage();
  
  receiveCANMessage();
  
  // Read and update sensor data
  float temp = readDHTTemperature();
  float humid = readDHTHumidity();
  if (!isnan(temp) && !isnan(humid)) {
    Serial.println("======================================");
    Serial.println("Temperature : " + String(temp) + " *C");
    Serial.println("Humidity    : " + String(humid) + " %");
    Serial.println("======================================");
  }
  
  delay(500);
}

void sendArchitectureViaCAN() {
  uint8_t archID = getArchitectureID();
  String archName = getArchitectureName(archID);
  
  // Convert string to bytes for CAN transmission
  int nameLength = archName.length();
  if (nameLength > 8) {
    nameLength = 8; // CAN message can only hold 8 bytes
  }
  
  canMsg.can_id = 0x100;  // Architecture message ID
  canMsg.can_dlc = nameLength;
  
  // Copy each character of the architecture name to the CAN message
  for (int i = 0; i < nameLength; i++) {
    canMsg.data[i] = (uint8_t)archName.charAt(i);
  }
  
  if (mcp2515.sendMessage(&canMsg) == MCP2515::ERROR_OK) {
    Serial.print("Sent CAN Message - Architecture: ");
    Serial.println(archName);
  } else {
    Serial.println("Error sending architecture message");
  }
}

void sendCANMessage() {
  float temp = readDHTTemperature();
  float humid = readDHTHumidity();
  
  if (!isnan(temp) && !isnan(humid)) {
    canMsg.can_id = 0x125;
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
    
    // Interpret messages based on CAN ID
    if (canMsg.can_id == 0x100) {
      // Architecture message - convert bytes back to string
      String receivedArchName = "";
      for (int i = 0; i < canMsg.can_dlc; i++) {
        receivedArchName += (char)canMsg.data[i];
      }
      
      Serial.println("\nData Interpretation:");
      Serial.println("Message Type: Architecture Info");
      Serial.print("Architecture: ");
      Serial.println(receivedArchName);
    }
    else if (canMsg.can_id == 0x124 && canMsg.can_dlc == 8) {
      // Temperature and humidity message
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
  
  Serial.print("Architecture: ");
  Serial.println(getArchitectureName(getArchitectureID()));
  
  Serial.print("Uptime: ");
  Serial.print(millis() / 1000);
  Serial.println(" seconds\n");
}