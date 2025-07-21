# Sun-Sense Monitor ESP32 Integration Guide

This guide explains how to integrate the ESP32 firmware with the Sun-Sense Monitor web application to create a complete solar panel monitoring system.

## Prerequisites

1. ESP32 development board
2. CAN bus transceiver (e.g., SN65HVD230)
3. Arduino IDE with ESP32 support installed
4. Required Arduino libraries:
   - ESP32CAN
   - ArduinoJson (v6.x)
   - SPIFFS
   - ESPAsyncWebServer
   - AsyncTCP

## Hardware Setup

### CAN Bus Connection

Connect your ESP32 to the CAN bus transceiver:

| ESP32 Pin | CAN Transceiver |
|-----------|-----------------|
| GPIO 4    | RX              |
| GPIO 5    | TX              |
| 3.3V      | VCC             |
| GND       | GND             |

Then connect the CAN transceiver to your solar panel network:

| CAN Transceiver | CAN Bus |
|-----------------|---------|
| CANH            | CANH    |
| CANL            | CANL    |

## Software Setup

### 1. Install Required Libraries

In Arduino IDE:
1. Go to `Tools > Manage Libraries`
2. Install the following libraries:
   - ESP32CAN
   - ArduinoJson
   - ESPAsyncWebServer (may need to be downloaded manually)
   - AsyncTCP (may need to be downloaded manually)

### 2. Configure Arduino IDE for ESP32

1. Select your ESP32 board type under `Tools > Board`
2. Select the correct port under `Tools > Port`
3. Set partition scheme to support SPIFFS: `Tools > Partition Scheme > Minimal SPIFFS`

### 3. Upload Firmware

1. Open `SunSenseMonitor.ino` in Arduino IDE
2. Verify settings such as WiFi SSID/password if needed
3. Click `Upload` to flash the ESP32

### 4. Prepare Web Application for SPIFFS

To upload the web application to the ESP32's SPIFFS:

1. Build the web application:
   ```bash
   cd C:\Users\rnabo\Desktop\ESP32\sun-sense-monitor
   cmd /c npm install --legacy-peer-deps
   cmd /c npm run build
   ```

2. Copy build files to the ESP32 SPIFFS data directory:
   ```bash
   xcopy /E /Y dist\* C:\Users\rnabo\Desktop\ESP32\sun-sense-monitor\Firmware\data\
   ```

3. Install ESP32 Sketch Data Upload tool in Arduino IDE (if not already installed)
   - Follow instructions at https://github.com/me-no-dev/arduino-esp32fs-plugin

4. Upload the web application to SPIFFS:
   - In Arduino IDE, with the `SunSenseMonitor.ino` sketch open
   - Go to `Tools > ESP32 Sketch Data Upload`

## Usage

1. Power on your ESP32
2. Connect to the ESP32's WiFi access point:
   - SSID: `SunSenseMonitor`
   - Password: `solar1234`
3. Open a web browser and navigate to `http://192.168.4.1`
4. The Sun-Sense Monitor dashboard will load, displaying real-time data from your solar panels

### Configuration

- Access the Configuration page to customize:
  - CAN bus settings
  - Sensor parameters
  - System settings
  - Data collection intervals

## Troubleshooting

- **No data from sensors**: 
  - Check CAN bus connections
  - Verify CAN bus baud rate matches your solar panel network
  - Use the "Test CANbus" feature in the Configuration page

- **Web interface not loading**:
  - Confirm you're connected to the ESP32's WiFi network
  - Reset the ESP32 and try again
  - Verify SPIFFS has been properly uploaded

- **Poor sensor connectivity**:
  - Check physical connections
  - Review termination resistors on the CAN bus
  - Reduce CAN bus cable length if possible

## Advanced Features

- **Station Mode**: Configure the ESP32 to connect to your existing WiFi network by updating the `wifi_ssid` and `wifi_password` variables and setting `useStationMode = true`
  
- **Custom Sensor Setup**: Modify the `sensorConfigs` structure to match your specific solar panel setup

- **Data Logging**: The system currently simulates sensor readings for demonstration. Implement SD card logging for long-term data storage

## Future Enhancements

- NTP time synchronization for accurate timestamps
- MQTT integration for remote monitoring
- OTA firmware updates
- Weather API integration for correlation with solar performance
