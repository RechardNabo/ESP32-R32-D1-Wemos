int sensorPin = 27; // Sensor input pin

void setup() {
    pinMode(sensorPin, INPUT);
    Serial.begin(9600);
    Serial.println("KY-032 Obstacle Detection Test");
}

void loop() {
    int sensorValue = digitalRead(sensorPin);
    Serial.println(String(sensorValue));
    if (sensorValue == LOW) { // Obstacle detected
        Serial.println("Obstacle detected");
    } else {
        Serial.println("No obstacle");
    }
    delay(500);
}