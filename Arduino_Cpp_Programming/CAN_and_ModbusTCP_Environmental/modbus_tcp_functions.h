/**
 * @file modbus_tcp_functions.h
 * @brief Header file for Modbus TCP communication functions
 */

#ifndef MODBUS_TCP_FUNCTIONS_H
#define MODBUS_TCP_FUNCTIONS_H

#include <Arduino.h>
#include <WiFi.h>

// Modbus settings
#define SLAVE_ID      3   // Modbus Unit ID

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

// External variables declarations
extern bool coils[COIL_COUNT];
extern bool discreteInputs[DISCRETE_COUNT];
extern uint16_t holdingRegisters[HOLDING_COUNT];
extern uint16_t inputRegisters[INPUT_COUNT];
extern WiFiServer modbusServer;
extern WiFiClient modbusClient;

/**
 * @brief Send Modbus TCP response
 * @param client WiFiClient to send the response to
 * @param pdu Pointer to the PDU (Protocol Data Unit)
 * @param pduLength Length of the PDU
 * @param transactionId Transaction ID from the request
 */
void sendModbusTCPResponse(WiFiClient client, uint8_t *pdu, uint8_t pduLength, uint16_t transactionId) {
  // Calculate total message length (PDU + MBAP header)
  uint16_t length = pduLength + 1; // +1 for Unit ID
  
  // Create response buffer
  uint8_t responseBuffer[pduLength + 7]; // 7 bytes for MBAP header
  
  // Fill MBAP header
  responseBuffer[0] = (transactionId >> 8) & 0xFF; // Transaction ID high byte
  responseBuffer[1] = transactionId & 0xFF;        // Transaction ID low byte
  responseBuffer[2] = 0x00;                        // Protocol ID high byte
  responseBuffer[3] = 0x00;                        // Protocol ID low byte
  responseBuffer[4] = (length >> 8) & 0xFF;        // Length high byte
  responseBuffer[5] = length & 0xFF;               // Length low byte
  responseBuffer[6] = SLAVE_ID;                    // Unit ID
  
  // Copy PDU data
  for (int i = 0; i < pduLength; i++) {
    responseBuffer[i + 7] = pdu[i];
  }
  
  // Send response
  client.write(responseBuffer, pduLength + 7);
  
  // Debug
  Serial.print("Sending TCP response: ");
  for (int i = 0; i < pduLength + 7; i++) {
    if (responseBuffer[i] < 0x10) Serial.print("0");
    Serial.print(responseBuffer[i], HEX);
    Serial.print(" ");
  }
  Serial.println();
}

/**
 * @brief Send an exception response
 * @param client WiFiClient to send the response to
 * @param functionCode Function code that caused the exception
 * @param exceptionCode Exception code to send
 * @param transactionId Transaction ID from the request
 */
void sendExceptionResponse(WiFiClient client, uint8_t functionCode, uint8_t exceptionCode, uint16_t transactionId) {
  uint8_t responseBuffer[2];
  
  responseBuffer[0] = functionCode | 0x80;  // Set MSB for exception
  responseBuffer[1] = exceptionCode;
  
  // Send the exception response
  sendModbusTCPResponse(client, responseBuffer, 2, transactionId);
}

/**
 * @brief Handle Read Coils request (Function 0x01)
 * @param client WiFiClient to send the response to
 * @param frame Pointer to the frame buffer (after function code)
 * @param transactionId Transaction ID from the request
 */
void handleReadCoils(WiFiClient client, uint8_t *frame, uint16_t transactionId) {
  // Extract starting address and quantity
  uint16_t startAddress = (frame[0] << 8) | frame[1];
  uint16_t quantity = (frame[2] << 8) | frame[3];
  
  Serial.print("Read Coils: Start=");
  Serial.print(startAddress);
  Serial.print(", Quantity=");
  Serial.println(quantity);
  
  // Check if address and quantity are valid
  if (startAddress + quantity > COIL_COUNT || quantity == 0 || quantity > 2000) {
    sendExceptionResponse(client, FUNC_READ_COILS, EXC_ILLEGAL_ADDRESS, transactionId);
    return;
  }
  
  // Calculate response size: bytes needed to hold bits
  uint8_t byteCount = (quantity + 7) / 8;
  uint8_t responseLength = 2 + byteCount; // Function Code (1) + Byte Count (1) + Data (byteCount)
  
  // Prepare response
  uint8_t responseBuffer[responseLength];
  responseBuffer[0] = FUNC_READ_COILS;
  responseBuffer[1] = byteCount;
  
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
    responseBuffer[2 + i] = dataByte;
  }
  
  // Send response
  sendModbusTCPResponse(client, responseBuffer, responseLength, transactionId);
}

/**
 * @brief Handle Read Discrete Inputs request (Function 0x02)
 * @param client WiFiClient to send the response to
 * @param frame Pointer to the frame buffer (after function code)
 * @param transactionId Transaction ID from the request
 */
void handleReadDiscreteInputs(WiFiClient client, uint8_t *frame, uint16_t transactionId) {
  // Extract starting address and quantity
  uint16_t startAddress = (frame[0] << 8) | frame[1];
  uint16_t quantity = (frame[2] << 8) | frame[3];
  
  Serial.print("Read Discrete Inputs: Start=");
  Serial.print(startAddress);
  Serial.print(", Quantity=");
  Serial.println(quantity);
  
  // Check if address and quantity are valid
  if (startAddress + quantity > DISCRETE_COUNT || quantity == 0 || quantity > 2000) {
    sendExceptionResponse(client, FUNC_READ_DISCRETE, EXC_ILLEGAL_ADDRESS, transactionId);
    return;
  }
  
  // Calculate response size: bytes needed to hold bits
  uint8_t byteCount = (quantity + 7) / 8;
  uint8_t responseLength = 2 + byteCount; // Function Code (1) + Byte Count (1) + Data (byteCount)
  
  // Prepare response
  uint8_t responseBuffer[responseLength];
  responseBuffer[0] = FUNC_READ_DISCRETE;
  responseBuffer[1] = byteCount;
  
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
    responseBuffer[2 + i] = dataByte;
  }
  
  // Send response
  sendModbusTCPResponse(client, responseBuffer, responseLength, transactionId);
}

/**
 * @brief Handle Read Holding Registers request (Function 0x03)
 * @param client WiFiClient to send the response to
 * @param frame Pointer to the frame buffer (after function code)
 * @param transactionId Transaction ID from the request
 */
void handleReadHoldingRegisters(WiFiClient client, uint8_t *frame, uint16_t transactionId) {
  // Extract starting address and quantity
  uint16_t startAddress = (frame[0] << 8) | frame[1];
  uint16_t quantity = (frame[2] << 8) | frame[3];
  
  Serial.print("Read Holding Registers: Start=");
  Serial.print(startAddress);
  Serial.print(", Quantity=");
  Serial.println(quantity);
  
  // Check if address and quantity are valid
  if (startAddress + quantity > HOLDING_COUNT || quantity == 0 || quantity > 125) {
    sendExceptionResponse(client, FUNC_READ_HOLDING, EXC_ILLEGAL_ADDRESS, transactionId);
    return;
  }
  
  // Calculate response size
  uint8_t byteCount = quantity * 2; // 2 bytes per register
  uint8_t responseLength = 2 + byteCount; // Function Code (1) + Byte Count (1) + Data (byteCount)
  
  // Prepare response
  uint8_t responseBuffer[responseLength];
  responseBuffer[0] = FUNC_READ_HOLDING;
  responseBuffer[1] = byteCount;
  
  // Fill data bytes
  for (int i = 0; i < quantity; i++) {
    uint16_t regValue = holdingRegisters[startAddress + i];
    responseBuffer[2 + i * 2] = (regValue >> 8) & 0xFF;     // High byte
    responseBuffer[2 + i * 2 + 1] = regValue & 0xFF;        // Low byte
  }
  
  // Send response
  sendModbusTCPResponse(client, responseBuffer, responseLength, transactionId);
}

/**
 * @brief Handle Read Input Registers request (Function 0x04)
 * @param client WiFiClient to send the response to
 * @param frame Pointer to the frame buffer (after function code)
 * @param transactionId Transaction ID from the request
 */
void handleReadInputRegisters(WiFiClient client, uint8_t *frame, uint16_t transactionId) {
  // Extract starting address and quantity
  uint16_t startAddress = (frame[0] << 8) | frame[1];
  uint16_t quantity = (frame[2] << 8) | frame[3];
  
  Serial.print("Read Input Registers: Start=");
  Serial.print(startAddress);
  Serial.print(", Quantity=");
  Serial.println(quantity);
  
  // Check if address and quantity are valid
  if (startAddress + quantity > INPUT_COUNT || quantity == 0 || quantity > 125) {
    sendExceptionResponse(client, FUNC_READ_INPUT, EXC_ILLEGAL_ADDRESS, transactionId);
    return;
  }
  
  // Calculate response size
  uint8_t byteCount = quantity * 2; // 2 bytes per register
  uint8_t responseLength = 2 + byteCount; // Function Code (1) + Byte Count (1) + Data (byteCount)
  
  // Prepare response
  uint8_t responseBuffer[responseLength];
  responseBuffer[0] = FUNC_READ_INPUT;
  responseBuffer[1] = byteCount;
  
  // Fill data bytes
  for (int i = 0; i < quantity; i++) {
    uint16_t regValue = inputRegisters[startAddress + i];
    responseBuffer[2 + i * 2] = (regValue >> 8) & 0xFF;     // High byte
    responseBuffer[2 + i * 2 + 1] = regValue & 0xFF;        // Low byte
  }
  
  // Send response
  sendModbusTCPResponse(client, responseBuffer, responseLength, transactionId);
}

/**
 * @brief Handle Write Single Coil request (Function 0x05)
 * @param client WiFiClient to send the response to
 * @param frame Pointer to the frame buffer (after function code)
 * @param transactionId Transaction ID from the request
 */
void handleWriteSingleCoil(WiFiClient client, uint8_t *frame, uint16_t transactionId) {
  // Extract address and value
  uint16_t address = (frame[0] << 8) | frame[1];
  uint16_t value = (frame[2] << 8) | frame[3];
  
  Serial.print("Write Single Coil: Address=");
  Serial.print(address);
  Serial.print(", Value=");
  Serial.println(value, HEX);
  
  // Check if address is valid
  if (address >= COIL_COUNT) {
    sendExceptionResponse(client, FUNC_WRITE_COIL, EXC_ILLEGAL_ADDRESS, transactionId);
    return;
  }
  
  // Check if value is valid (only 0x0000 or 0xFF00 are valid)
  if (value != 0x0000 && value != 0xFF00) {
    sendExceptionResponse(client, FUNC_WRITE_COIL, EXC_ILLEGAL_VALUE, transactionId);
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
  
  // Prepare response - echo back the request as the response (per Modbus spec)
  uint8_t responseBuffer[5];
  responseBuffer[0] = FUNC_WRITE_COIL;
  responseBuffer[1] = frame[0]; // Address high byte
  responseBuffer[2] = frame[1]; // Address low byte
  responseBuffer[3] = frame[2]; // Value high byte
  responseBuffer[4] = frame[3]; // Value low byte
  
  // Send response
  sendModbusTCPResponse(client, responseBuffer, 5, transactionId);
}

/**
 * @brief Handle Write Single Register request (Function 0x06)
 * @param client WiFiClient to send the response to
 * @param frame Pointer to the frame buffer (after function code)
 * @param transactionId Transaction ID from the request
 */
void handleWriteSingleRegister(WiFiClient client, uint8_t *frame, uint16_t transactionId) {
  // Extract address and value
  uint16_t address = (frame[0] << 8) | frame[1];
  uint16_t value = (frame[2] << 8) | frame[3];
  
  Serial.print("Write Single Register: Address=");
  Serial.print(address);
  Serial.print(", Value=");
  Serial.println(value);
  
  // Check if address is valid
  if (address >= HOLDING_COUNT) {
    sendExceptionResponse(client, FUNC_WRITE_HOLDING, EXC_ILLEGAL_ADDRESS, transactionId);
    return;
  }
  
  // Write the value
  holdingRegisters[address] = value;
  
  // Echo back the request as the response (per Modbus spec)
  uint8_t responseBuffer[5];
  responseBuffer[0] = FUNC_WRITE_HOLDING;
  responseBuffer[1] = frame[0]; // Address high byte
  responseBuffer[2] = frame[1]; // Address low byte
  responseBuffer[3] = frame[2]; // Value high byte
  responseBuffer[4] = frame[3]; // Value low byte
  
  // Send response
  sendModbusTCPResponse(client, responseBuffer, 5, transactionId);
}

/**
 * @brief Handle Write Multiple Coils request (Function 0x0F)
 * @param client WiFiClient to send the response to
 * @param frame Pointer to the frame buffer (after function code)
 * @param transactionId Transaction ID from the request
 */
void handleWriteMultipleCoils(WiFiClient client, uint8_t *frame, uint16_t transactionId) {
  // Extract address and quantity
  uint16_t startAddress = (frame[0] << 8) | frame[1];
  uint16_t quantity = (frame[2] << 8) | frame[3];
  uint8_t byteCount = frame[4];
  
  Serial.print("Write Multiple Coils: Start=");
  Serial.print(startAddress);
  Serial.print(", Quantity=");
  Serial.println(quantity);
  
  // Check if address and quantity are valid
  if (startAddress + quantity > COIL_COUNT || quantity == 0 || quantity > 1968) {
    sendExceptionResponse(client, FUNC_WRITE_MULTIPLE_COILS, EXC_ILLEGAL_ADDRESS, transactionId);
    return;
  }
  
  // Check if byte count is valid
  if (byteCount != (quantity + 7) / 8) {
    sendExceptionResponse(client, FUNC_WRITE_MULTIPLE_COILS, EXC_ILLEGAL_VALUE, transactionId);
    return;
  }
  
  // Write coils
  for (int i = 0; i < quantity; i++) {
    int byteIndex = 5 + i / 8;
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
  uint8_t responseBuffer[5];
  responseBuffer[0] = FUNC_WRITE_MULTIPLE_COILS;
  responseBuffer[1] = (startAddress >> 8) & 0xFF;
  responseBuffer[2] = startAddress & 0xFF;
  responseBuffer[3] = (quantity >> 8) & 0xFF;
  responseBuffer[4] = quantity & 0xFF;
  
  // Send response
  sendModbusTCPResponse(client, responseBuffer, 5, transactionId);
}

/**
 * @brief Handle Write Multiple Registers request (Function 0x10)
 * @param client WiFiClient to send the response to
 * @param frame Pointer to the frame buffer (after function code)
 * @param transactionId Transaction ID from the request
 */
void handleWriteMultipleRegisters(WiFiClient client, uint8_t *frame, uint16_t transactionId) {
  // Extract address and quantity
  uint16_t startAddress = (frame[0] << 8) | frame[1];
  uint16_t quantity = (frame[2] << 8) | frame[3];
  uint8_t byteCount = frame[4];
  
  Serial.print("Write Multiple Registers: Start=");
  Serial.print(startAddress);
  Serial.print(", Quantity=");
  Serial.println(quantity);
  
  // Check if address and quantity are valid
  if (startAddress + quantity > HOLDING_COUNT || quantity == 0 || quantity > 123) {
    sendExceptionResponse(client, FUNC_WRITE_MULTIPLE_REGS, EXC_ILLEGAL_ADDRESS, transactionId);
    return;
  }
  
  // Check if byte count is valid
  if (byteCount != quantity * 2) {
    sendExceptionResponse(client, FUNC_WRITE_MULTIPLE_REGS, EXC_ILLEGAL_VALUE, transactionId);
    return;
  }
  
  // Write registers
  for (int i = 0; i < quantity; i++) {
    uint16_t value = (frame[5 + i * 2] << 8) | frame[5 + i * 2 + 1];
    holdingRegisters[startAddress + i] = value;
  }
  
  // Prepare response
  uint8_t responseBuffer[5];
  responseBuffer[0] = FUNC_WRITE_MULTIPLE_REGS;
  responseBuffer[1] = (startAddress >> 8) & 0xFF;
  responseBuffer[2] = startAddress & 0xFF;
  responseBuffer[3] = (quantity >> 8) & 0xFF;
  responseBuffer[4] = quantity & 0xFF;
  
  // Send response
  sendModbusTCPResponse(client, responseBuffer, 5, transactionId);
}

/**
 * @brief Process incoming Modbus TCP frame
 * @param client WiFiClient to send the response to
 * @param mbap Pointer to the MBAP header
 * @param pdu Pointer to the PDU
 * @param pduLength Length of the PDU
 */
void processModbusTCPFrame(WiFiClient client, uint8_t *mbap, uint8_t *pdu, uint8_t pduLength) {
  // Extract transaction ID
  uint16_t transactionId = (mbap[0] << 8) | mbap[1];
  
  // Extract Unit ID (slave ID)
  uint8_t unitId = mbap[6];
  
  // Check if this message is for us
  if (unitId != SLAVE_ID && unitId != 0) {
    Serial.println("Not addressed to us");
    return;
  }
  
  // Process based on function code
  uint8_t functionCode = pdu[0];
  
  Serial.print("Processing function code: 0x");
  Serial.println(functionCode, HEX);
  
  switch (functionCode) {
    case FUNC_READ_COILS:
      handleReadCoils(client, pdu + 1, transactionId);
      break;
    
    case FUNC_READ_DISCRETE:
      handleReadDiscreteInputs(client, pdu + 1, transactionId);
      break;
    
    case FUNC_READ_HOLDING:
      handleReadHoldingRegisters(client, pdu + 1, transactionId);
      break;
    
    case FUNC_READ_INPUT:
      handleReadInputRegisters(client, pdu + 1, transactionId);
      break;
    
    case FUNC_WRITE_COIL:
      handleWriteSingleCoil(client, pdu + 1, transactionId);
      break;
    
    case FUNC_WRITE_HOLDING:
      handleWriteSingleRegister(client, pdu + 1, transactionId);
      break;
    
    case FUNC_WRITE_MULTIPLE_COILS:
      handleWriteMultipleCoils(client, pdu + 1, transactionId);
      break;
    
    case FUNC_WRITE_MULTIPLE_REGS:
      handleWriteMultipleRegisters(client, pdu + 1, transactionId);
      break;
    
    default:
      // Unsupported function code
      sendExceptionResponse(client, functionCode, EXC_ILLEGAL_FUNCTION, transactionId);
      break;
  }
}

/**
 * @brief Handle Modbus TCP connections
 */
void handleModbusTCP() {
  // Check for new clients
  WiFiClient newClient = modbusServer.available();
  if (newClient) {
    Serial.println("New client connected");
    
    // If we're not already serving a client, accept the new one
    if (!modbusClient || !modbusClient.connected()) {
      modbusClient = newClient;
    }
  }
  
  // If a client is connected, check for incoming data
  if (modbusClient && modbusClient.connected()) {
    if (modbusClient.available()) {
      // Wait to ensure complete message
      delay(50);
      
      // Read the MBAP header (7 bytes)
      uint8_t mbap[7];
      for (int i = 0; i < 7; i++) {
        if (modbusClient.available()) {
          mbap[i] = modbusClient.read();
        } else {
          Serial.println("Invalid frame (incomplete MBAP header)");
          return;
        }
      }
      
      // Extract length field
      uint16_t length = (mbap[4] << 8) | mbap[5];
      
      // Length should be at least 1 (Unit ID) plus some data
      if (length < 2) {
        Serial.println("Invalid length in MBAP header");
        return;
      }
      
      // PDU length = total length - unit ID (1 byte)
      uint16_t pduLength = length - 1;
      
      // Read the PDU
      uint8_t pdu[pduLength];
      for (int i = 0; i < pduLength; i++) {
        if (modbusClient.available()) {
          pdu[i] = modbusClient.read();
        } else {
          Serial.println("Invalid frame (incomplete PDU)");
          return;
        }
      }
      
      // Debug print
      Serial.print("Received Modbus TCP frame - Transaction ID: ");
      Serial.print((mbap[0] << 8) | mbap[1]);
      Serial.print(", Length: ");
      Serial.print(length);
      Serial.print(", Unit ID: ");
      Serial.print(mbap[6]);
      Serial.print(", Function: 0x");
      Serial.println(pdu[0], HEX);
      
      // Process the frame
      processModbusTCPFrame(modbusClient, mbap, pdu, pduLength);
    }
  }
}

/**
 * @brief Initialize dummy data for simulation (TCP version)
 */
void initializeDummyDataTCP() {
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
 * @brief Update some dummy data periodically to simulate changing inputs (TCP version)
 */
void updateDummyDataTCP() {
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

#endif /* MODBUS_TCP_FUNCTIONS_H */