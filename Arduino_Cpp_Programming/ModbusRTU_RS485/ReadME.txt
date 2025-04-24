# Modbus RTU Communication System

This project implements a complete Modbus RTU communication system between an ESP32 (slave) and a Raspberry Pi (master). The system demonstrates all standard Modbus functions with real-world simulated data.

## System Overview

- **ESP32**: Acts as a Modbus RTU slave device with address 3
- **Raspberry Pi**: Acts as a Modbus RTU master device
- **Communication**: RS485 serial communication at 9600 baud

## Hardware Setup

### ESP32 Connections
- RX Pin: GPIO 17
- TX Pin: GPIO 16
- RS485 Direction Control: GPIO 25
- Built-in LED: GPIO 2 (Controlled by Coil 0)

### Raspberry Pi Connections
- RX/TX: UART pins (/dev/ttyAMA0)
- RS485 Direction Control: GPIO 21

## Memory Map

The ESP32 implements all four standard Modbus register types with 32 addresses each:

### 1. Coils (Digital Outputs) - Function Codes 0x01, 0x05, 0x0F
- **Address Range**: 0-31
- **Access**: Read/Write
- **Special Addresses**:
  - Coil 0: Controls the ESP32's built-in LED
- **Function Codes**:
  - 0x01: Read Coils
  - 0x05: Write Single Coil
  - 0x0F: Write Multiple Coils

### 2. Discrete Inputs (Digital Inputs) - Function Code 0x02
- **Address Range**: 0-31
- **Access**: Read-only
- **Notes**: Some inputs toggle automatically every 5 seconds
- **Function Codes**:
  - 0x02: Read Discrete Inputs

### 3. Holding Registers (Analog Outputs) - Function Codes 0x03, 0x06, 0x10
- **Address Range**: 0-31
- **Access**: Read/Write
- **Initial Values**: 1000 + address (e.g., address 5 = 1005)
- **Function Codes**:
  - 0x03: Read Holding Registers
  - 0x06: Write Single Register
  - 0x10: Write Multiple Registers

### 4. Input Registers (Analog Inputs) - Function Code 0x04
- **Address Range**: 0-31
- **Access**: Read-only
- **Special Addresses**:
  - Register 0: Simulated sine wave
  - Register 1: Counter value
  - Register 2: System uptime in seconds
  - Others: 2000 + (address × 100)
- **Function Codes**:
  - 0x04: Read Input Registers

## Detailed Command Examples and Expected Results

### 1. Read Coils (0x01)

**Command**: Read 8 coils starting at address 0
- **Raspberry Pi Menu Option**: 1
- **Parameters**: 
  - Starting Address: 0
  - Quantity: 8
- **Modbus Frame**: `03 01 00 00 00 08 3D CC`
- **Expected Response**: `03 01 01 XX CRC CRC` (where XX is the byte containing the 8 coil values)
- **Interpretation**: 
  - First bit (LSB) of XX is the state of Coil 0 (LED)
  - If LED is ON: XX will have bit 0 set (e.g., `03 01 01 01 CRC CRC`)
  - If LED is OFF: XX will have bit 0 clear (e.g., `03 01 01 00 CRC CRC`)

### 2. Read Discrete Inputs (0x02)

**Command**: Read 8 discrete inputs starting at address 0
- **Raspberry Pi Menu Option**: 2
- **Parameters**: 
  - Starting Address: 0
  - Quantity: 8
- **Modbus Frame**: `03 02 00 00 00 08 78 0C`
- **Expected Response**: `03 02 01 XX CRC CRC` (where XX is the byte containing 8 discrete input values)
- **Interpretation**: 
  - The value XX will change every 5 seconds as some inputs toggle automatically
  - Initial pattern is alternating (e.g., `03 02 01 55 CRC CRC` for 01010101 binary)
  - Inputs 0 and 5 toggle periodically, so values will change over time

### 3. Read Holding Registers (0x03)

**Command**: Read 5 holding registers starting at address 0
- **Raspberry Pi Menu Option**: 3
- **Parameters**: 
  - Starting Address: 0
  - Quantity: 5
- **Modbus Frame**: `03 03 00 00 00 05 85 C9`
- **Expected Response**: `03 03 0A 03 E8 03 E9 03 EA 03 EB 03 EC CRC CRC`
- **Interpretation**: 
  - 10 data bytes (0A) for 5 registers (2 bytes each)
  - 5 values: 1000 (03E8), 1001 (03E9), 1002 (03EA), 1003 (03EB), 1004 (03EC)
  - These values can be modified using the write functions

### 4. Read Input Registers (0x04)

**Command**: Read 3 input registers starting at address 0
- **Raspberry Pi Menu Option**: 4
- **Parameters**: 
  - Starting Address: 0
  - Quantity: 3
- **Modbus Frame**: `03 04 00 00 00 03 C5 C8`
- **Expected Response**: `03 04 06 XX XX XX XX XX XX CRC CRC`
- **Interpretation**: 
  - 6 data bytes (06) for 3 registers (2 bytes each)
  - Register 0: Sine wave value ~2000±50 (varies with time)
  - Register 1: Counter value (increases with each update)
  - Register 2: System uptime in seconds

### 5. Write Single Coil (0x05)

**Command**: Turn LED ON (set coil 0 to ON)
- **Raspberry Pi Menu Option**: 5
- **Parameters**: 
  - Coil Address: 0
  - Value: 1 (ON)
- **Modbus Frame**: `03 05 00 00 FF 00 8D D8`
- **Expected Response**: `03 05 00 00 FF 00 8D D8`
- **Result**: The built-in LED on ESP32 should turn ON

**Command**: Turn LED OFF (set coil 0 to OFF)
- **Raspberry Pi Menu Option**: 5
- **Parameters**: 
  - Coil Address: 0
  - Value: 0 (OFF)
- **Modbus Frame**: `03 05 00 00 00 00 CC 28`
- **Expected Response**: `03 05 00 00 00 00 CC 28`
- **Result**: The built-in LED on ESP32 should turn OFF

### 6. Write Single Register (0x06)

**Command**: Write value 2500 to holding register 10
- **Raspberry Pi Menu Option**: 6
- **Parameters**: 
  - Register Address: 10
  - Value: 2500 (0x09C4)
- **Modbus Frame**: `03 06 00 0A 09 C4 CA ED`
- **Expected Response**: `03 06 00 0A 09 C4 CA ED`
- **Verification**: Reading register 10 (option 3) should return 2500 instead of the default 1010

### 7. Write Multiple Coils (0x0F)

**Command**: Set coils 0-7 to alternating pattern (10101010)
- **Raspberry Pi Menu Option**: 7
- **Parameters**: 
  - Starting Address: 0
  - Quantity: 8
  - Values: 1,0,1,0,1,0,1,0
- **Modbus Frame**: `03 0F 00 00 00 08 01 AA CRC CRC`
- **Expected Response**: `03 0F 00 00 00 08 CRC CRC`
- **Result**: 
  - The LED (coil 0) should turn ON
  - Reading coils 0-7 should show alternating ON/OFF pattern

### 8. Write Multiple Registers (0x10)

**Command**: Write values [5000, 6000, 7000] to registers 5-7
- **Raspberry Pi Menu Option**: 8
- **Parameters**: 
  - Starting Address: 5
  - Quantity: 3
  - Values: 5000, 6000, 7000
- **Modbus Frame**: `03 10 00 05 00 03 06 13 88 17 70 1B 58 CRC CRC`
- **Expected Response**: `03 10 00 05 00 03 CRC CRC`
- **Verification**: Reading registers 5-7 (option 3) should return:
  - Register 5: 5000 (0x1388) instead of default 1005
  - Register 6: 6000 (0x1770) instead of default 1006
  - Register 7: 7000 (0x1B58) instead of default 1007

### 9. Toggle LED (Special Function)

**Command**: Toggle the LED state
- **Raspberry Pi Menu Option**: 9
- **Behavior**: 
  1. Reads current LED state using function 0x01
  2. Calculates the opposite state
  3. Writes the new state using function 0x05
- **Result**: The LED should toggle from ON to OFF or from OFF to ON with each execution

## Common Response Issues and Troubleshooting

### Error Responses:
- **Exception Response**: `03 81 02 CRC CRC`
  - Function 0x01 + 0x80 = 0x81 indicates an error
  - Exception code 0x02 means "Illegal Data Address"
  - Cause: Requested address range is out of bounds

- **Exception Response**: `03 85 03 CRC CRC`
  - Function 0x05 + 0x80 = 0x85 indicates an error
  - Exception code 0x03 means "Illegal Data Value"
  - Cause: Trying to write an invalid value to a coil (not 0x0000 or 0xFF00)

### No Response:
- **Cause 1**: Wrong slave ID (not 3)
- **Cause 2**: RS485 direction control timing issues
- **Cause 3**: Invalid CRC
- **Solution**: Check all parameters and increase delays between transmit/receive mode switching

## Compilation Instructions

### ESP32 Code
1. Open the Arduino IDE
2. Install the required libraries
3. Load the ESP32 code
4. Select the appropriate board and port
5. Upload the code

### Raspberry Pi Code
```bash
gcc -Wall -o modbus_client modbus_client.c -lpigpio -lrt -lpthread
sudo ./modbus_client
```

## Advanced Test Scenarios

### 1. Reading All Register Types
This test scenario reads one of each register type to verify full system functionality:
1. Read coil 0 (LED state)
2. Read discrete input 0 (simulated input)
3. Read holding register 0 (configurable value)
4. Read input register 0 (simulated sine wave)

Expected results will show the current state of each register type, demonstrating the ESP32's comprehensive Modbus implementation.

### 2. Boundary Testing
Test behavior at the boundaries of the implemented address ranges:
1. Read/write coil 31 (highest valid coil address)
2. Attempt to read/write coil 32 (should return exception 0x02)
3. Read holding register 31 (highest valid register)
4. Attempt to read holding register 32 (should return exception 0x02)

### 3. Dynamic Input Monitoring
Observe the changing values of the simulated inputs:
1. Read input register 0 repeatedly (every 1 second)
2. Watch the sine wave pattern change
3. Read input register 2 repeatedly to observe the system uptime counter
4. Read discrete inputs repeatedly to see the automatic toggling behavior

This demonstrates the dynamic simulation capabilities of the system.