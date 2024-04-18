#define PROCESS1 "Process1"
#define PROCESS2 "Process2"
#define STACK_SIZE 0x2710
#define PRIORITY 0x01
#define CORE_0 0x00
#define CORE_1 0x01
#define CORE_PARAMETERS pvParameters
#define TRUE 0x01
#define FALSE 0x00

TaskHandle_t process1;
TaskHandle_t process2;

void setup() {
  Serial.begin(9600);
  pinMode(LED_BUILTIN , OUTPUT);
  //==================[Core 0 Setup]==========================
  xTaskCreatePinnedToCore(Blink_Internal_LED, PROCESS1, 
                          STACK_SIZE,NULL,
                          PRIORITY,&process1,
                          CORE_0);delay(500);

}



void Blink_Internal_LED(void *CORE_PARAMETERS){
    Serial.println("Process 1  running on core : "+String(xPortGetCoreID()));
    for(;;){
        digitalWrite(LED_BUILTIN, HIGH);
        delay(350);
        digitalWrite(LED_BUILTIN, LOW);
        delay(350);
      }
  }

  
void loop() {
  
}
