from machine import Pin , PWM
import utime
GPIO00_PWM  = 0x00
GPIO02_PWM  = 0x02
GPIO04_PWM  = 0x04
GPIO05_PWM  = 0x05
GPIO12_PWM = 0x0C
GPIO13_PWM = 0x0D
GPIO14_PWM = 0x0E
GPIO15_PWM = 0x0F
GPIO16_PWM = 0x10
GPIO17_PWM = 0x11
GPIO18_PWM = 0x12
GPIO19_PWM = 0x13
GPIO21_PWM = 0x15
GPIO22_PWM = 0x16
GPIO23_PWM = 0x17
GPIO25_PWM = 0x19
GPIO26_PWM = 0x1A
GPIO27_PWM = 0x1B
GPIO32_PWM = 0x20
GPIO33_PWM = 0x21

PWM_000_PERCENT_DUTY   = 0x000
PWM_025_PERCENT_DUTY   = 0x100
PWM_050_PERCENT_DUTY   = 0x200 
PWM_075_PERCENT_DUTY   = 0x300
PWM_100_PERCENT_DUTY   = 0x400

class PWM_SETUP:
    
    def __init__(self):
        GPIO00_PWM  = None
        GPIO02_PWM  = None
        GPIO04_PWM  = None
        GPIO05_PWM  = None
        GPIO12_PWM = None
        GPIO13_PWM = None
        GPIO14_PWM = None
        GPIO15_PWM = None
        GPIO16_PWM = None
        GPIO17_PWM = None
        GPIO18_PWM = None
        GPIO19_PWM = None
        GPIO21_PWM = None
        GPIO22_PWM = None
        GPIO23_PWM = None
        GPIO25_PWM = None
        GPIO26_PWM = None
        GPIO27_PWM = None
        GPIO32_PWM = None
        GPIO33_PWM = None
        
    def PWM_GENERATE(self, GPIO_PWM, FREQUENCY, DUTY_CYCLE):
        if GPIO_PWM == GPIO00_PWM:
            self.GPIO00_PWM =  PWM(Pin(GPIO_PWM))
            self.GPIO00_PWM.freq(FREQUENCY)
            self.GPIO00_PWM.duty(DUTY_CYCLE)
            
        elif GPIO_PWM == GPIO02_PWM:  # GPIO02
            self.GPIO02_PWM = PWM(Pin(GPIO_PWM))
            self.GPIO02_PWM.freq(FREQUENCY)
            self.GPIO02_PWM.duty(DUTY_CYCLE)
            
        elif GPIO_PWM == 0x04:  # GPIO04
            self.GPIO04_PWM = PWM(Pin(GPIO_PWM))
            self.GPIO04_PWM.freq(FREQUENCY)
            self.GPIO04_PWM.duty(DUTY_CYCLE)
            
        elif GPIO_PWM == 0x05:  # GPIO05
            self.GPIO05_PWM = PWM(Pin(GPIO_PWM))
            self.GPIO05_PWM.freq(FREQUENCY)
            self.GPIO05_PWM.duty(DUTY_CYCLE)
            
        elif GPIO_PWM == 0x0C:  # GPIO12
            self.GPIO12_PWM = PWM(Pin(GPIO_PWM))
            self.GPIO12_PWM.freq(FREQUENCY)
            self.GPIO12_PWM.duty(DUTY_CYCLE)
            
        elif GPIO_PWM == 0x0D:  # GPIO13
            self.GPIO13_PWM = PWM(Pin(GPIO_PWM))
            self.GPIO13_PWM.freq(FREQUENCY)
            self.GPIO13_PWM.duty(DUTY_CYCLE)
        elif GPIO_PWM == 0x0E:  # GPIO14
            self.GPIO14_PWM = PWM(Pin(GPIO_PWM))
            self.GPIO14_PWM.freq(FREQUENCY)
            self.GPIO14_PWM.duty(DUTY_CYCLE)
            
        elif GPIO_PWM == 0x0F:  # GPIO15
            self.GPIO15_PWM = PWM(Pin(GPIO_PWM))
            self.GPIO15_PWM.freq(FREQUENCY)
            self.GPIO15_PWM.duty(DUTY_CYCLE)
            
        elif GPIO_PWM == 0x10:  # GPIO16
            self.GPIO16_PWM = PWM(Pin(GPIO_PWM))
            self.GPIO16_PWM.freq(FREQUENCY)
            self.GPIO16_PWM.duty(DUTY_CYCLE)
            
        elif GPIO_PWM == 0x11:  # GPIO17
            self.GPIO17_PWM = PWM(Pin(GPIO_PWM))
            self.GPIO17_PWM.freq(FREQUENCY)
            self.GPIO17_PWM.duty(DUTY_CYCLE)
            
        elif GPIO_PWM == 0x12:  # GPIO18
            self.GPIO18_PWM = PWM(Pin(GPIO_PWM))
            self.GPIO18_PWM.freq(FREQUENCY)
            self.GPIO18_PWM.duty(DUTY_CYCLE)
            
        elif GPIO_PWM == 0x13:  # GPIO19
            self.GPIO19_PWM = PWM(Pin(GPIO_PWM))
            self.GPIO19_PWM.freq(FREQUENCY)
            self.GPIO19_PWM.duty(DUTY_CYCLE)
            
        elif GPIO_PWM == 0x15:  # GPIO21
            self.GPIO21_PWM = PWM(Pin(GPIO_PWM))
            self.GPIO21_PWM.freq(FREQUENCY)
            self.GPIO21_PWM.duty(DUTY_CYCLE)
            
        elif GPIO_PWM == 0x16:  # GPIO22
            self.GPIO22_PWM = PWM(Pin(GPIO_PWM))
            self.GPIO22_PWM.freq(FREQUENCY)
            self.GPIO22_PWM.duty(DUTY_CYCLE)
            
        elif GPIO_PWM == 0x17:  # GPIO23
            self.GPIO23_PWM = PWM(Pin(GPIO_PWM))
            self.GPIO23_PWM.freq(FREQUENCY)
            self.GPIO23_PWM.duty(DUTY_CYCLE)
            
        elif GPIO_PWM == 0x19:  # GPIO25
            self.GPIO25_PWM = PWM(Pin(GPIO_PWM))
            self.GPIO25_PWM.freq(FREQUENCY)
            self.GPIO25_PWM.duty(DUTY_CYCLE)
            
        elif GPIO_PWM == 0x1A:  # GPIO26
            self.GPIO26_PWM = PWM(Pin(GPIO_PWM))
            self.GPIO26_PWM.freq(FREQUENCY)
            self.GPIO26_PWM.duty(DUTY_CYCLE)
            
        elif GPIO_PWM == 0x1B:  # GPIO27
            self.GPIO27_PWM = PWM(Pin(GPIO_PWM))
            self.GPIO27_PWM.freq(FREQUENCY)
            self.GPIO27_PWM.duty(DUTY_CYCLE)
            
        elif GPIO_PWM == 0x20:  # GPIO32
            self.GPIO32_PWM = PWM(Pin(GPIO_PWM))
            self.GPIO32_PWM.freq(FREQUENCY)
            self.GPIO32_PWM.duty(DUTY_CYCLE)
            
        elif GPIO_PWM == 0x21:  # GPIO33
            self.GPIO33_PWM = PWM(Pin(GPIO_PWM))
            self.GPIO33_PWM.freq(FREQUENCY)
            self.GPIO33_PWM.duty(DUTY_CYCLE)
            
        
        
def main():
    PWM_SET = PWM_SETUP()
    while(1):
        print("PWM")
        PWM_SET.PWM_GENERATE( GPIO04_PWM, 2 , PWM_050_PERCENT_DUTY)
        
if __name__=="__main__":
    main()