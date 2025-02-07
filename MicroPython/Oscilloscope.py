import time
from machine import Pin, UART, PWM, I2C

led = Pin(2, Pin.OUT)
# Set up UART (D16 = RX, D17 = TX)
uart = UART(1, baudrate=115200, tx=17, rx=16)

# Set up D14 for rising edge capture
edge_pin = Pin(14, Pin.IN)

# Variables to track time between edges
last_edge_time = time.ticks_ms()
pulse_count = 0

# Function to handle the edge detection on D14
def rising_edge(pin):
    global last_edge_time, pulse_count
    current_time = time.ticks_ms()
    pulse_count += 1
    time_diff = time.ticks_diff(current_time, last_edge_time)
    last_edge_time = current_time

    # Calculate frequency in Hz, kHz, MHz
    if time_diff > 0:
        frequency = 1000 / time_diff  # frequency in Hz
        freq_kHz = frequency / 1000  # frequency in kHz
        freq_MHz = frequency / 1000000  # frequency in MHz

        # Calculate time difference in us, ms, s
        time_us = time_diff * 1000  # time in microseconds
        time_ms = time_diff  # time in milliseconds
        time_sec = time_diff / 1000  # time in seconds

        # Display frequency and time in different units
        print(f"Frequency: {frequency:.2f} Hz, {freq_kHz:.2f} kHz, {freq_MHz:.6f} MHz")
        print(f"Time: {time_us} us, {time_ms} ms, {time_sec:.6f} sec")
        print("#######################################################################")

# Attach interrupt on rising edge
edge_pin.irq(trigger=Pin.IRQ_RISING, handler=rising_edge)

# Function to generate PWM signal on D12
def generate_pwm(pin_num, freq, duty_cycle):
    pwm_pin = Pin(pin_num, Pin.OUT)
    pwm = PWM(pwm_pin)
    pwm.freq(freq)  # Set frequency
    pwm.duty_u16(int(65535 * duty_cycle / 100))  # Set duty cycle (scaled to 16-bit resolution)

    return pwm

# Set up PWM on D12 with 1 kHz frequency and 50% duty cycle
pwm_signal = generate_pwm(12, 1, 50)

# Function to read UART data and display it after receiving complete data
def receive_uart_data():
    received_data = ''
    while True:
        if uart.any():
            try:
                # Read data from UART and decode it
                received_data += uart.read().decode('utf-8')
            except UnicodeError:
                # Handle UnicodeError gracefully, skip any invalid characters
                continue

            # Check for end of data with "\r" (carriage return)
            if received_data.endswith('\r'):
                print("\n")
                print(f"Received UART Data: {received_data.strip()}")
                print("\n")
                break  # Stop after receiving the complete data

# Initialize I2C in slave mode
i2c_slave = I2C(1, scl=Pin(22), sda=Pin(21), freq=100000)

# Set the slave address
SLAVE_ADDRESS = 0x07

def i2c_slave_task():
    print("I2C Slave initialized. Waiting for data...")
    while True:
        try:
            # Attempt to read data sent to the slave
            data = i2c_slave.readfrom(SLAVE_ADDRESS, 8)  # Reading up to 16 bytes
            if data:
                print("Received via I2C:", data.decode('utf-8'))
        except OSError:
            # Handle any communication errors
            pass

# Main loop to continuously display real-time frequency, UART, and I2C data
while True:
    receive_uart_data()  # Wait and print UART data once received
    led.value(1)
    time.sleep(0.5)
    led.value(0)
    time.sleep(0.5)
    i2c_slave_task()
