# Vibra-Guard Predict

An industrial vibration monitoring and predictive maintenance system using ESP32 and MPU6050 accelerometer.

## Overview

Vibra-Guard Predict is a complete solution for monitoring industrial equipment vibration levels, detecting anomalies, and predicting maintenance needs. The system consists of an ESP32-based firmware that interfaces with MPU6050 accelerometer/gyroscope sensors and a modern React web application.

## Features

- Real-time vibration monitoring through WebSocket communication
- Equipment management (add, update, delete)
- Configurable alert thresholds for each piece of equipment
- Status indicators: operational, warning, critical, maintenance
- Vibration frequency analysis
- Temperature monitoring
- Maintenance scheduling
- REST API for system configuration and data retrieval

## Hardware Requirements

- ESP32 development board
- MPU6050 accelerometer/gyroscope sensor
- Power supply for ESP32
- Wiring connections:
  - MPU6050 SDA → ESP32 GPIO21
  - MPU6050 SCL → ESP32 GPIO22
  - MPU6050 VCC → ESP32 3.3V
  - MPU6050 GND → ESP32 GND

## Setup Instructions

### Building and Uploading the Web Application

1. Install Node.js and npm
2. Navigate to the web application directory:
   ```
   cd c:\Users\rnabo\Desktop\ESP32\vibra-guard-predict
   ```
3. Install dependencies:
   ```
   cmd /c npm install --legacy-peer-deps
   ```
4. Build the application:
   ```
   cmd /c npm run build
   ```
5. Create a data directory in the Firmware folder if it doesn't exist:
   ```
   mkdir -p Firmware\data
   ```
6. Copy the built files to the ESP32's LittleFS data directory:
   ```
   xcopy /E /Y dist\* Firmware\data\
   ```

### Uploading the Firmware

1. Install the Arduino IDE and required libraries:
   - ESP32 board support
   - ESPAsyncWebServer
   - AsyncTCP
   - ArduinoJson
   - Adafruit MPU6050
2. Open the `VibraGuardPredict.ino` file in Arduino IDE
3. Upload the LittleFS data:
   - Tools → ESP32 LittleFS Data Upload
4. Compile and upload the firmware to your ESP32

### Accessing the Web Interface

1. After uploading the firmware, the ESP32 will create a WiFi access point:
   - SSID: `VibraGuard-AP`
   - Password: `vibration123`
2. Connect to this WiFi network
3. Open a web browser and navigate to `http://192.168.4.1`
4. The Vibra-Guard Predict web interface should now be accessible

## Configuration

- The system can operate in either WiFi AP mode (default) or Station mode
- To switch to Station mode, update the `USE_WIFI_STA` flag in the firmware and provide your WiFi credentials
- Equipment configurations are managed through the web interface and stored in the ESP32's memory

## API Reference

The system provides both WebSocket and REST API interfaces:

### WebSocket Messages

- `system_update`: Real-time system status updates
- `equipment_update`: Real-time equipment data updates
- `add_equipment`: Add new equipment to monitor
- `update_equipment`: Update equipment configuration
- `delete_equipment`: Remove equipment
- `set_maintenance`: Set equipment to maintenance mode
- `test_sensor`: Test sensor connectivity

### REST API Endpoints

- `GET /api/system-status`: Get current system status
- `GET /api/equipment-data`: Get all equipment data
- `GET /api/equipment?id=X`: Get specific equipment data
- `GET /api/config`: Get system configuration
- `POST /api/config`: Update system configuration
- `GET /api/test-sensor`: Test sensor connectivity

## Troubleshooting

- If the web interface is not accessible, ensure the ESP32 is properly powered and the WiFi connection is established
- Check the serial monitor for diagnostic information (baud rate: 115200)
- If sensor data is not updating, verify the MPU6050 connections and use the "Test Sensor" function in the web interface

## License

This project is licensed under the MIT License.
