import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, TrendingUp, TrendingDown } from "lucide-react";

interface VibrationDataPoint {
  timestamp: string;
  vibration: number;
  temperature: number;
  frequency: number;
}

interface VibrationChartProps {
  data: VibrationDataPoint[];
  equipmentName: string;
  timeRange: string;
  status: 'operational' | 'warning' | 'critical' | 'maintenance';
}

export function VibrationChart({ data, equipmentName, timeRange, status }: VibrationChartProps) {
  const chartData = useMemo(() => {
    return data.map(point => ({
      ...point,
      time: new Date(point.timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }));
  }, [data]);

  const currentVibration = data[data.length - 1]?.vibration || 0;
  const previousVibration = data[data.length - 2]?.vibration || 0;
  const trend = currentVibration - previousVibration;
  const trendPercentage = previousVibration > 0 ? ((trend / previousVibration) * 100) : 0;

  const getThresholdColor = (value: number) => {
    if (value < 2) return 'hsl(var(--status-operational))';
    if (value < 5) return 'hsl(var(--status-warning))';
    return 'hsl(var(--status-critical))';
  };

  const strokeColor = getThresholdColor(currentVibration);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length > 0) {
      const vibrationData = payload.find((item: any) => item.dataKey === 'vibration');
      const temperatureData = payload.find((item: any) => item.dataKey === 'temperature');
      const frequencyData = payload.find((item: any) => item.dataKey === 'frequency');

      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-foreground mb-2">{`Time: ${label}`}</p>
          <div className="space-y-1">
            {vibrationData && (
              <p className="text-sm">
                <span className="text-industrial-blue">Vibration:</span>{' '}
                <span className="font-medium">{vibrationData.value?.toFixed(2) || 0} mm/s</span>
              </p>
            )}
            {temperatureData && (
              <p className="text-sm">
                <span className="text-industrial-orange">Temperature:</span>{' '}
                <span className="font-medium">{temperatureData.value || 0}°C</span>
              </p>
            )}
            {frequencyData && (
              <p className="text-sm">
                <span className="text-industrial-purple">Frequency:</span>{' '}
                <span className="font-medium">{frequencyData.value || 0} Hz</span>
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="col-span-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-industrial-blue" />
              Real-time Vibration Analysis - {equipmentName}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Live data from ESP32 accelerometer sensors via CAN bus
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="px-3 py-1">
              {timeRange}
            </Badge>
            <div className="flex items-center gap-2 text-sm">
              {trend >= 0 ? (
                <TrendingUp className="w-4 h-4 text-status-critical" />
              ) : (
                <TrendingDown className="w-4 h-4 text-status-operational" />
              )}
              <span className={trend >= 0 ? 'text-status-critical' : 'text-status-operational'}>
                {trendPercentage >= 0 ? '+' : ''}{trendPercentage.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          {/* Current readings */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">
                {currentVibration.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">mm/s RMS</div>
              <div className="text-xs text-industrial-blue">Vibration</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">
                {data[data.length - 1]?.temperature || 0}
              </div>
              <div className="text-sm text-muted-foreground">°Celsius</div>
              <div className="text-xs text-industrial-orange">Temperature</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">
                {data[data.length - 1]?.frequency || 0}
              </div>
              <div className="text-sm text-muted-foreground">Hz</div>
              <div className="text-xs text-industrial-purple">Frequency</div>
            </div>
          </div>

          {/* Vibration chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="vibrationGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={strokeColor} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={strokeColor} stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="hsl(var(--border))" 
                  opacity={0.3}
                />
                <XAxis 
                  dataKey="time" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 'dataMax + 1']}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="vibration"
                  stroke={strokeColor}
                  strokeWidth={2}
                  fill="url(#vibrationGradient)"
                  dot={{ fill: strokeColor, strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 5, stroke: strokeColor, strokeWidth: 2 }}
                />
                
                {/* Threshold lines */}
                <Line
                  type="monotone"
                  dataKey={() => 2}
                  stroke="hsl(var(--status-operational))"
                  strokeDasharray="5 5"
                  strokeWidth={1}
                  dot={false}
                  activeDot={false}
                />
                <Line
                  type="monotone"
                  dataKey={() => 5}
                  stroke="hsl(var(--status-warning))"
                  strokeDasharray="5 5"
                  strokeWidth={1}
                  dot={false}
                  activeDot={false}
                />
                <Line
                  type="monotone"
                  dataKey={() => 8}
                  stroke="hsl(var(--status-critical))"
                  strokeDasharray="5 5"
                  strokeWidth={1}
                  dot={false}
                  activeDot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Threshold legend */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-status-operational"></div>
              <span className="text-muted-foreground">Normal (&lt; 2 mm/s)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-status-warning"></div>
              <span className="text-muted-foreground">Warning (2-5 mm/s)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-status-critical"></div>
              <span className="text-muted-foreground">Critical (&gt; 5 mm/s)</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}