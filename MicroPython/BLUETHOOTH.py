from bluetooth import BLE
import ubluetooth

class BLEScanner:
    def __init__(self):
        self.ble = BLE()
        self.ble.active(True)
        self.devices = {}

    def scan_devices(self, timeout=5):
        self.devices = {}
        self.ble.gap_scan(timeout * 1000, 30000, 30000)
        print("Scanning for Bluetooth devices...")

        # Waiting for the scan to complete
        ubluetooth.gap_scan(timeout * 1000, self._scan_callback)
        
        print(f"Found {len(self.devices)} devices.")
        for addr, name in self.devices.items():
            print(f"Device: {name} Address: {addr}")

    def _scan_callback(self, addr_type, addr, adv_type, rssi, adv_data):
        name = self.ble.resolve_adv_data(adv_data, ubluetooth.ADV_NAME_CMPL) or 'Unknown'
        self.devices[addr] = name

    def connect_device(self, device_name):
        for addr, name in self.devices.items():
            if name == device_name:
                print(f"Connecting to {name}...")
                self.ble.gap_connect(addr_type=0, addr=addr)
                return True
        print(f"Device {device_name} not found.")
        return False

def main():
    scanner = BLEScanner()
    scanner.scan_devices()

if __name__ == "__main__":
    main()

