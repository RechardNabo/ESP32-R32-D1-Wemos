from machine import Pin 
import utime

# Define constants
TRUE   = 0x01
ON     = 0x01
OUTPUT = 0x00
INPUT  = 0x01
OFF    = 0x00

# Global Variables
GPIO00 = 0x00
GPIO01 = 0x01
GPIO02 = 0x02
GPIO03 = 0x03
GPIO04 = 0x04
GPIO05 = 0x05

GPIO12 = 0x12
GPIO13 = 0x13
GPIO14 = 0x14
GPIO15 = 0x15
GPIO16 = 0x16
GPIO17 = 0x17
GPIO18 = 0x18
GPIO19 = 0x19

GPIO21 = 0x21
GPIO22 = 0x22
GPIO23 = 0x23
GPIO24 = 0x24
GPIO25 = 0x25
GPIO26 = 0x26
GPIO27 = 0x27

GPIO32 = 0x32
GPIO33 = 0x33
GPIO34 = 0x34
GPIO35 = 0x35
GPIO36 = 0x36
GPIO37 = 0x37
GPIO38 = 0x38

class GPIO:
    def __init__(self):
        self.GPIO02 = None
    
    
    def GPIO_INITIALIZE(self, GPIO, DIRECTION):
        #=================[GPIO00]=================
        if DIRECTION == OUTPUT and GPIO == 0x00:
            self.GPIO00 = Pin(GPIO, Pin.OUT)
            
        elif DIRECTION ==  INPUT and GPIO == 0x00:
            self.GPIO00 = Pin(GPIO, Pin.IN)
        #=================[GPIO01]=================    
        elif DIRECTION == OUTPUT and GPIO == 0x01:
            self.GPIO01 = Pin(GPIO, Pin.OUT)
            
        elif DIRECTION ==  INPUT and GPIO == 0x01:
            self.GPIO01 = Pin(GPIO, Pin.IN)
        #=================[GPIO02]=================  
        elif DIRECTION == OUTPUT and GPIO == 0x02:
            self.GPIO02 = Pin(GPIO, Pin.OUT)
            
        elif DIRECTION ==  INPUT and GPIO == 0x02:
            self.GPIO02 = Pin(GPIO, Pin.IN)
        #=================[GPIO03]=================
        elif DIRECTION == OUTPUT and GPIO == 0x03:
            self.GPIO03 = Pin(GPIO, Pin.OUT)
            
        elif DIRECTION ==  INPUT and GPIO == 0x03:
            self.GPIO03 = Pin(GPIO, Pin.IN)
        #=================[GPIO04]=================  
        elif DIRECTION == OUTPUT and GPIO == 0x04:
            self.GPIO04 = Pin(GPIO, Pin.OUT)
            
        elif DIRECTION ==  INPUT and GPIO == 0x04:
            self.GPIO04 = Pin(GPIO, Pin.IN)
        #=================[GPIO05]=================
        elif DIRECTION == OUTPUT and GPIO == 0x05:
            self.GPIO05 = Pin(GPIO, Pin.OUT)
            
        elif DIRECTION ==  INPUT and GPIO == 0x05:
            self.GPIO05 = Pin(GPIO, Pin.IN)
        #=================[GPIO12]=================  
        elif DIRECTION == OUTPUT and GPIO == 0x12:
            self.GPIO12 = Pin(GPIO, Pin.OUT)
            
        elif DIRECTION ==  INPUT and GPIO == 0x12:
            self.GPIO12 = Pin(GPIO, Pin.IN)
        #=================[GPIO13]=================
        elif DIRECTION == OUTPUT and GPIO == 0x13:
            self.GPIO13 = Pin(GPIO, Pin.OUT)
            
        elif DIRECTION ==  INPUT and GPIO == 0x13:
            self.GPIO13 = Pin(GPIO, Pin.IN)
        #=================[GPIO14]=================  
        elif DIRECTION == OUTPUT and GPIO == 0x14:
            self.GPIO14 = Pin(GPIO, Pin.OUT)
            
        elif DIRECTION ==  INPUT and GPIO == 0x14:
            self.GPIO14 = Pin(GPIO, Pin.IN)
        #=================[GPIO15]=================
        elif DIRECTION == OUTPUT and GPIO == 0x15:
            self.GPIO15 = Pin(GPIO, Pin.OUT)
            
        elif DIRECTION ==  INPUT and GPIO == 0x15:
            self.GPIO15 = Pin(GPIO, Pin.IN)
        #=================[GPIO16]=================  
        elif DIRECTION == OUTPUT and GPIO == 0x16:
            self.GPIO16 = Pin(GPIO, Pin.OUT)
            
        elif DIRECTION ==  INPUT and GPIO == 0x16:
            self.GPIO16 = Pin(GPIO, Pin.IN)
        #=================[GPIO17]=================
        elif DIRECTION == OUTPUT and GPIO == 0x17:
            self.GPIO17 = Pin(GPIO, Pin.OUT)
            
        elif DIRECTION ==  INPUT and GPIO == 0x17:
            self.GPIO17 = Pin(GPIO, Pin.IN)
        #=================[GPIO18]=================  
        elif DIRECTION == OUTPUT and GPIO == 0x18:
            self.GPIO18 = Pin(GPIO, Pin.OUT)
            
        elif DIRECTION ==  INPUT and GPIO == 0x18:
            self.GPIO18 = Pin(GPIO, Pin.IN)
        #=================[GPIO19]=================
        elif DIRECTION == OUTPUT and GPIO == 0x19:
            self.GPIO19 = Pin(GPIO, Pin.OUT)
            
        elif DIRECTION ==  INPUT and GPIO == 0x19:
            self.GPIO19 = Pin(GPIO, Pin.IN)
        #=================[GPIO21]=================  
        elif DIRECTION == OUTPUT and GPIO == 0x21:
            self.GPIO21 = Pin(GPIO, Pin.OUT)
            
        elif DIRECTION ==  INPUT and GPIO == 0x21:
            self.GPIO21 = Pin(GPIO, Pin.IN)
        #=================[GPIO22]=================
        elif DIRECTION == OUTPUT and GPIO == 0x22:
            self.GPIO22 = Pin(GPIO, Pin.OUT)
            
        elif DIRECTION ==  INPUT and GPIO == 0x22:
            self.GPIO22 = Pin(GPIO, Pin.IN)
        #=================[GPIO23]=================  
        elif DIRECTION == OUTPUT and GPIO == 0x23:
            self.GPIO23 = Pin(GPIO, Pin.OUT)
            
        elif DIRECTION ==  INPUT and GPIO == 0x23:
            self.GPIO23 = Pin(GPIO, Pin.IN)
        #=================[GPIO25]=================
        elif DIRECTION == OUTPUT and GPIO == 0x25:
            self.GPIO25 = Pin(GPIO, Pin.OUT)
            
        elif DIRECTION ==  INPUT and GPIO == 0x25:
            self.GPIO25 = Pin(GPIO, Pin.IN)
        #=================[GPIO26]=================  
        elif DIRECTION == OUTPUT and GPIO == 0x26:
            self.GPIO26 = Pin(GPIO, Pin.OUT)
            
        elif DIRECTION ==  INPUT and GPIO == 0x26:
            self.GPIO26 = Pin(GPIO, Pin.IN)
        #=================[GPIO27]=================
        elif DIRECTION == OUTPUT and GPIO == 0x27:
            self.GPIO27 = Pin(GPIO, Pin.OUT)
            
        elif DIRECTION ==  INPUT and GPIO == 0x27:
            self.GPIO27 = Pin(GPIO, Pin.IN)
        #=================[GPIO32]=================  
        elif DIRECTION == OUTPUT and GPIO == 0x32:
            self.GPIO32 = Pin(GPIO, Pin.OUT)
            
        elif DIRECTION ==  INPUT and GPIO == 0x32:
            self.GPIO32 = Pin(GPIO, Pin.IN)
        #=================[GPIO33]=================
        elif DIRECTION == OUTPUT and GPIO == 0x33:
            self.GPIO33 = Pin(GPIO, Pin.OUT)
            
        elif DIRECTION ==  INPUT and GPIO == 0x33:
            self.GPIO33 = Pin(GPIO, Pin.IN)
        #=================[GPIO34]=================  
        elif DIRECTION == INPUT and GPIO == 0x34:  # GPIO34 is input-only
            self.GPIO34 = Pin(GPIO, Pin.IN)
        #=================[GPIO35]=================
        elif DIRECTION == INPUT and GPIO == 0x35:  # GPIO35 is input-only
            self.GPIO35 = Pin(GPIO, Pin.IN)
        #=================[GPIO36]=================  
        elif DIRECTION == INPUT and GPIO == 0x36:  # GPIO36 is input-only
            self.GPIO36 = Pin(GPIO, Pin.IN)
        #=================[GPIO39]=================
        elif DIRECTION == INPUT and GPIO == 0x39:  # GPIO39 is input-only
            self.GPIO39 = Pin(GPIO, Pin.IN)
    
    
    def GPIO_WRITE(self, GPIO, DATA):
        
        if GPIO == GPIO00:
            self.GPIO00.value(DATA)
        elif GPIO == GPIO01:
            self.GPIO01.value(DATA)
        elif GPIO == GPIO02:
            self.GPIO02.value(DATA)
        elif GPIO == GPIO03:
            self.GPIO03.value(DATA)
        elif GPIO == GPIO04:
            self.GPIO04.value(DATA)
        elif GPIO == GPIO05:
            self.GPIO05.value(DATA)
        elif GPIO == GPIO12:
            self.GPIO12.value(DATA)
        elif GPIO == GPIO13:
            self.GPIO13.value(DATA)
        elif GPIO == GPIO14:
            self.GPIO14.value(DATA)
        elif GPIO == GPIO15:
            self.GPIO15.value(DATA)
        elif GPIO == GPIO16:
            self.GPIO16.value(DATA)
        elif GPIO == GPIO17:
            self.GPIO17.value(DATA)
        elif GPIO == GPIO18:
            self.GPIO18.value(DATA)
        elif GPIO == GPIO19:
            self.GPIO19.value(DATA)
        elif GPIO == GPIO21:
            self.GPIO21.value(DATA)
        elif GPIO == GPIO22:
            self.GPIO22.value(DATA)
        elif GPIO == GPIO23:
            self.GPIO23.value(DATA)
        elif GPIO == GPIO25:
            self.GPIO25.value(DATA)
        elif GPIO == GPIO26:
            self.GPIO26.value(DATA)
        elif GPIO == GPIO27:
            self.GPIO27.value(DATA)
        elif GPIO == GPIO32:
            self.GPIO32.value(DATA)
        elif GPIO == GPIO33:
            self.GPIO33.value(DATA)
        elif GPIO == GPIO34:
            self.GPIO34.value(DATA)
        else:
            print("GPIO Pin does not exist !.")
        
    def GPIO_READ(self, GPIO):
        if GPIO == GPIO00:
            return self.GPIO00.value()
        elif GPIO == GPIO01:
            return self.GPIO01.value()
        elif GPIO == GPIO02:
            return self.GPIO02.value()
        elif GPIO == GPIO03:
            return self.GPIO03.value()
        elif GPIO == GPIO04:
            return self.GPIO04.value()
        elif GPIO == GPIO05:
            return self.GPIO05.value()
        elif GPIO == GPIO12:
            return self.GPIO12.value()
        elif GPIO == GPIO13:
            return self.GPIO13.value()
        elif GPIO == GPIO14:
            return self.GPIO14.value()
        elif GPIO == GPIO15:
            return self.GPIO15.value()
        elif GPIO == GPIO16:
            return self.GPIO16.value()
        elif GPIO == GPIO17:
            return self.GPIO17.value()
        elif GPIO == GPIO18:
            return self.GPIO18.value()
        elif GPIO == GPIO19:
            return self.GPIO19.value()
        elif GPIO == GPIO21:
            return self.GPIO21.value()
        elif GPIO == GPIO22:
            return self.GPIO22.value()
        elif GPIO == GPIO23:
            return self.GPIO23.value()
        elif GPIO == GPIO25:
            return self.GPIO25.value()
        elif GPIO == GPIO26:
            return self.GPIO26.value()
        elif GPIO == GPIO27:
            return self.GPIO27.value()
        elif GPIO == GPIO32:
            return self.GPIO32.value()
        elif GPIO == GPIO33:
            return self.GPIO33.value()
        elif GPIO == GPIO34:
            return self.GPIO34.value()
        elif GPIO == GPIO35:
            return self.GPIO35.value()
        elif GPIO == GPIO36:
            return self.GPIO36.value()
        elif GPIO == GPIO39:
            return self.GPIO39.value()
        else:
            print("GPIO Pin does not exist !.")


def main():
    print("GPIO Digitals")
    GPIO_SET = GPIO()
    GPIO_SET.GPIO_INITIALIZE(GPIO02,OUTPUT)
    while(1):
        
        GPIO_SET.GPIO_WRITE(0x02,0x01)
        utime.sleep(1)
        
        GPIO_SET.GPIO_WRITE(0x02,0x00)
        utime.sleep(1)


if __name__ == "__main__":
    main()