import React, { useState } from 'react';
import { Wifi, RefreshCw, Lock, Signal } from 'lucide-react';

interface NetworkInfo {
  ssid: string;
  signal: number;
  encryption: string;
  channel: number;
}

interface NetworkScannerProps {
  onNetworkSelect: (network: NetworkInfo) => void;
}

export default function NetworkScanner({ onNetworkSelect }: NetworkScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [networks, setNetworks] = useState<NetworkInfo[]>([]);

  const mockNetworks: NetworkInfo[] = [
    { ssid: 'HomeNetwork_5G', signal: -35, encryption: 'WPA2', channel: 6 },
    { ssid: 'OfficeWiFi', signal: -45, encryption: 'WPA3', channel: 11 },
    { ssid: 'GuestNetwork', signal: -60, encryption: 'WPA2', channel: 1 },
    { ssid: 'SmartHome_IoT', signal: -55, encryption: 'WPA2', channel: 3 },
    { ssid: 'Neighbor_WiFi', signal: -75, encryption: 'WPA2', channel: 9 },
  ];

  const scanNetworks = async () => {
    setScanning(true);
    // Simulate network scanning
    await new Promise(resolve => setTimeout(resolve, 2000));
    setNetworks(mockNetworks);
    setScanning(false);
  };

  const getSignalStrength = (signal: number) => {
    if (signal > -50) return 'excellent';
    if (signal > -60) return 'good';
    if (signal > -70) return 'fair';
    return 'poor';
  };

  const getSignalBars = (signal: number) => {
    const strength = getSignalStrength(signal);
    const bars = {
      excellent: 4,
      good: 3,
      fair: 2,
      poor: 1
    };
    return bars[strength];
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700">Available Networks</h4>
        <button
          onClick={scanNetworks}
          disabled={scanning}
          className="flex items-center space-x-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${scanning ? 'animate-spin' : ''}`} />
          <span>{scanning ? 'Scanning...' : 'Scan'}</span>
        </button>
      </div>

      {networks.length > 0 && (
        <div className="max-h-48 overflow-y-auto space-y-2">
          {networks.map((network, index) => (
            <div
              key={index}
              onClick={() => onNetworkSelect(network)}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Wifi className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{network.ssid}</p>
                  <p className="text-xs text-gray-500">
                    Channel {network.channel} • {network.encryption}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {network.encryption !== 'OPEN' && (
                  <Lock className="h-3 w-3 text-gray-400" />
                )}
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4].map((bar) => (
                    <div
                      key={bar}
                      className={`w-1 h-3 rounded-full ${
                        bar <= getSignalBars(network.signal)
                          ? 'bg-green-500'
                          : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-500">{network.signal}dBm</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}