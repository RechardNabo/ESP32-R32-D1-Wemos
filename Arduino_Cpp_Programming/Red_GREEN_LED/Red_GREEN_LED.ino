/*
 * ESP32 R32 D1 LED Blink
 * 
 * This sketch blinks two LEDs connected to pins 21 and 22
 * of the ESP32 development board.
 */

// Define LED pins
#define RG_GREEN  21
#define RG_RED    22

// Blink interval in milliseconds
const int blinkInterval = 500;

void setup() {
  // Initialize serial communication
  Serial.begin(9600);
  
  // Initialize LED pins as outputs
  pinMode(RG_GREEN, OUTPUT);
  pinMode(RG_RED, OUTPUT);
  
  // Initially turn off both LEDs
  digitalWrite(RG_GREEN, LOW);
  digitalWrite(RG_RED, LOW);
  
  Serial.println("ESP32 LED Blink initialized");
}

void loop() {
  // Turn on green LED, turn off red LED
  digitalWrite(RG_GREEN, HIGH);
  digitalWrite(RG_RED, LOW);
  Serial.println("Green LED ON, Red LED OFF");
  delay(blinkInterval);
  
  // Turn off green LED, turn on red LED
  digitalWrite(RG_GREEN, LOW);
  digitalWrite(RG_RED, HIGH);
  Serial.println("Green LED OFF, Red LED ON");
  delay(blinkInterval);
}