import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Plus, 
  Trash2, 
  Edit, 
  Settings, 
  Wifi, 
  Zap, 
  MapPin,
  ArrowLeft,
  Save,
  AlertTriangle
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Sensor {
  id: string;
  name: string;
  type: string;
  location: string;
  canId: string;
  status: 'active' | 'inactive' | 'error';
  lastSeen: string;
  batteryLevel?: number;
}

const mockSensors: Sensor[] = [
  {
    id: "sensor-001",
    name: "Vibration Sensor A1",
    type: "ADXL345",
    location: "Pump A1 Motor",
    canId: "0x101",
    status: "active",
    lastSeen: "2024-07-15 14:30:25",
    batteryLevel: 85
  },
  {
    id: "sensor-002", 
    name: "Temperature Sensor B1",
    type: "DS18B20",
    location: "Motor B2 Housing",
    canId: "0x102",
    status: "active",
    lastSeen: "2024-07-15 14:30:20",
    batteryLevel: 92
  },
  {
    id: "sensor-003",
    name: "Vibration Sensor C1",
    type: "ADXL345",
    location: "Compressor C1",
    canId: "0x103", 
    status: "error",
    lastSeen: "2024-07-15 12:15:10",
    batteryLevel: 15
  }
];

const SystemSettings = () => {
  const navigate = useNavigate();
  const [sensors, setSensors] = useState<Sensor[]>(mockSensors);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newSensor, setNewSensor] = useState({
    name: "",
    type: "ADXL345",
    location: "",
    canId: ""
  });

  const handleAddSensor = () => {
    if (!newSensor.name || !newSensor.location || !newSensor.canId) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const sensor: Sensor = {
      id: `sensor-${Date.now()}`,
      name: newSensor.name,
      type: newSensor.type,
      location: newSensor.location,
      canId: newSensor.canId,
      status: "inactive",
      lastSeen: "Never",
      batteryLevel: 100
    };

    setSensors(prev => [...prev, sensor]);
    setNewSensor({ name: "", type: "ADXL345", location: "", canId: "" });
    setIsAddingNew(false);
    
    toast({
      title: "Sensor Added",
      description: `${sensor.name} has been added to the system`
    });
  };

  const handleDeleteSensor = (sensorId: string) => {
    setSensors(prev => prev.filter(s => s.id !== sensorId));
    toast({
      title: "Sensor Removed",
      description: "Sensor has been removed from the system"
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'status-operational';
      case 'inactive': return 'status-warning';
      case 'error': return 'status-critical';
      default: return 'status-warning';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Wifi className="w-4 h-4" />;
      case 'inactive': return <AlertTriangle className="w-4 h-4" />;
      case 'error': return <AlertTriangle className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Settings className="w-5 h-5 text-primary-foreground" />
                </div>
                System Settings
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage ESP32 sensors and CAN bus configuration
              </p>
            </div>
          </div>
        </div>

        {/* CAN Bus Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-industrial-blue" />
              CAN Bus Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="canSpeed">Bus Speed</Label>
                <Input id="canSpeed" defaultValue="250 kbps" />
              </div>
              <div>
                <Label htmlFor="canMode">Mode</Label>
                <select className="w-full px-3 py-2 text-sm border border-input bg-background rounded-md">
                  <option>Normal</option>
                  <option>Listen Only</option>
                  <option>Loopback</option>
                </select>
              </div>
              <div>
                <Label htmlFor="retryAttempts">Retry Attempts</Label>
                <Input id="retryAttempts" type="number" defaultValue="3" />
              </div>
            </div>
            <Button variant="industrial" size="sm">
              <Save className="w-4 h-4 mr-2" />
              Save CAN Configuration
            </Button>
          </CardContent>
        </Card>

        {/* Sensor Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-industrial-orange" />
                Sensor Management ({sensors.length} sensors)
              </CardTitle>
              <Button 
                variant="industrial" 
                size="sm"
                onClick={() => setIsAddingNew(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Sensor
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Add New Sensor Form */}
            {isAddingNew && (
              <Card className="mb-6 bg-muted/30">
                <CardHeader>
                  <CardTitle className="text-lg">Add New Sensor</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="sensorName">Sensor Name *</Label>
                      <Input
                        id="sensorName"
                        placeholder="e.g., Vibration Sensor D1"
                        value={newSensor.name}
                        onChange={(e) => setNewSensor(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="sensorType">Sensor Type</Label>
                      <select 
                        className="w-full px-3 py-2 text-sm border border-input bg-background rounded-md"
                        value={newSensor.type}
                        onChange={(e) => setNewSensor(prev => ({ ...prev, type: e.target.value }))}
                      >
                        <option value="ADXL345">ADXL345 (Accelerometer)</option>
                        <option value="DS18B20">DS18B20 (Temperature)</option>
                        <option value="MPU6050">MPU6050 (6-axis IMU)</option>
                        <option value="ADXL355">ADXL355 (Low Noise Accelerometer)</option>
                        <option value="Custom">Custom Sensor</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="sensorLocation">Location *</Label>
                      <Input
                        id="sensorLocation"
                        placeholder="e.g., Motor housing, Bearing mount"
                        value={newSensor.location}
                        onChange={(e) => setNewSensor(prev => ({ ...prev, location: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="canId">CAN ID *</Label>
                      <Input
                        id="canId"
                        placeholder="e.g., 0x104"
                        value={newSensor.canId}
                        onChange={(e) => setNewSensor(prev => ({ ...prev, canId: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={handleAddSensor} variant="industrial">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Sensor
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsAddingNew(false);
                        setNewSensor({ name: "", type: "ADXL345", location: "", canId: "" });
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Existing Sensors */}
            <div className="space-y-4">
              {sensors.map((sensor) => (
                <Card key={sensor.id} className="bg-card/50 backdrop-blur">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center gap-1">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getStatusColor(sensor.status)} bg-opacity-10`}>
                            {getStatusIcon(sensor.status)}
                          </div>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getStatusColor(sensor.status)}`}
                          >
                            {sensor.status}
                          </Badge>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground">{sensor.name}</h3>
                            <Badge variant="outline">{sensor.type}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            <MapPin className="w-3 h-3 inline mr-1" />
                            {sensor.location}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>CAN ID: {sensor.canId}</span>
                            <span>Last seen: {sensor.lastSeen}</span>
                            {sensor.batteryLevel && (
                              <span className={sensor.batteryLevel < 20 ? 'text-status-critical' : ''}>
                                Battery: {sensor.batteryLevel}%
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteSensor(sensor.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Information */}
        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium text-foreground">ESP32 Firmware Version</div>
                <div className="text-muted-foreground">v2.1.3</div>
              </div>
              <div>
                <div className="font-medium text-foreground">CAN Controller</div>
                <div className="text-muted-foreground">MCP2515</div>
              </div>
              <div>
                <div className="font-medium text-foreground">Data Collection Rate</div>
                <div className="text-muted-foreground">100 Hz</div>
              </div>
              <div>
                <div className="font-medium text-foreground">Storage Duration</div>
                <div className="text-muted-foreground">30 days</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SystemSettings;
