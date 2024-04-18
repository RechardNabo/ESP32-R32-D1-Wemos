#define T0 0x04
void setup() {
  Serial.begin(9600);
  pinMode(LED_BUILTIN, OUTPUT);
}

void loop() {
  Serial.println("Touch"+String(touchRead(T0)));
  if(touchRead(T0) < 50){
      digitalWrite(LED_BUILTIN , HIGH);
  }
  else{digitalWrite(LED_BUILTIN, LOW);}
  delay(350);
}
