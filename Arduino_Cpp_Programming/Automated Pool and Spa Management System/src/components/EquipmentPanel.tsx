import React, { useState } from 'react';
import { Power, Settings, Wrench, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { Equipment } from '../types';
import { formatPower, formatRuntime, formatFlowRate, formatPressure, getStatusColor } from '../utils/data';

interface EquipmentPanelProps {
  equipment: Equipment[];
}

const EquipmentPanel: React.FC<EquipmentPanelProps> = ({ equipment }) => {
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);

  const getEquipmentIcon = (type: Equipment['type']) => {
    const icons = {
      pump: Power,
      heater: TrendingUp,
      filter: Settings,
      cleaner: Settings,
      light: Power,
      chemical_feeder: Settings
    };
    return icons[type] || Settings;
  };

  const getEquipmentTypeColor = (type: Equipment['type']) => {
    const colors = {
      pump: 'blue',
      heater: 'orange',
      filter: 'green',
      cleaner: 'purple',
      light: 'yellow',
      chemical_feeder: 'teal'
    };
    return colors[type] || 'gray';
  };

  const toggleEquipment = (equipmentId: string) => {
    // In a real app, this would make an API call
    console.log(`Toggling equipment: ${equipmentId}`);
  };

  const totalPowerConsumption = equipment.reduce((total, eq) => total + eq.power, 0);
  const activeEquipment = equipment.filter(eq => eq.isActive).length;

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 p-6 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 rounded-xl">
            <Settings className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Equipment Control</h3>
            <p className="text-sm text-gray-600">{activeEquipment} of {equipment.length} active</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-lg font-bold text-gray-900">{formatPower(totalPowerConsumption)}</div>
          <div className="text-sm text-gray-600">Total Power</div>
        </div>
      </div>

      {/* Equipment List */}
      <div className="space-y-3">
        {equipment.map((eq) => {
          const Icon = getEquipmentIcon(eq.type);
          const color = getEquipmentTypeColor(eq.type);
          const isExpanded = selectedEquipment === eq.id;

          return (
            <div key={eq.id} className="border border-gray-200 rounded-xl overflow-hidden">
              <div 
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                onClick={() => setSelectedEquipment(isExpanded ? null : eq.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 bg-${color}-100 rounded-lg`}>
                      <Icon className={`w-5 h-5 text-${color}-600`} />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{eq.name}</div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className={`flex items-center space-x-1 ${getStatusColor(eq.status)}`}>
                          {eq.status === 'online' ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            <AlertCircle className="w-3 h-3" />
                          )}
                          <span className="capitalize">{eq.status}</span>
                        </span>
                        <span>{formatRuntime(eq.runtime)} today</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="font-medium text-gray-900">{formatPower(eq.power)}</div>
                      <div className="text-sm text-gray-600">
                        {eq.isActive ? 'Running' : 'Stopped'}
                      </div>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleEquipment(eq.id);
                      }}
                      disabled={eq.status !== 'online'}
                      className={`w-12 h-6 rounded-full transition-all duration-200 ${
                        eq.isActive && eq.status === 'online'
                          ? 'bg-emerald-500' 
                          : 'bg-gray-300'
                      } ${eq.status !== 'online' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                        eq.isActive && eq.status === 'online' ? 'transform translate-x-6' : 'transform translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="px-4 pb-4 bg-gray-50 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {eq.flowRate && (
                      <div>
                        <div className="text-xs text-gray-500">Flow Rate</div>
                        <div className="font-medium text-gray-900">{formatFlowRate(eq.flowRate)}</div>
                      </div>
                    )}
                    {eq.pressure && (
                      <div>
                        <div className="text-xs text-gray-500">Pressure</div>
                        <div className="font-medium text-gray-900">{formatPressure(eq.pressure)}</div>
                      </div>
                    )}
                    {eq.temperature && (
                      <div>
                        <div className="text-xs text-gray-500">Temperature</div>
                        <div className="font-medium text-gray-900">{eq.temperature}°F</div>
                      </div>
                    )}
                    <div>
                      <div className="text-xs text-gray-500">Runtime Today</div>
                      <div className="font-medium text-gray-900">{formatRuntime(eq.runtime)}</div>
                    </div>
                  </div>
                  
                  {eq.nextMaintenance && (
                    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Wrench className="w-4 h-4 text-amber-600" />
                        <div className="text-sm">
                          <span className="font-medium text-amber-800">Next Maintenance: </span>
                          <span className="text-amber-700">
                            {eq.nextMaintenance.toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex space-x-2 mt-4">
                    <button className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors duration-200 text-sm font-medium">
                      Schedule
                    </button>
                    <button className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm font-medium">
                      Settings
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 flex space-x-3">
        <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium">
          Start All
        </button>
        <button className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm font-medium">
          Emergency Stop
        </button>
      </div>
    </div>
  );
};

export default EquipmentPanel;