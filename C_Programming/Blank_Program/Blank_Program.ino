#define PIN 0x1
/*#define PIN2 0x02
#define PIN3 0x03*/
unsigned int pwm= 0x00;
#define Buzzer 0x11
#define Freq  0x3E8

void setup() {
  Serial.begin(9600);
  pinMode(Buzzer , OUTPUT);
  pinMode(PIN, OUTPUT);
}

void loop() {
  /*analogWrite(PIN,pwm);
  analogWrite(PIN2, pwm);
  analogWrite(PIN3 , pwm);
  Serial.println("PWM = "+String(pwm));
  delay(350);
  pwm -=-0x05;
  if(pwm >= 255){
      pwm = 0x00;
    } 
  
  tone(Buzzer , Freq);
  digitalWrite(PIN, HIGH);
  delay(1000);
  noTone(Buzzer);
  digitalWrite(PIN , LOW);
  delay(1000);*/
}
