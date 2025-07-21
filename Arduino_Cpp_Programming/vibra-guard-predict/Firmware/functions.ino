// Additional functions for VibraGuardPredict.ino

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
        
        // Update system settings if provided
        if (settings.containsKey("dataUpdateInterval")) {
          dataUpdateInterval = settings["dataUpdateInterval"];
        }
        
        if (settings.containsKey("autoAlertNotification")) {
          autoAlertNotification = settings["autoAlertNotification"];
        }
        
        if (settings.containsKey("alertSensitivity")) {
          alertSensitivity = settings["alertSensitivity"].as<String>();
        }
        
        if (settings.containsKey("dataBufferSize")) {
          dataBufferSize = settings["dataBufferSize"];
        }
        
        saveConfiguration();
        
        // Confirm to clients
        ws.textAll("{\"type\":\"settings_saved\",\"success\":true}");
      }
      else if (type == "test_sensor") {
        // Test sensor connectivity
        bool success = testSensor();
        
        String response = "{\"type\":\"sensor_test\",\"success\":" + String(success ? "true" : "false") + "}";
        ws.textAll(response);
      }
      else if (type == "add_equipment" && doc.containsKey("equipment")) {
        // Add new equipment
        JsonObject equipObj = doc["equipment"];
        int newId = -1;
        
        // Find first available ID if not specified
        if (!equipObj.containsKey("id") || equipObj["id"].as<int>() < 0) {
          for (int i = 0; i < MAX_EQUIPMENT; i++) {
            if (!equipmentConfigs[i].enabled) {
              newId = i;
              break;
            }
          }
        } else {
          newId = equipObj["id"].as<int>();
        }
        
        // Check if we found an available slot
        if (newId >= 0 && newId < MAX_EQUIPMENT) {
          equipmentConfigs[newId].id = newId;
          if (equipObj.containsKey("name")) {
            equipmentConfigs[newId].name = equipObj["name"].as<String>();
          } else {
            equipmentConfigs[newId].name = "Equipment " + String(newId + 1);
          }
          
          if (equipObj.containsKey("location")) {
            equipmentConfigs[newId].location = equipObj["location"].as<String>();
          } else {
            equipmentConfigs[newId].location = "Location " + String(newId + 1);
          }
          
          equipmentConfigs[newId].enabled = true;
          equipmentConfigs[newId].alertThreshold = equipObj.containsKey("alertThreshold") ? 
              equipObj["alertThreshold"].as<float>() : 3.5;
          equipmentConfigs[newId].criticalThreshold = equipObj.containsKey("criticalThreshold") ? 
              equipObj["criticalThreshold"].as<float>() : 7.0;
              
          equipmentConfigs[newId].lastMaintenance = equipObj.containsKey("lastMaintenance") ? 
              equipObj["lastMaintenance"].as<String>() : "2024-07-01";
          equipmentConfigs[newId].nextMaintenance = equipObj.containsKey("nextMaintenance") ? 
              equipObj["nextMaintenance"].as<String>() : "2024-10-01";
          
          saveConfiguration();
          
          DynamicJsonDocument responseDoc(256);
          responseDoc["type"] = "equipment_added";
          responseDoc["success"] = true;
          responseDoc["equipmentId"] = newId;
          
          String responseJson;
          serializeJson(responseDoc, responseJson);
          ws.textAll(responseJson);
          
          // Update system stats
          systemStatus.activeEquipment++;
        } else {
          ws.textAll("{\"type\":\"equipment_added\",\"success\":false,\"error\":\"No available equipment slots\"}");
        }
      }
      else if (type == "delete_equipment" && doc.containsKey("equipmentId")) {
        // Delete equipment
        int equipId = doc["equipmentId"];
        
        if (equipId >= 0 && equipId < MAX_EQUIPMENT && equipmentConfigs[equipId].enabled) {
          // Just mark as disabled rather than fully deleting
          equipmentConfigs[equipId].enabled = false;
          
          saveConfiguration();
          
          String response = "{\"type\":\"equipment_deleted\",\"success\":true,\"equipmentId\":" + String(equipId) + "}";
          ws.textAll(response);
          
          // Update system stats
          systemStatus.activeEquipment--;
        } else {
          ws.textAll("{\"type\":\"equipment_deleted\",\"success\":false,\"error\":\"Invalid equipment ID\"}");
        }
      }
      else if (type == "update_equipment" && doc.containsKey("equipment")) {
        // Update existing equipment
        JsonObject equipObj = doc["equipment"];
        
        if (equipObj.containsKey("id")) {
          int equipId = equipObj["id"];
          
          if (equipId >= 0 && equipId < MAX_EQUIPMENT) {
            // Update equipment configuration
            if (equipObj.containsKey("name")) {
              equipmentConfigs[equipId].name = equipObj["name"].as<String>();
            }
            
            if (equipObj.containsKey("location")) {
              equipmentConfigs[equipId].location = equipObj["location"].as<String>();
            }
            
            if (equipObj.containsKey("alertThreshold")) {
              equipmentConfigs[equipId].alertThreshold = equipObj["alertThreshold"].as<float>();
            }
            
            if (equipObj.containsKey("criticalThreshold")) {
              equipmentConfigs[equipId].criticalThreshold = equipObj["criticalThreshold"].as<float>();
            }
            
            if (equipObj.containsKey("lastMaintenance")) {
              equipmentConfigs[equipId].lastMaintenance = equipObj["lastMaintenance"].as<String>();
            }
            
            if (equipObj.containsKey("nextMaintenance")) {
              equipmentConfigs[equipId].nextMaintenance = equipObj["nextMaintenance"].as<String>();
            }
            
            if (equipObj.containsKey("enabled")) {
              bool wasEnabled = equipmentConfigs[equipId].enabled;
              bool nowEnabled = equipObj["enabled"].as<bool>();
              
              equipmentConfigs[equipId].enabled = nowEnabled;
              
              // Update system stats if enabled status changed
              if (wasEnabled && !nowEnabled) {
                systemStatus.activeEquipment--;
              } else if (!wasEnabled && nowEnabled) {
                systemStatus.activeEquipment++;
              }
            }
            
            saveConfiguration();
            
            String response = "{\"type\":\"equipment_updated\",\"success\":true,\"equipmentId\":" + String(equipId) + "}";
            ws.textAll(response);
          } else {
            ws.textAll("{\"type\":\"equipment_updated\",\"success\":false,\"error\":\"Invalid equipment ID\"}");
          }
        } else {
          ws.textAll("{\"type\":\"equipment_updated\",\"success\":false,\"error\":\"Equipment ID not specified\"}");
        }
      }
      else if (type == "set_maintenance" && doc.containsKey("equipmentId")) {
        // Set equipment to maintenance mode
        int equipId = doc["equipmentId"];
        
        if (equipId >= 0 && equipId < MAX_EQUIPMENT && equipmentConfigs[equipId].enabled) {
          equipmentData[equipId].status = "maintenance";
          
          String response = "{\"type\":\"maintenance_set\",\"success\":true,\"equipmentId\":" + String(equipId) + "}";
          ws.textAll(response);
        } else {
          ws.textAll("{\"type\":\"maintenance_set\",\"success\":false,\"error\":\"Invalid equipment ID\"}");
        }
      }
    }
  }
}

String getSystemStatusJSON() {
  DynamicJsonDocument doc(1024);
  
  doc["isConnected"] = systemStatus.isConnected;
  doc["activeEquipment"] = systemStatus.activeEquipment;
  doc["alertCount"] = systemStatus.alertCount;
  doc["firmwareVersion"] = systemStatus.firmwareVersion;
  doc["uptime"] = systemStatus.uptime;
  doc["systemTemperature"] = systemStatus.systemTemperature;
  doc["batteryLevel"] = systemStatus.batteryLevel;
  doc["isSensorConnected"] = systemStatus.isSensorConnected;
  
  String response;
  serializeJson(doc, response);
  return response;
}

String getEquipmentDataJSON() {
  DynamicJsonDocument doc(4096);
  JsonArray equipArray = doc.createNestedArray("equipment");
  
  systemStatus.alertCount = 0; // Reset counter to recalculate
  
  for (int i = 0; i < MAX_EQUIPMENT; i++) {
    if (equipmentConfigs[i].enabled) {
      JsonObject equip = equipArray.createNestedObject();
      equip["id"] = equipmentConfigs[i].id;
      equip["name"] = equipmentConfigs[i].name;
      equip["location"] = equipmentConfigs[i].location;
      equip["vibrationLevel"] = equipmentData[i].vibrationLevel;
      equip["temperature"] = equipmentData[i].temperature;
      equip["status"] = equipmentData[i].status;
      equip["frequency"] = equipmentData[i].frequency;
      equip["xAccel"] = equipmentData[i].xAccel;
      equip["yAccel"] = equipmentData[i].yAccel;
      equip["zAccel"] = equipmentData[i].zAccel;
      equip["lastUpdated"] = equipmentData[i].lastUpdated;
      
      // Count alerts
      if (equipmentData[i].status == "warning" || equipmentData[i].status == "critical") {
        systemStatus.alertCount++;
      }
    }
  }
  
  String response;
  serializeJson(doc, response);
  return response;
}

void readSensorData() {
  if (!systemStatus.isSensorConnected) {
    // Generate simulated data if no sensor is connected
    for (int i = 0; i < MAX_EQUIPMENT; i++) {
      if (equipmentConfigs[i].enabled && equipmentData[i].status != "maintenance") {
        // Generate random vibration data based on equipment ID
        // Lower IDs will have more stable readings, higher IDs more variable
        float baseVibration;
        switch (i % 4) {
          case 0: // Operational
            baseVibration = 1.5 + (random(100) / 100.0);
            break;
          case 1: // Mostly operational with occasional spikes
            baseVibration = 2.5 + (random(300) / 100.0);
            break;
          case 2: // Warning level
            baseVibration = 4.0 + (random(200) / 100.0);
            break;
          case 3: // Critical level
            baseVibration = 7.0 + (random(400) / 100.0);
            break;
          default:
            baseVibration = 2.0;
        }
        
        equipmentData[i].vibrationLevel = baseVibration;
        equipmentData[i].temperature = 45 + (i * 5) + (random(200) / 10.0);
        
        // Random accelerometer data
        equipmentData[i].xAccel = (random(2000) - 1000) / 100.0;
        equipmentData[i].yAccel = (random(2000) - 1000) / 100.0;
        equipmentData[i].zAccel = (random(2000) - 1000) / 100.0;
        
        // Set frequency based on vibration level
        equipmentData[i].frequency = 50 + (random(200) - 100) / 10.0;
        
        equipmentData[i].lastUpdated = millis();
      }
    }
  } else {
    // Read real sensor data
    // This would access the MPU6050 and read actual values
    sensors_event_t a, g, temp;
    mpu.getEvent(&a, &g, &temp);
    
    // For demonstration, we're just using the first equipment slot for real data
    if (equipmentConfigs[0].enabled) {
      // Calculate vibration level from accelerometer data
      float x = a.acceleration.x;
      float y = a.acceleration.y;
      float z = a.acceleration.z;
      
      // Normalize to remove gravity component (simplified)
      float vibrationMagnitude = sqrt(x*x + y*y + (z-9.8)*(z-9.8));
      
      equipmentData[0].vibrationLevel = vibrationMagnitude;
      equipmentData[0].temperature = temp.temperature;
      equipmentData[0].xAccel = x;
      equipmentData[0].yAccel = y;
      equipmentData[0].zAccel = z;
      equipmentData[0].frequency = 50.0; // Would need FFT analysis for real frequency
      equipmentData[0].lastUpdated = millis();
    }
    
    // System temperature from sensor
    systemStatus.systemTemperature = temp.temperature;
  }
}

void updateEquipmentStatus() {
  for (int i = 0; i < MAX_EQUIPMENT; i++) {
    if (equipmentConfigs[i].enabled && equipmentData[i].status != "maintenance") {
      equipmentData[i].status = getStatusFromVibration(
        equipmentData[i].vibrationLevel, 
        equipmentConfigs[i].alertThreshold, 
        equipmentConfigs[i].criticalThreshold
      );
    }
  }
}

String getStatusFromVibration(float vibration, float alertThreshold, float criticalThreshold) {
  if (vibration >= criticalThreshold) {
    return "critical";
  } else if (vibration >= alertThreshold) {
    return "warning";
  } else {
    return "operational";
  }
}

void notifyClients() {
  // Send system status and equipment data to all connected WebSocket clients
  String systemData = getSystemStatusJSON();
  String equipmentData = getEquipmentDataJSON();
  
  ws.textAll("{\"type\":\"system_update\",\"data\":" + systemData + "}");
  ws.textAll("{\"type\":\"equipment_update\",\"data\":" + equipmentData + "}");
}

void initializeEquipment() {
  for (int i = 0; i < MAX_EQUIPMENT; i++) {
    equipmentConfigs[i].id = i;
    equipmentConfigs[i].name = "Equipment " + String(i + 1);
    equipmentConfigs[i].location = "Location " + String(i + 1);
    equipmentConfigs[i].alertThreshold = 3.5;
    equipmentConfigs[i].criticalThreshold = 7.0;
    equipmentConfigs[i].lastMaintenance = "2024-07-01";
    equipmentConfigs[i].nextMaintenance = "2024-10-01";
    equipmentConfigs[i].enabled = (i < 6); // Enable first 6 equipment by default
    
    equipmentData[i].vibrationLevel = 0;
    equipmentData[i].temperature = 0;
    equipmentData[i].status = "operational";
    equipmentData[i].xAccel = 0;
    equipmentData[i].yAccel = 0;
    equipmentData[i].zAccel = 0;
    equipmentData[i].frequency = 0;
    equipmentData[i].lastUpdated = 0;
  }
  
  // Set initial system status
  systemStatus.activeEquipment = 6; // Number of enabled equipment
}

void loadConfiguration() {
  // In a real application, this would load from EEPROM or LittleFS
  // For this example, we'll just use the defaults from initializeEquipment()
  
  // Here's how you would load from LittleFS
  /*
  if (LittleFS.exists("/config.json")) {
    File configFile = LittleFS.open("/config.json", "r");
    if (configFile) {
      DynamicJsonDocument doc(4096);
      DeserializationError error = deserializeJson(doc, configFile);
      
      if (!error) {
        // Load system settings
        dataUpdateInterval = doc["dataUpdateInterval"] | 5000;
        autoAlertNotification = doc["autoAlertNotification"] | true;
        alertSensitivity = doc["alertSensitivity"] | "medium";
        dataBufferSize = doc["dataBufferSize"] | 100;
        
        // Load equipment configurations
        JsonArray equipArray = doc["equipment"];
        int equipCount = 0;
        
        for (JsonObject equip : equipArray) {
          int id = equip["id"];
          
          if (id >= 0 && id < MAX_EQUIPMENT) {
            equipmentConfigs[id].id = id;
            equipmentConfigs[id].name = equip["name"] | ("Equipment " + String(id + 1));
            equipmentConfigs[id].location = equip["location"] | ("Location " + String(id + 1));
            equipmentConfigs[id].alertThreshold = equip["alertThreshold"] | 3.5;
            equipmentConfigs[id].criticalThreshold = equip["criticalThreshold"] | 7.0;
            equipmentConfigs[id].lastMaintenance = equip["lastMaintenance"] | "2024-07-01";
            equipmentConfigs[id].nextMaintenance = equip["nextMaintenance"] | "2024-10-01";
            equipmentConfigs[id].enabled = equip["enabled"] | false;
            
            if (equipmentConfigs[id].enabled) {
              equipCount++;
            }
          }
        }
        
        systemStatus.activeEquipment = equipCount;
      }
      
      configFile.close();
    }
  }
  */
}

void saveConfiguration() {
  // In a real application, this would save to EEPROM or LittleFS
  // For this example, we'll just print confirmation
  Serial.println("Configuration saved");
  
  // Here's how you would save to LittleFS
  /*
  DynamicJsonDocument doc(4096);
  
  // Save system settings
  doc["dataUpdateInterval"] = dataUpdateInterval;
  doc["autoAlertNotification"] = autoAlertNotification;
  doc["alertSensitivity"] = alertSensitivity;
  doc["dataBufferSize"] = dataBufferSize;
  
  // Save equipment configurations
  JsonArray equipArray = doc.createNestedArray("equipment");
  for (int i = 0; i < MAX_EQUIPMENT; i++) {
    if (equipmentConfigs[i].enabled) {
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
  }
  
  File configFile = LittleFS.open("/config.json", "w");
  if (configFile) {
    serializeJson(doc, configFile);
    configFile.close();
  }
  */
}

String getTimeString() {
  unsigned long uptime = millis() / 1000; // Convert to seconds
  int days = uptime / (24 * 3600);
  uptime %= (24 * 3600);
  int hours = uptime / 3600;
  uptime %= 3600;
  int minutes = uptime / 60;
  int seconds = uptime % 60;
  
  char buffer[20];
  if (days > 0) {
    sprintf(buffer, "%dd %02d:%02d:%02d", days, hours, minutes, seconds);
  } else {
    sprintf(buffer, "%02d:%02d:%02d", hours, minutes, seconds);
  }
  
  return String(buffer);
}

bool testSensor() {
  if (systemStatus.isSensorConnected) {
    return true;
  } else {
    // Try to reconnect to sensor
    if (!mpu.begin()) {
      return false;
    } else {
      systemStatus.isSensorConnected = true;
      return true;
    }
  }
}
