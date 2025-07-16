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
  const [error, setError] = useState<string | null>(null);

  const scanNetworks = async () => {
    setScanning(true);
    setError(null);
    try {
      // Get the base URL (using window.location for local development or when deployed on ESP32)
      const baseUrl = window.location.hostname === 'localhost' 
        ? 'http://192.168.4.1' // Replace with your ESP32 IP when testing locally
        : window.location.origin;
      
      const response = await fetch(`${baseUrl}/api/wifi/scan`);
      
      if (!response.ok) {
        throw new Error(`Network scan failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Transform the data to match our NetworkInfo interface
      const networksList: NetworkInfo[] = data.map(network => ({
        ssid: network.ssid || 'Unknown',
        // Map ESP32's rssi to our signal property
        signal: network.rssi || -100,
        encryption: network.encryption || 'unknown',
        // Use a default channel if not provided by the ESP32
        channel: network.channel || 1
      }));
      
      setNetworks(networksList);
      console.log('Networks found:', networksList.length);
    } catch (err) {
      console.error('Error scanning networks:', err);
      setError('Failed to scan networks. Please try again.');
      setNetworks([]);
    } finally {
      setScanning(false);
    }
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

      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
          {error}
        </div>
      )}
      
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