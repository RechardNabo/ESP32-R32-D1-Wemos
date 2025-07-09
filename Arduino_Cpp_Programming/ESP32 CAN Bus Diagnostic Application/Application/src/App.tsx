import React, { useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Sidebar } from './components/Layout/Sidebar';
import { Dashboard } from './components/Dashboard/Dashboard';
import { Diagnostics } from './components/Diagnostics/Diagnostics';
import { LiveData } from './components/LiveData/LiveData';
import { CANTraffic } from './components/CANTraffic/CANTraffic';
import { Settings } from './components/Settings/Settings';
import { About } from './components/About/About';
import { useWebSocket } from './hooks/useWebSocket';
import { SystemStatus, VehicleInfo, CANMessage, OBDParameter } from './types/can';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  // WebSocket connection (in production, this would be the ESP32's IP)
  const { isConnected, messages, obdData, systemStatus, sendMessage } = useWebSocket('wss://192.168.4.1:81');

  // Mock vehicle info for demonstration
  const mockVehicleInfo: VehicleInfo = {
    vin: 'WBAHN41050KE12345',
    make: 'BMW',
    model: 'X5',
    year: 2023,
    engineSize: '3.0L I6 Turbo',
    fuelType: 'Gasoline',
    protocols: ['ISO 15765-4', 'ISO 14230-4', 'UDS']
  };

  // Mock system status for demonstration
  const mockSystemStatus: SystemStatus = {
    canBusStatus: 'connected',
    wifiClients: 3,
    batteryVoltage: 12.6,
    temperature: 45,
    uptime: 86400,
    messagesPerSecond: 127
  };

  // Mock OBD data for demonstration
  const mockOBDData: OBDParameter[] = [
    { pid: '01', name: 'Vehicle Speed', value: 65.5, unit: 'km/h', min: 0, max: 200, timestamp: Date.now() },
    { pid: '0C', name: 'Engine RPM', value: 2150, unit: 'rpm', min: 0, max: 8000, timestamp: Date.now() },
    { pid: '05', name: 'Coolant Temperature', value: 87.2, unit: '°C', min: -40, max: 120, timestamp: Date.now() },
    { pid: '0A', name: 'Fuel Pressure', value: 3.2, unit: 'bar', min: 0, max: 8, timestamp: Date.now() },
    { pid: '0B', name: 'Intake MAP', value: 45.8, unit: 'kPa', min: 0, max: 100, timestamp: Date.now() },
    { pid: '0D', name: 'Vehicle Speed', value: 65.5, unit: 'km/h', min: 0, max: 200, timestamp: Date.now() }
  ];

  // Mock CAN messages for demonstration
  const mockCANMessages: CANMessage[] = [
    { id: '7E8', timestamp: Date.now(), data: '0441050A4B0C8D', dlc: 8, isExtended: false, direction: 'rx', protocol: 'ISO 15765-4' },
    { id: '7E0', timestamp: Date.now(), data: '0201050000000000', dlc: 8, isExtended: false, direction: 'tx', protocol: 'ISO 15765-4' },
    { id: '7E8', timestamp: Date.now(), data: '04410C0867000000', dlc: 8, isExtended: false, direction: 'rx', protocol: 'ISO 15765-4' },
  ];

  const handleDTCScan = () => {
    sendMessage({ type: 'scan_dtcs' });
  };

  const handleClearDTC = (code: string) => {
    sendMessage({ type: 'clear_dtc', code });
  };

  const handleStartLogging = () => {
    sendMessage({ type: 'start_logging' });
  };

  const handleStopLogging = () => {
    sendMessage({ type: 'stop_logging' });
  };

  const handleClearData = () => {
    sendMessage({ type: 'clear_data' });
  };

  const handleStartCapture = () => {
    sendMessage({ type: 'start_capture' });
  };

  const handleStopCapture = () => {
    sendMessage({ type: 'stop_capture' });
  };

  const handleClearMessages = () => {
    sendMessage({ type: 'clear_messages' });
  };

  const handleSaveSettings = (settings: any) => {
    sendMessage({ type: 'save_settings', settings });
  };

  const handleResetSettings = () => {
    sendMessage({ type: 'reset_settings' });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            systemStatus={systemStatus || mockSystemStatus}
            vehicleInfo={mockVehicleInfo}
            obdData={obdData.length > 0 ? obdData : mockOBDData}
            isDarkMode={isDarkMode}
          />
        );
      case 'diagnostics':
        return (
          <Diagnostics
            onScanDTCs={handleDTCScan}
            onClearDTC={handleClearDTC}
          />
        );
      case 'livedata':
        return (
          <LiveData
            obdData={obdData.length > 0 ? obdData : mockOBDData}
            onStartLogging={handleStartLogging}
            onStopLogging={handleStopLogging}
            onClearData={handleClearData}
          />
        );
      case 'traffic':
        return (
          <CANTraffic
            messages={messages.length > 0 ? messages : mockCANMessages}
            onStartCapture={handleStartCapture}
            onStopCapture={handleStopCapture}
            onClearMessages={handleClearMessages}
          />
        );
      case 'settings':
        return (
          <Settings
            onSaveSettings={handleSaveSettings}
            onResetSettings={handleResetSettings}
          />
        );
      case 'about':
        return <About />;
      default:
        return <Dashboard systemStatus={systemStatus || mockSystemStatus} vehicleInfo={mockVehicleInfo} obdData={obdData} />;
      default:
        return <Dashboard systemStatus={systemStatus || mockSystemStatus} vehicleInfo={mockVehicleInfo} obdData={obdData} isDarkMode={isDarkMode} />;
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gray-900 text-white' 
        : 'bg-gray-50 text-gray-900'
    }`}>
      <div className="flex">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          isDarkMode={isDarkMode}
        />
        
        <main className="flex-1 lg:ml-0 transition-all duration-300">
          <div className="p-4 lg:p-8">
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">ESP32 CAN Diagnostic Tool</h1>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className={`p-2 rounded-lg transition-colors duration-200 ${
                      isDarkMode
                        ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400'
                        : 'bg-white hover:bg-gray-100 text-gray-600 shadow-md'
                    }`}
                    title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                  >
                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                  </button>
                  <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                    isConnected 
                      ? 'bg-green-600 text-white' 
                      : 'bg-red-600 text-white'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      isConnected ? 'bg-green-300' : 'bg-red-300'
                    }`} />
                    <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className={isDarkMode ? '' : 'text-gray-900'}>
              {renderContent()}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;