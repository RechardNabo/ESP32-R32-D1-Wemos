import React, { useState } from 'react';
import { DTCList } from './DTCList';
import { ReadinessMonitors } from './ReadinessMonitors';
import { Search, RefreshCw } from 'lucide-react';
import { DiagnosticTroubleCode } from '../../types/can';

interface DiagnosticsProps {
  onScanDTCs: () => void;
  onClearDTC: (code: string) => void;
}

export const Diagnostics: React.FC<DiagnosticsProps> = ({ 
  onScanDTCs, 
  onClearDTC 
}) => {
  const [isScanning, setIsScanning] = useState(false);
  
  // Mock data - in real implementation this would come from props
  const mockDTCs: DiagnosticTroubleCode[] = [
    {
      code: 'P0420',
      description: 'Catalyst System Efficiency Below Threshold (Bank 1)',
      severity: 'medium',
      status: 'active',
      timestamp: Date.now() - 300000
    },
    {
      code: 'P0171',
      description: 'System Too Lean (Bank 1)',
      severity: 'high',
      status: 'pending',
      timestamp: Date.now() - 600000
    }
  ];

  const mockReadinessMonitors = [
    { name: 'Catalyst', status: 'ready', description: 'Catalytic converter monitor' },
    { name: 'Heated Catalyst', status: 'ready', description: 'Heated catalytic converter monitor' },
    { name: 'Evaporative System', status: 'not_ready', description: 'EVAP system monitor' },
    { name: 'Secondary Air System', status: 'not_applicable', description: 'Secondary air injection monitor' },
    { name: 'A/C System Refrigerant', status: 'ready', description: 'A/C refrigerant monitor' },
    { name: 'Oxygen Sensor', status: 'ready', description: 'Oxygen sensor monitor' },
    { name: 'Oxygen Sensor Heater', status: 'ready', description: 'Oxygen sensor heater monitor' },
    { name: 'EGR System', status: 'incomplete', description: 'EGR system monitor' }
  ];

  const handleScan = async () => {
    setIsScanning(true);
    await onScanDTCs();
    setTimeout(() => setIsScanning(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Vehicle Diagnostics</h2>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleScan}
            disabled={isScanning}
            className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            {isScanning ? (
              <RefreshCw className="animate-spin" size={20} />
            ) : (
              <Search size={20} />
            )}
            <span>{isScanning ? 'Scanning...' : 'Scan for DTCs'}</span>
          </button>
          
          <button
            onClick={() => onClearDTC('all')}
            className="flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            <span>Clear All DTCs</span>
          </button>
        </div>
      </div>

      <DTCList dtcs={mockDTCs} onClearDTC={onClearDTC} />
      
      <ReadinessMonitors monitors={mockReadinessMonitors} />
    </div>
  );
};