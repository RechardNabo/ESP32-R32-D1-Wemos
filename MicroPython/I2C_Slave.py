from machine import Pin, SoftI2C  
import time  

# Define GPIO pins for I2C  
SDA_PIN = 21  # GPIO21 for SDA  
SCL_PIN = 22  # GPIO22 for SCL  
SLAVE_ADDR = 0x07  # Slave address  

# Initialize GPIO pins  
sda = Pin(SDA_PIN, Pin.IN, Pin.PULL_UP)  
scl = Pin(SCL_PIN, Pin.IN, Pin.PULL_UP)  

# Buffer to store received data  
received_data = bytearray()  

def handle_start():  
    """Detect start condition"""  
    if scl.value() == 1 and sda.value() == 0:  
        print("START condition detected!")  
        return True  
    return False  

def handle_stop():  
    """Detect stop condition"""  
    if scl.value() == 1 and sda.value() == 1:  
        print("STOP condition detected!")  
        return True  
    return False  

def read_byte():  
    """Read a byte from master"""  
    byte = 0  
    print("Starting to read byte...")  

    for i in range(8):  
        while scl.value() == 0:  # Wait for clock to go high  
            pass  
        print(f"Reading bit {i}")  
        bit = sda.value()  
        byte = (byte << 1) | bit  
        print(f"Current byte value: 0b{bin(byte)[2:].zfill(8)}")  
        while scl.value() == 1:  # Wait for clock to go low  
            pass  

    # Send ACK  
    print("Preparing to send ACK...")  
    sda = Pin(SDA_PIN, Pin.OUT, Pin.PULL_UP)  
    sda.value(0)  # ACK  
    print("ACK sent (pulled SDA low)")  

    while scl.value() == 0:  # Wait for clock  
        pass  
    while scl.value() == 1:  
        pass  

    sda = Pin(SDA_PIN, Pin.IN, Pin.PULL_UP)  
    print(f"Byte read complete: 0x{byte:02x}")  
    return byte  

def slave_listen():  
    """Main loop to listen for I2C communications"""  
    global received_data  
    print("\n--- I2C Slave Listening ---")  

    while True:  
        # Wait for start condition  
        if handle_start():  
            print("\nNew I2C Transaction Started")  
            # Read address byte  
            addr = read_byte()  
            print(f"Address received: 0x{addr:02x}")  

            # Check if this device is being addressed (including R/W bit)  
            if (addr >> 1) == SLAVE_ADDR:  
                print(f"This device (0x{SLAVE_ADDR:02x}) is being addressed!")  

                # If it's a write operation (LSB = 0)  
                if (addr & 0x01) == 0:  
                    print("Write operation detected")  
                    # Read data bytes until stop condition  
                    while True:  
                        byte = read_byte()  
                        received_data.append(byte)  

                        # Display received byte in multiple formats  
                        print(f"Received byte:")  
                        print(f"  - ASCII: '{chr(byte)}' (if printable)")  
                        print(f"  - HEX: 0x{byte:02x}")  
                        print(f"  - BIN: 0b{bin(byte)[2:].zfill(8)}")  
                        print(f"  - DEC: {byte}")  

                        # Show total received data  
                        print(f"Total received data (hex): {' '.join([hex(x)[2:].zfill(2) for x in received_data])}")  

                        if handle_stop():  
                            print("Transaction completed")  
                            break  
                else:  
                    print("Read operation requested (not implemented)")  
            else:  
                print(f"Address mismatch. Received: 0x{addr:02x}, Expected: 0x{SLAVE_ADDR:02x}")  

def setup_i2c():  
    """Initialize I2C configuration"""  
    print("\nInitializing I2C Slave Configuration:")  
    print(f"SDA Pin: GPIO{SDA_PIN}")  
    print(f"SCL Pin: GPIO{SCL_PIN}")  
    print(f"Slave Address: 0x{SLAVE_ADDR:02x}")  
    print("Pull-up resistors: 1.0 kΩ")  
    print("Bus voltage: 3.3V")  

    # Calculate theoretical current through pull-up resistors  
    current_ma = (3.3 / 1.0) # V/kΩ = mA  
    print(f"Maximum current through pull-up when line is low: {current_ma:.1f}mA")  

def main():  
    """Main program execution"""  
    try:  
        setup_i2c()  
        print("\nI2C Slave started successfully")  
        print("Waiting for master device communication...")  
        print("Press Ctrl+C to stop the program")  
        slave_listen()  

    except KeyboardInterrupt:  
        print("\nProgram terminated by user")  

    except Exception as e:  
        print(f"\nError occurred: {str(e)}")  

    finally:  
        # Clean up  
        print("\nCleaning up GPIO pins...")  
        sda = Pin(SDA_PIN, Pin.IN, Pin.PULL_UP)  
        scl = Pin(SCL_PIN, Pin.IN, Pin.PULL_UP)  
        print("Cleanup complete")  

if __name__ == "__main__":  
    main()  