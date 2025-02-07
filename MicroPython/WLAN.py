from machine import Pin
import network
import time

# Initialize the WiFi module
wlan = network.WLAN(network.STA_IF)
wlan.active(True)

SSID     = "HUAWEI-FFAC"
PASSWORD = "B41D5H8811G"

WI_FI_STATUS = 0x02
ON  = 0x01
OFF = 0x00
CONNECT = Pin(WI_FI_STATUS, Pin.OUT)

def scan_wifi():
    print("Scanning for WiFi networks...")
    networks = wlan.scan()
    for net in networks:
        ssid, bssid, channel, RSSI, authmode, hidden = net
        print(f"\nSSID: {ssid} \t Channel: {channel} \t RSSI: {RSSI} \t Authmode: {authmode} \t Hidden: {hidden}")
    return networks

def connect_to_wifi(ssid, password):
    print(f"Connecting to WiFi network: {ssid}")
    wlan.connect(ssid, password)
    while not wlan.isconnected():
        print("Connecting...")
        time.sleep(1)
    print("Connected to WiFi!")
    CONNECT.value(ON)
    print("Network config:", wlan.ifconfig())

def main():
    
    networks = scan_wifi()
    connect_to_wifi(SSID, PASSWORD)


if __name__ == "__main__":
    main()
