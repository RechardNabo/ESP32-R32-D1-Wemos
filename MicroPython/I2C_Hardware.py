from machine import Pin , I2C
import utime

I2C_00 = 0x00
I2C_01 = 0x00
I2C_02 = 0x00

I2C_00_SCL = 0x16  # GPIO 22
I2C_00_SDA = 0x15  # GPIO 21

I2C_01_SCL = 0x21  # GPIO 33
I2C_01_SDA = 0x20  # GPIO 32

I2C_03_SCL = 0x13  # GPIO 19
I2C_02_SDA = 0x12  # GPIO 18

I2C_FREQUENCY_100K = 100000
I2C_FREQUENCY_400K = 400000


def I2C_SCAN(I2C_BUS ,  SCL ,  SDA ,  FREQ ):
    print("########[ Scanning I2C Devices ] ########")
    I2C_COM = I2C( I2C_BUS , scl = Pin(SCL) , sda = Pin(SDA) , freq = FREQ)
    devices = I2C_COM.scan()
    if devices:
        print('I2C devices found:', [hex(device) for device in devices])
    else:
        print('No I2C devices found')
    print("########[ Complete ]########\n")
    
    
    
def main():
    
    while(1):
        I2C_SCAN(I2C_00, I2C_00_SCL ,I2C_00_SDA ,I2C_FREQUENCY_400K )
        utime.sleep(0.2)

if __name__ == "__main__":
    main()