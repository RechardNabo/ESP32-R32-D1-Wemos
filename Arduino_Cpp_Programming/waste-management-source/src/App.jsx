import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.jsx'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog.jsx'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, ScatterChart, Scatter } from 'recharts'
import { Activity, Database, Settings, Trash2, Plus, Edit, Wifi, WifiOff, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import './App.css'

// Generate sample device data
const generateDevices = () => {
  const deviceTypes = ['Waste Bin Sensor', 'Compost Monitor', 'Liquid Waste Detector', 'Gas Emission Sensor', 'Temperature Monitor']
  const locations = ['Field A', 'Field B', 'Field C', 'Greenhouse 1', 'Greenhouse 2', 'Storage Area', 'Processing Unit']
  const protocols = ['CANbus', 'RTU']
  
  return Array.from({ length: 50 }, (_, i) => ({
    id: `DEV-${String(i + 1).padStart(3, '0')}`,
    name: `${deviceTypes[i % deviceTypes.length]} ${i + 1}`,
    type: deviceTypes[i % deviceTypes.length],
    location: locations[i % locations.length],
    protocol: protocols[i % protocols.length],
    status: Math.random() > 0.1 ? 'online' : 'offline',
    lastSeen: new Date(Date.now() - Math.random() * 86400000).toISOString(),
    batteryLevel: Math.floor(Math.random() * 100),
    sensors: []
  }))
}

// Generate sample sensor data
const generateSensorData = () => {
  return Array.from({ length: 24 }, (_, i) => ({
    time: `${String(i).padStart(2, '0')}:00`,
    wasteLevel: Math.floor(Math.random() * 100),
    temperature: 20 + Math.random() * 15,
    humidity: 40 + Math.random() * 40,
    gasEmission: Math.random() * 50,
    ph: 6 + Math.random() * 2
  }))
}

function App() {
  const [devices, setDevices] = useState([])
  const [selectedDevice, setSelectedDevice] = useState(null)
  const [sensorData, setSensorData] = useState([])
  const [newDevice, setNewDevice] = useState({ name: '', type: '', location: '', protocol: 'CANbus' })
  const [newSensor, setNewSensor] = useState({ name: '', type: '', unit: '', threshold: '' })
  const [isAddDeviceOpen, setIsAddDeviceOpen] = useState(false)
  const [isAddSensorOpen, setIsAddSensorOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('devices')

  useEffect(() => {
    setDevices(generateDevices())
    setSensorData(generateSensorData())
  }, [])

  const addDevice = () => {
    if (newDevice.name && newDevice.type && newDevice.location) {
      const device = {
        id: `DEV-${String(devices.length + 1).padStart(3, '0')}`,
        ...newDevice,
        status: 'online',
        lastSeen: new Date().toISOString(),
        batteryLevel: 100,
        sensors: []
      }
      setDevices([...devices, device])
      setNewDevice({ name: '', type: '', location: '', protocol: 'CANbus' })
      setIsAddDeviceOpen(false)
    }
  }

  const deleteDevice = (deviceId) => {
    setDevices(devices.filter(d => d.id !== deviceId))
    if (selectedDevice?.id === deviceId) {
      setSelectedDevice(null)
    }
  }

  const addSensor = () => {
    if (selectedDevice && newSensor.name && newSensor.type) {
      const sensor = {
        id: `SENS-${Date.now()}`,
        ...newSensor,
        deviceId: selectedDevice.id,
        value: Math.random() * 100,
        status: 'active'
      }
      
      const updatedDevices = devices.map(device => 
        device.id === selectedDevice.id 
          ? { ...device, sensors: [...device.sensors, sensor] }
          : device
      )
      
      setDevices(updatedDevices)
      setSelectedDevice({ ...selectedDevice, sensors: [...selectedDevice.sensors, sensor] })
      setNewSensor({ name: '', type: '', unit: '', threshold: '' })
      setIsAddSensorOpen(false)
    }
  }

  const deleteSensor = (sensorId) => {
    if (selectedDevice) {
      const updatedSensors = selectedDevice.sensors.filter(s => s.id !== sensorId)
      const updatedDevice = { ...selectedDevice, sensors: updatedSensors }
      
      const updatedDevices = devices.map(device => 
        device.id === selectedDevice.id ? updatedDevice : device
      )
      
      setDevices(updatedDevices)
      setSelectedDevice(updatedDevice)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'offline': return <XCircle className="h-4 w-4 text-red-500" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      default: return <XCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getProtocolIcon = (protocol) => {
    return protocol === 'CANbus' ? <Wifi className="h-4 w-4" /> : <Database className="h-4 w-4" />
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Waste Management Optimization</h1>
                <p className="text-sm text-muted-foreground">Industrial Agriculture System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-green-600">
                {devices.filter(d => d.status === 'online').length} Online
              </Badge>
              <Badge variant="outline" className="text-red-600">
                {devices.filter(d => d.status === 'offline').length} Offline
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="devices">Device Management</TabsTrigger>
            <TabsTrigger value="sensors">Sensor Configuration</TabsTrigger>
            <TabsTrigger value="analytics">Data Analytics</TabsTrigger>
            <TabsTrigger value="charts">Chart Matrix</TabsTrigger>
          </TabsList>

          <TabsContent value="devices" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Connected Devices ({devices.length})</h2>
              <Dialog open={isAddDeviceOpen} onOpenChange={setIsAddDeviceOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Device
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Device</DialogTitle>
                    <DialogDescription>Configure a new waste management device</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="device-name">Device Name</Label>
                      <Input
                        id="device-name"
                        value={newDevice.name}
                        onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
                        placeholder="Enter device name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="device-type">Device Type</Label>
                      <Select value={newDevice.type} onValueChange={(value) => setNewDevice({ ...newDevice, type: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select device type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Waste Bin Sensor">Waste Bin Sensor</SelectItem>
                          <SelectItem value="Compost Monitor">Compost Monitor</SelectItem>
                          <SelectItem value="Liquid Waste Detector">Liquid Waste Detector</SelectItem>
                          <SelectItem value="Gas Emission Sensor">Gas Emission Sensor</SelectItem>
                          <SelectItem value="Temperature Monitor">Temperature Monitor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="device-location">Location</Label>
                      <Select value={newDevice.location} onValueChange={(value) => setNewDevice({ ...newDevice, location: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Field A">Field A</SelectItem>
                          <SelectItem value="Field B">Field B</SelectItem>
                          <SelectItem value="Field C">Field C</SelectItem>
                          <SelectItem value="Greenhouse 1">Greenhouse 1</SelectItem>
                          <SelectItem value="Greenhouse 2">Greenhouse 2</SelectItem>
                          <SelectItem value="Storage Area">Storage Area</SelectItem>
                          <SelectItem value="Processing Unit">Processing Unit</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="device-protocol">Communication Protocol</Label>
                      <Select value={newDevice.protocol} onValueChange={(value) => setNewDevice({ ...newDevice, protocol: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CANbus">CANbus</SelectItem>
                          <SelectItem value="RTU">RTU (Modbus)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={addDevice} className="w-full">Add Device</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {devices.map((device) => (
                <Card key={device.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedDevice(device)}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">{device.name}</CardTitle>
                      <div className="flex items-center space-x-2">
                        {getProtocolIcon(device.protocol)}
                        {getStatusIcon(device.status)}
                      </div>
                    </div>
                    <CardDescription>{device.type}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Location:</span>
                        <span>{device.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Protocol:</span>
                        <span>{device.protocol}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Battery:</span>
                        <span className={device.batteryLevel < 20 ? 'text-red-500' : 'text-green-500'}>
                          {device.batteryLevel}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Sensors:</span>
                        <span>{device.sensors.length}</span>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm" onClick={(e) => e.stopPropagation()}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Device</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete {device.name}? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteDevice(device.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="sensors" className="space-y-6">
            {selectedDevice ? (
              <>
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold">Sensor Configuration</h2>
                    <p className="text-muted-foreground">Device: {selectedDevice.name}</p>
                  </div>
                  <Dialog open={isAddSensorOpen} onOpenChange={setIsAddSensorOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Sensor
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Sensor</DialogTitle>
                        <DialogDescription>Configure a new sensor for {selectedDevice.name}</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="sensor-name">Sensor Name</Label>
                          <Input
                            id="sensor-name"
                            value={newSensor.name}
                            onChange={(e) => setNewSensor({ ...newSensor, name: e.target.value })}
                            placeholder="Enter sensor name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="sensor-type">Sensor Type</Label>
                          <Select value={newSensor.type} onValueChange={(value) => setNewSensor({ ...newSensor, type: value })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select sensor type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Temperature">Temperature</SelectItem>
                              <SelectItem value="Humidity">Humidity</SelectItem>
                              <SelectItem value="pH Level">pH Level</SelectItem>
                              <SelectItem value="Gas Concentration">Gas Concentration</SelectItem>
                              <SelectItem value="Fill Level">Fill Level</SelectItem>
                              <SelectItem value="Pressure">Pressure</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="sensor-unit">Unit</Label>
                          <Input
                            id="sensor-unit"
                            value={newSensor.unit}
                            onChange={(e) => setNewSensor({ ...newSensor, unit: e.target.value })}
                            placeholder="e.g., °C, %, ppm"
                          />
                        </div>
                        <div>
                          <Label htmlFor="sensor-threshold">Alert Threshold</Label>
                          <Input
                            id="sensor-threshold"
                            type="number"
                            value={newSensor.threshold}
                            onChange={(e) => setNewSensor({ ...newSensor, threshold: e.target.value })}
                            placeholder="Enter threshold value"
                          />
                        </div>
                        <Button onClick={addSensor} className="w-full">Add Sensor</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedDevice.sensors.map((sensor) => (
                    <Card key={sensor.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-medium">{sensor.name}</CardTitle>
                          <Badge variant={sensor.status === 'active' ? 'default' : 'secondary'}>
                            {sensor.status}
                          </Badge>
                        </div>
                        <CardDescription>{sensor.type}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Current Value:</span>
                            <span className="font-medium">{sensor.value.toFixed(2)} {sensor.unit}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Threshold:</span>
                            <span>{sensor.threshold} {sensor.unit}</span>
                          </div>
                        </div>
                        <div className="mt-4 flex justify-end space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Sensor</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete {sensor.name}? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteSensor(sensor.id)}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Device Selected</h3>
                    <p className="text-muted-foreground">Select a device from the Device Management tab to configure its sensors.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-xl font-semibold">Real-time Analytics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Devices</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{devices.length}</div>
                  <p className="text-xs text-muted-foreground">+2 from last week</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Online Devices</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{devices.filter(d => d.status === 'online').length}</div>
                  <p className="text-xs text-muted-foreground">{((devices.filter(d => d.status === 'online').length / devices.length) * 100).toFixed(1)}% uptime</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Sensors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{devices.reduce((acc, device) => acc + device.sensors.length, 0)}</div>
                  <p className="text-xs text-muted-foreground">Across all devices</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Avg Battery</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{Math.round(devices.reduce((acc, device) => acc + device.batteryLevel, 0) / devices.length)}%</div>
                  <p className="text-xs text-muted-foreground">All devices</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>24-Hour Waste Level Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={sensorData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="wasteLevel" stroke="#8884d8" name="Waste Level %" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="charts" className="space-y-6">
            <h2 className="text-xl font-semibold">Data Visualization Matrix</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Temperature & Humidity</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={sensorData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="temperature" stroke="#ff7300" name="Temperature (°C)" />
                      <Line type="monotone" dataKey="humidity" stroke="#00ff00" name="Humidity (%)" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Gas Emissions</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={sensorData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="gasEmission" fill="#ff6b6b" name="Gas Emission (ppm)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Device Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Online', value: devices.filter(d => d.status === 'online').length, fill: '#00ff00' },
                          { name: 'Offline', value: devices.filter(d => d.status === 'offline').length, fill: '#ff0000' }
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label
                      />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>pH Level Scatter Plot</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <ScatterChart data={sensorData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="temperature" name="Temperature" />
                      <YAxis dataKey="ph" name="pH Level" />
                      <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                      <Scatter name="pH vs Temperature" dataKey="ph" fill="#8884d8" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default App

