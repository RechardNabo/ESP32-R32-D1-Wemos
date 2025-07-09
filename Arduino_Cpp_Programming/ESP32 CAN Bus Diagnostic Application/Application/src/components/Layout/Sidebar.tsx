import React from 'react';
import { 
  Activity, 
  AlertTriangle, 
  BarChart3, 
  Database, 
  Settings, 
  Menu,
  X,
  Gauge,
  Info
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  isDarkMode: boolean;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Gauge },
  { id: 'diagnostics', label: 'Diagnostics', icon: AlertTriangle },
  { id: 'livedata', label: 'Live Data', icon: Activity },
  { id: 'logger', label: 'Data Logger', icon: Database },
  { id: 'traffic', label: 'CAN Traffic', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'about', label: 'About', icon: Info }
];

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  isOpen, 
  onToggle,
  isDarkMode 
}) => {
  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={onToggle}
        className={`lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md ${
          isOpen 
            ? (isDarkMode ? 'bg-gray-800' : 'bg-white shadow-lg') 
            : (isDarkMode ? 'bg-gray-700' : 'bg-white shadow-lg')
        }`}
      >
        {isOpen ? (
          <X size={24} className={isDarkMode ? 'text-white' : 'text-gray-900'} />
        ) : (
          <Menu size={24} className={isDarkMode ? 'text-white' : 'text-gray-900'} />
        )}
      </button>

      {/* Sidebar */}
      <div className={`fixed lg:relative inset-y-0 left-0 z-40 w-64 transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 transition-transform duration-300 ease-in-out ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      } border-r`}>
        <div className={`flex items-center space-x-3 p-6 border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <span className={`text-xl font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>CAN Tool</span>
        </div>
        
        <nav className="mt-8">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (window.innerWidth < 1024) onToggle();
                }}
                className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
                  activeTab === item.id 
                    ? 'bg-blue-600 text-white'
                    : isDarkMode
                      ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon size={20} className="mr-3" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={onToggle}
        />
      )}
    </>
  );
};