import React, { useState } from 'react';
import { Thermometer, Flame, Snowflake, TrendingUp, Zap, Clock } from 'lucide-react';
import { PoolZone } from '../types';

interface TemperatureControlProps {
  zone: PoolZone;
}

const TemperatureControl: React.FC<TemperatureControlProps> = ({ zone }) => {
  const [targetTemp, setTargetTemp] = useState(zone.targetTemp);
  const [isScheduleMode, setIsScheduleMode] = useState(false);
  const [ecoMode, setEcoMode] = useState(true);

  const tempDifference = targetTemp - zone.currentTemp;
  const estimatedTime = Math.abs(tempDifference) * 30; // rough estimate: 30 min per degree

  const presets = [
    { name: 'Cool', temp: zone.id === 'pool' ? 78 : 98, icon: Snowflake, color: 'blue' },
    { name: 'Comfort', temp: zone.id === 'pool' ? 82 : 102, icon: Thermometer, color: 'green' },
    { name: 'Warm', temp: zone.id === 'pool' ? 86 : 106, icon: Flame, color: 'orange' }
  ];

  const handleTempChange = (newTemp: number) => {
    setTargetTemp(Math.max(65, Math.min(108, newTemp)));
  };

  const getHeatDirection = () => {
    if (tempDifference > 0) return 'heating';
    if (tempDifference < 0) return 'cooling';
    return 'maintaining';
  };

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 p-6 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-orange-100 rounded-xl">
            <Thermometer className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Temperature Control</h3>
            <p className="text-sm text-gray-600 capitalize">{zone.name}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setEcoMode(!ecoMode)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
              ecoMode
                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                : 'bg-gray-100 text-gray-600 border border-gray-200'
            }`}
          >
            {ecoMode ? 'Eco Mode' : 'Standard'}
          </button>
        </div>
      </div>

      {/* Current Temperature Display */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-orange-50 to-red-50 rounded-full border-4 border-white shadow-lg mb-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">{zone.currentTemp}</div>
            <div className="text-sm text-gray-600">°F</div>
          </div>
        </div>
        
        <div className="flex items-center justify-center space-x-4 text-sm">
          <div className={`flex items-center space-x-1 px-3 py-1 rounded-full ${
            zone.isHeating ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
          }`}>
            <Flame className="w-4 h-4" />
            <span>{zone.isHeating ? 'Heating' : 'Standby'}</span>
          </div>
          
          {getHeatDirection() !== 'maintaining' && (
            <div className="flex items-center space-x-1 text-blue-600">
              <Clock className="w-4 h-4" />
              <span>{estimatedTime}min</span>
            </div>
          )}
        </div>
      </div>

      {/* Temperature Slider */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">Target Temperature</span>
          <span className="text-lg font-bold text-blue-600">{targetTemp}°F</span>
        </div>
        
        <div className="relative">
          <input
            type="range"
            min="65"
            max="108"
            value={targetTemp}
            onChange={(e) => handleTempChange(parseInt(e.target.value))}
            className="w-full h-3 bg-gradient-to-r from-blue-200 via-green-200 to-red-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>65°F</span>
            <span>85°F</span>
            <span>108°F</span>
          </div>
        </div>
      </div>

      {/* Temperature Presets */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Presets</h4>
        <div className="grid grid-cols-3 gap-2">
          {presets.map((preset, index) => (
            <button
              key={index}
              onClick={() => handleTempChange(preset.temp)}
              className={`p-3 rounded-xl border transition-all duration-200 ${
                targetTemp === preset.temp
                  ? `bg-${preset.color}-100 border-${preset.color}-300 text-${preset.color}-700`
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <preset.icon className="w-5 h-5 mx-auto mb-1" />
              <div className="text-xs font-medium">{preset.name}</div>
              <div className="text-xs">{preset.temp}°F</div>
            </button>
          ))}
        </div>
      </div>

      {/* Energy Information */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border border-blue-200 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Zap className="w-5 h-5 text-blue-600" />
            <div>
              <div className="text-sm font-medium text-gray-900">Energy Usage</div>
              <div className="text-xs text-gray-600">
                {ecoMode ? 'Optimized schedule active' : 'Standard heating'}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-gray-900">2.4 kWh</div>
            <div className="text-xs text-gray-600">Today</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setIsScheduleMode(!isScheduleMode)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
        >
          {isScheduleMode ? 'Manual Mode' : 'Schedule Mode'}
        </button>
        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm font-medium">
          Boost Heat
        </button>
      </div>

      {/* Schedule Mode Panel */}
      {isScheduleMode && (
        <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <h4 className="font-medium text-gray-900 mb-3">Heating Schedule</h4>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Morning (6:00 AM)</span>
              <span className="font-medium">80°F</span>
            </div>
            <div className="flex justify-between">
              <span>Evening (6:00 PM)</span>
              <span className="font-medium">84°F</span>
            </div>
            <div className="flex justify-between">
              <span>Night (10:00 PM)</span>
              <span className="font-medium">78°F</span>
            </div>
          </div>
          <button className="mt-3 w-full px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors duration-200 text-sm font-medium">
            Edit Schedule
          </button>
        </div>
      )}
    </div>
  );
};

export default TemperatureControl;