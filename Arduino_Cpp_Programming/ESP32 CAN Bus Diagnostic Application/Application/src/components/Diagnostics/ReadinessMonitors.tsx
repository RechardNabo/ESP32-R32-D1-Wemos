import React from 'react';
import { CheckCircle, AlertCircle, Clock, X } from 'lucide-react';

interface ReadinessMonitor {
  name: string;
  status: 'ready' | 'not_ready' | 'not_applicable' | 'incomplete';
  description: string;
}

interface ReadinessMonitorsProps {
  monitors: ReadinessMonitor[];
}

export const ReadinessMonitors: React.FC<ReadinessMonitorsProps> = ({ monitors }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready': return <CheckCircle className="text-green-400" size={16} />;
      case 'not_ready': return <AlertCircle className="text-red-400" size={16} />;
      case 'incomplete': return <Clock className="text-yellow-400" size={16} />;
      case 'not_applicable': return <X className="text-gray-400" size={16} />;
      default: return <AlertCircle className="text-gray-400" size={16} />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ready': return 'Ready';
      case 'not_ready': return 'Not Ready';
      case 'incomplete': return 'Incomplete';
      case 'not_applicable': return 'N/A';
      default: return 'Unknown';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'text-green-400';
      case 'not_ready': return 'text-red-400';
      case 'incomplete': return 'text-yellow-400';
      case 'not_applicable': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const readyCount = monitors.filter(m => m.status === 'ready').length;
  const totalApplicable = monitors.filter(m => m.status !== 'not_applicable').length;

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-white">Readiness Monitors</h3>
        <div className="flex items-center space-x-4">
          <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm">
            {readyCount}/{totalApplicable} Ready
          </span>
          <div className="w-16 h-16 relative">
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#374151"
                strokeWidth="2"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#10B981"
                strokeWidth="2"
                strokeDasharray={`${(readyCount / totalApplicable) * 100}, 100`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs text-white font-bold">
                {Math.round((readyCount / totalApplicable) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {monitors.map((monitor, index) => (
          <div key={index} className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                {getStatusIcon(monitor.status)}
                <span className="font-semibold text-white">{monitor.name}</span>
              </div>
              <span className={`text-sm font-medium ${getStatusColor(monitor.status)}`}>
                {getStatusText(monitor.status)}
              </span>
            </div>
            <p className="text-sm text-gray-300">{monitor.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};