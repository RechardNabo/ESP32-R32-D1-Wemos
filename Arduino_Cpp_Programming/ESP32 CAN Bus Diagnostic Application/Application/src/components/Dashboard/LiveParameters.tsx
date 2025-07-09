import React from 'react';
import { Gauge, Thermometer, Droplets, Zap } from 'lucide-react';
import { OBDParameter } from '../../types/can';

interface LiveParametersProps {
  parameters: OBDParameter[];
  isDarkMode?: boolean;
}

export const LiveParameters: React.FC<LiveParametersProps> = ({ parameters, isDarkMode = true }) => {
  const getParameterIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('rpm')) return Gauge;
    if (lowerName.includes('temp')) return Thermometer;
    if (lowerName.includes('fuel')) return Droplets;
    return Zap;
  };

  const getParameterColor = (name: string, value: number, min?: number, max?: number) => {
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('temp')) {
      if (value > 100) return 'text-red-400';
      if (value > 80) return 'text-orange-400';
      return 'text-blue-400';
    }
    
    if (lowerName.includes('rpm')) {
      if (value > 6000) return 'text-red-400';
      if (value > 4000) return 'text-orange-400';
      return 'text-green-400';
    }
    
    if (min && max) {
      const percentage = (value - min) / (max - min);
      if (percentage > 0.8) return 'text-red-400';
      if (percentage > 0.6) return 'text-orange-400';
      return 'text-green-400';
    }
    
    return 'text-blue-400';
  };

  const getProgressPercentage = (value: number, min?: number, max?: number) => {
    if (!min || !max) return 0;
    return Math.min(Math.max(((value - min) / (max - min)) * 100, 0), 100);
  };

  if (parameters.length === 0) {
    return (
      <div className={`rounded-lg p-6 ${
        isDarkMode ? 'bg-gray-800' : 'bg-white shadow-lg'
      }`}>
        <h3 className={`text-xl font-semibold mb-4 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>Live Parameters</h3>
        <div className="text-center py-8">
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>No live data available</p>
          <p className={`text-sm mt-2 ${
            isDarkMode ? 'text-gray-500' : 'text-gray-500'
          }`}>Connect to vehicle to see real-time parameters</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg p-6 backdrop-blur-sm ${
      isDarkMode 
        ? 'bg-gray-800 bg-opacity-90' 
        : 'bg-white bg-opacity-90 shadow-lg'
    }`}>
      <h3 className={`text-xl font-semibold mb-4 ${
        isDarkMode ? 'text-white' : 'text-gray-900'
      }`}>Live Parameters</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {parameters.map((param, index) => {
          const Icon = getParameterIcon(param.name);
          const color = getParameterColor(param.name, param.value, param.min, param.max);
          const percentage = getProgressPercentage(param.value, param.min, param.max);
          
          return (
            <div key={index} className={`rounded-lg p-4 transition-colors ${
              isDarkMode 
                ? 'bg-gray-700 hover:bg-gray-600' 
                : 'bg-gray-50 hover:bg-gray-100'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Icon size={16} className={color} />
                  <span className={`text-sm ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>{param.name}</span>
                </div>
                <span className={`text-xs ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>{param.pid}</span>
              </div>
              
              <div className="flex items-end justify-between">
                <div>
                  <span className={`text-2xl font-bold ${color}`}>
                    {param.value.toFixed(1)}
                  </span>
                  <span className={`text-sm ml-1 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>{param.unit}</span>
                </div>
                
                {param.min !== undefined && param.max !== undefined && (
                  <div className={`text-xs ${
                    isDarkMode ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    {param.min} - {param.max}
                  </div>
                )}
              </div>
              
              {param.min !== undefined && param.max !== undefined && (
                <div className={`mt-2 w-full rounded-full h-2 ${
                  isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
                }`}>
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      percentage > 80 ? 'bg-red-400' : 
                      percentage > 60 ? 'bg-orange-400' : 'bg-green-400'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              )}
              
              <div className={`mt-2 text-xs ${
                isDarkMode ? 'text-gray-500' : 'text-gray-400'
              }`}>
                Updated: {new Date(param.timestamp).toLocaleTimeString()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};