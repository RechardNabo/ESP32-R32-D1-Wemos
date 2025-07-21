/*
 * VibraGuardPredict.ino
 * ESP32 firmware for industrial equipment vibration monitoring
 * Integrates with the Vibra-Guard Predict web application
 */

#include <WiFi.h>
#include <ESPAsyncWebServer.h>
#include <AsyncTCP.h>
#include <ArduinoJson.h>
#include <SPIFFS.h>
#include <Wire.h>
 #include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>

// WiFi credentials
const char* wifi_ssid = "VibraGuardPredict";
const char* wifi_password = "vibration1234";
bool useStationMode = false; // Set to true to connect to existing WiFi instead of creating AP

// Station mode credentials (if useStationMode is true)
const char* station_ssid = "YourWiFi";
const char* station_password = "YourPassword";

// Web server and WebSocket
AsyncWebServer server(80);
AsyncWebSocket ws("/ws");

// MPU6050 accelerometer/gyroscope sensor
Adafruit_MPU6050 mpu;

// Maximum number of monitored equipment
#define MAX_EQUIPMENT 10

// Equipment data structures
struct EquipmentConfig {
  int id;
  String name;
  String location;
  float alertThreshold;
  float criticalThreshold;
  String lastMaintenance;
  String nextMaintenance;
  bool enabled;
};

struct EquipmentData {
  float vibrationLevel;
  float temperature;
  String status;  // "operational", "warning", "critical", "maintenance"
  float xAccel;
  float yAccel;
  float zAccel;
  float frequency;
  unsigned long lastUpdated;
};

// Equipment configurations and current data
EquipmentConfig equipmentConfigs[MAX_EQUIPMENT];
EquipmentData equipmentData[MAX_EQUIPMENT];

// System status
struct SystemStatus {
  bool isConnected;
  int activeEquipment;
  int alertCount;
  String firmwareVersion;
  String uptime;
  float systemTemperature;
  float batteryLevel;
  bool isSensorConnected;
  unsigned long startTime;
};

SystemStatus systemStatus;

// System configuration
unsigned long dataUpdateInterval = 5000; // in ms
bool autoAlertNotification = true;
String alertSensitivity = "medium";
int dataBufferSize = 100;

// Function declarations
void setupWiFi();
void setupMPU6050();
void setupSPIFFS();
void setupWebServer();
void setupWebSocket();
void onWebSocketEvent(AsyncWebSocket *server, AsyncWebSocketClient *client, 
                    AwsEventType type, void *arg, uint8_t *data, size_t len);
void handleWebSocketMessage(void *arg, uint8_t *data, size_t len);
String getSystemStatusJSON();
String getEquipmentDataJSON();
void readSensorData();
void updateEquipmentStatus();
void initializeEquipment();
void loadConfiguration();
void saveConfiguration();
String getStatusFromVibration(float vibration, float alertThreshold, float criticalThreshold);
String getTimeString();
void notifyClients();
bool testSensor();

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("Starting VibraGuard Predict...");
  
  // Initialize system status
  systemStatus.isConnected = false;
  systemStatus.activeEquipment = 0;
  systemStatus.alertCount = 0;
  systemStatus.firmwareVersion = "1.0.0";
  systemStatus.startTime = millis();
  systemStatus.systemTemperature = 0;
  systemStatus.batteryLevel = 100;
  systemStatus.isSensorConnected = false;
  
  // Initialize hardware and software components
  setupMPU6050();
  setupSPIFFS();
  initializeEquipment();
  loadConfiguration();
  setupWiFi();
  setupWebSocket();
  setupWebServer();
  
  Serial.println("VibraGuard Predict initialized and running!");
}

void loop() {
  static unsigned long lastUpdate = 0;
  static unsigned long uptimeTimer = 0;
  
  // Update sensor data at the specified interval
  if (millis() - lastUpdate > dataUpdateInterval) {
    readSensorData();
    updateEquipmentStatus();
    notifyClients();
    lastUpdate = millis();
  }
  
  // Update uptime every second
  if (millis() - uptimeTimer > 1000) {
    systemStatus.uptime = getTimeString();
    uptimeTimer = millis();
  }
}

void setupMPU6050() {
  Serial.println("Setting up MPU6050 sensor...");
  
  if (!mpu.begin()) {
    Serial.println("Failed to find MPU6050 chip");
    systemStatus.isSensorConnected = false;
  } else {
    Serial.println("MPU6050 sensor found!");
    
    // Set accelerometer range
    mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
    
    // Set gyro range
    mpu.setGyroRange(MPU6050_RANGE_500_DEG);
    
    // Set filter bandwidth
    mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);
    
    systemStatus.isSensorConnected = true;
  }
  
  delay(100);
}

void setupSPIFFS() {
  Serial.println("Mounting SPIFFS...");
  
  if (!SPIFFS.begin(true)) {
    Serial.println("An error occurred while mounting SPIFFS");
    return;
  }
  
  Serial.println("SPIFFS mounted successfully");
}

void setupWiFi() {
  if (useStationMode) {
    // Station mode - Connect to existing WiFi
    WiFi.mode(WIFI_STA);
    WiFi.begin(station_ssid, station_password);
    
    Serial.print("Connecting to WiFi...");
    
    // Wait for connection
    int connectionAttempts = 0;
    while (WiFi.status() != WL_CONNECTED && connectionAttempts < 20) {
      delay(500);
      Serial.print(".");
      connectionAttempts++;
    }
    
    if (WiFi.status() == WL_CONNECTED) {
      Serial.println("");
      Serial.print("Connected to WiFi network with IP Address: ");
      Serial.println(WiFi.localIP());
      systemStatus.isConnected = true;
    } else {
      Serial.println("");
      Serial.println("Failed to connect to WiFi. Starting AP mode instead.");
      useStationMode = false;
      setupWiFi(); // Retry with AP mode
    }
  } else {
    // Access Point mode
    WiFi.mode(WIFI_AP);
    WiFi.softAP(wifi_ssid, wifi_password);
    
    IPAddress IP = WiFi.softAPIP();
    Serial.print("AP Mode. IP Address: ");
    Serial.println(IP);
    systemStatus.isConnected = true;
  }
}

void setupWebSocket() {
  ws.onEvent(onWebSocketEvent);
  server.addHandler(&ws);
  
  Serial.println("WebSocket server started");
}

void onWebSocketEvent(AsyncWebSocket *server, AsyncWebSocketClient *client, 
                    AwsEventType type, void *arg, uint8_t *data, size_t len) {
  switch (type) {
    case WS_EVT_CONNECT:
      Serial.printf("WebSocket client #%u connected from %s\n", client->id(), client->remoteIP().toString().c_str());
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
}

void setupWebServer() {
  // API endpoints for equipment data and system status
  server.on("/api/system-status", HTTP_GET, [](AsyncWebServerRequest *request) {
    request->send(200, "application/json", getSystemStatusJSON());
  });
  
  server.on("/api/equipment-data", HTTP_GET, [](AsyncWebServerRequest *request) {
    request->send(200, "application/json", getEquipmentDataJSON());
  });
  
  // API endpoint for configuration
  server.on("/api/config", HTTP_GET, [](AsyncWebServerRequest *request) {
    DynamicJsonDocument doc(4096);
    
    // System settings
    JsonObject sysConfig = doc.createNestedObject("system");
    sysConfig["dataUpdateInterval"] = dataUpdateInterval;
    sysConfig["autoAlertNotification"] = autoAlertNotification;
    sysConfig["alertSensitivity"] = alertSensitivity;
    sysConfig["dataBufferSize"] = dataBufferSize;
    
    // Equipment configurations
    JsonArray equipArray = doc.createNestedArray("equipment");
    for (int i = 0; i < MAX_EQUIPMENT; i++) {
      JsonObject equip = equipArray.createNestedObject();
      equip["id"] = equipmentConfigs[i].id;
      equip["name"] = equipmentConfigs[i].name;
      equip["location"] = equipmentConfigs[i].location;
      equip["alertThreshold"] = equipmentConfigs[i].alertThreshold;
      equip["criticalThreshold"] = equipmentConfigs[i].criticalThreshold;
      equip["lastMaintenance"] = equipmentConfigs[i].lastMaintenance;
      equip["nextMaintenance"] = equipmentConfigs[i].nextMaintenance;
      equip["enabled"] = equipmentConfigs[i].enabled;
    }
    
    String response;
    serializeJson(doc, response);
    request->send(200, "application/json", response);
  });
  
  // Handle configuration updates
  server.on("/api/config", HTTP_POST, [](AsyncWebServerRequest *request) {
    request->send(200); // Acknowledge receipt
  }, NULL, [](AsyncWebServerRequest *request, uint8_t *data, size_t len, size_t index, size_t total) {
    DynamicJsonDocument doc(4096);
    deserializeJson(doc, (const char*)data, len);
    
    if (doc.containsKey("system")) {
      JsonObject sysConfig = doc["system"];
      
      if (sysConfig.containsKey("dataUpdateInterval")) {
        dataUpdateInterval = sysConfig["dataUpdateInterval"];
      }
      
      if (sysConfig.containsKey("autoAlertNotification")) {
        autoAlertNotification = sysConfig["autoAlertNotification"];
      }
      
      if (sysConfig.containsKey("alertSensitivity")) {
        alertSensitivity = sysConfig["alertSensitivity"].as<String>();
      }
      
      if (sysConfig.containsKey("dataBufferSize")) {
        dataBufferSize = sysConfig["dataBufferSize"];
      }
    }
    
    if (doc.containsKey("equipment") && doc["equipment"].is<JsonArray>()) {
      JsonArray equipArray = doc["equipment"];
      
      for (JsonObject equip : equipArray) {
        if (equip.containsKey("id")) {
          int id = equip["id"];
          
          if (id >= 0 && id < MAX_EQUIPMENT) {
            if (equip.containsKey("name")) {
              equipmentConfigs[id].name = equip["name"].as<String>();
            }
            
            if (equip.containsKey("location")) {
              equipmentConfigs[id].location = equip["location"].as<String>();
            }
            
            if (equip.containsKey("alertThreshold")) {
              equipmentConfigs[id].alertThreshold = equip["alertThreshold"];
            }
            
            if (equip.containsKey("criticalThreshold")) {
              equipmentConfigs[id].criticalThreshold = equip["criticalThreshold"];
            }
            
            if (equip.containsKey("lastMaintenance")) {
              equipmentConfigs[id].lastMaintenance = equip["lastMaintenance"].as<String>();
            }
            
            if (equip.containsKey("nextMaintenance")) {
              equipmentConfigs[id].nextMaintenance = equip["nextMaintenance"].as<String>();
            }
            
            if (equip.containsKey("enabled")) {
              equipmentConfigs[id].enabled = equip["enabled"];
            }
          }
        }
      }
    }
    
    saveConfiguration();
    request->send(200, "text/plain", "Configuration updated");
  });

  // API endpoint for equipment management
  server.on("/api/equipment", HTTP_GET, [](AsyncWebServerRequest *request) {
    DynamicJsonDocument doc(4096);
    JsonArray equipArray = doc.createNestedArray("equipment");
    
    // Check if a specific equipment ID was requested
    if (request->hasParam("id")) {
      int equipId = request->getParam("id")->value().toInt();
      
      if (equipId >= 0 && equipId < MAX_EQUIPMENT) {
        JsonObject equip = equipArray.createNestedObject();
        equip["id"] = equipmentConfigs[equipId].id;
        equip["name"] = equipmentConfigs[equipId].name;
        equip["location"] = equipmentConfigs[equipId].location;
        equip["alertThreshold"] = equipmentConfigs[equipId].alertThreshold;
        equip["criticalThreshold"] = equipmentConfigs[equipId].criticalThreshold;
        equip["lastMaintenance"] = equipmentConfigs[equipId].lastMaintenance;
        equip["nextMaintenance"] = equipmentConfigs[equipId].nextMaintenance;
        equip["enabled"] = equipmentConfigs[equipId].enabled;
        
        // Add current data if available
        if (equipmentConfigs[equipId].enabled) {
          equip["vibrationLevel"] = equipmentData[equipId].vibrationLevel;
          equip["temperature"] = equipmentData[equipId].temperature;
          equip["status"] = equipmentData[equipId].status;
          equip["frequency"] = equipmentData[equipId].frequency;
        }
      }
    } else {
      // Return all equipment or filter by enabled status
      bool onlyEnabled = request->hasParam("enabled") && 
                        request->getParam("enabled")->value() == "true";
                        
      for (int i = 0; i < MAX_EQUIPMENT; i++) {
        if (!onlyEnabled || equipmentConfigs[i].enabled) {
          JsonObject equip = equipArray.createNestedObject();
          equip["id"] = equipmentConfigs[i].id;
          equip["name"] = equipmentConfigs[i].name;
          equip["location"] = equipmentConfigs[i].location;
          equip["alertThreshold"] = equipmentConfigs[i].alertThreshold;
          equip["criticalThreshold"] = equipmentConfigs[i].criticalThreshold;
          equip["lastMaintenance"] = equipmentConfigs[i].lastMaintenance;
          equip["nextMaintenance"] = equipmentConfigs[i].nextMaintenance;
          equip["enabled"] = equipmentConfigs[i].enabled;
          
          // Add current data if available
          if (equipmentConfigs[i].enabled) {
            equip["vibrationLevel"] = equipmentData[i].vibrationLevel;
            equip["temperature"] = equipmentData[i].temperature;
            equip["status"] = equipmentData[i].status;
            equip["frequency"] = equipmentData[i].frequency;
          }
        }
      }
    }
    
    String response;
    serializeJson(doc, response);
    request->send(200, "application/json", response);
  });
  
  // API endpoint for test sensor
  server.on("/api/test-sensor", HTTP_GET, [](AsyncWebServerRequest *request) {
    bool success = testSensor();
    String response = "{\"success\":" + String(success ? "true" : "false") + "}";
    request->send(200, "application/json", response);
  });
  
  // Serve static files from SPIFFS
  server.serveStatic("/", SPIFFS, "/").setDefaultFile("index.html");
  
  // Start server
  server.begin();
  Serial.println("Web server started");
}
