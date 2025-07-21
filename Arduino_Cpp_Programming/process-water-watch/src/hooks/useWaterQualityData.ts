import { useState, useEffect } from 'react';

interface WaterQualityReading {
  id: string;
  stationId: string;
  timestamp: string;
  ph: number;
  temperature: number;
  turbidity: number;
  dissolvedOxygen: number;
  conductivity: number;
  chlorine: number;
}

interface Station {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'offline' | 'warning';
  lastUpdate: string;
  alertCount: number;
}

interface Alert {
  id: string;
  station: string;
  parameter: string;
  value: number;
  threshold: number;
  severity: 'warning' | 'critical';
  timestamp: string;
  acknowledged: boolean;
}

export function useWaterQualityData() {
  const [stations, setStations] = useState<Station[]>([]);
  const [currentReadings, setCurrentReadings] = useState<Record<string, WaterQualityReading>>({});
  const [alerts, setAlerts] = useState<Alert[]>([]);

  // Initialize data
  useEffect(() => {
    const initialStations: Station[] = [
      {
        id: 'WQ001',
        name: 'Primary Treatment',
        location: 'Building A - Level 1',
        status: 'online',
        lastUpdate: new Date().toLocaleTimeString(),
        alertCount: 0
      },
      {
        id: 'WQ002',
        name: 'Secondary Treatment',
        location: 'Building B - Level 2',
        status: 'warning',
        lastUpdate: new Date().toLocaleTimeString(),
        alertCount: 1
      },
      {
        id: 'WQ003',
        name: 'Final Discharge',
        location: 'Outflow Point C',
        status: 'online',
        lastUpdate: new Date().toLocaleTimeString(),
        alertCount: 0
      },
      {
        id: 'WQ004',
        name: 'Intake Monitoring',
        location: 'Intake Point D',
        status: 'offline',
        lastUpdate: '2 hours ago',
        alertCount: 2
      }
    ];

    setStations(initialStations);

    // Generate initial readings
    const initialReadings: Record<string, WaterQualityReading> = {};
    initialStations.forEach(station => {
      if (station.status !== 'offline') {
        initialReadings[station.id] = generateReading(station.id);
      }
    });
    setCurrentReadings(initialReadings);

    // Generate initial alerts
    const initialAlerts: Alert[] = [
      {
        id: 'alert-001',
        station: 'Secondary Treatment',
        parameter: 'pH',
        value: 8.9,
        threshold: 8.5,
        severity: 'warning',
        timestamp: new Date().toLocaleTimeString(),
        acknowledged: false
      },
      {
        id: 'alert-002',
        station: 'Intake Monitoring',
        parameter: 'Turbidity',
        value: 15.2,
        threshold: 10.0,
        severity: 'critical',
        timestamp: new Date(Date.now() - 1800000).toLocaleTimeString(), // 30 minutes ago
        acknowledged: false
      }
    ];
    setAlerts(initialAlerts);
  }, []);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentReadings(prev => {
        const updated = { ...prev };
        stations.forEach(station => {
          if (station.status === 'online' || station.status === 'warning') {
            updated[station.id] = generateReading(station.id);
          }
        });
        return updated;
      });

      // Update station last update times
      setStations(prev => prev.map(station => ({
        ...station,
        lastUpdate: station.status !== 'offline' ? new Date().toLocaleTimeString() : station.lastUpdate
      })));
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [stations]);

  const generateReading = (stationId: string): WaterQualityReading => {
    const baseValues = {
      WQ001: { ph: 7.2, temp: 22, turbidity: 2.1, do: 8.5, conductivity: 450, chlorine: 0.8 },
      WQ002: { ph: 8.1, temp: 24, turbidity: 4.2, do: 7.8, conductivity: 520, chlorine: 1.2 },
      WQ003: { ph: 7.8, temp: 21, turbidity: 1.8, do: 9.1, conductivity: 480, chlorine: 0.5 },
      WQ004: { ph: 7.0, temp: 20, turbidity: 8.5, do: 8.8, conductivity: 420, chlorine: 0.0 }
    };

    const base = baseValues[stationId as keyof typeof baseValues] || baseValues.WQ001;
    
    return {
      id: `reading-${stationId}-${Date.now()}`,
      stationId,
      timestamp: new Date().toISOString(),
      ph: base.ph + (Math.random() - 0.5) * 0.4,
      temperature: base.temp + (Math.random() - 0.5) * 2,
      turbidity: Math.max(0, base.turbidity + (Math.random() - 0.5) * 1.5),
      dissolvedOxygen: Math.max(0, base.do + (Math.random() - 0.5) * 1),
      conductivity: Math.max(0, base.conductivity + (Math.random() - 0.5) * 50),
      chlorine: Math.max(0, base.chlorine + (Math.random() - 0.5) * 0.3)
    };
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    
    // Update station alert counts
    setStations(prev => prev.map(station => ({
      ...station,
      alertCount: alerts.filter(alert => 
        alert.station.includes(station.name) && alert.id !== alertId
      ).length
    })));
  };

  return {
    stations,
    currentReadings,
    alerts,
    acknowledgeAlert,
    dismissAlert
  };
}