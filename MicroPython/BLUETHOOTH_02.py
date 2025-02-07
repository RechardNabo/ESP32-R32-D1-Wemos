from machine import Pin
from time import sleep
from bluetooth import BLE

class ESP32Bluetooth:
    def __init__(self):
        self.ble = BLE()
        self.ble.active(True)
        print("Bluetooth activated")

    def is_bluetooth_on(self):
        if self.ble.active():
            print("Bluetooth is ON")
        else:
            print("Bluetooth is OFF")

    def make_discoverable(self):
        self.ble.config(gap_name='ESP32_BT')
        print("ESP32 is discoverable as 'ESP32_BT'")

    def scan_devices(self):
        print("Scanning for devices...")
        devices = self.ble.gap_scan(5000)  # Scan for 5 seconds
        if devices:
            print("Found devices:")
            for device in devices:
                print(device)
        else:
            print("No devices found")

    def show_status(self):
        print("Bluetooth Status:")
        self.is_bluetooth_on()
        print("ESP32 is now discoverable to other devices.")

def main():
    esp32_bt = ESP32Bluetooth()
    esp32_bt.show_status()
    esp32_bt.make_discoverable()
    while(1):
        esp32_bt.scan_devices()

if __name__ == "__main__":
    main()
