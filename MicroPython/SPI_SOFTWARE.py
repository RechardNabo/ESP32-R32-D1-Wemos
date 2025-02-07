from machine import Pin, SoftSPI
import utime

GPIO_SPI_00 = 0x00  # GPIO 0
GPIO_SPI_01 = 0x01  # GPIO 1
GPIO_SPI_02 = 0x02  # GPIO 2
GPIO_SPI_03 = 0x03  # GPIO 3
GPIO_SPI_04 = 0x04  # GPIO 4
GPIO_SPI_05 = 0x05  # GPIO 5
GPIO_SPI_06 = 0x06  # GPIO 6
GPIO_SPI_07 = 0x07  # GPIO 7
GPIO_SPI_08 = 0x08  # GPIO 8
GPIO_SPI_09 = 0x09  # GPIO 9
GPIO_SPI_10 = 0x0A  # GPIO 10
GPIO_SPI_11 = 0x0B  # GPIO 11
GPIO_SPI_12 = 0x0C  # GPIO 12
GPIO_SPI_13 = 0x0D  # GPIO 13
GPIO_SPI_14 = 0x0E  # GPIO 14
GPIO_SPI_15 = 0x0F  # GPIO 15
GPIO_SPI_16 = 0x10  # GPIO 16
GPIO_SPI_17 = 0x11  # GPIO 17
GPIO_SPI_18 = 0x12  # GPIO 18
GPIO_SPI_19 = 0x13  # GPIO 19
GPIO_SPI_20 = 0x14  # GPIO 20
GPIO_SPI_21 = 0x15  # GPIO 21
GPIO_SPI_22 = 0x16  # GPIO 22
GPIO_SPI_23 = 0x17  # GPIO 23
GPIO_SPI_24 = 0x18  # GPIO 24
GPIO_SPI_25 = 0x19  # GPIO 25
GPIO_SPI_26 = 0x1A  # GPIO 26
GPIO_SPI_27 = 0x1B  # GPIO 27
GPIO_SPI_32 = 0x20  # GPIO 32
GPIO_SPI_33 = 0x21  # GPIO 33
GPIO_SPI_34 = 0x22  # GPIO 34
GPIO_SPI_35 = 0x23  # GPIO 35
GPIO_SPI_36 = 0x24  # GPIO 36
GPIO_SPI_37 = 0x25  # GPIO 37
GPIO_SPI_38 = 0x26  # GPIO 38
GPIO_SPI_39 = 0x27  # GPIO 39

SPI_POLARITY_00 = 0x00
SPI_POLARITY_01 = 0x01

SPI_PHASE_00 = 0x00
SPI_PHASE_01 = 0x01

SPI_BUS_01 = 0x00
SPI_BUS_02 = 0x01
SPI_BITS   = 0x08
SPI_BYTES  = 0x0A
class SOFT_SPI_SETUP:
    
    def __init__(self):
        self.GPIO_SPI_CLK  = None
        self.GPIO_SPI_MISO = None
        self.GPIO_SPI_MOSI = None
        self.GPIO_SPI_00 = 0x00  # GPIO 0
        self.GPIO_SPI_01 = 0x01  # GPIO 1
        self.GPIO_SPI_02 = 0x02  # GPIO 2
        self.GPIO_SPI_03 = 0x03  # GPIO 3
        self.GPIO_SPI_04 = 0x04  # GPIO 4
        self.GPIO_SPI_05 = 0x05  # GPIO 5
        self.GPIO_SPI_06 = 0x06  # GPIO 6
        self.GPIO_SPI_07 = 0x07  # GPIO 7
        self.GPIO_SPI_08 = 0x08  # GPIO 8
        self.GPIO_SPI_09 = 0x09  # GPIO 9
        self.GPIO_SPI_10 = 0x0A  # GPIO 10
        self.GPIO_SPI_11 = 0x0B  # GPIO 11
        self.GPIO_SPI_12 = 0x0C  # GPIO 12
        self.GPIO_SPI_13 = 0x0D  # GPIO 13
        self.GPIO_SPI_14 = 0x0E  # GPIO 14
        self.GPIO_SPI_15 = 0x0F  # GPIO 15
        self.GPIO_SPI_16 = 0x10  # GPIO 16
        self.GPIO_SPI_17 = 0x11  # GPIO 17
        self.GPIO_SPI_18 = 0x12  # GPIO 18
        self.GPIO_SPI_19 = 0x13  # GPIO 19
        self.GPIO_SPI_20 = 0x14  # GPIO 20
        self.GPIO_SPI_21 = 0x15  # GPIO 21
        self.GPIO_SPI_22 = 0x16  # GPIO 22
        self.GPIO_SPI_23 = 0x17  # GPIO 23
        self.GPIO_SPI_24 = 0x18  # GPIO 24
        self.GPIO_SPI_25 = 0x19  # GPIO 25
        self.GPIO_SPI_26 = 0x1A  # GPIO 26
        self.GPIO_SPI_27 = 0x1B  # GPIO 27
        self.GPIO_SPI_32 = 0x20  # GPIO 32
        self.GPIO_SPI_33 = 0x21  # GPIO 33
        self.GPIO_SPI_34 = 0x22  # GPIO 34
        self.GPIO_SPI_35 = 0x23  # GPIO 35
        self.GPIO_SPI_36 = 0x24  # GPIO 36
        self.GPIO_SPI_37 = 0x25  # GPIO 37
        self.GPIO_SPI_38 = 0x26  # GPIO 38
        self.GPIO_SPI_39 = 0x27  # GPIO 39
        
    def SPI_INITIALIZE(self , SPI_BAUDRATE , GPIO_SPI_CLK , GPIO_SPI_MISO , GPIO_SPI_MOSI):
        self.GPIO_SPI_CLK = Pin(GPIO_SPI_CLK)
        self.GPIO_SPI_MISO = Pin(GPIO_SPI_MISO)
        self.GPIO_SPI_MOSI = GPIO_SPI_MOSI
        spi = SoftSPI(SPI_BAUDRATE,
                      SPI_POLARITY_01,
                      SPI_PHASE_01,
                      self.GPIO_SPI_CLK,
                      self.GPIO_SPI_MISO,
                      self.GPIO_SPI_MOSI)
        spi.init(SPI_BAUDRATE)
    
    def SPI_WRITE(data):
        spi.write(data)
        
    def SPI_READ(BYTES):
        return (spi.read(SPI_BYTES))

def main():
    while(1):
        utime.sleep(0.5)
        print("SPI Software")
if __name__=="__main__":
    main()
        