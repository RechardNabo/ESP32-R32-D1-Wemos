import React, { useState, useEffect } from 'react';

interface BluetoothDevice {
  address: string;
  name: string;
}

interface BluetoothStatus {
  enabled: boolean;
  deviceName: string;
  devices: BluetoothDevice[];
}

const BluetoothControl: React.FC = () => {
  const [status, setStatus] = useState<BluetoothStatus>({
    enabled: false,
    deviceName: '',
    devices: []
  });
  const [message, setMessage] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch Bluetooth status on component mount and whenever status changes
  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/bluetooth/status');
      const data = await response.json();
      setStatus(data);
      setError('');
    } catch (err) {
      console.error('Failed to fetch Bluetooth status:', err);
      setError('Failed to fetch Bluetooth status');
    }
  };

  useEffect(() => {
    fetchStatus();
    // Poll status every 5 seconds if enabled
    const interval = status.enabled ? setInterval(fetchStatus, 5000) : null;
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status.enabled]);

  // Toggle Bluetooth on/off
  const toggleBluetooth = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/bluetooth/toggle', {
        method: 'POST'
      });
      const data = await response.json();
      if (response.ok) {
        fetchStatus();
        setError('');
      } else {
        setError(`Failed to toggle Bluetooth: ${data.message}`);
      }
    } catch (err) {
      console.error('Failed to toggle Bluetooth:', err);
      setError('Failed to toggle Bluetooth');
    } finally {
      setLoading(false);
    }
  };

  // Send message via Bluetooth
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/bluetooth/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message })
      });
      const data = await response.json();
      if (response.ok) {
        setMessage('');
        setError('');
      } else {
        setError(`Failed to send message: ${data.message}`);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  // Scan for Bluetooth devices
  const scanDevices = async () => {
    setIsScanning(true);
    try {
      const response = await fetch('/api/bluetooth/scan');
      const data = await response.json();
      if (response.ok) {
        setError('');
        // Wait and then fetch updated status to get devices
        setTimeout(fetchStatus, 2000);
      } else {
        setError(`Failed to scan: ${data.message}`);
      }
    } catch (err) {
      console.error('Failed to scan for devices:', err);
      setError('Failed to scan for devices');
    } finally {
      setTimeout(() => setIsScanning(false), 2000);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
        Bluetooth Control
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full mr-2 ${status.enabled ? 'bg-green-500' : 'bg-gray-400'}`}></div>
          <span className="text-gray-700 dark:text-gray-300">
            {status.enabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>
        <button
          onClick={toggleBluetooth}
          disabled={loading}
          className={`px-4 py-2 rounded font-medium ${
            status.enabled
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          } disabled:opacity-50`}
        >
          {loading ? 'Processing...' : status.enabled ? 'Disable Bluetooth' : 'Enable Bluetooth'}
        </button>
      </div>

      {status.enabled && (
        <>
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-200">
              Device Information
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Device Name: <span className="font-semibold">{status.deviceName}</span>
            </p>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                Connected Devices
              </h3>
              <button
                onClick={scanDevices}
                disabled={isScanning}
                className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded disabled:opacity-50"
              >
                {isScanning ? 'Scanning...' : 'Scan'}
              </button>
            </div>
            {status.devices && status.devices.length > 0 ? (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {status.devices.map((device, index) => (
                  <li key={index} className="py-2">
                    <div className="flex justify-between">
                      <span className="text-gray-800 dark:text-gray-200 font-medium">
                        {device.name}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 text-sm">
                        {device.address}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                No devices found. Click scan to discover devices.
              </p>
            )}
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-200">
              Send Message
            </h3>
            <form onSubmit={sendMessage} className="flex items-center">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message"
                className="flex-grow px-4 py-2 border rounded-l-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                disabled={!status.enabled || loading}
              />
              <button
                type="submit"
                disabled={!status.enabled || loading || !message}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-r-md disabled:opacity-50"
              >
                Send
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default BluetoothControl;
