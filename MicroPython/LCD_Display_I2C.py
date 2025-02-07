import machine
import utime
from machine import Pin, SoftI2C, ADC
from lcd_api import LcdApi
from i2c_lcd import I2cLcd


I2C_ADDR = 0x27
totalRows = 2
totalColumns = 16

i2c = SoftI2C(scl=Pin(22), sda=Pin(21), freq=10000000)     #

lcd = I2cLcd(i2c, I2C_ADDR, totalRows, totalColumns)


def main():
    while True:
        ADC_Value = ADC(Pin(0))
        ADC_Value.atten(ADC.ATTN_11DB)
        BITS = ADC_Value.read()
        Vout = BITS*((3.3)/(4095))
        TEMP = (Vout-0.5)*(100)
        lcd.move_to(0,0)
        lcd.putstr("Tmprature Sensor")
        lcd.move_to(0,1)
        lcd.putstr("Value : {:.2f}".format(TEMP))
        print("\nTemperature : "+str(TEMP))
        utime.sleep(2)
        lcd.clear()
if __name__ == "__main__":
    main()