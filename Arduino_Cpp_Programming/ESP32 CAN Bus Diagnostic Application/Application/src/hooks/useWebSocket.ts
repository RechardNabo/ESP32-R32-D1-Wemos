import { useEffect, useRef, useState } from 'react';
import { CANMessage, OBDParameter, SystemStatus } from '../types/can';

interface WebSocketData {
  type: 'can_message' | 'obd_data' | 'system_status' | 'dtc_update';
  data: any;
}

export const useWebSocket = (url: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<CANMessage[]>([]);
  const [obdData, setObdData] = useState<OBDParameter[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout>();

  const connect = () => {
    try {
      ws.current = new WebSocket(url);
      
      ws.current.onopen = () => {
        setIsConnected(true);
        console.log('WebSocket connected');
      };

      ws.current.onclose = () => {
        setIsConnected(false);
        console.log('WebSocket disconnected');
        // Auto-reconnect after 3 seconds
        reconnectTimeout.current = setTimeout(connect, 3000);
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };

      ws.current.onmessage = (event) => {
        try {
          const data: WebSocketData = JSON.parse(event.data);
          
          switch (data.type) {
            case 'can_message':
              setMessages(prev => [...prev.slice(-999), data.data]);
              break;
            case 'obd_data':
              setObdData(prev => {
                const updated = [...prev];
                const index = updated.findIndex(p => p.pid === data.data.pid);
                if (index >= 0) {
                  updated[index] = data.data;
                } else {
                  updated.push(data.data);
                }
                return updated;
              });
              break;
            case 'system_status':
              setSystemStatus(data.data);
              break;
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  };

  const disconnect = () => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
    }
    if (ws.current) {
      ws.current.close();
    }
  };

  const sendMessage = (message: any) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    }
  };

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [url]);

  return {
    isConnected,
    messages,
    obdData,
    systemStatus,
    sendMessage,
    connect,
    disconnect
  };
};