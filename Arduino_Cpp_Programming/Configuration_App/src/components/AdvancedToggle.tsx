import React from 'react';

interface AdvancedToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  label: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function AdvancedToggle({ 
  enabled, 
  onChange, 
  label, 
  description,
  size = 'md' 
}: AdvancedToggleProps) {
  const sizeClasses = {
    sm: 'h-4 w-8',
    md: 'h-5 w-10',
    lg: 'h-6 w-12'
  };

  const thumbSizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onChange(!enabled)}
        className={`${sizeClasses[size]} relative inline-flex items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          enabled ? 'bg-blue-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`${thumbSizeClasses[size]} inline-block transform rounded-full bg-white shadow-lg transition-transform ${
            enabled ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );
}