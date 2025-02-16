#include <SPI.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include "DHT.h"

#define SCREEN_WIDTH 128 // OLED display width, in pixels
#define SCREEN_HEIGHT 64 // OLED display height, in pixels

// Declaration for SSD1306 display connected using software SPI:
#define OLED_CLK   5  //10
#define OLED_MOSI  21 //9
#define OLED_RESET 18 //13
#define OLED_DC    23 //11
#define OLED_CS    19 //12
#define DHTPIN     22 // DHT 11 PIN
#define HYGROMETER 15 //HYGROMETER PIN 
#define FAN        2
#define DHTTYPE DHT11 // DHT 11 Type


Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, OLED_MOSI, OLED_CLK, OLED_DC, OLED_RESET, OLED_CS);
DHT dht(DHTPIN, DHTTYPE);

void setup(){
  Serial.begin(9600);
  if(!display.begin(SSD1306_SWITCHCAPVCC)) {
    Serial.println(F("SSD1306 allocation failed"));
    for(;;); // Don't proceed, loop forever
  }
  dht.begin();
  pinMode(FAN, OUTPUT);
 }

 void loop(){
    delay(100);
    float h = dht.readHumidity();
    display.clearDisplay();
    // Display Text
    display.setTextSize(1);
    display.setTextColor(WHITE);
    display.setCursor(0, 0);
    display.println("#[Irrigation System]#");
    display.setCursor(0, 12);
    display.println("Temperature :"+String(dht.readTemperature())+" *C");
    display.setCursor(0, 22);
    display.println("Humidity : "+String(dht.readHumidity())+" %");
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
    delay(2000);
    display.clearDisplay();
 }

