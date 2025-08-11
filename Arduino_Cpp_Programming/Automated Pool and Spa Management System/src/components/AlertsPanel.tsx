import React, { useState } from 'react';
import { AlertTriangle, Info, Wrench, X, CheckCircle, Clock } from 'lucide-react';
import { Alert } from '../types';

interface AlertsPanelProps {
  alerts: Alert[];
}

const AlertsPanel: React.FC<AlertsPanelProps> = ({ alerts }) => {
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);
  
  const visibleAlerts = alerts.filter(alert => !dismissedAlerts.includes(alert.id));
  const priorityAlerts = visibleAlerts.filter(alert => ['high', 'critical'].includes(alert.priority));

  const dismissAlert = (alertId: string) => {
    setDismissedAlerts([...dismissedAlerts, alertId]);
  };

  const getAlertIcon = (type: Alert['type']) => {
    const icons = {
      info: Info,
      warning: AlertTriangle,
      error: AlertTriangle,
      maintenance: Wrench
    };
    return icons[type];
  };

  const getAlertColor = (type: Alert['type']) => {
    const colors = {
      info: 'blue',
      warning: 'amber',
      error: 'red',
      maintenance: 'purple'
    };
    return colors[type];
  };

  const getPriorityColor = (priority: Alert['priority']) => {
    const colors = {
      low: 'gray',
      medium: 'blue',
      high: 'amber',
      critical: 'red'
    };
    return colors[priority];
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  if (visibleAlerts.length === 0) {
    return (
      <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 p-6">
        <div className="flex items-center justify-center space-x-3 text-emerald-600">
          <CheckCircle className="w-6 h-6" />
          <span className="font-medium">All systems operating normally</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Critical/High Priority Alerts */}
      {priorityAlerts.length > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-amber-50 border border-red-200 rounded-2xl p-4">
          <div className="flex items-center space-x-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="font-medium text-red-800">
              {priorityAlerts.length} Priority Alert{priorityAlerts.length > 1 ? 's' : ''}
            </span>
          </div>
          <div className="space-y-2">
            {priorityAlerts.slice(0, 2).map((alert) => {
              const Icon = getAlertIcon(alert.type);
              return (
                <div key={alert.id} className="flex items-center justify-between bg-white/70 p-3 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4 text-red-600" />
                    <div>
                      <div className="font-medium text-gray-900">{alert.title}</div>
                      <div className="text-sm text-gray-600">{alert.message}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => dismissAlert(alert.id)}
                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* All Alerts Panel */}
      <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            System Alerts ({visibleAlerts.length})
          </h3>
          {visibleAlerts.length > 3 && (
            <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              View All
            </button>
          )}
        </div>

        <div className="space-y-3">
          {visibleAlerts.slice(0, 3).map((alert) => {
            const Icon = getAlertIcon(alert.type);
            const color = getAlertColor(alert.type);
            const priorityColor = getPriorityColor(alert.priority);

            return (
              <div
                key={alert.id}
                className={`p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${
                  alert.isRead ? 'bg-gray-50 border-gray-200' : `bg-${color}-50 border-${color}-200`
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 bg-${color}-100 rounded-lg`}>
                      <Icon className={`w-4 h-4 text-${color}-600`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-gray-900">{alert.title}</h4>
                        <div className={`px-2 py-0.5 bg-${priorityColor}-100 text-${priorityColor}-700 text-xs font-medium rounded-full uppercase`}>
                          {alert.priority}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{alert.message}</p>
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{formatTimeAgo(alert.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => dismissAlert(alert.id)}
                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200 ml-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {visibleAlerts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="w-8 h-8 mx-auto mb-2" />
            <p>No active alerts</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertsPanel;