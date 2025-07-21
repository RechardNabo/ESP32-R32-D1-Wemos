import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { DashboardHeader } from "@/components/dashboard-header";
import { EquipmentCard } from "@/components/equipment-card";
import { VibrationChart } from "@/components/vibration-chart";
import { EquipmentDetailsModal } from "@/components/equipment-details-modal";
import { ScheduleMaintenanceModal } from "@/components/schedule-maintenance-modal";
import { FrequencyAnalysis } from "@/components/frequency-analysis";
import { VibrationMetrics } from "@/components/vibration-metrics";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  BarChart3,
  Zap,
  Wifi
} from "lucide-react";

// Mock data for demonstration
const mockEquipment = [
  {
    id: "pump-001",
    name: "Centrifugal Pump A1",
    location: "Production Line 1",
    status: 'operational' as const,
    vibrationLevel: 1.8,
    temperature: 65,
    lastMaintenance: "2024-06-15",
    nextMaintenance: "2024-09-15"
  },
  {
    id: "motor-002", 
    name: "Electric Motor B2",
    location: "Assembly Section",
    status: 'warning' as const,
    vibrationLevel: 4.2,
    temperature: 78,
    lastMaintenance: "2024-05-20",
    nextMaintenance: "2024-08-20"
  },
  {
    id: "compressor-003",
    name: "Air Compressor C1",
    location: "Utility Room",
    status: 'critical' as const,
    vibrationLevel: 8.7,
    temperature: 85,
    lastMaintenance: "2024-04-10",
    nextMaintenance: "2024-07-10"
  },
  {
    id: "conveyor-004",
    name: "Belt Conveyor D1",
    location: "Packaging Area",
    status: 'maintenance' as const,
    vibrationLevel: 0.0,
    temperature: 45,
    lastMaintenance: "2024-07-01",
    nextMaintenance: "2024-10-01"
  },
  {
    id: "fan-005",
    name: "Cooling Fan E1", 
    location: "HVAC System",
    status: 'operational' as const,
    vibrationLevel: 2.1,
    temperature: 52,
    lastMaintenance: "2024-06-01",
    nextMaintenance: "2024-09-01"
  },
  {
    id: "generator-006",
    name: "Backup Generator F1",
    location: "Power Station",
    status: 'warning' as const,
    vibrationLevel: 3.8,
    temperature: 72,
    lastMaintenance: "2024-05-15",
    nextMaintenance: "2024-08-15"
  }
];

// Mock vibration data for chart
const generateVibrationData = (baseLevel: number) => {
  const data = [];
  const now = new Date();
  
  for (let i = 23; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 5 * 60 * 1000);
    data.push({
      timestamp: timestamp.toISOString(),
      vibration: baseLevel + (Math.random() - 0.5) * 2,
      temperature: 65 + Math.random() * 20,
      frequency: 50 + Math.random() * 10
    });
  }
  
  return data;
};

const Index = () => {
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState(mockEquipment);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [lastUpdate, setLastUpdate] = useState(new Date().toLocaleTimeString());
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connected');
  const [selectedEquipment, setSelectedEquipment] = useState<typeof mockEquipment[0] | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date().toLocaleTimeString());
      
      // Simulate data updates
      setEquipment(prev => prev.map(item => ({
        ...item,
        vibrationLevel: Math.max(0, item.vibrationLevel + (Math.random() - 0.5) * 0.2),
        temperature: Math.max(20, Math.min(100, item.temperature + (Math.random() - 0.5) * 2))
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Calculate dashboard stats
  const stats = {
    totalEquipment: equipment.length,
    operational: equipment.filter(e => e.status === 'operational').length,
    warning: equipment.filter(e => e.status === 'warning').length,
    critical: equipment.filter(e => e.status === 'critical').length,
    maintenance: equipment.filter(e => e.status === 'maintenance').length
  };

  // Filter equipment based on search and status
  const filteredEquipment = equipment.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "all" || item.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleRefresh = async () => {
    setConnectionStatus('connecting');
    
    // Simulate ESP32 data fetch
    setTimeout(() => {
      setConnectionStatus('connected');
      setLastUpdate(new Date().toLocaleTimeString());
      toast({
        title: "Data refreshed",
        description: "Latest sensor data received from ESP32 devices"
      });
    }, 1500);
  };

  const handleViewDetails = (id: string) => {
    const item = equipment.find(e => e.id === id);
    if (item) {
      setSelectedEquipment(item);
      setShowDetailsModal(true);
    }
  };

  const handleScheduleMaintenance = (id: string) => {
    const item = equipment.find(e => e.id === id);
    if (item) {
      setSelectedEquipment(item);
      setShowScheduleModal(true);
    }
  };

  const handleScheduleSubmit = (scheduleData: any) => {
    // Here you would typically send the data to your backend
    console.log("Maintenance scheduled:", scheduleData);
  };

  const handleExport = () => {
    const csvData = equipment.map(item => ({
      Name: item.name,
      Location: item.location,
      Status: item.status,
      'Vibration (mm/s)': item.vibrationLevel,
      'Temperature (°C)': item.temperature,
      'Last Maintenance': item.lastMaintenance,
      'Next Maintenance': item.nextMaintenance
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `equipment-data-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Equipment data has been exported to CSV file"
    });
  };

  const vibrationData = generateVibrationData(4.2);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Dashboard Header */}
        <DashboardHeader 
          stats={stats}
          lastUpdate={lastUpdate}
          onRefresh={handleRefresh}
          onSettings={() => navigate("/settings")}
        />

        {/* Connection Status */}
        <Card className="bg-card/50 backdrop-blur">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-status-operational glow-operational' :
                  connectionStatus === 'connecting' ? 'bg-status-warning' : 'bg-status-critical'
                }`} />
                <div className="flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">ESP32 CAN Network</span>
                  <Badge variant="outline" className={
                    connectionStatus === 'connected' ? 'status-operational' :
                    connectionStatus === 'connecting' ? 'status-warning' : 'status-critical'
                  }>
                    {connectionStatus}
                  </Badge>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                {equipment.length} sensors active • CAN Bus @ 250kbps
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vibration Chart */}
        <VibrationChart 
          data={vibrationData}
          equipmentName="Electric Motor B2"
          timeRange="Last 2 hours"
          status="warning"
        />

        {/* Frequency Analysis */}
        <FrequencyAnalysis />

        {/* Vibration Metrics */}
        <VibrationMetrics />

        {/* Controls */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-industrial-blue" />
                Equipment Overview
              </CardTitle>
              
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search equipment..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-48"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <select 
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-3 py-2 text-sm border border-input bg-background rounded-md"
                  >
                    <option value="all">All Status</option>
                    <option value="operational">Operational</option>
                    <option value="warning">Warning</option>
                    <option value="critical">Critical</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>

                <Button variant="outline" size="sm" onClick={handleExport}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                
                <Button variant="industrial" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Equipment
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Equipment Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredEquipment.map((item) => (
            <div key={item.id} className="animate-fade-in">
              <EquipmentCard
                {...item}
                onViewDetails={handleViewDetails}
                onScheduleMaintenance={handleScheduleMaintenance}
              />
            </div>
          ))}
        </div>

        {filteredEquipment.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-muted-foreground">
                No equipment found matching your search criteria.
              </div>
            </CardContent>
          </Card>
        )}

        {/* Modals */}
        <EquipmentDetailsModal
          equipment={selectedEquipment}
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
        />

        <ScheduleMaintenanceModal
          equipment={selectedEquipment}
          isOpen={showScheduleModal}
          onClose={() => setShowScheduleModal(false)}
          onSchedule={handleScheduleSubmit}
        />
      </div>
    </div>
  );
};

export default Index;
