import { useState, useEffect } from 'react';
import { 
  Wifi, 
  Cpu, 
  Shield, 
  Zap, 
  Settings, 
  Cloud, 
  Activity, 
  CheckCircle, 
  ArrowRight,
  Menu,
  X,
  Github,
  Mail,
  Phone,
  Code,
  Monitor,
  Database,
  Network,

  Globe,
  Lock,
  BarChart3,
  AlertTriangle,
  Play,
  Download,
  Upload,
  RefreshCw,
  Terminal,
  Smartphone,
  Sun,
  Moon
} from 'lucide-react';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedProtocol, setSelectedProtocol] = useState<string | null>(null);
  const [protocolConfigs, setProtocolConfigs] = useState<{[key: string]: any}>({});
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage for saved theme preference, default to light mode
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  const protocols = [
    { 
      name: 'I2C', 
      description: 'Inter-Integrated Circuit communication',
      configFeatures: ['Auto device discovery', 'Clock speed configuration', 'Pull-up resistor settings', 'Multi-master support']
    },
    { 
      name: 'SPI', 
      description: 'Serial Peripheral Interface',
      configFeatures: ['Clock polarity/phase', 'Bit order configuration', 'CS pin management', 'DMA support']
    },
    { 
      name: 'UART', 
      description: 'Universal Asynchronous Receiver-Transmitter',
      configFeatures: ['Baud rate selection', 'Parity/stop bits', 'Flow control', 'Buffer management']
    },
    { 
      name: 'Modbus RTU', 
      description: 'Serial communication protocol',
      configFeatures: ['Slave ID configuration', 'Register mapping', 'Timeout settings', 'Error handling']
    },
    { 
      name: 'Modbus TCP', 
      description: 'Ethernet-based communication',
      configFeatures: ['IP address setup', 'Port configuration', 'Connection pooling', 'Firewall rules']
    },
    { 
      name: 'CAN Bus', 
      description: 'Controller Area Network',
      configFeatures: ['Bit rate configuration', 'Filter setup', 'Message prioritization', 'Error frame handling']
    },
    { 
      name: 'RS485', 
      description: 'Balanced transmission line standard',
      configFeatures: ['Termination settings', 'Bias resistors', 'Direction control', 'Multi-drop support']
    }
  ];

  const features = [
    {
      icon: <Wifi className="w-8 h-8" />,
      title: 'Wireless Connectivity',
      description: 'Built-in WiFi and Ethernet support for seamless network integration'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Secure Communication',
      description: 'End-to-end encryption and secure authentication protocols'
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Real-time Processing',
      description: 'Low-latency data processing with immediate response capabilities'
    },
    {
      icon: <Cloud className="w-8 h-8" />,
      title: 'Cloud Integration',
      description: 'Direct connection to major cloud platforms and IoT services'
    },
    {
      icon: <Settings className="w-8 h-8" />,
      title: 'Easy Configuration',
      description: 'Web-based interface for simple setup and management'
    },
    {
      icon: <Activity className="w-8 h-8" />,
      title: 'Remote Monitoring',
      description: 'Monitor and control legacy equipment from anywhere'
    }
  ];

  const configurationFeatures = [
    {
      icon: <Code className="w-12 h-12" />,
      title: 'Visual Protocol Builder',
      description: 'Drag-and-drop interface to configure communication protocols without coding',
      features: [
        'Protocol template library',
        'Parameter validation',
        'Real-time syntax checking',
        'Configuration export/import'
      ]
    },
    {
      icon: <Monitor className="w-12 h-12" />,
      title: 'Web-Based Dashboard',
      description: 'Comprehensive management interface accessible from any device',
      features: [
        'Device discovery and mapping',
        'Live data visualization',
        'Configuration backup/restore',
        'Multi-user access control'
      ]
    },
    {
      icon: <Database className="w-12 h-12" />,
      title: 'Data Mapping Engine',
      description: 'Intelligent data transformation and routing between protocols',
      features: [
        'Automatic data type conversion',
        'Custom transformation rules',
        'Data validation and filtering',
        'Batch processing support'
      ]
    },
    {
      icon: <Network className="w-12 h-12" />,
      title: 'Network Integration',
      description: 'Seamless connection to existing network infrastructure',
      features: [
        'DHCP/Static IP configuration',
        'VLAN support',
        'VPN connectivity',
        'Network diagnostics'
      ]
    },
    {
      icon: <Globe className="w-12 h-12" />,
      title: 'Cloud Connectors',
      description: 'Pre-built integrations with major IoT platforms',
      features: [
        'AWS IoT Core',
        'Azure IoT Hub',
        'Google Cloud IoT',
        'Custom REST APIs'
      ]
    },
    {
      icon: <BarChart3 className="w-12 h-12" />,
      title: 'Analytics & Reporting',
      description: 'Built-in analytics for performance monitoring and optimization',
      features: [
        'Real-time metrics',
        'Historical data analysis',
        'Custom dashboards',
        'Automated reports'
      ]
    }
  ];

  const integrationSteps = [
    {
      step: '1',
      title: 'Device Discovery',
      description: 'Automatically scan and identify connected industrial equipment',
      icon: <Monitor className="w-6 h-6" />
    },
    {
      step: '2',
      title: 'Protocol Configuration',
      description: 'Select and configure communication protocols for each device',
      icon: <Settings className="w-6 h-6" />
    },
    {
      step: '3',
      title: 'Data Mapping',
      description: 'Map device data points to cloud endpoints or local databases',
      icon: <Database className="w-6 h-6" />
    },
    {
      step: '4',
      title: 'Testing & Validation',
      description: 'Verify connections and data flow with built-in testing tools',
      icon: <CheckCircle className="w-6 h-6" />
    },
    {
      step: '5',
      title: 'Deployment',
      description: 'Deploy configuration and start real-time data collection',
      icon: <Play className="w-6 h-6" />
    }
  ];

  const managementTools = [
    {
      icon: <Terminal className="w-8 h-8" />,
      title: 'Command Line Interface',
      description: 'Advanced configuration via SSH or serial console for power users'
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: 'Mobile App',
      description: 'Monitor and configure your gateway remotely from iOS/Android devices'
    },
    {
      icon: <RefreshCw className="w-8 h-8" />,
      title: 'OTA Updates',
      description: 'Over-the-air firmware updates with rollback capability'
    },
    {
      icon: <Lock className="w-8 h-8" />,
      title: 'Security Management',
      description: 'Certificate management, user authentication, and access control'
    },
    {
      icon: <AlertTriangle className="w-8 h-8" />,
      title: 'Alert System',
      description: 'Configurable alerts via email, SMS, or webhook notifications'
    },
    {
      icon: <Upload className="w-8 h-8" />,
      title: 'Backup & Restore',
      description: 'Automated configuration backups with one-click restore functionality'
    }
  ];

  const specs = [
    { label: 'Processor', value: 'ESP32 Dual-Core' },
    { label: 'Memory', value: '520KB SRAM' },
    { label: 'Flash', value: '4MB - 16MB' },
    { label: 'WiFi', value: '802.11 b/g/n' },
    { label: 'Bluetooth', value: 'v4.2 BR/EDR and BLE' },
    { label: 'Operating Voltage', value: '3.3V' },
    { label: 'GPIO Pins', value: '34 Programmable' },
    { label: 'Operating Temperature', value: '-40°C to +85°C' }
  ];

  const handleProtocolConfigure = (protocolName: string) => {
    setSelectedProtocol(protocolName);
  };

  const handleSaveProtocolConfig = (protocolName: string, config: any) => {
    setProtocolConfigs(prev => ({
      ...prev,
      [protocolName]: { ...config, enabled: true }
    }));
    setSelectedProtocol(null);
  };

  const handleSaveConfiguration = () => {
    // Simulate saving configuration
    console.log('Saving configuration:', protocolConfigs);
    alert('Configuration saved successfully!');
    setShowConfigModal(false);
  };

  const isProtocolEnabled = (protocolName: string) => {
    return protocolConfigs[protocolName]?.enabled || false;
  };

  // Save theme preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    // Apply or remove the 'dark' class to the document element
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-slate-900' : 'bg-slate-50'}`}>
      {/* Navigation */}
      <nav className={`${isDarkMode ? 'bg-slate-800 shadow-md' : 'bg-white shadow-sm'} sticky top-0 z-50`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Cpu className={`w-8 h-8 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} mr-2`} />
              <span className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>IoT Gateway</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className={`${isDarkMode ? 'text-slate-300 hover:text-blue-300' : 'text-slate-700 hover:text-blue-600'} transition-colors`}>Features</a>
              <a href="#configuration" className={`${isDarkMode ? 'text-slate-300 hover:text-blue-300' : 'text-slate-700 hover:text-blue-600'} transition-colors`}>Configuration</a>
              <a href="#integration" className={`${isDarkMode ? 'text-slate-300 hover:text-blue-300' : 'text-slate-700 hover:text-blue-600'} transition-colors`}>Integration</a>
              <a href="#specs" className={`${isDarkMode ? 'text-slate-300 hover:text-blue-300' : 'text-slate-700 hover:text-blue-600'} transition-colors`}>Specifications</a>
              <a href="#contact" className={`${isDarkMode ? 'text-slate-300 hover:text-blue-300' : 'text-slate-700 hover:text-blue-600'} transition-colors`}>Contact</a>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Get Started
              </button>
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-full ${isDarkMode ? 'bg-slate-700 text-yellow-300' : 'bg-slate-200 text-slate-700'}`}
                aria-label="Toggle theme"
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>

            <div className="md:hidden flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-full ${isDarkMode ? 'bg-slate-700 text-yellow-300' : 'bg-slate-200 text-slate-700'}`}
                aria-label="Toggle theme"
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`${isDarkMode ? 'text-white' : 'text-slate-700'} hover:text-blue-600`}
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className={`md:hidden ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border-t`}>
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a href="#features" className={`block px-3 py-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Features</a>
              <a href="#configuration" className={`block px-3 py-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Configuration</a>
              <a href="#integration" className={`block px-3 py-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Integration</a>
              <a href="#specs" className={`block px-3 py-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Specifications</a>
              <a href="#contact" className={`block px-3 py-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Contact</a>
              <button className="w-full text-left px-3 py-2 bg-blue-600 text-white rounded-lg">
                Get Started
              </button>
            </div>
          </div>
        )}
      </nav>
      {/* Protocol Configuration Modal */}
      {selectedProtocol && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900">Configure {selectedProtocol}</h2>
                <button 
                  onClick={() => setSelectedProtocol(null)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* I2C Configuration */}
              {selectedProtocol === 'I2C' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">SDA Pin</label>
                      <select className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option value="21">GPIO 21 (Default)</option>
                        <option value="4">GPIO 4</option>
                        <option value="5">GPIO 5</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">SCL Pin</label>
                      <select className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option value="22">GPIO 22 (Default)</option>
                        <option value="18">GPIO 18</option>
                        <option value="19">GPIO 19</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Clock Speed</label>
                      <select className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option value="100000">100 kHz (Standard)</option>
                        <option value="400000">400 kHz (Fast)</option>
                        <option value="1000000">1 MHz (Fast+)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Pull-up Resistors</label>
                      <select className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option value="internal">Internal (Default)</option>
                        <option value="external">External</option>
                        <option value="none">None</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="i2c-scan" className="text-blue-600" defaultChecked />
                    <label htmlFor="i2c-scan" className="text-sm text-slate-700">Enable automatic device scanning</label>
                  </div>
                </div>
              )}

              {/* SPI Configuration */}
              {selectedProtocol === 'SPI' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">MOSI Pin</label>
                      <select className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option value="23">GPIO 23 (Default)</option>
                        <option value="13">GPIO 13</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">MISO Pin</label>
                      <select className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option value="19">GPIO 19 (Default)</option>
                        <option value="12">GPIO 12</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">SCK Pin</label>
                      <select className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option value="18">GPIO 18 (Default)</option>
                        <option value="14">GPIO 14</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">CS Pin</label>
                      <select className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option value="5">GPIO 5 (Default)</option>
                        <option value="15">GPIO 15</option>
                        <option value="2">GPIO 2</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Clock Speed</label>
                      <select className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option value="1000000">1 MHz</option>
                        <option value="4000000">4 MHz (Default)</option>
                        <option value="8000000">8 MHz</option>
                        <option value="10000000">10 MHz</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Mode</label>
                      <select className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option value="0">Mode 0 (CPOL=0, CPHA=0)</option>
                        <option value="1">Mode 1 (CPOL=0, CPHA=1)</option>
                        <option value="2">Mode 2 (CPOL=1, CPHA=0)</option>
                        <option value="3">Mode 3 (CPOL=1, CPHA=1)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* CAN Bus Configuration */}
              {selectedProtocol === 'CAN Bus' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">TX Pin</label>
                      <select className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option value="21">GPIO 21 (Default)</option>
                        <option value="4">GPIO 4</option>
                        <option value="5">GPIO 5</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">RX Pin</label>
                      <select className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option value="22">GPIO 22 (Default)</option>
                        <option value="16">GPIO 16</option>
                        <option value="17">GPIO 17</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Bit Rate</label>
                      <select className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option value="125000">125 kbps</option>
                        <option value="250000">250 kbps (Default)</option>
                        <option value="500000">500 kbps</option>
                        <option value="1000000">1 Mbps</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Mode</label>
                      <select className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option value="normal">Normal</option>
                        <option value="listen">Listen Only</option>
                        <option value="loopback">Loopback</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="can-filters" className="text-blue-600" />
                      <label htmlFor="can-filters" className="text-sm text-slate-700">Enable message filtering</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="can-errors" className="text-blue-600" defaultChecked />
                      <label htmlFor="can-errors" className="text-sm text-slate-700">Enable error frame handling</label>
                    </div>
                  </div>
                </div>
              )}

              {/* Generic configuration for other protocols */}
              {!['I2C', 'SPI', 'CAN Bus'].includes(selectedProtocol) && (
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <Settings className="w-5 h-5 text-blue-600 mr-2" />
                      <span className="text-blue-800 font-medium">Protocol Configuration</span>
                    </div>
                    <p className="text-blue-700 text-sm mt-2">
                      {selectedProtocol} configuration options will be available here. 
                      This protocol supports advanced settings for industrial communication.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Baud Rate</label>
                      <select className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option value="9600">9600</option>
                        <option value="19200">19200</option>
                        <option value="38400">38400</option>
                        <option value="115200">115200 (Default)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Data Bits</label>
                      <select className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option value="7">7</option>
                        <option value="8">8 (Default)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-slate-200">
                <button 
                  onClick={() => setSelectedProtocol(null)}
                  className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleSaveProtocolConfig(selectedProtocol, { configured: true })}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save & Enable
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className={`bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white ${isDarkMode ? 'dark-mode' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className={`grid md:grid-cols-2 lg:grid-cols-5 gap-12 border-t ${isDarkMode ? 'border-slate-700' : 'border-slate-800'} pt-12 mt-12`}>
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Bridge Legacy to 
                <span className="text-blue-400 block">Modern IoT</span>
              </h1>
              <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                Transform your industrial equipment with our ESP32-powered IoT Gateway. 
                Connect I2C, SPI, UART, Modbus, CAN Bus, and RS485 protocols to WiFi networks 
                and cloud platforms with zero-code configuration tools.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => setShowConfigModal(true)}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center group"
                >
                  Start Configuration
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="border border-slate-400 text-slate-200 px-8 py-3 rounded-lg hover:bg-slate-800 transition-colors">
                  View Live Demo
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="bg-slate-800 rounded-2xl p-8 shadow-2xl">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-blue-600 h-4 rounded animate-pulse"></div>
                  <div className="bg-green-500 h-4 rounded animate-pulse delay-75"></div>
                  <div className="bg-orange-500 h-4 rounded animate-pulse delay-150"></div>
                  <div className="bg-purple-500 h-4 rounded animate-pulse delay-300"></div>
                </div>
                <div className="text-center">
                  <Cpu className="w-16 h-16 mx-auto text-blue-400 mb-4" />
                  <p className="text-slate-300 mb-2">ESP32 Gateway</p>
                  <div className="flex justify-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-100"></div>
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse delay-200"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-20 bg-gradient-to-r from-blue-600 to-indigo-600 text-white ${isDarkMode ? 'dark-mode' : ''}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Configure Your Industrial Infrastructure?
          </h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Join hundreds of companies transforming their legacy equipment with our zero-code 
            configuration platform. Start your digital transformation today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors font-semibold flex items-center justify-center">
              <Play className="w-5 h-5 mr-2" />
              Try Live Demo
            </button>
            <button className="border border-white text-white px-8 py-3 rounded-lg hover:bg-white hover:text-blue-600 transition-colors flex items-center justify-center">
              <Download className="w-5 h-5 mr-2" />
              Download Configuration Guide
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className={`${isDarkMode ? 'bg-slate-950' : 'bg-slate-900'} text-white py-12`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Cpu className="w-8 h-8 text-blue-400 mr-2" />
                <span className="text-xl font-bold">IoT Gateway</span>
              </div>
              <p className="text-slate-400">
                Bridging industrial legacy systems with modern IoT infrastructure through intelligent configuration.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Configuration Tools</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Protocol Support</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integration Guide</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Documentation</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Configuration Templates</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Video Tutorials</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Best Practices</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community Forum</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Connect</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <Github className="w-6 h-6" />
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <Mail className="w-6 h-6" />
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <Phone className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
            <p className={`text-center ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} mt-8`}>
              &copy; {new Date().getFullYear()} ESP32 Industrial IoT Bridge. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;