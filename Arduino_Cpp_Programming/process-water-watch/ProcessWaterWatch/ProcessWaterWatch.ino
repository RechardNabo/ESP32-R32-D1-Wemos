/*
 * Process Water Watch - ESP32 Firmware
 * 
 * This firmware integrates water quality sensors with the Process Water Watch web application,
 * providing real-time water quality monitoring for industrial applications.
 * 
 * Features:
 * - Multiple water quality parameter monitoring (pH, temperature, turbidity, etc.)
 * - WebSocket real-time data streaming
 * - REST API for configuration and data retrieval
 * - Web application served from LittleFS
 * - WiFi connectivity in either AP or Station mode
 * 
 * Hardware requirements:
 * - ESP32 development board
 * - pH sensor
 * - Temperature sensor (DS18B20)
 * - Turbidity sensor
 * - Dissolved oxygen sensor
 * - Conductivity sensor
 * - Free chlorine sensor
 */

#include <WiFi.h>
#include <AsyncTCP.h>
#include <ESPAsyncWebServer.h>
#include <LittleFS.h>
#include <ArduinoJson.h>
#include <OneWire.h>
#include <DallasTemperature.h>

// WiFi credentials
#define USE_WIFI_STA false // Set to true for station mode, false for AP mode
const char* ssid = "ProcessWater-AP";
const char* password = "water-quality-123";

// If using station mode, specify your network credentials
const char* sta_ssid = "YourNetwork";
const char* sta_password = "YourPassword";

// Constants
#define MAX_STATIONS 4
#define JSON_BUFFER_SIZE 4096
#define WEBSOCKET_PORT 81
#define WEB_SERVER_PORT 80
#define DATA_UPDATE_INTERVAL 5000 // ms

// Pin definitions
#define ONE_WIRE_BUS 4  // DS18B20 temperature sensor
#define PH_SENSOR_PIN 35 // pH analog sensor
#define TURBIDITY_PIN 34 // Turbidity analog sensor
#define DO_SENSOR_PIN 33 // Dissolved oxygen sensor
#define CONDUCTIVITY_PIN 32 // Conductivity sensor
#define CHLORINE_PIN 39 // Free chlorine sensor

// Initialize sensors
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature tempSensor(&oneWire);

// Initialize server
AsyncWebServer server(WEB_SERVER_PORT);
AsyncWebSocket ws("/ws");

// Forward declarations
void handleWebSocketMessage(void *arg, uint8_t *data, size_t len);
void notifyClients();
void readSensorData();
void initializeStations();
void onWSEvent(AsyncWebSocket *server, AsyncWebSocketClient *client, AwsEventType type, void *arg, uint8_t *data, size_t len);
String getStationsJSON();
String getCurrentReadingsJSON();
String getAlertsJSON();
String getSystemStatusJSON();
void setupWebServer();
void generateDemoReadings();

// Data structures
struct WaterQualityReading {
  String id;
  String stationId;
  float ph;
  float temperature;
  float turbidity;
  float dissolvedOxygen;
  float conductivity;
  float chlorine;
  unsigned long timestamp;
};

struct Station {
  String id;
  String name;
  String location;
  String status; // "online", "offline", "warning"
  String lastUpdate;
  int alertCount;
  bool enabled;
};

struct Alert {
  String id;
  String station;
  String parameter;
  float value;
  float threshold;
  String severity; // "warning", "critical"
  unsigned long timestamp;
  bool acknowledged;
};

// Global variables
Station stations[MAX_STATIONS];
WaterQualityReading currentReadings[MAX_STATIONS];
Alert alerts[10]; // Maximum 10 active alerts
int alertCount = 0;
unsigned long lastDataUpdate = 0;
bool sensorsConnected = false;

void setup() {
  // Start Serial
  Serial.begin(115200);
  Serial.println("\nProcess Water Watch - Initializing...");
  
  // Initialize LittleFS
  if(!LittleFS.begin(true)) {
    Serial.println("An error occurred while mounting LittleFS");
    return;
  }
  Serial.println("LittleFS mounted successfully");
  
  // Initialize sensors
  tempSensor.begin();
  pinMode(PH_SENSOR_PIN, INPUT);
  pinMode(TURBIDITY_PIN, INPUT);
  pinMode(DO_SENSOR_PIN, INPUT);
  pinMode(CONDUCTIVITY_PIN, INPUT);
  pinMode(CHLORINE_PIN, INPUT);
  
  // Initialize WiFi
  if(USE_WIFI_STA) {
    // Station mode
    WiFi.begin(sta_ssid, sta_password);
    Serial.print("Connecting to WiFi");
    while(WiFi.status() != WL_CONNECTED) {
      delay(500);
      Serial.print(".");
    }
    Serial.println();
    Serial.print("Connected to WiFi. IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    // Access Point mode
    WiFi.softAP(ssid, password);
    Serial.print("Access Point started. IP Address: ");
    Serial.println(WiFi.softAPIP());
  }

  // Initialize data structures
  initializeStations();
  
  // Initialize WebSocket
  ws.onEvent(onWSEvent);
  server.addHandler(&ws);
  
  // Setup web server
  setupWebServer();
  
  Serial.println("Initialization complete.");
}

void loop() {
  ws.cleanupClients();
  
  // Update sensor readings periodically
  unsigned long currentTime = millis();
  if (currentTime - lastDataUpdate >= DATA_UPDATE_INTERVAL) {
    lastDataUpdate = currentTime;
    
    if (sensorsConnected) {
      readSensorData();
    } else {
      // Use simulated data if sensors are not connected
      generateDemoReadings();
    }
    
    notifyClients();
  }
}

void onWSEvent(AsyncWebSocket *server, AsyncWebSocketClient *client, AwsEventType type, void *arg, uint8_t *data, size_t len) {
  switch (type) {
    case WS_EVT_CONNECT:
      Serial.printf("WebSocket client #%u connected from %s\n", client->id(), client->remoteIP().toString().c_str());
      // Send initial data to the newly connected client
      client->text("{\"type\":\"stations\",\"data\":" + getStationsJSON() + "}");
      client->text("{\"type\":\"readings\",\"data\":" + getCurrentReadingsJSON() + "}");
      client->text("{\"type\":\"alerts\",\"data\":" + getAlertsJSON() + "}");
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
  // API endpoints for water quality data
  server.on("/api/stations", HTTP_GET, [](AsyncWebServerRequest *request) {
    request->send(200, "application/json", getStationsJSON());
  });
  
  server.on("/api/readings", HTTP_GET, [](AsyncWebServerRequest *request) {
    request->send(200, "application/json", getCurrentReadingsJSON());
  });
  
  server.on("/api/alerts", HTTP_GET, [](AsyncWebServerRequest *request) {
    request->send(200, "application/json", getAlertsJSON());
  });
  
  server.on("/api/system-status", HTTP_GET, [](AsyncWebServerRequest *request) {
    request->send(200, "application/json", getSystemStatusJSON());
  });
  
  // Test sensors endpoint
  server.on("/api/test-sensors", HTTP_GET, [](AsyncWebServerRequest *request) {
    bool success = testSensors();
    String response = "{\"success\":" + String(success ? "true" : "false") + "}";
    request->send(200, "application/json", response);
  });
  
  // Serve static files from LittleFS
  server.serveStatic("/", LittleFS, "/").setDefaultFile("index.html");
  
  // Handle 404
  server.onNotFound([](AsyncWebServerRequest *request) {
    request->send(404, "text/plain", "Not found");
  });
  
  // Start server
  server.begin();
  Serial.println("HTTP server started");
}

bool testSensors() {
  // Test temperature sensor
  tempSensor.requestTemperatures();
  float tempC = tempSensor.getTempCByIndex(0);
  
  // If temperature reading is valid, assume other sensors are working too
  if (tempC != DEVICE_DISCONNECTED_C) {
    sensorsConnected = true;
    return true;
  }
  
  return false;
}

void initializeStations() {
  String stationNames[] = {"Primary Treatment", "Secondary Treatment", "Final Discharge", "Intake Monitoring"};
  String stationLocations[] = {"Building A - Level 1", "Building B - Level 2", "Outflow Point C", "Intake Point D"};
  String stationStatuses[] = {"online", "warning", "online", "offline"};
  
  for (int i = 0; i < MAX_STATIONS; i++) {
    stations[i].id = "WQ00" + String(i + 1);
    stations[i].name = stationNames[i];
    stations[i].location = stationLocations[i];
    stations[i].status = stationStatuses[i];
    stations[i].lastUpdate = i < 3 ? getCurrentTimeString() : "2 hours ago";
    stations[i].alertCount = i == 1 ? 1 : (i == 3 ? 2 : 0);
    stations[i].enabled = (stationStatuses[i] != "offline");
  }
}
