import React, { ReactNode } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ConfigSectionProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
}

export default function ConfigSection({ title, icon, children, isExpanded, onToggle }: ConfigSectionProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-md">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all duration-200"
      >
        <div className="flex items-center space-x-3">
          <div className="text-blue-600">
            {icon}
          </div>
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-500" />
        )}
      </button>
      
      <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}