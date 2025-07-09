// CAN Bus and OBD-II Types
export interface CANMessage {
  id: string;
  timestamp: number;
  data: string;
  dlc: number;
  isExtended: boolean;
  direction: 'rx' | 'tx';
  protocol?: string;
}

export interface OBDParameter {
  pid: string;
  name: string;
  value: number;
  unit: string;
  min?: number;
  max?: number;
  timestamp: number;
}

export interface DiagnosticTroubleCode {
  code: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'pending' | 'permanent' | 'cleared';
  timestamp: number;
}

export interface VehicleInfo {
  vin: string;
  make: string;
  model: string;
  year: number;
  engineSize: string;
  fuelType: string;
  protocols: string[];
}

export interface SystemStatus {
  canBusStatus: 'connected' | 'disconnected' | 'error';
  wifiClients: number;
  batteryVoltage: number;
  temperature: number;
  uptime: number;
  messagesPerSecond: number;
}

export interface DataLog {
  id: string;
  name: string;
  timestamp: number;
  duration: number;
  parameters: string[];
  size: number;
  format: 'csv' | 'json' | 'binary';
}

export interface ProtocolConfig {
  name: string;
  baudRate: number;
  canId: string;
  responseId: string;
  enabled: boolean;
}