from machine import DAC, Pin
import utime

GPIO_DAC01   = 0x19
GPIO_DAC02   = 0x1A

class DAC_SETUP:
    def __init__(self):
        self.GPIO_DAC01 = None
        self.GPIO_DAC02 = None
        
    def DAC_VOLTAGE(self, GPIO_DAC, VOLTAGE):
        if GPIO_DAC == GPIO_DAC01: #GPIO25
            self.GPIO_DAC01 = DAC(Pin(GPIO_DAC))
            self.GPIO_DAC01.write(VOLTAGE)
        
        elif GPIO_DAC == GPIO_DAC02: #GPIO26
            self.GPIO_DAC02 = DAC(Pin(GPIO_DAC))
            self.GPIO_DAC02.write(VOLTAGE)

def main():
    DAC_SET = DAC_SETUP()
    while(1):
        print("DAC")
        DAC_SET.DAC_VOLTAGE(GPIO_DAC01,255)
        utime.sleep(0.2)

if __name__=="__main__":
    main()


        