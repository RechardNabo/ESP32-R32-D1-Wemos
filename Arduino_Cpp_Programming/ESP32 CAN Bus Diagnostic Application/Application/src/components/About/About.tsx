import React from 'react';
import { Cpu, Wifi, Database, Shield, Code, Globe } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-4">About ESP32 CAN Diagnostic Tool</h2>
        <p className="text-gray-300 mb-4">
          A comprehensive automotive diagnostic solution built on the ESP32 platform with integrated CAN controller.
          This tool provides professional-grade vehicle diagnostics, real-time monitoring, and advanced analysis capabilities.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Cpu className="text-blue-400" size={20} />
              <h3 className="font-semibold text-white">Hardware</h3>
            </div>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• ESP32-S3 MCU</li>
              <li>• Integrated CAN Controller</li>
              <li>• TJA1050 CAN Transceiver</li>
              <li>• OBD-II Interface</li>
            </ul>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Wifi className="text-green-400" size={20} />
              <h3 className="font-semibold text-white">Connectivity</h3>
            </div>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• WiFi Access Point</li>
              <li>• WebSocket Support</li>
              <li>• Multi-Client Support</li>
              <li>• OTA Updates</li>
            </ul>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Database className="text-yellow-400" size={20} />
              <h3 className="font-semibold text-white">Data</h3>
            </div>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Real-time Logging</li>
              <li>• CSV/JSON Export</li>
              <li>• Data Visualization</li>
              <li>• Historical Analysis</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Supported Protocols</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">OBD-II</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• ISO 15765-4 (CAN)</li>
              <li>• ISO 14230-4 (KWP2000)</li>
              <li>• ISO 9141-2</li>
              <li>• J1850 PWM/VPW</li>
            </ul>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">Industrial</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• J1939 (Heavy Duty)</li>
              <li>• UDS (ISO 14229)</li>
              <li>• Custom Protocols</li>
              <li>• Raw CAN Analysis</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">System Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-300">Firmware Version:</span>
              <span className="text-white">v2.1.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Hardware Revision:</span>
              <span className="text-white">Rev B</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Build Date:</span>
              <span className="text-white">2024-01-15</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Memory Usage:</span>
              <span className="text-white">156KB / 512KB</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-300">Flash Size:</span>
              <span className="text-white">4MB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">PSRAM:</span>
              <span className="text-white">8MB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">CPU Frequency:</span>
              <span className="text-white">240MHz</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">MAC Address:</span>
              <span className="text-white font-mono">AA:BB:CC:DD:EE:FF</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-start space-x-3">
            <Shield className="text-green-400 mt-1" size={16} />
            <div>
              <h4 className="font-semibold text-white">Security</h4>
              <p className="text-sm text-gray-300">WPA2 encryption, session management</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <Code className="text-blue-400 mt-1" size={16} />
            <div>
              <h4 className="font-semibold text-white">Open Source</h4>
              <p className="text-sm text-gray-300">Full source code available</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <Globe className="text-purple-400 mt-1" size={16} />
            <div>
              <h4 className="font-semibold text-white">Cross-Platform</h4>
              <p className="text-sm text-gray-300">Works on any device with a web browser</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">License & Credits</h3>
        <div className="text-sm text-gray-300 space-y-2">
          <p>© 2024 ESP32 CAN Diagnostic Tool. Licensed under MIT License.</p>
          <p>Built with React, TypeScript, and Tailwind CSS.</p>
          <p>Hardware powered by Espressif ESP32-S3 microcontroller.</p>
        </div>
      </div>
    </div>
  );
};