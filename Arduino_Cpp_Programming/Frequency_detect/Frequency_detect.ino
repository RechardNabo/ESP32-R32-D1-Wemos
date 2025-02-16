#define Pulse_Input  14
unsigned int High , Low;
float period , Frequency;;
void setup() {
  Serial.begin(9600);
  pinMode(Pulse_Input , INPUT);
}

void loop() {
  High = pulseIn(Pulse_Input , HIGH);
  Low = pulseIn(Pulse_Input , LOW);
  period = High + Low;
  period = period / 1000;
  Frequency = 1000/ period;
  Serial.println("HIGH = "+String(High));
  Serial.println("LOW = "+String(Low));
  Serial.println("Frequency = "+String(Frequency)+" Hz");
  delay(350);
}
