import React from 'react';
import { Circle } from 'lucide-react';

interface StatusIndicatorProps {
  status: 'online' | 'offline' | 'connecting' | 'error';
  label: string;
}

export default function StatusIndicator({ status, label }: StatusIndicatorProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'online': return 'text-green-500';
      case 'offline': return 'text-gray-400';
      case 'connecting': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };

  const getStatusAnimation = () => {
    switch (status) {
      case 'connecting': return 'animate-pulse';
      default: return '';
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Circle className={`h-3 w-3 fill-current ${getStatusColor()} ${getStatusAnimation()}`} />
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </div>
  );
}