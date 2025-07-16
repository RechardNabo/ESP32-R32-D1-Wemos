/*
 * ESP32 Bridge Legacy to Modern IoT
 * 
 * This sketch creates a bridge between legacy industrial systems and modern IoT platforms
 * using the ESP32 as an intermediary gateway.
 */

// Include necessary libraries
#include <Arduino.h>
// For larger sketches, go to Tools > Partition Scheme > Minimal SPIFFS (1.9MB APP/190KB SPIFFS) in Arduino IDE
#include <WiFi.h>
#include <LittleFS.h>
#include <ESPAsyncWebServer.h>
#include <AsyncTCP.h>
#include <ArduinoJson.h>
#include <EEPROM.h>  // For persistent storage
#include <Update.h>  // For firmware updates
#include <PubSubClient.h> // For MQTT
#include <HTTPClient.h>   // For HTTP REST APIs
#include <ModbusMaster.h> // For Modbus RTU communication

// Optional Bluetooth functionality (uncomment to enable)
//#define BLUETOOTH_ENABLED

#ifdef BLUETOOTH_ENABLED
#include <BluetoothSerial.h>
  #if !defined(CONFIG_BT_ENABLED) || !defined(CONFIG_BLUEDROID_ENABLED)
  // Bluetooth is not enabled in the Arduino IDE, but we won't error out
  // Just disable the functionality
  #undef BLUETOOTH_ENABLED
  #endif
#endif

// Constants and global variables
const char* ssid = "ESP32_Bridge";
const char* password = "password123";
const int LED_PIN = 2;  // ESP32 built-in LED
const uint32_t connectTimeout = 10000;  // 10 seconds WiFi connection timeout
bool apMode = false;  // Track if running in AP mode

// Hardware serial ports for industrial protocols
#define MODBUS_SERIAL Serial2  // Using Serial2 for Modbus (GPIO 16,17)
#define MODBUS_BAUDRATE 9600
#define MODBUS_DE_RE_PIN 5     // For RS485 direction control

// Networking timeouts and retry settings
const int httpTimeout = 5000;  // 5 second HTTP timeout
const int mqttReconnectInterval = 5000;  // 5 seconds between MQTT reconnect attempts

// EEPROM configuration
#define EEPROM_SIZE 2048  // Size of EEPROM to use - increased to accommodate more settings

// Memory address mapping for configuration
#define CONFIG_START_ADDR 0
#define WIFI_OFFSET 0
#define NETWORK_OFFSET 100
#define DEVICE_OFFSET 200
#define MODBUS_OFFSET 300
#define MQTT_OFFSET 450
#define REST_API_OFFSET 600
#define PROTOCOL_BRIDGE_OFFSET 750
#define SECURITY_OFFSET 900
#define SYSTEM_OFFSET 1050
#define LOGGING_OFFSET 1200

// WiFi memory addresses
#define WIFI_VALID_ADDR (CONFIG_START_ADDR + WIFI_OFFSET)
#define WIFI_SSID_ADDR (WIFI_VALID_ADDR + 1)
#define WIFI_PASS_ADDR (WIFI_SSID_ADDR + 32)
#define WIFI_CHANNEL_ADDR (WIFI_PASS_ADDR + 64)

// Network memory addresses
#define NET_VALID_ADDR (CONFIG_START_ADDR + NETWORK_OFFSET)
#define NET_HOSTNAME_ADDR (NET_VALID_ADDR + 1)
#define NET_STATIC_ADDR (NET_HOSTNAME_ADDR + 32)
#define NET_IP_ADDR (NET_STATIC_ADDR + 1)
#define NET_GATEWAY_ADDR (NET_IP_ADDR + 16)
#define NET_SUBNET_ADDR (NET_GATEWAY_ADDR + 16)
#define NET_DNS_ADDR (NET_SUBNET_ADDR + 16)
#define NET_PORT_ADDR (NET_DNS_ADDR + 16)

// Device memory addresses
#define DEV_VALID_ADDR (CONFIG_START_ADDR + DEVICE_OFFSET)
#define DEV_NAME_ADDR (DEV_VALID_ADDR + 1)
#define DEV_LOCATION_ADDR (DEV_NAME_ADDR + 32)
#define DEV_DESC_ADDR (DEV_LOCATION_ADDR + 32)

// Modbus memory addresses
#define MODBUS_VALID_ADDR (CONFIG_START_ADDR + MODBUS_OFFSET)
#define MODBUS_ENABLED_ADDR (MODBUS_VALID_ADDR + 1)
#define MODBUS_BAUDRATE_ADDR (MODBUS_ENABLED_ADDR + 1)
#define MODBUS_PARITY_ADDR (MODBUS_BAUDRATE_ADDR + 4)
#define MODBUS_STOPBITS_ADDR (MODBUS_PARITY_ADDR + 1)
#define MODBUS_TIMEOUT_ADDR (MODBUS_STOPBITS_ADDR + 1)
#define MODBUS_SLAVE_ID_ADDR (MODBUS_TIMEOUT_ADDR + 4)
#define MODBUS_POLL_INTERVAL_ADDR (MODBUS_SLAVE_ID_ADDR + 1)
#define MODBUS_REGISTER_MAP_ADDR (MODBUS_POLL_INTERVAL_ADDR + 4)

// MQTT memory addresses
#define MQTT_VALID_ADDR (CONFIG_START_ADDR + MQTT_OFFSET)
#define MQTT_ENABLED_ADDR (MQTT_VALID_ADDR + 1)
#define MQTT_SERVER_ADDR (MQTT_ENABLED_ADDR + 1)
#define MQTT_PORT_ADDR (MQTT_SERVER_ADDR + 64)
#define MQTT_USERNAME_ADDR (MQTT_PORT_ADDR + 2)
#define MQTT_PASSWORD_ADDR (MQTT_USERNAME_ADDR + 32)
#define MQTT_CLIENT_ID_ADDR (MQTT_PASSWORD_ADDR + 32)
#define MQTT_TOPIC_PREFIX_ADDR (MQTT_CLIENT_ID_ADDR + 32)
#define MQTT_QOS_ADDR (MQTT_TOPIC_PREFIX_ADDR + 32)
#define MQTT_RETAIN_ADDR (MQTT_QOS_ADDR + 1)
#define MQTT_SECURE_ADDR (MQTT_RETAIN_ADDR + 1)

// REST API memory addresses
#define REST_VALID_ADDR (CONFIG_START_ADDR + REST_API_OFFSET)
#define REST_ENABLED_ADDR (REST_VALID_ADDR + 1)
#define REST_ENDPOINT_ADDR (REST_ENABLED_ADDR + 1)
#define REST_API_KEY_ADDR (REST_ENDPOINT_ADDR + 64)
#define REST_AUTH_TYPE_ADDR (REST_API_KEY_ADDR + 64)
#define REST_USERNAME_ADDR (REST_AUTH_TYPE_ADDR + 1)
#define REST_PASSWORD_ADDR (REST_USERNAME_ADDR + 32)
#define REST_HEADERS_ADDR (REST_PASSWORD_ADDR + 32)

// Protocol Bridge memory addresses
#define BRIDGE_VALID_ADDR (CONFIG_START_ADDR + PROTOCOL_BRIDGE_OFFSET)
#define BRIDGE_MODE_ADDR (BRIDGE_VALID_ADDR + 1)
#define BRIDGE_MAPPING_ADDR (BRIDGE_MODE_ADDR + 1)
#define BRIDGE_TRANSFORM_ADDR (BRIDGE_MAPPING_ADDR + 128)

// Security memory addresses
#define SECURITY_VALID_ADDR (CONFIG_START_ADDR + SECURITY_OFFSET)
#define SECURITY_ENCRYPTION_ADDR (SECURITY_VALID_ADDR + 1)
#define SECURITY_CERT_ADDR (SECURITY_ENCRYPTION_ADDR + 1)
#define SECURITY_KEY_ADDR (SECURITY_CERT_ADDR + 1)

// System memory addresses
#define SYSTEM_VALID_ADDR (CONFIG_START_ADDR + SYSTEM_OFFSET)
#define SYSTEM_AUTO_REBOOT_ADDR (SYSTEM_VALID_ADDR + 1)
#define SYSTEM_REBOOT_TIME_ADDR (SYSTEM_AUTO_REBOOT_ADDR + 1)
#define SYSTEM_WATCHDOG_ADDR (SYSTEM_REBOOT_TIME_ADDR + 6)

// Logging memory addresses
#define LOGGING_VALID_ADDR (CONFIG_START_ADDR + LOGGING_OFFSET)
#define LOGGING_LEVEL_ADDR (LOGGING_VALID_ADDR + 1)
#define LOGGING_REMOTE_ADDR (LOGGING_LEVEL_ADDR + 1)
#define LOGGING_SERVER_ADDR (LOGGING_REMOTE_ADDR + 1)

// Create AsyncWebServer object on port 80
AsyncWebServer server(80);

// Initialize MQTT client
WiFiClient espClient;
PubSubClient mqttClient(espClient);

// Initialize Modbus master
ModbusMaster modbus;

// Buffer for string construction to save memory
char buffer[128];

// Status tracking variables
bool modbusConnected = false;
bool mqttConnected = false;
bool apiConnected = false;

#ifdef BLUETOOTH_ENABLED
// Create BluetoothSerial instance
BluetoothSerial SerialBT;

// Bluetooth variables
bool btEnabled = false;
String btDeviceName = "ESP32_Bridge";
#endif

// Function prototypes
void setupWiFi();
void startAP();
void setupLittleFS();
void setupServer();
void setupModbus();
void setupMQTT();
void processModbusData();
void publishToMQTT(const JsonDocument& data);
void sendToRestAPI(const JsonDocument& data);
void handleMQTTCallback(char* topic, byte* payload, unsigned int length);
void reconnectMQTT();
void saveConfig(const JsonDocument& json);
bool loadConfig(JsonDocument& json);

// EEPROM helper functions
void writeString(int addr, const String &str);
String readString(int addr);
void writeUInt(int addr, unsigned int val);
unsigned int readUInt(int addr);
void writeBool(int addr, bool val);
bool readBool(int addr);

// JSON string constants to save program memory
const char STATUS_KEY[] PROGMEM = "status";
const char ERROR_MSG[] PROGMEM = "error";
const char SUCCESS_MSG[] PROGMEM = "success";
const char DATA_KEY[] PROGMEM = "data";
const char TIMESTAMP_KEY[] PROGMEM = "timestamp";

/**
 * Setup function - called once at startup
 */
void setup() {
  // Initialize serial for debugging
  Serial.begin(115200);
  Serial.println(F("\n\nESP32 Bridge Legacy to Modern IoT Starting..."));
  
  // Initialize built-in LED
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);
  
  // Initialize EEPROM
  EEPROM.begin(EEPROM_SIZE);
  
  // Set up LittleFS for web interface files
  setupLittleFS();
  
  // Connect to WiFi or start AP mode if unable to connect
  setupWiFi();
  
  // Set up web server for configuration interface
  setupServer();
  
  // Initialize Modbus connection
  setupModbus();
  
  // Initialize MQTT client
  setupMQTT();
  
#ifdef BLUETOOTH_ENABLED
  // Initialize Bluetooth if enabled
  SerialBT.begin(btDeviceName);
  Serial.println(F("Bluetooth Started! Ready to pair..."));
#endif

  // Indicate successful initialization
  digitalWrite(LED_PIN, HIGH);
  Serial.println(F("Initialization complete. Running main loop..."));
}

/**
 * Main loop function - called repeatedly
 */
void loop() {
  // Process any incoming MQTT messages
  if (mqttClient.connected()) {
    mqttClient.loop();
  } else if (mqttConnected) {
    // Attempt to reconnect to MQTT if connection was lost
    reconnectMQTT();
  }
  
  // Process Modbus data and forward to IoT platforms
  processModbusData();
  
#ifdef BLUETOOTH_ENABLED
  // Process any incoming Bluetooth commands
  if (SerialBT.available()) {
    handleBluetoothCommands();
  }
#endif

  // Add a small delay to prevent hogging the CPU
  delay(10);
}

/**
 * Setup WiFi connection
 */
void setupWiFi() {
  Serial.print(F("Connecting to WiFi"));
  
  // Load WiFi configuration if it exists
  DynamicJsonDocument json(512);
  bool hasConfig = loadConfig(json);
  
  if (hasConfig && readBool(WIFI_VALID_ADDR)) {
    String storedSSID = readString(WIFI_SSID_ADDR);
    String storedPassword = readString(WIFI_PASS_ADDR);
    
    // Only use stored credentials if they exist
    if (storedSSID.length() > 0) {
      WiFi.begin(storedSSID.c_str(), storedPassword.c_str());
      
      // Try to connect with timeout
      uint32_t startTime = millis();
      while (WiFi.status() != WL_CONNECTED && millis() - startTime < connectTimeout) {
        delay(500);
        Serial.print(".");
        digitalWrite(LED_PIN, !digitalRead(LED_PIN)); // Blink LED while connecting
      }
    }
  } else {
    // Use default credentials if no configuration exists
    WiFi.begin(ssid, password);
    
    // Try to connect with timeout
    uint32_t startTime = millis();
    while (WiFi.status() != WL_CONNECTED && millis() - startTime < connectTimeout) {
      delay(500);
      Serial.print(".");
      digitalWrite(LED_PIN, !digitalRead(LED_PIN)); // Blink LED while connecting
    }
  }
  
  Serial.println();
  
  // If connected to WiFi, print status information
  if (WiFi.status() == WL_CONNECTED) {
    apMode = false;
    Serial.print(F("Connected to WiFi! IP address: "));
    Serial.println(WiFi.localIP());
    digitalWrite(LED_PIN, HIGH);  // Turn on LED to indicate connection
  } else {
    // If unable to connect, start Access Point mode
    Serial.println(F("Unable to connect to WiFi. Starting AP mode..."));
    startAP();
  }
}

/**
 * Start ESP32 in Access Point mode for configuration
 */
void startAP() {
  Serial.println(F("Setting up Access Point..."));
  
  // Configure AP mode
  WiFi.softAP(ssid, password);
  apMode = true;
  
  // Print AP IP address
  IPAddress IP = WiFi.softAPIP();
  Serial.print(F("AP IP address: "));
  Serial.println(IP);
  
  // Set up DNS server to capture all DNS requests
  // This allows users to access the config page using any domain when connected to the AP
  // (Implementation would be added here in a complete solution)
  
  // Fast blink LED to indicate AP mode
  for (int i = 0; i < 10; i++) {
    digitalWrite(LED_PIN, HIGH);
    delay(100);
    digitalWrite(LED_PIN, LOW);
    delay(100);
  }
  digitalWrite(LED_PIN, HIGH);  // Keep LED on after blinking
}

/**
 * Setup LittleFS for web interface files
 */
void setupLittleFS() {
  if (!LittleFS.begin(true)) {
    Serial.println(F("An error occurred while mounting LittleFS"));
    return;
  }
  Serial.println(F("LittleFS mounted successfully"));
}

/**
 * Set up Modbus communication
 */
void setupModbus() {
  // Initialize the Modbus serial port
  MODBUS_SERIAL.begin(MODBUS_BAUDRATE, SERIAL_8N1);
  
  // Set up RS485 direction control pin if used
  pinMode(MODBUS_DE_RE_PIN, OUTPUT);
  digitalWrite(MODBUS_DE_RE_PIN, LOW);  // Default to receive mode
  
  // Initialize Modbus with slave ID
  modbus.begin(1, MODBUS_SERIAL);  // Default to slave ID 1, can be loaded from EEPROM
  
  // Preemptive callback for RS485 direction control
  modbus.preTransmission([]() {
    digitalWrite(MODBUS_DE_RE_PIN, HIGH);  // Set to transmit mode
  });
  
  modbus.postTransmission([]() {
    digitalWrite(MODBUS_DE_RE_PIN, LOW);  // Set back to receive mode
  });
  
  Serial.println(F("Modbus initialized"));
  modbusConnected = true;
}

/**
 * Setup MQTT client
 */
void setupMQTT() {
  // Load MQTT configuration if it exists
  DynamicJsonDocument json(512);
  bool hasConfig = loadConfig(json);
  
  if (hasConfig && readBool(MQTT_VALID_ADDR) && readBool(MQTT_ENABLED_ADDR)) {
    String mqttServer = readString(MQTT_SERVER_ADDR);
    int mqttPort = readUInt(MQTT_PORT_ADDR);
    
    // Only configure if server is specified
    if (mqttServer.length() > 0) {
      mqttClient.setServer(mqttServer.c_str(), mqttPort);
      mqttClient.setCallback(handleMQTTCallback);
      
      // Try to connect
      reconnectMQTT();
    } else {
      Serial.println(F("MQTT server not configured"));
    }
  } else {
    Serial.println(F("MQTT not enabled or configured"));
  }
}

/**
 * Process and forward Modbus data to IoT platforms
 */
void processModbusData() {
  static unsigned long lastPollTime = 0;
  unsigned int pollInterval = 5000; // Default 5 seconds
  
  // Try to load poll interval from EEPROM
  if (readBool(MODBUS_VALID_ADDR)) {
    pollInterval = readUInt(MODBUS_POLL_INTERVAL_ADDR);
    if (pollInterval < 1000) pollInterval = 1000; // Minimum 1 second
  }
  
  // Only poll at the configured interval
  if (millis() - lastPollTime < pollInterval) return;
  lastPollTime = millis();
  
  // Create JSON document for the data
  DynamicJsonDocument data(1024);
  
  // Add timestamp
  data[TIMESTAMP_KEY] = millis();
  
  // Example: Read holding registers from slave device
  uint8_t result = modbus.readHoldingRegisters(0, 10); // Read 10 registers starting from address 0
  
  if (result == modbus.ku8MBSuccess) {
    // Successfully read registers
    JsonArray registers = data.createNestedArray("registers");
    
    for (int i = 0; i < 10; i++) {
      registers.add(modbus.getResponseBuffer(i));
    }
    
    // Forward data to configured endpoints
    if (mqttConnected) {
      publishToMQTT(data);
    }
    
    // Forward to REST API if configured
    if (readBool(REST_VALID_ADDR) && readBool(REST_ENABLED_ADDR)) {
      sendToRestAPI(data);
    }
    
    // Fast blink LED once to indicate successful data transfer
    digitalWrite(LED_PIN, LOW);
    delay(50);
    digitalWrite(LED_PIN, HIGH);
  } else {
    // Error reading registers
    Serial.print(F("Modbus read error: "));
    Serial.println(result, HEX);
    
    // Slow blink LED twice to indicate error
    for (int i = 0; i < 2; i++) {
      digitalWrite(LED_PIN, LOW);
      delay(200);
      digitalWrite(LED_PIN, HIGH);
      delay(200);
    }
  }
}

/**
 * Publish data to MQTT broker
 */
void publishToMQTT(const JsonDocument& data) {
  if (!mqttClient.connected()) return;
  
  String topic = "esp32/bridge/data";
  
  // Use configured topic prefix if available
  if (readBool(MQTT_VALID_ADDR)) {
    String topicPrefix = readString(MQTT_TOPIC_PREFIX_ADDR);
    if (topicPrefix.length() > 0) {
      topic = topicPrefix + "/data";
    }
  }
  
  // Serialize JSON to string
  String jsonStr;
  serializeJson(data, jsonStr);
  
  // Publish to MQTT
  if (mqttClient.publish(topic.c_str(), jsonStr.c_str())) {
    Serial.println(F("Published to MQTT"));
  } else {
    Serial.println(F("Failed to publish to MQTT"));
  }
}

/**
 * Send data to REST API endpoint
 */
void sendToRestAPI(const JsonDocument& data) {
  // Only proceed if WiFi is connected
  if (WiFi.status() != WL_CONNECTED) return;
  
  String endpoint = readString(REST_ENDPOINT_ADDR);
  if (endpoint.length() == 0) return;
  
  // Initialize HTTP client
  HTTPClient http;
  http.begin(endpoint);
  http.addHeader("Content-Type", "application/json");
  
  // Add authorization if configured
  if (readBool(REST_AUTH_TYPE_ADDR)) {
    String username = readString(REST_USERNAME_ADDR);
    String password = readString(REST_PASSWORD_ADDR);
    
    if (username.length() > 0) {
      // Basic auth requires base64 encoding (simplified version)
      http.setAuthorization(username.c_str(), password.c_str());
    }
  }
  
  // Add API key if configured
  String apiKey = readString(REST_API_KEY_ADDR);
  if (apiKey.length() > 0) {
    http.addHeader("X-API-Key", apiKey);
  }
  
  // Serialize JSON to string
  String jsonStr;
  serializeJson(data, jsonStr);
  
  // POST request
  int httpResponseCode = http.POST(jsonStr);
  
  if (httpResponseCode > 0) {
    Serial.print(F("HTTP Response code: "));
    Serial.println(httpResponseCode);
  } else {
    Serial.print(F("HTTP Error: "));
    Serial.println(httpResponseCode);
  }
  
  // Free resources
  http.end();
}

/**
 * Handle incoming MQTT messages
 */
void handleMQTTCallback(char* topic, byte* payload, unsigned int length) {
  // Print incoming message for debugging
  Serial.print(F("Message arrived on topic: "));
  Serial.print(topic);
  Serial.print(F(". Message: "));
  
  String message;
  for (unsigned int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  Serial.println(message);
  
  // Parse incoming message if it's a command
  if (String(topic).endsWith("/command")) {
    DynamicJsonDocument doc(512);
    DeserializationError error = deserializeJson(doc, message);
    
    if (!error) {
      // Process command (implementation details would be added here)
      Serial.println(F("Processing command..."));
    }
  }
}

/**
 * Reconnect to MQTT broker
 */
void reconnectMQTT() {
  static unsigned long lastReconnectAttempt = 0;
  
  // Only attempt to reconnect at the specified interval
  if (millis() - lastReconnectAttempt < mqttReconnectInterval) return;
  
  lastReconnectAttempt = millis();
  Serial.println(F("Attempting MQTT connection..."));
  
  // Load MQTT configuration
  String clientId = readString(MQTT_CLIENT_ID_ADDR);
  if (clientId.length() == 0) {
    clientId = "ESP32Bridge-";
    clientId += String(random(0xffff), HEX);
  }
  
  String username = readString(MQTT_USERNAME_ADDR);
  String password = readString(MQTT_PASSWORD_ADDR);
  
  // Attempt to connect
  bool connected;
  if (username.length() > 0) {
    connected = mqttClient.connect(clientId.c_str(), username.c_str(), password.c_str());
  } else {
    connected = mqttClient.connect(clientId.c_str());
  }
  
  if (connected) {
    Serial.println(F("Connected to MQTT broker"));
    mqttConnected = true;
    
    // Subscribe to command topic
    String topicPrefix = readString(MQTT_TOPIC_PREFIX_ADDR);
    if (topicPrefix.length() == 0) topicPrefix = "esp32/bridge";
    
    String commandTopic = topicPrefix + "/command";
    mqttClient.subscribe(commandTopic.c_str());
  } else {
    Serial.print(F("Failed to connect to MQTT, rc="));
    Serial.println(mqttClient.state());
    mqttConnected = false;
  }
}

#ifdef BLUETOOTH_ENABLED
/**
 * Handle incoming Bluetooth commands
 */
void handleBluetoothCommands() {
  String btData = "";
  
  // Read all available data
  while (SerialBT.available()) {
    char c = SerialBT.read();
    btData += c;
    delay(2); // Small delay to allow buffer to fill
  }
  
  if (btData.length() > 0) {
    Serial.print(F("Received via BT: "));
    Serial.println(btData);
    
    // Process command (implementation details would be added here)
  }
}
#endif

/**
 * Set up web server routes
 */
void setupServer() {
  // Serve static files from LittleFS
  server.serveStatic("/", LittleFS, "/");
  
  // Define API endpoints
  server.on("/api/status", HTTP_GET, [](AsyncWebServerRequest *request) {
    DynamicJsonDocument doc(256);
    doc["wifi"] = WiFi.status() == WL_CONNECTED;
    doc["ap_mode"] = apMode;
    doc["modbus"] = modbusConnected;
    doc["mqtt"] = mqttConnected;
    doc["api"] = apiConnected;
    doc["uptime"] = millis();
    
    String response;
    serializeJson(doc, response);
    request->send(200, "application/json", response);
  });
  
  // Get configuration endpoint
  server.on("/api/config", HTTP_GET, [](AsyncWebServerRequest *request) {
    DynamicJsonDocument doc(2048);
    loadConfig(doc);
    
    String response;
    serializeJson(doc, response);
    request->send(200, "application/json", response);
  });
  
  // Save configuration endpoint
  server.on("/api/config", HTTP_POST, [](AsyncWebServerRequest *request) {
    request->send(200); // Acknowledge receipt
  }, NULL, [](AsyncWebServerRequest *request, uint8_t *data, size_t len, size_t index, size_t total) {
    DynamicJsonDocument doc(2048);
    DeserializationError error = deserializeJson(doc, (const char*)data, len);
    
    if (!error) {
      saveConfig(doc);
      request->send(200, "application/json", "{\"status\":\"success\"}");
    } else {
      request->send(400, "application/json", "{\"status\":\"error\",\"message\":\"Invalid JSON\"}");
    }
  });
  
  // Start the server
  server.begin();
  Serial.println(F("HTTP server started"));
}

/**
 * Save configuration to EEPROM
 */
void saveConfig(const JsonDocument& json) {
  // Implement saving all configuration sections to EEPROM
  // (This would be a lengthy implementation similar to the original Main.ino)
  Serial.println(F("Saving configuration to EEPROM"));
  
  // Example: Save WiFi settings
  if (json.containsKey("wifi")) {
    writeBool(WIFI_VALID_ADDR, true);
    writeString(WIFI_SSID_ADDR, json["wifi"]["ssid"].as<String>());
    writeString(WIFI_PASS_ADDR, json["wifi"]["password"].as<String>());
  }
  
  // Example: Save MQTT settings
  if (json.containsKey("mqtt")) {
    writeBool(MQTT_VALID_ADDR, true);
    writeBool(MQTT_ENABLED_ADDR, json["mqtt"]["enabled"].as<bool>());
    writeString(MQTT_SERVER_ADDR, json["mqtt"]["server"].as<String>());
    writeUInt(MQTT_PORT_ADDR, json["mqtt"]["port"].as<unsigned int>());
    writeString(MQTT_USERNAME_ADDR, json["mqtt"]["username"].as<String>());
    writeString(MQTT_PASSWORD_ADDR, json["mqtt"]["password"].as<String>());
  }
  
  EEPROM.commit();
}

/**
 * Load configuration from EEPROM
 */
bool loadConfig(JsonDocument& json) {
  // Implement loading all configuration sections from EEPROM
  // (This would be a lengthy implementation similar to the original Main.ino)
  bool hasConfig = false;
  
  // Create the root object if it doesn't exist
  JsonObject root = json.to<JsonObject>();
  
  // Example: Load WiFi settings
  if (readBool(WIFI_VALID_ADDR)) {
    JsonObject wifi = root.createNestedObject("wifi");
    wifi["ssid"] = readString(WIFI_SSID_ADDR);
    wifi["password"] = readString(WIFI_PASS_ADDR);
    hasConfig = true;
  }
  
  // Example: Load MQTT settings
  if (readBool(MQTT_VALID_ADDR)) {
    JsonObject mqtt = root.createNestedObject("mqtt");
    mqtt["enabled"] = readBool(MQTT_ENABLED_ADDR);
    mqtt["server"] = readString(MQTT_SERVER_ADDR);
    mqtt["port"] = readUInt(MQTT_PORT_ADDR);
    mqtt["username"] = readString(MQTT_USERNAME_ADDR);
    mqtt["password"] = readString(MQTT_PASSWORD_ADDR);
    mqtt["clientId"] = readString(MQTT_CLIENT_ID_ADDR);
    mqtt["topicPrefix"] = readString(MQTT_TOPIC_PREFIX_ADDR);
    hasConfig = true;
  }
  
  return hasConfig;
}

/**
 * Write a string to EEPROM
 */
void writeString(int addr, const String &str) {
  int len = str.length();
  // Store string length (1 byte) followed by string data
  EEPROM.write(addr, len);
  for (int i = 0; i < len; i++) {
    EEPROM.write(addr + 1 + i, str[i]);
  }
}

/**
 * Read a string from EEPROM
 */
String readString(int addr) {
  int len = EEPROM.read(addr);
  if (len > 64) len = 64; // Safety limit
  
  char data[65]; // +1 for null terminator
  for (int i = 0; i < len; i++) {
    data[i] = EEPROM.read(addr + 1 + i);
  }
  data[len] = '\0'; // Null terminate string
  
  return String(data);
}

/**
 * Write an unsigned int to EEPROM
 */
void writeUInt(int addr, unsigned int val) {
  // Store as 4 bytes
  EEPROM.write(addr, val & 0xFF);
  EEPROM.write(addr + 1, (val >> 8) & 0xFF);
  EEPROM.write(addr + 2, (val >> 16) & 0xFF);
  EEPROM.write(addr + 3, (val >> 24) & 0xFF);
}

/**
 * Read an unsigned int from EEPROM
 */
unsigned int readUInt(int addr) {
  // Read 4 bytes and combine
  return ((unsigned int)EEPROM.read(addr)) | 
         ((unsigned int)EEPROM.read(addr + 1) << 8) | 
         ((unsigned int)EEPROM.read(addr + 2) << 16) | 
         ((unsigned int)EEPROM.read(addr + 3) << 24);
}

/**
 * Write a boolean to EEPROM
 */
void writeBool(int addr, bool val) {
  EEPROM.write(addr, val ? 1 : 0);
}

/**
 * Read a boolean from EEPROM
 */
bool readBool(int addr) {
  return EEPROM.read(addr) == 1;
}