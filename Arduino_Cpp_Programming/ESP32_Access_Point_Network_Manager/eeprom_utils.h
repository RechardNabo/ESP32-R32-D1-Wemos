#ifndef EEPROM_UTILS_H
#define EEPROM_UTILS_H

#include <Arduino.h>
#include <EEPROM.h>

void writeToEEPROM(int addr, String data) {
  for (int i = 0; i < data.length(); i++)
    EEPROM.write(addr + i, data[i]);
  EEPROM.write(addr + data.length(), 0);
  EEPROM.commit();
}

String readFromEEPROM(int addr) {
  String s = "";
  char c;
  for (int i = 0; i < 32; i++) {
    c = EEPROM.read(addr + i);
    if (c == 0) break;
    s += c;
  }
  return s;
}

#endif