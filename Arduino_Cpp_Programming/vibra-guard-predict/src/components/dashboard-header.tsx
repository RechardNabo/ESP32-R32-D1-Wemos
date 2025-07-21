import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  RefreshCw, 
  Settings, 
  Wrench,
  Zap
} from "lucide-react";

interface DashboardStats {
  totalEquipment: number;
  operational: number;
  warning: number;
  critical: number;
  maintenance: number;
}

interface DashboardHeaderProps {
  stats: DashboardStats;
  lastUpdate: string;
  onRefresh: () => void;
  onSettings: () => void;
}

export function DashboardHeader({ 
  stats, 
  lastUpdate, 
  onRefresh, 
  onSettings 
}: DashboardHeaderProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const statusItems = [
    {
      status: 'operational',
      count: stats.operational,
      label: 'Operational',
      icon: CheckCircle,
      className: 'status-operational'
    },
    {
      status: 'warning',
      count: stats.warning,
      label: 'Warning',
      icon: AlertTriangle,
      className: 'status-warning'
    },
    {
      status: 'critical',
      count: stats.critical,
      label: 'Critical',
      icon: AlertTriangle,
      className: 'status-critical'
    },
    {
      status: 'maintenance',
      count: stats.maintenance,
      label: 'Maintenance',
      icon: Wrench,
      className: 'status-maintenance'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Main header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            Industrial Vibration Monitor
          </h1>
          <p className="text-muted-foreground mt-1">
            ESP32-based predictive maintenance system
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right text-sm">
            <div className="text-foreground font-medium">
              {currentTime.toLocaleTimeString()}
            </div>
            <div className="text-muted-foreground">
              Last update: {lastUpdate}
            </div>
          </div>
          
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          
          <Button 
            variant="outline" 
            size="icon"
            onClick={onSettings}
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* System overview cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total equipment */}
        <Card className="bg-card/50 backdrop-blur">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-industrial-blue/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-industrial-blue" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {stats.totalEquipment}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Equipment
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status cards */}
        {statusItems.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.status} className="bg-card/50 backdrop-blur">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.className} bg-opacity-10`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">
                      {item.count}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {item.label}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Alert banner for critical status */}
      {stats.critical > 0 && (
        <Card className="border-status-critical bg-status-critical/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-status-critical" />
              <div className="flex-1">
                <div className="font-medium text-foreground">
                  Critical Alert: {stats.critical} equipment requires immediate attention
                </div>
                <div className="text-sm text-muted-foreground">
                  High vibration levels detected. Check equipment status immediately.
                </div>
              </div>
              <Badge variant="destructive" className="pulse-critical">
                Critical
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}