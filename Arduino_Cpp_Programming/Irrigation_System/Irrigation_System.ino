/*********
  Rui Santos & Sara Santos - Random Nerd Tutorials
  Complete project details at https://RandomNerdTutorials.com/esp32-esp8266-plot-chart-web-server/
  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files.
  The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*********/
#ifdef ESP32
  #include <WiFi.h>
  #include <ESPAsyncWebServer.h>
  #include <LittleFS.h>
#else
  #include <Arduino.h>
  #include <ESP8266WiFi.h>
  #include <Hash.h>
  #include <ESPAsyncTCP.h>
  #include <ESPAsyncWebServer.h>
  #include <LittleFS.h>
  #include <FS.h>
#endif
#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <DHT.h>
//#include <LiquidCrystal_I2C.h>
#include <float.h>
#include <string.h>

#define CORE_0 (0x00)
#define CORE_1 (0x01)
#define DHTPIN 22       // ESP32 pin connected to the DHT22 data pin
#define DHTTYPE DHT11  // DHT 22 (AM2302)
// Create AsyncWebServer object on port 80
AsyncWebServer server(80);
DHT dht(DHTPIN, DHTTYPE);
//LiquidCrystal_I2C lcd(0x27, 16, 2); // Set the LCD address to 0x27 for a 16x2 display

//TaskHandle_t Microcontroller_Core_0;  // Task handle for Core 0
//TaskHandle_t Microcontroller_Core_1;  // Task handle for Core 1

// Replace with your network credentials
const char* ssid = "Huawei-NET";
const char* password = "extremehacktivist";


void START_SERVER(void){
    server.on("/", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(LittleFS, "/index.html");
  });
  server.on("/temperature", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send_P(200, "text/plain", String(READ_DTH22_TEMPERATURE()).c_str());
  });
  server.on("/humidity", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send_P(200, "text/plain", String(READ_DTH22_HUMIDITY()).c_str());
  });
  server.on("/moisture", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send_P(200, "text/plain", String(READ_SOIL_MOISTURE()).c_str());
  });

  server.begin();
}

void CONNECT_WIFI(void){
    WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi..");
  }
  Serial.println(WiFi.localIP());
}

void MOUNT_SYSTEM_FILES(void){
    if(!LittleFS.begin()){
    Serial.println("An Error has occurred while mounting LittleFS");
        return;
  }
}

float READ_DTH22_HUMIDITY(void){

  float humidity = dht.readHumidity();
  if (isnan(humidity) || isnan(READ_DTH22_TEMPERATURE())) {
    Serial.println("Failed to read from DHT sensor!");
    return (humidity);
  }
  Serial.print("Humidity: ");
  Serial.print(humidity);
  Serial.print("%");
  delay(2000); // Wait for 2 seconds between readings
  return (humidity);
}


float READ_DTH22_TEMPERATURE(void){

  float temperature = dht.readTemperature();  // Default in Celsius
  if (isnan(READ_DTH22_HUMIDITY()) || isnan(temperature)) {
    Serial.println("Failed to read from DHT sensor!");
    return (temperature);
  }
  Serial.print("Temperature: ");
  Serial.print(temperature);
  Serial.println("°C");
  delay(2000); // Wait for 2 seconds between readings
  return (temperature);
}

int READ_SOIL_MOISTURE(void){
  #define SOIL_MOISTURE_PIN 34  // ESP32 analog pin connected to the sensor
  int sensorValue = analogRead(SOIL_MOISTURE_PIN);

  // Map the sensor value to a percentage (assuming 0-100% for dry to wet)
  int soilMoisturePercent = map(sensorValue, 0, 4095, 0, 100);

  // Print the soil moisture percentage
  Serial.print("Soil Moisture: ");
  Serial.print(soilMoisturePercent);
  Serial.println("%");

  delay(1000); // Wait for a second between readings
  return (soilMoisturePercent);
}
void setup(){

  Serial.begin(115200);
  MOUNT_SYSTEM_FILES();
  CONNECT_WIFI();
  START_SERVER();
  //lcd.begin();
  //lcd.backlight(); // Turn on the backlight
  
  // Tasks to be executed on Core 0 and Core 1
  //xTaskCreatePinnedToCore(TaskCore0code, "Microcontroller_Core_0", 10000, NULL, 1, &Microcontroller_Core_0, CORE_0 );
  //xTaskCreatePinnedToCore(TaskCore1code, "Microcontroller_Core_1", 10000, NULL, 1, &Microcontroller_Core_1, CORE_1 );

  dht.begin();

}
 
void loop(){

      
}

/*// Task on Microcontroller Core 0
void TaskCore0code(void * parameter) {
  for (;;) {

  }
}

// Task on Microcontroller Core 1
void TaskCore1code(void * parameter) {
  for (;;) {

  }
}*/