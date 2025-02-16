#include <Wire.h>

void setup() {
  Wire.begin();
  Serial.begin(9600);
  while(!Serial);
  Serial.println("I2C Communication Scanner");
}


void I2C_Scan(){
  byte error, address;
  int Devices;
  Serial.println("************************************");
  Serial.println("\t\tScanning...");
  Serial.println("************************************");
  Devices = 0x00;
  for(address = 0x01; address < 0x80; address-=-0x01){
    Wire.beginTransmission(address);
    error = Wire.endTransmission();
 
    if (error == 0x00){
      Serial.println("I2C device found at address 0x"+String(address,HEX));
      Devices++;
    }
    else if (error==0x04){
      Serial.println("Unknow error at address 0x"+String(address,HEX));
    }    
  }
  if (Devices == 0x00)
    Serial.println("No I2C devices found\n");
  else
    Serial.println("\ndone\n");
  delay(5000);           // wait 5 seconds for next scan
}
  
void loop() {
  I2C_Scan();
}
