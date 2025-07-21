/*
 * Process Water Watch - Helper Functions
 * 
 * This file contains helper functions for the ProcessWaterWatch.ino firmware,
 * including sensor reading, WebSocket message handling, and JSON formatting.
 */

// WebSocket message handling
void handleWebSocketMessage(void *arg, uint8_t *data, size_t len) {
  AwsFrameInfo *info = (AwsFrameInfo*)arg;
  if (info->final && info->index == 0 && info->len == len && info->opcode == WS_TEXT) {
    data[len] = 0;
    String message = (char*)data;
    
    DynamicJsonDocument doc(JSON_BUFFER_SIZE);
    DeserializationError error = deserializeJson(doc, message);
    
    if (error) {
      Serial.print("deserializeJson() failed: ");
      Serial.println(error.c_str());
      return;
    }
    
    if (doc.containsKey("type")) {
      String type = doc["type"];
      
      if (type == "acknowledge_alert" && doc.containsKey("alertId")) {
        String alertId = doc["alertId"];
        
        for (int i = 0; i < alertCount; i++) {
          if (alerts[i].id == alertId) {
            alerts[i].acknowledged = true;
            
            // Notify all clients about the update
            ws.textAll("{\"type\":\"alert_acknowledged\",\"alertId\":\"" + alertId + "\"}");
            break;
          }
        }
      }
      else if (type == "dismiss_alert" && doc.containsKey("alertId")) {
        String alertId = doc["alertId"];
        
        // Find and remove the alert
        for (int i = 0; i < alertCount; i++) {
          if (alerts[i].id == alertId) {
            // Reduce alert count for the corresponding station
            for (int j = 0; j < MAX_STATIONS; j++) {
              if (stations[j].name == alerts[i].station && stations[j].alertCount > 0) {
                stations[j].alertCount--;
                break;
              }
            }
            
            // Remove alert by shifting remaining alerts
            for (int j = i; j < alertCount - 1; j++) {
              alerts[j] = alerts[j + 1];
            }
            alertCount--;
            
            // Notify all clients about the update
            ws.textAll("{\"type\":\"alert_dismissed\",\"alertId\":\"" + alertId + "\"}");
            break;
          }
        }
      }
      else if (type == "test_sensors") {
        bool success = testSensors();
        String response = "{\"type\":\"sensors_test\",\"success\":" + String(success ? "true" : "false") + "}";
        ws.textAll(response);
      }
      else if (type == "update_station" && doc.containsKey("station")) {
        JsonObject stationObj = doc["station"];
        if (stationObj.containsKey("id")) {
          String stationId = stationObj["id"];
          
          // Find the station
          for (int i = 0; i < MAX_STATIONS; i++) {
            if (stations[i].id == stationId) {
              if (stationObj.containsKey("name")) {
                stations[i].name = stationObj["name"].as<String>();
              }
              if (stationObj.containsKey("location")) {
                stations[i].location = stationObj["location"].as<String>();
              }
              if (stationObj.containsKey("enabled")) {
                bool wasEnabled = stations[i].enabled;
                stations[i].enabled = stationObj["enabled"];
                
                // If changing from disabled to enabled, update status
                if (!wasEnabled && stations[i].enabled) {
                  stations[i].status = "online";
                  stations[i].lastUpdate = getCurrentTimeString();
                }
                // If changing from enabled to disabled, update status
                else if (wasEnabled && !stations[i].enabled) {
                  stations[i].status = "offline";
                }
              }
              
              // Notify clients of the update
              ws.textAll("{\"type\":\"station_updated\",\"stationId\":\"" + stationId + "\"}");
              break;
            }
          }
        }
      }
    }
  }
}

// Read sensor data and update readings
void readSensorData() {
  // Read temperature
  tempSensor.requestTemperatures();
  float temperature = tempSensor.getTempCByIndex(0);
  
  // Read pH
  float phVoltage = analogRead(PH_SENSOR_PIN) * 3.3 / 4095.0;
  float ph = 3.5 * phVoltage + 0.0; // Calibration formula: adjust as needed
  
  // Read turbidity
  float turbidityVoltage = analogRead(TURBIDITY_PIN) * 3.3 / 4095.0;
  float turbidity = -1120.4*pow(turbidityVoltage, 2) + 5742.3*turbidityVoltage - 4352.9; // Calibration formula
  
  // Read dissolved oxygen
  float doVoltage = analogRead(DO_SENSOR_PIN) * 3.3 / 4095.0;
  float dissolvedOxygen = doVoltage * 2.5; // Calibration formula: adjust as needed
  
  // Read conductivity
  float condVoltage = analogRead(CONDUCTIVITY_PIN) * 3.3 / 4095.0;
  float conductivity = condVoltage * 150.0; // Calibration formula: adjust as needed
  
  // Read free chlorine
  float chlorineVoltage = analogRead(CHLORINE_PIN) * 3.3 / 4095.0;
  float chlorine = chlorineVoltage * 0.5; // Calibration formula: adjust as needed
  
  // Update readings for online stations only
  for (int i = 0; i < MAX_STATIONS; i++) {
    if (stations[i].status != "offline" && stations[i].enabled) {
      // Create slight variations for different stations
      currentReadings[i].id = "reading-" + String(millis());
      currentReadings[i].stationId = stations[i].id;
      currentReadings[i].ph = ph + (random(20) - 10) / 10.0;
      currentReadings[i].temperature = temperature + (random(40) - 20) / 10.0;
      currentReadings[i].turbidity = max(0.0, turbidity + (random(20) - 10) / 10.0);
      currentReadings[i].dissolvedOxygen = max(0.0, dissolvedOxygen + (random(20) - 10) / 10.0);
      currentReadings[i].conductivity = max(0.0, (double)(conductivity + (random(100) - 50)));
      currentReadings[i].chlorine = max(0.0, chlorine + (random(10) - 5) / 20.0);
      currentReadings[i].timestamp = millis();
      
      // Update station status
      stations[i].lastUpdate = getCurrentTimeString();
      
      // Check for alerts
      checkAlerts(i);
    }
  }
}

// Generate demo readings when no sensors are connected
void generateDemoReadings() {
  const struct {
    float ph;
    float temperature;
    float turbidity;
    float dissolvedOxygen;
    float conductivity;
    float chlorine;
  } baseValues[MAX_STATIONS] = {
    {7.2, 22.0, 2.1, 8.5, 450.0, 0.8}, // Primary Treatment
    {8.1, 24.0, 4.2, 7.8, 520.0, 1.2}, // Secondary Treatment
    {7.8, 21.0, 1.8, 9.1, 480.0, 0.5}, // Final Discharge
    {7.0, 20.0, 8.5, 8.8, 420.0, 0.0}  // Intake Monitoring
  };
  
  for (int i = 0; i < MAX_STATIONS; i++) {
    if (stations[i].status != "offline" && stations[i].enabled) {
      currentReadings[i].id = "reading-" + String(millis());
      currentReadings[i].stationId = stations[i].id;
      currentReadings[i].ph = baseValues[i].ph + (random(40) - 20) / 100.0;
      currentReadings[i].temperature = baseValues[i].temperature + (random(40) - 20) / 10.0;
      currentReadings[i].turbidity = max(0.0, baseValues[i].turbidity + (random(30) - 15) / 10.0);
      currentReadings[i].dissolvedOxygen = max(0.0, baseValues[i].dissolvedOxygen + (random(20) - 10) / 10.0);
      currentReadings[i].conductivity = max(0.0, (double)(baseValues[i].conductivity + (random(100) - 50)));
      currentReadings[i].chlorine = max(0.0, baseValues[i].chlorine + (random(10) - 5) / 20.0);
      currentReadings[i].timestamp = millis();
      
      // Update station status
      stations[i].lastUpdate = getCurrentTimeString();
      
      // Check for alerts
      checkAlerts(i);
    }
  }
  
  // Generate some abnormal values for the second station to trigger alerts
  if (stations[1].status != "offline" && stations[1].enabled) {
    if (random(100) < 20) { // 20% chance of abnormal pH
      currentReadings[1].ph = 8.9; // pH out of normal range
    }
  }
  
  // Generate some critical values for the fourth station if it's enabled
  if (stations[3].status != "offline" && stations[3].enabled && random(100) < 10) {
    currentReadings[3].turbidity = 15.2; // Critically high turbidity
  }
}

// Check sensor values and generate alerts if needed
void checkAlerts(int stationIndex) {
  // Define thresholds
  const struct {
    float ph_min;
    float ph_max;
    float temp_min;
    float temp_max;
    float turb_max;
    float do_min;
    float cond_min;
    float cond_max;
    float chlor_min;
    float chlor_max;
  } thresholds = {
    6.5, 8.5,  // pH min, max
    15.0, 35.0, // Temperature min, max
    4.0,       // Turbidity max
    7.0,       // Dissolved oxygen min
    300.0, 600.0, // Conductivity min, max
    0.5, 1.5  // Chlorine min, max
  };
  
  const struct {
    float ph_min;
    float ph_max;
    float temp_min;
    float temp_max;
    float turb_max;
    float do_min;
    float cond_min;
    float cond_max;
    float chlor_min;
    float chlor_max;
  } critical = {
    6.0, 9.0,  // pH critical min, max
    10.0, 40.0, // Temperature critical min, max
    10.0,      // Turbidity critical max
    5.0,       // Dissolved oxygen critical min
    200.0, 800.0, // Conductivity critical min, max
    0.2, 2.0  // Chlorine critical min, max
  };
  
  // Maximum 10 alerts
  if (alertCount >= 10) return;
  
  WaterQualityReading& reading = currentReadings[stationIndex];
  Station& station = stations[stationIndex];
  
  // Check pH
  if (reading.ph < critical.ph_min || reading.ph > critical.ph_max) {
    createAlert(station.name, "pH", reading.ph, reading.ph < critical.ph_min ? critical.ph_min : critical.ph_max, "critical");
  } else if (reading.ph < thresholds.ph_min || reading.ph > thresholds.ph_max) {
    createAlert(station.name, "pH", reading.ph, reading.ph < thresholds.ph_min ? thresholds.ph_min : thresholds.ph_max, "warning");
  }
  
  // Check temperature
  if (reading.temperature < critical.temp_min || reading.temperature > critical.temp_max) {
    createAlert(station.name, "Temperature", reading.temperature, reading.temperature < critical.temp_min ? critical.temp_min : critical.temp_max, "critical");
  } else if (reading.temperature < thresholds.temp_min || reading.temperature > thresholds.temp_max) {
    createAlert(station.name, "Temperature", reading.temperature, reading.temperature < thresholds.temp_min ? thresholds.temp_min : thresholds.temp_max, "warning");
  }
  
  // Check turbidity
  if (reading.turbidity > critical.turb_max) {
    createAlert(station.name, "Turbidity", reading.turbidity, critical.turb_max, "critical");
  } else if (reading.turbidity > thresholds.turb_max) {
    createAlert(station.name, "Turbidity", reading.turbidity, thresholds.turb_max, "warning");
  }
  
  // Check dissolved oxygen
  if (reading.dissolvedOxygen < critical.do_min) {
    createAlert(station.name, "Dissolved Oxygen", reading.dissolvedOxygen, critical.do_min, "critical");
  } else if (reading.dissolvedOxygen < thresholds.do_min) {
    createAlert(station.name, "Dissolved Oxygen", reading.dissolvedOxygen, thresholds.do_min, "warning");
  }
  
  // Check conductivity
  if (reading.conductivity < critical.cond_min || reading.conductivity > critical.cond_max) {
    createAlert(station.name, "Conductivity", reading.conductivity, reading.conductivity < critical.cond_min ? critical.cond_min : critical.cond_max, "critical");
  } else if (reading.conductivity < thresholds.cond_min || reading.conductivity > thresholds.cond_max) {
    createAlert(station.name, "Conductivity", reading.conductivity, reading.conductivity < thresholds.cond_min ? thresholds.cond_min : thresholds.cond_max, "warning");
  }
  
  // Check chlorine
  if (reading.chlorine < critical.chlor_min || reading.chlorine > critical.chlor_max) {
    createAlert(station.name, "Free Chlorine", reading.chlorine, reading.chlorine < critical.chlor_min ? critical.chlor_min : critical.chlor_max, "critical");
  } else if (reading.chlorine < thresholds.chlor_min || reading.chlorine > thresholds.chlor_max) {
    createAlert(station.name, "Free Chlorine", reading.chlorine, reading.chlorine < thresholds.chlor_min ? thresholds.chlor_min : thresholds.chlor_max, "warning");
  }
  
  // Update station status based on alerts
  if (station.alertCount > 0) {
    station.status = "warning";
  }
}

// Create a new alert
void createAlert(String stationName, String parameter, float value, float threshold, String severity) {
  // Check if we already have a similar alert for this station and parameter
  for (int i = 0; i < alertCount; i++) {
    if (alerts[i].station == stationName && alerts[i].parameter == parameter) {
      // Update existing alert
      alerts[i].value = value;
      alerts[i].threshold = threshold;
      alerts[i].severity = severity;
      alerts[i].timestamp = millis();
      alerts[i].acknowledged = false;
      return;
    }
  }
  
  // Create new alert
  if (alertCount < 10) {
    alerts[alertCount].id = "alert-" + String(millis());
    alerts[alertCount].station = stationName;
    alerts[alertCount].parameter = parameter;
    alerts[alertCount].value = value;
    alerts[alertCount].threshold = threshold;
    alerts[alertCount].severity = severity;
    alerts[alertCount].timestamp = millis();
    alerts[alertCount].acknowledged = false;
    
    // Increment alert count for the station
    for (int i = 0; i < MAX_STATIONS; i++) {
      if (stations[i].name == stationName) {
        stations[i].alertCount++;
        break;
      }
    }
    
    alertCount++;
  }
}

// Notify all connected WebSocket clients with updated data
void notifyClients() {
  ws.textAll("{\"type\":\"stations_update\",\"data\":" + getStationsJSON() + "}");
  ws.textAll("{\"type\":\"readings_update\",\"data\":" + getCurrentReadingsJSON() + "}");
  ws.textAll("{\"type\":\"alerts_update\",\"data\":" + getAlertsJSON() + "}");
}

// JSON formatting functions
String getStationsJSON() {
  DynamicJsonDocument doc(JSON_BUFFER_SIZE);
  JsonArray stationsArray = doc.createNestedArray("stations");
  
  for (int i = 0; i < MAX_STATIONS; i++) {
    JsonObject station = stationsArray.createNestedObject();
    station["id"] = stations[i].id;
    station["name"] = stations[i].name;
    station["location"] = stations[i].location;
    station["status"] = stations[i].status;
    station["lastUpdate"] = stations[i].lastUpdate;
    station["alertCount"] = stations[i].alertCount;
    station["enabled"] = stations[i].enabled;
  }
  
  String result;
  serializeJson(doc, result);
  return result;
}

String getCurrentReadingsJSON() {
  DynamicJsonDocument doc(JSON_BUFFER_SIZE);
  
  for (int i = 0; i < MAX_STATIONS; i++) {
    if (stations[i].status != "offline" && stations[i].enabled) {
      JsonObject reading = doc.createNestedObject(stations[i].id);
      reading["id"] = currentReadings[i].id;
      reading["stationId"] = currentReadings[i].stationId;
      reading["ph"] = currentReadings[i].ph;
      reading["temperature"] = currentReadings[i].temperature;
      reading["turbidity"] = currentReadings[i].turbidity;
      reading["dissolvedOxygen"] = currentReadings[i].dissolvedOxygen;
      reading["conductivity"] = currentReadings[i].conductivity;
      reading["chlorine"] = currentReadings[i].chlorine;
      reading["timestamp"] = currentReadings[i].timestamp;
    }
  }
  
  String result;
  serializeJson(doc, result);
  return result;
}

String getAlertsJSON() {
  DynamicJsonDocument doc(JSON_BUFFER_SIZE);
  JsonArray alertsArray = doc.createNestedArray("alerts");
  
  for (int i = 0; i < alertCount; i++) {
    JsonObject alert = alertsArray.createNestedObject();
    alert["id"] = alerts[i].id;
    alert["station"] = alerts[i].station;
    alert["parameter"] = alerts[i].parameter;
    alert["value"] = alerts[i].value;
    alert["threshold"] = alerts[i].threshold;
    alert["severity"] = alerts[i].severity;
    alert["timestamp"] = alerts[i].timestamp;
    alert["acknowledged"] = alerts[i].acknowledged;
  }
  
  String result;
  serializeJson(doc, result);
  return result;
}

String getSystemStatusJSON() {
  DynamicJsonDocument doc(512);
  
  doc["isConnected"] = WiFi.status() == WL_CONNECTED;
  doc["sensorsConnected"] = sensorsConnected;
  doc["stationsOnline"] = countStationsByStatus("online");
  doc["stationsWarning"] = countStationsByStatus("warning");
  doc["stationsOffline"] = countStationsByStatus("offline");
  doc["activeAlerts"] = alertCount;
  doc["firmwareVersion"] = "1.0.0";
  doc["uptime"] = millis() / 1000;
  doc["freeHeap"] = ESP.getFreeHeap();
  doc["wifiMode"] = USE_WIFI_STA ? "Station" : "AccessPoint";
  doc["ipAddress"] = USE_WIFI_STA ? WiFi.localIP().toString() : WiFi.softAPIP().toString();
  
  String result;
  serializeJson(doc, result);
  return result;
}

// Helper functions
int countStationsByStatus(String status) {
  int count = 0;
  for (int i = 0; i < MAX_STATIONS; i++) {
    if (stations[i].status == status) {
      count++;
    }
  }
  return count;
}

String getCurrentTimeString() {
  unsigned long now = millis() / 1000;
  int hours = (now / 3600) % 24;
  int minutes = (now / 60) % 60;
  int seconds = now % 60;
  
  char timeStr[9];
  sprintf(timeStr, "%02d:%02d:%02d", hours, minutes, seconds);
  return String(timeStr);
}
