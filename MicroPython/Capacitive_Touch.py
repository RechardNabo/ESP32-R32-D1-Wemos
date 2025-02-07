import  machine
from machine import Pin, TouchPad
import utime
OSC_FREQ_240Mhz = 240000000
OSC_FREQ_160Mhz = 160000000
OSC_FREQ_80Mhz  = 80000000
OSC_FREQ_40Mhz  = 40000000
OSC_FREQ_20Mhz  = 20000000

GPIO_CAPACITIVE_T_00 = 0x04
GPIO_CAPACITIVE_T_01 = 0x00
GPIO_CAPACITIVE_T_02 = 0x02
GPIO_CAPACITIVE_T_03 = 0x0F
GPIO_CAPACITIVE_T_04 = 0x0D
GPIO_CAPACITIVE_T_05 = 0x0C
GPIO_CAPACITIVE_T_06 = 0x0E
GPIO_CAPACITIVE_T_07 = 0x1B
GPIO_CAPACITIVE_T_08 = 0x21
GPIO_CAPACITIVE_T_09 = 0x20

def main():
    machine.freq(OSC_FREQ_240Mhz) # set the CPU frequency to 240 MHz
    Sensor = TouchPad(Pin(GPIO_CAPACITIVE_T_00))
    Sensor.config(0)                          #Threshold
    while(1):
        print(machine.freq()) # get the current frequency of the CPU)
        print("Touch Sencor : "+str(Sensor.read()))
        utime.sleep(0.5)
if __name__ == "__main__":
    main()