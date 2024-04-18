
from machine import ADC , Pin
import utime


def main():
    led = Pin(3, Pin.OUT)
    ADC_Value = ADC(Pin(2))
    ADC_Value.atten(ADC.ATTN_11DB)
    while True:
        
        Bits_Data = ADC_Value.read()
        if Bits_Data >=1000:
            led.value(1)
        else:
            led.value(0)
        print(str(Bits_Data))
        utime.sleep(0.5)
    

if __name__ == "__main__":
    main()