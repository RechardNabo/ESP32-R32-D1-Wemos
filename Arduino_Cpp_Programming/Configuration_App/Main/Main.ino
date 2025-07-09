/*
 * ESP32 Arduino Main Sketch with Web Server and LittleFS
 * 
 * This sketch serves web pages from LittleFS and provides a basic API
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
#ifdef BLUETOOTH_ENABLED
#include <BluetoothSerial.h>
#endif

// Define whether to enable Bluetooth (uncomment to enable)
//#define BLUETOOTH_ENABLED

#ifdef BLUETOOTH_ENABLED
  #if !defined(CONFIG_BT_ENABLED) || !defined(CONFIG_BLUEDROID_ENABLED)
  // Bluetooth is not enabled in the Arduino IDE, but we won't error out
  // Just disable the functionality
  #undef BLUETOOTH_ENABLED
  #endif
#endif

// Constants and global variables
const char* ssid = "ESP32_Config";
const char* password = "password123";
const int LED_PIN = 2;  // ESP32 built-in LED
const uint32_t connectTimeout = 10000;  // 10 seconds WiFi connection timeout
bool apMode = false;  // Track if running in AP mode

// EEPROM configuration
#define EEPROM_SIZE 2048  // Size of EEPROM to use - increased to accommodate more settings

// Memory address mapping for configuration
#define CONFIG_START_ADDR 0
#define WIFI_OFFSET 0
#define NETWORK_OFFSET 100
#define DEVICE_OFFSET 200
#define BT_OFFSET 300
#define GPIO_OFFSET 400
#define SENSORS_OFFSET 550
#define SECURITY_OFFSET 700
#define SYSTEM_OFFSET 850
#define MONITORING_OFFSET 1000
#define CONNECTIVITY_OFFSET 1150

// WIFI memory addresses
#define WIFI_VALID_ADDR (CONFIG_START_ADDR + WIFI_OFFSET)
#define WIFI_SSID_ADDR (WIFI_VALID_ADDR + 1)
#define WIFI_PASS_ADDR (WIFI_SSID_ADDR + 32)
#define WIFI_CHANNEL_ADDR (WIFI_PASS_ADDR + 64)

// Network memory addresses
#define NET_VALID_ADDR (CONFIG_START_ADDR + NETWORK_OFFSET)
#define NET_HOSTNAME_ADDR (NET_VALID_ADDR + 1)
#define NET_STATIC_ADDR (NET_HOSTNAME_ADDR + 32)
#define NET_IP_ADDR (NET_STATIC_ADDR + 1)
#define NET_PORT_ADDR (NET_IP_ADDR + 16)

// Device memory addresses
#define DEV_VALID_ADDR (CONFIG_START_ADDR + DEVICE_OFFSET)
#define DEV_NAME_ADDR (DEV_VALID_ADDR + 1)
#define DEV_CPU_ADDR (DEV_NAME_ADDR + 32)
#define DEV_SLEEP_ADDR (DEV_CPU_ADDR + 4)

// Bluetooth memory addresses
#define BT_VALID_ADDR (CONFIG_START_ADDR + BT_OFFSET)
#define BT_ENABLED_ADDR (BT_VALID_ADDR + 1)
#define BT_NAME_ADDR (BT_ENABLED_ADDR + 1)

// GPIO memory addresses
#define GPIO_VALID_ADDR (CONFIG_START_ADDR + GPIO_OFFSET)
#define GPIO_PIN2_ADDR (GPIO_VALID_ADDR + 1)
#define GPIO_PIN4_ADDR (GPIO_PIN2_ADDR + 8)
#define GPIO_PIN5_ADDR (GPIO_PIN4_ADDR + 8)
#define GPIO_PIN18_ADDR (GPIO_PIN5_ADDR + 8)
#define GPIO_PIN19_ADDR (GPIO_PIN18_ADDR + 8)
#define GPIO_PIN21_ADDR (GPIO_PIN19_ADDR + 8)
#define GPIO_PIN22_ADDR (GPIO_PIN21_ADDR + 8)
#define GPIO_PIN23_ADDR (GPIO_PIN22_ADDR + 8)
#define GPIO_PIN25_ADDR (GPIO_PIN23_ADDR + 8)
#define GPIO_PIN26_ADDR (GPIO_PIN25_ADDR + 8)
#define GPIO_PIN27_ADDR (GPIO_PIN26_ADDR + 8)
#define GPIO_PIN32_ADDR (GPIO_PIN27_ADDR + 8)
#define GPIO_PIN33_ADDR (GPIO_PIN32_ADDR + 8)

// Sensors memory addresses
#define SENSORS_VALID_ADDR (CONFIG_START_ADDR + SENSORS_OFFSET)
#define SENSORS_TEMP_ADDR (SENSORS_VALID_ADDR + 1)
#define SENSORS_HUMID_ADDR (SENSORS_TEMP_ADDR + 1)
#define SENSORS_PRESS_ADDR (SENSORS_HUMID_ADDR + 1)
#define SENSORS_MOTION_ADDR (SENSORS_PRESS_ADDR + 1)
#define SENSORS_LIGHT_ADDR (SENSORS_MOTION_ADDR + 1)
#define SENSORS_SOUND_ADDR (SENSORS_LIGHT_ADDR + 1)
#define SENSORS_ACCEL_ADDR (SENSORS_SOUND_ADDR + 1)
#define SENSORS_GYRO_ADDR (SENSORS_ACCEL_ADDR + 1)
#define SENSORS_MAG_ADDR (SENSORS_GYRO_ADDR + 1)
#define SENSORS_GPS_ADDR (SENSORS_MAG_ADDR + 1)

// Security memory addresses
#define SECURITY_VALID_ADDR (CONFIG_START_ADDR + SECURITY_OFFSET)
#define SECURITY_AUTH_ADDR (SECURITY_VALID_ADDR + 1)
#define SECURITY_USERNAME_ADDR (SECURITY_AUTH_ADDR + 1)
#define SECURITY_PASSWORD_ADDR (SECURITY_USERNAME_ADDR + 32)
#define SECURITY_HTTPS_ADDR (SECURITY_PASSWORD_ADDR + 32)
#define SECURITY_APIKEY_ADDR (SECURITY_HTTPS_ADDR + 1)
#define SECURITY_FIREWALL_ADDR (SECURITY_APIKEY_ADDR + 32)
#define SECURITY_RATE_LIMITING_ADDR (SECURITY_FIREWALL_ADDR + 1)
#define SECURITY_MAX_REQUESTS_ADDR (SECURITY_RATE_LIMITING_ADDR + 1)

// System memory addresses
#define SYSTEM_VALID_ADDR (CONFIG_START_ADDR + SYSTEM_OFFSET)
#define SYSTEM_AUTO_REBOOT_ADDR (SYSTEM_VALID_ADDR + 1)
#define SYSTEM_REBOOT_TIME_ADDR (SYSTEM_AUTO_REBOOT_ADDR + 1)
#define SYSTEM_LOG_LEVEL_ADDR (SYSTEM_REBOOT_TIME_ADDR + 16)
#define SYSTEM_ENABLE_OTA_ADDR (SYSTEM_LOG_LEVEL_ADDR + 8)
#define SYSTEM_ENABLE_TELNET_ADDR (SYSTEM_ENABLE_OTA_ADDR + 1)
#define SYSTEM_ENABLE_SERIAL_ADDR (SYSTEM_ENABLE_TELNET_ADDR + 1)
#define SYSTEM_WATCHDOG_ADDR (SYSTEM_ENABLE_SERIAL_ADDR + 1)
#define SYSTEM_MEMORY_MONITORING_ADDR (SYSTEM_WATCHDOG_ADDR + 1)
#define SYSTEM_TEMP_MONITORING_ADDR (SYSTEM_MEMORY_MONITORING_ADDR + 1)
#define SYSTEM_PERFORMANCE_ADDR (SYSTEM_TEMP_MONITORING_ADDR + 1)
#define SYSTEM_BOOT_MODE_ADDR (SYSTEM_PERFORMANCE_ADDR + 8)

// Monitoring memory addresses
#define MONITORING_VALID_ADDR (CONFIG_START_ADDR + MONITORING_OFFSET)
#define MONITORING_METRICS_ADDR (MONITORING_VALID_ADDR + 1)
#define MONITORING_INTERVAL_ADDR (MONITORING_METRICS_ADDR + 1)
#define MONITORING_ALERTS_ADDR (MONITORING_INTERVAL_ADDR + 4)
#define MONITORING_TEMP_THRESHOLD_ADDR (MONITORING_ALERTS_ADDR + 1)
#define MONITORING_MEM_THRESHOLD_ADDR (MONITORING_TEMP_THRESHOLD_ADDR + 4)
#define MONITORING_UPTIME_REPORTING_ADDR (MONITORING_MEM_THRESHOLD_ADDR + 4)
#define MONITORING_ERROR_REPORTING_ADDR (MONITORING_UPTIME_REPORTING_ADDR + 1)
#define MONITORING_REMOTE_LOGGING_ADDR (MONITORING_ERROR_REPORTING_ADDR + 1)
#define MONITORING_LOG_SERVER_ADDR (MONITORING_REMOTE_LOGGING_ADDR + 1)

// Additional Connectivity memory addresses
#define CONN_VALID_ADDR (CONFIG_START_ADDR + CONNECTIVITY_OFFSET)
#define CONN_BLE_ADDR (CONN_VALID_ADDR + 1)
#define CONN_ETHERNET_ADDR (CONN_BLE_ADDR + 1)
#define CONN_CAN_ADDR (CONN_ETHERNET_ADDR + 1)
#define CONN_CAN_BITRATE_ADDR (CONN_CAN_ADDR + 1)
#define CONN_I2C_ADDR (CONN_CAN_BITRATE_ADDR + 4)
#define CONN_I2C_FREQ_ADDR (CONN_I2C_ADDR + 1)
#define CONN_SPI_ADDR (CONN_I2C_FREQ_ADDR + 4)
#define CONN_SPI_FREQ_ADDR (CONN_SPI_ADDR + 1)

// Use PROGMEM to store strings in flash memory rather than RAM
const char JSON_CONTENT_TYPE[] PROGMEM = "application/json";
const char STATUS_KEY[] PROGMEM = "status";
const char ERROR_MSG[] PROGMEM = "error";
const char SUCCESS_MSG[] PROGMEM = "success";

// Create AsyncWebServer object on port 80
AsyncWebServer server(80);

// Function prototypes
void setupWiFi();
void startAP();
void setupLittleFS();
void setupServer();
void saveConfig(const JsonDocument& json);
bool loadConfig(JsonDocument& json);

// EEPROM helper functions
void writeString(int addr, const String &str);
String readString(int addr);
void writeUInt(int addr, unsigned int val);
unsigned int readUInt(int addr);
void writeBool(int addr, bool val);
bool readBool(int addr);

// Buffer for string construction to save memory
char buffer[64];

#ifdef BLUETOOTH_ENABLED
// Create BluetoothSerial instance
BluetoothSerial SerialBT;

// Bluetooth variables
bool btEnabled = false;
String btDeviceName = "ESP32_Config";
String btBuffer = "";
String connectedBtDevices = "[]";
bool scanning = false;

void setupBluetooth() {
  Serial.println("Bluetooth ready");
}

void handleBluetooth() {
  if (SerialBT.available()) {
    char inChar = SerialBT.read();
    btBuffer += inChar;
    if (inChar == '\n') {
      btBuffer.trim();
      SerialBT.print("Echo: ");
      SerialBT.println(btBuffer);
      btBuffer = "";
    }
  }
}

void startBluetoothScan() {
  if (!btEnabled) return;
  scanning = true;
  delay(1000); // Simulate scan
  // Simplified mock device list
  connectedBtDevices = "[{\"name\":\"BT_Device\"}]";
  scanning = false;
}
#endif

void setup() {
  // Initialize serial communication
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);
  
  // Initialize EEPROM
  EEPROM.begin(EEPROM_SIZE);
  
  // Check for config mode button press (or other condition to force AP mode)
  // For now, let's use a fixed delay with option to force AP mode by pressing reset button
  // and watching serial monitor to interrupt normal flow
  
  Serial.println();
  Serial.println("ESP32 Configuration startup");
  Serial.println("Press any key in the next 3 seconds to enter AP mode...");
  
  // Wait for 3 seconds to see if user wants to force AP mode
  bool forceAP = false;
  unsigned long startTime = millis();
  while (millis() - startTime < 3000) {
    if (Serial.available()) {
      forceAP = true;
      while (Serial.available()) Serial.read(); // Clear buffer
      break;
    }
    // Blink LED to indicate waiting for input
    digitalWrite(LED_PIN, (millis() - startTime) % 500 < 250);
    delay(50);
  }
  
  if (forceAP) {
    // User requested AP mode
    Serial.println("Forcing AP mode for configuration");
    startAP();
  } else {
    // Normal startup - try to connect to WiFi first
    Serial.println("Normal startup - connecting to WiFi");
    setupWiFi();
  }
  
  // Initialize LittleFS
  setupLittleFS();
  
  #ifdef BLUETOOTH_ENABLED
  // Initialize Bluetooth if enabled
  setupBluetooth();
  #endif
  
  // Setup web server
  setupServer();
  
  Serial.println("Server ready");
  if (apMode) {
    Serial.println("====================================");
    Serial.println("RUNNING IN ACCESS POINT MODE");
    Serial.println("Connect to WiFi network: " + String(ssid));
    Serial.println("Password: " + String(password));
    Serial.println("Then access the web interface at: http://192.168.4.1");
    Serial.println("====================================");
  }
}

void loop() {
  // LittleFS and AsyncWebServer handle requests automatically
  
  #ifdef BLUETOOTH_ENABLED
  // Handle Bluetooth communication if enabled
  if (btEnabled) {
    handleBluetooth();
  }
  #endif
  
  // Blink LED to indicate system is alive
  digitalWrite(LED_PIN, HIGH);
  delay(500);
  digitalWrite(LED_PIN, LOW);
  delay(500);
}

// Connect to WiFi network
void setupWiFi() {
  // Check if we have valid WiFi config in EEPROM
  bool validWiFi = readBool(WIFI_VALID_ADDR);
  
  if (validWiFi) {
    // Try to load WiFi credentials from EEPROM
    String savedSsid = readString(WIFI_SSID_ADDR);
    String savedPass = readString(WIFI_PASS_ADDR);
    
    if (savedSsid.length() > 0) {
      Serial.print("Connecting to saved WiFi: ");
      Serial.println(savedSsid);
      WiFi.begin(savedSsid.c_str(), savedPass.c_str());
    } else {
      // Fall back to default credentials
      Serial.print("Connecting to default WiFi: ");
      Serial.println(ssid);
      WiFi.begin(ssid, password);
    }
  } else {
    // Use default credentials
    Serial.print("No saved WiFi config. Connecting to default: ");
    Serial.println(ssid);
    WiFi.begin(ssid, password);
  }
  
  WiFi.setAutoReconnect(true);

  // Wait for connection
  uint32_t startTime = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - startTime < connectTimeout) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();

  // Check if connected
  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("Connected! IP address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("WiFi connection failed!");
    // Start access point instead
    startAP();
  }
}

// Start Access Point mode for configuration
void startAP() {
  Serial.println("Starting AP mode for configuration");
  
  // Disconnect from any existing WiFi connection
  WiFi.disconnect();
  
  // Read network settings from EEPROM to get hostname if available
  String hostname = "esp32-config";
  bool validNetwork = readBool(NET_VALID_ADDR);
  if (validNetwork) {
    String savedHostname = readString(NET_HOSTNAME_ADDR);
    if (savedHostname.length() > 0) {
      hostname = savedHostname;
    }
  }
  
  // Set hostname for AP mode
  WiFi.setHostname(hostname.c_str());
  
  // Configure AP - Channel 1, Open network (no hidden SSID), Max 4 connections
  bool success = WiFi.softAP(ssid, password, 1, 0, 4);
  
  if (success) {
    // Default IP is 192.168.4.1
    Serial.print("AP started. Name: ");
    Serial.print(ssid);
    Serial.print(" | IP address: ");
    Serial.println(WiFi.softAPIP());
    
    // Configure DNS to capture all domains
    // This makes the captive portal work by redirecting all web requests to the ESP32
    // Not implementing full captive portal here, but this improves the user experience
    
    apMode = true; // Set the global flag that we're in AP mode
    
    // Blink LED twice to indicate AP mode is active
    for (int i = 0; i < 2; i++) {
      digitalWrite(LED_PIN, HIGH);
      delay(100);
      digitalWrite(LED_PIN, LOW);
      delay(100);
    }
  } else {
    Serial.println("Failed to start AP mode!");
  }
}

// Initialize LittleFS
void setupLittleFS() {
  if (!LittleFS.begin(true)) { // Use true to format filesystem if mounting fails
    Serial.println("LittleFS mount failed");
    delay(1000);
    
    // Try again without formatting
    if (!LittleFS.begin(false)) {
      Serial.println("Second attempt failed. File system might be corrupted.");
      return;
    }
  }
  
  Serial.println("LittleFS mounted successfully");
  
  // Check if index.html exists
  if (LittleFS.exists("/index.html")) {
    Serial.println("index.html found in filesystem");
    File file = LittleFS.open("/index.html", "r");
    Serial.print("index.html size: ");
    Serial.println(file.size());
    file.close();
  } else {
    Serial.println("WARNING: index.html NOT FOUND in filesystem!");
  }
  
  // Check for assets directory
  File root = LittleFS.open("/assets");
  if (root && root.isDirectory()) {
    Serial.println("Assets directory found");
    File file = root.openNextFile();
    while (file) {
      Serial.print("Found in assets: ");
      Serial.print(file.name());
      Serial.print(" (");
      Serial.print(file.size());
      Serial.println(" bytes)");
      file = root.openNextFile();
    }
  } else {
    Serial.println("WARNING: assets directory NOT FOUND!");
  }
}

// Setup web server routes
void setupServer() {
  // Route for root / web page
  server.on("/", HTTP_GET, [](AsyncWebServerRequest *request) {
    request->send(LittleFS, "/index.html", "text/html");
  });
  
  // Route to load CSS file with hash in filename
  server.on("/assets/index-DZ4_vwv1.css", HTTP_GET, [](AsyncWebServerRequest *request) {
    request->send(LittleFS, "/assets/index-DZ4_vwv1.css", "text/css");
  });
  
  // Route to load JS file with hash in filename
  server.on("/assets/index-CQFWnP5z.js", HTTP_GET, [](AsyncWebServerRequest *request) {
    Serial.println("Request: /assets/index-CQFWnP5z.js");
    request->send(LittleFS, "/assets/index-CQFWnP5z.js", "text/javascript");
  });
  
  // Serve any files from assets directory
  server.serveStatic("/assets/", LittleFS, "/assets/");
  
  // API endpoint for status information (minimized)
  server.on("/api/status", HTTP_GET, [](AsyncWebServerRequest *request) {
    Serial.println("API Request: /api/status");
    char buffer[80];
    snprintf(buffer, sizeof(buffer),
      "{\"s\":\"on\",\"u\":%lu,\"m\":%u,\"c\":%u}",
      millis()/1000, ESP.getFreeHeap()/1024, ESP.getCpuFreqMHz());
    request->send(200, JSON_CONTENT_TYPE, buffer);
  });

  // API endpoint to handle configuration data - load and save to preferences
  server.on("/api/config", HTTP_GET, [](AsyncWebServerRequest *request) {
    Serial.println("API Request: /api/config (GET)");
    // Create a document to store config - size based on storage needs
    DynamicJsonDocument jsonDoc(1024);
    
    // Try to load config from preferences
    if (loadConfig(jsonDoc)) {
      String configJson;
      serializeJson(jsonDoc, configJson);
      request->send(200, JSON_CONTENT_TYPE, configJson);
    } else {
      // Return default minimal config if not found
      request->send(200, JSON_CONTENT_TYPE, "{\"wifi\":{\"ssid\":\"ESP32_Config\"}}");
    }
  });
  
  // API endpoint to scan for WiFi networks
  server.on("/api/wifi/scan", HTTP_GET, [](AsyncWebServerRequest *request) {
    Serial.println("API Request: /api/wifi/scan");
    // Create a JSON document for response
    DynamicJsonDocument jsonDoc(2048); // Larger buffer for multiple networks
    JsonArray networkArray = jsonDoc.to<JsonArray>();
    
    // Start WiFi scan
    int networksFound = WiFi.scanNetworks();
    Serial.print("WiFi scan completed. Networks found: ");
    Serial.println(networksFound);
    
    if (networksFound == 0) {
      // No networks found
      request->send(200, JSON_CONTENT_TYPE, "[]");
    } else {
      // Process each network found
      for (int i = 0; i < networksFound; i++) {
        // Create a JSON object for this network
        JsonObject networkObj = networkArray.add<JsonObject>();
        
        // Add network details
        networkObj["ssid"] = WiFi.SSID(i);
        networkObj["rssi"] = WiFi.RSSI(i); // Signal strength
        
        // Determine encryption type
        String encType = "";
        switch (WiFi.encryptionType(i)) {
          case WIFI_AUTH_OPEN:
            encType = "open";
            break;
          case WIFI_AUTH_WEP:
            encType = "WEP";
            break;
          case WIFI_AUTH_WPA_PSK:
            encType = "WPA";
            break;
          case WIFI_AUTH_WPA2_PSK:
            encType = "WPA2";
            break;
          case WIFI_AUTH_WPA_WPA2_PSK:
            encType = "WPA+WPA2";
            break;
          case WIFI_AUTH_WPA2_ENTERPRISE:
            encType = "WPA2-EAP";
            break;
          default:
            encType = "unknown";
        }
        networkObj["encryption"] = encType;
      }
      
      // Serialize and send response
      String scanJson;
      serializeJson(networkArray, scanJson);
      request->send(200, JSON_CONTENT_TYPE, scanJson);
      
      // Clean up scan results to free memory
      WiFi.scanDelete();
    }
  });
  
  server.on("/api/config", HTTP_POST, [](AsyncWebServerRequest *request) {
    Serial.println("API Request: /api/config (POST)");
    // Empty callback, actual handling is done in the body handler
  }, NULL, [](AsyncWebServerRequest *request, uint8_t *data, size_t len, size_t index, size_t total) {
    // Use appropriate buffer size for config - increased for complex config
    DynamicJsonDocument jsonDoc(1024);
    DeserializationError error = deserializeJson(jsonDoc, (const char*)data, len);
    
    if (error) {
      request->send(400, JSON_CONTENT_TYPE, "{\"s\":\"e\",\"m\":\"Invalid JSON\"}");
      return;
    }
    
    // Save the configuration to preferences
    saveConfig(jsonDoc);
    
    // Send success response
    request->send(200, JSON_CONTENT_TYPE, "{\"s\":\"ok\",\"m\":\"Configuration saved\"}");
  });
  
  // API endpoint to immediately connect to a WiFi network
  server.on("/api/wifi/connect", HTTP_POST, [](AsyncWebServerRequest *request) {
    Serial.println("API Request: /api/wifi/connect");
    // Empty callback, actual handling is done in the body handler
  }, NULL, [](AsyncWebServerRequest *request, uint8_t *data, size_t len, size_t index, size_t total) {
    // Parse the JSON request
    DynamicJsonDocument jsonDoc(256);
    DeserializationError error = deserializeJson(jsonDoc, (const char*)data, len);
    
    if (error) {
      request->send(400, JSON_CONTENT_TYPE, "{\"s\":\"e\",\"m\":\"Invalid JSON\"}");
      return;
    }
    
    // Extract WiFi credentials
    if (!jsonDoc.containsKey("ssid") || !jsonDoc.containsKey("password")) {
      request->send(400, JSON_CONTENT_TYPE, "{\"s\":\"e\",\"m\":\"Missing SSID or password\"}");
      return;
    }
    
    String networkSSID = jsonDoc["ssid"].as<String>();
    String networkPass = jsonDoc["password"].as<String>();
    
    // Disconnect from current network or AP mode
    if (apMode) {
      WiFi.softAPdisconnect(true);
      apMode = false;
    } else {
      WiFi.disconnect();
    }
    
    // Try to connect to the new network
    Serial.print("Connecting to WiFi network: ");
    Serial.println(networkSSID);
    
    WiFi.begin(networkSSID.c_str(), networkPass.c_str());
    WiFi.setAutoReconnect(true);
    
    // Wait briefly for connection (async response will be sent before connection completes)
    // This is just to give it a head start
    unsigned long startAttempt = millis();
    while (WiFi.status() != WL_CONNECTED && millis() - startAttempt < 5000) {
      delay(100);
      Serial.print(".");
    }
    
    if (WiFi.status() == WL_CONNECTED) {
      Serial.println("\nConnected! IP address: " + WiFi.localIP().toString());
      request->send(200, JSON_CONTENT_TYPE, "{\"s\":\"ok\",\"m\":\"Connected to network\",\"ip\":\"" + WiFi.localIP().toString() + "\"}");
    } else {
      // Even if connection not complete yet, we'll respond that it's in progress
      Serial.println("\nConnection in progress...");
      request->send(200, JSON_CONTENT_TYPE, "{\"s\":\"ok\",\"m\":\"Connection attempt started\"}");
      
      // WiFi connection will continue in the background
    }
  });
  
  // API endpoint for firmware update
  server.on("/api/update", HTTP_POST, 
    // First callback handles the response after update completes
    [](AsyncWebServerRequest *request) {
      // The update has either completed or failed
      bool updateSuccess = Update.hasError() == false;
      
      // Send appropriate response
      if (updateSuccess) {
        // Success - the device will reboot after sending this response
        AsyncWebServerResponse *response = request->beginResponse(200, "text/plain", "Update successful! Rebooting...");
        response->addHeader("Connection", "close");
        request->send(response);
        
        // Schedule a reboot
        Serial.println("Update complete! Rebooting...");
        delay(500); // Give the response time to send
        ESP.restart();
      } else {
        // Error during update
        String errorMsg = "Update error: " + String(Update.errorString());
        request->send(500, "text/plain", errorMsg);
        Serial.println(errorMsg);
      }
    },
    // Second callback handles the actual upload data
    [](AsyncWebServerRequest *request, String filename, size_t index, uint8_t *data, size_t len, bool final) {
      // Print upload status
      if (index == 0) {
        Serial.println("Firmware update started...");
        Serial.printf("Filename: %s\n", filename.c_str());
        
        // Start with OTA update
        if (!Update.begin(UPDATE_SIZE_UNKNOWN)) {
          Update.printError(Serial);
          return request->send(400, "text/plain", "OTA update failed to begin");
        }
      }
      
      // Write the received data to flash
      if (Update.write(data, len) != len) {
        Update.printError(Serial);
        return request->send(400, "text/plain", "OTA write error");
      }
      
      // If this is the final chunk
      if (final) {
        Serial.printf("Update complete: %u bytes\n", index + len);
        
        // Finish the update process
        if (!Update.end(true)) {
          Update.printError(Serial);
          return request->send(400, "text/plain", "OTA end failed");
        }
        
        Serial.println("Update successful. Device will reboot after response is sent.");
        // The response is sent in the first callback
      }
    }
  );
  
  // No onNotFound handler here - moved below
  
  #ifdef BLUETOOTH_ENABLED
  // API endpoint to toggle Bluetooth
  server.on("/api/bluetooth/toggle", HTTP_POST, [](AsyncWebServerRequest *request) {
    if (btEnabled) {
      // Turn off Bluetooth
      SerialBT.end();
      btEnabled = false;
      request->send(200, JSON_CONTENT_TYPE, "{\"status\":\"off\"}");
    } else {
      // Turn on Bluetooth
      if (SerialBT.begin(btDeviceName)) {
        btEnabled = true;
        request->send(200, JSON_CONTENT_TYPE, "{\"status\":\"on\"}");
      } else {
        request->send(500, JSON_CONTENT_TYPE, "{\"status\":\"error\"}");
      }
    }
  });

  // API endpoint to get Bluetooth status
  server.on("/api/bluetooth/status", HTTP_GET, [](AsyncWebServerRequest *request) {
    // Use a smaller JSON response to save space
    DynamicJsonDocument doc(128);
    doc["on"] = btEnabled;
    doc["name"] = btDeviceName;
    
    String json;
    serializeJson(doc, json);
    request->send(200, JSON_CONTENT_TYPE, json);
  });

  // API endpoint to send data via Bluetooth
  server.on("/api/bluetooth/send", HTTP_POST, [](AsyncWebServerRequest *request) {
    // Empty callback, the actual handling is done in the body handler
  }, NULL, [](AsyncWebServerRequest *request, uint8_t *data, size_t len, size_t index, size_t total) {
    // Parse JSON with smaller buffer
    DynamicJsonDocument jsonDoc(128);
    DeserializationError error = deserializeJson(jsonDoc, (const char*)data, len);
    
    if (error) {
      request->send(400, JSON_CONTENT_TYPE, "{\"status\":\"error\"}");
      return;
    }
    
    if (jsonDoc.containsKey("msg")) {
      String message = jsonDoc["msg"].as<String>();
      
      if (btEnabled) {
        SerialBT.println(message);
        request->send(200, JSON_CONTENT_TYPE, "{\"status\":\"ok\"}");
      } else {
        request->send(400, JSON_CONTENT_TYPE, "{\"status\":\"off\"}");
      }
    } else {
      request->send(400, JSON_CONTENT_TYPE, "{\"status\":\"error\"}");
    }
  });

  // API endpoint to scan for Bluetooth devices (simplified)
  server.on("/api/bluetooth/scan", HTTP_GET, [](AsyncWebServerRequest *request) {
    if (!scanning && btEnabled) {
      startBluetoothScan();
      request->send(200, JSON_CONTENT_TYPE, "{\"status\":\"scanning\"}");
    } else if (scanning) {
      request->send(200, JSON_CONTENT_TYPE, "{\"status\":\"busy\"}");
    } else {
      request->send(400, JSON_CONTENT_TYPE, "{\"status\":\"error\"}");
    }
  });
#else
  // Minimal stub API endpoints when Bluetooth is disabled
  server.on("/api/bluetooth/toggle", HTTP_POST, [](AsyncWebServerRequest *request) {
    request->send(400, JSON_CONTENT_TYPE, "{\"status\":\"disabled\"}");
  });
  
  server.on("/api/bluetooth/status", HTTP_GET, [](AsyncWebServerRequest *request) {
    request->send(200, JSON_CONTENT_TYPE, "{\"on\":false}");
  });
  
  server.on("/api/bluetooth/send", HTTP_POST, [](AsyncWebServerRequest *request) {
    request->send(400, JSON_CONTENT_TYPE, "{\"status\":\"disabled\"}");
  });
  
  server.on("/api/bluetooth/scan", HTTP_GET, [](AsyncWebServerRequest *request) {
    request->send(400, JSON_CONTENT_TYPE, "{\"status\":\"disabled\"}");
  });
#endif

  // Add CORS headers to allow access from any origin
  DefaultHeaders::Instance().addHeader("Access-Control-Allow-Origin", "*");
  DefaultHeaders::Instance().addHeader("Access-Control-Allow-Methods", "GET, POST, PUT");
  DefaultHeaders::Instance().addHeader("Access-Control-Allow-Headers", "Content-Type");
  
  // Add a request logger middleware to help with debugging
  // Create a logger for all main routes
  server.on("/", HTTP_GET, [](AsyncWebServerRequest *request) {
    Serial.println("Request: / (root)");
    request->send(LittleFS, "/index.html", "text/html");
  });
  
  // Single onNotFound handler with logging
  server.onNotFound([](AsyncWebServerRequest *request) {
    Serial.print("Request not found: ");
    Serial.println(request->url());
    
    request->method() == HTTP_GET
      ? request->send(LittleFS, "/index.html", "text/html")
      : request->send(404, "text/plain", "404");
  });

  // Start server
  server.begin();
  
  // Display access information
  if (apMode) {
    Serial.println("Web server started in AP mode");
    Serial.println("Access the web interface at http://192.168.4.1");
  } else if (WiFi.status() == WL_CONNECTED) {
    Serial.println("Web server started at http://" + WiFi.localIP().toString());
  } else {
    Serial.println("Web server started, but WiFi connection failed");
    Serial.println("Web interface not accessible until WiFi connects");
  }
}

// EEPROM Helper Functions

// Write a string to EEPROM at specified address
void writeString(int addr, const String &str) {
  // Store string length in first byte
  byte len = str.length();
  EEPROM.write(addr, len);
  
  // Write each character to subsequent addresses
  for (byte i = 0; i < len; i++) {
    EEPROM.write(addr + 1 + i, str[i]);
  }
  
  // Commit changes to flash memory
  EEPROM.commit();
}

// Read a string from EEPROM at specified address
String readString(int addr) {
  // Read string length from first byte
  byte len = EEPROM.read(addr);
  char data[len + 1];
  
  // Read each character from subsequent addresses
  for (byte i = 0; i < len; i++) {
    data[i] = EEPROM.read(addr + 1 + i);
  }
  
  // Null-terminate the string
  data[len] = '\0';
  return String(data);
}

// Write an unsigned int to EEPROM at specified address
void writeUInt(int addr, unsigned int val) {
  EEPROM.put(addr, val);
  EEPROM.commit();
}

// Read an unsigned int from EEPROM at specified address
unsigned int readUInt(int addr) {
  unsigned int val;
  EEPROM.get(addr, val);
  return val;
}

// Write a boolean to EEPROM at specified address
void writeBool(int addr, bool val) {
  EEPROM.write(addr, val ? 1 : 0);
  EEPROM.commit();
}

// Read a boolean from EEPROM at specified address
bool readBool(int addr) {
  return EEPROM.read(addr) == 1;
}

// Save configuration to EEPROM storage
void saveConfig(const JsonDocument& json) {
  // WiFi configuration
  if (json.containsKey("wifi")) {
    // Direct access to values without converting to JsonObject
    if (json["wifi"].containsKey("ssid")) {
      writeString(WIFI_SSID_ADDR, json["wifi"]["ssid"].as<String>());
    }
    if (json["wifi"].containsKey("password")) {
      writeString(WIFI_PASS_ADDR, json["wifi"]["password"].as<String>());
    }
    if (json["wifi"].containsKey("channel")) {
      writeUInt(WIFI_CHANNEL_ADDR, json["wifi"]["channel"].as<unsigned int>());
    }
    // Mark WiFi config as valid
    writeBool(WIFI_VALID_ADDR, true);
  }
  
  // Network configuration
  if (json.containsKey("network")) {
    // Direct access to values
    if (json["network"].containsKey("hostname")) {
      writeString(NET_HOSTNAME_ADDR, json["network"]["hostname"].as<String>());
    }
    if (json["network"].containsKey("staticIp")) {
      writeBool(NET_STATIC_ADDR, json["network"]["staticIp"].as<bool>());
    }
    if (json["network"].containsKey("ipAddress")) {
      writeString(NET_IP_ADDR, json["network"]["ipAddress"].as<String>());
    }
    if (json["network"].containsKey("webServerPort")) {
      writeUInt(NET_PORT_ADDR, json["network"]["webServerPort"].as<unsigned int>());
    }
    // Mark Network config as valid
    writeBool(NET_VALID_ADDR, true);
  }
  
  // Device configuration
  if (json.containsKey("device")) {
    // Direct access to values
    if (json["device"].containsKey("deviceName")) {
      writeString(DEV_NAME_ADDR, json["device"]["deviceName"].as<String>());
    }
    if (json["device"].containsKey("cpuFrequency")) {
      writeUInt(DEV_CPU_ADDR, json["device"]["cpuFrequency"].as<unsigned int>());
    }
    if (json["device"].containsKey("sleepMode")) {
      writeString(DEV_SLEEP_ADDR, json["device"]["sleepMode"].as<String>());
    }
    // Mark Device config as valid
    writeBool(DEV_VALID_ADDR, true);
  }
  
  // Bluetooth configuration
  if (json.containsKey("connectivity")) {
    // Direct access to values
    if (json["connectivity"].containsKey("enableBluetooth")) {
      writeBool(BT_ENABLED_ADDR, json["connectivity"]["enableBluetooth"].as<bool>());
    }
    if (json["connectivity"].containsKey("bluetoothName")) {
      writeString(BT_NAME_ADDR, json["connectivity"]["bluetoothName"].as<String>());
    }
    // Mark Bluetooth config as valid
    writeBool(BT_VALID_ADDR, true);

    // Additional connectivity settings
    if (json["connectivity"].containsKey("enableBLE")) {
      writeBool(CONN_BLE_ADDR, json["connectivity"]["enableBLE"].as<bool>());
    }
    if (json["connectivity"].containsKey("enableEthernet")) {
      writeBool(CONN_ETHERNET_ADDR, json["connectivity"]["enableEthernet"].as<bool>());
    }
    if (json["connectivity"].containsKey("enableCAN")) {
      writeBool(CONN_CAN_ADDR, json["connectivity"]["enableCAN"].as<bool>());
    }
    if (json["connectivity"].containsKey("canBitrate")) {
      writeUInt(CONN_CAN_BITRATE_ADDR, json["connectivity"]["canBitrate"].as<unsigned int>());
    }
    if (json["connectivity"].containsKey("enableI2C")) {
      writeBool(CONN_I2C_ADDR, json["connectivity"]["enableI2C"].as<bool>());
    }
    if (json["connectivity"].containsKey("i2cFrequency")) {
      writeUInt(CONN_I2C_FREQ_ADDR, json["connectivity"]["i2cFrequency"].as<unsigned int>());
    }
    if (json["connectivity"].containsKey("enableSPI")) {
      writeBool(CONN_SPI_ADDR, json["connectivity"]["enableSPI"].as<bool>());
    }
    if (json["connectivity"].containsKey("spiFrequency")) {
      writeUInt(CONN_SPI_FREQ_ADDR, json["connectivity"]["spiFrequency"].as<unsigned int>());
    }
    // Mark connectivity config as valid
    writeBool(CONN_VALID_ADDR, true);
  }

  // GPIO configuration
  if (json.containsKey("gpio")) {
    if (json["gpio"].containsKey("pin2")) {
      writeString(GPIO_PIN2_ADDR, json["gpio"]["pin2"].as<String>());
    }
    if (json["gpio"].containsKey("pin4")) {
      writeString(GPIO_PIN4_ADDR, json["gpio"]["pin4"].as<String>());
    }
    if (json["gpio"].containsKey("pin5")) {
      writeString(GPIO_PIN5_ADDR, json["gpio"]["pin5"].as<String>());
    }
    if (json["gpio"].containsKey("pin18")) {
      writeString(GPIO_PIN18_ADDR, json["gpio"]["pin18"].as<String>());
    }
    if (json["gpio"].containsKey("pin19")) {
      writeString(GPIO_PIN19_ADDR, json["gpio"]["pin19"].as<String>());
    }
    if (json["gpio"].containsKey("pin21")) {
      writeString(GPIO_PIN21_ADDR, json["gpio"]["pin21"].as<String>());
    }
    if (json["gpio"].containsKey("pin22")) {
      writeString(GPIO_PIN22_ADDR, json["gpio"]["pin22"].as<String>());
    }
    if (json["gpio"].containsKey("pin23")) {
      writeString(GPIO_PIN23_ADDR, json["gpio"]["pin23"].as<String>());
    }
    if (json["gpio"].containsKey("pin25")) {
      writeString(GPIO_PIN25_ADDR, json["gpio"]["pin25"].as<String>());
    }
    if (json["gpio"].containsKey("pin26")) {
      writeString(GPIO_PIN26_ADDR, json["gpio"]["pin26"].as<String>());
    }
    if (json["gpio"].containsKey("pin27")) {
      writeString(GPIO_PIN27_ADDR, json["gpio"]["pin27"].as<String>());
    }
    if (json["gpio"].containsKey("pin32")) {
      writeString(GPIO_PIN32_ADDR, json["gpio"]["pin32"].as<String>());
    }
    if (json["gpio"].containsKey("pin33")) {
      writeString(GPIO_PIN33_ADDR, json["gpio"]["pin33"].as<String>());
    }
    // Mark GPIO config as valid
    writeBool(GPIO_VALID_ADDR, true);
  }
  
  // Sensors configuration
  if (json.containsKey("sensors")) {
    if (json["sensors"].containsKey("temperature")) {
      writeBool(SENSORS_TEMP_ADDR, json["sensors"]["temperature"].as<bool>());
    }
    if (json["sensors"].containsKey("humidity")) {
      writeBool(SENSORS_HUMID_ADDR, json["sensors"]["humidity"].as<bool>());
    }
    if (json["sensors"].containsKey("pressure")) {
      writeBool(SENSORS_PRESS_ADDR, json["sensors"]["pressure"].as<bool>());
    }
    if (json["sensors"].containsKey("motion")) {
      writeBool(SENSORS_MOTION_ADDR, json["sensors"]["motion"].as<bool>());
    }
    if (json["sensors"].containsKey("light")) {
      writeBool(SENSORS_LIGHT_ADDR, json["sensors"]["light"].as<bool>());
    }
    if (json["sensors"].containsKey("sound")) {
      writeBool(SENSORS_SOUND_ADDR, json["sensors"]["sound"].as<bool>());
    }
    if (json["sensors"].containsKey("accelerometer")) {
      writeBool(SENSORS_ACCEL_ADDR, json["sensors"]["accelerometer"].as<bool>());
    }
    if (json["sensors"].containsKey("gyroscope")) {
      writeBool(SENSORS_GYRO_ADDR, json["sensors"]["gyroscope"].as<bool>());
    }
    if (json["sensors"].containsKey("magnetometer")) {
      writeBool(SENSORS_MAG_ADDR, json["sensors"]["magnetometer"].as<bool>());
    }
    if (json["sensors"].containsKey("gps")) {
      writeBool(SENSORS_GPS_ADDR, json["sensors"]["gps"].as<bool>());
    }
    // Mark Sensors config as valid
    writeBool(SENSORS_VALID_ADDR, true);
  }
  
  // Security configuration
  if (json.containsKey("security")) {
    if (json["security"].containsKey("enableAuth")) {
      writeBool(SECURITY_AUTH_ADDR, json["security"]["enableAuth"].as<bool>());
    }
    if (json["security"].containsKey("username")) {
      writeString(SECURITY_USERNAME_ADDR, json["security"]["username"].as<String>());
    }
    if (json["security"].containsKey("password")) {
      writeString(SECURITY_PASSWORD_ADDR, json["security"]["password"].as<String>());
    }
    if (json["security"].containsKey("enableHttps")) {
      writeBool(SECURITY_HTTPS_ADDR, json["security"]["enableHttps"].as<bool>());
    }
    if (json["security"].containsKey("apiKey")) {
      writeString(SECURITY_APIKEY_ADDR, json["security"]["apiKey"].as<String>());
    }
    if (json["security"].containsKey("enableFirewall")) {
      writeBool(SECURITY_FIREWALL_ADDR, json["security"]["enableFirewall"].as<bool>());
    }
    if (json["security"].containsKey("rateLimiting")) {
      writeBool(SECURITY_RATE_LIMITING_ADDR, json["security"]["rateLimiting"].as<bool>());
    }
    if (json["security"].containsKey("maxRequests")) {
      writeUInt(SECURITY_MAX_REQUESTS_ADDR, json["security"]["maxRequests"].as<unsigned int>());
    }
    // Mark Security config as valid
    writeBool(SECURITY_VALID_ADDR, true);
  }
  
  // System configuration
  if (json.containsKey("system")) {
    if (json["system"].containsKey("autoReboot")) {
      writeBool(SYSTEM_AUTO_REBOOT_ADDR, json["system"]["autoReboot"].as<bool>());
    }
    if (json["system"].containsKey("rebootTime")) {
      writeString(SYSTEM_REBOOT_TIME_ADDR, json["system"]["rebootTime"].as<String>());
    }
    if (json["system"].containsKey("logLevel")) {
      writeString(SYSTEM_LOG_LEVEL_ADDR, json["system"]["logLevel"].as<String>());
    }
    if (json["system"].containsKey("enableOTA")) {
      writeBool(SYSTEM_ENABLE_OTA_ADDR, json["system"]["enableOTA"].as<bool>());
    }
    if (json["system"].containsKey("enableTelnet")) {
      writeBool(SYSTEM_ENABLE_TELNET_ADDR, json["system"]["enableTelnet"].as<bool>());
    }
    if (json["system"].containsKey("enableSerial")) {
      writeBool(SYSTEM_ENABLE_SERIAL_ADDR, json["system"]["enableSerial"].as<bool>());
    }
    if (json["system"].containsKey("watchdogTimer")) {
      writeBool(SYSTEM_WATCHDOG_ADDR, json["system"]["watchdogTimer"].as<bool>());
    }
    if (json["system"].containsKey("memoryMonitoring")) {
      writeBool(SYSTEM_MEMORY_MONITORING_ADDR, json["system"]["memoryMonitoring"].as<bool>());
    }
    if (json["system"].containsKey("temperatureMonitoring")) {
      writeBool(SYSTEM_TEMP_MONITORING_ADDR, json["system"]["temperatureMonitoring"].as<bool>());
    }
    if (json["system"].containsKey("performanceMode")) {
      writeString(SYSTEM_PERFORMANCE_ADDR, json["system"]["performanceMode"].as<String>());
    }
    if (json["system"].containsKey("bootMode")) {
      writeString(SYSTEM_BOOT_MODE_ADDR, json["system"]["bootMode"].as<String>());
    }
    // Mark System config as valid
    writeBool(SYSTEM_VALID_ADDR, true);
  }
  
  // Monitoring configuration
  if (json.containsKey("monitoring")) {
    if (json["monitoring"].containsKey("enableMetrics")) {
      writeBool(MONITORING_METRICS_ADDR, json["monitoring"]["enableMetrics"].as<bool>());
    }
    if (json["monitoring"].containsKey("metricsInterval")) {
      writeUInt(MONITORING_INTERVAL_ADDR, json["monitoring"]["metricsInterval"].as<unsigned int>());
    }
    if (json["monitoring"].containsKey("enableAlerts")) {
      writeBool(MONITORING_ALERTS_ADDR, json["monitoring"]["enableAlerts"].as<bool>());
    }
    if (json["monitoring"].containsKey("temperatureThreshold")) {
      writeUInt(MONITORING_TEMP_THRESHOLD_ADDR, json["monitoring"]["temperatureThreshold"].as<unsigned int>());
    }
    if (json["monitoring"].containsKey("memoryThreshold")) {
      writeUInt(MONITORING_MEM_THRESHOLD_ADDR, json["monitoring"]["memoryThreshold"].as<unsigned int>());
    }
    if (json["monitoring"].containsKey("uptimeReporting")) {
      writeBool(MONITORING_UPTIME_REPORTING_ADDR, json["monitoring"]["uptimeReporting"].as<bool>());
    }
    if (json["monitoring"].containsKey("errorReporting")) {
      writeBool(MONITORING_ERROR_REPORTING_ADDR, json["monitoring"]["errorReporting"].as<bool>());
    }
    if (json["monitoring"].containsKey("remoteLogging")) {
      writeBool(MONITORING_REMOTE_LOGGING_ADDR, json["monitoring"]["remoteLogging"].as<bool>());
    }
    if (json["monitoring"].containsKey("logServerUrl")) {
      writeString(MONITORING_LOG_SERVER_ADDR, json["monitoring"]["logServerUrl"].as<String>());
    }
    // Mark Monitoring config as valid
    writeBool(MONITORING_VALID_ADDR, true);
  }
  
  Serial.println("Configuration saved to EEPROM");
}

// Load configuration from EEPROM storage
bool loadConfig(JsonDocument& json) {
  bool hasConfig = false;
  
  // Create structure and populate with saved values
  
  // WiFi settings
  json.clear();
  JsonObject root = json.to<JsonObject>();
  root.createNestedObject("wifi");
  bool validWiFi = readBool(WIFI_VALID_ADDR);
  if (validWiFi) {
    String wifiSsid = readString(WIFI_SSID_ADDR);
    if (wifiSsid.length() > 0) {
      json["wifi"]["ssid"] = wifiSsid;
      json["wifi"]["password"] = readString(WIFI_PASS_ADDR);
      json["wifi"]["channel"] = readUInt(WIFI_CHANNEL_ADDR);
      hasConfig = true;
    }
  }
  if (!validWiFi || !hasConfig) {
    json["wifi"]["ssid"] = ssid;
    json["wifi"]["password"] = password;
    json["wifi"]["channel"] = 1;
  }
  
  // Network settings
  root.createNestedObject("network");
  bool validNetwork = readBool(NET_VALID_ADDR);
  if (validNetwork) {
    String hostname = readString(NET_HOSTNAME_ADDR);
    if (hostname.length() > 0) {
      json["network"]["hostname"] = hostname;
      json["network"]["staticIp"] = readBool(NET_STATIC_ADDR);
      json["network"]["ipAddress"] = readString(NET_IP_ADDR);
      json["network"]["webServerPort"] = readUInt(NET_PORT_ADDR);
      hasConfig = true;
    }
  }
  if (!validNetwork || json["network"].size() == 0) {
    json["network"]["hostname"] = "esp32-config";
    json["network"]["staticIp"] = false;
    json["network"]["ipAddress"] = "192.168.4.1";
    json["network"]["webServerPort"] = 80;
  }
  
  // Device settings
  root.createNestedObject("device");
  bool validDevice = readBool(DEV_VALID_ADDR);
  if (validDevice) {
    String devName = readString(DEV_NAME_ADDR);
    if (devName.length() > 0) {
      json["device"]["deviceName"] = devName;
      json["device"]["cpuFrequency"] = readUInt(DEV_CPU_ADDR);
      json["device"]["sleepMode"] = readString(DEV_SLEEP_ADDR);
      hasConfig = true;
    }
  }
  if (!validDevice || json["device"].size() == 0) {
    json["device"]["deviceName"] = "ESP32 Device";
    json["device"]["cpuFrequency"] = 240;
    json["device"]["sleepMode"] = "none";
  }
  
  // Bluetooth settings
  root.createNestedObject("connectivity");
  bool validBT = readBool(BT_VALID_ADDR);
  if (validBT) {
    json["connectivity"]["enableBluetooth"] = readBool(BT_ENABLED_ADDR);
    json["connectivity"]["bluetoothName"] = readString(BT_NAME_ADDR);
  } else {
    json["connectivity"]["enableBluetooth"] = false;
    json["connectivity"]["bluetoothName"] = "ESP32_BT";
  }
  
  // Additional connectivity settings
  bool validConn = readBool(CONN_VALID_ADDR);
  if (validConn) {
    json["connectivity"]["enableBLE"] = readBool(CONN_BLE_ADDR);
    json["connectivity"]["enableEthernet"] = readBool(CONN_ETHERNET_ADDR);
    json["connectivity"]["enableCAN"] = readBool(CONN_CAN_ADDR);
    json["connectivity"]["canBitrate"] = readUInt(CONN_CAN_BITRATE_ADDR);
    json["connectivity"]["enableI2C"] = readBool(CONN_I2C_ADDR);
    json["connectivity"]["i2cFrequency"] = readUInt(CONN_I2C_FREQ_ADDR);
    json["connectivity"]["enableSPI"] = readBool(CONN_SPI_ADDR);
    json["connectivity"]["spiFrequency"] = readUInt(CONN_SPI_FREQ_ADDR);
  } else {
    json["connectivity"]["enableBLE"] = false;
    json["connectivity"]["enableEthernet"] = false;
    json["connectivity"]["enableCAN"] = false;
    json["connectivity"]["canBitrate"] = 500;
    json["connectivity"]["enableI2C"] = false;
    json["connectivity"]["i2cFrequency"] = 100;
    json["connectivity"]["enableSPI"] = false;
    json["connectivity"]["spiFrequency"] = 1000;
  }
  
  // GPIO settings
  root.createNestedObject("gpio");
  bool validGPIO = readBool(GPIO_VALID_ADDR);
  if (validGPIO) {
    json["gpio"]["pin2"] = readString(GPIO_PIN2_ADDR);
    json["gpio"]["pin4"] = readString(GPIO_PIN4_ADDR);
    json["gpio"]["pin5"] = readString(GPIO_PIN5_ADDR);
    json["gpio"]["pin18"] = readString(GPIO_PIN18_ADDR);
    json["gpio"]["pin19"] = readString(GPIO_PIN19_ADDR);
    json["gpio"]["pin21"] = readString(GPIO_PIN21_ADDR);
    json["gpio"]["pin22"] = readString(GPIO_PIN22_ADDR);
    json["gpio"]["pin23"] = readString(GPIO_PIN23_ADDR);
    json["gpio"]["pin25"] = readString(GPIO_PIN25_ADDR);
    json["gpio"]["pin26"] = readString(GPIO_PIN26_ADDR);
    json["gpio"]["pin27"] = readString(GPIO_PIN27_ADDR);
    json["gpio"]["pin32"] = readString(GPIO_PIN32_ADDR);
    json["gpio"]["pin33"] = readString(GPIO_PIN33_ADDR);
    hasConfig = true;
  } else {
    json["gpio"]["pin2"] = "OUTPUT";
    json["gpio"]["pin4"] = "INPUT";
    json["gpio"]["pin5"] = "INPUT";
    json["gpio"]["pin18"] = "INPUT";
    json["gpio"]["pin19"] = "INPUT";
    json["gpio"]["pin21"] = "INPUT";
    json["gpio"]["pin22"] = "INPUT";
    json["gpio"]["pin23"] = "INPUT";
    json["gpio"]["pin25"] = "INPUT";
    json["gpio"]["pin26"] = "INPUT";
    json["gpio"]["pin27"] = "INPUT";
    json["gpio"]["pin32"] = "INPUT";
    json["gpio"]["pin33"] = "INPUT";
  }
  
  // Sensors settings
  root.createNestedObject("sensors");
  bool validSensors = readBool(SENSORS_VALID_ADDR);
  if (validSensors) {
    json["sensors"]["temperature"] = readBool(SENSORS_TEMP_ADDR);
    json["sensors"]["humidity"] = readBool(SENSORS_HUMID_ADDR);
    json["sensors"]["pressure"] = readBool(SENSORS_PRESS_ADDR);
    json["sensors"]["motion"] = readBool(SENSORS_MOTION_ADDR);
    json["sensors"]["light"] = readBool(SENSORS_LIGHT_ADDR);
    json["sensors"]["sound"] = readBool(SENSORS_SOUND_ADDR);
    json["sensors"]["accelerometer"] = readBool(SENSORS_ACCEL_ADDR);
    json["sensors"]["gyroscope"] = readBool(SENSORS_GYRO_ADDR);
    json["sensors"]["magnetometer"] = readBool(SENSORS_MAG_ADDR);
    json["sensors"]["gps"] = readBool(SENSORS_GPS_ADDR);
    hasConfig = true;
  } else {
    json["sensors"]["temperature"] = false;
    json["sensors"]["humidity"] = false;
    json["sensors"]["pressure"] = false;
    json["sensors"]["motion"] = false;
    json["sensors"]["light"] = false;
    json["sensors"]["sound"] = false;
    json["sensors"]["accelerometer"] = false;
    json["sensors"]["gyroscope"] = false;
    json["sensors"]["magnetometer"] = false;
    json["sensors"]["gps"] = false;
  }
  
  // Security settings
  root.createNestedObject("security");
  bool validSecurity = readBool(SECURITY_VALID_ADDR);
  if (validSecurity) {
    json["security"]["enableAuth"] = readBool(SECURITY_AUTH_ADDR);
    json["security"]["username"] = readString(SECURITY_USERNAME_ADDR);
    json["security"]["password"] = readString(SECURITY_PASSWORD_ADDR);
    json["security"]["enableHttps"] = readBool(SECURITY_HTTPS_ADDR);
    json["security"]["apiKey"] = readString(SECURITY_APIKEY_ADDR);
    json["security"]["enableFirewall"] = readBool(SECURITY_FIREWALL_ADDR);
    json["security"]["rateLimiting"] = readBool(SECURITY_RATE_LIMITING_ADDR);
    json["security"]["maxRequests"] = readUInt(SECURITY_MAX_REQUESTS_ADDR);
    hasConfig = true;
  } else {
    json["security"]["enableAuth"] = false;
    json["security"]["username"] = "admin";
    json["security"]["password"] = "admin123";
    json["security"]["enableHttps"] = false;
    json["security"]["apiKey"] = "";
    json["security"]["enableFirewall"] = false;
    json["security"]["rateLimiting"] = false;
    json["security"]["maxRequests"] = 100;
  }
  
  // System settings
  root.createNestedObject("system");
  bool validSystem = readBool(SYSTEM_VALID_ADDR);
  if (validSystem) {
    json["system"]["autoReboot"] = readBool(SYSTEM_AUTO_REBOOT_ADDR);
    json["system"]["rebootTime"] = readString(SYSTEM_REBOOT_TIME_ADDR);
    json["system"]["logLevel"] = readString(SYSTEM_LOG_LEVEL_ADDR);
    json["system"]["enableOTA"] = readBool(SYSTEM_ENABLE_OTA_ADDR);
    json["system"]["enableTelnet"] = readBool(SYSTEM_ENABLE_TELNET_ADDR);
    json["system"]["enableSerial"] = readBool(SYSTEM_ENABLE_SERIAL_ADDR);
    json["system"]["watchdogTimer"] = readBool(SYSTEM_WATCHDOG_ADDR);
    json["system"]["memoryMonitoring"] = readBool(SYSTEM_MEMORY_MONITORING_ADDR);
    json["system"]["temperatureMonitoring"] = readBool(SYSTEM_TEMP_MONITORING_ADDR);
    json["system"]["performanceMode"] = readString(SYSTEM_PERFORMANCE_ADDR);
    json["system"]["bootMode"] = readString(SYSTEM_BOOT_MODE_ADDR);
    hasConfig = true;
  } else {
    json["system"]["autoReboot"] = false;
    json["system"]["rebootTime"] = "03:00";
    json["system"]["logLevel"] = "info";
    json["system"]["enableOTA"] = true;
    json["system"]["enableTelnet"] = false;
    json["system"]["enableSerial"] = true;
    json["system"]["watchdogTimer"] = true;
    json["system"]["memoryMonitoring"] = false;
    json["system"]["temperatureMonitoring"] = false;
    json["system"]["performanceMode"] = "balanced";
    json["system"]["bootMode"] = "normal";
  }
  
  // Monitoring settings
  root.createNestedObject("monitoring");
  bool validMonitoring = readBool(MONITORING_VALID_ADDR);
  if (validMonitoring) {
    json["monitoring"]["enableMetrics"] = readBool(MONITORING_METRICS_ADDR);
    json["monitoring"]["metricsInterval"] = readUInt(MONITORING_INTERVAL_ADDR);
    json["monitoring"]["enableAlerts"] = readBool(MONITORING_ALERTS_ADDR);
    json["monitoring"]["temperatureThreshold"] = readUInt(MONITORING_TEMP_THRESHOLD_ADDR);
    json["monitoring"]["memoryThreshold"] = readUInt(MONITORING_MEM_THRESHOLD_ADDR);
    json["monitoring"]["uptimeReporting"] = readBool(MONITORING_UPTIME_REPORTING_ADDR);
    json["monitoring"]["errorReporting"] = readBool(MONITORING_ERROR_REPORTING_ADDR);
    json["monitoring"]["remoteLogging"] = readBool(MONITORING_REMOTE_LOGGING_ADDR);
    json["monitoring"]["logServerUrl"] = readString(MONITORING_LOG_SERVER_ADDR);
    hasConfig = true;
  } else {
    json["monitoring"]["enableMetrics"] = false;
    json["monitoring"]["metricsInterval"] = 60;
    json["monitoring"]["enableAlerts"] = false;
    json["monitoring"]["temperatureThreshold"] = 75;
    json["monitoring"]["memoryThreshold"] = 80;
    json["monitoring"]["uptimeReporting"] = false;
    json["monitoring"]["errorReporting"] = false;
    json["monitoring"]["remoteLogging"] = false;
    json["monitoring"]["logServerUrl"] = "";
  }
  
  return hasConfig;
}
