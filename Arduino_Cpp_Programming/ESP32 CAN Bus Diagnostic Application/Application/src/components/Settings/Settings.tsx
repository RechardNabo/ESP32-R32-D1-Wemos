import React, { useState } from 'react';
import { Save, RefreshCw, Wifi, Database, Settings as SettingsIcon } from 'lucide-react';

interface SettingsProps {
  onSaveSettings: (settings: any) => void;
  onResetSettings: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ 
  onSaveSettings, 
  onResetSettings 
}) => {
  const [settings, setSettings] = useState({
    // CAN Settings
    canBaudRate: 500000,
    canMode: 'normal',
    enableExtendedFrames: true,
    
    // WiFi Settings
    wifiSSID: 'ESP32-CAN-Scanner',
    wifiPassword: 'diagnostic123',
    wifiChannel: 6,
    maxClients: 8,
    
    // Data Settings
    dataLogInterval: 100,
    maxLogSize: 10000,
    autoExport: false,
    
    // Display Settings
    theme: 'dark',
    refreshRate: 1000,
    showTimestamps: true,
    
    // Protocol Settings
    enableOBD2: true,
    enableJ1939: false,
    enableUDS: true,
    enableKWP: false,
  });

  const handleSave = () => {
    onSaveSettings(settings);
  };

  const handleReset = () => {
    onResetSettings();
    // Reset to default values
    setSettings({
      canBaudRate: 500000,
      canMode: 'normal',
      enableExtendedFrames: true,
      wifiSSID: 'ESP32-CAN-Scanner',
      wifiPassword: 'diagnostic123',
      wifiChannel: 6,
      maxClients: 8,
      dataLogInterval: 100,
      maxLogSize: 10000,
      autoExport: false,
      theme: 'dark',
      refreshRate: 1000,
      showTimestamps: true,
      enableOBD2: true,
      enableJ1939: false,
      enableUDS: true,
      enableKWP: false,
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Settings</h2>
        
        <div className="flex gap-4 mb-6">
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            <Save size={20} />
            <span>Save Settings</span>
          </button>
          
          <button
            onClick={handleReset}
            className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            <RefreshCw size={20} />
            <span>Reset to Defaults</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CAN Bus Settings */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <SettingsIcon className="text-blue-400" size={20} />
            <h3 className="text-xl font-semibold text-white">CAN Bus</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Baud Rate
              </label>
              <select
                value={settings.canBaudRate}
                onChange={(e) => setSettings({...settings, canBaudRate: Number(e.target.value)})}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg"
              >
                <option value={125000}>125 kbps</option>
                <option value={250000}>250 kbps</option>
                <option value={500000}>500 kbps</option>
                <option value={1000000}>1 Mbps</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Mode
              </label>
              <select
                value={settings.canMode}
                onChange={(e) => setSettings({...settings, canMode: e.target.value})}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg"
              >
                <option value="normal">Normal</option>
                <option value="listen">Listen Only</option>
                <option value="loopback">Loopback</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.enableExtendedFrames}
                onChange={(e) => setSettings({...settings, enableExtendedFrames: e.target.checked})}
                className="rounded"
              />
              <label className="text-sm text-gray-300">Enable Extended Frames</label>
            </div>
          </div>
        </div>

        {/* WiFi Settings */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Wifi className="text-green-400" size={20} />
            <h3 className="text-xl font-semibold text-white">WiFi</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                SSID
              </label>
              <input
                type="text"
                value={settings.wifiSSID}
                onChange={(e) => setSettings({...settings, wifiSSID: e.target.value})}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={settings.wifiPassword}
                onChange={(e) => setSettings({...settings, wifiPassword: e.target.value})}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Channel
              </label>
              <input
                type="number"
                min="1"
                max="13"
                value={settings.wifiChannel}
                onChange={(e) => setSettings({...settings, wifiChannel: Number(e.target.value)})}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Max Clients
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={settings.maxClients}
                onChange={(e) => setSettings({...settings, maxClients: Number(e.target.value)})}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Data Settings */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Database className="text-yellow-400" size={20} />
            <h3 className="text-xl font-semibold text-white">Data Logging</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Log Interval (ms)
              </label>
              <input
                type="number"
                min="50"
                max="5000"
                value={settings.dataLogInterval}
                onChange={(e) => setSettings({...settings, dataLogInterval: Number(e.target.value)})}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Max Log Size (entries)
              </label>
              <input
                type="number"
                min="1000"
                max="100000"
                value={settings.maxLogSize}
                onChange={(e) => setSettings({...settings, maxLogSize: Number(e.target.value)})}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.autoExport}
                onChange={(e) => setSettings({...settings, autoExport: e.target.checked})}
                className="rounded"
              />
              <label className="text-sm text-gray-300">Auto Export When Full</label>
            </div>
          </div>
        </div>

        {/* Protocol Settings */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <SettingsIcon className="text-purple-400" size={20} />
            <h3 className="text-xl font-semibold text-white">Protocols</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.enableOBD2}
                onChange={(e) => setSettings({...settings, enableOBD2: e.target.checked})}
                className="rounded"
              />
              <label className="text-sm text-gray-300">OBD-II</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.enableJ1939}
                onChange={(e) => setSettings({...settings, enableJ1939: e.target.checked})}
                className="rounded"
              />
              <label className="text-sm text-gray-300">J1939</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.enableUDS}
                onChange={(e) => setSettings({...settings, enableUDS: e.target.checked})}
                className="rounded"
              />
              <label className="text-sm text-gray-300">UDS</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.enableKWP}
                onChange={(e) => setSettings({...settings, enableKWP: e.target.checked})}
                className="rounded"
              />
              <label className="text-sm text-gray-300">KWP2000</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};