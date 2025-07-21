import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Activity, AlertTriangle, CheckCircle, Clock, Settings, Wrench } from "lucide-react";

interface EquipmentCardProps {
  id: string;
  name: string;
  location: string;
  status: 'operational' | 'warning' | 'critical' | 'maintenance';
  vibrationLevel: number;
  temperature: number;
  lastMaintenance: string;
  nextMaintenance: string;
  onViewDetails: (id: string) => void;
  onScheduleMaintenance: (id: string) => void;
}

const statusConfig = {
  operational: {
    icon: CheckCircle,
    label: 'Operational',
    className: 'status-operational pulse-operational',
    bgClass: 'bg-status-operational/10'
  },
  warning: {
    icon: AlertTriangle,
    label: 'Warning',
    className: 'status-warning pulse-warning',
    bgClass: 'bg-status-warning/10'
  },
  critical: {
    icon: AlertTriangle,
    label: 'Critical',
    className: 'status-critical pulse-critical',
    bgClass: 'bg-status-critical/10'
  },
  maintenance: {
    icon: Wrench,
    label: 'Maintenance',
    className: 'status-maintenance',
    bgClass: 'bg-status-maintenance/10'
  }
};

export function EquipmentCard({
  id,
  name,
  location,
  status,
  vibrationLevel,
  temperature,
  lastMaintenance,
  nextMaintenance,
  onViewDetails,
  onScheduleMaintenance
}: EquipmentCardProps) {
  const statusInfo = statusConfig[status];
  const StatusIcon = statusInfo.icon;
  
  const getVibrationStatus = (level: number) => {
    if (level < 2) return 'low';
    if (level < 5) return 'normal';
    if (level < 8) return 'high';
    return 'critical';
  };

  const vibrationStatus = getVibrationStatus(vibrationLevel);

  return (
    <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg border-l-4 ${statusInfo.bgClass}`}>
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-current to-transparent opacity-20" />
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-foreground">{name}</CardTitle>
            <p className="text-sm text-muted-foreground">{location}</p>
          </div>
          <Badge variant="outline" className={`${statusInfo.className} rounded-full px-3 py-1`}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {statusInfo.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Real-time metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-industrial-blue" />
              <span className="text-sm font-medium">Vibration</span>
            </div>
            <div className="flex items-center gap-2">
              <Progress 
                value={vibrationLevel * 10} 
                className="h-2 flex-1"
              />
              <span className="text-sm font-mono text-muted-foreground">
                {vibrationLevel.toFixed(1)} mm/s
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-industrial-orange/20 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-industrial-orange" />
              </div>
              <span className="text-sm font-medium">Temperature</span>
            </div>
            <div className="text-xl font-mono text-foreground">
              {temperature}°C
            </div>
          </div>
        </div>

        {/* Maintenance information */}
        <div className="bg-muted/50 rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Last maintenance:</span>
            <span className="font-medium">{lastMaintenance}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Settings className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Next scheduled:</span>
            <span className="font-medium">{nextMaintenance}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onViewDetails(id)}
          >
            View Details
          </Button>
          <Button 
            variant="industrial" 
            size="sm" 
            className="flex-1"
            onClick={() => onScheduleMaintenance(id)}
          >
            Schedule
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}