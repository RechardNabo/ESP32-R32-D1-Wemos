export interface WaterQuality {
  ph: number;
  chlorine: number;
  alkalinity: number;
  calciumHardness: number;
  cyanuricAcid: number;
  temperature: number;
  lastUpdated: Date;
  status: 'optimal' | 'warning' | 'critical';
}

export interface Equipment {
  id: string;
  name: string;
  type: 'pump' | 'heater' | 'filter' | 'cleaner' | 'light' | 'chemical_feeder';
  status: 'online' | 'offline' | 'maintenance';
  isActive: boolean;
  power: number; // watts
  temperature?: number;
  pressure?: number;
  flowRate?: number;
  runtime: number; // hours today
  lastMaintenance?: Date;
  nextMaintenance?: Date;
}

export interface PoolZone {
  id: 'pool' | 'spa';
  name: string;
  currentTemp: number;
  targetTemp: number;
  waterQuality: WaterQuality;
  isHeating: boolean;
  equipment: Equipment[];
}

export interface Alert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'maintenance';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface UsageData {
  date: string;
  hours: number;
  bathers: number;
  chemicals: number;
  energy: number;
}

export interface MaintenanceTask {
  id: string;
  title: string;
  type: 'routine' | 'preventive' | 'repair';
  dueDate: Date;
  equipment: string;
  estimatedDuration: number;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
}