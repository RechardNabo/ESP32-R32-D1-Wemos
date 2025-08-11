import React, { useState } from 'react';
import { Droplets, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { WaterQuality } from '../types';

interface WaterQualityPanelProps {
  waterQuality: WaterQuality;
  zone: string;
}

const WaterQualityPanel: React.FC<WaterQualityPanelProps> = ({ waterQuality, zone }) => {
  const [isAutoMode, setIsAutoMode] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  const parameters = [
    {
      name: 'pH Level',
      value: waterQuality.ph,
      unit: '',
      ideal: [7.2, 7.8],
      status: waterQuality.ph >= 7.2 && waterQuality.ph <= 7.8 ? 'optimal' : 'warning',
      icon: Droplets,
      color: 'blue'
    },
    {
      name: 'Chlorine',
      value: waterQuality.chlorine,
      unit: 'ppm',
      ideal: [1.0, 3.0],
      status: waterQuality.chlorine >= 1.0 && waterQuality.chlorine <= 3.0 ? 'optimal' : 'warning',
      icon: TrendingUp,
      color: 'green'
    },
    {
      name: 'Alkalinity',
      value: waterQuality.alkalinity,
      unit: 'ppm',
      ideal: [80, 120],
      status: waterQuality.alkalinity >= 80 && waterQuality.alkalinity <= 120 ? 'optimal' : 'warning',
      icon: TrendingDown,
      color: 'purple'
    },
    {
      name: 'Calcium Hardness',
      value: waterQuality.calciumHardness,
      unit: 'ppm',
      ideal: [150, 300],
      status: waterQuality.calciumHardness >= 150 && waterQuality.calciumHardness <= 300 ? 'optimal' : 'warning',
      icon: CheckCircle,
      color: 'orange'
    }
  ];

  const getStatusIcon = (status: string) => {
    return status === 'optimal' ? CheckCircle : AlertTriangle;
  };

  const getStatusColor = (status: string) => {
    return status === 'optimal' ? 'text-emerald-600' : 'text-amber-600';
  };

  const getProgressBarColor = (status: string) => {
    return status === 'optimal' ? 'bg-emerald-500' : 'bg-amber-500';
  };

  const calculateProgress = (value: number, ideal: number[]) => {
    const min = ideal[0] - (ideal[1] - ideal[0]) * 0.5;
    const max = ideal[1] + (ideal[1] - ideal[0]) * 0.5;
    return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  };

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 p-6 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-xl">
            <Droplets className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Water Quality</h3>
            <p className="text-sm text-gray-600 capitalize">{zone} Monitoring</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsAutoMode(!isAutoMode)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
              isAutoMode
                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
            }`}
          >
            {isAutoMode ? 'Auto Mode' : 'Manual Mode'}
          </button>
          
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200">
            <RefreshCw className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Overall Status */}
      <div className={`p-4 rounded-xl mb-4 border ${
        waterQuality.status === 'optimal' 
          ? 'bg-emerald-50 border-emerald-200' 
          : waterQuality.status === 'warning'
          ? 'bg-amber-50 border-amber-200'
          : 'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-center space-x-3">
          {React.createElement(getStatusIcon(waterQuality.status), {
            className: `w-5 h-5 ${getStatusColor(waterQuality.status)}`
          })}
          <div>
            <div className="font-medium text-gray-900 capitalize">
              {waterQuality.status === 'optimal' ? 'Water Quality Excellent' : 
               waterQuality.status === 'warning' ? 'Attention Needed' : 'Immediate Action Required'}
            </div>
            <div className="text-sm text-gray-600">
              Last updated: {waterQuality.lastUpdated.toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      {/* Parameters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        {parameters.map((param, index) => (
          <div key={index} className="p-4 bg-gray-50/50 rounded-xl border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <param.icon className={`w-4 h-4 text-${param.color}-600`} />
                <span className="text-sm font-medium text-gray-700">{param.name}</span>
              </div>
              {React.createElement(getStatusIcon(param.status), {
                className: `w-4 h-4 ${getStatusColor(param.status)}`
              })}
            </div>
            
            <div className="flex items-end space-x-2 mb-2">
              <span className="text-2xl font-bold text-gray-900">{param.value}</span>
              <span className="text-sm text-gray-600 pb-1">{param.unit}</span>
            </div>
            
            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              <span>{param.ideal[0]}</span>
              <span>Ideal: {param.ideal[0]}-{param.ideal[1]}</span>
              <span>{param.ideal[1]}</span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${getProgressBarColor(param.status)}`}
                style={{ width: `${calculateProgress(param.value, param.ideal)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <button className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium">
          Auto Balance
        </button>
        <button 
          onClick={() => setShowDetails(!showDetails)}
          className="flex-1 sm:flex-none px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm font-medium"
        >
          {showDetails ? 'Hide Details' : 'View Details'}
        </button>
        <button className="flex-1 sm:flex-none px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors duration-200 text-sm font-medium">
          Test Water
        </button>
      </div>

      {/* Detailed Information */}
      {showDetails && (
        <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">Chemical Recommendations</h4>
          <div className="space-y-2 text-sm text-gray-600">
            {waterQuality.ph > 7.8 && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full" />
                <span>Add pH decreaser: 0.5 lbs recommended</span>
              </div>
            )}
            {waterQuality.chlorine < 1.0 && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                <span>Add chlorine: 2.0 lbs shock treatment needed</span>
              </div>
            )}
            {waterQuality.alkalinity < 80 && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full" />
                <span>Add alkalinity increaser: 1.5 lbs recommended</span>
              </div>
            )}
            {parameters.every(p => p.status === 'optimal') && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                <span>All parameters optimal. No action needed.</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WaterQualityPanel;