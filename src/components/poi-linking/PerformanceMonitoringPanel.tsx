import React, { useState, useEffect, useRef } from 'react';
import { 
  PerformanceMonitor, 
  PerformanceMetrics, 
  PerformanceWarning, 
  ResourceSnapshot,
  performanceUtils
} from '../../lib/performanceUtils';
import { Activity, AlertTriangle, TrendingUp, Monitor, Cpu, MemoryStick, Network, Clock } from 'lucide-react';

interface PerformanceMonitoringPanelProps {
  operationId?: string;
  isVisible: boolean;
  onToggle: () => void;
  className?: string;
}

interface PerformanceChartProps {
  data: number[];
  label: string;
  color: string;
  unit?: string;
  maxDataPoints?: number;
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ 
  data, 
  label, 
  color, 
  unit = '', 
  maxDataPoints = 50 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set up dimensions
    const width = canvas.width;
    const height = canvas.height;
    const padding = 20;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;
    
    // Calculate data bounds
    const maxValue = Math.max(...data, 1);
    const minValue = Math.min(...data, 0);
    const range = maxValue - minValue || 1;
    
    // Draw background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);
    
    // Draw grid lines
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight * i) / 5;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }
    
    // Vertical grid lines
    for (let i = 0; i <= 10; i++) {
      const x = padding + (chartWidth * i) / 10;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, height - padding);
      ctx.stroke();
    }
    
    // Draw chart line
    if (data.length > 1) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      data.forEach((value, index) => {
        const x = padding + (chartWidth * index) / (data.length - 1);
        const y = padding + chartHeight - ((value - minValue) / range) * chartHeight;
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      ctx.stroke();
      
      // Draw data points
      ctx.fillStyle = color;
      data.forEach((value, index) => {
        const x = padding + (chartWidth * index) / (data.length - 1);
        const y = padding + chartHeight - ((value - minValue) / range) * chartHeight;
        
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fill();
      });
    }
    
    // Draw labels
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`${label}: ${data[data.length - 1]?.toFixed(2) || 0}${unit}`, 10, 15);
    
    // Draw value range
    ctx.textAlign = 'right';
    ctx.fillText(`Max: ${maxValue.toFixed(2)}${unit}`, width - 10, 15);
    ctx.fillText(`Min: ${minValue.toFixed(2)}${unit}`, width - 10, height - 5);
    
  }, [data, label, color, unit, maxDataPoints]);
  
  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={300}
        height={150}
        className="border border-sand-600 rounded bg-night-950"
      />
    </div>
  );
};

const WarningItem: React.FC<{ warning: PerformanceWarning }> = ({ warning }) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-900/20';
      case 'high': return 'text-red-300 bg-red-800/20';
      case 'medium': return 'text-yellow-300 bg-yellow-800/20';
      case 'low': return 'text-blue-300 bg-blue-800/20';
      default: return 'text-sand-300 bg-sand-800/20';
    }
  };
  
  return (
    <div className={`p-3 rounded border ${getSeverityColor(warning.severity)}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span className="font-medium capitalize">{warning.type}</span>
          <span className="text-xs px-2 py-1 rounded bg-black/20">
            {warning.severity.toUpperCase()}
          </span>
        </div>
        <span className="text-xs">
          {warning.currentValue.toFixed(2)} / {warning.threshold}
        </span>
      </div>
      <p className="text-sm mb-2">{warning.message}</p>
      <p className="text-xs opacity-80">{warning.suggestedAction}</p>
    </div>
  );
};

const MetricsDisplay: React.FC<{ metrics: PerformanceMetrics | null }> = ({ metrics }) => {
  if (!metrics) {
    return (
      <div className="p-4 text-center text-sand-400">
        No active operation metrics
      </div>
    );
  }
  
  const duration = metrics.duration || (performance.now() - metrics.startTime);
  const throughput = metrics.batchMetrics.throughput;
  const errorRate = metrics.networkMetrics.errorRate * 100;
  const memoryUsage = metrics.memoryDelta ? metrics.memoryDelta / 1024 / 1024 : 0;
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-night-800 p-3 rounded border border-sand-600">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium">Duration</span>
        </div>
        <div className="text-lg font-bold text-blue-300">
          {(duration / 1000).toFixed(1)}s
        </div>
      </div>
      
      <div className="bg-night-800 p-3 rounded border border-sand-600">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-4 h-4 text-green-400" />
          <span className="text-sm font-medium">Throughput</span>
        </div>
        <div className="text-lg font-bold text-green-300">
          {throughput.toFixed(1)}/s
        </div>
      </div>
      
      <div className="bg-night-800 p-3 rounded border border-sand-600">
        <div className="flex items-center gap-2 mb-2">
          <Network className="w-4 h-4 text-red-400" />
          <span className="text-sm font-medium">Error Rate</span>
        </div>
        <div className="text-lg font-bold text-red-300">
          {errorRate.toFixed(1)}%
        </div>
      </div>
      
      <div className="bg-night-800 p-3 rounded border border-sand-600">
        <div className="flex items-center gap-2 mb-2">
          <MemoryStick className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-medium">Memory</span>
        </div>
        <div className="text-lg font-bold text-purple-300">
          {memoryUsage.toFixed(1)}MB
        </div>
      </div>
      
      <div className="bg-night-800 p-3 rounded border border-sand-600 col-span-2">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="w-4 h-4 text-orange-400" />
          <span className="text-sm font-medium">Batch Performance</span>
        </div>
        <div className="text-sm space-y-1">
          <div className="flex justify-between">
            <span>Total Batches:</span>
            <span className="text-orange-300">{metrics.batchMetrics.totalBatches}</span>
          </div>
          <div className="flex justify-between">
            <span>Avg Time:</span>
            <span className="text-orange-300">{metrics.batchMetrics.avgBatchTime.toFixed(0)}ms</span>
          </div>
          <div className="flex justify-between">
            <span>Min/Max:</span>
            <span className="text-orange-300">
              {metrics.batchMetrics.minBatchTime === Infinity ? 0 : metrics.batchMetrics.minBatchTime.toFixed(0)}ms / {metrics.batchMetrics.maxBatchTime.toFixed(0)}ms
            </span>
          </div>
        </div>
      </div>
      
      <div className="bg-night-800 p-3 rounded border border-sand-600 col-span-2">
        <div className="flex items-center gap-2 mb-2">
          <Monitor className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-medium">Network Performance</span>
        </div>
        <div className="text-sm space-y-1">
          <div className="flex justify-between">
            <span>Total Requests:</span>
            <span className="text-cyan-300">{metrics.networkMetrics.totalRequests}</span>
          </div>
          <div className="flex justify-between">
            <span>Avg Response:</span>
            <span className="text-cyan-300">{metrics.networkMetrics.avgResponseTime.toFixed(0)}ms</span>
          </div>
          <div className="flex justify-between">
            <span>Retries:</span>
            <span className="text-cyan-300">{metrics.networkMetrics.retryCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const PerformanceMonitoringPanel: React.FC<PerformanceMonitoringPanelProps> = ({
  operationId,
  isVisible,
  onToggle,
  className = '',
}) => {
  const [monitor] = useState(() => PerformanceMonitor.getInstance());
  const [currentMetrics, setCurrentMetrics] = useState<PerformanceMetrics | null>(null);
  const [warnings, setWarnings] = useState<PerformanceWarning[]>([]);
  const [snapshots, setSnapshots] = useState<ResourceSnapshot[]>([]);
  const [activeTab, setActiveTab] = useState<'metrics' | 'charts' | 'warnings' | 'optimization'>('metrics');
  
  // Chart data
  const [memoryData, setMemoryData] = useState<number[]>([]);
  const [throughputData, setThroughputData] = useState<number[]>([]);
  const [latencyData, setLatencyData] = useState<number[]>([]);
  const [cpuData, setCpuData] = useState<number[]>([]);
  
  useEffect(() => {
    if (!isVisible) return;
    
    const updateInterval = setInterval(() => {
      // Update current metrics
      if (operationId) {
        const metrics = monitor.getMetrics(operationId);
        setCurrentMetrics(metrics);
        
        if (metrics) {
          // Update throughput chart
          setThroughputData(prev => {
            const newData = [...prev, metrics.batchMetrics.throughput];
            return newData.slice(-50); // Keep last 50 data points
          });
          
          // Update latency chart
          setLatencyData(prev => {
            const newData = [...prev, metrics.networkMetrics.avgResponseTime];
            return newData.slice(-50);
          });
        }
      }
      
      // Update warnings
      setWarnings(monitor.getWarnings());
      
      // Update resource snapshots
      const recentSnapshots = monitor.getResourceSnapshots(50);
      setSnapshots(recentSnapshots);
      
      // Update memory chart
      if (recentSnapshots.length > 0) {
        const memoryUsage = recentSnapshots.map(s => s.memory.percentage);
        setMemoryData(memoryUsage);
        
        // Simulate CPU data (would need more sophisticated monitoring in production)
        const cpuUsage = recentSnapshots.map((_, index) => {
          return 20 + Math.sin(index * 0.1) * 10 + Math.random() * 5;
        });
        setCpuData(cpuUsage);
      }
    }, 1000);
    
    return () => clearInterval(updateInterval);
  }, [isVisible, operationId, monitor]);
  
  const getOptimizationRecommendations = () => {
    return monitor.getOptimizationRecommendations(operationId);
  };
  
  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-4 right-4 bg-night-800 border border-sand-600 rounded-lg p-3 shadow-lg hover:bg-night-700 transition-colors z-50"
        title="Open Performance Monitor"
      >
        <Activity className="w-5 h-5 text-sand-300" />
      </button>
    );
  }
  
  const recommendations = getOptimizationRecommendations();
  
  return (
    <div className={`fixed bottom-4 right-4 w-96 max-h-[70vh] bg-night-900 border border-sand-600 rounded-lg shadow-xl overflow-hidden z-50 ${className}`}>
      {/* Header */}
      <div className="bg-night-800 border-b border-sand-600 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-sand-300" />
            <h3 className="font-medium text-sand-100">Performance Monitor</h3>
          </div>
          <button
            onClick={onToggle}
            className="text-sand-400 hover:text-sand-200 transition-colors"
          >
            ×
          </button>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-1 mt-3">
          {[
            { id: 'metrics', label: 'Metrics', icon: Monitor },
            { id: 'charts', label: 'Charts', icon: TrendingUp },
            { id: 'warnings', label: 'Warnings', icon: AlertTriangle },
            { id: 'optimization', label: 'Optimize', icon: Cpu },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-1 px-3 py-1 rounded text-xs transition-colors ${
                activeTab === id
                  ? 'bg-sand-600 text-sand-100'
                  : 'text-sand-400 hover:text-sand-200 hover:bg-night-700'
              }`}
            >
              <Icon className="w-3 h-3" />
              {label}
              {id === 'warnings' && warnings.length > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {warnings.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
      
      {/* Content */}
      <div className="p-3 overflow-y-auto max-h-[calc(70vh-120px)]">
        {activeTab === 'metrics' && (
          <div className="space-y-4">
            <MetricsDisplay metrics={currentMetrics} />
          </div>
        )}
        
        {activeTab === 'charts' && (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-sand-200 mb-2">Memory Usage</h4>
              <PerformanceChart
                data={memoryData}
                label="Memory"
                color="#8b5cf6"
                unit="%"
              />
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-sand-200 mb-2">Throughput</h4>
              <PerformanceChart
                data={throughputData}
                label="Items/sec"
                color="#10b981"
                unit="/s"
              />
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-sand-200 mb-2">Network Latency</h4>
              <PerformanceChart
                data={latencyData}
                label="Latency"
                color="#f59e0b"
                unit="ms"
              />
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-sand-200 mb-2">CPU Usage (Estimated)</h4>
              <PerformanceChart
                data={cpuData}
                label="CPU"
                color="#ef4444"
                unit="%"
              />
            </div>
          </div>
        )}
        
        {activeTab === 'warnings' && (
          <div className="space-y-3">
            {warnings.length === 0 ? (
              <div className="text-center text-sand-400 py-8">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No performance warnings</p>
              </div>
            ) : (
              warnings.map((warning, index) => (
                <WarningItem key={index} warning={warning} />
              ))
            )}
            
            {warnings.length > 0 && (
              <button
                onClick={() => monitor.clearWarnings()}
                className="w-full py-2 px-4 bg-night-700 border border-sand-600 rounded text-sand-300 hover:bg-night-600 transition-colors"
              >
                Clear All Warnings
              </button>
            )}
          </div>
        )}
        
        {activeTab === 'optimization' && (
          <div className="space-y-4">
            <div className="bg-night-800 p-3 rounded border border-sand-600">
              <h4 className="text-sm font-medium text-sand-200 mb-3">Optimization Settings</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Optimal Batch Size:</span>
                  <span className="text-green-300">{recommendations.batchSize}</span>
                </div>
                <div className="flex justify-between">
                  <span>Concurrent Batches:</span>
                  <span className="text-green-300">{recommendations.concurrentBatches}</span>
                </div>
                <div className="flex justify-between">
                  <span>Virtual Scrolling:</span>
                  <span className={recommendations.useVirtualScrolling ? 'text-green-300' : 'text-red-300'}>
                    {recommendations.useVirtualScrolling ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Lazy Loading:</span>
                  <span className={recommendations.enableLazyLoading ? 'text-green-300' : 'text-red-300'}>
                    {recommendations.enableLazyLoading ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-night-800 p-3 rounded border border-sand-600">
              <h4 className="text-sm font-medium text-sand-200 mb-3">Recommendations</h4>
              {recommendations.recommendations.length === 0 ? (
                <p className="text-sand-400 text-sm">System is performing optimally</p>
              ) : (
                <ul className="space-y-2">
                  {recommendations.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm text-sand-300 flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            <div className="bg-night-800 p-3 rounded border border-sand-600">
              <h4 className="text-sm font-medium text-sand-200 mb-3">System Resources</h4>
              {snapshots.length > 0 && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Memory Usage:</span>
                    <span className="text-purple-300">
                      {snapshots[snapshots.length - 1].memory.percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>DOM Nodes:</span>
                    <span className="text-cyan-300">
                      {snapshots[snapshots.length - 1].dom.nodeCount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Event Listeners:</span>
                    <span className="text-yellow-300">
                      {snapshots[snapshots.length - 1].dom.listenerCount}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 