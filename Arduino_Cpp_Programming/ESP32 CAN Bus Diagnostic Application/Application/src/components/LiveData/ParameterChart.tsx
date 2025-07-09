import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { OBDParameter } from '../../types/can';

Chart.register(...registerables);

interface ParameterChartProps {
  parameters: OBDParameter[];
  selectedPids: string[];
  timeRange: number; // in seconds
}

export const ParameterChart: React.FC<ParameterChartProps> = ({ 
  parameters, 
  selectedPids, 
  timeRange 
}) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Filter parameters by selected PIDs
    const filteredParams = parameters.filter(p => selectedPids.includes(p.pid));
    
    // Group parameters by PID
    const paramsByPid = filteredParams.reduce((acc, param) => {
      if (!acc[param.pid]) {
        acc[param.pid] = [];
      }
      acc[param.pid].push(param);
      return acc;
    }, {} as Record<string, OBDParameter[]>);

    // Create datasets
    const datasets = Object.entries(paramsByPid).map(([pid, params], index) => {
      const colors = [
        'rgb(59, 130, 246)',   // blue
        'rgb(16, 185, 129)',   // green
        'rgb(245, 158, 11)',   // yellow
        'rgb(239, 68, 68)',    // red
        'rgb(139, 92, 246)',   // purple
        'rgb(236, 72, 153)',   // pink
      ];
      
      const color = colors[index % colors.length];
      
      return {
        label: params[0]?.name || pid,
        data: params.map(p => ({ x: p.timestamp, y: p.value })),
        borderColor: color,
        backgroundColor: color.replace('rgb', 'rgba').replace(')', ', 0.1)'),
        fill: false,
        tension: 0.1,
      };
    });

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: { datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: 'time',
            time: {
              displayFormats: {
                second: 'HH:mm:ss',
                minute: 'HH:mm',
              },
            },
            title: {
              display: true,
              text: 'Time',
              color: '#D1D5DB',
            },
            grid: {
              color: '#374151',
            },
            ticks: {
              color: '#D1D5DB',
            },
          },
          y: {
            title: {
              display: true,
              text: 'Value',
              color: '#D1D5DB',
            },
            grid: {
              color: '#374151',
            },
            ticks: {
              color: '#D1D5DB',
            },
          },
        },
        plugins: {
          legend: {
            display: true,
            labels: {
              color: '#D1D5DB',
            },
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(17, 24, 39, 0.9)',
            titleColor: '#F9FAFB',
            bodyColor: '#D1D5DB',
            borderColor: '#374151',
            borderWidth: 1,
          },
        },
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false,
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [parameters, selectedPids, timeRange]);

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-xl font-semibold text-white mb-4">Parameter Trends</h3>
      <div className="h-96">
        <canvas ref={chartRef} />
      </div>
    </div>
  );
};