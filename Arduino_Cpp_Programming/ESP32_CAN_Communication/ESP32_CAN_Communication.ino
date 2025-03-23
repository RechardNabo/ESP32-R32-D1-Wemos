#include <SPI.h>
#include <mcp2515.h>
#include "DHT.h"

struct can_frame canMsg;
MCP2515 mcp2515(5);
bool ledState = false;


#define DHTPIN  26 // DHT 11 PIN
#define DHTTYPE DHT11 // DHT 11 Type
DHT dht(DHTPIN, DHTTYPE);


void setup() {
  Serial.begin(9600);
  
  mcp2515.reset();
  // On ESP32, try to exactly match Raspberry Pi timing parameters
  mcp2515.setBitrate(CAN_500KBPS, MCP_8MHZ);  // Explicitly specify clock
  mcp2515.setNormalMode();
  pinMode(LED_BUILTIN, OUTPUT);
  Serial.println("CAN Send & Receive Ready");
}
String readBME280Temperature() {
    return String(dht.readTemperature());
}

String readBME280Humidity() {
   return String(dht.readHumidity());
}

void loop() {
  printSystemInfo();
  sendCANMessage("ESP32");
  receiveCANMessage();
  Serial.println("======================================");
  Serial.println("Temperature : "+String(dht.readTemperature())+" *C");
  Serial.println("Humidity    : "+String(dht.readHumidity())+" %");
  Serial.println("======================================");
  delay(500);
}

void sendCANMessage(String message) {
  canMsg.can_id = 0x123;
  canMsg.can_dlc = min((int)message.length(), 8); // Max 8 bytes per CAN frame

  for (int i = 0; i < canMsg.can_dlc; i++) {
    canMsg.data[i] = message[i];
  }

  if (mcp2515.sendMessage(&canMsg) == MCP2515::ERROR_OK) {
    Serial.print("Sent CAN Message: ");
    Serial.println(message);
  } else {
    Serial.println("Error sending message");
  }
}

void receiveCANMessage() {
  if (mcp2515.readMessage(&canMsg) == MCP2515::ERROR_OK) {
    // Print received message header with timestamp
    Serial.println("\n==== CAN MESSAGE RECEIVED ====");
    Serial.print("[");
    Serial.print(millis() / 1000.0, 2);
    Serial.println("s]");
    
    // Print CAN ID
    Serial.print("CAN ID: 0x");
    Serial.println(canMsg.can_id, HEX);
    
    // Print data length
    Serial.print("Data Length: ");
    Serial.println(canMsg.can_dlc);
    
    // Print data in multiple formats
    Serial.println("Data Representation:");
    
    // Format 1: Hexadecimal (traditional)
    Serial.print("HEX: ");
    for (int i = 0; i < canMsg.can_dlc; i++) {
      if (canMsg.data[i] < 0x10) {
        Serial.print("0");
      }
      Serial.print(canMsg.data[i], HEX);
      Serial.print(" ");
    }
    Serial.println();
    
    // Format 2: Decimal
    Serial.print("DEC: ");
    for (int i = 0; i < canMsg.can_dlc; i++) {
      Serial.print(canMsg.data[i], DEC);
      Serial.print(" ");
    }
    Serial.println();
    
    // Format 3: ASCII
    Serial.print("ASCII: ");
    for (int i = 0; i < canMsg.can_dlc; i++) {
      // Only print ASCII for printable characters
      if (canMsg.data[i] >= 32 && canMsg.data[i] <= 126) {
        Serial.print((char)canMsg.data[i]);
      } else {
        Serial.print(".");
      }
    }
    Serial.println();
    
    // Format 4: Binary (for bit-level inspection)
    Serial.print("BIN: ");
    for (int i = 0; i < canMsg.can_dlc; i++) {
      for (int b = 7; b >= 0; b--) {
        Serial.print(bitRead(canMsg.data[i], b));
      }
      Serial.print(" ");
    }
    Serial.println();
    
    // Data interpretation based on message ID
    Serial.println("\nData Interpretation:");
    
    // Example interpretations based on CAN ID
    switch (canMsg.can_id) {
      case 0x123:
        Serial.println("Message Type: Standard Test Message");
        if (canMsg.can_dlc >= 8) {
          Serial.print("Text content: ");
          for (int i = 0; i < canMsg.can_dlc; i++) {
            if (canMsg.data[i] >= 32 && canMsg.data[i] <= 126) {
              Serial.print((char)canMsg.data[i]);
            }
          }
          Serial.println();
        }
        break;
        
      case 0x100:
        Serial.println("Message Type: Sensor Data");
        if (canMsg.can_dlc >= 2) {
          int sensorValue = (canMsg.data[0] << 8) | canMsg.data[1];
          Serial.print("Sensor value: ");
          Serial.println(sensorValue);
        }
        break;
        
      case 0x200:
        Serial.println("Message Type: Status Message");
        if (canMsg.can_dlc >= 1) {
          Serial.print("Status code: ");
          Serial.println(canMsg.data[0], HEX);
        }
        break;
        
      default:
        Serial.print("Message Type: Unknown (ID: 0x");
        Serial.print(canMsg.can_id, HEX);
        Serial.println(")");
    }
    
    // Message statistics
    static unsigned long msgCount = 0;
    static unsigned long msgCountByID[8] = {0}; // Track messages by ID (up to 8 IDs)
    msgCount++;
    
    // Increment counter for this specific ID (simple hash to index)
    int idIndex = canMsg.can_id % 8;
    msgCountByID[idIndex]++;
    
    Serial.println("\nMessage Statistics:");
    Serial.print("Total messages received: ");
    Serial.println(msgCount);
    Serial.print("Messages with this ID: ");
    Serial.println(msgCountByID[idIndex]);
    
    Serial.println("============================");
  }
  toggleLED();
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