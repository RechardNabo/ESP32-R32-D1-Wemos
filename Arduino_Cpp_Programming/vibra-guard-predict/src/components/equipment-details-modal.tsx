import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VibrationChart } from "./vibration-chart";
import { 
  Activity, 
  Thermometer, 
  Zap, 
  Calendar, 
  MapPin, 
  Clock, 
  TrendingUp,
  Download,
  Settings
} from "lucide-react";

interface Equipment {
  id: string;
  name: string;
  location: string;
  status: 'operational' | 'warning' | 'critical' | 'maintenance';
  vibrationLevel: number;
  temperature: number;
  lastMaintenance: string;
  nextMaintenance: string;
}

interface EquipmentDetailsModalProps {
  equipment: Equipment | null;
  isOpen: boolean;
  onClose: () => void;
}

// Generate mock historical data
const generateHistoricalData = (baseVibration: number) => {
  const data = [];
  const now = new Date();
  
  for (let i = 167; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 5 * 60 * 1000);
    data.push({
      timestamp: timestamp.toISOString(),
      vibration: Math.max(0, baseVibration + (Math.random() - 0.5) * 2),
      temperature: 45 + Math.random() * 40,
      frequency: 48 + Math.random() * 4
    });
  }
  
  return data;
};

export function EquipmentDetailsModal({ equipment, isOpen, onClose }: EquipmentDetailsModalProps) {
  const [historicalData, setHistoricalData] = useState<any[]>([]);

  useEffect(() => {
    if (equipment) {
      setHistoricalData(generateHistoricalData(equipment.vibrationLevel));
    }
  }, [equipment]);

  if (!equipment) return null;

  const statusConfig = {
    operational: { color: 'bg-status-operational', label: 'Operational' },
    warning: { color: 'bg-status-warning', label: 'Warning' },
    critical: { color: 'bg-status-critical', label: 'Critical' },
    maintenance: { color: 'bg-status-maintenance', label: 'Maintenance' }
  };

  const currentData = historicalData[historicalData.length - 1];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-industrial-blue" />
            {equipment.name}
            <Badge variant="outline" className={`status-${equipment.status}`}>
              {statusConfig[equipment.status].label}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Equipment Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-industrial-blue" />
                    Equipment Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Location:</span>
                    <span className="text-sm">{equipment.location}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">ID:</span>
                    <span className="text-sm font-mono">{equipment.id}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${statusConfig[equipment.status].color}`} />
                    <span className="text-sm font-medium">Status:</span>
                    <span className="text-sm">{statusConfig[equipment.status].label}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-industrial-orange" />
                    Current Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-industrial-blue" />
                      <span className="text-sm font-medium">Vibration</span>
                    </div>
                    <span className="text-lg font-mono">{equipment.vibrationLevel.toFixed(2)} mm/s</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Thermometer className="w-4 h-4 text-industrial-orange" />
                      <span className="text-sm font-medium">Temperature</span>
                    </div>
                    <span className="text-lg font-mono">{equipment.temperature}°C</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-industrial-purple" />
                      <span className="text-sm font-medium">Frequency</span>
                    </div>
                    <span className="text-lg font-mono">{currentData?.frequency?.toFixed(1) || 0} Hz</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <VibrationChart 
              data={historicalData}
              equipmentName={equipment.name}
              timeRange="Last 14 hours"
              status={equipment.status}
            />
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Data Export</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button variant="outline" className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Export JSON
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Generate Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-industrial-blue" />
                    Maintenance Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Last Maintenance:</span>
                    <span className="text-sm">{equipment.lastMaintenance}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Next Scheduled:</span>
                    <span className="text-sm">{equipment.nextMaintenance}</span>
                  </div>
                  <div className="pt-4">
                    <Button className="w-full">
                      Schedule Maintenance
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Maintenance History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span>Routine Inspection</span>
                      <span className="text-muted-foreground">2024-06-15</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Belt Replacement</span>
                      <span className="text-muted-foreground">2024-05-01</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Bearing Lubrication</span>
                      <span className="text-muted-foreground">2024-04-12</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}