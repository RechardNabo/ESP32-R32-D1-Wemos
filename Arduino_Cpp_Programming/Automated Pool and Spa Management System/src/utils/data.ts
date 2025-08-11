import { WaterQuality, Equipment, PoolZone, Alert, UsageData, MaintenanceTask } from '../types';

export const mockWaterQuality: WaterQuality = {
  ph: 7.4,
  chlorine: 2.1,
  alkalinity: 85,
  calciumHardness: 180,
  cyanuricAcid: 45,
  temperature: 82,
  lastUpdated: new Date(),
  status: 'optimal'
};

export const mockEquipment: Equipment[] = [
  {
    id: 'pump-main',
    name: 'Main Circulation Pump',
    type: 'pump',
    status: 'online',
    isActive: true,
    power: 1200,
    flowRate: 45,
    pressure: 18,
    runtime: 6.5,
    lastMaintenance: new Date('2024-01-01'),
    nextMaintenance: new Date('2024-03-01')
  },
  {
    id: 'heater-pool',
    name: 'Pool Heater',
    type: 'heater',
    status: 'online',
    isActive: false,
    power: 0,
    temperature: 82,
    runtime: 2.3,
    lastMaintenance: new Date('2023-12-15'),
    nextMaintenance: new Date('2024-02-15')
  },
  {
    id: 'cleaner-robotic',
    name: 'Robotic Pool Cleaner',
    type: 'cleaner',
    status: 'online',
    isActive: true,
    power: 180,
    runtime: 3.0,
    lastMaintenance: new Date('2024-01-10'),
    nextMaintenance: new Date('2024-02-10')
  },
  {
    id: 'lights-led',
    name: 'LED Pool Lights',
    type: 'light',
    status: 'online',
    isActive: false,
    power: 0,
    runtime: 0,
    lastMaintenance: new Date('2023-11-01'),
    nextMaintenance: new Date('2024-05-01')
  }
];

export const mockPoolZones: PoolZone[] = [
  {
    id: 'pool',
    name: 'Main Pool',
    currentTemp: 82,
    targetTemp: 84,
    waterQuality: mockWaterQuality,
    isHeating: true,
    equipment: mockEquipment
  },
  {
    id: 'spa',
    name: 'Hot Tub',
    currentTemp: 102,
    targetTemp: 104,
    waterQuality: { ...mockWaterQuality, temperature: 102, ph: 7.6, chlorine: 3.2 },
    isHeating: true,
    equipment: []
  }
];

export const mockAlerts: Alert[] = [
  {
    id: '1',
    type: 'warning',
    title: 'pH Level Rising',
    message: 'Pool pH is trending upward. Consider adding pH decreaser.',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    isRead: false,
    priority: 'medium'
  },
  {
    id: '2',
    type: 'maintenance',
    title: 'Filter Cleaning Due',
    message: 'Pool filter pressure is elevated. Schedule cleaning.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    isRead: false,
    priority: 'high'
  },
  {
    id: '3',
    type: 'info',
    title: 'Energy Savings Achieved',
    message: 'Smart scheduling saved 15% energy this week.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    isRead: true,
    priority: 'low'
  }
];

export const mockUsageData: UsageData[] = [
  { date: '2024-01-15', hours: 8, bathers: 6, chemicals: 0.2, energy: 28.5 },
  { date: '2024-01-16', hours: 6, bathers: 4, chemicals: 0.1, energy: 22.3 },
  { date: '2024-01-17', hours: 10, bathers: 8, chemicals: 0.3, energy: 34.7 },
  { date: '2024-01-18', hours: 7, bathers: 3, chemicals: 0.15, energy: 25.8 },
  { date: '2024-01-19', hours: 9, bathers: 7, chemicals: 0.25, energy: 31.2 },
  { date: '2024-01-20', hours: 12, bathers: 10, chemicals: 0.4, energy: 41.6 },
  { date: '2024-01-21', hours: 5, bathers: 2, chemicals: 0.1, energy: 18.9 }
];

export const mockMaintenanceTasks: MaintenanceTask[] = [
  {
    id: '1',
    title: 'Clean Skimmer Baskets',
    type: 'routine',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
    equipment: 'Skimmer System',
    estimatedDuration: 15,
    priority: 'medium',
    completed: false
  },
  {
    id: '2',
    title: 'Replace Filter Cartridges',
    type: 'preventive',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    equipment: 'Main Filter',
    estimatedDuration: 45,
    priority: 'high',
    completed: false
  },
  {
    id: '3',
    title: 'Test GFCI Outlets',
    type: 'routine',
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
    equipment: 'Electrical System',
    estimatedDuration: 30,
    priority: 'high',
    completed: false
  }
];

export const formatTemperature = (temp: number): string => `${temp}°F`;
export const formatPressure = (pressure: number): string => `${pressure} PSI`;
export const formatFlowRate = (rate: number): string => `${rate} GPM`;
export const formatPower = (power: number): string => `${power}W`;
export const formatRuntime = (hours: number): string => `${hours.toFixed(1)}h`;

export const getStatusColor = (status: 'optimal' | 'warning' | 'critical' | 'online' | 'offline' | 'maintenance'): string => {
  const colors = {
    optimal: 'text-emerald-600',
    online: 'text-emerald-600',
    warning: 'text-amber-600',
    critical: 'text-red-600',
    offline: 'text-red-600',
    maintenance: 'text-amber-600'
  };
  return colors[status] || 'text-gray-600';
};

export const getStatusBgColor = (status: 'optimal' | 'warning' | 'critical' | 'online' | 'offline' | 'maintenance'): string => {
  const colors = {
    optimal: 'bg-emerald-100 border-emerald-200',
    online: 'bg-emerald-100 border-emerald-200',
    warning: 'bg-amber-100 border-amber-200',
    critical: 'bg-red-100 border-red-200',
    offline: 'bg-red-100 border-red-200',
    maintenance: 'bg-amber-100 border-amber-200'
  };
  return colors[status] || 'bg-gray-100 border-gray-200';
};