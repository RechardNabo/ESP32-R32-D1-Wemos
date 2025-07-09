#include <WiFi.h>
#include <WebServer.h>
#include <EEPROM.h>
#include <DNSServer.h>
#include <LittleFS.h>

#include "common_defs.h"
#include "eeprom_utils.h"

// AP config
const char* ap_ssid = "ESP32-Setup";
const char* ap_password = "12345678";
IPAddress ap_ip(10, 0, 2, 30);
IPAddress ap_gateway(10, 0, 2, 1);
IPAddress ap_subnet(255, 255, 255, 0);

// Auth config
const char* admin_username = "admin";
const char* admin_password = "admin";

// Server & DNS
DNSServer dnsServer;
WebServer server(80);

// Session management
bool isAuthenticated = false;
unsigned long lastActivity = 0;
bool isStationMode = false;

// File handling
String getContentType(String filename) {
  if (filename.endsWith(".html")) return "text/html";
  else if (filename.endsWith(".css")) return "text/css";
  else if (filename.endsWith(".js")) return "application/javascript";
  else if (filename.endsWith(".json")) return "application/json";
  return "text/plain";
}

bool handleFileRead(String path) {
  if (path.endsWith("/")) path += "index.html";
  String contentType = getContentType(path);
  
  if (LittleFS.exists(path)) {
    File file = LittleFS.open(path, "r");
    server.streamFile(file, contentType);
    file.close();
    return true;
  }
  return false;
}

void setupAP() {
  WiFi.mode(WIFI_AP);
  WiFi.softAPConfig(ap_ip, ap_gateway, ap_subnet);
  WiFi.softAP(ap_ssid, ap_password);
  dnsServer.start(53, "*", ap_ip);
}

void handleRoot() {
  if (!isAuthenticated) {
    server.sendHeader("Location", "/login.html", true);
    server.send(302, "text/plain", "");
    return;
  }
  lastActivity = millis();
  handleFileRead("/index.html");
}

void handleLogin() {
  if (server.hasArg("username") && server.hasArg("password")) {
    if (server.arg("username") == admin_username && server.arg("password") == admin_password) {
      isAuthenticated = true;
      lastActivity = millis();
      server.sendHeader("Location", "/", true);
      server.send(302, "text/plain", "");
    } else {
      server.sendHeader("Location", "/login.html?error=1", true);
      server.send(302, "text/plain", "");
    }
  } else {
    server.sendHeader("Location", "/login.html", true);
    server.send(302, "text/plain", "");
  }
}

void handleScan() {
  if (!isAuthenticated) {
    server.send(403, "text/plain", "Forbidden");
    return;
  }
  
  lastActivity = millis();
  String scanType = server.arg("type");
  
  if (scanType == "wifi") {
    int networkCount = WiFi.scanNetworks();
    String json = "[";
    for (int i = 0; i < networkCount; i++) {
      if (i > 0) json += ",";
      json += "{\"ssid\":\"" + WiFi.SSID(i) + "\",";
      json += "\"rssi\":" + String(WiFi.RSSI(i)) + ",";
      json += "\"encrypted\":" + String(WiFi.encryptionType(i) != WIFI_AUTH_OPEN ? "true" : "false") + "}";
    }
    json += "]";
    server.send(200, "application/json", json);
  }
  else {
    server.send(400, "text/plain", "Bad Request");
  }
}

void handleConnect() {
  if (!isAuthenticated) {
    server.send(403, "text/plain", "Forbidden");
    return;
  }
  
  lastActivity = millis();
  String type = server.arg("type");
  
  if (type == "wifi") {
    String ssid = server.arg("ssid");
    String password = server.hasArg("password") ? server.arg("password") : "";
    
    if (ssid.length() > 0) {
      writeToEEPROM(SSID_ADDR, ssid);
      writeToEEPROM(PASS_ADDR, password);
      EEPROM.write(CONNECTED_FLAG_ADDR, 1);
      EEPROM.commit();
      
      WiFi.mode(WIFI_STA);
      WiFi.begin(ssid.c_str(), password.c_str());
      
      int attempts = 0;
      String result = "";
      
      while (WiFi.status() != WL_CONNECTED && attempts < 20) {
        delay(500);
        attempts++;
      }
      
      if (WiFi.status() == WL_CONNECTED) {
        isStationMode = true;
        result = "{\"success\":true,\"ip\":\"" + WiFi.localIP().toString() + "\"}";
      } else {
        EEPROM.write(CONNECTED_FLAG_ADDR, 0);
        EEPROM.commit();
        result = "{\"success\":false,\"message\":\"Failed to connect\"}";
      }
      
      server.send(200, "application/json", result);
    } else {
      server.send(400, "application/json", "{\"success\":false,\"message\":\"Missing SSID\"}");
    }
  }
  else {
    server.send(400, "application/json", "{\"success\":false,\"message\":\"Unsupported connection type\"}");
  }
}

void handleStatus() {
  if (!isAuthenticated) {
    server.send(403, "text/plain", "Forbidden");
    return;
  }
  
  String status = "{";
  status += "\"connected\":" + String(WiFi.status() == WL_CONNECTED ? "true" : "false");
  
  if (WiFi.status() == WL_CONNECTED) {
    status += ",\"ssid\":\"" + WiFi.SSID() + "\"";
    status += ",\"ip\":\"" + WiFi.localIP().toString() + "\"";
    status += ",\"rssi\":" + String(WiFi.RSSI());
  }
  
  status += "}";
  server.send(200, "application/json", status);
}

void handleLogout() {
  isAuthenticated = false;
  server.sendHeader("Location", "/login.html", true);
  server.send(302, "text/plain", "");
}

void setup() {
  // Initialize EEPROM
  EEPROM.begin(EEPROM_SIZE);
  
  // Initialize file system
  if (!LittleFS.begin()) {
    // File system error - continue anyway
  }
  
  // Check if we have stored credentials
  if (EEPROM.read(CONNECTED_FLAG_ADDR) == 1) {
    // Try to connect with stored credentials
    String savedSSID = readFromEEPROM(SSID_ADDR);
    String savedPassword = readFromEEPROM(PASS_ADDR);
    
    if (savedSSID.length() > 0) {
      WiFi.mode(WIFI_STA);
      WiFi.begin(savedSSID.c_str(), savedPassword.c_str());
      
      int attempts = 0;
      while (WiFi.status() != WL_CONNECTED && attempts < 20) {
        delay(500);
        attempts++;
      }
      
      if (WiFi.status() == WL_CONNECTED) {
        isStationMode = true;
      } else {
        setupAP();
      }
    } else {
      setupAP();
    }
  } else {
    setupAP();
  }
  
  // Server routes
  server.on("/", HTTP_GET, handleRoot);
  server.on("/login", HTTP_POST, handleLogin);
  server.on("/api/scan", HTTP_GET, handleScan);
  server.on("/api/connect", HTTP_POST, handleConnect);
  server.on("/api/status", HTTP_GET, handleStatus);
  server.on("/logout", HTTP_GET, handleLogout);
  
  // Handle static files
  server.onNotFound([]() {
    if (!handleFileRead(server.uri())) {
      server.send(404, "text/plain", "Not Found");
    }
  });
  
  // Start the server
  server.begin();
}

void loop() {
  if (!isStationMode) {
    dnsServer.processNextRequest();
  }
  server.handleClient();
  
  // Session timeout
  if (isAuthenticated && millis() - lastActivity > SESSION_TIMEOUT) {
    isAuthenticated = false;
  }
}