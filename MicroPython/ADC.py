
from machine import ADC , Pin
import utime

GPIO_ADC1_CH0 = 0x24   # GPIO36
GPIO_ADC1_CH1 = 0x25   # GPIO37
GPIO_ADC1_CH2 = 0x26   # GPIO38
GPIO_ADC1_CH3 = 0x27   # GPIO39
GPIO_ADC1_CH4 = 0x20   # GPIO32
GPIO_ADC1_CH5 = 0x21   # GPIO33
GPIO_ADC1_CH6 = 0x22   # GPIO34
GPIO_ADC1_CH7 = 0x23   # GPIO35

GPIO_ADC2_CH0 = 0x04   # GPIO4
GPIO_ADC2_CH1 = 0x00   # GPIO0
GPIO_ADC2_CH2 = 0x02   # GPIO2
GPIO_ADC2_CH3 = 0x0F   # GPIO15
GPIO_ADC2_CH4 = 0x0D   # GPIO13
GPIO_ADC2_CH5 = 0x0C   # GPIO12
GPIO_ADC2_CH6 = 0x0E   # GPIO14
GPIO_ADC2_CH7 = 0x1B   # GPIO27
GPIO_ADC2_CH8 = 0x19   # GPIO25
GPIO_ADC2_CH9 = 0x1A   # GPIO26


class ADC_SETUP:
    def __init__(self):
        self.GPIO_ADC1_CH0 = None   # GPIO36
        self.GPIO_ADC1_CH1 = None   # GPIO37
        self.GPIO_ADC1_CH2 = None   # GPIO38
        self.GPIO_ADC1_CH3 = None   # GPIO39
        self.GPIO_ADC1_CH4 = None   # GPIO32
        self.GPIO_ADC1_CH5 = None   # GPIO33
        self.GPIO_ADC1_CH6 = None   # GPIO34
        self.GPIO_ADC1_CH7 = None   # GPIO35

        self.GPIO_ADC2_CH0 = None   # GPIO4
        self.GPIO_ADC2_CH1 = None   # GPIO0
        self.GPIO_ADC2_CH2 = None   # GPIO2
        self.GPIO_ADC2_CH3 = None   # GPIO15
        self.GPIO_ADC2_CH4 = None   # GPIO13
        self.GPIO_ADC2_CH5 = None   # GPIO12
        self.GPIO_ADC2_CH6 = None   # GPIO14
        self.GPIO_ADC2_CH7 = None   # GPIO27
        self.GPIO_ADC2_CH8 = None   # GPIO25
        self.GPIO_ADC2_CH9 = None   # GPIO26
    
    def ADC_READ(self, GPIO_ADCXX):
        if GPIO_ADCXX == GPIO_ADC1_CH0:
            self.GPIO_ADC1_CH0 = ADC(Pin(GPIO_ADCXX))
            self.GPIO_ADC1_CH0.atten(ADC.ATTN_11DB)
            return self.GPIO_ADC1_CH0.read_u16()

        elif GPIO_ADCXX == GPIO_ADC1_CH1:
            self.GPIO_ADC1_CH1 = ADC(Pin(GPIO_ADCXX))
            self.GPIO_ADC1_CH1.atten(ADC.ATTN_11DB)
            return self.GPIO_ADC1_CH1.read_u16()

        elif GPIO_ADCXX == GPIO_ADC1_CH2:
            self.GPIO_ADC1_CH2 = ADC(Pin(GPIO_ADCXX))
            self.GPIO_ADC1_CH2.atten(ADC.ATTN_11DB)
            return self.GPIO_ADC1_CH2.read_u16()

        elif GPIO_ADCXX == GPIO_ADC1_CH3:
            self.GPIO_ADC1_CH3 = ADC(Pin(GPIO_ADCXX))
            self.GPIO_ADC1_CH3.atten(ADC.ATTN_11DB)
            return self.GPIO_ADC1_CH3.read_u16()

        elif GPIO_ADCXX == GPIO_ADC1_CH4:
            self.GPIO_ADC1_CH4 = ADC(Pin(GPIO_ADCXX))
            self.GPIO_ADC1_CH4.atten(ADC.ATTN_11DB)
            return self.GPIO_ADC1_CH4.read_u16()

        elif GPIO_ADCXX == GPIO_ADC1_CH5:
            self.GPIO_ADC1_CH5 = ADC(Pin(GPIO_ADCXX))
            self.GPIO_ADC1_CH5.atten(ADC.ATTN_11DB)
            return self.GPIO_ADC1_CH5.read_u16()

        elif GPIO_ADCXX == GPIO_ADC1_CH6:
            self.GPIO_ADC1_CH6 = ADC(Pin(GPIO_ADCXX))
            self.GPIO_ADC1_CH6.atten(ADC.ATTN_11DB)
            return self.GPIO_ADC1_CH6.read_u16()

        elif GPIO_ADCXX == GPIO_ADC1_CH7:
            self.GPIO_ADC1_CH7 = ADC(Pin(GPIO_ADCXX))
            self.GPIO_ADC1_CH7.atten(ADC.ATTN_11DB)
            return self.GPIO_ADC1_CH7.read_u16()

        elif GPIO_ADCXX == GPIO_ADC2_CH0:
            self.GPIO_ADC2_CH0 = ADC(Pin(GPIO_ADCXX))
            self.GPIO_ADC2_CH0.atten(ADC.ATTN_11DB)
            return self.GPIO_ADC2_CH0.read_u16()

        elif GPIO_ADCXX == GPIO_ADC2_CH1:
            self.GPIO_ADC2_CH1 = ADC(Pin(GPIO_ADCXX))
            self.GPIO_ADC2_CH1.atten(ADC.ATTN_11DB)
            return self.GPIO_ADC2_CH1.read_u16()

        elif GPIO_ADCXX == GPIO_ADC2_CH2:
            self.GPIO_ADC2_CH2 = ADC(Pin(GPIO_ADCXX))
            self.GPIO_ADC2_CH2.atten(ADC.ATTN_11DB)
            return self.GPIO_ADC2_CH2.read_u16()

        elif GPIO_ADCXX == GPIO_ADC2_CH3:
            self.GPIO_ADC2_CH3 = ADC(Pin(GPIO_ADCXX))
            self.GPIO_ADC2_CH3.atten(ADC.ATTN_11DB)
            return self.GPIO_ADC2_CH3.read_u16()

        elif GPIO_ADCXX == GPIO_ADC2_CH4:
            self.GPIO_ADC2_CH4 = ADC(Pin(GPIO_ADCXX))
            self.GPIO_ADC2_CH4.atten(ADC.ATTN_11DB)
            return self.GPIO_ADC2_CH4.read_u16()

        elif GPIO_ADCXX == GPIO_ADC2_CH5:
            self.GPIO_ADC2_CH5 = ADC(Pin(GPIO_ADCXX))
            self.GPIO_ADC2_CH5.atten(ADC.ATTN_11DB)
            return self.GPIO_ADC2_CH5.read_u16()

        elif GPIO_ADCXX == GPIO_ADC2_CH6:
            self.GPIO_ADC2_CH6 = ADC(Pin(GPIO_ADCXX))
            self.GPIO_ADC2_CH6.atten(ADC.ATTN_11DB)
            return self.GPIO_ADC2_CH6.read_u16()

        elif GPIO_ADCXX == GPIO_ADC2_CH7:
            self.GPIO_ADC2_CH7 = ADC(Pin(GPIO_ADCXX))
            self.GPIO_ADC2_CH7.atten(ADC.ATTN_11DB)
            return self.GPIO_ADC2_CH7.read_u16()

        elif GPIO_ADCXX == GPIO_ADC2_CH8:
            self.GPIO_ADC2_CH8 = ADC(Pin(GPIO_ADCXX))
            self.GPIO_ADC2_CH8.atten(ADC.ATTN_11DB)
            return self.GPIO_ADC2_CH8.read_u16()

        elif GPIO_ADCXX == GPIO_ADC2_CH9:
            self.GPIO_ADC2_CH9 = ADC(Pin(GPIO_ADCXX))
            self.GPIO_ADC2_CH9.atten(ADC.ATTN_11DB)
            return self.GPIO_ADC2_CH9.read_u16()

                    

        

def main():
    ADC_SET = ADC_SETUP()
    while True:
        print("ADC")
        print(ADC_SET.ADC_READ(GPIO_ADC2_CH2))
        utime.sleep(0.5)   

if __name__ == "__main__":
    main()