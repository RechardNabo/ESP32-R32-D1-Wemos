import React, { useState, useEffect } from 'react';
import { CANMessage } from '../../types/can';
import { Pause, Play, Trash2, Download } from 'lucide-react';

interface CANTrafficProps {
  messages: CANMessage[];
  onStartCapture: () => void;
  onStopCapture: () => void;
  onClearMessages: () => void;
}

export const CANTraffic: React.FC<CANTrafficProps> = ({ 
  messages, 
  onStartCapture, 
  onStopCapture, 
  onClearMessages 
}) => {
  const [isCapturing, setIsCapturing] = useState(true);
  const [filter, setFilter] = useState('');
  const [displayFormat, setDisplayFormat] = useState<'hex' | 'ascii'>('hex');
  const [autoScroll, setAutoScroll] = useState(true);

  const filteredMessages = messages.filter(msg => 
    !filter || msg.id.toLowerCase().includes(filter.toLowerCase()) || 
    msg.data.toLowerCase().includes(filter.toLowerCase())
  );

  const handleToggleCapture = () => {
    if (isCapturing) {
      onStopCapture();
    } else {
      onStartCapture();
    }
    setIsCapturing(!isCapturing);
  };

  const formatData = (data: string, format: 'hex' | 'ascii') => {
    if (format === 'hex') {
      return data.match(/.{1,2}/g)?.join(' ') || data;
    }
    
    // Convert hex to ASCII
    const ascii = data.match(/.{1,2}/g)
      ?.map(hex => {
        const char = String.fromCharCode(parseInt(hex, 16));
        return char.match(/[a-zA-Z0-9 ]/) ? char : '.';
      })
      .join('') || data;
    
    return ascii;
  };

  const exportMessages = () => {
    const csv = [
      'Timestamp,ID,DLC,Data,Direction,Protocol',
      ...filteredMessages.map(msg => 
        `${new Date(msg.timestamp).toISOString()},${msg.id},${msg.dlc},${msg.data},${msg.direction},${msg.protocol || ''}`
      )
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `can_traffic_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (autoScroll) {
      const container = document.getElementById('message-container');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }
  }, [messages, autoScroll]);

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-4">CAN Bus Traffic Monitor</h2>
        
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex gap-4">
            <button
              onClick={handleToggleCapture}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors ${
                isCapturing 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isCapturing ? <Pause size={20} /> : <Play size={20} />}
              <span>{isCapturing ? 'Stop' : 'Start'} Capture</span>
            </button>
            
            <button
              onClick={onClearMessages}
              className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              <Trash2 size={20} />
              <span>Clear</span>
            </button>
            
            <button
              onClick={exportMessages}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              <Download size={20} />
              <span>Export</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Filter messages..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-gray-700 text-white px-3 py-2 rounded-lg"
            />
            
            <select
              value={displayFormat}
              onChange={(e) => setDisplayFormat(e.target.value as 'hex' | 'ascii')}
              className="bg-gray-700 text-white px-3 py-2 rounded-lg"
            >
              <option value="hex">Hex</option>
              <option value="ascii">ASCII</option>
            </select>
            
            <label className="flex items-center space-x-2 text-white">
              <input
                type="checkbox"
                checked={autoScroll}
                onChange={(e) => setAutoScroll(e.target.checked)}
                className="rounded"
              />
              <span>Auto-scroll</span>
            </label>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-400">
              {filteredMessages.length} messages ({messages.length} total)
            </span>
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span>Rate: {Math.round(messages.length / Math.max(1, (Date.now() - messages[0]?.timestamp || Date.now()) / 1000))} msg/s</span>
            </div>
          </div>
          
          <div 
            id="message-container"
            className="h-96 overflow-y-auto font-mono text-sm"
          >
            <div className="grid grid-cols-[80px_80px_40px_1fr_40px_80px] gap-2 mb-2 text-gray-400 font-semibold border-b border-gray-700 pb-2">
              <span>Time</span>
              <span>ID</span>
              <span>DLC</span>
              <span>Data</span>
              <span>Dir</span>
              <span>Protocol</span>
            </div>
            
            {filteredMessages.map((message, index) => (
              <div 
                key={index} 
                className="grid grid-cols-[80px_80px_40px_1fr_40px_80px] gap-2 py-1 hover:bg-gray-800 transition-colors border-b border-gray-800"
              >
                <span className="text-gray-400">
                  {new Date(message.timestamp).toLocaleTimeString().split(' ')[0]}
                </span>
                <span className="text-blue-400">{message.id}</span>
                <span className="text-gray-300">{message.dlc}</span>
                <span className="text-green-400 font-mono">
                  {formatData(message.data, displayFormat)}
                </span>
                <span className={`text-center ${
                  message.direction === 'rx' ? 'text-yellow-400' : 'text-purple-400'
                }`}>
                  {message.direction.toUpperCase()}
                </span>
                <span className="text-gray-400">{message.protocol || '-'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};