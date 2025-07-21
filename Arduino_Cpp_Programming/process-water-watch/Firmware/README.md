# Process Water Watch

An ESP32-based industrial water quality monitoring system with real-time web interface using LittleFS file system.

## Overview

Process Water Watch is a comprehensive solution for monitoring industrial water quality parameters across multiple monitoring stations. The system provides real-time data visualization, alerts for parameter deviations, and station management through a modern web interface.

## Features

- Real-time monitoring of multiple water quality parameters:
  - pH
  - Temperature
  - Turbidity
  - Dissolved Oxygen
  - Conductivity
  - Free Chlorine
- Multiple monitoring station support
- WebSocket-based real-time data updates
- Alert system with warning and critical thresholds
- Alert acknowledgment and management
- Responsive web interface with modern UI and Firmware and web app integration with LittleFS for offline serving
- Sensor testing and diagnostics
- Support for both WiFi AP and Station modes

## Hardware Requirements

- ESP32 development board
- pH sensor (analog)
- Temperature sensor (DS18B20)
- Turbidity sensor (analog)
- Dissolved oxygen sensor (analog)
- Conductivity sensor (analog)
- Free chlorine sensor (analog)
- Power supply

### Pin Connections

| Sensor | ESP32 Pin |
|--------|-----------|
| DS18B20 Temperature | GPIO 4 |
| pH Sensor | GPIO 35 |
| Turbidity Sensor | GPIO 34 |
| Dissolved Oxygen Sensor | GPIO 33 |
| Conductivity Sensor | GPIO 32 |
| Free Chlorine Sensor | GPIO 39 |

## Setup Instructions

### Building and Uploading the Web Application

1. Install Node.js and npm
2. Navigate to the web application directory served from LittleFS:
   ```
   cd C:\Users\rnabo\Desktop\ESP32\process-water-watch
   ```
3. Install dependencies:
   ```
   cmd /c npm install --legacy-peer-deps
   ```
4. Build the application:
   ```
   cmd /c npm run build
   ```
5. Copy the built files to the ESP32's LittleFS data directory:
   ```
   xcopy /E /Y dist\* Firmware\data\
   ```

### Uploading the Firmware

1. Install the Arduino IDE and required libraries:
   - ESP32 board support
   - ESPAsyncWebServer
   - AsyncTCP
   - ArduinoJson
   - OneWire
   - DallasTemperature
2. Open the `ProcessWaterWatch.ino` file in Arduino IDE
3. Upload the LittleFS data:
   - Tools → ESP32 LittleFS Data Upload
4. Compile and upload the firmware to your ESP32

### Accessing the Web Interface

1. After uploading the firmware, the ESP32 will create a WiFi access point:
   - SSID: `ProcessWater-AP`
   - Password: `water-quality-123`
2. Connect to this WiFi network
3. Open a web browser and navigate to `http://192.168.4.1`
4. The Process Water Watch web interface should now be accessible with LittleFS for web app serving.

## Configuration

By default, the ESP32 operates in Access Point mode. To switch to Station mode:

1. Open the `ProcessWaterWatch.ino` file
2. Change `#define USE_WIFI_STA false` to `#define USE_WIFI_STA true`
3. Update `sta_ssid` and `sta_password` with your WiFi credentials
4. Recompile and upload the firmware

## API Reference

### WebSocket Messages

The WebSocket server runs on port 81 and supports the following message types:

- `stations_update`: Real-time station status updates
- `readings_update`: Real-time water quality readings
- `alerts_update`: Real-time alert updates
- `acknowledge_alert`: Acknowledge an alert
- `dismiss_alert`: Dismiss an alert
- `test_sensors`: Test sensor connectivity
- `update_station`: Update station configuration

### REST API Endpoints

- `GET /api/stations`: Get all monitoring stations
- `GET /api/readings`: Get current water quality readings
- `GET /api/alerts`: Get active alerts
- `GET /api/system-status`: Get system status
- `GET /api/test-sensors`: Test sensor connectivity

## Troubleshooting

- If the web interface is not accessible, ensure the ESP32 is properly powered and the WiFi connection is established
- Check the serial monitor for diagnostic information (baud rate: 115200)
- If sensor data appears incorrect, verify sensor connections and calibration
- If no sensor data is available, the system will use simulated data

## License

This project is licensed under the MIT License.
