import React, { useState, useEffect } from 'react';
import { 
  Wifi, Settings, Zap, Cpu, Globe, Shield, Download, Upload, Save, RotateCcw,
  Thermometer, Activity, Bluetooth
} from 'lucide-react';
import ConfigSection from './components/ConfigSection';
import FormField from './components/FormField';
import StatusIndicator from './components/StatusIndicator';
import FileUpload from './components/FileUpload';
import AdvancedToggle from './components/AdvancedToggle';
import NetworkScanner from './components/NetworkScanner';
import ThemeToggle from './components/ThemeToggle';
import BluetoothControl from './components/BluetoothControl';

interface ESP32Config {
  wifi: {
    ssid: string;
    password: string;
    channel: number;
    encryption: string;
    powerSave: boolean;
    reconnectAttempts: number;
    connectionTimeout: number;
  };
  network: {
    hostname: string;
    staticIp: boolean;
    ipAddress: string;
    gateway: string;
    subnet: string;
    dns1: string;
    dns2: string;
    macAddress: string;
    enableMDNS: boolean;
    webServerPort: number;
  };
  device: {
    deviceName: string;
    location: string;
    description: string;
    timezone: string;
    ntpServer: string;
    enableRTC: boolean;
    sleepMode: string;
    cpuFrequency: number;
  };
  gpio: {
    pin2: string;
    pin4: string;
    pin5: string;
    pin18: string;
    pin19: string;
    pin21: string;
    pin22: string;
    pin23: string;
    pin25: string;
    pin26: string;
    pin27: string;
    pin32: string;
    pin33: string;
  };
  sensors: {
    temperature: boolean;
    humidity: boolean;
    pressure: boolean;
    motion: boolean;
    light: boolean;
    sound: boolean;
    accelerometer: boolean;
    gyroscope: boolean;
    magnetometer: boolean;
    gps: boolean;
  };
  security: {
    enableAuth: boolean;
    username: string;
    password: string;
    enableHttps: boolean;
    apiKey: string;
    enableFirewall: boolean;
    allowedIPs: string[];
    rateLimiting: boolean;
    maxRequests: number;
  };
  system: {
    autoReboot: boolean;
    rebootTime: string;
    logLevel: string;
    enableOTA: boolean;
    enableTelnet: boolean;
    enableSerial: boolean;
    watchdogTimer: boolean;
    memoryMonitoring: boolean;
    temperatureMonitoring: boolean;
    performanceMode: string;
    bootMode: string;
  };
  monitoring: {
    enableMetrics: boolean;
    metricsInterval: number;
    enableAlerts: boolean;
    temperatureThreshold: number;
    memoryThreshold: number;
    uptimeReporting: boolean;
    errorReporting: boolean;
    remoteLogging: boolean;
    logServerUrl: string;
  };
  connectivity: {
    enableBluetooth: boolean;
    bluetoothName: string;
    enableBLE: boolean;
    enableEthernet: boolean;
    enableCAN: boolean;
    canBitrate: number;
    enableI2C: boolean;
    i2cFrequency: number;
    enableSPI: boolean;
    spiFrequency: number;
  };
}

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check if user has a theme preference in localStorage
    const savedTheme = localStorage.getItem('theme');
    // Check if user prefers dark mode in their OS settings
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Return true if theme is explicitly set to 'dark' or if no theme is set and user prefers dark
    return savedTheme === 'dark' || (!savedTheme && prefersDark);
  });
  
  // Apply dark mode class to html when component mounts or when isDarkMode changes
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);
  
  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => !prevMode);
  };
  const [config, setConfig] = useState<ESP32Config>({
    wifi: {
      ssid: '',
      password: '',
      channel: 6,
      encryption: 'WPA2',
      powerSave: false,
      reconnectAttempts: 5,
      connectionTimeout: 10
    },
    network: {
      hostname: 'ESP32-Device',
      staticIp: false,
      ipAddress: '192.168.1.100',
      gateway: '192.168.1.1',
      subnet: '255.255.255.0',
      dns1: '8.8.8.8',
      dns2: '8.8.4.4',
      macAddress: '24:6F:28:AB:CD:EF',
      enableMDNS: true,
      webServerPort: 80
    },
    device: {
      deviceName: 'ESP32 Controller',
      location: 'Living Room',
      description: 'Smart home controller',
      timezone: 'UTC',
      ntpServer: 'pool.ntp.org',
      enableRTC: false,
      sleepMode: 'none',
      cpuFrequency: 240
    },
    gpio: {
      pin2: 'INPUT',
      pin4: 'OUTPUT',
      pin5: 'INPUT',
      pin18: 'OUTPUT',
      pin19: 'INPUT',
      pin21: 'OUTPUT',
      pin22: 'INPUT',
      pin23: 'OUTPUT',
      pin25: 'ANALOG',
      pin26: 'ANALOG',
      pin27: 'INPUT',
      pin32: 'INPUT',
      pin33: 'INPUT'
    },
    sensors: {
      temperature: true,
      humidity: true,
      pressure: false,
      motion: true,
      light: true,
      sound: false,
      accelerometer: false,
      gyroscope: false,
      magnetometer: false,
      gps: false
    },
    security: {
      enableAuth: true,
      username: 'admin',
      password: '',
      enableHttps: false,
      apiKey: '',
      enableFirewall: false,
      allowedIPs: [],
      rateLimiting: false,
      maxRequests: 100
    },
    system: {
      autoReboot: false,
      rebootTime: '03:00',
      logLevel: 'INFO',
      enableOTA: true,
      enableTelnet: false,
      enableSerial: true,
      watchdogTimer: true,
      memoryMonitoring: true,
      temperatureMonitoring: true,
      performanceMode: 'balanced',
      bootMode: 'normal'
    },
    monitoring: {
      enableMetrics: true,
      metricsInterval: 60,
      enableAlerts: false,
      temperatureThreshold: 80,
      memoryThreshold: 85,
      uptimeReporting: true,
      errorReporting: true,
      remoteLogging: false,
      logServerUrl: ''
    },
    connectivity: {
      enableBluetooth: false,
      bluetoothName: 'ESP32-BT',
      enableBLE: false,
      enableEthernet: false,
      enableCAN: false,
      canBitrate: 500000,
      enableI2C: true,
      i2cFrequency: 100000,
      enableSPI: false,
      spiFrequency: 1000000
    }
  });

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
wifi: true,
network: false,
device: false,
gpio: false,
sensors: false,
security: false,
system: false,
monitoring: false,
connectivity: false
});

const [lastSaved, setLastSaved] = useState<Date | null>(null);
const [firmwareFile, setFirmwareFile] = useState<File | null>(null);
const [uploadProgress, setUploadProgress] = useState(0);
const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
const [deviceStatus, setDeviceStatus] = useState<'offline' | 'online' | 'connecting' | 'error'>('offline');

  useEffect(() => {
    // Simulate connection status
    setDeviceStatus('connecting');
    const timer = setTimeout(() => {
      setDeviceStatus('online');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const updateConfig = (section: keyof ESP32Config, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const saveConfig = () => {
    setLastSaved(new Date());
    console.log('Saving configuration:', config);
  };

  const loadConfig = () => {
    console.log('Loading configuration from ESP32...');
  };

  const resetConfig = () => {
    if (confirm('Are you sure you want to reset all settings to default?')) {
      // Reset logic would go here
      console.log('Resetting to defaults...');
    }
  };

  const exportConfig = () => {
    const dataStr = JSON.stringify(config, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'esp32-config.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedConfig = JSON.parse(e.target?.result as string);
          setConfig(importedConfig);
        } catch (error) {
          alert('Error importing configuration file');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleFirmwareUpload = async (file: File) => {
    setFirmwareFile(file);
    setUploadStatus('uploading');
    setUploadProgress(0);

    // Simulate firmware upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploadStatus('success');
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleNetworkSelect = (network: any) => {
    updateConfig('wifi', 'ssid', network.ssid);
    updateConfig('wifi', 'channel', network.channel);
    updateConfig('wifi', 'encryption', network.encryption);
  };

  // Remove duplicate toggleDarkMode declaration

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-background dark:text-dark-text transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Theme toggle button */}
        <div className="flex justify-end pt-4">
          <ThemeToggle isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
        </div>
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">ESP32 Configuration</h1>
              <p className="text-gray-600 mt-2">Advanced configuration panel for your ESP32 device</p>
            </div>
            <div className="flex items-center space-x-4">
              <StatusIndicator status={deviceStatus} label="Device Status" />
              <div className="h-8 w-px bg-gray-300"></div>
              <Cpu className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          {lastSaved && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700">
                Configuration saved successfully at {lastSaved.toLocaleTimeString()}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8 dark:text-gray-300">
          <button
            onClick={saveConfig}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>Save Configuration</span>
          </button>
          
          <button
            onClick={loadConfig}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Load from Device</span>
          </button>
          
          <button
            onClick={exportConfig}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Upload className="h-4 w-4" />
            <span>Export Config</span>
          </button>
          
          <label className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors cursor-pointer">
            <Download className="h-4 w-4" />
            <span>Import Config</span>
            <input
              type="file"
              accept=".json"
              onChange={importConfig}
              className="hidden"
            />
          </label>
          
          <button
            onClick={resetConfig}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset to Defaults</span>
          </button>
        </div>

        {/* Configuration Sections */}
        <div className="space-y-6">
          {/* WiFi Configuration */}
          <ConfigSection
            title="WiFi Configuration"
            icon={<Wifi className="h-5 w-5" />}
            isExpanded={expandedSections.wifi}
            onToggle={() => toggleSection('wifi')}
          >
            <div className="space-y-6">
              <NetworkScanner onNetworkSelect={handleNetworkSelect} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Network SSID">
                  <input
                    type="text"
                    value={config.wifi.ssid}
                    onChange={(e) => updateConfig('wifi', 'ssid', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter WiFi network name"
                  />
                </FormField>
                
                <FormField label="Password">
                  <input
                    type="password"
                    value={config.wifi.password}
                    onChange={(e) => updateConfig('wifi', 'password', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter WiFi password"
                  />
                </FormField>
                
                <FormField label="Channel">
                  <select
                    value={config.wifi.channel}
                    onChange={(e) => updateConfig('wifi', 'channel', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map(ch => (
                      <option key={ch} value={ch}>Channel {ch}</option>
                    ))}
                  </select>
                </FormField>
                
                <FormField label="Encryption">
                  <select
                    value={config.wifi.encryption}
                    onChange={(e) => updateConfig('wifi', 'encryption', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="WPA2">WPA2</option>
                    <option value="WPA3">WPA3</option>
                    <option value="WEP">WEP</option>
                    <option value="OPEN">Open</option>
                  </select>
                </FormField>

                <FormField label="Connection Timeout (seconds)">
                  <input
                    type="number"
                    value={config.wifi.connectionTimeout}
                    onChange={(e) => updateConfig('wifi', 'connectionTimeout', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="5"
                    max="60"
                  />
                </FormField>

                <FormField label="Reconnect Attempts">
                  <input
                    type="number"
                    value={config.wifi.reconnectAttempts}
                    onChange={(e) => updateConfig('wifi', 'reconnectAttempts', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1"
                    max="20"
                  />
                </FormField>
              </div>

              <AdvancedToggle
                enabled={config.wifi.powerSave}
                onChange={(value) => updateConfig('wifi', 'powerSave', value)}
                label="Power Save Mode"
                description="Reduce power consumption at the cost of performance"
              />
            </div>
          </ConfigSection>

          {/* Network Configuration */}
          <ConfigSection
            title="Network Configuration"
            icon={<Globe className="h-5 w-5" />}
            isExpanded={expandedSections.network}
            onToggle={() => toggleSection('network')}
          >
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Hostname">
                  <input
                    type="text"
                    value={config.network.hostname}
                    onChange={(e) => updateConfig('network', 'hostname', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </FormField>

                <FormField label="MAC Address" description="Read-only hardware identifier">
                  <input
                    type="text"
                    value={config.network.macAddress}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </FormField>

                <FormField label="Web Server Port">
                  <input
                    type="number"
                    value={config.network.webServerPort}
                    onChange={(e) => updateConfig('network', 'webServerPort', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1"
                    max="65535"
                  />
                </FormField>
              </div>

              <div className="space-y-4">
                <AdvancedToggle
                  enabled={config.network.staticIp}
                  onChange={(value) => updateConfig('network', 'staticIp', value)}
                  label="Static IP Configuration"
                  description="Use fixed IP address instead of DHCP"
                />

                <AdvancedToggle
                  enabled={config.network.enableMDNS}
                  onChange={(value) => updateConfig('network', 'enableMDNS', value)}
                  label="Enable mDNS"
                  description="Allow device discovery via hostname.local"
                />
              </div>
              
              {config.network.staticIp && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField label="IP Address">
                    <input
                      type="text"
                      value={config.network.ipAddress}
                      onChange={(e) => updateConfig('network', 'ipAddress', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </FormField>
                  
                  <FormField label="Gateway">
                    <input
                      type="text"
                      value={config.network.gateway}
                      onChange={(e) => updateConfig('network', 'gateway', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </FormField>
                  
                  <FormField label="Subnet Mask">
                    <input
                      type="text"
                      value={config.network.subnet}
                      onChange={(e) => updateConfig('network', 'subnet', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </FormField>
                  
                  <FormField label="Primary DNS">
                    <input
                      type="text"
                      value={config.network.dns1}
                      onChange={(e) => updateConfig('network', 'dns1', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </FormField>

                  <FormField label="Secondary DNS">
                    <input
                      type="text"
                      value={config.network.dns2}
                      onChange={(e) => updateConfig('network', 'dns2', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </FormField>
                </div>
              )}
            </div>
          </ConfigSection>

          {/* Device Configuration */}
          <ConfigSection
            title="Device Configuration"
            icon={<Settings className="h-5 w-5" />}
            isExpanded={expandedSections.device}
            onToggle={() => toggleSection('device')}
          >
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Device Name">
                  <input
                    type="text"
                    value={config.device.deviceName}
                    onChange={(e) => updateConfig('device', 'deviceName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </FormField>
                
                <FormField label="Location">
                  <input
                    type="text"
                    value={config.device.location}
                    onChange={(e) => updateConfig('device', 'location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </FormField>
                
                <FormField label="Timezone">
                  <select
                    value={config.device.timezone}
                    onChange={(e) => updateConfig('device', 'timezone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="UTC">UTC</option>
                    <option value="EST">EST</option>
                    <option value="PST">PST</option>
                    <option value="CST">CST</option>
                    <option value="MST">MST</option>
                  </select>
                </FormField>

                <FormField label="NTP Server">
                  <input
                    type="text"
                    value={config.device.ntpServer}
                    onChange={(e) => updateConfig('device', 'ntpServer', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </FormField>

                <FormField label="CPU Frequency (MHz)">
                  <select
                    value={config.device.cpuFrequency}
                    onChange={(e) => updateConfig('device', 'cpuFrequency', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={80}>80 MHz (Low Power)</option>
                    <option value={160}>160 MHz (Balanced)</option>
                    <option value={240}>240 MHz (High Performance)</option>
                  </select>
                </FormField>

                <FormField label="Sleep Mode">
                  <select
                    value={config.device.sleepMode}
                    onChange={(e) => updateConfig('device', 'sleepMode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="none">None</option>
                    <option value="light">Light Sleep</option>
                    <option value="deep">Deep Sleep</option>
                  </select>
                </FormField>
              </div>

              <FormField label="Description">
                <textarea
                  value={config.device.description}
                  onChange={(e) => updateConfig('device', 'description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </FormField>

              <AdvancedToggle
                enabled={config.device.enableRTC}
                onChange={(value) => updateConfig('device', 'enableRTC', value)}
                label="Enable RTC Module"
                description="Use external real-time clock for accurate timekeeping"
              />
            </div>
          </ConfigSection>

          {/* GPIO Configuration */}
          <ConfigSection
            title="GPIO Pin Configuration"
            icon={<Zap className="h-5 w-5" />}
            isExpanded={expandedSections.gpio}
            onToggle={() => toggleSection('gpio')}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Object.entries(config.gpio).map(([pin, mode]) => (
                <FormField key={pin} label={`Pin ${pin.replace('pin', '')}`}>
                  <select
                    value={mode}
                    onChange={(e) => updateConfig('gpio', pin, e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="INPUT">Input</option>
                    <option value="OUTPUT">Output</option>
                    <option value="INPUT_PULLUP">Input Pull-up</option>
                    <option value="INPUT_PULLDOWN">Input Pull-down</option>
                    <option value="PWM">PWM</option>
                    <option value="ANALOG">Analog</option>
                    <option value="DISABLED">Disabled</option>
                  </select>
                </FormField>
              ))}
            </div>
          </ConfigSection>

          {/* Sensors Configuration */}
          <ConfigSection
            title="Sensors Configuration"
            icon={<Thermometer className="h-5 w-5" />}
            isExpanded={expandedSections.sensors}
            onToggle={() => toggleSection('sensors')}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(config.sensors).map(([sensor, enabled]) => (
                <AdvancedToggle
                  key={sensor}
                  enabled={enabled}
                  onChange={(value) => updateConfig('sensors', sensor, value)}
                  label={sensor.charAt(0).toUpperCase() + sensor.slice(1)}
                  description={`Enable ${sensor} sensor monitoring`}
                />
              ))}
            </div>
          </ConfigSection>

          {/* Security Configuration */}
          <ConfigSection
            title="Security Configuration"
            icon={<Shield className="h-5 w-5" />}
            isExpanded={expandedSections.security}
            onToggle={() => toggleSection('security')}
          >
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AdvancedToggle
                  enabled={config.security.enableAuth}
                  onChange={(value) => updateConfig('security', 'enableAuth', value)}
                  label="Enable Authentication"
                  description="Require username/password for access"
                />
                
                <AdvancedToggle
                  enabled={config.security.enableHttps}
                  onChange={(value) => updateConfig('security', 'enableHttps', value)}
                  label="Enable HTTPS"
                  description="Use encrypted connections"
                />

                <AdvancedToggle
                  enabled={config.security.enableFirewall}
                  onChange={(value) => updateConfig('security', 'enableFirewall', value)}
                  label="Enable Firewall"
                  description="Block unauthorized access attempts"
                />

                <AdvancedToggle
                  enabled={config.security.rateLimiting}
                  onChange={(value) => updateConfig('security', 'rateLimiting', value)}
                  label="Rate Limiting"
                  description="Limit requests per minute"
                />
              </div>
              
              {config.security.enableAuth && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <FormField label="Username">
                    <input
                      type="text"
                      value={config.security.username}
                      onChange={(e) => updateConfig('security', 'username', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </FormField>
                  
                  <FormField label="Password">
                    <input
                      type="password"
                      value={config.security.password}
                      onChange={(e) => updateConfig('security', 'password', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </FormField>
                </div>
              )}

              {config.security.rateLimiting && (
                <FormField label="Max Requests per Minute">
                  <input
                    type="number"
                    value={config.security.maxRequests}
                    onChange={(e) => updateConfig('security', 'maxRequests', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="10"
                    max="1000"
                  />
                </FormField>
              )}
              
              <FormField label="API Key" description="Used for external API access">
                <input
                  type="text"
                  value={config.security.apiKey}
                  onChange={(e) => updateConfig('security', 'apiKey', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter API key"
                />
              </FormField>
            </div>
          </ConfigSection>

          {/* System Configuration */}
          <ConfigSection
            title="System Configuration"
            icon={<Cpu className="h-5 w-5" />}
            isExpanded={expandedSections.system}
            onToggle={() => toggleSection('system')}
          >
            <div className="space-y-6">
              {/* Firmware Upload Section */}
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Firmware Management</h4>
                <FileUpload
                  accept=".hex,.bin,.elf"
                  label="Upload Firmware"
                  description="Upload .hex, .bin, or .elf firmware files to update the ESP32"
                  onFileSelect={handleFirmwareUpload}
                  maxSize={5}
                  currentFile={firmwareFile}
                  uploadProgress={uploadProgress}
                  uploadStatus={uploadStatus}
                />
                
                {uploadStatus === 'success' && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700">
                      Firmware uploaded successfully! Device will reboot automatically.
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AdvancedToggle
                  enabled={config.system.autoReboot}
                  onChange={(value) => updateConfig('system', 'autoReboot', value)}
                  label="Auto Reboot"
                  description="Enable daily automatic reboot"
                />
                
                {config.system.autoReboot && (
                  <FormField label="Reboot Time">
                    <input
                      type="time"
                      value={config.system.rebootTime}
                      onChange={(e) => updateConfig('system', 'rebootTime', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </FormField>
                )}

                <FormField label="Log Level">
                  <select
                    value={config.system.logLevel}
                    onChange={(e) => updateConfig('system', 'logLevel', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="DEBUG">Debug</option>
                    <option value="INFO">Info</option>
                    <option value="WARNING">Warning</option>
                    <option value="ERROR">Error</option>
                  </select>
                </FormField>

                <FormField label="Performance Mode">
                  <select
                    value={config.system.performanceMode}
                    onChange={(e) => updateConfig('system', 'performanceMode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="power_save">Power Save</option>
                    <option value="balanced">Balanced</option>
                    <option value="performance">High Performance</option>
                  </select>
                </FormField>

                <FormField label="Boot Mode">
                  <select
                    value={config.system.bootMode}
                    onChange={(e) => updateConfig('system', 'bootMode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="normal">Normal Boot</option>
                    <option value="safe">Safe Mode</option>
                    <option value="recovery">Recovery Mode</option>
                  </select>
                </FormField>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AdvancedToggle
                  enabled={config.system.enableOTA}
                  onChange={(value) => updateConfig('system', 'enableOTA', value)}
                  label="OTA Updates"
                  description="Over-the-air firmware updates"
                />
                
                <AdvancedToggle
                  enabled={config.system.enableTelnet}
                  onChange={(value) => updateConfig('system', 'enableTelnet', value)}
                  label="Telnet Access"
                  description="Remote command line access"
                />
                
                <AdvancedToggle
                  enabled={config.system.enableSerial}
                  onChange={(value) => updateConfig('system', 'enableSerial', value)}
                  label="Serial Debugging"
                  description="Debug output via serial port"
                />

                <AdvancedToggle
                  enabled={config.system.watchdogTimer}
                  onChange={(value) => updateConfig('system', 'watchdogTimer', value)}
                  label="Watchdog Timer"
                  description="Automatic reset on system hang"
                />

                <AdvancedToggle
                  enabled={config.system.memoryMonitoring}
                  onChange={(value) => updateConfig('system', 'memoryMonitoring', value)}
                  label="Memory Monitoring"
                  description="Track memory usage and leaks"
                />

                <AdvancedToggle
                  enabled={config.system.temperatureMonitoring}
                  onChange={(value) => updateConfig('system', 'temperatureMonitoring', value)}
                  label="Temperature Monitoring"
                  description="Monitor CPU temperature"
                />
              </div>
            </div>
          </ConfigSection>

          {/* Monitoring Configuration */}
          <ConfigSection
            title="Monitoring & Analytics"
            icon={<Activity className="h-5 w-5" />}
            isExpanded={expandedSections.monitoring}
            onToggle={() => toggleSection('monitoring')}
          >
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AdvancedToggle
                  enabled={config.monitoring.enableMetrics}
                  onChange={(value) => updateConfig('monitoring', 'enableMetrics', value)}
                  label="Enable Metrics Collection"
                  description="Collect system performance metrics"
                />

                <AdvancedToggle
                  enabled={config.monitoring.enableAlerts}
                  onChange={(value) => updateConfig('monitoring', 'enableAlerts', value)}
                  label="Enable Alerts"
                  description="Send notifications on system events"
                />

                <AdvancedToggle
                  enabled={config.monitoring.uptimeReporting}
                  onChange={(value) => updateConfig('monitoring', 'uptimeReporting', value)}
                  label="Uptime Reporting"
                  description="Track device uptime statistics"
                />

                <AdvancedToggle
                  enabled={config.monitoring.errorReporting}
                  onChange={(value) => updateConfig('monitoring', 'errorReporting', value)}
                  label="Error Reporting"
                  description="Log and report system errors"
                />

                <AdvancedToggle
                  enabled={config.monitoring.remoteLogging}
                  onChange={(value) => updateConfig('monitoring', 'remoteLogging', value)}
                  label="Remote Logging"
                  description="Send logs to external server"
                />
              </div>

              {config.monitoring.enableMetrics && (
                <FormField label="Metrics Collection Interval (seconds)">
                  <input
                    type="number"
                    value={config.monitoring.metricsInterval}
                    onChange={(e) => updateConfig('monitoring', 'metricsInterval', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="10"
                    max="3600"
                  />
                </FormField>
              )}

              {config.monitoring.enableAlerts && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <FormField label="Temperature Threshold (°C)">
                    <input
                      type="number"
                      value={config.monitoring.temperatureThreshold}
                      onChange={(e) => updateConfig('monitoring', 'temperatureThreshold', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="50"
                      max="100"
                    />
                  </FormField>

                  <FormField label="Memory Threshold (%)">
                    <input
                      type="number"
                      value={config.monitoring.memoryThreshold}
                      onChange={(e) => updateConfig('monitoring', 'memoryThreshold', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="50"
                      max="95"
                    />
                  </FormField>
                </div>
              )}

              {config.monitoring.remoteLogging && (
                <FormField label="Log Server URL">
                  <input
                    type="url"
                    value={config.monitoring.logServerUrl}
                    onChange={(e) => updateConfig('monitoring', 'logServerUrl', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://logs.example.com/api/v1/logs"
                  />
                </FormField>
              )}
            </div>
          </ConfigSection>

          {/* Connectivity Configuration */}
          <ConfigSection
            title="Connectivity & Protocols"
            icon={<Globe className="h-5 w-5" />}
            isExpanded={expandedSections.connectivity}
            onToggle={() => toggleSection('connectivity')}
          >
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AdvancedToggle
                  enabled={config.connectivity.enableBluetooth}
                  onChange={(value) => updateConfig('connectivity', 'enableBluetooth', value)}
                  label="Bluetooth Classic"
                  description="Enable Bluetooth connectivity"
                />

                <AdvancedToggle
                  enabled={config.connectivity.enableBLE}
                  onChange={(value) => updateConfig('connectivity', 'enableBLE', value)}
                  label="Bluetooth Low Energy"
                  description="Enable BLE for low power devices"
                />

                <AdvancedToggle
                  enabled={config.connectivity.enableEthernet}
                  onChange={(value) => updateConfig('connectivity', 'enableEthernet', value)}
                  label="Ethernet"
                  description="Wired network connection"
                />

                <AdvancedToggle
                  enabled={config.connectivity.enableCAN}
                  onChange={(value) => updateConfig('connectivity', 'enableCAN', value)}
                  label="CAN Bus"
                  description="Controller Area Network"
                />

                <AdvancedToggle
                  enabled={config.connectivity.enableI2C}
                  onChange={(value) => updateConfig('connectivity', 'enableI2C', value)}
                  label="I2C Protocol"
                  description="Inter-Integrated Circuit"
                />

                <AdvancedToggle
                  enabled={config.connectivity.enableSPI}
                  onChange={(value) => updateConfig('connectivity', 'enableSPI', value)}
                  label="SPI Protocol"
                  description="Serial Peripheral Interface"
                />
              </div>
              
              {/* Bluetooth Control Panel - only shown when Bluetooth is enabled */}
              {config.connectivity.enableBluetooth && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
                    <Bluetooth className="inline-block h-5 w-5 mr-2 text-blue-600" /> 
                    Bluetooth Control Panel
                  </h3>
                  <BluetoothControl />
                </div>
              )}

              {config.connectivity.enableBluetooth && (
                <FormField label="Bluetooth Device Name">
                  <input
                    type="text"
                    value={config.connectivity.bluetoothName}
                    onChange={(e) => updateConfig('connectivity', 'bluetoothName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </FormField>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {config.connectivity.enableCAN && (
                  <FormField label="CAN Bitrate (bps)">
                    <select
                      value={config.connectivity.canBitrate}
                      onChange={(e) => updateConfig('connectivity', 'canBitrate', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={125000}>125 kbps</option>
                      <option value={250000}>250 kbps</option>
                      <option value={500000}>500 kbps</option>
                      <option value={1000000}>1 Mbps</option>
                    </select>
                  </FormField>
                )}

                {config.connectivity.enableI2C && (
                  <FormField label="I2C Frequency (Hz)">
                    <select
                      value={config.connectivity.i2cFrequency}
                      onChange={(e) => updateConfig('connectivity', 'i2cFrequency', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={100000}>100 kHz (Standard)</option>
                      <option value={400000}>400 kHz (Fast)</option>
                      <option value={1000000}>1 MHz (Fast+)</option>
                    </select>
                  </FormField>
                )}

                {config.connectivity.enableSPI && (
                  <FormField label="SPI Frequency (Hz)">
                    <select
                      value={config.connectivity.spiFrequency}
                      onChange={(e) => updateConfig('connectivity', 'spiFrequency', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={1000000}>1 MHz</option>
                      <option value={4000000}>4 MHz</option>
                      <option value={8000000}>8 MHz</option>
                      <option value={20000000}>20 MHz</option>
                    </select>
                  </FormField>
                )}
              </div>
            </div>
          </ConfigSection>
        </div>
      </div>
    </div>
  );
}