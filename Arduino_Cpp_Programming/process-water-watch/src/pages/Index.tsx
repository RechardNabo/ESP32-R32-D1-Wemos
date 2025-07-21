import { MonitoringCard } from "@/components/MonitoringCard";
import { StationOverview } from "@/components/StationOverview";
import { AlertSystem } from "@/components/AlertSystem";
import { AdvancedDashboard } from "@/components/AdvancedDashboard";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useWaterQualityData } from "@/hooks/useWaterQualityData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Toaster } from "@/components/ui/toaster";
import { Droplets, Activity, Thermometer, Eye, Zap, FlaskConical } from "lucide-react";

const Index = () => {
  const { stations, currentReadings, alerts, acknowledgeAlert, dismissAlert } = useWaterQualityData();

  const getParameterStatus = (value: number, min: number, max: number, optimal: [number, number]) => {
    if (value < optimal[0] || value > optimal[1]) {
      if (value < min || value > max) return 'critical';
      return 'warning';
    }
    return 'normal';
  };

  const getTrend = () => {
    const trends = ['up', 'down', 'stable'];
    return trends[Math.floor(Math.random() * trends.length)] as 'up' | 'down' | 'stable';
  };

  // Get reading for the first online station for display
  const primaryReading = Object.values(currentReadings)[0];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Droplets className="h-8 w-8 text-water-blue" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">AquaMonitor Pro</h1>
                <p className="text-sm text-muted-foreground">Industrial Water Quality Monitoring System</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Badge variant="secondary" className="bg-success/20 text-success border-success/30">
                {stations.filter(s => s.status === 'online').length} Online
              </Badge>
              <Badge variant="secondary" className="bg-warning/20 text-warning border-warning/30">
                {stations.filter(s => s.status === 'warning').length} Warning
              </Badge>
              <Badge variant="secondary" className="bg-critical/20 text-critical border-critical/30">
                {stations.filter(s => s.status === 'offline').length} Offline
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6 space-y-6">
        {/* Alert System */}
        <AlertSystem 
          alerts={alerts}
          onAcknowledge={acknowledgeAlert}
          onDismiss={dismissAlert}
        />

        {/* Real-time Monitoring Cards */}
        {primaryReading && (
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-water-blue" />
              Real-time Parameters - Primary Treatment
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <MonitoringCard
                title="pH Level"
                value={primaryReading.ph}
                unit="pH"
                min={6.0}
                max={9.0}
                optimal={[6.5, 8.5]}
                status={getParameterStatus(primaryReading.ph, 6.0, 9.0, [6.5, 8.5])}
                trend={getTrend()}
              />
              <MonitoringCard
                title="Temperature"
                value={primaryReading.temperature}
                unit="°C"
                min={15}
                max={35}
                optimal={[18, 25]}
                status={getParameterStatus(primaryReading.temperature, 15, 35, [18, 25])}
                trend={getTrend()}
              />
              <MonitoringCard
                title="Turbidity"
                value={primaryReading.turbidity}
                unit="NTU"
                min={0}
                max={10}
                optimal={[0, 4]}
                status={getParameterStatus(primaryReading.turbidity, 0, 10, [0, 4])}
                trend={getTrend()}
              />
              <MonitoringCard
                title="Dissolved Oxygen"
                value={primaryReading.dissolvedOxygen}
                unit="mg/L"
                min={5.0}
                max={12.0}
                optimal={[7.0, 10.0]}
                status={getParameterStatus(primaryReading.dissolvedOxygen, 5.0, 12.0, [7.0, 10.0])}
                trend={getTrend()}
              />
              <MonitoringCard
                title="Conductivity"
                value={primaryReading.conductivity}
                unit="μS/cm"
                min={200}
                max={800}
                optimal={[300, 600]}
                status={getParameterStatus(primaryReading.conductivity, 200, 800, [300, 600])}
                trend={getTrend()}
              />
              <MonitoringCard
                title="Free Chlorine"
                value={primaryReading.chlorine}
                unit="mg/L"
                min={0.2}
                max={2.0}
                optimal={[0.5, 1.5]}
                status={getParameterStatus(primaryReading.chlorine, 0.2, 2.0, [0.5, 1.5])}
                trend={getTrend()}
              />
            </div>
          </div>
        )}

        {/* Station Overview */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-water-blue" />
            Monitoring Stations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stations.map((station) => (
              <StationOverview
                key={station.id}
                id={station.id}
                name={station.name}
                location={station.location}
                status={station.status}
                lastUpdate={station.lastUpdate}
                alertCount={station.alertCount}
              />
            ))}
          </div>
        </div>

        {/* Advanced Dashboard */}
        <AdvancedDashboard currentReadings={currentReadings} />

        {/* System Status */}
        <Card className="animate-slide-up">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-water-blue" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-success mb-1">
                  {stations.filter(s => s.status === 'online').length}
                </div>
                <p className="text-sm text-muted-foreground">Stations Online</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-warning mb-1">
                  {alerts.filter(a => !a.acknowledged).length}
                </div>
                <p className="text-sm text-muted-foreground">Active Alerts</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-water-blue mb-1">
                  {Object.keys(currentReadings).length}
                </div>
                <p className="text-sm text-muted-foreground">Real-time Readings</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Toaster />
    </div>
  );
};

export default Index;
