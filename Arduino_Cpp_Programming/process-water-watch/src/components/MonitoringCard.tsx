import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";

interface MonitoringCardProps {
  title: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  optimal: [number, number];
  status: 'normal' | 'warning' | 'critical';
  trend?: 'up' | 'down' | 'stable';
}

export function MonitoringCard({ 
  title, 
  value, 
  unit, 
  min, 
  max, 
  optimal, 
  status,
  trend = 'stable'
}: MonitoringCardProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'normal':
        return 'success';
      case 'warning':
        return 'warning';
      case 'critical':
        return 'critical';
      default:
        return 'muted';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'normal':
        return <CheckCircle className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'critical':
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getTrendArrow = () => {
    switch (trend) {
      case 'up':
        return '↗';
      case 'down':
        return '↘';
      case 'stable':
        return '→';
      default:
        return '→';
    }
  };

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <Card className="relative overflow-hidden animate-slide-up">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <Badge 
            variant="secondary" 
            className={`flex items-center gap-1 ${
              status === 'normal' ? 'bg-success/20 text-success border-success/30' :
              status === 'warning' ? 'bg-warning/20 text-warning border-warning/30' :
              'bg-critical/20 text-critical border-critical/30'
            }`}
          >
            {getStatusIcon()}
            {status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-baseline space-x-2">
          <div className="text-2xl font-bold text-foreground">
            {value.toFixed(1)}
          </div>
          <div className="text-sm text-muted-foreground">
            {unit}
          </div>
          <div className="text-lg text-muted-foreground ml-auto">
            {getTrendArrow()}
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Min: {min}</span>
            <span>Optimal: {optimal[0]}-{optimal[1]}</span>
            <span>Max: {max}</span>
          </div>
          
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full transition-all duration-500 ease-in-out bg-gradient-to-r from-water-blue to-primary"
              style={{ width: `${Math.min(Math.max(percentage, 0), 100)}%` }}
            />
          </div>
        </div>
      </CardContent>
      
      {status !== 'normal' && (
        <div className={`absolute top-0 right-0 w-1 h-full ${
          status === 'warning' ? 'bg-warning' : 'bg-critical'
        } animate-pulse-gentle`} />
      )}
    </Card>
  );
}