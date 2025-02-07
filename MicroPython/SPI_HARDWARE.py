from machine import Pin , SPI
import utime

GPIO_HSPI_CLK  = 0x0E
GPIO_HSPI_MISO = 0x0C
GPIO_HSPI_MOSI = 0x0D

GPIO_VSPI_CLK  = 0x12
GPIO_VSPI_MISO = 0x13
GPIO_VSPI_MOSI = 0x17

GPIO_SPI_SC   = 0x0F

SPI_POLARITY_00 = 0x00
SPI_POLARITY_01 = 0x01

SPI_PHASE_00 = 0x00
SPI_PHASE_01 = 0x01

SPI_BUS_01 = 0x00
SPI_BUS_02 = 0x01
SPI_BITS   = 0x08

class SPI_SETUP:
    
    def __init__(self):
        self.GPIO_SPI_CLK  = None
        self.GPIO_SPI_MISO = None
        self.GPIO_SPI_MOSI = None
        self.SPI_BAUDRATE  = None 
        self.SPI_HARDWARE  = None
        self.SPI_BUS       = None
    
    def XSPI_INITIALIZE(self, SPI_BUS , SPI_BAUDRATE , GPIO_SPI_CLK , GPIO_SPI_MISO , GPIO_SPI_MOSI):
        
        self.GPIO_SPI_CLK  = GPIO_SPI_CLK
        self.GPIO_SPI_MISO = GPIO_SPI_MISO
        self.GPIO_SPI_MOSI = GPIO_SPI_MISO
        self.SPI_BAUDRATE  = SPI_BAUDRATE
        self.SPI_BUS = SPI_BUS
        
        if self.SPI_BUS == SPI_BUS_01 :
            self.SPI_HARDWARE  = SPI(self.SPI_BUS ,
                                     self.SPI_BAUDRATE,
                                     self.GPIO_SPI_CLK,
                                     self.GPIO_SPI_MOSI,
                                     self.GPIO_SPI_MISO)
            
        elif self.SPI_BUS == SPI_BUS_02 :
            self.SPI_HARDWARE  = SPI(self.SPI_BUS ,
                                     self.SPI_BAUDRATE,
                                     SPI_POLARITY_00,
                                     SPI_PHASE_00,
                                     SPI_BITS,
                                     0 ,
                                     self.GPIO_SPI_CLK,
                                     self.GPIO_SPI_MOSI,
                                     self.GPIO_SPI_MISO)
def main():
    while(1):
        print("SPI-Hardware")
        utime.sleep(0.5)

if __name__=="__main__":
    main()
            

        
    
    