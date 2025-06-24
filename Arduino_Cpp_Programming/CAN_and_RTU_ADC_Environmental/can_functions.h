/**
 * @file can_functions.h
 * @brief Header file for CAN bus communication functions
 */

#ifndef CAN_FUNCTIONS_H
#define CAN_FUNCTIONS_H

#include <Arduino.h>
#include <SPI.h>
#include <mcp2515.h>
#include "DHT.h"

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

// CAN Message IDs for resistor measurements
#define CAN_ID_VOLTAGE 0x126
#define CAN_ID_CURRENT 0x127
#define CAN_ID_POWER   0x128

// External variables declarations
extern struct can_frame canMsg;
extern MCP2515 mcp2515;
extern bool ledState;
extern DHT dht;

// External variables for resistor measurements
extern float voltage1;
extern float voltage2;
extern float voltage3;
extern float current;
extern float power1;
extern float power2;
extern float power3;

/**
 * @brief Get the architecture ID of the current microcontroller
 * @return The architecture ID as an enum value
 */
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

/**
 * @brief Convert architecture ID to its name
 * @param archID The architecture ID
 * @return The architecture name as a String
 */
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

/**
 * @brief Read DHT temperature
 * @return Temperature value or -1.0 if read fails
 */
float readDHTTemperature() {
  float temp = dht.readTemperature();
  if (isnan(temp)) {
    Serial.println("Failed to read temperature from DHT sensor!");
    return -1.0;
  }
  return temp;
}

/**
 * @brief Read DHT humidity
 * @return Humidity value or -1.0 if read fails
 */
float readDHTHumidity() {
  float humid = dht.readHumidity();
  if (isnan(humid)) {
    Serial.println("Failed to read humidity from DHT sensor!");
    return -1.0;
  }
  return humid;
}

/**
 * @brief Toggle LED state
 */
void toggleLED() {
  ledState = !ledState;
  digitalWrite(LED_BUILTIN, ledState);
}

/**
 * @brief Send temperature and humidity data via CAN
 */
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

/**
 * @brief Send voltages for all three resistors via CAN
 */
void sendVoltageViaCAN() {
  canMsg.can_id = CAN_ID_VOLTAGE;
  canMsg.can_dlc = 8;
  
  // Convert voltage values to byte representation
  uint32_t voltage1Bits;
  memcpy(&voltage1Bits, &voltage1, sizeof(voltage1));
  
  uint32_t voltage2Bits;
  memcpy(&voltage2Bits, &voltage2, sizeof(voltage2));
  
  // For voltage3, we only have 8 bytes total in the CAN frame
  // We'll use a 16-bit representation (voltage * 1000 as a uint16_t)
  uint16_t voltage3Short = (uint16_t)(voltage3 * 1000.0);
  
  // Pack the data into the CAN frame
  canMsg.data[0] = (voltage1Bits >> 16) & 0xFF; // voltage1 high byte
  canMsg.data[1] = (voltage1Bits >> 8) & 0xFF;  // voltage1 middle byte
  canMsg.data[2] = voltage1Bits & 0xFF;         // voltage1 low byte
  
  canMsg.data[3] = (voltage2Bits >> 16) & 0xFF; // voltage2 high byte
  canMsg.data[4] = (voltage2Bits >> 8) & 0xFF;  // voltage2 middle byte
  canMsg.data[5] = voltage2Bits & 0xFF;         // voltage2 low byte
  
  canMsg.data[6] = (voltage3Short >> 8) & 0xFF; // voltage3 high byte
  canMsg.data[7] = voltage3Short & 0xFF;        // voltage3 low byte
  
  if (mcp2515.sendMessage(&canMsg) == MCP2515::ERROR_OK) {
    Serial.println("Sent CAN Message - Voltages:");
    Serial.print("R1: ");
    Serial.print(voltage1, 3);
    Serial.print("V, R2: ");
    Serial.print(voltage2, 3);
    Serial.print("V, R3: ");
    Serial.print(voltage3, 3);
    Serial.println("V");
  } else {
    Serial.println("Error sending voltage message");
  }
}

/**
 * @brief Send current data via CAN
 */
void sendCurrentViaCAN() {
  canMsg.can_id = CAN_ID_CURRENT;
  canMsg.can_dlc = 4;  // We only need 4 bytes for a single float
  
  // Convert current value to byte representation
  uint32_t currentBits;
  memcpy(&currentBits, &current, sizeof(current));
  
  // Pack the data into the CAN frame
  canMsg.data[0] = (currentBits >> 24) & 0xFF;
  canMsg.data[1] = (currentBits >> 16) & 0xFF;
  canMsg.data[2] = (currentBits >> 8) & 0xFF;
  canMsg.data[3] = currentBits & 0xFF;
  
  if (mcp2515.sendMessage(&canMsg) == MCP2515::ERROR_OK) {
    Serial.print("Sent CAN Message - Current: ");
    Serial.print(current * 1000.0, 3);  // Display in mA
    Serial.println(" mA");
  } else {
    Serial.println("Error sending current message");
  }
}

/**
 * @brief Send power data for all three resistors via CAN
 */
void sendPowerViaCAN() {
  canMsg.can_id = CAN_ID_POWER;
  canMsg.can_dlc = 8;
  
  // Since power values are small (milliwatts range),
  // we'll use 16-bit integers (power * 1000) to save space
  uint16_t power1Short = (uint16_t)(power1 * 1000.0);
  uint16_t power2Short = (uint16_t)(power2 * 1000.0);
  uint16_t power3Short = (uint16_t)(power3 * 1000.0);
  
  // Pack the data into the CAN frame
  canMsg.data[0] = (power1Short >> 8) & 0xFF;
  canMsg.data[1] = power1Short & 0xFF;
  
  canMsg.data[2] = (power2Short >> 8) & 0xFF;
  canMsg.data[3] = power2Short & 0xFF;
  
  canMsg.data[4] = (power3Short >> 8) & 0xFF;
  canMsg.data[5] = power3Short & 0xFF;
  
  // We have 2 more bytes available, could use for total power
  uint16_t totalPowerShort = (uint16_t)((power1 + power2 + power3) * 1000.0);
  canMsg.data[6] = (totalPowerShort >> 8) & 0xFF;
  canMsg.data[7] = totalPowerShort & 0xFF;
  
  if (mcp2515.sendMessage(&canMsg) == MCP2515::ERROR_OK) {
    Serial.println("Sent CAN Message - Power:");
    Serial.print("R1: ");
    Serial.print(power1 * 1000.0, 3);
    Serial.print("mW, R2: ");
    Serial.print(power2 * 1000.0, 3);
    Serial.print("mW, R3: ");
    Serial.print(power3 * 1000.0, 3);
    Serial.println("mW");
  } else {
    Serial.println("Error sending power message");
  }
}

/**
 * @brief Process received CAN messages
 */
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
    else if (canMsg.can_id == CAN_ID_VOLTAGE) {
      // Voltage message
      // Decode the first two voltages as 24-bit representations (3 bytes each)
      uint32_t voltage1Bits = ((uint32_t)canMsg.data[0] << 16) |
                             ((uint32_t)canMsg.data[1] << 8) |
                             canMsg.data[2];
      uint32_t voltage2Bits = ((uint32_t)canMsg.data[3] << 16) |
                             ((uint32_t)canMsg.data[4] << 8) |
                             canMsg.data[5];
      
      // Decode the third voltage as a 16-bit representation (scaled by 1000)
      uint16_t voltage3Short = ((uint16_t)canMsg.data[6] << 8) |
                              canMsg.data[7];
      float receivedVoltage3 = voltage3Short / 1000.0;
      
      // Convert 24-bit readings back to float
      // Note: This is a simplified approach and may need adjustment
      float receivedVoltage1 = voltage1Bits / 65536.0;
      float receivedVoltage2 = voltage2Bits / 65536.0;
      
      Serial.println("\nData Interpretation:");
      Serial.println("Message Type: Voltage Data");
      Serial.print("Voltage R1: ");
      Serial.print(receivedVoltage1, 3);
      Serial.println(" V");
      Serial.print("Voltage R2: ");
      Serial.print(receivedVoltage2, 3);
      Serial.println(" V");
      Serial.print("Voltage R3: ");
      Serial.print(receivedVoltage3, 3);
      Serial.println(" V");
    }
    else if (canMsg.can_id == CAN_ID_CURRENT) {
      // Current message
      uint32_t currentBits = ((uint32_t)canMsg.data[0] << 24) |
                           ((uint32_t)canMsg.data[1] << 16) |
                           ((uint32_t)canMsg.data[2] << 8) |
                           canMsg.data[3];
      
      float receivedCurrent;
      memcpy(&receivedCurrent, &currentBits, sizeof(float));
      
      Serial.println("\nData Interpretation:");
      Serial.println("Message Type: Current Data");
      Serial.print("Current: ");
      Serial.print(receivedCurrent * 1000.0, 3);
      Serial.println(" mA");
    }
    else if (canMsg.can_id == CAN_ID_POWER) {
      // Power message (16-bit integers scaled by 1000)
      uint16_t power1Short = ((uint16_t)canMsg.data[0] << 8) | canMsg.data[1];
      uint16_t power2Short = ((uint16_t)canMsg.data[2] << 8) | canMsg.data[3];
      uint16_t power3Short = ((uint16_t)canMsg.data[4] << 8) | canMsg.data[5];
      uint16_t totalPowerShort = ((uint16_t)canMsg.data[6] << 8) | canMsg.data[7];
      
      float receivedPower1 = power1Short / 1000.0;
      float receivedPower2 = power2Short / 1000.0;
      float receivedPower3 = power3Short / 1000.0;
      float receivedTotalPower = totalPowerShort / 1000.0;
      
      Serial.println("\nData Interpretation:");
      Serial.println("Message Type: Power Data");
      Serial.print("Power R1: ");
      Serial.print(receivedPower1 * 1000.0, 3);
      Serial.println(" mW");
      Serial.print("Power R2: ");
      Serial.print(receivedPower2 * 1000.0, 3);
      Serial.println(" mW");
      Serial.print("Power R3: ");
      Serial.print(receivedPower3 * 1000.0, 3);
      Serial.println(" mW");
      Serial.print("Total Power: ");
      Serial.print(receivedTotalPower * 1000.0, 3);
      Serial.println(" mW");
    }
    
    toggleLED();
  }
}

/**
 * @brief Send architecture information via CAN
 */
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

#endif /* CAN_FUNCTIONS_H */