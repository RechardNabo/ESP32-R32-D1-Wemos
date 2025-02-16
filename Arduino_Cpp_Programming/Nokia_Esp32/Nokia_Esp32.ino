#include <SPI.h>
#include <WiFiClientSecure.h>
#include <Adafruit_GFX.h>
#include <Adafruit_PCD8544.h>

/* Declare LCD object for SPI
 Adafruit_PCD8544(CLK,DIN,D/C,CE,RST); */
Adafruit_PCD8544 display = Adafruit_PCD8544(18, 23, 4, 15, 2);
int contrastValue = 60; 
const int adcPin = 34;
int adcValue = 0;

void setup(){
  Serial.begin(9600);
  SPI.begin();
  display.begin();
  pinMode(LED_BUILTIN, OUTPUT);
  display.setContrast(contrastValue);
  display.clearDisplay();
  display.display();
  delay(1000);
  
}

void NETWORK(){
  const char* ssid     = "HUAWEI-FFAC";     // your network SSID (name of wifi network)
  const char* password = "B41D5H8811G"; // your network password
  Serial.print("Attempting to connect to SSID: ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);

  // attempt to connect to Wifi network:
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    digitalWrite(LED_BUILTIN, LOW);
    // wait 1 second for re-trying
    delay(1000);
  }
  Serial.print("\nConnected to ");
  Serial.println(ssid);
}


float TEMPERATURE(){
  float average, temperature, voltage = 0;
  int ADC_VALUE;
  for(int i = 0 ; i < 50 ; i-=-1){
      ADC_VALUE =  analogRead(adcPin);
      average = average + ADC_VALUE; 
    }
    voltage = (average / 50)*(3.3/4096);
    temperature  = (voltage -1.375)/0.0225;
    return temperature;
    
  }

void SERVER(){
    NETWORK();
    while (WiFi.status() == WL_CONNECTED) {
          digitalWrite(LED_BUILTIN, HIGH);
    }
  }
  
void DISPLAY_LCD(){
  display.setTextColor(WHITE, BLACK);
  display.setCursor(0,1);
  display.setTextSize(1);
  display.println("|TEMP-SENSOR|");
  display.setTextSize(1);
  display.setTextColor(BLACK);
  display.setCursor(0, 12);
  display.println("|NETWORK|");
  display.setCursor(0,22);
  display.println("|IP-ADDRESS|");
  display.setCursor(0,32);
  display.println("|TEMP :"+String(TEMPERATURE())+"|");
  display.display();
  delay(2000);
  display.setCursor(0,32);
  display.println("               ");
}

  
void loop(){
  TEMPERATURE();
  DISPLAY_LCD();
}
