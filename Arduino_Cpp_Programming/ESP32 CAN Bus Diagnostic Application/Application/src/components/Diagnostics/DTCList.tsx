import React from 'react';
import { AlertTriangle, CheckCircle, Clock, X } from 'lucide-react';
import { DiagnosticTroubleCode } from '../../types/can';

interface DTCListProps {
  dtcs: DiagnosticTroubleCode[];
  onClearDTC: (code: string) => void;
}

export const DTCList: React.FC<DTCListProps> = ({ dtcs, onClearDTC }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <AlertTriangle className="text-red-400" size={16} />;
      case 'pending': return <Clock className="text-yellow-400" size={16} />;
      case 'cleared': return <CheckCircle className="text-green-400" size={16} />;
      default: return <AlertTriangle className="text-gray-400" size={16} />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-orange-600';
      case 'medium': return 'bg-yellow-600';
      case 'low': return 'bg-blue-600';
      default: return 'bg-gray-600';
    }
  };

  if (dtcs.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="text-center py-8">
          <CheckCircle className="mx-auto text-green-400 mb-4" size={48} />
          <p className="text-xl font-semibold text-white">No Diagnostic Trouble Codes</p>
          <p className="text-gray-400 mt-2">Vehicle systems are operating normally</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-white">Diagnostic Trouble Codes</h3>
        <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm">
          {dtcs.filter(dtc => dtc.status === 'active').length} Active
        </span>
      </div>
      
      <div className="space-y-4">
        {dtcs.map((dtc, index) => (
          <div key={index} className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                {getStatusIcon(dtc.status)}
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-white font-semibold">{dtc.code}</span>
                    <span className={`px-2 py-1 rounded-full text-xs text-white ${getSeverityColor(dtc.severity)}`}>
                      {dtc.severity}
                    </span>
                  </div>
                  <p className="text-gray-300 mt-1">{dtc.description}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(dtc.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
              
              {dtc.status === 'active' && (
                <button
                  onClick={() => onClearDTC(dtc.code)}
                  className="ml-4 p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                  title="Clear DTC"
                >
                  <X size={16} className="text-white" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};