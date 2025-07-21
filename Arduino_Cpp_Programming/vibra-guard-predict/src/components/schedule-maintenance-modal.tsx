import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "@/hooks/use-toast";
import { CalendarIcon, Clock, User, Wrench } from "lucide-react";
import { format } from "date-fns";

interface Equipment {
  id: string;
  name: string;
  location: string;
  status: 'operational' | 'warning' | 'critical' | 'maintenance';
  vibrationLevel: number;
  temperature: number;
  lastMaintenance: string;
  nextMaintenance: string;
}

interface ScheduleMaintenanceModalProps {
  equipment: Equipment | null;
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (scheduleData: any) => void;
}

export function ScheduleMaintenanceModal({ 
  equipment, 
  isOpen, 
  onClose, 
  onSchedule 
}: ScheduleMaintenanceModalProps) {
  const [scheduledDate, setScheduledDate] = useState<Date>();
  const [maintenanceType, setMaintenanceType] = useState<string>("");
  const [technician, setTechnician] = useState<string>("");
  const [estimatedDuration, setEstimatedDuration] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [priority, setPriority] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!scheduledDate || !maintenanceType || !technician || !priority) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const scheduleData = {
      equipmentId: equipment?.id,
      scheduledDate,
      maintenanceType,
      technician,
      estimatedDuration,
      description,
      priority
    };

    onSchedule(scheduleData);
    
    toast({
      title: "Maintenance Scheduled",
      description: `${maintenanceType} scheduled for ${equipment?.name} on ${format(scheduledDate, "PPP")}`
    });

    // Reset form
    setScheduledDate(undefined);
    setMaintenanceType("");
    setTechnician("");
    setEstimatedDuration("");
    setDescription("");
    setPriority("");
    
    onClose();
  };

  if (!equipment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Wrench className="w-6 h-6 text-industrial-blue" />
            Schedule Maintenance - {equipment.name}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Equipment Info */}
            <div className="space-y-2">
              <Label>Equipment</Label>
              <Input value={equipment.name} disabled />
            </div>
            
            <div className="space-y-2">
              <Label>Location</Label>
              <Input value={equipment.location} disabled />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Maintenance Type */}
            <div className="space-y-2">
              <Label htmlFor="maintenanceType">Maintenance Type *</Label>
              <Select value={maintenanceType} onValueChange={setMaintenanceType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select maintenance type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="routine">Routine Inspection</SelectItem>
                  <SelectItem value="preventive">Preventive Maintenance</SelectItem>
                  <SelectItem value="corrective">Corrective Maintenance</SelectItem>
                  <SelectItem value="emergency">Emergency Repair</SelectItem>
                  <SelectItem value="calibration">Calibration</SelectItem>
                  <SelectItem value="lubrication">Lubrication</SelectItem>
                  <SelectItem value="replacement">Part Replacement</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label htmlFor="priority">Priority *</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Scheduled Date */}
            <div className="space-y-2">
              <Label>Scheduled Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {scheduledDate ? format(scheduledDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={scheduledDate}
                    onSelect={setScheduledDate}
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Estimated Duration */}
            <div className="space-y-2">
              <Label htmlFor="duration">Estimated Duration</Label>
              <Select value={estimatedDuration} onValueChange={setEstimatedDuration}>
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30min">30 minutes</SelectItem>
                  <SelectItem value="1hour">1 hour</SelectItem>
                  <SelectItem value="2hours">2 hours</SelectItem>
                  <SelectItem value="4hours">4 hours</SelectItem>
                  <SelectItem value="8hours">8 hours (Full day)</SelectItem>
                  <SelectItem value="multiple">Multiple days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Technician */}
          <div className="space-y-2">
            <Label htmlFor="technician">Assigned Technician *</Label>
            <Select value={technician} onValueChange={setTechnician}>
              <SelectTrigger>
                <SelectValue placeholder="Select technician" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="john-doe">John Doe</SelectItem>
                <SelectItem value="jane-smith">Jane Smith</SelectItem>
                <SelectItem value="mike-johnson">Mike Johnson</SelectItem>
                <SelectItem value="sarah-wilson">Sarah Wilson</SelectItem>
                <SelectItem value="external">External Contractor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description / Notes</Label>
            <Textarea
              id="description"
              placeholder="Add any specific instructions or notes for the maintenance task..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              <Clock className="w-4 h-4 mr-2" />
              Schedule Maintenance
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}