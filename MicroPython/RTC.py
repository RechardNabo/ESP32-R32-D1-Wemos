from machine import RTC
import utime

rtc = RTC()

def RTC_SET_DATA(year, month, day, hour, minute, second):
    rtc.datetime((year, month, day, 0, hour, minute, second, 0))
    print("RTC time set to: ", rtc.datetime())

def get_time():
    print("#############[ Date and Time ]#############")
    dt = rtc.datetime()
    print("Year:", dt[0])
    print("Month:", dt[1])
    print("Day:", dt[2])
    print("Hour:", dt[4])
    print("Minute:", dt[5])
    print("Second:", dt[6])

def main():
    
    RTC_SET_DATA(2024, 08, 07, 12, 07, 00)
    while(1):
        get_time()
        print("Current RTC time: ", rtc.datetime())
        utime.sleep(1)
        

if __name__ == "__main__":
    main()