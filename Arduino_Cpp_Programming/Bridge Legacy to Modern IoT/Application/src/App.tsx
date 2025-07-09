import React, { useState } from 'react';
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
  Wrench,
  Globe,
  Lock,
  BarChart3,
  AlertTriangle,
  Play,
  Download,
  Upload,
  RefreshCw,
  Terminal,
  Smartphone
} from 'lucide-react';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeConfigTab, setActiveConfigTab] = useState('protocols');
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedProtocol, setSelectedProtocol] = useState<string | null>(null);
  const [protocolConfigs, setProtocolConfigs] = useState<{[key: string]: any}>({});

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

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Cpu className="w-8 h-8 text-blue-600 mr-2" />
              <span className="text-xl font-bold text-slate-900">IoT Gateway</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-slate-700 hover:text-blue-600 transition-colors">Features</a>
              <a href="#configuration" className="text-slate-700 hover:text-blue-600 transition-colors">Configuration</a>
              <a href="#integration" className="text-slate-700 hover:text-blue-600 transition-colors">Integration</a>
              <a href="#specs" className="text-slate-700 hover:text-blue-600 transition-colors">Specifications</a>
              <a href="#contact" className="text-slate-700 hover:text-blue-600 transition-colors">Contact</a>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Get Started
              </button>
            </div>

            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-slate-700 hover:text-blue-600"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a href="#features" className="block px-3 py-2 text-slate-700">Features</a>
              <a href="#configuration" className="block px-3 py-2 text-slate-700">Configuration</a>
              <a href="#integration" className="block px-3 py-2 text-slate-700">Integration</a>
              <a href="#specs" className="block px-3 py-2 text-slate-700">Specifications</a>
              <a href="#contact" className="block px-3 py-2 text-slate-700">Contact</a>
              <button className="w-full text-left px-3 py-2 bg-blue-600 text-white rounded-lg">
                Get Started
              </button>
            </div>
          </div>
        )}
      </nav>
      {/* Protocol Configuration Modal */}
      {selectedProtocol && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center p-4">
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
      <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
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

      {/* Configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-slate-900">Gateway Configuration</h2>
                <button 
                  onClick={() => setShowConfigModal(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-8 h-8" />
                </button>
              </div>

              {/* Configuration Tabs */}
              <div className="flex space-x-1 mb-8 bg-slate-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveConfigTab('protocols')}
                  className={`px-6 py-3 rounded-md font-medium transition-colors ${
                    activeConfigTab === 'protocols'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Protocol Setup
                </button>
                <button
                  onClick={() => setActiveConfigTab('network')}
                  className={`px-6 py-3 rounded-md font-medium transition-colors ${
                    activeConfigTab === 'network'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Network Settings
                </button>
                <button
                  onClick={() => setActiveConfigTab('cloud')}
                  className={`px-6 py-3 rounded-md font-medium transition-colors ${
                    activeConfigTab === 'cloud'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Cloud Integration
                </button>
              </div>

              {/* Protocol Setup Tab */}
              {activeConfigTab === 'protocols' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {protocols.slice(0, 6).map((protocol, index) => (
                      <div key={index} className="border border-slate-200 rounded-lg p-6 hover:border-blue-300 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-slate-900">{protocol.name}</h3>
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${isProtocolEnabled(protocol.name) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                            <span className="text-sm text-slate-500">
                              {isProtocolEnabled(protocol.name) ? 'Enabled' : 'Disabled'}
                            </span>
                          </div>
                        </div>
                        <p className="text-slate-600 text-sm mb-4">{protocol.description}</p>
                        <button 
                          onClick={() => handleProtocolConfigure(protocol.name)}
                          className="w-full bg-blue-50 text-blue-600 py-2 px-4 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                        >
                          Configure {protocol.name}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Network Settings Tab */}
              {activeConfigTab === 'network' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-slate-900">WiFi Configuration</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Network Name (SSID)</label>
                          <input type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Enter WiFi network name" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                          <input type="password" className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Enter WiFi password" />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-slate-900">IP Configuration</h3>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <input type="radio" id="dhcp" name="ip-config" className="text-blue-600" defaultChecked />
                          <label htmlFor="dhcp" className="text-sm text-slate-700">DHCP (Automatic)</label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <input type="radio" id="static" name="ip-config" className="text-blue-600" />
                          <label htmlFor="static" className="text-sm text-slate-700">Static IP</label>
                        </div>
                        <div className="pl-6 space-y-2 opacity-50">
                          <input type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" placeholder="192.168.1.100" />
                          <input type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" placeholder="255.255.255.0" />
                          <input type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" placeholder="192.168.1.1" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Cloud Integration Tab */}
              {activeConfigTab === 'cloud' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="border border-slate-200 rounded-lg p-6 hover:border-blue-300 transition-colors">
                      <div className="flex items-center mb-4">
                        <Cloud className="w-8 h-8 text-orange-500 mr-3" />
                        <h3 className="text-lg font-semibold text-slate-900">AWS IoT Core</h3>
                      </div>
                      <p className="text-slate-600 text-sm mb-4">Connect to Amazon Web Services IoT platform</p>
                      <button className="w-full bg-orange-50 text-orange-600 py-2 px-4 rounded-lg hover:bg-orange-100 transition-colors text-sm font-medium">
                        Configure AWS
                      </button>
                    </div>
                    <div className="border border-slate-200 rounded-lg p-6 hover:border-blue-300 transition-colors">
                      <div className="flex items-center mb-4">
                        <Cloud className="w-8 h-8 text-blue-500 mr-3" />
                        <h3 className="text-lg font-semibold text-slate-900">Azure IoT Hub</h3>
                      </div>
                      <p className="text-slate-600 text-sm mb-4">Connect to Microsoft Azure IoT services</p>
                      <button className="w-full bg-blue-50 text-blue-600 py-2 px-4 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium">
                        Configure Azure
                      </button>
                    </div>
                    <div className="border border-slate-200 rounded-lg p-6 hover:border-blue-300 transition-colors">
                      <div className="flex items-center mb-4">
                        <Cloud className="w-8 h-8 text-green-500 mr-3" />
                        <h3 className="text-lg font-semibold text-slate-900">Google Cloud IoT</h3>
                      </div>
                      <p className="text-slate-600 text-sm mb-4">Connect to Google Cloud Platform IoT Core</p>
                      <button className="w-full bg-green-50 text-green-600 py-2 px-4 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium">
                        Configure Google
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-slate-200">
                <button 
                  onClick={() => setShowConfigModal(false)}
                  className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveConfiguration}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Configuration
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Protocol Support */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Universal Protocol Support with Easy Configuration
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Connect any industrial equipment with comprehensive protocol support 
              and intuitive configuration tools for seamless integration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {protocols.map((protocol, index) => (
              <div 
                key={index}
                className="bg-slate-50 border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 group cursor-pointer hover:border-blue-300"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-slate-900">{protocol.name}</h3>
                  <Settings className="w-5 h-5 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-slate-600 text-sm mb-4">{protocol.description}</p>
                <div className="space-y-1">
                  {protocol.configFeatures.map((feature, idx) => (
                    <div key={idx} className="flex items-center text-xs text-slate-500">
                      <CheckCircle className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Configuration Features */}
      <section id="configuration" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Zero-Code Configuration Platform
            </h2>
            <p className="text-xl text-slate-600">
              Powerful tools to configure, manage, and monitor your industrial connections
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {configurationFeatures.map((feature, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl p-8 shadow-sm hover:shadow-lg transition-shadow group"
              >
                <div className="text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 mb-4 leading-relaxed">
                  {feature.description}
                </p>
                <ul className="space-y-2">
                  {feature.features.map((item, idx) => (
                    <li key={idx} className="flex items-center text-sm text-slate-600">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Process */}
      <section id="integration" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              5-Step Integration Process
            </h2>
            <p className="text-xl text-slate-600">
              Get your legacy equipment connected to modern systems in minutes, not months
            </p>
          </div>

          <div className="relative">
            {/* Connection line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200 transform -translate-y-1/2"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
              {integrationSteps.map((step, index) => (
                <div key={index} className="relative">
                  <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-slate-200 relative z-10">
                    <div className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full mb-4 mx-auto">
                      {step.icon}
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600 mb-2">
                        {step.step}
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">
                        {step.title}
                      </h3>
                      <p className="text-slate-600 text-sm">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Management Tools */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Comprehensive Management Tools
            </h2>
            <p className="text-xl text-slate-600">
              Everything you need to deploy, monitor, and maintain your IoT infrastructure
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {managementTools.map((tool, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                  {tool.icon}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {tool.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {tool.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Enterprise-Grade Features
            </h2>
            <p className="text-xl text-slate-600">
              Built for industrial environments with reliability and security in mind
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-slate-50 rounded-xl p-8 hover:shadow-md transition-shadow group"
              >
                <div className="text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Specifications */}
      <section id="specs" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-slate-900 mb-6">
                Technical Specifications
              </h2>
              <p className="text-xl text-slate-600 mb-8">
                Powered by the robust ESP32 microcontroller with dual-core processing 
                and extensive connectivity options for demanding industrial applications.
              </p>
              
              <div className="space-y-4">
                {specs.map((spec, index) => (
                  <div key={index} className="flex justify-between items-center py-3 border-b border-slate-200 last:border-b-0">
                    <span className="text-slate-700 font-medium">{spec.label}</span>
                    <span className="text-slate-900 font-semibold">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-slate-900 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-6">Configuration Capabilities</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <p className="text-slate-300">Web-based configuration interface with real-time preview</p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <p className="text-slate-300">RESTful API for programmatic configuration management</p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <p className="text-slate-300">Configuration templates for common industrial protocols</p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <p className="text-slate-300">Automated backup and version control for configurations</p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <p className="text-slate-300">Built-in protocol analyzer and debugging tools</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
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
      <footer id="contact" className="bg-slate-900 text-white py-12">
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
            <p>&copy; 2024 IoT Gateway Solutions. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;