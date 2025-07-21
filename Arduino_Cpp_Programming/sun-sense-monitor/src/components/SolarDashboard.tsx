import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Sun, 
  Zap, 
  TrendingUp, 
  AlertTriangle, 
  Cloud, 
  Thermometer,
  Wind,
  Droplets,
  Battery,
  Eye,
  Activity,
  Calendar,
  BarChart3,
  LineChart,
  Monitor,
  Settings,
  Download,
  RefreshCw,
  Maximize2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, Cell } from 'recharts';

interface SensorData {
  id: number;
  power: number;
  voltage: number;
  current: number;
  temperature: number;
  status: 'optimal' | 'warning' | 'critical' | 'offline';
  efficiency: number;
  historicalData: Array<{
    time: string;
    power: number;
    temperature: number;
    efficiency: number;
    voltage: number;
  }>;
  alerts: Array<{
    id: string;
    type: 'degradation' | 'shading' | 'temperature' | 'electrical';
    severity: 'low' | 'medium' | 'high';
    message: string;
    timestamp: string;
  }>;
}

interface AnalyticsData {
  powerTrend: Array<{ time: string; total: number; peak: number; average: number }>;
  efficiencyMatrix: Array<{ hour: string; efficiency: number; output: number }>;
  sensorComparison: Array<{ id: number; current: number; last24h: number; difference: number }>;
  weatherImpact: Array<{ time: string; weather: string; output: number; temperature: number }>;
}

interface SystemData {
  totalPower: number;
  dailyEnergy: number;
  systemEfficiency: number;
  ambientTemp: number;
  weather: string;
  humidity: number;
  windSpeed: number;
  lastUpdate: string;
  sensors: SensorData[];
  analytics: AnalyticsData;
  predictions: {
    nextHourOutput: number;
    dailyTarget: number;
    weeklyTrend: 'increasing' | 'stable' | 'decreasing';
    maintenanceAlerts: number;
  };
}

export function SolarDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedSensor, setSelectedSensor] = useState<number | null>(null);
  
  const [systemData, setSystemData] = useState<SystemData>(() => {
    // Generate historical data for each sensor
    const generateHistoricalData = () => {
      return Array.from({ length: 24 }, (_, i) => ({
        time: `${i.toString().padStart(2, '0')}:00`,
        power: +(Math.random() * 0.3 + 0.1).toFixed(2),
        temperature: +(Math.random() * 8 + 22).toFixed(1),
        efficiency: +(Math.random() * 8 + 92).toFixed(1),
        voltage: +(Math.random() * 5 + 35).toFixed(1),
      }));
    };

    // Generate alerts for some sensors
    const generateAlerts = (sensorId: number) => {
      const alertTypes = ['degradation', 'shading', 'temperature', 'electrical'] as const;
      const alerts = [];
      
      if (Math.random() > 0.8) {
        alerts.push({
          id: `alert-${sensorId}-${Date.now()}`,
          type: alertTypes[Math.floor(Math.random() * alertTypes.length)],
          severity: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low' as const,
          message: `Performance anomaly detected on sensor ${sensorId}`,
          timestamp: new Date().toISOString(),
        });
      }
      
      return alerts;
    };

    // Initialize 50 sensors with comprehensive data
    const sensors: SensorData[] = Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      power: +(Math.random() * 0.3 + 0.1).toFixed(2),
      voltage: +(Math.random() * 5 + 35).toFixed(1),
      current: +(Math.random() * 2 + 4).toFixed(1),
      temperature: +(Math.random() * 8 + 22).toFixed(1),
      status: Math.random() > 0.9 ? (Math.random() > 0.5 ? 'warning' : 'critical') : 'optimal',
      efficiency: +(Math.random() * 8 + 92).toFixed(1),
      historicalData: generateHistoricalData(),
      alerts: generateAlerts(i + 1),
    }));

    const totalPower = sensors.reduce((sum, sensor) => sum + sensor.power, 0);
    
    // Generate analytics data
    const analytics: AnalyticsData = {
      powerTrend: Array.from({ length: 12 }, (_, i) => ({
        time: `${i + 6}:00`,
        total: +(Math.random() * 5 + 10).toFixed(1),
        peak: +(Math.random() * 2 + 15).toFixed(1),
        average: +(Math.random() * 3 + 12).toFixed(1),
      })),
      efficiencyMatrix: Array.from({ length: 24 }, (_, i) => ({
        hour: `${i.toString().padStart(2, '0')}:00`,
        efficiency: +(Math.random() * 10 + 85).toFixed(1),
        output: +(Math.random() * 8 + 5).toFixed(1),
      })),
      sensorComparison: sensors.slice(0, 20).map(sensor => ({
        id: sensor.id,
        current: sensor.power,
        last24h: +(Math.random() * 0.3 + 0.1).toFixed(2),
        difference: +(Math.random() * 0.1 - 0.05).toFixed(2),
      })),
      weatherImpact: Array.from({ length: 7 }, (_, i) => ({
        time: `Day ${i + 1}`,
        weather: ['sunny', 'cloudy', 'overcast'][Math.floor(Math.random() * 3)],
        output: +(Math.random() * 50 + 100).toFixed(1),
        temperature: +(Math.random() * 10 + 20).toFixed(1),
      })),
    };
    
    return {
      totalPower: +totalPower.toFixed(1),
      dailyEnergy: +(totalPower * 8).toFixed(1),
      systemEfficiency: +(sensors.reduce((sum, s) => sum + s.efficiency, 0) / sensors.length).toFixed(1),
      ambientTemp: 24,
      weather: 'sunny',
      humidity: 62,
      windSpeed: 8.5,
      lastUpdate: new Date().toLocaleTimeString(),
      sensors,
      analytics,
      predictions: {
        nextHourOutput: +(totalPower * 1.1).toFixed(1),
        dailyTarget: +(totalPower * 10).toFixed(1),
        weeklyTrend: 'increasing',
        maintenanceAlerts: sensors.filter(s => s.alerts.length > 0).length,
      },
    };
  });

  // Simulate real-time data updates with matrix tracking
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemData(prev => {
        const updatedSensors = prev.sensors.map((sensor, index) => {
          if (index % 5 === 0) { // Update every 5th sensor for more real-time feel
            const newPower = +(Math.random() * 0.3 + 0.1).toFixed(2);
            const newTemp = +(Math.random() * 8 + 22).toFixed(1);
            const newEfficiency = +(Math.random() * 8 + 92).toFixed(1);
            
            // Update historical data with new readings
            const newHistoricalEntry = {
              time: new Date().toLocaleTimeString(),
              power: newPower,
              temperature: newTemp,
              efficiency: newEfficiency,
              voltage: +(Math.random() * 5 + 35).toFixed(1),
            };
            
            return {
              ...sensor,
              power: newPower,
              temperature: newTemp,
              efficiency: newEfficiency,
              historicalData: [...sensor.historicalData.slice(-23), newHistoricalEntry],
            };
          }
          return sensor;
        });
        
        const totalPower = updatedSensors.reduce((sum, sensor) => sum + sensor.power, 0);
        
        return {
          ...prev,
          totalPower: +totalPower.toFixed(1),
          dailyEnergy: +(prev.dailyEnergy + Math.random() * 0.1).toFixed(1),
          systemEfficiency: +(updatedSensors.reduce((sum, s) => sum + s.efficiency, 0) / updatedSensors.length).toFixed(1),
          ambientTemp: +(Math.random() * 4 + 22).toFixed(1),
          lastUpdate: new Date().toLocaleTimeString(),
          sensors: updatedSensors,
          predictions: {
            ...prev.predictions,
            nextHourOutput: +(totalPower * (1 + Math.random() * 0.2)).toFixed(1),
          },
        };
      });
    }, 3000); // More frequent updates for better real-time experience

    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'optimal':
        return <Badge className="bg-success text-success-foreground">Optimal</Badge>;
      case 'warning':
        return <Badge className="bg-warning text-warning-foreground">Warning</Badge>;
      case 'critical':
        return <Badge className="bg-destructive text-destructive-foreground">Critical</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getWeatherIcon = (weather: string) => {
    switch (weather) {
      case 'sunny':
        return <Sun className="h-5 w-5 text-solar-yellow" />;
      case 'cloudy':
        return <Cloud className="h-5 w-5 text-muted-foreground" />;
      default:
        return <Sun className="h-5 w-5 text-solar-yellow" />;
    }
  };

  // Sensor matrix charts component
  const SensorMatrixChart = ({ sensorData }: { sensorData: SensorData }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm">Sensor {sensorData.id}</h4>
        <Badge variant={sensorData.status === 'optimal' ? 'default' : 'destructive'}>
          {sensorData.efficiency}%
        </Badge>
      </div>
      <ResponsiveContainer width="100%" height={60}>
        <AreaChart data={sensorData.historicalData.slice(-12)}>
          <Area 
            type="monotone" 
            dataKey="power" 
            stroke="hsl(var(--primary))" 
            fill="hsl(var(--primary))" 
            fillOpacity={0.3}
            strokeWidth={1}
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{sensorData.power}kW</span>
        <span>{sensorData.temperature}°C</span>
      </div>
    </div>
  );

  // Advanced analytics calculations
  const analytics = useMemo(() => {
    const totalAlerts = systemData.sensors.reduce((sum, s) => sum + s.alerts.length, 0);
    const avgEfficiency = systemData.sensors.reduce((sum, s) => sum + s.efficiency, 0) / systemData.sensors.length;
    const topPerformers = systemData.sensors
      .filter(s => s.status === 'optimal')
      .sort((a, b) => b.efficiency - a.efficiency)
      .slice(0, 10);
    
    return { totalAlerts, avgEfficiency, topPerformers };
  }, [systemData.sensors]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Advanced Header with Controls */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-solar bg-clip-text text-transparent">
              Solar Performance Monitor
            </h1>
            <p className="text-muted-foreground mt-2">
              Advanced real-time monitoring with predictive analytics
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Button
              variant="outline"
              onClick={() => navigate('/configuration')}
              className="flex items-center space-x-2"
            >
              <Settings className="h-4 w-4" />
              <span>Configuration</span>
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">50 Sensors • {analytics.totalAlerts} Alerts</p>
              <p className="text-lg font-semibold">{systemData.lastUpdate}</p>
            </div>
          </div>
        </div>

        {/* Enhanced Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="shadow-solar border-l-4 border-l-primary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Power</CardTitle>
              <Zap className="h-4 w-4 text-solar-yellow animate-pulse-glow" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{systemData.totalPower} kW</div>
              <p className="text-xs text-muted-foreground">Predicted: {systemData.predictions.nextHourOutput} kW</p>
            </CardContent>
          </Card>

          <Card className="shadow-solar border-l-4 border-l-success">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Daily Energy</CardTitle>
              <Battery className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{systemData.dailyEnergy} kWh</div>
              <p className="text-xs text-muted-foreground">Target: {systemData.predictions.dailyTarget} kWh</p>
            </CardContent>
          </Card>

          <Card className="shadow-solar border-l-4 border-l-accent">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Efficiency</CardTitle>
              <TrendingUp className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{systemData.systemEfficiency}%</div>
              <Progress value={systemData.systemEfficiency} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="shadow-solar border-l-4 border-l-warning">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{analytics.totalAlerts}</div>
              <p className="text-xs text-muted-foreground">Maintenance: {systemData.predictions.maintenanceAlerts}</p>
            </CardContent>
          </Card>

          <Card className="shadow-solar border-l-4 border-l-solar-green">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Weekly Trend</CardTitle>
              <LineChart className="h-4 w-4 text-solar-green" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-solar-green capitalize">{systemData.predictions.weeklyTrend}</div>
              <p className="text-xs text-muted-foreground">{systemData.sensors.filter(s => s.status === 'optimal').length}/50 optimal</p>
            </CardContent>
          </Card>
        </div>

        {/* Advanced Tabbed Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <Monitor className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="matrix" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Matrix Charts</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <LineChart className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4" />
              <span>Alerts</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Weather Conditions */}
              <Card className="lg:col-span-1 shadow-glow">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    {getWeatherIcon(systemData.weather)}
                    <span>Environmental Data</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Thermometer className="h-4 w-4 text-solar-orange" />
                      <span className="text-sm">Ambient Temp</span>
                    </div>
                    <span className="font-semibold">{systemData.ambientTemp}°C</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Droplets className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Humidity</span>
                    </div>
                    <span className="font-semibold">{systemData.humidity}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Wind className="h-4 w-4 text-slate-500" />
                      <span className="text-sm">Wind Speed</span>
                    </div>
                    <span className="font-semibold">{systemData.windSpeed} m/s</span>
                  </div>
                </CardContent>
              </Card>

              {/* Power Trend Chart */}
              <Card className="lg:col-span-2 shadow-solar">
                <CardHeader>
                  <CardTitle>Power Generation Trend</CardTitle>
                  <CardDescription>Real-time power output over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsLineChart data={systemData.analytics.powerTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                      <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }} 
                      />
                      <Line type="monotone" dataKey="total" stroke="hsl(var(--primary))" strokeWidth={2} />
                      <Line type="monotone" dataKey="peak" stroke="hsl(var(--success))" strokeWidth={2} />
                      <Line type="monotone" dataKey="average" stroke="hsl(var(--accent))" strokeWidth={2} />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="matrix" className="space-y-6">
            <Card className="shadow-solar">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <span>Real-time Sensor Matrix Charts</span>
                </CardTitle>
                <CardDescription>Individual performance charts for all 50 sensors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {systemData.sensors.map((sensor) => (
                    <Card 
                      key={sensor.id} 
                      className={`p-3 cursor-pointer transition-all hover:shadow-md ${
                        selectedSensor === sensor.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedSensor(selectedSensor === sensor.id ? null : sensor.id)}
                    >
                      <SensorMatrixChart sensorData={sensor} />
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-solar">
                <CardHeader>
                  <CardTitle>Efficiency Heat Map</CardTitle>
                  <CardDescription>Hourly efficiency patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={systemData.analytics.efficiencyMatrix}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                      <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip />
                      <Area type="monotone" dataKey="efficiency" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="shadow-solar">
                <CardHeader>
                  <CardTitle>Sensor Performance Comparison</CardTitle>
                  <CardDescription>Current vs. 24h average</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={systemData.analytics.sensorComparison.slice(0, 15)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                      <XAxis dataKey="id" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip />
                      <Bar dataKey="current" fill="hsl(var(--primary))" />
                      <Bar dataKey="last24h" fill="hsl(var(--accent))" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <Card className="shadow-solar">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  <span>Active System Alerts</span>
                </CardTitle>
                <CardDescription>Real-time monitoring alerts and recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {systemData.sensors
                    .filter(sensor => sensor.alerts.length > 0)
                    .map(sensor => 
                      sensor.alerts.map(alert => (
                        <Card key={alert.id} className="p-4 border-l-4 border-l-warning">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <Badge variant={alert.severity === 'high' ? 'destructive' : alert.severity === 'medium' ? 'default' : 'secondary'}>
                                  {alert.severity.toUpperCase()}
                                </Badge>
                                <span className="text-sm font-medium">Sensor {sensor.id}</span>
                              </div>
                              <p className="text-sm text-muted-foreground">{alert.message}</p>
                              <p className="text-xs text-muted-foreground">
                                Type: {alert.type} • {new Date(alert.timestamp).toLocaleString()}
                              </p>
                            </div>
                            <Button variant="outline" size="sm">
                              Resolve
                            </Button>
                          </div>
                        </Card>
                      ))
                    )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="shadow-solar">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-primary" />
                  <span>System Configuration</span>
                </CardTitle>
                <CardDescription>Monitor and adjust system parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Update Frequency</label>
                    <select className="w-full p-2 border rounded">
                      <option value="3000">3 seconds (Current)</option>
                      <option value="5000">5 seconds</option>
                      <option value="10000">10 seconds</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Alert Sensitivity</label>
                    <select className="w-full p-2 border rounded">
                      <option value="high">High</option>
                      <option value="medium">Medium (Current)</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Selected Sensor Detail View */}
        {selectedSensor && (
          <Card className="shadow-solar border-2 border-primary">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Sensor {selectedSensor} - Detailed Analysis</span>
                <Button variant="outline" size="sm" onClick={() => setSelectedSensor(null)}>
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </CardTitle>
              <CardDescription>Comprehensive data and historical trends</CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
                const sensor = systemData.sensors.find(s => s.id === selectedSensor)!;
                return (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-muted/50 rounded">
                          <div className="text-2xl font-bold text-primary">{sensor.power} kW</div>
                          <div className="text-sm text-muted-foreground">Current Power</div>
                        </div>
                        <div className="text-center p-4 bg-muted/50 rounded">
                          <div className="text-2xl font-bold text-success">{sensor.efficiency}%</div>
                          <div className="text-sm text-muted-foreground">Efficiency</div>
                        </div>
                        <div className="text-center p-4 bg-muted/50 rounded">
                          <div className="text-2xl font-bold text-solar-orange">{sensor.temperature}°C</div>
                          <div className="text-sm text-muted-foreground">Temperature</div>
                        </div>
                        <div className="text-center p-4 bg-muted/50 rounded">
                          <div className="text-2xl font-bold text-accent">{sensor.voltage}V</div>
                          <div className="text-sm text-muted-foreground">Voltage</div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-medium mb-3">24-Hour Performance</h4>
                      <ResponsiveContainer width="100%" height={250}>
                        <RechartsLineChart data={sensor.historicalData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                          <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                          <YAxis stroke="hsl(var(--muted-foreground))" />
                          <Tooltip />
                          <Line type="monotone" dataKey="power" stroke="hsl(var(--primary))" strokeWidth={2} />
                          <Line type="monotone" dataKey="efficiency" stroke="hsl(var(--success))" strokeWidth={2} />
                        </RechartsLineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}