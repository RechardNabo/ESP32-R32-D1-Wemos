from machine import UART , Pin
import time
import utime

class UART_COM:
    def __init__(self, Uart_no , baudrate , tx , rx):
        self.Uart_no = Uart_no
        self.baudrate = baudrate
        self.tx = tx
        self.rx = rx
    def write(self, Data):
        self.uart = UART(self.Uart_no , baudrate = self.baudrate, tx = self.tx , rx = self.rx)
        self.uart.write(Data)
        print(Data)
        time.sleep(1)
    def read(self):
        pass
    
def main():

    UART1 = UART_COM(0x00, 9600, 1 , 3)
    Data = b'Hello world\n'
    print("UART Communication Started !")
    while True:
        UART1.write(Data)
        print("=====[Sending Data]======")
if __name__=="__main__":
    main()