import React from 'react';
import { SystemStatus } from './SystemStatus';
import { VehicleInfo } from './VehicleInfo';
import { LiveParameters } from './LiveParameters';
import { SystemStatus as SystemStatusType, VehicleInfo as VehicleInfoType, OBDParameter } from '../../types/can';

interface DashboardProps {
  systemStatus: SystemStatusType | null;
  vehicleInfo: VehicleInfoType | null;
  obdData: OBDParameter[];
  isDarkMode?: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  systemStatus, 
  vehicleInfo, 
  obdData,
  isDarkMode = true
}) => {
  return (
    <div className="space-y-6">
      <SystemStatus status={systemStatus} isDarkMode={isDarkMode} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <VehicleInfo vehicleInfo={vehicleInfo} isDarkMode={isDarkMode} />
        </div>
        
        <div className="lg:col-span-2">
          <LiveParameters parameters={obdData} isDarkMode={isDarkMode} />
        </div>
      </div>
    </div>
  );
};