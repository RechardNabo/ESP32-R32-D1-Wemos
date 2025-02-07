from machine import Pin
import utime

class TRAFFIC:
    def __init__(self):
        self.HIGH = 0x01
        self.LOW  = 0x00
        
        self.RED1 = Pin(26,Pin.OUT)
        self.RED2 = Pin(16,Pin.OUT)
        self.ORANGE1 = Pin(25,Pin.OUT)
        self.ORANGE2 = Pin(27,Pin.OUT)
        self.GREEN1 = Pin(17,Pin.OUT)
        self.GREEN2 = Pin(14,Pin.OUT)

    def traffic(self):
        self.GREEN2.value(self.LOW)
        self.RED2.value(self.HIGH)
        self.ORANGE1.value(self.LOW)
        self.ORANGE2.value(self.LOW)
        self.RED1.value(self.HIGH)
        utime.sleep(2.0)
        self.RED1.value(self.LOW)
        self.GREEN1.value(self.HIGH)
        utime.sleep(10.0)
        
        self.GREEN1.value(self.LOW)
        self.ORANGE1.value(self.HIGH)
        self.RED1.value(self.LOW)
        utime.sleep(2.0)
        
        self.GREEN1.value(self.LOW)
        self.ORANGE1.value(self.LOW)
        self.RED1.value(self.HIGH)
        self.RED2.value(self.HIGH)
        utime.sleep(1.0)
        self.RED2.value(self.LOW)
        self.GREEN2.value(self.HIGH)
        utime.sleep(10.0)
        
        self.GREEN2.value(self.LOW)
        self.ORANGE2.value(self.HIGH)
        utime.sleep(2.0)
        
    
def main():
    print("Program starting. . .")
    Traffic = TRAFFIC()
    while True:
        Traffic.traffic()

if __name__ =="__main__":
    main()