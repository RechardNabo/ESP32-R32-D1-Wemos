import React, { useState } from 'react';
import { TrendingUp, BarChart3, Zap, Droplets, Users, Calendar } from 'lucide-react';
import { UsageData, WaterQuality } from '../types';

interface AnalyticsPanelProps {
  usageData: UsageData[];
  waterQuality: WaterQuality;
}

const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ usageData, waterQuality }) => {
  const [selectedMetric, setSelectedMetric] = useState<'energy' | 'usage' | 'chemicals' | 'water'>('energy');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');

  const metrics = [
    { id: 'energy', label: 'Energy Usage', icon: Zap, color: 'blue', unit: 'kWh' },
    { id: 'usage', label: 'Pool Usage', icon: Users, color: 'green', unit: 'hours' },
    { id: 'chemicals', label: 'Chemical Usage', icon: Droplets, color: 'purple', unit: 'lbs' },
    { id: 'water', label: 'Water Quality', icon: TrendingUp, color: 'orange', unit: 'score' }
  ];

  const timeRanges = [
    { id: '7d', label: '7 Days' },
    { id: '30d', label: '30 Days' },
    { id: '90d', label: '90 Days' }
  ];

  const currentMetric = metrics.find(m => m.id === selectedMetric)!;
  
  // Calculate statistics
  const totalEnergy = usageData.reduce((sum, day) => sum + day.energy, 0);
  const avgDailyEnergy = totalEnergy / usageData.length;
  const totalUsage = usageData.reduce((sum, day) => sum + day.hours, 0);
  const avgBathers = usageData.reduce((sum, day) => sum + day.bathers, 0) / usageData.length;
  const totalChemicals = usageData.reduce((sum, day) => sum + day.chemicals, 0);

  const getMetricValue = (data: UsageData, metric: string) => {
    switch (metric) {
      case 'energy': return data.energy;
      case 'usage': return data.hours;
      case 'chemicals': return data.chemicals * 10; // Scale for visibility
      case 'water': return 85 + Math.random() * 15; // Mock water quality score
      default: return 0;
    }
  };

  const maxValue = Math.max(...usageData.map(d => getMetricValue(d, selectedMetric)));

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/70 backdrop-blur-md rounded-xl p-4 border border-white/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Zap className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{totalEnergy.toFixed(1)}</div>
              <div className="text-sm text-gray-600">kWh This Week</div>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Avg: {avgDailyEnergy.toFixed(1)} kWh/day
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-md rounded-xl p-4 border border-white/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{totalUsage}</div>
              <div className="text-sm text-gray-600">Hours This Week</div>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Avg: {avgBathers.toFixed(1)} bathers/day
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-md rounded-xl p-4 border border-white/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Droplets className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{totalChemicals.toFixed(1)}</div>
              <div className="text-sm text-gray-600">lbs Chemicals</div>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            15% less than last week
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-md rounded-xl p-4 border border-white/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">94</div>
              <div className="text-sm text-gray-600">Quality Score</div>
            </div>
          </div>
          <div className="mt-2 text-xs text-emerald-600 font-medium">
            Excellent
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-xl">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Usage Analytics</h3>
              <p className="text-sm text-gray-600">Detailed performance metrics</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Time Range Selector */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              {timeRanges.map(range => (
                <button
                  key={range.id}
                  onClick={() => setTimeRange(range.id as any)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                    timeRange === range.id 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Metric Selector */}
        <div className="flex space-x-2 mb-6 overflow-x-auto">
          {metrics.map(metric => {
            const Icon = metric.icon;
            return (
              <button
                key={metric.id}
                onClick={() => setSelectedMetric(metric.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-200 whitespace-nowrap ${
                  selectedMetric === metric.id
                    ? `bg-${metric.color}-100 border-${metric.color}-300 text-${metric.color}-700`
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{metric.label}</span>
              </button>
            );
          })}
        </div>

        {/* Chart */}
        <div className="h-64 mb-6">
          <div className="flex items-end justify-between h-full space-x-2">
            {usageData.map((data, index) => {
              const value = getMetricValue(data, selectedMetric);
              const height = (value / maxValue) * 100;
              const date = new Date(data.date);
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="flex-1 flex items-end">
                    <div
                      className={`w-full bg-gradient-to-t from-${currentMetric.color}-500 to-${currentMetric.color}-400 rounded-t-md transition-all duration-500 hover:scale-105 cursor-pointer`}
                      style={{ height: `${height}%` }}
                      title={`${data.date}: ${value.toFixed(1)} ${currentMetric.unit}`}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {date.getDate()}/{date.getMonth() + 1}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart Legend */}
        <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 bg-${currentMetric.color}-500 rounded-full`} />
            <span>{currentMetric.label} ({currentMetric.unit})</span>
          </div>
        </div>
      </div>

      {/* Insights Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Energy Insights</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div>
                <div className="font-medium text-green-800">Peak Efficiency</div>
                <div className="text-sm text-green-600">Tuesday, 2-4 PM</div>
              </div>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div>
                <div className="font-medium text-blue-800">Recommended Schedule</div>
                <div className="text-sm text-blue-600">Run pumps 6-8 AM, 6-8 PM</div>
              </div>
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Water Quality Trends</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">pH Stability</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 h-2 bg-gray-200 rounded-full">
                  <div className="w-14 h-2 bg-emerald-500 rounded-full" />
                </div>
                <span className="text-sm font-medium text-emerald-600">87%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Chlorine Consistency</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 h-2 bg-gray-200 rounded-full">
                  <div className="w-12 h-2 bg-blue-500 rounded-full" />
                </div>
                <span className="text-sm font-medium text-blue-600">75%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Overall Balance</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 h-2 bg-gray-200 rounded-full">
                  <div className="w-15 h-2 bg-purple-500 rounded-full" />
                </div>
                <span className="text-sm font-medium text-purple-600">94%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPanel;