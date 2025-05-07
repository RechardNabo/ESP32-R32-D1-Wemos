/**
 * @file rtu_functions.h
 * @brief Header file for Modbus RTU communication functions
 */

#ifndef RTU_FUNCTIONS_H
#define RTU_FUNCTIONS_H

#include <Arduino.h>
#include <SoftwareSerial.h>

// Modbus settings
#define SLAVE_ID      3   // Modbus device ID

// Memory map size definitions
#define COIL_COUNT         32    // Digital outputs (read/write)
#define DISCRETE_COUNT     32    // Digital inputs (read-only)
#define HOLDING_COUNT      32    // Analog outputs (read/write)
#define INPUT_COUNT        32    // Analog inputs (read-only)

// Modbus function codes
#define FUNC_READ_COILS           0x01
#define FUNC_READ_DISCRETE        0x02
#define FUNC_READ_HOLDING         0x03
#define FUNC_READ_INPUT           0x04
#define FUNC_WRITE_COIL           0x05
#define FUNC_WRITE_HOLDING        0x06
#define FUNC_WRITE_MULTIPLE_COILS 0x0F
#define FUNC_WRITE_MULTIPLE_REGS  0x10

// Exception codes
#define EXC_ILLEGAL_FUNCTION      0x01
#define EXC_ILLEGAL_ADDRESS       0x02
#define EXC_ILLEGAL_VALUE         0x03
#define EXC_SLAVE_FAILURE         0x04

// RS485 control
#define RS485_TX_PIN_VALUE HIGH  // HIGH for transmit
#define RS485_RX_PIN_VALUE LOW   // LOW for receive

// External variables declarations
extern bool coils[COIL_COUNT];
extern bool discreteInputs[DISCRETE_COUNT];
extern uint16_t holdingRegisters[HOLDING_COUNT];
extern uint16_t inputRegisters[INPUT_COUNT];
extern SoftwareSerial RS485Serial;
#define RS485_CONTROL 25

/**
 * @brief Calculate Modbus CRC16
 * @param buffer Pointer to the data buffer
 * @param length Length of the buffer
 * @return The calculated CRC16
 */
uint16_t calculateCRC(uint8_t *buffer, int length) {
  uint16_t crc = 0xFFFF;
  
  for (int i = 0; i < length; i++) {
    crc ^= buffer[i];
    for (int j = 0; j < 8; j++) {
      if ((crc & 0x0001) != 0) {
        crc >>= 1;
        crc ^= 0xA001;
      } else {
        crc >>= 1;
      }
    }
  }
  
  return crc;
}

/**
 * @brief Send Modbus response
 * @param responseBuffer Pointer to the response buffer
 * @param responseLength Length of the response
 */
void sendModbusResponse(uint8_t *responseBuffer, uint8_t responseLength) {
  // Set to transmit mode
  digitalWrite(RS485_CONTROL, RS485_TX_PIN_VALUE);
  delay(20);  // Delay before transmission
  
  // Send response
  RS485Serial.write(responseBuffer, responseLength);
  
  // Debug
  Serial.print("Sending response: ");
  for (int i = 0; i < responseLength; i++) {
    Serial.print(responseBuffer[i], HEX);
    Serial.print(" ");
  }
  Serial.println();
  
  // Wait for transmission to complete
  RS485Serial.flush();
  delay(100);  // Delay after transmission
  
  // Back to receive mode
  digitalWrite(RS485_CONTROL, RS485_RX_PIN_VALUE);
}

/**
 * @brief Send an exception response
 * @param functionCode The function code
 * @param exceptionCode The exception code
 */
void sendExceptionResponse(uint8_t functionCode, uint8_t exceptionCode) {
  uint8_t responseBuffer[5];
  
  responseBuffer[0] = SLAVE_ID;
  responseBuffer[1] = functionCode | 0x80;  // Set MSB for exception
  responseBuffer[2] = exceptionCode;
  
  // Calculate CRC
  uint16_t crc = calculateCRC(responseBuffer, 3);
  responseBuffer[3] = crc & 0xFF;
  responseBuffer[4] = (crc >> 8) & 0xFF;
  
  // Send the exception response
  sendModbusResponse(responseBuffer, 5);
}

/**
 * @brief Handle Read Coils request (Function 0x01)
 * @param frame Pointer to the frame buffer
 * @param frameLength Length of the frame
 */
void handleReadCoils(uint8_t *frame, uint8_t frameLength) {
  // Extract starting address and quantity
  uint16_t startAddress = (frame[2] << 8) | frame[3];
  uint16_t quantity = (frame[4] << 8) | frame[5];
  
  Serial.print("Read Coils: Start=");
  Serial.print(startAddress);
  Serial.print(", Quantity=");
  Serial.println(quantity);
  
  // Check if address and quantity are valid
  if (startAddress + quantity > COIL_COUNT || quantity == 0 || quantity > 2000) {
    sendExceptionResponse(FUNC_READ_COILS, EXC_ILLEGAL_ADDRESS);
    return;
  }
  
  // Calculate response size: bytes needed to hold bits
  uint8_t byteCount = (quantity + 7) / 8;
  uint8_t responseLength = 5 + byteCount; // Slave ID (1) + Function Code (1) + Byte Count (1) + Data (byteCount) + CRC (2)
  
  // Prepare response
  uint8_t responseBuffer[responseLength];
  responseBuffer[0] = SLAVE_ID;
  responseBuffer[1] = FUNC_READ_COILS;
  responseBuffer[2] = byteCount;
  
  // Fill data bytes
  for (int i = 0; i < byteCount; i++) {
    uint8_t dataByte = 0;
    for (int j = 0; j < 8; j++) {
      int bitIndex = i * 8 + j;
      if (bitIndex < quantity) {
        if (coils[startAddress + bitIndex]) {
          dataByte |= (1 << j);
        }
      }
    }
    responseBuffer[3 + i] = dataByte;
  }
  
  // Calculate CRC
  uint16_t crc = calculateCRC(responseBuffer, 3 + byteCount);
  responseBuffer[3 + byteCount] = crc & 0xFF;
  responseBuffer[3 + byteCount + 1] = (crc >> 8) & 0xFF;
  
  // Send response
  sendModbusResponse(responseBuffer, responseLength);
}

/**
 * @brief Handle Read Discrete Inputs request (Function 0x02)
 * @param frame Pointer to the frame buffer
 * @param frameLength Length of the frame
 */
void handleReadDiscreteInputs(uint8_t *frame, uint8_t frameLength) {
  // Extract starting address and quantity
  uint16_t startAddress = (frame[2] << 8) | frame[3];
  uint16_t quantity = (frame[4] << 8) | frame[5];
  
  Serial.print("Read Discrete Inputs: Start=");
  Serial.print(startAddress);
  Serial.print(", Quantity=");
  Serial.println(quantity);
  
  // Check if address and quantity are valid
  if (startAddress + quantity > DISCRETE_COUNT || quantity == 0 || quantity > 2000) {
    sendExceptionResponse(FUNC_READ_DISCRETE, EXC_ILLEGAL_ADDRESS);
    return;
  }
  
  // Calculate response size: bytes needed to hold bits
  uint8_t byteCount = (quantity + 7) / 8;
  uint8_t responseLength = 5 + byteCount; // Slave ID (1) + Function Code (1) + Byte Count (1) + Data (byteCount) + CRC (2)
  
  // Prepare response
  uint8_t responseBuffer[responseLength];
  responseBuffer[0] = SLAVE_ID;
  responseBuffer[1] = FUNC_READ_DISCRETE;
  responseBuffer[2] = byteCount;
  
  // Fill data bytes
  for (int i = 0; i < byteCount; i++) {
    uint8_t dataByte = 0;
    for (int j = 0; j < 8; j++) {
      int bitIndex = i * 8 + j;
      if (bitIndex < quantity) {
        if (discreteInputs[startAddress + bitIndex]) {
          dataByte |= (1 << j);
        }
      }
    }
    responseBuffer[3 + i] = dataByte;
  }
  
  // Calculate CRC
  uint16_t crc = calculateCRC(responseBuffer, 3 + byteCount);
  responseBuffer[3 + byteCount] = crc & 0xFF;
  responseBuffer[3 + byteCount + 1] = (crc >> 8) & 0xFF;
  
  // Send response
  sendModbusResponse(responseBuffer, responseLength);
}

/**
 * @brief Handle Read Holding Registers request (Function 0x03)
 * @param frame Pointer to the frame buffer
 * @param frameLength Length of the frame
 */
void handleReadHoldingRegisters(uint8_t *frame, uint8_t frameLength) {
  // Extract starting address and quantity
  uint16_t startAddress = (frame[2] << 8) | frame[3];
  uint16_t quantity = (frame[4] << 8) | frame[5];
  
  Serial.print("Read Holding Registers: Start=");
  Serial.print(startAddress);
  Serial.print(", Quantity=");
  Serial.println(quantity);
  
  // Check if address and quantity are valid
  if (startAddress + quantity > HOLDING_COUNT || quantity == 0 || quantity > 125) {
    sendExceptionResponse(FUNC_READ_HOLDING, EXC_ILLEGAL_ADDRESS);
    return;
  }
  
  // Calculate response size
  uint8_t byteCount = quantity * 2; // 2 bytes per register
  uint8_t responseLength = 5 + byteCount; // Slave ID (1) + Function Code (1) + Byte Count (1) + Data (byteCount) + CRC (2)
  
  // Prepare response
  uint8_t responseBuffer[responseLength];
  responseBuffer[0] = SLAVE_ID;
  responseBuffer[1] = FUNC_READ_HOLDING;
  responseBuffer[2] = byteCount;
  
  // Fill data bytes
  for (int i = 0; i < quantity; i++) {
    uint16_t regValue = holdingRegisters[startAddress + i];
    responseBuffer[3 + i * 2] = (regValue >> 8) & 0xFF;     // High byte
    responseBuffer[3 + i * 2 + 1] = regValue & 0xFF;        // Low byte
  }
  
  // Calculate CRC
  uint16_t crc = calculateCRC(responseBuffer, 3 + byteCount);
  responseBuffer[3 + byteCount] = crc & 0xFF;
  responseBuffer[3 + byteCount + 1] = (crc >> 8) & 0xFF;
  
  // Send response
  sendModbusResponse(responseBuffer, responseLength);
}

/**
 * @brief Handle Read Input Registers request (Function 0x04)
 * @param frame Pointer to the frame buffer
 * @param frameLength Length of the frame
 */
void handleReadInputRegisters(uint8_t *frame, uint8_t frameLength) {
  // Extract starting address and quantity
  uint16_t startAddress = (frame[2] << 8) | frame[3];
  uint16_t quantity = (frame[4] << 8) | frame[5];
  
  Serial.print("Read Input Registers: Start=");
  Serial.print(startAddress);
  Serial.print(", Quantity=");
  Serial.println(quantity);
  
  // Check if address and quantity are valid
  if (startAddress + quantity > INPUT_COUNT || quantity == 0 || quantity > 125) {
    sendExceptionResponse(FUNC_READ_INPUT, EXC_ILLEGAL_ADDRESS);
    return;
  }
  
  // Calculate response size
  uint8_t byteCount = quantity * 2; // 2 bytes per register
  uint8_t responseLength = 5 + byteCount; // Slave ID (1) + Function Code (1) + Byte Count (1) + Data (byteCount) + CRC (2)
  
  // Prepare response
  uint8_t responseBuffer[responseLength];
  responseBuffer[0] = SLAVE_ID;
  responseBuffer[1] = FUNC_READ_INPUT;
  responseBuffer[2] = byteCount;
  
  // Fill data bytes
  for (int i = 0; i < quantity; i++) {
    uint16_t regValue = inputRegisters[startAddress + i];
    responseBuffer[3 + i * 2] = (regValue >> 8) & 0xFF;     // High byte
    responseBuffer[3 + i * 2 + 1] = regValue & 0xFF;        // Low byte
  }
  
  // Calculate CRC
  uint16_t crc = calculateCRC(responseBuffer, 3 + byteCount);
  responseBuffer[3 + byteCount] = crc & 0xFF;
  responseBuffer[3 + byteCount + 1] = (crc >> 8) & 0xFF;
  
  // Send response
  sendModbusResponse(responseBuffer, responseLength);
}

/**
 * @brief Handle Write Single Coil request (Function 0x05)
 * @param frame Pointer to the frame buffer
 * @param frameLength Length of the frame
 */
void handleWriteSingleCoil(uint8_t *frame, uint8_t frameLength) {
  // Extract address and value
  uint16_t address = (frame[2] << 8) | frame[3];
  uint16_t value = (frame[4] << 8) | frame[5];
  
  Serial.print("Write Single Coil: Address=");
  Serial.print(address);
  Serial.print(", Value=");
  Serial.println(value, HEX);
  
  // Check if address is valid
  if (address >= COIL_COUNT) {
    sendExceptionResponse(FUNC_WRITE_COIL, EXC_ILLEGAL_ADDRESS);
    return;
  }
  
  // Check if value is valid (only 0x0000 or 0xFF00 are valid)
  if (value != 0x0000 && value != 0xFF00) {
    sendExceptionResponse(FUNC_WRITE_COIL, EXC_ILLEGAL_VALUE);
    return;
  }
  
  // Write the value
  coils[address] = (value == 0xFF00);
  
  // Special case for address 0: control LED
  if (address == 0) {
    digitalWrite(LED_BUILTIN, coils[0] ? HIGH : LOW);
    Serial.print("LED turned ");
    Serial.println(coils[0] ? "ON" : "OFF");
  }
  
  // Echo back the request as the response (per Modbus spec)
  uint8_t responseBuffer[8];
  for (int i = 0; i < 6; i++) {
    responseBuffer[i] = frame[i];
  }
  
  // Calculate CRC
  uint16_t crc = calculateCRC(responseBuffer, 6);
  responseBuffer[6] = crc & 0xFF;
  responseBuffer[7] = (crc >> 8) & 0xFF;
  
  // Send response
  sendModbusResponse(responseBuffer, 8);
}

/**
 * @brief Handle Write Single Register request (Function 0x06)
 * @param frame Pointer to the frame buffer
 * @param frameLength Length of the frame
 */
void handleWriteSingleRegister(uint8_t *frame, uint8_t frameLength) {
  // Extract address and value
  uint16_t address = (frame[2] << 8) | frame[3];
  uint16_t value = (frame[4] << 8) | frame[5];
  
  Serial.print("Write Single Register: Address=");
  Serial.print(address);
  Serial.print(", Value=");
  Serial.println(value);
  
  // Check if address is valid
  if (address >= HOLDING_COUNT) {
    sendExceptionResponse(FUNC_WRITE_HOLDING, EXC_ILLEGAL_ADDRESS);
    return;
  }
  
  // Write the value
  holdingRegisters[address] = value;
  
  // Echo back the request as the response (per Modbus spec)
  uint8_t responseBuffer[8];
  for (int i = 0; i < 6; i++) {
    responseBuffer[i] = frame[i];
  }
  
  // Calculate CRC
  uint16_t crc = calculateCRC(responseBuffer, 6);
  responseBuffer[6] = crc & 0xFF;
  responseBuffer[7] = (crc >> 8) & 0xFF;
  
  // Send response
  sendModbusResponse(responseBuffer, 8);
}

/**
 * @brief Handle Write Multiple Coils request (Function 0x0F)
 * @param frame Pointer to the frame buffer
 * @param frameLength Length of the frame
 */
void handleWriteMultipleCoils(uint8_t *frame, uint8_t frameLength) {
  // Extract address and quantity
  uint16_t startAddress = (frame[2] << 8) | frame[3];
  uint16_t quantity = (frame[4] << 8) | frame[5];
  uint8_t byteCount = frame[6];
  
  Serial.print("Write Multiple Coils: Start=");
  Serial.print(startAddress);
  Serial.print(", Quantity=");
  Serial.println(quantity);
  
  // Check if address and quantity are valid
  if (startAddress + quantity > COIL_COUNT || quantity == 0 || quantity > 1968) {
    sendExceptionResponse(FUNC_WRITE_MULTIPLE_COILS, EXC_ILLEGAL_ADDRESS);
    return;
  }
  
  // Check if byte count is valid
  if (byteCount != (quantity + 7) / 8) {
    sendExceptionResponse(FUNC_WRITE_MULTIPLE_COILS, EXC_ILLEGAL_VALUE);
    return;
  }
  
  // Write coils
  for (int i = 0; i < quantity; i++) {
    int byteIndex = 7 + i / 8;
    int bitIndex = i % 8;
    coils[startAddress + i] = (frame[byteIndex] >> bitIndex) & 0x01;
  }
  
  // Special case for coil 0: control LED
  if (startAddress == 0 || (startAddress < 1 && startAddress + quantity > 0)) {
    digitalWrite(LED_BUILTIN, coils[0] ? HIGH : LOW);
    Serial.print("LED turned ");
    Serial.println(coils[0] ? "ON" : "OFF");
  }
  
  // Prepare response
  uint8_t responseBuffer[8];
  responseBuffer[0] = SLAVE_ID;
  responseBuffer[1] = FUNC_WRITE_MULTIPLE_COILS;
  responseBuffer[2] = (startAddress >> 8) & 0xFF;
  responseBuffer[3] = startAddress & 0xFF;
  responseBuffer[4] = (quantity >> 8) & 0xFF;
  responseBuffer[5] = quantity & 0xFF;
  
  // Calculate CRC
  uint16_t crc = calculateCRC(responseBuffer, 6);
  responseBuffer[6] = crc & 0xFF;
  responseBuffer[7] = (crc >> 8) & 0xFF;
  
  // Send response
  sendModbusResponse(responseBuffer, 8);
}

/**
 * @brief Handle Write Multiple Registers request (Function 0x10)
 * @param frame Pointer to the frame buffer
 * @param frameLength Length of the frame
 */
void handleWriteMultipleRegisters(uint8_t *frame, uint8_t frameLength) {
  // Extract address and quantity
  uint16_t startAddress = (frame[2] << 8) | frame[3];
  uint16_t quantity = (frame[4] << 8) | frame[5];
  uint8_t byteCount = frame[6];
  
  Serial.print("Write Multiple Registers: Start=");
  Serial.print(startAddress);
  Serial.print(", Quantity=");
  Serial.println(quantity);
  
  // Check if address and quantity are valid
  if (startAddress + quantity > HOLDING_COUNT || quantity == 0 || quantity > 123) {
    sendExceptionResponse(FUNC_WRITE_MULTIPLE_REGS, EXC_ILLEGAL_ADDRESS);
    return;
  }
  
  // Check if byte count is valid
  if (byteCount != quantity * 2) {
    sendExceptionResponse(FUNC_WRITE_MULTIPLE_REGS, EXC_ILLEGAL_VALUE);
    return;
  }
  
  // Write registers
  for (int i = 0; i < quantity; i++) {
    uint16_t value = (frame[7 + i * 2] << 8) | frame[7 + i * 2 + 1];
    holdingRegisters[startAddress + i] = value;
  }
  
  // Prepare response
  uint8_t responseBuffer[8];
  responseBuffer[0] = SLAVE_ID;
  responseBuffer[1] = FUNC_WRITE_MULTIPLE_REGS;
  responseBuffer[2] = (startAddress >> 8) & 0xFF;
  responseBuffer[3] = startAddress & 0xFF;
  responseBuffer[4] = (quantity >> 8) & 0xFF;
  responseBuffer[5] = quantity & 0xFF;
  
  // Calculate CRC
  uint16_t crc = calculateCRC(responseBuffer, 6);
  responseBuffer[6] = crc & 0xFF;
  responseBuffer[7] = (crc >> 8) & 0xFF;
  
  // Send response
  sendModbusResponse(responseBuffer, 8);
}

/**
 * @brief Process incoming Modbus frame
 * @param frame Pointer to the frame buffer
 * @param frameLength Length of the frame
 */
void processModbusFrame(uint8_t *frame, uint8_t frameLength) {
  // Verify frame has minimum length
  if (frameLength < 8) {
    Serial.println("Frame too short");
    return;
  }
  
  // Check if addressed to us
  if (frame[0] != SLAVE_ID) {
    Serial.println("Not addressed to us");
    return;
  }
  
  // Verify CRC
  uint16_t receivedCRC = (frame[frameLength-1] << 8) | frame[frameLength-2];
  uint16_t calculatedCRC = calculateCRC(frame, frameLength-2);
  
  if (receivedCRC != calculatedCRC) {
    Serial.println("CRC mismatch");
    Serial.print("Received: 0x");
    Serial.print(receivedCRC, HEX);
    Serial.print(", Calculated: 0x");
    Serial.println(calculatedCRC, HEX);
    return;
  }
  
  // Process based on function code
  uint8_t functionCode = frame[1];
  
  switch (functionCode) {
    case FUNC_READ_COILS:
      handleReadCoils(frame, frameLength);
      break;
    
    case FUNC_READ_DISCRETE:
      handleReadDiscreteInputs(frame, frameLength);
      break;
    
    case FUNC_READ_HOLDING:
      handleReadHoldingRegisters(frame, frameLength);
      break;
    
    case FUNC_READ_INPUT:
      handleReadInputRegisters(frame, frameLength);
      break;
    
    case FUNC_WRITE_COIL:
      handleWriteSingleCoil(frame, frameLength);
      break;
    
    case FUNC_WRITE_HOLDING:
      handleWriteSingleRegister(frame, frameLength);
      break;
    
    case FUNC_WRITE_MULTIPLE_COILS:
      handleWriteMultipleCoils(frame, frameLength);
      break;
    
    case FUNC_WRITE_MULTIPLE_REGS:
      handleWriteMultipleRegisters(frame, frameLength);
      break;
    
    default:
      // Unsupported function code
      sendExceptionResponse(functionCode, EXC_ILLEGAL_FUNCTION);
      break;
  }
}

/**
 * @brief Initialize dummy data for simulation
 */
void initializeDummyData() {
  // Initialize coils (all off except coil 0 controls the LED)
  for (int i = 0; i < COIL_COUNT; i++) {
    coils[i] = false;
  }
  
  // Initialize discrete inputs with alternating pattern
  for (int i = 0; i < DISCRETE_COUNT; i++) {
    discreteInputs[i] = (i % 2 == 0);
  }
  
  // Initialize holding registers with sequential values
  for (int i = 0; i < HOLDING_COUNT; i++) {
    holdingRegisters[i] = 1000 + i;
  }
  
  // Initialize input registers with analog-like values
  for (int i = 0; i < INPUT_COUNT; i++) {
    inputRegisters[i] = 2000 + (i * 100);
  }
  
  // Special registers for temperature and humidity will be updated in updateSensorData()
}

/**
 * @brief Update dummy data periodically to simulate changing inputs
 */
void updateDummyData() {
  static unsigned long lastUpdate = 0;
  static int counter = 0;
  
  // Update every 5 seconds
  if (millis() - lastUpdate > 5000) {
    lastUpdate = millis();
    counter++;
    
    // Toggle some discrete inputs
    discreteInputs[0] = !discreteInputs[0];  // Toggle first discrete input
    discreteInputs[5] = !discreteInputs[5];  // Toggle 6th discrete input
    
    // Update some input registers (except for 0 and 1 which are used for real temperature and humidity)
    inputRegisters[2] = 2000 + (50 * sin(counter * 0.1)); // Sine wave simulation
    inputRegisters[3] = 2000 + counter % 100;            // Counter
    inputRegisters[4] = millis() / 1000;                 // Time in seconds
  }
}

#endif /* RTU_FUNCTIONS_H */