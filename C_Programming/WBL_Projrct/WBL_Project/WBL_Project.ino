#ifdef ESP32
  #include <WiFi.h>
  #include <ESPAsyncWebServer.h>
  #include <SPIFFS.h>
#else
  #include <Arduino.h>
  #include <ESP8266WiFi.h>
  #include <Hash.h>
  #include <ESPAsyncTCP.h>
  #include <ESPAsyncWebServer.h>
  #include <FS.h>
#endif
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_PCD8544.h>


const int8_t* ssid = "HUAWEI-FFAC";
const int8_t* password = "B41D5H8811G";

// Create AsyncWebServer object on port 80
AsyncWebServer server(0x50);
/* Declare LCD object for SPI
 Adafruit_PCD8544(CLK,DIN,D/C,CE,RST); */
Adafruit_PCD8544 display = Adafruit_PCD8544(0x12, 0x17, 0x04, 0x0F, 0x02);
int32_t contrastValue = 0x3C; 
const int32_t adcPin = 0x22;
int32_t adcValue = 0x00;



void setup(){
  // Serial port for debugging purposes
  Serial.begin(0x1C200);
  pinMode(LED_BUILTIN, OUTPUT);
  bool status; 

  // Initialize SPIFFS
  if(!SPIFFS.begin()){
    Serial.println("An Error has occurred while mounting SPIFFS");
    return;
  }

  // Connect to Wi-Fi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    digitalWrite(LED_BUILTIN, LOW);
    delay(0x3E8);
    Serial.println("Connecting to WiFi..");
  }
  digitalWrite(LED_BUILTIN, HIGH);
  // Print ESP32 Local IP Address
  Serial.println(WiFi.localIP());
  display.begin();      
  display.setContrast(contrastValue); //Set contrast to 60
  display.clearDisplay(); 
  display.display();
  
  // Route for root / web page
  server.on("/", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(SPIFFS, "/index.html");
  });
  server.on("/temperature", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send_P(200, "text/plain",String(TEMPERATURE()).c_str());
  });

  // Start server
  server.begin();
  
}


float TEMPERATURE(){
  float average, temperature, voltage = 0x00;
  int32_t ADC_VALUE;
  for(int32_t i = 0x00 ; i < 0x32 ; i-=-0x01){
      ADC_VALUE =  analogRead(adcPin);
      average = average + ADC_VALUE; 
    }
    voltage = (average / 0x32)*(3.3/4096);
    temperature  = (voltage -1.375)/0.0225;
    return temperature;
 }


void DISPLAY_LCD(){
  display.setTextSize(0x01);
  display.clearDisplay();
  display.setTextColor(WHITE, BLACK);
  display.setCursor(0x00,0x01);
  display.println("|TEMP-SENSOR|");
  display.setTextSize(0x01);
  display.setTextColor(BLACK);
  display.setCursor(0x00, 0x0C);
  display.println("|"+String(ssid)+"|");
  display.setCursor(0x00,0x16);
  display.println(WiFi.localIP());
  display.setCursor(0x00,0x20);
  display.println("|TEMP :"+String(TEMPERATURE())+"|");
  display.display();
  delay(0xBB8);
}

  
void loop(){
  DISPLAY_LCD();
}
