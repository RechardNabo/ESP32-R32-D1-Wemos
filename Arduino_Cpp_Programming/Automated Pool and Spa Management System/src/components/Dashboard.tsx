import React, { useState } from 'react';
import { Thermometer, Droplets, Zap, AlertTriangle, TrendingUp, Calendar } from 'lucide-react';
import WaterQualityPanel from './WaterQualityPanel';
import TemperatureControl from './TemperatureControl';
import EquipmentPanel from './EquipmentPanel';
import LightingControl from './LightingControl';
import AlertsPanel from './AlertsPanel';
import AnalyticsPanel from './AnalyticsPanel';
import MaintenancePanel from './MaintenancePanel';
import { mockPoolZones, mockAlerts, mockUsageData, mockMaintenanceTasks } from '../utils/data';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'maintenance'>('overview');
  const [selectedZone, setSelectedZone] = useState<'pool' | 'spa'>('pool');
  
  const currentZone = mockPoolZones.find(zone => zone.id === selectedZone)!;
  const unreadAlerts = mockAlerts.filter(alert => !alert.isRead).length;
  const pendingTasks = mockMaintenanceTasks.filter(task => !task.completed).length;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Thermometer },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'maintenance', label: 'Maintenance', icon: Calendar, badge: pendingTasks }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Droplets className="w-8 h-8 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">AquaFlow Pro</h1>
              </div>
              
              {/* Zone Selector */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                {mockPoolZones.map(zone => (
                  <button
                    key={zone.id}
                    onClick={() => setSelectedZone(zone.id)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                      selectedZone === zone.id 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-gray-600 hover:text-blue-600'
                    }`}
                  >
                    {zone.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Quick Status */}
              <div className="hidden sm:flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    currentZone.waterQuality.status === 'optimal' ? 'bg-emerald-500' :
                    currentZone.waterQuality.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'
                  }`} />
                  <span className="text-gray-600">Water: {currentZone.waterQuality.status}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Thermometer className="w-4 h-4 text-blue-500" />
                  <span className="text-gray-600">{currentZone.currentTemp}°F</span>
                </div>
              </div>

              {/* Alerts Badge */}
              {unreadAlerts > 0 && (
                <div className="relative">
                  <AlertTriangle className="w-6 h-6 text-amber-500" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{unreadAlerts}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`relative py-3 px-1 text-sm font-medium transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                    {tab.badge && tab.badge > 0 && (
                      <div className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                        {tab.badge}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Alerts */}
            <AlertsPanel alerts={mockAlerts} />
            
            {/* Main Controls Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <WaterQualityPanel waterQuality={currentZone.waterQuality} zone={selectedZone} />
              <TemperatureControl zone={currentZone} />
            </div>

            {/* Equipment and Lighting */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <EquipmentPanel equipment={currentZone.equipment} />
              <LightingControl />
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <AnalyticsPanel usageData={mockUsageData} waterQuality={currentZone.waterQuality} />
        )}

        {activeTab === 'maintenance' && (
          <MaintenancePanel tasks={mockMaintenanceTasks} equipment={currentZone.equipment} />
        )}
      </main>
    </div>
  );
};

export default Dashboard;