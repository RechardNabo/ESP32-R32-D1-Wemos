import React, { useState } from 'react';
import { Lightbulb, Palette, Clock, Zap, Sun, Moon, Sparkles } from 'lucide-react';

const LightingControl: React.FC = () => {
  const [isLightsOn, setIsLightsOn] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#3B82F6');
  const [brightness, setBrightness] = useState(75);
  const [selectedScene, setSelectedScene] = useState('normal');

  const colorPresets = [
    { name: 'Ocean Blue', color: '#3B82F6', gradient: 'from-blue-400 to-blue-600' },
    { name: 'Tropical Teal', color: '#14B8A6', gradient: 'from-teal-400 to-teal-600' },
    { name: 'Sunset Orange', color: '#F97316', gradient: 'from-orange-400 to-orange-600' },
    { name: 'Royal Purple', color: '#9333EA', gradient: 'from-purple-400 to-purple-600' },
    { name: 'Emerald Green', color: '#10B981', gradient: 'from-emerald-400 to-emerald-600' },
    { name: 'Warm White', color: '#F3F4F6', gradient: 'from-gray-100 to-gray-300' }
  ];

  const lightingScenes = [
    { id: 'normal', name: 'Normal', icon: Lightbulb, description: 'Standard pool lighting' },
    { id: 'party', name: 'Party', icon: Sparkles, description: 'Dynamic color changing' },
    { id: 'romantic', name: 'Romantic', icon: Moon, description: 'Soft warm lighting' },
    { id: 'safety', name: 'Safety', icon: Sun, description: 'Bright white lighting' }
  ];

  const schedules = [
    { name: 'Sunset', time: '6:30 PM', active: true },
    { name: 'Night Mode', time: '10:00 PM', active: true },
    { name: 'Sunrise', time: '6:00 AM', active: false }
  ];

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 p-6 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-yellow-100 rounded-xl">
            <Lightbulb className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Lighting Control</h3>
            <p className="text-sm text-gray-600">Pool & Landscape</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="text-right text-sm">
            <div className="text-gray-600">Energy</div>
            <div className="font-medium text-gray-900">45W</div>
          </div>
          
          <button
            onClick={() => setIsLightsOn(!isLightsOn)}
            className={`w-12 h-6 rounded-full transition-all duration-200 ${
              isLightsOn ? 'bg-yellow-500' : 'bg-gray-300'
            }`}
          >
            <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
              isLightsOn ? 'transform translate-x-6' : 'transform translate-x-0.5'
            }`} />
          </button>
        </div>
      </div>

      {/* Main Light Preview */}
      <div className="text-center mb-6">
        <div 
          className={`inline-flex items-center justify-center w-24 h-24 rounded-full border-4 border-white shadow-lg mb-4 transition-all duration-300 ${
            isLightsOn 
              ? `bg-gradient-to-br ${colorPresets.find(p => p.color === selectedColor)?.gradient || 'from-blue-400 to-blue-600'}`
              : 'bg-gray-200'
          }`}
          style={{ 
            opacity: isLightsOn ? brightness / 100 : 0.3,
            boxShadow: isLightsOn ? `0 0 30px ${selectedColor}40` : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
        >
          <Lightbulb className={`w-8 h-8 ${isLightsOn ? 'text-white' : 'text-gray-400'}`} />
        </div>
        
        <div className="text-sm text-gray-600">
          {isLightsOn ? `${brightness}% Brightness` : 'Lights Off'}
        </div>
      </div>

      {/* Brightness Slider */}
      {isLightsOn && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">Brightness</span>
            <span className="text-sm text-gray-600">{brightness}%</span>
          </div>
          <input
            type="range"
            min="1"
            max="100"
            value={brightness}
            onChange={(e) => setBrightness(parseInt(e.target.value))}
            className="w-full h-3 bg-gradient-to-r from-gray-200 to-yellow-400 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      )}

      {/* Color Presets */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Color Presets</h4>
        <div className="grid grid-cols-3 gap-2">
          {colorPresets.map((preset, index) => (
            <button
              key={index}
              onClick={() => setSelectedColor(preset.color)}
              className={`p-2 rounded-xl border-2 transition-all duration-200 ${
                selectedColor === preset.color
                  ? 'border-gray-400 shadow-md'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div 
                className={`w-full h-8 rounded-lg bg-gradient-to-r ${preset.gradient} mb-1`}
                style={{ opacity: isLightsOn ? 1 : 0.5 }}
              />
              <div className="text-xs text-gray-600 font-medium">{preset.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Lighting Scenes */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Lighting Scenes</h4>
        <div className="grid grid-cols-2 gap-2">
          {lightingScenes.map((scene) => (
            <button
              key={scene.id}
              onClick={() => setSelectedScene(scene.id)}
              className={`p-3 rounded-xl border transition-all duration-200 text-left ${
                selectedScene === scene.id
                  ? 'bg-blue-50 border-blue-300 text-blue-700'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <scene.icon className="w-5 h-5 mb-1" />
              <div className="text-sm font-medium">{scene.name}</div>
              <div className="text-xs opacity-75">{scene.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Scheduling */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-700">Schedule</h4>
          <Clock className="w-4 h-4 text-gray-400" />
        </div>
        <div className="space-y-2">
          {schedules.map((schedule, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <div>
                <div className="text-sm font-medium text-gray-900">{schedule.name}</div>
                <div className="text-xs text-gray-600">{schedule.time}</div>
              </div>
              <div className={`w-8 h-4 rounded-full transition-colors duration-200 ${
                schedule.active ? 'bg-emerald-500' : 'bg-gray-300'
              }`}>
                <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                  schedule.active ? 'transform translate-x-4' : 'transform translate-x-0.5'
                } mt-0.5`} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium">
          Create Scene
        </button>
        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm font-medium">
          Edit Schedule
        </button>
      </div>
    </div>
  );
};

export default LightingControl;