from machine import Pin
import onewire
import utime

GPIO_I2C_00 = 0x00  # GPIO 0
GPIO_I2C_01 = 0x01  # GPIO 1
GPIO_I2C_02 = 0x02  # GPIO 2
GPIO_I2C_03 = 0x03  # GPIO 3
GPIO_I2C_04 = 0x04  # GPIO 4
GPIO_I2C_05 = 0x05  # GPIO 5

GPIO_I2C_12 = 0x0C  # GPIO 12
GPIO_I2C_13 = 0x0D  # GPIO 13
GPIO_I2C_14 = 0x0E  # GPIO 14
GPIO_I2C_15 = 0x0F  # GPIO 15
GPIO_I2C_16 = 0x10  # GPIO 16
GPIO_I2C_17 = 0x11  # GPIO 17
GPIO_I2C_18 = 0x12  # GPIO 18
GPIO_I2C_19 = 0x13  # GPIO 19

GPIO_I2C_21 = 0x15  # GPIO 21
GPIO_I2C_22 = 0x16  # GPIO 22
GPIO_I2C_23 = 0x17  # GPIO 23
GPIO_I2C_24 = 0x18  # GPIO 24
GPIO_I2C_25 = 0x19  # GPIO 25
GPIO_I2C_26 = 0x1A  # GPIO 26
GPIO_I2C_27 = 0x1B  # GPIO 27

GPIO_I2C_32 = 0x20  # GPIO 32
GPIO_I2C_33 = 0x21  # GPIO 33

def main():
    Device = onewire.OneWire(Pin(GPIO_I2C_17)) 
    Device.scan() 
    Device.reset() 
    Device.readbyte() 
    Device.writebyte(0x12) 
    Device.write('123') 
    Device.select_rom(b'12345678') 

if __name__ == "__main__":
    main()