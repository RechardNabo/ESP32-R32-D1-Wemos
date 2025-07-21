import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, Settings, Wifi, WifiOff, Radio } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Sensor {
  id: string;
  name: string;
  type: string;
  canId: string;
  status: 'online' | 'offline' | 'error';
  lastReading: number;
  unit: string;
  location: string;
}

export function SensorManagement() {
  const { toast } = useToast();
  const [sensors, setSensors] = useState<Sensor[]>([
    {
      id: 'sensor-001',
      name: 'pH Sensor A1',
      type: 'pH',
      canId: '0x101',
      status: 'online',
      lastReading: 7.2,
      unit: 'pH',
      location: 'Primary Treatment'
    },
    {
      id: 'sensor-002',
      name: 'Temperature Probe B2',
      type: 'temperature',
      canId: '0x102',
      status: 'online',
      lastReading: 22.5,
      unit: '°C',
      location: 'Secondary Treatment'
    },
    {
      id: 'sensor-003',
      name: 'Turbidity Meter C3',
      type: 'turbidity',
      canId: '0x103',
      status: 'error',
      lastReading: 4.8,
      unit: 'NTU',
      location: 'Final Discharge'
    }
  ]);

  const [newSensor, setNewSensor] = useState({
    name: '',
    type: 'pH',
    canId: '',
    location: ''
  });

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const addSensor = () => {
    if (!newSensor.name || !newSensor.canId || !newSensor.location) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const sensor: Sensor = {
      id: `sensor-${Date.now()}`,
      name: newSensor.name,
      type: newSensor.type,
      canId: newSensor.canId,
      status: 'offline',
      lastReading: 0,
      unit: getSensorUnit(newSensor.type),
      location: newSensor.location
    };

    setSensors(prev => [...prev, sensor]);
    setNewSensor({ name: '', type: 'pH', canId: '', location: '' });
    setIsAddDialogOpen(false);

    toast({
      title: "Sensor Added",
      description: `${sensor.name} has been added to the system`,
    });
  };

  const removeSensor = (sensorId: string) => {
    const sensor = sensors.find(s => s.id === sensorId);
    setSensors(prev => prev.filter(s => s.id !== sensorId));
    
    toast({
      title: "Sensor Removed",
      description: `${sensor?.name} has been removed from the system`,
    });
  };

  const getSensorUnit = (type: string) => {
    switch (type) {
      case 'pH': return 'pH';
      case 'temperature': return '°C';
      case 'turbidity': return 'NTU';
      case 'dissolved_oxygen': return 'mg/L';
      case 'conductivity': return 'μS/cm';
      case 'chlorine': return 'mg/L';
      default: return '';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <Wifi className="h-4 w-4 text-success" />;
      case 'offline':
        return <WifiOff className="h-4 w-4 text-muted-foreground" />;
      case 'error':
        return <Radio className="h-4 w-4 text-critical" />;
      default:
        return <WifiOff className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <Card className="animate-slide-up">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-water-blue" />
            Sensor Management (ESP32 CAN Bus)
          </CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-water-blue hover:bg-water-blue/90">
                <Plus className="h-4 w-4 mr-1" />
                Add Sensor
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Sensor</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="sensor-name">Sensor Name</Label>
                  <Input
                    id="sensor-name"
                    value={newSensor.name}
                    onChange={(e) => setNewSensor(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., pH Sensor A1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="sensor-type">Sensor Type</Label>
                  <Select value={newSensor.type} onValueChange={(value) => setNewSensor(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pH">pH Sensor</SelectItem>
                      <SelectItem value="temperature">Temperature Probe</SelectItem>
                      <SelectItem value="turbidity">Turbidity Meter</SelectItem>
                      <SelectItem value="dissolved_oxygen">Dissolved Oxygen</SelectItem>
                      <SelectItem value="conductivity">Conductivity Probe</SelectItem>
                      <SelectItem value="chlorine">Chlorine Analyzer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="can-id">CAN Bus ID</Label>
                  <Input
                    id="can-id"
                    value={newSensor.canId}
                    onChange={(e) => setNewSensor(prev => ({ ...prev, canId: e.target.value }))}
                    placeholder="e.g., 0x104"
                  />
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={newSensor.location}
                    onChange={(e) => setNewSensor(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g., Primary Treatment"
                  />
                </div>

                <Button onClick={addSensor} className="w-full bg-water-blue hover:bg-water-blue/90">
                  Add Sensor
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sensors.map((sensor) => (
            <div key={sensor.id} className="flex items-center justify-between p-3 border border-border rounded-lg bg-card/50">
              <div className="flex items-center gap-3">
                {getStatusIcon(sensor.status)}
                <div>
                  <div className="font-medium text-sm">{sensor.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {sensor.location} • CAN ID: {sensor.canId}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {sensor.lastReading.toFixed(1)} {sensor.unit}
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${
                      sensor.status === 'online' ? 'bg-success/20 text-success border-success/30' :
                      sensor.status === 'error' ? 'bg-critical/20 text-critical border-critical/30' :
                      'bg-muted/20 text-muted-foreground border-muted/30'
                    }`}
                  >
                    {sensor.status}
                  </Badge>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeSensor(sensor.id)}
                  className="h-8 w-8 p-0 hover:bg-critical/10 hover:border-critical/30"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}