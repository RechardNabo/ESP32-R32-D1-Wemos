import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { Play, Pause, Settings, Download } from "lucide-react";

interface FrequencyData {
  frequency: number;
  amplitude: number;
  phase: number;
}

interface HarmonicData {
  order: number;
  frequency: number;
  amplitude: number;
  percentage: number;
}

export function FrequencyAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [fftData, setFftData] = useState<FrequencyData[]>([]);
  const [psdData, setPsdData] = useState<FrequencyData[]>([]);
  const [harmonics, setHarmonics] = useState<HarmonicData[]>([]);
  const [cepstrumData, setCepstrumData] = useState<FrequencyData[]>([]);
  const [fundamentalFreq, setFundamentalFreq] = useState(50); // Hz

  // Generate synthetic FFT data for demonstration
  const generateFFTData = () => {
    const data: FrequencyData[] = [];
    const sampleRate = 1000; // Hz
    const nPoints = 512;
    
    for (let i = 0; i < nPoints / 2; i++) {
      const freq = (i * sampleRate) / nPoints;
      // Simulate machine harmonics with noise
      let amplitude = Math.random() * 0.1; // Base noise
      
      // Add harmonics
      if (Math.abs(freq - fundamentalFreq) < 2) amplitude += 1.0; // Fundamental
      if (Math.abs(freq - fundamentalFreq * 2) < 2) amplitude += 0.5; // 2nd harmonic
      if (Math.abs(freq - fundamentalFreq * 3) < 2) amplitude += 0.3; // 3rd harmonic
      if (Math.abs(freq - fundamentalFreq * 4) < 2) amplitude += 0.2; // 4th harmonic
      
      data.push({
        frequency: freq,
        amplitude: amplitude,
        phase: Math.random() * 360
      });
    }
    return data;
  };

  // Generate Power Spectral Density
  const generatePSDData = (fftData: FrequencyData[]) => {
    return fftData.map(point => ({
      ...point,
      amplitude: Math.pow(point.amplitude, 2) // Convert to power
    }));
  };

  // Extract harmonics
  const extractHarmonics = (fftData: FrequencyData[]) => {
    const harmonics: HarmonicData[] = [];
    const totalPower = fftData.reduce((sum, point) => sum + Math.pow(point.amplitude, 2), 0);
    
    for (let order = 1; order <= 10; order++) {
      const targetFreq = fundamentalFreq * order;
      const harmonic = fftData.find(point => 
        Math.abs(point.frequency - targetFreq) < 2
      );
      
      if (harmonic) {
        const power = Math.pow(harmonic.amplitude, 2);
        harmonics.push({
          order,
          frequency: harmonic.frequency,
          amplitude: harmonic.amplitude,
          percentage: (power / totalPower) * 100
        });
      }
    }
    
    return harmonics.sort((a, b) => b.amplitude - a.amplitude);
  };

  // Generate cepstrum for gear/bearing analysis
  const generateCepstrum = (fftData: FrequencyData[]) => {
    return fftData.slice(0, 100).map(point => ({
      frequency: 1 / point.frequency, // Quefrency (time domain)
      amplitude: Math.log(point.amplitude + 0.001),
      phase: 0
    }));
  };

  const startAnalysis = () => {
    setIsAnalyzing(true);
    
    // Simulate real-time analysis
    const interval = setInterval(() => {
      const newFFTData = generateFFTData();
      const newPSDData = generatePSDData(newFFTData);
      const newHarmonics = extractHarmonics(newFFTData);
      const newCepstrum = generateCepstrum(newFFTData);
      
      setFftData(newFFTData);
      setPsdData(newPSDData);
      setHarmonics(newHarmonics);
      setCepstrumData(newCepstrum);
    }, 1000);

    return () => clearInterval(interval);
  };

  const stopAnalysis = () => {
    setIsAnalyzing(false);
  };

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    
    if (isAnalyzing) {
      cleanup = startAnalysis();
    }
    
    return cleanup;
  }, [isAnalyzing, fundamentalFreq]);

  const exportData = (dataType: string) => {
    let data;
    let filename;
    
    switch (dataType) {
      case 'fft':
        data = fftData;
        filename = 'fft_analysis.csv';
        break;
      case 'psd':
        data = psdData;
        filename = 'psd_analysis.csv';
        break;
      case 'harmonics':
        data = harmonics;
        filename = 'harmonic_analysis.csv';
        break;
      case 'cepstrum':
        data = cepstrumData;
        filename = 'cepstrum_analysis.csv';
        break;
      default:
        return;
    }
    
    const csv = [
      Object.keys(data[0] || {}).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Frequency Domain Analysis</h2>
        <div className="flex gap-2">
          <Button
            onClick={isAnalyzing ? stopAnalysis : () => setIsAnalyzing(true)}
            variant={isAnalyzing ? "destructive" : "default"}
          >
            {isAnalyzing ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            {isAnalyzing ? "Stop Analysis" : "Start Analysis"}
          </Button>
          <Button variant="outline" size="icon">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="fft" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="fft">FFT Spectrum</TabsTrigger>
          <TabsTrigger value="psd">Power Spectral Density</TabsTrigger>
          <TabsTrigger value="harmonics">Harmonic Analysis</TabsTrigger>
          <TabsTrigger value="cepstrum">Cepstrum Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="fft">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Real-time FFT Spectrum
                <Button variant="outline" size="sm" onClick={() => exportData('fft')}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </CardTitle>
              <CardDescription>
                Frequency domain representation of vibration signals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={fftData.slice(0, 100)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="frequency" 
                      label={{ value: 'Frequency (Hz)', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis 
                      label={{ value: 'Amplitude', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      formatter={(value, name) => [
                        typeof value === 'number' ? value.toFixed(4) : value,
                        name === 'amplitude' ? 'Amplitude' : name
                      ]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="amplitude" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="psd">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Power Spectral Density
                <Button variant="outline" size="sm" onClick={() => exportData('psd')}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </CardTitle>
              <CardDescription>
                Power distribution across frequency spectrum
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={psdData.slice(0, 100)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="frequency" 
                      label={{ value: 'Frequency (Hz)', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis 
                      label={{ value: 'Power', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      formatter={(value, name) => [
                        typeof value === 'number' ? value.toFixed(4) : value,
                        name === 'amplitude' ? 'Power' : name
                      ]}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="amplitude" 
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary))"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="harmonics">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Harmonic Analysis & Detection
                <Button variant="outline" size="sm" onClick={() => exportData('harmonics')}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </CardTitle>
              <CardDescription>
                Order tracking for rotating machinery analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {harmonics.slice(0, 6).map((harmonic) => (
                    <div 
                      key={harmonic.order}
                      className="p-4 border rounded-lg bg-card"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">
                          {harmonic.order}x Harmonic
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {harmonic.percentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm">
                          <span className="font-medium">Frequency:</span> {harmonic.frequency.toFixed(1)} Hz
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Amplitude:</span> {harmonic.amplitude.toFixed(3)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cepstrum">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Cepstrum Analysis
                <Button variant="outline" size="sm" onClick={() => exportData('cepstrum')}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </CardTitle>
              <CardDescription>
                Gear and bearing diagnostics through cepstral analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={cepstrumData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="frequency" 
                      label={{ value: 'Quefrency (s)', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis 
                      label={{ value: 'Log Magnitude', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      formatter={(value, name) => [
                        typeof value === 'number' ? value.toFixed(4) : value,
                        name === 'amplitude' ? 'Log Magnitude' : name
                      ]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="amplitude" 
                      stroke="hsl(var(--secondary))" 
                      strokeWidth={2}
                      dot={false}
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