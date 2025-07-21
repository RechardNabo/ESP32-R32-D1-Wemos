import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Wifi, WifiOff } from "lucide-react";

interface StationOverviewProps {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'offline' | 'warning';
  lastUpdate: string;
  alertCount: number;
}

export function StationOverview({ 
  id, 
  name, 
  location, 
  status, 
  lastUpdate, 
  alertCount 
}: StationOverviewProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'online':
        return 'bg-success/20 text-success border-success/30';
      case 'warning':
        return 'bg-warning/20 text-warning border-warning/30';
      case 'offline':
        return 'bg-critical/20 text-critical border-critical/30';
      default:
        return 'bg-muted/20 text-muted-foreground border-muted/30';
    }
  };

  const getStatusIcon = () => {
    return status === 'offline' ? 
      <WifiOff className="h-4 w-4" /> : 
      <Wifi className="h-4 w-4" />;
  };

  return (
    <Card className="cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg animate-slide-up">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-water-blue" />
            <CardTitle className="text-lg">{name}</CardTitle>
          </div>
          <Badge variant="secondary" className={getStatusColor()}>
            {getStatusIcon()}
            {status}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{location}</p>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Station ID</p>
            <p className="font-mono text-sm">{id}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Active Alerts</p>
            <p className={`font-bold ${
              alertCount > 0 ? 'text-critical' : 'text-success'
            }`}>
              {alertCount}
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-muted-foreground">Last Update</p>
            <p className="text-sm">{lastUpdate}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}