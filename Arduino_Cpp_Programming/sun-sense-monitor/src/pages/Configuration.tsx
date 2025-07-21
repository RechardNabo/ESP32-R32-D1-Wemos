import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Plus, Trash2, Settings, Save, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface SensorConfig {
  id: number;
  name: string;
  canId: string;
  position: string;
  enabled: boolean;
  calibrationOffset: number;
  alertThreshold: number;
}

const Configuration = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [sensors, setSensors] = useState<SensorConfig[]>(
    Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      name: `Solar Panel ${i + 1}`,
      canId: `0x${(0x100 + i).toString(16).toUpperCase()}`,
      position: `Panel ${Math.floor(i / 10) + 1}-${(i % 10) + 1}`,
      enabled: true,
      calibrationOffset: 0,
      alertThreshold: 85
    }))
  );

  const [canBusSettings, setCanBusSettings] = useState({
    baudRate: '250000',
    protocol: 'CAN 2.0B',
    terminationResistor: true,
    autoRetransmit: true,
    listenOnlyMode: false
  });

  const [systemSettings, setSystemSettings] = useState({
    updateInterval: 3000,
    dataRetentionDays: 30,
    alertSensitivity: 'medium',
    autoCalibration: true
  });

  const updateSensor = (id: number, updates: Partial<SensorConfig>) => {
    setSensors(sensors.map(sensor => 
      sensor.id === id ? { ...sensor, ...updates } : sensor
    ));
  };

  const handleSaveConfiguration = () => {
    // Here you would typically save to ESP32/backend
    toast({
      title: "Configuration Saved",
      description: "Sensor configuration has been saved successfully.",
    });
  };

  const handleTestCanBus = () => {
    toast({
      title: "CANbus Test Started",
      description: "Testing connection to all enabled sensors...",
    });
    // Simulate test delay
    setTimeout(() => {
      toast({
        title: "CANbus Test Complete",
        description: "45 of 50 sensors responding correctly.",
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">System Configuration</h1>
              <p className="text-muted-foreground">Manage your 50 solar panel sensors and CANbus settings</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button onClick={handleTestCanBus} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Test CANbus
            </Button>
            <Button onClick={handleSaveConfiguration}>
              <Save className="h-4 w-4 mr-2" />
              Save Configuration
            </Button>
          </div>
        </div>

        <Tabs defaultValue="sensors" className="space-y-6">
          <TabsList className="grid grid-cols-3 w-[400px]">
            <TabsTrigger value="sensors">Sensor Configuration</TabsTrigger>
            <TabsTrigger value="canbus">CANbus Settings</TabsTrigger>
            <TabsTrigger value="system">System Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="sensors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Solar Panel Sensors (50 Units)</CardTitle>
                <CardDescription>
                  Configure individual sensor settings and CANbus IDs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto">
                  {sensors.map((sensor) => (
                    <Card key={sensor.id} className="border border-border/50">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm">{sensor.name}</CardTitle>
                          <Badge variant={sensor.enabled ? "default" : "secondary"}>
                            {sensor.enabled ? "Enabled" : "Disabled"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs">CAN ID</Label>
                            <Input
                              value={sensor.canId}
                              onChange={(e) => updateSensor(sensor.id, { canId: e.target.value })}
                              className="h-8 text-xs"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Position</Label>
                            <Input
                              value={sensor.position}
                              onChange={(e) => updateSensor(sensor.id, { position: e.target.value })}
                              className="h-8 text-xs"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs">Offset</Label>
                            <Input
                              type="number"
                              value={sensor.calibrationOffset}
                              onChange={(e) => updateSensor(sensor.id, { calibrationOffset: Number(e.target.value) })}
                              className="h-8 text-xs"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Alert %</Label>
                            <Input
                              type="number"
                              value={sensor.alertThreshold}
                              onChange={(e) => updateSensor(sensor.id, { alertThreshold: Number(e.target.value) })}
                              className="h-8 text-xs"
                            />
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={sensor.enabled}
                            onCheckedChange={(checked) => updateSensor(sensor.id, { enabled: checked })}
                          />
                          <Label className="text-xs">Enabled</Label>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="canbus" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>CANbus Configuration</CardTitle>
                <CardDescription>
                  Configure CANbus communication settings for ESP32
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label>Baud Rate</Label>
                      <Select value={canBusSettings.baudRate} onValueChange={(value) => 
                        setCanBusSettings({...canBusSettings, baudRate: value})
                      }>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="125000">125 kbps</SelectItem>
                          <SelectItem value="250000">250 kbps</SelectItem>
                          <SelectItem value="500000">500 kbps</SelectItem>
                          <SelectItem value="1000000">1 Mbps</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Protocol</Label>
                      <Select value={canBusSettings.protocol} onValueChange={(value) => 
                        setCanBusSettings({...canBusSettings, protocol: value})
                      }>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CAN 2.0A">CAN 2.0A (11-bit)</SelectItem>
                          <SelectItem value="CAN 2.0B">CAN 2.0B (29-bit)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={canBusSettings.terminationResistor}
                        onCheckedChange={(checked) => 
                          setCanBusSettings({...canBusSettings, terminationResistor: checked})
                        }
                      />
                      <Label>120Ω Termination Resistor</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={canBusSettings.autoRetransmit}
                        onCheckedChange={(checked) => 
                          setCanBusSettings({...canBusSettings, autoRetransmit: checked})
                        }
                      />
                      <Label>Auto-Retransmit</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={canBusSettings.listenOnlyMode}
                        onCheckedChange={(checked) => 
                          setCanBusSettings({...canBusSettings, listenOnlyMode: checked})
                        }
                      />
                      <Label>Listen-Only Mode</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>
                  General system configuration and performance settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label>Update Interval (ms)</Label>
                      <Input
                        type="number"
                        value={systemSettings.updateInterval}
                        onChange={(e) => 
                          setSystemSettings({...systemSettings, updateInterval: Number(e.target.value)})
                        }
                      />
                    </div>
                    <div>
                      <Label>Data Retention (days)</Label>
                      <Input
                        type="number"
                        value={systemSettings.dataRetentionDays}
                        onChange={(e) => 
                          setSystemSettings({...systemSettings, dataRetentionDays: Number(e.target.value)})
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label>Alert Sensitivity</Label>
                      <Select value={systemSettings.alertSensitivity} onValueChange={(value) => 
                        setSystemSettings({...systemSettings, alertSensitivity: value})
                      }>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={systemSettings.autoCalibration}
                        onCheckedChange={(checked) => 
                          setSystemSettings({...systemSettings, autoCalibration: checked})
                        }
                      />
                      <Label>Auto-Calibration</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Configuration;