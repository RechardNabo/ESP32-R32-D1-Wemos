import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { AlertTriangle, CheckCircle, Info, TrendingUp, Activity, Gauge } from "lucide-react";

interface VibrationData {
  timestamp: number;
  x: number; // Horizontal
  y: number; // Vertical  
  z: number; // Axial
}

interface VibrationMetrics {
  rms: number;
  peak: number;
  peakToPeak: number;
  crestFactor: number;
  kurtosis: number;
  skewness: number;
  velocity: number;
  displacement: number;
}

interface ISO10816Zone {
  zone: 'A' | 'B' | 'C' | 'D';
  description: string;
  color: string;
  range: [number, number];
}

export function VibrationMetrics() {
  const [vibrationData, setVibrationData] = useState<VibrationData[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedAxis, setSelectedAxis] = useState<'x' | 'y' | 'z' | 'overall'>('overall');
  const [samplingRate, setSamplingRate] = useState(1000); // Hz
  const [machineType, setMachineType] = useState<'small' | 'medium' | 'large'>('medium');

  // ISO 10816 compliance zones based on machine size
  const iso10816Zones: Record<string, ISO10816Zone[]> = {
    small: [
      { zone: 'A', description: 'Good', color: 'hsl(var(--status-operational))', range: [0, 0.71] },
      { zone: 'B', description: 'Satisfactory', color: 'hsl(var(--status-warning))', range: [0.71, 1.8] },
      { zone: 'C', description: 'Unsatisfactory', color: 'hsl(var(--primary))', range: [1.8, 4.5] },
      { zone: 'D', description: 'Unacceptable', color: 'hsl(var(--status-critical))', range: [4.5, Infinity] }
    ],
    medium: [
      { zone: 'A', description: 'Good', color: 'hsl(var(--status-operational))', range: [0, 1.12] },
      { zone: 'B', description: 'Satisfactory', color: 'hsl(var(--status-warning))', range: [1.12, 2.8] },
      { zone: 'C', description: 'Unsatisfactory', color: 'hsl(var(--primary))', range: [2.8, 7.1] },
      { zone: 'D', description: 'Unacceptable', color: 'hsl(var(--status-critical))', range: [7.1, Infinity] }
    ],
    large: [
      { zone: 'A', description: 'Good', color: 'hsl(var(--status-operational))', range: [0, 1.8] },
      { zone: 'B', description: 'Satisfactory', color: 'hsl(var(--status-warning))', range: [1.8, 4.5] },
      { zone: 'C', description: 'Unsatisfactory', color: 'hsl(var(--primary))', range: [4.5, 11.2] },
      { zone: 'D', description: 'Unacceptable', color: 'hsl(var(--status-critical))', range: [11.2, Infinity] }
    ]
  };

  // Generate synthetic vibration data
  const generateVibrationData = () => {
    const data: VibrationData[] = [];
    const now = Date.now();
    
    for (let i = 0; i < 1000; i++) {
      const t = i / samplingRate;
      const timestamp = now + i;
      
      // Simulate machine vibration with multiple frequency components
      const baseFreq = 50; // Machine running speed
      const x = 
        2 * Math.sin(2 * Math.PI * baseFreq * t) +           // Fundamental
        0.5 * Math.sin(2 * Math.PI * baseFreq * 2 * t) +     // 2nd harmonic
        0.3 * Math.sin(2 * Math.PI * baseFreq * 3 * t) +     // 3rd harmonic
        (Math.random() - 0.5) * 0.5;                         // Noise
      
      const y = 
        1.5 * Math.sin(2 * Math.PI * baseFreq * t + Math.PI / 4) +
        0.4 * Math.sin(2 * Math.PI * baseFreq * 2 * t) +
        (Math.random() - 0.5) * 0.4;
      
      const z = 
        1.0 * Math.sin(2 * Math.PI * baseFreq * t + Math.PI / 2) +
        0.2 * Math.sin(2 * Math.PI * baseFreq * 4 * t) +     // 4th harmonic
        (Math.random() - 0.5) * 0.3;
      
      data.push({ timestamp, x, y, z });
    }
    
    return data;
  };

  // Calculate vibration metrics
  const calculateMetrics = (data: number[]): VibrationMetrics => {
    if (data.length === 0) return {
      rms: 0, peak: 0, peakToPeak: 0, crestFactor: 0,
      kurtosis: 0, skewness: 0, velocity: 0, displacement: 0
    };

    const n = data.length;
    const mean = data.reduce((sum, val) => sum + val, 0) / n;
    
    // RMS calculation
    const rms = Math.sqrt(data.reduce((sum, val) => sum + val * val, 0) / n);
    
    // Peak values
    const peak = Math.max(...data.map(Math.abs));
    const peakToPeak = Math.max(...data) - Math.min(...data);
    
    // Crest factor
    const crestFactor = peak / rms;
    
    // Statistical moments for kurtosis and skewness
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);
    
    const thirdMoment = data.reduce((sum, val) => sum + Math.pow((val - mean) / stdDev, 3), 0) / n;
    const fourthMoment = data.reduce((sum, val) => sum + Math.pow((val - mean) / stdDev, 4), 0) / n;
    
    const skewness = thirdMoment;
    const kurtosis = fourthMoment - 3; // Excess kurtosis
    
    // Velocity (integration of acceleration)
    const velocity = rms * 0.159 / (50 * 2 * Math.PI); // Approximate for 50Hz
    
    // Displacement (double integration)
    const displacement = velocity * 0.159 / (50 * 2 * Math.PI);
    
    return {
      rms,
      peak,
      peakToPeak,
      crestFactor,
      kurtosis,
      skewness,
      velocity: velocity * 1000, // Convert to mm/s
      displacement: displacement * 1000000 // Convert to μm
    };
  };

  // Get data for selected axis
  const getAxisData = (axis: 'x' | 'y' | 'z' | 'overall') => {
    if (axis === 'overall') {
      return vibrationData.map(d => Math.sqrt((d.x * d.x + d.y * d.y + d.z * d.z) / 3));
    }
    return vibrationData.map(d => d[axis]);
  };

  // Calculate metrics for all axes
  const metricsData = useMemo(() => {
    return {
      x: calculateMetrics(vibrationData.map(d => d.x)),
      y: calculateMetrics(vibrationData.map(d => d.y)),
      z: calculateMetrics(vibrationData.map(d => d.z)),
      overall: calculateMetrics(getAxisData('overall'))
    };
  }, [vibrationData]);

  // Get ISO compliance status
  const getComplianceStatus = (rmsValue: number) => {
    const zones = iso10816Zones[machineType];
    for (const zone of zones) {
      if (rmsValue >= zone.range[0] && rmsValue < zone.range[1]) {
        return zone;
      }
    }
    return zones[zones.length - 1]; // Default to worst zone
  };

  // Multi-axis correlation data
  const correlationData = useMemo(() => {
    return vibrationData.slice(0, 200).map((d, i) => ({
      x: d.x,
      y: d.y,
      z: d.z,
      time: i
    }));
  }, [vibrationData]);

  // Dynamic range compression
  const compressSignal = (data: number[], ratio: number = 4) => {
    const threshold = Math.max(...data.map(Math.abs)) * 0.3;
    return data.map(val => {
      const absVal = Math.abs(val);
      if (absVal > threshold) {
        const excess = absVal - threshold;
        const compressed = threshold + excess / ratio;
        return val >= 0 ? compressed : -compressed;
      }
      return val;
    });
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRecording) {
      interval = setInterval(() => {
        setVibrationData(generateVibrationData());
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording, samplingRate]);

  const currentMetrics = metricsData[selectedAxis];
  const complianceStatus = getComplianceStatus(currentMetrics.rms);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Advanced Vibration Metrics</h2>
        <div className="flex gap-2">
          <Button
            onClick={() => setIsRecording(!isRecording)}
            variant={isRecording ? "destructive" : "default"}
          >
            {isRecording ? "Stop Recording" : "Start Recording"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="metrics" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="metrics">RMS & Statistical</TabsTrigger>
          <TabsTrigger value="iso">ISO 10816 Compliance</TabsTrigger>
          <TabsTrigger value="multiaxis">Multi-Axis Analysis</TabsTrigger>
          <TabsTrigger value="compression">Dynamic Range</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Axis Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Axis Selection</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {(['x', 'y', 'z', 'overall'] as const).map((axis) => (
                    <Button
                      key={axis}
                      variant={selectedAxis === axis ? "default" : "outline"}
                      onClick={() => setSelectedAxis(axis)}
                      className="w-full"
                    >
                      {axis === 'overall' ? 'Overall' : `${axis.toUpperCase()}-Axis`}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Primary Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Primary Vibration Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Gauge className="w-4 h-4" />
                      <span className="text-sm font-medium">RMS</span>
                    </div>
                    <div className="text-2xl font-bold">
                      {currentMetrics.rms.toFixed(3)} mm/s
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm font-medium">Peak</span>
                    </div>
                    <div className="text-2xl font-bold">
                      {currentMetrics.peak.toFixed(3)} mm/s
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <span className="text-sm font-medium">Crest Factor</span>
                    <div className="text-xl font-bold">
                      {currentMetrics.crestFactor.toFixed(2)}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <span className="text-sm font-medium">Kurtosis</span>
                    <div className="text-xl font-bold">
                      {currentMetrics.kurtosis.toFixed(2)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Derived Measurements */}
            <Card>
              <CardHeader>
                <CardTitle>Derived Measurements</CardTitle>
                <CardDescription>
                  Velocity and displacement from acceleration data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Velocity (RMS)</span>
                    <span className="text-lg font-bold">
                      {currentMetrics.velocity.toFixed(2)} mm/s
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Displacement (RMS)</span>
                    <span className="text-lg font-bold">
                      {currentMetrics.displacement.toFixed(1)} μm
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Peak-to-Peak</span>
                    <span className="text-lg font-bold">
                      {currentMetrics.peakToPeak.toFixed(3)} mm/s
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Skewness</span>
                    <span className="text-lg font-bold">
                      {currentMetrics.skewness.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Statistical Indicators */}
            <Card>
              <CardHeader>
                <CardTitle>Statistical Health Indicators</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Crest Factor</span>
                      <span>{currentMetrics.crestFactor.toFixed(2)}</span>
                    </div>
                    <Progress 
                      value={Math.min(currentMetrics.crestFactor * 10, 100)} 
                      className="h-2"
                    />
                     <div className="text-xs text-muted-foreground mt-1">
                       Normal: 3-6, High: {">"}6 (possible bearing damage)
                     </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Kurtosis</span>
                      <span>{currentMetrics.kurtosis.toFixed(2)}</span>
                    </div>
                    <Progress 
                      value={Math.min(Math.abs(currentMetrics.kurtosis) * 20, 100)} 
                      className="h-2"
                    />
                     <div className="text-xs text-muted-foreground mt-1">
                       Normal: -0.5 to 0.5, High: {">"}3 (impulse/impact)
                     </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="iso">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>ISO 10816 Compliance Status</CardTitle>
                <CardDescription>
                  Machinery vibration evaluation standards
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: complianceStatus.color }}
                    />
                    <div>
                      <div className="font-medium">Zone {complianceStatus.zone}</div>
                      <div className="text-sm text-muted-foreground">
                        {complianceStatus.description}
                      </div>
                    </div>
                    <Badge 
                      variant="outline"
                      style={{ 
                        borderColor: complianceStatus.color,
                        color: complianceStatus.color 
                      }}
                    >
                      {currentMetrics.rms.toFixed(2)} mm/s
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Machine Classification</div>
                    <div className="flex gap-2">
                      {(['small', 'medium', 'large'] as const).map((type) => (
                        <Button
                          key={type}
                          variant={machineType === type ? "default" : "outline"}
                          size="sm"
                          onClick={() => setMachineType(type)}
                        >
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Compliance Zones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {iso10816Zones[machineType].map((zone) => (
                    <div key={zone.zone} className="flex items-center justify-between p-2 rounded border">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: zone.color }}
                        />
                        <div>
                          <div className="font-medium">Zone {zone.zone}</div>
                          <div className="text-xs text-muted-foreground">
                            {zone.description}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm">
                        {zone.range[1] === Infinity 
                          ? `>${zone.range[0]} mm/s` 
                          : `${zone.range[0]}-${zone.range[1]} mm/s`
                        }
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="multiaxis">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>3D Vibration Correlation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart data={correlationData.slice(0, 100)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="x" label={{ value: 'X-Axis (mm/s)', position: 'insideBottom', offset: -5 }} />
                      <YAxis dataKey="y" label={{ value: 'Y-Axis (mm/s)', angle: -90, position: 'insideLeft' }} />
                      <Tooltip formatter={(value) => [typeof value === 'number' ? value.toFixed(3) : value]} />
                      <Scatter dataKey="z" fill="hsl(var(--primary))" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Multi-Axis RMS Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={[
                      { axis: 'X-Axis', value: metricsData.x.rms * 10 },
                      { axis: 'Y-Axis', value: metricsData.y.rms * 10 },
                      { axis: 'Z-Axis', value: metricsData.z.rms * 10 },
                      { axis: 'Overall', value: metricsData.overall.rms * 10 }
                    ]}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="axis" />
                      <PolarRadiusAxis angle={45} domain={[0, 50]} />
                      <Radar 
                        dataKey="value" 
                        stroke="hsl(var(--primary))" 
                        fill="hsl(var(--primary))" 
                        fillOpacity={0.3} 
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compression">
          <Card>
            <CardHeader>
              <CardTitle>Dynamic Range Compression</CardTitle>
              <CardDescription>
                Signal compression for wide amplitude ranges
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={correlationData.slice(0, 200).map((d, i) => ({
                    time: i,
                    original: d.x,
                    compressed: compressSignal([d.x])[0]
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="original" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={1}
                      dot={false}
                      name="Original"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="compressed" 
                      stroke="hsl(var(--secondary))" 
                      strokeWidth={2}
                      dot={false}
                      name="Compressed"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}