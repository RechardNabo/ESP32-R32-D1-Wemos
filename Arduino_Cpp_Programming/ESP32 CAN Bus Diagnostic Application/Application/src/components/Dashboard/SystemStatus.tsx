import React from 'react';
import { Wifi, Battery, Thermometer, Clock, Activity } from 'lucide-react';
import { SystemStatus as SystemStatusType } from '../../types/can';

interface SystemStatusProps {
  status: SystemStatusType | null;
  isDarkMode?: boolean;
}

export const SystemStatus: React.FC<SystemStatusProps> = ({ status, isDarkMode = true }) => {
  if (!status) {
    return (
      <div className={`rounded-lg p-6 animate-pulse ${
        isDarkMode ? 'bg-gray-800' : 'bg-white shadow-lg'
      }`}>
        <div className={`h-6 rounded mb-4 ${
          isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
        }`}></div>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`h-16 rounded ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
            }`}></div>
          ))}
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-400';
      case 'disconnected': return 'text-red-400';
      case 'error': return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };

  const getBatteryColor = (voltage: number) => {
    if (voltage > 13.5) return 'text-green-400';
    if (voltage > 12.0) return 'text-yellow-400';
    return 'text-red-400';
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className={`rounded-lg p-6 backdrop-blur-sm ${
      isDarkMode 
        ? 'bg-gray-800 bg-opacity-90' 
        : 'bg-white bg-opacity-90 shadow-lg'
    }`}>
      <h3 className={`text-xl font-semibold mb-4 ${
        isDarkMode ? 'text-white' : 'text-gray-900'
      }`}>System Status</h3>
      
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className={`flex items-center space-x-3 p-3 rounded-lg ${
          isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
        }`}>
          <div className={`p-2 rounded-full ${status.canBusStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`}>
            <Activity size={16} className="text-white" />
          </div>
          <div>
            <p className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>CAN Bus</p>
            <p className={`font-semibold ${getStatusColor(status.canBusStatus)}`}>
              {status.canBusStatus}
            </p>
          </div>
        </div>

        <div className={`flex items-center space-x-3 p-3 rounded-lg ${
          isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
        }`}>
          <div className="p-2 bg-blue-500 rounded-full">
            <Wifi size={16} className="text-white" />
          </div>
          <div>
            <p className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>WiFi Clients</p>
            <p className="font-semibold text-blue-400">{status.wifiClients}</p>
          </div>
        </div>

        <div className={`flex items-center space-x-3 p-3 rounded-lg ${
          isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
        }`}>
          <div className="p-2 bg-yellow-500 rounded-full">
            <Battery size={16} className="text-white" />
          </div>
          <div>
            <p className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Battery</p>
            <p className={`font-semibold ${getBatteryColor(status.batteryVoltage)}`}>
              {status.batteryVoltage.toFixed(1)}V
            </p>
          </div>
        </div>

        <div className={`flex items-center space-x-3 p-3 rounded-lg ${
          isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
        }`}>
          <div className="p-2 bg-red-500 rounded-full">
            <Thermometer size={16} className="text-white" />
          </div>
          <div>
            <p className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Temperature</p>
            <p className="font-semibold text-red-400">{status.temperature}°C</p>
          </div>
        </div>

        <div className={`flex items-center space-x-3 p-3 rounded-lg ${
          isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
        }`}>
          <div className="p-2 bg-purple-500 rounded-full">
            <Clock size={16} className="text-white" />
          </div>
          <div>
            <p className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Uptime</p>
            <p className="font-semibold text-purple-400">{formatUptime(status.uptime)}</p>
          </div>
        </div>
      </div>

      <div className={`mt-4 p-3 rounded-lg ${
        isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
      }`}>
        <div className="flex justify-between items-center">
          <span className={`text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>Messages/sec</span>
          <span className="font-semibold text-green-400">{status.messagesPerSecond}</span>
        </div>
        <div className={`mt-2 w-full rounded-full h-2 ${
          isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
        }`}>
          <div 
            className="bg-green-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(status.messagesPerSecond / 10, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
};