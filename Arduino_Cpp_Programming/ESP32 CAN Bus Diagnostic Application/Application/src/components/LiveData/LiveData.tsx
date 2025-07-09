import React, { useState } from 'react';
import { ParameterChart } from './ParameterChart';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { OBDParameter } from '../../types/can';

interface LiveDataProps {
  obdData: OBDParameter[];
  onStartLogging: () => void;
  onStopLogging: () => void;
  onClearData: () => void;
}

export const LiveData: React.FC<LiveDataProps> = ({ 
  obdData, 
  onStartLogging, 
  onStopLogging, 
  onClearData 
}) => {
  const [isLogging, setIsLogging] = useState(false);
  const [selectedPids, setSelectedPids] = useState<string[]>(['01', '0C', '05']);
  const [timeRange, setTimeRange] = useState(60); // 60 seconds

  // Get unique PIDs from obdData
  const availablePids = Array.from(new Set(obdData.map(p => p.pid)));

  const handleToggleLogging = () => {
    if (isLogging) {
      onStopLogging();
    } else {
      onStartLogging();
    }
    setIsLogging(!isLogging);
  };

  const handlePidToggle = (pid: string) => {
    setSelectedPids(prev => 
      prev.includes(pid) 
        ? prev.filter(p => p !== pid)
        : [...prev, pid]
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Live Data Monitoring</h2>
        
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex gap-4">
            <button
              onClick={handleToggleLogging}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors ${
                isLogging 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isLogging ? <Pause size={20} /> : <Play size={20} />}
              <span>{isLogging ? 'Stop' : 'Start'} Logging</span>
            </button>
            
            <button
              onClick={onClearData}
              className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              <RotateCcw size={20} />
              <span>Clear Data</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            <label className="text-white">Time Range:</label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(Number(e.target.value))}
              className="bg-gray-700 text-white px-3 py-2 rounded-lg"
            >
              <option value={30}>30 seconds</option>
              <option value={60}>1 minute</option>
              <option value={300}>5 minutes</option>
              <option value={600}>10 minutes</option>
              <option value={1800}>30 minutes</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {availablePids.map(pid => {
            const param = obdData.find(p => p.pid === pid);
            return (
              <label key={pid} className="flex items-center space-x-2 text-white">
                <input
                  type="checkbox"
                  checked={selectedPids.includes(pid)}
                  onChange={() => handlePidToggle(pid)}
                  className="rounded"
                />
                <span className="text-sm">
                  {param?.name || `PID ${pid}`}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <ParameterChart 
        parameters={obdData}
        selectedPids={selectedPids}
        timeRange={timeRange}
      />
      
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Current Values</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {obdData
            .filter(p => selectedPids.includes(p.pid))
            .map((param, index) => (
              <div key={index} className="bg-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm text-gray-300">{param.name}</span>
                  <span className="text-xs text-gray-400">{param.pid}</span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {param.value.toFixed(1)}
                  <span className="text-sm text-gray-400 ml-1">{param.unit}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(param.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};