/*A hall effect sensor can detect variations 
  in the magnetic field in its surroundings. 
  The greater the magnetic field, the greater 
  the sensor's output voltage.*/
void setup() {
  Serial.begin(9600);
  pinMode(LED_BUILTIN , OUTPUT);
}

void loop() {
  Serial.println(hallRead());
  if(hallRead() <= 35){digitalWrite(LED_BUILTIN, HIGH);}
  if(hallRead()>=100){digitalWrite(LED_BUILTIN, HIGH);}
  else{digitalWrite(LED_BUILTIN, LOW);}
  delay(1000);

}
