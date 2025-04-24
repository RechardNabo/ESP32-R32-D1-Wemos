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
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include "DHT.h"

#define SCREEN_WIDTH 128 // OLED display width, in pixels
#define SCREEN_HEIGHT 64 // OLED display height, in pixels

// Declaration for SSD1306 display connected using software SPI:
#define OLED_CLK      5  //10
#define OLED_MOSI     21 //9
#define OLED_RESET    18 //13
#define OLED_DC       23 //11
#define OLED_CS       19 //12
#define DHTPIN        22 // DHT 11 PIN
#define HYGROMETER    15 //HYGROMETER PIN 
#define FAN           4
#define WIFI_STATUS   2
#define DHTTYPE DHT11 // DHT 11 Type

// Replace with your network credentials
const char* ssid = "Huawei-NET";
const char* password = "extremehacktivist";

// Create AsyncWebServer object on port 80
AsyncWebServer server(80);
DHT dht(DHTPIN, DHTTYPE);
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, OLED_MOSI, OLED_CLK, OLED_DC, OLED_RESET, OLED_CS);


void Mount_LittleFS(bool status){
    // Initialize LittleFS
  if(!LittleFS.begin()){
    Serial.println("An Error has occurred while mounting LittleFS");
        return;
  }
}

void Connect_WiF(bool status){
  // Connect to Wi-Fi
  digitalWrite(WIFI_STATUS, LOW);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi..");
  }
  // Print ESP32 Local IP Address
  Serial.println(WiFi.localIP());
  digitalWrite(WIFI_STATUS, HIGH);
}

void Web_Route(void){
  // Route for root / web page
  server.on("/", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(LittleFS, "/index.html", "text/html");
  });

  // Route for other pages
  server.on("/seasons", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(LittleFS, "/seasons.html", "text/html");
  });
  
  server.on("/configuration", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(LittleFS, "/configuration.html", "text/html");
  });
  
  server.on("/modbus", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(LittleFS, "/modbus.html", "text/html");
  });
  
  server.on("/about", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(LittleFS, "/about.html", "text/html");
  });

    server.onNotFound([](AsyncWebServerRequest *request){
    request->redirect("/");
  });

  server.on("/temperature", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send_P(200, "text/plain", readBME280Temperature().c_str());
  });
  server.on("/humidity", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send_P(200, "text/plain", readBME280Humidity().c_str());
  });
  server.on("/pressure", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send_P(200, "text/plain", readBME280Pressure().c_str());
  });
  server.begin();
}

void OLED_Initialize(void){
  if(!display.begin(SSD1306_SWITCHCAPVCC)) {
    Serial.println(F("SSD1306 allocation failed"));
    for(;;); // Don't proceed, loop forever
  }
}

String readBME280Temperature() {
    return String(dht.readTemperature());
}

String readBME280Humidity() {
   return String(dht.readHumidity());
}

String readBME280Pressure() {
   return String(100.0-((analogRead(HYGROMETER))/(4095.0)*100.0));
}


void setup(){
  Serial.begin(115200);
  pinMode(WIFI_STATUS, OUTPUT);
  pinMode(FAN, OUTPUT);
  bool status; 
  Mount_LittleFS(status);
  Connect_WiF(status);
  Web_Route();
  OLED_Initialize();
}
 
void loop(){
    delay(100);
    float temp = dht.readTemperature();
    float humid = dht.readHumidity();
    if (!isnan(temp) && !isnan(humid)) {
    display.clearDisplay();
    // Display Text
    display.setTextSize(1);
    display.setTextColor(WHITE);
    display.setCursor(0, 0);
    display.println("#[Irrigation System]#");
    display.setCursor(0, 12);
    display.println("Temperature :"+String(temp)+" *C");
    display.setCursor(0, 22);
    display.println("Humidity : "+String(humid)+" %");
    display.setCursor(0, 32);
    display.println("Hygrometer : "+String(100.0-((analogRead(HYGROMETER))/(4095.0)*100.0))+" %");
    if(float(dht.readHumidity())<58.0){
      digitalWrite(FAN, HIGH);
      display.setCursor(0, 44);
      display.println("FAN : ON  ");
    }else{
      digitalWrite(FAN, LOW);
      display.setCursor(0, 44);
      display.println("FAN Control : OFF ");
      }
    display.setCursor(0, 54);
    display.println("Water Pump : OFF ");
    display.display();
    delay(500);
    display.clearDisplay();
    }  
}