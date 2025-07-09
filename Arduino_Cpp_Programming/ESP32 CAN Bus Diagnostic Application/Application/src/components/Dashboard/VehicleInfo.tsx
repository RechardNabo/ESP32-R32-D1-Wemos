import React from 'react';
import { Car, Calendar, Fuel, Wrench } from 'lucide-react';
import { VehicleInfo as VehicleInfoType } from '../../types/can';

interface VehicleInfoProps {
  vehicleInfo: VehicleInfoType | null;
  isDarkMode?: boolean;
}

export const VehicleInfo: React.FC<VehicleInfoProps> = ({ vehicleInfo, isDarkMode = true }) => {
  if (!vehicleInfo) {
    return (
      <div className={`rounded-lg p-6 animate-pulse ${
        isDarkMode ? 'bg-gray-800' : 'bg-white shadow-lg'
      }`}>
        <div className={`h-6 rounded mb-4 ${
          isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
        }`}></div>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`h-4 rounded ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
            }`}></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg p-6 backdrop-blur-sm ${
      isDarkMode 
        ? 'bg-gray-800 bg-opacity-90' 
        : 'bg-white bg-opacity-90 shadow-lg'
    }`}>
      <h3 className={`text-xl font-semibold mb-4 ${
        isDarkMode ? 'text-white' : 'text-gray-900'
      }`}>Vehicle Information</h3>
      
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <Car className="text-blue-400" size={20} />
          <div>
            <p className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Make & Model</p>
            <p className={`font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>{vehicleInfo.make} {vehicleInfo.model}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Calendar className="text-green-400" size={20} />
          <div>
            <p className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Year</p>
            <p className={`font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>{vehicleInfo.year}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Wrench className="text-orange-400" size={20} />
          <div>
            <p className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Engine</p>
            <p className={`font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>{vehicleInfo.engineSize}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Fuel className="text-yellow-400" size={20} />
          <div>
            <p className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>Fuel Type</p>
            <p className={`font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>{vehicleInfo.fuelType}</p>
          </div>
        </div>

        <div className={`mt-4 p-3 rounded-lg ${
          isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
        }`}>
          <p className={`text-sm mb-2 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>VIN</p>
          <p className={`font-mono text-xs break-all ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>{vehicleInfo.vin}</p>
        </div>

        <div className={`mt-4 p-3 rounded-lg ${
          isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
        }`}>
          <p className={`text-sm mb-2 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>Supported Protocols</p>
          <div className="flex flex-wrap gap-2">
            {vehicleInfo.protocols.map((protocol, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full"
              >
                {protocol}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};