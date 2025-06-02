import React, { useState, useEffect } from 'react';
import { Loader2, Clock, TrendingUp, Zap, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { PerformanceMonitor, performanceUtils } from '../../lib/performanceUtils';

interface ProgressMetrics {
  completed: number;
  total: number;
  currentBatch: number;
  totalBatches: number;
  throughput: number; // items per second
  eta: number; // estimated time remaining in seconds
  elapsedTime: number;
  avgBatchTime: number;
  memoryUsage: number; // MB
  errorCount: number;
  retryCount: number;
}

interface EnhancedProgressIndicatorProps {
  operationId?: string;
  completed: number;
  total: number;
  status: 'idle' | 'running' | 'paused' | 'completed' | 'error' | 'cancelled';
  showDetails?: boolean;
  showPerformanceMetrics?: boolean;
  className?: string;
}

const formatTime = (seconds: number): string => {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  } else if (seconds < 3600) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}m ${secs}s`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${mins}m`;
  }
};

const formatNumber = (num: number): string => {
  if (num < 1000) return num.toString();
  if (num < 1000000) return `${(num / 1000).toFixed(1)}K`;
  return `${(num / 1000000).toFixed(1)}M`;
};

const StatusIcon: React.FC<{ status: string; className?: string }> = ({ status, className = "w-4 h-4" }) => {
  switch (status) {
    case 'running':
      return <Loader2 className={`${className} animate-spin text-blue-400`} />;
    case 'paused':
      return <Clock className={`${className} text-yellow-400`} />;
    case 'completed':
      return <CheckCircle className={`${className} text-green-400`} />;
    case 'error':
      return <XCircle className={`${className} text-red-400`} />;
    case 'cancelled':
      return <AlertCircle className={`${className} text-orange-400`} />;
    default:
      return <ProgressBar className={`${className} text-sand-400`} />;
  }
};

const PerformanceMetricsDisplay: React.FC<{ 
  metrics: ProgressMetrics;
  showCompact?: boolean;
}> = ({ metrics, showCompact = false }) => {
  if (showCompact) {
    return (
      <div className="flex items-center gap-4 text-xs text-sand-400">
        <div className="flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          <span>{metrics.throughput.toFixed(1)}/s</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{formatTime(metrics.eta)}</span>
        </div>
        {metrics.memoryUsage > 0 && (
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            <span>{metrics.memoryUsage.toFixed(1)}MB</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
      <div className="bg-night-800 p-2 rounded border border-sand-700">
        <div className="flex items-center gap-1 mb-1">
          <TrendingUp className="w-3 h-3 text-green-400" />
          <span className="text-xs text-sand-300">Throughput</span>
        </div>
        <div className="text-sm font-medium text-green-300">
          {metrics.throughput.toFixed(1)} items/s
        </div>
      </div>

      <div className="bg-night-800 p-2 rounded border border-sand-700">
        <div className="flex items-center gap-1 mb-1">
          <Clock className="w-3 h-3 text-blue-400" />
          <span className="text-xs text-sand-300">ETA</span>
        </div>
        <div className="text-sm font-medium text-blue-300">
          {formatTime(metrics.eta)}
        </div>
      </div>

      <div className="bg-night-800 p-2 rounded border border-sand-700">
        <div className="flex items-center gap-1 mb-1">
          <Zap className="w-3 h-3 text-purple-400" />
          <span className="text-xs text-sand-300">Memory</span>
        </div>
        <div className="text-sm font-medium text-purple-300">
          {metrics.memoryUsage.toFixed(1)} MB
        </div>
      </div>

      <div className="bg-night-800 p-2 rounded border border-sand-700">
        <div className="flex items-center gap-1 mb-1">
          <ProgressBar className="w-3 h-3 text-orange-400" />
          <span className="text-xs text-sand-300">Avg Batch</span>
        </div>
        <div className="text-sm font-medium text-orange-300">
          {formatTime(metrics.avgBatchTime / 1000)}
        </div>
      </div>
    </div>
  );
};

export const EnhancedProgressIndicator: React.FC<EnhancedProgressIndicatorProps> = ({
  operationId,
  completed,
  total,
  status,
  showDetails = true,
  showPerformanceMetrics = true,
  className = '',
}) => {
  const [metrics, setMetrics] = useState<ProgressMetrics>({
    completed,
    total,
    currentBatch: 0,
    totalBatches: 0,
    throughput: 0,
    eta: 0,
    elapsedTime: 0,
    avgBatchTime: 0,
    memoryUsage: 0,
    errorCount: 0,
    retryCount: 0,
  });

  const [startTime] = useState(Date.now());
  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());
  const [lastCompleted, setLastCompleted] = useState(completed);

  useEffect(() => {
    const monitor = PerformanceMonitor.getInstance();
    const performanceMetrics = monitor.getMetrics(operationId);
    const now = Date.now();
    const elapsedTime = (now - startTime) / 1000; // Convert to seconds
    
    // Calculate throughput
    let throughput = 0;
    if (elapsedTime > 0) {
      throughput = completed / elapsedTime;
    }
    
    // Calculate ETA
    let eta = 0;
    if (throughput > 0 && completed < total) {
      const remaining = total - completed;
      eta = remaining / throughput;
    }
    
    // Update metrics from performance monitor if available
    let avgBatchTime = 0;
    let memoryUsage = 0;
    let errorCount = 0;
    let retryCount = 0;
    
    if (performanceMetrics) {
      avgBatchTime = performanceMetrics.batchMetrics.avgBatchTime;
      memoryUsage = performanceMetrics.memoryDelta ? Math.abs(performanceMetrics.memoryDelta) / 1024 / 1024 : 0;
      errorCount = Math.round(performanceMetrics.networkMetrics.errorRate * performanceMetrics.networkMetrics.totalRequests);
      retryCount = performanceMetrics.networkMetrics.retryCount;
    }
    
    setMetrics({
      completed,
      total,
      currentBatch: 0,
      totalBatches: 0,
      throughput,
      eta,
      elapsedTime,
      avgBatchTime,
      memoryUsage,
      errorCount,
      retryCount,
    });
    
    setLastUpdateTime(now);
    setLastCompleted(completed);
  }, [operationId, completed, total, startTime]);

  const percentage = total > 0 ? (completed / total) * 100 : 0;

  const getStatusColor = () => {
    switch (status) {
      case 'running': return 'border-blue-500 bg-blue-500/10';
      case 'paused': return 'border-yellow-500 bg-yellow-500/10';
      case 'completed': return 'border-green-500 bg-green-500/10';
      case 'error': return 'border-red-500 bg-red-500/10';
      case 'cancelled': return 'border-orange-500 bg-orange-500/10';
      default: return 'border-sand-600 bg-sand-600/10';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'running': return 'In Progress';
      case 'paused': return 'Paused';
      case 'completed': return 'Completed';
      case 'error': return 'Error Occurred';
      case 'cancelled': return 'Cancelled';
      default: return 'Idle';
    }
  };

  const showProgressDetails = showDetails && (completed > 0 || status !== 'idle');

  return (
    <div className={`border rounded-lg p-4 ${getStatusColor()} ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <StatusIcon status={status} />
          <div>
            <h3 className="font-medium text-sand-100">{getStatusText()}</h3>
            {showProgressDetails && (
              <p className="text-sm text-sand-400">
                {formatNumber(completed)} of {formatNumber(total)} items
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Progress bars */}
      {showProgressDetails && (
        <div className="space-y-3">
          {/* Main progress bar */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-sand-300">Overall Progress</span>
              <span className="text-sand-200">{percentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-night-800 rounded-full h-2 border border-sand-700">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-400 h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
          </div>

          {/* Performance metrics */}
          {showPerformanceMetrics && status === 'running' && (
            <PerformanceMetricsDisplay 
              metrics={metrics} 
              showCompact={!showDetails}
            />
          )}

          {/* Summary stats */}
          {showDetails && (status === 'running' || status === 'paused') && (
            <div className="flex justify-between text-xs text-sand-400 pt-2 border-t border-sand-700">
              <span>Elapsed: {formatTime(metrics.elapsedTime)}</span>
              {metrics.errorCount > 0 && (
                <span className="text-red-400">
                  Errors: {metrics.errorCount}
                </span>
              )}
              {metrics.retryCount > 0 && (
                <span className="text-yellow-400">
                  Retries: {metrics.retryCount}
                </span>
              )}
            </div>
          )}

          {/* Completion summary */}
          {status === 'completed' && (
            <div className="bg-green-900/20 border border-green-700 rounded p-3 mt-3">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium text-green-300">Operation Completed Successfully</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-sand-400">Total Time:</span>
                  <span className="text-green-300 ml-2">{formatTime(metrics.elapsedTime)}</span>
                </div>
                <div>
                  <span className="text-sand-400">Avg Throughput:</span>
                  <span className="text-green-300 ml-2">{metrics.throughput.toFixed(1)}/s</span>
                </div>
                {metrics.errorCount > 0 && (
                  <div className="col-span-2">
                    <span className="text-sand-400">Errors Handled:</span>
                    <span className="text-yellow-300 ml-2">{metrics.errorCount}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error summary */}
          {status === 'error' && (
            <div className="bg-red-900/20 border border-red-700 rounded p-3 mt-3">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-4 h-4 text-red-400" />
                <span className="text-sm font-medium text-red-300">Operation Failed</span>
              </div>
              <div className="text-xs text-sand-400">
                <p>Progress: {formatNumber(completed)} of {formatNumber(total)} items completed</p>
                <p>Time elapsed: {formatTime(metrics.elapsedTime)}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 