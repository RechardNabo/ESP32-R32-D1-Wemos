import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, XCircle, Clock, X } from "lucide-react";

interface Alert {
  id: string;
  station: string;
  parameter: string;
  value: number;
  threshold: number;
  severity: 'warning' | 'critical';
  timestamp: string;
  acknowledged: boolean;
}

interface AlertSystemProps {
  alerts: Alert[];
  onAcknowledge: (alertId: string) => void;
  onDismiss: (alertId: string) => void;
}

export function AlertSystem({ alerts, onAcknowledge, onDismiss }: AlertSystemProps) {
  const criticalAlerts = alerts.filter(alert => alert.severity === 'critical');
  const warningAlerts = alerts.filter(alert => alert.severity === 'warning');

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-critical/20 text-critical border-critical/30';
      case 'warning':
        return 'bg-warning/20 text-warning border-warning/30';
      default:
        return 'bg-muted/20 text-muted-foreground border-muted/30';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  if (alerts.length === 0) {
    return (
      <Card className="animate-slide-up">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-success">
            <div className="h-2 w-2 bg-success rounded-full animate-pulse-gentle" />
            All Systems Normal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No active alerts across all monitoring stations.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="animate-slide-up">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="h-2 w-2 bg-critical rounded-full animate-pulse-gentle" />
            Active Alerts ({alerts.length})
          </CardTitle>
          <div className="flex gap-2">
            {criticalAlerts.length > 0 && (
              <Badge variant="secondary" className="bg-critical/20 text-critical border-critical/30">
                {criticalAlerts.length} Critical
              </Badge>
            )}
            {warningAlerts.length > 0 && (
              <Badge variant="secondary" className="bg-warning/20 text-warning border-warning/30">
                {warningAlerts.length} Warning
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {alerts.map((alert) => (
          <div 
            key={alert.id}
            className={`p-3 rounded-lg border transition-all duration-200 ${
              alert.acknowledged ? 'opacity-60' : ''
            } ${getSeverityColor(alert.severity)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                {getSeverityIcon(alert.severity)}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">{alert.station}</p>
                    <Badge variant="outline" className="text-xs">
                      {alert.parameter}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Value: {alert.value} (Threshold: {alert.threshold})
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">{alert.timestamp}</p>
                    {alert.acknowledged && (
                      <Badge variant="outline" className="text-xs">
                        Acknowledged
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                {!alert.acknowledged && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onAcknowledge(alert.id)}
                    className="text-xs h-7"
                  >
                    Acknowledge
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDismiss(alert.id)}
                  className="h-7 w-7 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}