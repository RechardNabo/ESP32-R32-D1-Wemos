import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { MatrixChart } from "./MatrixChart";
import { SensorManagement } from "./SensorManagement";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, Database, Cpu, Network } from "lucide-react";

interface AdvancedDashboardProps {
  currentReadings: Record<string, any>;
}

export function AdvancedDashboard({ currentReadings }: AdvancedDashboardProps) {
  // Generate matrix data for all parameters
  const getMatrixData = () => {
    const primaryReading = Object.values(currentReadings)[0];
    if (!primaryReading) return [];

    return [
      { name: 'pH', value: primaryReading.ph, status: getParameterStatus(primaryReading.ph, 6.0, 9.0, [6.5, 8.5]) },
      { name: 'Temp', value: primaryReading.temperature, status: getParameterStatus(primaryReading.temperature, 15, 35, [18, 25]) },
      { name: 'Turbidity', value: primaryReading.turbidity, status: getParameterStatus(primaryReading.turbidity, 0, 10, [0, 4]) },
      { name: 'DO', value: primaryReading.dissolvedOxygen, status: getParameterStatus(primaryReading.dissolvedOxygen, 5.0, 12.0, [7.0, 10.0]) },
      { name: 'Conductivity', value: primaryReading.conductivity / 10, status: getParameterStatus(primaryReading.conductivity, 200, 800, [300, 600]) },
      { name: 'Chlorine', value: primaryReading.chlorine, status: getParameterStatus(primaryReading.chlorine, 0.2, 2.0, [0.5, 1.5]) }
    ];
  };

  const getParameterStatus = (value: number, min: number, max: number, optimal: [number, number]): 'normal' | 'warning' | 'critical' => {
    if (value < optimal[0] || value > optimal[1]) {
      if (value < min || value > max) return 'critical';
      return 'warning';
    }
    return 'normal';
  };

  // Generate historical trend data
  const generateTrendData = () => {
    const data = [];
    for (let i = 23; i >= 0; i--) {
      const hour = new Date();
      hour.setHours(hour.getHours() - i);
      data.push({
        time: hour.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        ph: 7.2 + Math.sin(i * 0.5) * 0.3 + (Math.random() - 0.5) * 0.2,
        temperature: 22 + Math.cos(i * 0.3) * 2 + (Math.random() - 0.5) * 1,
        turbidity: 2.1 + Math.sin(i * 0.8) * 1.5 + Math.random() * 0.5
      });
    }
    return data;
  };

  const trendData = generateTrendData();

  const systemStats = [
    { label: 'ESP32 Nodes', value: '4', status: 'online', icon: Cpu },
    { label: 'CAN Bus Load', value: '67%', status: 'normal', icon: Network },
    { label: 'Data Points/min', value: '240', status: 'active', icon: Database },
    { label: 'System Uptime', value: '99.8%', status: 'excellent', icon: TrendingUp }
  ];

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sensors">Sensors</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MatrixChart
              title="Parameter Status Matrix"
              data={getMatrixData()}
            />
            
            <Card className="animate-slide-up">
              <CardHeader>
                <CardTitle>Real-time Trend Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={trendData.slice(-12)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="time" 
                      fontSize={12}
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      fontSize={12}
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--card-foreground))'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="ph" 
                      stroke="hsl(var(--water-blue))" 
                      fill="hsl(var(--water-blue))"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sensors">
          <SensorManagement />
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card className="animate-slide-up">
            <CardHeader>
              <CardTitle>24-Hour Parameter Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="time" 
                    fontSize={12}
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    fontSize={12}
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--card-foreground))'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="ph" 
                    stroke="hsl(var(--water-blue))" 
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="temperature" 
                    stroke="hsl(var(--warning))" 
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="turbidity" 
                    stroke="hsl(var(--water-green))" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {systemStats.map((stat, index) => (
              <Card key={index} className="animate-slide-up">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <stat.icon className="h-8 w-8 text-water-blue" />
                  </div>
                  <Badge 
                    variant="secondary" 
                    className="mt-2 bg-success/20 text-success border-success/30"
                  >
                    {stat.status}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="animate-slide-up">
            <CardHeader>
              <CardTitle>ESP32 Network Topology</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 border border-border rounded-lg bg-card/50">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-3 h-3 bg-success rounded-full animate-pulse-gentle"></div>
                      <span className="font-medium">ESP32 Master Node</span>
                    </div>
                    <p className="text-sm text-muted-foreground">CAN Controller • Primary Treatment</p>
                  </div>
                  
                  <div className="pl-6 space-y-2">
                    <div className="p-3 border border-border rounded-lg bg-card/30">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-success rounded-full"></div>
                        <span className="text-sm">pH Sensor (0x101)</span>
                      </div>
                    </div>
                    <div className="p-3 border border-border rounded-lg bg-card/30">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-success rounded-full"></div>
                        <span className="text-sm">Temperature (0x102)</span>
                      </div>
                    </div>
                    <div className="p-3 border border-border rounded-lg bg-card/30">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-critical rounded-full"></div>
                        <span className="text-sm">Turbidity (0x103)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-border rounded-lg bg-gradient-to-br from-water-blue/10 to-water-green/10">
                  <h4 className="font-medium mb-3">CAN Bus Statistics</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Bus Speed:</span>
                      <span className="font-medium">500 kbps</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active Nodes:</span>
                      <span className="font-medium">4/8</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Error Rate:</span>
                      <span className="font-medium text-success">0.01%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Sync:</span>
                      <span className="font-medium">2.3s ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}