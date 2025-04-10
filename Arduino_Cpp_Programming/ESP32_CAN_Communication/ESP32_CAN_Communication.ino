#include <SPI.h>
#include <mcp2515.h>
#include "DHT.h"
#include <WiFi.h>
#include <SoftwareSerial.h>

// WiFi credentials
const char* ssid = "Huawei-NET";
const char* password = "extremehacktivist";

// CAN Bus setup
struct can_frame canMsg;
MCP2515 mcp2515(5);
bool ledState = false;

// DHT sensor setup
#define DHTPIN  26 // DHT 11 PIN
#define DHTTYPE DHT11 // DHT 11 Type
DHT dht(DHTPIN, DHTTYPE);

// RS485 setup
#define RXPin        16  // Serial Receive pin
#define TXPin        27  // Serial Transmit pin
 
// RS485 control
#define SERIAL_COMMUNICATION_CONTROL_PIN 25 // Transmission set pin
#define RS485_TX_PIN_VALUE HIGH
#define RS485_RX_PIN_VALUE LOW

// Try using HardwareSerial instead of SoftwareSerial for better reliability
// Comment out this line and uncomment the one below if still having issues
SoftwareSerial RS485Serial(RXPin, TXPin); // RX, TX

// Alternate hardware serial option (if needed)
// #define RS485Serial Serial2
int byteSend;
String dataReceived;
bool isDataReceived = false;

// Fixed message to send via RS485
#define RS485_MESSAGE "ESP32 MAX485"

// Time tracking for RS485 response
unsigned long lastRS485SendTime = 0;
const unsigned long RS485_SEND_INTERVAL = 1000; // 1 second interval

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
  
  // Initialize CAN bus
  mcp2515.reset();
  mcp2515.setBitrate(CAN_500KBPS, MCP_8MHZ);
  mcp2515.setNormalMode();
  pinMode(LED_BUILTIN, OUTPUT);
  Serial.println("CAN Send & Receive Ready");
  
  // Send architecture info via CAN on startup
  sendArchitectureViaCAN();
  
  // Initialize RS485
  pinMode(SERIAL_COMMUNICATION_CONTROL_PIN, OUTPUT);
  digitalWrite(SERIAL_COMMUNICATION_CONTROL_PIN, RS485_RX_PIN_VALUE);
  
  // Initialize RS485 serial with same baud rate as RPi (9600)
  RS485Serial.begin(9600);
  
  // Alternative baud rates to try if communication is unreliable
  // RS485Serial.begin(4800);  // Try slower baud rate
  // RS485Serial.begin(19200); // Try faster baud rate
  
  Serial.println("RS485 Ready");
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
  
  // Handle RS485 communications
  handleRS485();
  
  // Send architecture via CAN every 5 seconds
  static unsigned long lastSendTime = 0;
  if (millis() - lastSendTime > 500) {
    sendArchitectureViaCAN();
    lastSendTime = millis();
  }
  
  // Send temperature and humidity data
  sendCANMessage();
  
  // Receive CAN messages
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

void handleRS485() {
  // Set to receive mode
  digitalWrite(SERIAL_COMMUNICATION_CONTROL_PIN, RS485_RX_PIN_VALUE);
 
  // Check for incoming data
  if (RS485Serial.available()) {
    // Wait a bit to ensure all data is received
    delay(50);
    
    // Read the data
    dataReceived = RS485Serial.readString();
    
    // Print received data as string
    Serial.print("RS485 Data received (string): ");
    Serial.println(dataReceived);
    
    // Also print as hex bytes for debugging
    Serial.print("RS485 Data received (hex): ");
    for (int i = 0; i < dataReceived.length(); i++) {
      uint8_t byte = (uint8_t)dataReceived[i];
      Serial.print("0x");
      if (byte < 16) Serial.print("0");
      Serial.print(byte, HEX);
      Serial.print(" ");
    }
    Serial.println();
    
    // Respond with ESP32 message - make sure we delay enough
    delay(50); // Longer delay to ensure receive complete
    
    // Switch to transmit mode
    digitalWrite(SERIAL_COMMUNICATION_CONTROL_PIN, RS485_TX_PIN_VALUE);
    delay(10); // Small delay after switching direction
    
    // Send the fixed ESP32 message
    Serial.print("RS485 Sending: ");
    Serial.println(RS485_MESSAGE);
    RS485Serial.println(RS485_MESSAGE);
    
    // Longer delay to ensure message is sent completely
    delay(50);
    
    // Switch back to receive mode
    digitalWrite(SERIAL_COMMUNICATION_CONTROL_PIN, RS485_RX_PIN_VALUE);
    
    // Update the last send time
    lastRS485SendTime = millis();
  }
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
    
    Serial.print("Raw Data: ");
    // First try to display as ASCII text if possible
    bool isASCII = true;
    for (int i = 0; i < canMsg.can_dlc; i++) {
      if (canMsg.data[i] < 32 || canMsg.data[i] > 126) {
        isASCII = false;
        break;
      }
    }
    
    if (isASCII) {
      Serial.print("\"");
      for (int i = 0; i < canMsg.can_dlc; i++) {
        Serial.print((char)canMsg.data[i]);
      }
      Serial.println("\"");
    } else {
      // Fall back to HEX display
      for (int i = 0; i < canMsg.can_dlc; i++) {
        if (canMsg.data[i] < 0x10) Serial.print("0");
        Serial.print(canMsg.data[i], HEX);
        Serial.print(" ");
      }
      Serial.println();
    }
    
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
      
      // Check if it's a numeric architecture ID and convert to full name
      if (receivedArchName.length() == 1 && receivedArchName[0] >= '0' && receivedArchName[0] <= '9') {
        uint8_t archID = receivedArchName[0] - '0';
        String fullArchName = getArchitectureName(archID);
        Serial.print("Full Architecture Name: ");
        Serial.println(fullArchName);
      }
    }
    else if (canMsg.can_id == 0x124 || canMsg.can_id == 0x125) {
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