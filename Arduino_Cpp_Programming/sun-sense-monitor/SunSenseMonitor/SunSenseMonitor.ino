/*
 * SunSenseMonitor.ino
 * ESP32 Firmware for Solar Panel Monitoring System
 * 
 * This firmware interfaces with CAN bus connected solar panels,
 * collects data, and serves it to the web application via WebSockets.
 */

// Required Libraries
#include <Arduino.h>
#include <WiFi.h>
#include <LittleFS.h>
#include <ESPAsyncWebServer.h>
#include <AsyncTCP.h>
#include <AsyncWebSocket.h>
#include <ArduinoJson.h>
#include <mcp2515.h>
#include <EEPROM.h>
#include <Time.h>

// CAN Bus Configuration
const int CAN_CS_PIN = 5;  // CS pin for MCP2515
const int CAN_INT_PIN = 4;  // INT pin for MCP2515
MCP2515 mcp2515(CAN_CS_PIN); // Initialize MCP2515 with SPI CS pin

// WiFi Configuration - Access Point Mode
const char* ap_ssid = "SunSenseMonitor";
const char* ap_password = "solar1234";

// WiFi Configuration - Station Mode (to connect to existing WiFi)
String wifi_ssid = "";
String wifi_password = "";
bool useStationMode = false;

// Web Server and WebSocket
AsyncWebServer server(80);
AsyncWebSocket ws("/ws");

// EEPROM Configuration
#define EEPROM_SIZE 4096
#define CONFIG_START_ADDR 0
#define WIFI_SETTINGS_ADDR 0
#define CAN_SETTINGS_ADDR 100
#define SENSOR_SETTINGS_ADDR 200
#define SYSTEM_SETTINGS_ADDR 1000

// System Variables
unsigned long lastSensorUpdateTime = 0;
unsigned long sensorUpdateInterval = 3000; // 3 seconds default
int dataRetentionDays = 30;
String alertSensitivity = "medium";
bool autoCalibration = true;

// CAN Bus Settings
int baudRate = 250000;
String protocol = "CAN 2.0B";
bool terminationResistor = true;
bool autoRetransmit = true;
bool listenOnlyMode = false;

// Sensor Data Storage
#define MAX_SENSORS 50
struct SensorData {
  int id;
  float power;
  float voltage;
  float current;
  float temperature;
  String status;
  float efficiency;
  unsigned long lastUpdate;
  int alertCount;
};

SensorData sensors[MAX_SENSORS];

// Sensor Configuration
struct SensorConfig {
  int id;
  String name;
  String canId;
  String position;
  bool enabled;
  float calibrationOffset;
  int alertThreshold;
};

SensorConfig sensorConfigs[MAX_SENSORS];

// System Status
struct SystemStatus {
  bool canBusConnected;
  int connectedSensors;
  float totalPower;
  float dailyEnergy;
  float systemEfficiency;
  float ambientTemp;
  float humidity;
  float windSpeed;
  String weather;
  String lastUpdate;
};

SystemStatus systemStatus;

// Function Prototypes
void setupWiFi();
void setupCAN();
void setupSPIFFS();
void setupWebServer();
void initializeSensors();
void handleWebSocketMessage(void *arg, uint8_t *data, size_t len);
void sendSensorData();
void processCANMessage(struct can_frame &frame);
void loadConfiguration();
void saveConfiguration();
String getSystemStatusJSON();
String getSensorDataJSON();
String getTimeString();

void setup() {
  Serial.begin(115200);
  Serial.println("Starting Sun-Sense Monitor...");

  // Initialize EEPROM
  EEPROM.begin(EEPROM_SIZE);
  
  // Initialize file system
  setupSPIFFS();
  
  // Load configuration from EEPROM
  loadConfiguration();
  
  // Setup WiFi
  setupWiFi();
  
  // Initialize and configure CAN Bus
  setupCAN();
  
  // Initialize sensor data structures
  initializeSensors();
  
  // Setup web server and WebSocket
  setupWebServer();
  
  Serial.println("Sun-Sense Monitor initialized successfully");
}

void loop() {
  // Handle CAN messages
  if (digitalRead(CAN_INT_PIN) == LOW) { // Check if interrupt is active (LOW)
    struct can_frame canMsg;
    
    if (mcp2515.readMessage(&canMsg) == MCP2515::ERROR_OK) {
      processCANMessage(canMsg);
    }
  }
  
  // Send periodic sensor updates via WebSocket
  unsigned long currentMillis = millis();
  if (currentMillis - lastSensorUpdateTime >= sensorUpdateInterval) {
    lastSensorUpdateTime = currentMillis;
    sendSensorData();
    
    // Simulate some sensor readings (for demo/testing)
    simulateSensorReadings();
  }
  
  // EEPROM writes should be limited to config changes, not in main loop
}

void setupSPIFFS() {
  if (!LittleFS.begin(true)) {
    Serial.println("An error occurred while mounting LittleFS");
    return;
  }
  Serial.println("LittleFS mounted successfully");
}

void setupWiFi() {
  if (useStationMode && wifi_ssid.length() > 0) {
    // Station mode - connect to existing WiFi
    WiFi.mode(WIFI_STA);
    WiFi.begin(wifi_ssid.c_str(), wifi_password.c_str());
    
    Serial.println("Connecting to WiFi...");
    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 20) {
      delay(500);
      Serial.print(".");
      attempts++;
    }
    
    if (WiFi.status() == WL_CONNECTED) {
      Serial.println("");
      Serial.println("WiFi connected");
      Serial.print("IP address: ");
      Serial.println(WiFi.localIP());
    } else {
      Serial.println("");
      Serial.println("Failed to connect to WiFi, switching to AP mode");
      useStationMode = false;
    }
  }
  
  if (!useStationMode) {
    // Access point mode
    WiFi.mode(WIFI_AP);
    WiFi.softAP(ap_ssid, ap_password);
    
    Serial.println("Access Point started");
    Serial.print("IP address: ");
    Serial.println(WiFi.softAPIP());
  }
}

void setupCAN() {
  SPI.begin();
  
  // Initialize MCP2515
  mcp2515.reset();
  
  // Set CAN speed based on baudRate setting
  MCP2515::ERROR result;
  switch(baudRate) {
    case 125000:
      result = mcp2515.setBitrate(CAN_125KBPS);
      break;
    case 250000:
      result = mcp2515.setBitrate(CAN_250KBPS);
      break;
    case 500000:
      result = mcp2515.setBitrate(CAN_500KBPS);
      break;
    case 1000000:
      result = mcp2515.setBitrate(CAN_1000KBPS);
      break;
    default:
      result = mcp2515.setBitrate(CAN_250KBPS); // Default to 250K
      break;
  }
  
  // Set normal mode or listen-only mode
  if (listenOnlyMode) {
    mcp2515.setListenOnlyMode();
  } else {
    mcp2515.setNormalMode();
  }
  
  // Set up interrupt pin if needed
  pinMode(CAN_INT_PIN, INPUT_PULLUP);
  
  if (result == MCP2515::ERROR_OK) {
    Serial.println("MCP2515 CAN initialized successfully");
    systemStatus.canBusConnected = true;
  } else {
    Serial.println("Error initializing MCP2515 CAN bus");
    systemStatus.canBusConnected = false;
  }
}

void setupWebServer() {
  // WebSocket event handler
  ws.onEvent([](AsyncWebSocket *server, AsyncWebSocketClient *client, 
                AwsEventType type, void *arg, uint8_t *data, size_t len) {
    switch (type) {
      case WS_EVT_CONNECT:
        Serial.printf("WebSocket client #%u connected from %s\n", client->id(), client->remoteIP().toString().c_str());
        // Send initial data when client connects
        client->text(getSystemStatusJSON());
        client->text(getSensorDataJSON());
        break;
      case WS_EVT_DISCONNECT:
        Serial.printf("WebSocket client #%u disconnected\n", client->id());
        break;
      case WS_EVT_DATA:
        handleWebSocketMessage(arg, data, len);
        break;
      case WS_EVT_PONG:
      case WS_EVT_ERROR:
        break;
    }
  });
  
  server.addHandler(&ws);

  // Serve static files from LittleFS
  server.serveStatic("/", LittleFS, "/").setDefaultFile("index.html");
  
  // API endpoints for configuration
  server.on("/api/system-status", HTTP_GET, [](AsyncWebServerRequest *request) {
    request->send(200, "application/json", getSystemStatusJSON());
  });
  
  server.on("/api/sensor-data", HTTP_GET, [](AsyncWebServerRequest *request) {
    request->send(200, "application/json", getSensorDataJSON());
  });
  
  server.on("/api/config", HTTP_GET, [](AsyncWebServerRequest *request) {
    DynamicJsonDocument doc(4096);
    
    // CAN bus settings
    JsonObject canConfig = doc.createNestedObject("canBus");
    canConfig["baudRate"] = baudRate;
    canConfig["protocol"] = protocol;
    canConfig["terminationResistor"] = terminationResistor;
    canConfig["autoRetransmit"] = autoRetransmit;
    canConfig["listenOnlyMode"] = listenOnlyMode;
    
    // System settings
    JsonObject sysConfig = doc.createNestedObject("system");
    sysConfig["updateInterval"] = sensorUpdateInterval;
    sysConfig["dataRetentionDays"] = dataRetentionDays;
    sysConfig["alertSensitivity"] = alertSensitivity;
    sysConfig["autoCalibration"] = autoCalibration;
    
    // Sensor configurations
    JsonArray sensorsArray = doc.createNestedArray("sensors");
    for (int i = 0; i < MAX_SENSORS; i++) {
      JsonObject sensor = sensorsArray.createNestedObject();
      sensor["id"] = sensorConfigs[i].id;
      sensor["name"] = sensorConfigs[i].name;
      sensor["canId"] = sensorConfigs[i].canId;
      sensor["position"] = sensorConfigs[i].position;
      sensor["enabled"] = sensorConfigs[i].enabled;
      sensor["calibrationOffset"] = sensorConfigs[i].calibrationOffset;
      sensor["alertThreshold"] = sensorConfigs[i].alertThreshold;
    }
    
    String response;
    serializeJson(doc, response);
    request->send(200, "application/json", response);
  });
  
  // Additional API endpoint for sensor management
  server.on("/api/sensors", HTTP_GET, [](AsyncWebServerRequest *request) {
    DynamicJsonDocument doc(4096);
    JsonArray sensorsArray = doc.createNestedArray("sensors");
    
    // Check if a specific sensor ID was requested
    if (request->hasParam("id")) {
      int sensorId = request->getParam("id")->value().toInt();
      
      if (sensorId >= 0 && sensorId < MAX_SENSORS) {
        JsonObject sensor = sensorsArray.createNestedObject();
        sensor["id"] = sensorConfigs[sensorId].id;
        sensor["name"] = sensorConfigs[sensorId].name;
        sensor["canId"] = sensorConfigs[sensorId].canId;
        sensor["position"] = sensorConfigs[sensorId].position;
        sensor["enabled"] = sensorConfigs[sensorId].enabled;
        sensor["calibrationOffset"] = sensorConfigs[sensorId].calibrationOffset;
        sensor["alertThreshold"] = sensorConfigs[sensorId].alertThreshold;
        
        // Add current sensor readings if available
        if (sensorConfigs[sensorId].enabled) {
          sensor["power"] = sensors[sensorId].power;
          sensor["voltage"] = sensors[sensorId].voltage;
          sensor["current"] = sensors[sensorId].current;
          sensor["temperature"] = sensors[sensorId].temperature;
          sensor["status"] = sensors[sensorId].status;
          sensor["efficiency"] = sensors[sensorId].efficiency;
        }
      }
    } else {
      // Return all sensors or filter by enabled status
      bool onlyEnabled = request->hasParam("enabled") && 
                        request->getParam("enabled")->value() == "true";
                        
      for (int i = 0; i < MAX_SENSORS; i++) {
        if (!onlyEnabled || sensorConfigs[i].enabled) {
          JsonObject sensor = sensorsArray.createNestedObject();
          sensor["id"] = sensorConfigs[i].id;
          sensor["name"] = sensorConfigs[i].name;
          sensor["canId"] = sensorConfigs[i].canId;
          sensor["position"] = sensorConfigs[i].position;
          sensor["enabled"] = sensorConfigs[i].enabled;
          sensor["calibrationOffset"] = sensorConfigs[i].calibrationOffset;
          sensor["alertThreshold"] = sensorConfigs[i].alertThreshold;
          
          // Add current sensor readings if available
          if (sensorConfigs[i].enabled) {
            sensor["power"] = sensors[i].power;
            sensor["voltage"] = sensors[i].voltage;
            sensor["current"] = sensors[i].current;
            sensor["temperature"] = sensors[i].temperature;
            sensor["status"] = sensors[i].status;
            sensor["efficiency"] = sensors[i].efficiency;
          }
        }
      }
    }
    
    String response;
    serializeJson(doc, response);
    request->send(200, "application/json", response);
  });
  
  server.on("/api/config", HTTP_POST, [](AsyncWebServerRequest *request) {
    request->send(200); // Acknowledge receipt
  }, NULL, [](AsyncWebServerRequest *request, uint8_t *data, size_t len, size_t index, size_t total) {
    DynamicJsonDocument doc(4096);
    deserializeJson(doc, data, len);
    
    // Update CAN bus settings
    if (doc.containsKey("canBus")) {
      baudRate = doc["canBus"]["baudRate"];
      protocol = doc["canBus"]["protocol"].as<String>();
      terminationResistor = doc["canBus"]["terminationResistor"];
      autoRetransmit = doc["canBus"]["autoRetransmit"];
      listenOnlyMode = doc["canBus"]["listenOnlyMode"];
    }
    
    // Update system settings
    if (doc.containsKey("system")) {
      sensorUpdateInterval = doc["system"]["updateInterval"];
      dataRetentionDays = doc["system"]["dataRetentionDays"];
      alertSensitivity = doc["system"]["alertSensitivity"].as<String>();
      autoCalibration = doc["system"]["autoCalibration"];
    }
    
    // Update sensor configurations
    if (doc.containsKey("sensors")) {
      JsonArray sensorsArray = doc["sensors"];
      for (JsonVariant sensor : sensorsArray) {
        int id = sensor["id"];
        if (id >= 0 && id < MAX_SENSORS) {
          sensorConfigs[id].id = id;
          sensorConfigs[id].name = sensor["name"].as<String>();
          sensorConfigs[id].canId = sensor["canId"].as<String>();
          sensorConfigs[id].position = sensor["position"].as<String>();
          sensorConfigs[id].enabled = sensor["enabled"];
          sensorConfigs[id].calibrationOffset = sensor["calibrationOffset"];
          sensorConfigs[id].alertThreshold = sensor["alertThreshold"];
        }
      }
    }
    
    // Save updated configuration
    saveConfiguration();
    
    // If CAN settings changed, reinitialize
    if (doc.containsKey("canBus")) {
      // Reset MCP2515 before reconfiguring
      mcp2515.reset();
      setupCAN();
    }
    
    request->send(200, "text/plain", "Configuration updated successfully");
  });
  
  // Handle 404
  server.onNotFound([](AsyncWebServerRequest *request) {
    request->send(404, "text/plain", "Not found");
  });
  
  // Start server
  server.begin();
  Serial.println("HTTP server started");
}

void initializeSensors() {
  // Initialize sensor configuration with defaults if not set
  for (int i = 0; i < MAX_SENSORS; i++) {
    if (sensorConfigs[i].name.length() == 0) {
      sensorConfigs[i].id = i;
      sensorConfigs[i].name = "Solar Panel " + String(i + 1);
      sensorConfigs[i].canId = "0x" + String(0x100 + i, HEX);
      sensorConfigs[i].position = "Panel " + String(floor(i / 10) + 1) + "-" + String((i % 10) + 1);
      sensorConfigs[i].enabled = true;
      sensorConfigs[i].calibrationOffset = 0;
      sensorConfigs[i].alertThreshold = 85;
    }
    
    // Clear sensor data
    sensors[i].id = i;
    sensors[i].power = 0;
    sensors[i].voltage = 0;
    sensors[i].current = 0;
    sensors[i].temperature = 0;
    sensors[i].status = "offline";
    sensors[i].efficiency = 0;
    sensors[i].lastUpdate = 0;
    sensors[i].alertCount = 0;
  }
  
  // Initialize system status
  systemStatus.canBusConnected = false;
  systemStatus.connectedSensors = 0;
  systemStatus.totalPower = 0;
  systemStatus.dailyEnergy = 0;
  systemStatus.systemEfficiency = 0;
  systemStatus.ambientTemp = 25.0;
  systemStatus.humidity = 40.0;
  systemStatus.windSpeed = 5.0;
  systemStatus.weather = "sunny";
  systemStatus.lastUpdate = getTimeString();
}

void handleWebSocketMessage(void *arg, uint8_t *data, size_t len) {
  AwsFrameInfo *info = (AwsFrameInfo*)arg;
  if (info->final && info->index == 0 && info->len == len && info->opcode == WS_TEXT) {
    data[len] = 0;
    String message = (char*)data;
    
    DynamicJsonDocument doc(1024);
    deserializeJson(doc, message);
    
    if (doc.containsKey("type")) {
      String type = doc["type"];
      
      if (type == "save_settings" && doc.containsKey("settings")) {
        // Handle settings update
        JsonObject settings = doc["settings"];
        
        // Process settings...
        saveConfiguration();
        
        // Confirm to clients
        ws.textAll("{\"type\":\"settings_saved\",\"success\":true}");
      }
      else if (type == "reset_settings") {
        // Reset to default settings
        initializeSensors();
        saveConfiguration();
        
        // Confirm to clients
        ws.textAll("{\"type\":\"settings_reset\",\"success\":true}");
      }
      else if (type == "test_canbus") {
        // Test CAN bus connectivity
        bool success = testCANBus();
        
        String response = "{\"type\":\"canbus_test\",\"success\":" + String(success ? "true" : "false") + 
                         ",\"connected_sensors\":" + String(systemStatus.connectedSensors) + "}";
        ws.textAll(response);
      }
      else if (type == "add_sensor" && doc.containsKey("sensor")) {
        // Add new sensor
        JsonObject sensorObj = doc["sensor"];
        int newId = -1;
        
        // Find first available ID if not specified
        if (!sensorObj.containsKey("id") || sensorObj["id"].as<int>() < 0) {
          for (int i = 0; i < MAX_SENSORS; i++) {
            if (!sensorConfigs[i].enabled) {
              newId = i;
              break;
            }
          }
        } else {
          newId = sensorObj["id"].as<int>();
        }
        
        // Check if we found an available slot
        if (newId >= 0 && newId < MAX_SENSORS) {
          sensorConfigs[newId].id = newId;
          if (sensorObj.containsKey("name")) {
            sensorConfigs[newId].name = sensorObj["name"].as<String>();
          } else {
            sensorConfigs[newId].name = "Solar Panel " + String(newId + 1);
          }
          
          if (sensorObj.containsKey("canId")) {
            sensorConfigs[newId].canId = sensorObj["canId"].as<String>();
          } else {
            sensorConfigs[newId].canId = "0x" + String(0x100 + newId, HEX);
          }
          
          if (sensorObj.containsKey("position")) {
            sensorConfigs[newId].position = sensorObj["position"].as<String>();
          } else {
            sensorConfigs[newId].position = "Panel " + String(floor(newId / 10) + 1) + "-" + String((newId % 10) + 1);
          }
          
          sensorConfigs[newId].enabled = true;
          sensorConfigs[newId].calibrationOffset = sensorObj.containsKey("calibrationOffset") ? 
              sensorObj["calibrationOffset"].as<float>() : 0.0;
          sensorConfigs[newId].alertThreshold = sensorObj.containsKey("alertThreshold") ? 
              sensorObj["alertThreshold"].as<int>() : 85;
          
          saveConfiguration();
          
          DynamicJsonDocument responseDoc(256);
          responseDoc["type"] = "sensor_added";
          responseDoc["success"] = true;
          responseDoc["sensorId"] = newId;
          
          String responseJson;
          serializeJson(responseDoc, responseJson);
          ws.textAll(responseJson);
        } else {
          ws.textAll("{\"type\":\"sensor_added\",\"success\":false,\"error\":\"No available sensor slots\"}");
        }
      }
      else if (type == "delete_sensor" && doc.containsKey("sensorId")) {
        // Delete sensor
        int sensorId = doc["sensorId"];
        
        if (sensorId >= 0 && sensorId < MAX_SENSORS) {
          // Just mark as disabled rather than fully deleting
          sensorConfigs[sensorId].enabled = false;
          sensors[sensorId].status = "offline";
          
          saveConfiguration();
          
          String response = "{\"type\":\"sensor_deleted\",\"success\":true,\"sensorId\":" + String(sensorId) + "}";
          ws.textAll(response);
        } else {
          ws.textAll("{\"type\":\"sensor_deleted\",\"success\":false,\"error\":\"Invalid sensor ID\"}");
        }
      }
      else if (type == "update_sensor" && doc.containsKey("sensor")) {
        // Update existing sensor
        JsonObject sensorObj = doc["sensor"];
        
        if (sensorObj.containsKey("id")) {
          int sensorId = sensorObj["id"];
          
          if (sensorId >= 0 && sensorId < MAX_SENSORS) {
            // Update sensor configuration
            if (sensorObj.containsKey("name")) {
              sensorConfigs[sensorId].name = sensorObj["name"].as<String>();
            }
            
            if (sensorObj.containsKey("canId")) {
              sensorConfigs[sensorId].canId = sensorObj["canId"].as<String>();
            }
            
            if (sensorObj.containsKey("position")) {
              sensorConfigs[sensorId].position = sensorObj["position"].as<String>();
            }
            
            if (sensorObj.containsKey("enabled")) {
              sensorConfigs[sensorId].enabled = sensorObj["enabled"];
            }
            
            if (sensorObj.containsKey("calibrationOffset")) {
              sensorConfigs[sensorId].calibrationOffset = sensorObj["calibrationOffset"].as<float>();
            }
            
            if (sensorObj.containsKey("alertThreshold")) {
              sensorConfigs[sensorId].alertThreshold = sensorObj["alertThreshold"].as<int>();
            }
            
            saveConfiguration();
            
            String response = "{\"type\":\"sensor_updated\",\"success\":true,\"sensorId\":" + String(sensorId) + "}";
            ws.textAll(response);
          } else {
            ws.textAll("{\"type\":\"sensor_updated\",\"success\":false,\"error\":\"Invalid sensor ID\"}");
          }
        } else {
          ws.textAll("{\"type\":\"sensor_updated\",\"success\":false,\"error\":\"Sensor ID not specified\"}");
        }
      }
    }
  }
}

bool testCANBus() {
  // Send test messages to sensors and count responses
  int connectedCount = 0;
  
  // For each enabled sensor, send a test message and await response
  for (int i = 0; i < MAX_SENSORS; i++) {
    if (sensorConfigs[i].enabled) {
      // Convert CAN ID from string (e.g. "0x100") to integer
      String idStr = sensorConfigs[i].canId;
      if (idStr.startsWith("0x")) {
        idStr = idStr.substring(2);
      }
      uint32_t canId = strtol(idStr.c_str(), NULL, 16);
      
      // Create and send a test message
      struct can_frame testFrame;
      testFrame.can_id = canId;
      testFrame.can_dlc = 8;
      testFrame.data[0] = 0x01;  // Test command
      testFrame.data[1] = 0x00;
      testFrame.data[2] = 0x00;
      testFrame.data[3] = 0x00;
      testFrame.data[4] = 0x00;
      testFrame.data[5] = 0x00;
      testFrame.data[6] = 0x00;
      testFrame.data[7] = 0x00;
      
      mcp2515.sendMessage(&testFrame);
      
      // In a real application, we would wait for responses
      // For this demo, we'll simulate responses
      if (random(100) < 90) {  // 90% chance of successful response
        connectedCount++;
        sensors[i].status = "optimal";
      } else {
        sensors[i].status = "offline";
      }
    }
  }
  
  systemStatus.connectedSensors = connectedCount;
  return connectedCount > 0;
}

void processCANMessage(struct can_frame &frame) {
  // Process received CAN message
  uint32_t canId = frame.can_id;
  
  // Find which sensor this message belongs to
  for (int i = 0; i < MAX_SENSORS; i++) {
    // Convert sensor's CAN ID from string to integer for comparison
    String idStr = sensorConfigs[i].canId;
    if (idStr.startsWith("0x")) {
      idStr = idStr.substring(2);
    }
    uint32_t sensorCanId = strtol(idStr.c_str(), NULL, 16);
    
    if (sensorCanId == canId && sensorConfigs[i].enabled) {
      // This message is for this sensor
      // Extract data based on your protocol
      
      // Example: assuming data format where:
      // Bytes 0-1: Voltage (mV)
      // Bytes 2-3: Current (mA)
      // Bytes 4-5: Temperature (0.1°C)
      // Bytes 6-7: Status flags
      
      uint16_t voltage = (frame.data[0] << 8) | frame.data[1];
      uint16_t current = (frame.data[2] << 8) | frame.data[3];
      uint16_t temp = (frame.data[4] << 8) | frame.data[5];
      uint16_t flags = (frame.data[6] << 8) | frame.data[7];
      
      // Convert to actual values
      float voltageValue = voltage / 100.0f;  // Convert to V
      float currentValue = current / 100.0f;  // Convert to A
      float tempValue = temp / 10.0f;         // Convert to °C
      
      // Calculate power
      float powerValue = voltageValue * currentValue;
      
      // Apply calibration offset if configured
      voltageValue += sensorConfigs[i].calibrationOffset;
      
      // Calculate efficiency (simplified model)
      float idealPower = 1000.0 * 0.3;  // 300W for a 1m² panel at ideal conditions
      float efficiency = (powerValue / idealPower) * 100.0;
      if (efficiency > 100) efficiency = 100;
      
      // Update sensor data
      sensors[i].voltage = voltageValue;
      sensors[i].current = currentValue;
      sensors[i].power = powerValue;
      sensors[i].temperature = tempValue;
      sensors[i].efficiency = efficiency;
      sensors[i].lastUpdate = millis();
      
      // Determine status based on efficiency threshold
      if (efficiency < sensorConfigs[i].alertThreshold) {
        if (efficiency < 50) {
          sensors[i].status = "critical";
          sensors[i].alertCount++;
        } else {
          sensors[i].status = "warning";
        }
      } else {
        sensors[i].status = "optimal";
      }
      
      break;
    }
  }
  
  // Update system totals
  updateSystemTotals();
}

void updateSystemTotals() {
  float totalPower = 0;
  int onlineSensors = 0;
  float totalEfficiency = 0;
  
  for (int i = 0; i < MAX_SENSORS; i++) {
    if (sensorConfigs[i].enabled && sensors[i].status != "offline") {
      totalPower += sensors[i].power;
      totalEfficiency += sensors[i].efficiency;
      onlineSensors++;
    }
  }
  
  systemStatus.totalPower = totalPower;
  systemStatus.connectedSensors = onlineSensors;
  
  if (onlineSensors > 0) {
    systemStatus.systemEfficiency = totalEfficiency / onlineSensors;
  } else {
    systemStatus.systemEfficiency = 0;
  }
  
  // Update daily energy (simplified - in real application would track over time)
  static unsigned long lastEnergyUpdate = 0;
  unsigned long currentMillis = millis();
  
  if (lastEnergyUpdate > 0) {
    float hoursFraction = (currentMillis - lastEnergyUpdate) / 3600000.0;
    systemStatus.dailyEnergy += totalPower * hoursFraction;
  }
  
  lastEnergyUpdate = currentMillis;
  systemStatus.lastUpdate = getTimeString();
}

void simulateSensorReadings() {
  // For demo/testing only - simulates sensor readings
  
  // Update some environmental data
  systemStatus.ambientTemp = 20 + random(150) / 10.0;
  systemStatus.humidity = 30 + random(500) / 10.0;
  systemStatus.windSpeed = random(100) / 10.0;
  
  // Pick a weather state
  const char* weatherStates[] = {"sunny", "partly_cloudy", "cloudy", "rainy"};
  if (random(100) < 5) { // 5% chance to change weather
    systemStatus.weather = weatherStates[random(4)];
  }
  
  // Update each sensor with random but realistic values
  for (int i = 0; i < MAX_SENSORS; i++) {
    if (sensorConfigs[i].enabled) {
      // Base values with some randomness
      float baseVoltage = 36.0 + random(20) / 10.0;
      float baseCurrent = 8.0 + random(30) / 10.0;
      float baseTemp = systemStatus.ambientTemp + 10.0 + random(50) / 10.0;
      
      // Weather effects
      if (systemStatus.weather == "cloudy") {
        baseCurrent *= 0.7;
      } else if (systemStatus.weather == "rainy") {
        baseCurrent *= 0.4;
      } else if (systemStatus.weather == "partly_cloudy") {
        baseCurrent *= 0.85;
      }
      
      // Panel efficiency decreases with temperature
      float tempEffect = 1.0;
      if (baseTemp > 45) {
        tempEffect = 1.0 - ((baseTemp - 45) * 0.005);
      }
      
      // Set values
      sensors[i].voltage = baseVoltage;
      sensors[i].current = baseCurrent * tempEffect;
      sensors[i].power = sensors[i].voltage * sensors[i].current;
      sensors[i].temperature = baseTemp;
      
      // Calculate efficiency (simplified)
      sensors[i].efficiency = 85 + random(150) / 10.0 - (baseTemp - 25) * 0.3;
      if (sensors[i].efficiency > 100) sensors[i].efficiency = 100;
      if (sensors[i].efficiency < 0) sensors[i].efficiency = 0;
      
      // Set status based on efficiency
      if (sensors[i].efficiency < sensorConfigs[i].alertThreshold) {
        if (sensors[i].efficiency < 50) {
          sensors[i].status = "critical";
        } else {
          sensors[i].status = "warning";
        }
      } else {
        sensors[i].status = "optimal";
      }
      
      sensors[i].lastUpdate = millis();
    }
  }
  
  // Update system totals
  updateSystemTotals();
}

void sendSensorData() {
  ws.textAll(getSystemStatusJSON());
  ws.textAll(getSensorDataJSON());
  
  // Send individual alerts for critical panels
  for (int i = 0; i < MAX_SENSORS; i++) {
    if (sensorConfigs[i].enabled && sensors[i].status == "critical") {
      DynamicJsonDocument doc(256);
      doc["type"] = "alert";
      doc["sensorId"] = i;
      doc["status"] = "critical";
      doc["efficiency"] = sensors[i].efficiency;
      doc["temperature"] = sensors[i].temperature;
      
      String alertJson;
      serializeJson(doc, alertJson);
      ws.textAll(alertJson);
    }
  }
}

String getSystemStatusJSON() {
  DynamicJsonDocument doc(1024);
  doc["type"] = "system_status";
  doc["canBusStatus"] = systemStatus.canBusConnected ? "connected" : "disconnected";
  doc["connectedSensors"] = systemStatus.connectedSensors;
  doc["totalPower"] = systemStatus.totalPower;
  doc["dailyEnergy"] = systemStatus.dailyEnergy;
  doc["systemEfficiency"] = systemStatus.systemEfficiency;
  doc["ambientTemp"] = systemStatus.ambientTemp;
  doc["humidity"] = systemStatus.humidity;
  doc["windSpeed"] = systemStatus.windSpeed;
  doc["weather"] = systemStatus.weather;
  doc["lastUpdate"] = systemStatus.lastUpdate;
  
  String json;
  serializeJson(doc, json);
  return json;
}

String getSensorDataJSON() {
  DynamicJsonDocument doc(10240); // Larger doc for multiple sensors
  
  doc["type"] = "sensor_data";
  JsonArray sensorsArray = doc.createNestedArray("sensors");
  
  for (int i = 0; i < MAX_SENSORS; i++) {
    if (sensorConfigs[i].enabled) {
      JsonObject sensor = sensorsArray.createNestedObject();
      sensor["id"] = sensors[i].id;
      sensor["name"] = sensorConfigs[i].name;
      sensor["position"] = sensorConfigs[i].position;
      sensor["power"] = sensors[i].power;
      sensor["voltage"] = sensors[i].voltage;
      sensor["current"] = sensors[i].current;
      sensor["temperature"] = sensors[i].temperature;
      sensor["status"] = sensors[i].status;
      sensor["efficiency"] = sensors[i].efficiency;
    }
  }
  
  String json;
  serializeJson(doc, json);
  return json;
}

void loadConfiguration() {
  // In a real application, this would load from EEPROM
  // For this example, we'll just use defaults
  
  // CAN settings
  baudRate = 250000;
  protocol = "CAN 2.0B";
  terminationResistor = true;
  autoRetransmit = true;
  listenOnlyMode = false;
  
  // System settings
  sensorUpdateInterval = 3000;
  dataRetentionDays = 30;
  alertSensitivity = "medium";
  autoCalibration = true;
  
  // For a real application, this would load sensor configs from EEPROM
  // Here we'll set up some default sensors for demonstration
  for (int i = 0; i < MAX_SENSORS; i++) {
    // Only set up the first 10 sensors by default
    if (i < 10) {
      sensorConfigs[i].id = i;
      sensorConfigs[i].name = "Solar Panel " + String(i + 1);
      sensorConfigs[i].canId = "0x" + String(0x100 + i, HEX);
      sensorConfigs[i].position = "Panel " + String(floor(i / 10) + 1) + "-" + String((i % 10) + 1);
      sensorConfigs[i].enabled = true;
      sensorConfigs[i].calibrationOffset = 0;
      sensorConfigs[i].alertThreshold = 85;
    } else {
      sensorConfigs[i].id = i;
      sensorConfigs[i].name = "Solar Panel " + String(i + 1);
      sensorConfigs[i].canId = "0x" + String(0x100 + i, HEX);
      sensorConfigs[i].position = "Panel " + String(floor(i / 10) + 1) + "-" + String((i % 10) + 1);
      sensorConfigs[i].enabled = false; // Disabled by default
      sensorConfigs[i].calibrationOffset = 0;
      sensorConfigs[i].alertThreshold = 85;
    }
  }
}

void saveConfiguration() {
  // In a real application, this would save to EEPROM
  // For this example, we'll demonstrate the structure of what would be saved
  Serial.println("Configuration saved");
  
  // Example of how EEPROM storage would work:
  // First save a validation marker
  // EEPROM.write(CONFIG_START_ADDR, 0xAB); // Validation byte
  
  // Save CAN bus settings
  // EEPROM.put(CAN_SETTINGS_ADDR, baudRate);
  // writeString(CAN_SETTINGS_ADDR + 4, protocol);
  // EEPROM.write(CAN_SETTINGS_ADDR + 36, terminationResistor ? 1 : 0);
  // EEPROM.write(CAN_SETTINGS_ADDR + 37, autoRetransmit ? 1 : 0);
  // EEPROM.write(CAN_SETTINGS_ADDR + 38, listenOnlyMode ? 1 : 0);
  
  // Save system settings
  // EEPROM.put(SYSTEM_SETTINGS_ADDR, sensorUpdateInterval);
  // EEPROM.put(SYSTEM_SETTINGS_ADDR + 4, dataRetentionDays);
  // writeString(SYSTEM_SETTINGS_ADDR + 8, alertSensitivity);
  // EEPROM.write(SYSTEM_SETTINGS_ADDR + 40, autoCalibration ? 1 : 0);
  
  // Save sensor configurations - each sensor requires about 80 bytes
  // for (int i = 0; i < MAX_SENSORS; i++) {
  //   int baseAddr = SENSOR_SETTINGS_ADDR + (i * 80);
  //   EEPROM.put(baseAddr, sensorConfigs[i].id);
  //   writeString(baseAddr + 4, sensorConfigs[i].name);
  //   writeString(baseAddr + 36, sensorConfigs[i].canId);
  //   writeString(baseAddr + 48, sensorConfigs[i].position);
  //   EEPROM.write(baseAddr + 60, sensorConfigs[i].enabled ? 1 : 0);
  //   EEPROM.put(baseAddr + 64, sensorConfigs[i].calibrationOffset);
  //   EEPROM.put(baseAddr + 68, sensorConfigs[i].alertThreshold);
  // }
  
  // EEPROM.commit();
}

String getTimeString() {
  // In real application, would use NTP time
  // For now, return uptime in seconds
  return String(millis() / 1000) + "s";
}
