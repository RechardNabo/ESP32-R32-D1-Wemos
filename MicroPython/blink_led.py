from machine import Pin
import utime

def main():
    led = Pin(2, Pin.OUT)
    while True:
        led.value(1)
        print("led on")
        utime.sleep(0.2)
        led.value(0)
        print("led off")
        utime.sleep(0.2)
if __name__=="__main__":
    main()