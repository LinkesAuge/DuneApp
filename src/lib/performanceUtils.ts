/**
 * Performance Utilities for POI Linking System
 * Provides comprehensive performance monitoring, measurement, and optimization tools
 */

export interface PerformanceMetrics {
  operationId: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  memoryStart: number;
  memoryEnd?: number;
  memoryDelta?: number;
  cpuIntensive: boolean;
  batchMetrics: {
    totalBatches: number;
    avgBatchTime: number;
    minBatchTime: number;
    maxBatchTime: number;
    batchSizes: number[];
    throughput: number; // items per second
  };
  networkMetrics: {
    totalRequests: number;
    avgResponseTime: number;
    errorRate: number;
    retryCount: number;
  };
  uiMetrics: {
    renderTime: number;
    interactionLatency: number;
    memoryLeaks: boolean;
  };
}

export interface ResourceSnapshot {
  timestamp: number;
  memory: {
    used: number;
    total: number;
    limit: number;
    percentage: number;
  };
  performance: {
    timing: number;
    navigation: number;
  };
  dom: {
    nodeCount: number;
    listenerCount: number;
  };
}

export interface OptimizationConfig {
  maxBatchSize: number;
  minBatchSize: number;
  concurrentBatches: number;
  memoryThreshold: number; // MB
  cpuThrottling: boolean;
  adaptiveBatching: boolean;
  virtualScrolling: boolean;
  lazyLoading: boolean;
}

export interface PerformanceWarning {
  type: 'memory' | 'cpu' | 'network' | 'ui' | 'batch';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  suggestedAction: string;
  threshold: number;
  currentValue: number;
}

/**
 * Performance Monitor Class
 * Tracks and analyzes performance metrics in real-time
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, PerformanceMetrics> = new Map();
  private snapshots: ResourceSnapshot[] = [];
  private warnings: PerformanceWarning[] = [];
  private observers: PerformanceObserver[] = [];
  private config: OptimizationConfig;

  private constructor() {
    this.config = this.getDefaultConfig();
    this.initializeObservers();
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private getDefaultConfig(): OptimizationConfig {
    return {
      maxBatchSize: 1000,
      minBatchSize: 10,
      concurrentBatches: 3,
      memoryThreshold: 100, // 100MB
      cpuThrottling: true,
      adaptiveBatching: true,
      virtualScrolling: true,
      lazyLoading: true,
    };
  }

  private initializeObservers(): void {
    // Performance Observer for measuring rendering and network
    try {
      const perfObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'measure' && entry.name.startsWith('poi-linking-')) {
            this.recordMeasurement(entry.name, entry.duration);
          }
        });
      });
      
      perfObserver.observe({ entryTypes: ['measure', 'navigation', 'resource'] });
      this.observers.push(perfObserver);
    } catch (error) {
      console.warn('Performance Observer not supported:', error);
    }
  }

  /**
   * Start monitoring a new operation
   */
  startOperation(operationId: string, cpuIntensive: boolean = false): void {
    const snapshot = this.takeResourceSnapshot();
    
    const metrics: PerformanceMetrics = {
      operationId,
      startTime: performance.now(),
      memoryStart: snapshot.memory.used,
      cpuIntensive,
      batchMetrics: {
        totalBatches: 0,
        avgBatchTime: 0,
        minBatchTime: Infinity,
        maxBatchTime: 0,
        batchSizes: [],
        throughput: 0,
      },
      networkMetrics: {
        totalRequests: 0,
        avgResponseTime: 0,
        errorRate: 0,
        retryCount: 0,
      },
      uiMetrics: {
        renderTime: 0,
        interactionLatency: 0,
        memoryLeaks: false,
      },
    };

    this.metrics.set(operationId, metrics);
    performance.mark(`poi-linking-${operationId}-start`);
  }

  /**
   * Record batch completion
   */
  recordBatch(operationId: string, batchSize: number, duration: number): void {
    const metrics = this.metrics.get(operationId);
    if (!metrics) return;

    metrics.batchMetrics.totalBatches++;
    metrics.batchMetrics.batchSizes.push(batchSize);
    metrics.batchMetrics.minBatchTime = Math.min(metrics.batchMetrics.minBatchTime, duration);
    metrics.batchMetrics.maxBatchTime = Math.max(metrics.batchMetrics.maxBatchTime, duration);
    
    const totalTime = metrics.batchMetrics.avgBatchTime * (metrics.batchMetrics.totalBatches - 1) + duration;
    metrics.batchMetrics.avgBatchTime = totalTime / metrics.batchMetrics.totalBatches;
    
    const totalItems = metrics.batchMetrics.batchSizes.reduce((sum, size) => sum + size, 0);
    const elapsedTime = (performance.now() - metrics.startTime) / 1000; // Convert to seconds
    metrics.batchMetrics.throughput = totalItems / elapsedTime;

    // Check for performance warnings
    this.checkBatchPerformance(operationId, duration, batchSize);
  }

  /**
   * Record network request
   */
  recordNetworkRequest(operationId: string, duration: number, success: boolean, isRetry: boolean = false): void {
    const metrics = this.metrics.get(operationId);
    if (!metrics) return;

    metrics.networkMetrics.totalRequests++;
    if (isRetry) metrics.networkMetrics.retryCount++;
    
    const totalTime = metrics.networkMetrics.avgResponseTime * (metrics.networkMetrics.totalRequests - 1) + duration;
    metrics.networkMetrics.avgResponseTime = totalTime / metrics.networkMetrics.totalRequests;
    
    if (!success) {
      metrics.networkMetrics.errorRate = (metrics.networkMetrics.errorRate * (metrics.networkMetrics.totalRequests - 1) + 1) / metrics.networkMetrics.totalRequests;
    }

    // Check for network performance warnings
    this.checkNetworkPerformance(operationId, duration, success);
  }

  /**
   * Complete operation monitoring
   */
  completeOperation(operationId: string): PerformanceMetrics | null {
    const metrics = this.metrics.get(operationId);
    if (!metrics) return null;

    performance.mark(`poi-linking-${operationId}-end`);
    performance.measure(`poi-linking-${operationId}`, `poi-linking-${operationId}-start`, `poi-linking-${operationId}-end`);

    const endSnapshot = this.takeResourceSnapshot();
    
    metrics.endTime = performance.now();
    metrics.duration = metrics.endTime - metrics.startTime;
    metrics.memoryEnd = endSnapshot.memory.used;
    metrics.memoryDelta = metrics.memoryEnd - metrics.memoryStart;

    // Check for memory leaks
    if (metrics.memoryDelta > this.config.memoryThreshold * 1024 * 1024) { // Convert MB to bytes
      metrics.uiMetrics.memoryLeaks = true;
      this.addWarning({
        type: 'memory',
        severity: 'high',
        message: `Operation ${operationId} used ${Math.round(metrics.memoryDelta / 1024 / 1024)}MB of memory`,
        suggestedAction: 'Consider implementing memory cleanup or reducing batch sizes',
        threshold: this.config.memoryThreshold,
        currentValue: metrics.memoryDelta / 1024 / 1024,
      });
    }

    // Final performance analysis
    this.analyzeOverallPerformance(operationId);

    return metrics;
  }

  /**
   * Take a snapshot of current resource usage
   */
  private takeResourceSnapshot(): ResourceSnapshot {
    const memInfo = (performance as any).memory || {
      usedJSHeapSize: 0,
      totalJSHeapSize: 0,
      jsHeapSizeLimit: 0,
    };

    const snapshot: ResourceSnapshot = {
      timestamp: Date.now(),
      memory: {
        used: memInfo.usedJSHeapSize || 0,
        total: memInfo.totalJSHeapSize || 0,
        limit: memInfo.jsHeapSizeLimit || 0,
        percentage: memInfo.jsHeapSizeLimit ? (memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit) * 100 : 0,
      },
      performance: {
        timing: performance.now(),
        navigation: (performance.navigation && performance.navigation.type) || 0,
      },
      dom: {
        nodeCount: document.querySelectorAll('*').length,
        listenerCount: this.estimateEventListeners(),
      },
    };

    this.snapshots.push(snapshot);
    
    // Keep only last 100 snapshots
    if (this.snapshots.length > 100) {
      this.snapshots.shift();
    }

    return snapshot;
  }

  private estimateEventListeners(): number {
    // Rough estimation of event listeners
    const elements = document.querySelectorAll('*');
    let count = 0;
    
    elements.forEach((element) => {
      // Check for common event attributes
      const eventAttrs = ['onclick', 'onchange', 'onsubmit', 'onload', 'onmouseover'];
      eventAttrs.forEach((attr) => {
        if (element.hasAttribute(attr)) count++;
      });
    });
    
    return count;
  }

  private recordMeasurement(name: string, duration: number): void {
    // Extract operation ID from measurement name
    const operationMatch = name.match(/poi-linking-(.+)$/);
    if (operationMatch) {
      const operationId = operationMatch[1];
      const metrics = this.metrics.get(operationId);
      if (metrics) {
        metrics.uiMetrics.renderTime = duration;
      }
    }
  }

  private checkBatchPerformance(operationId: string, duration: number, batchSize: number): void {
    const slowBatchThreshold = 5000; // 5 seconds
    
    if (duration > slowBatchThreshold) {
      this.addWarning({
        type: 'batch',
        severity: duration > 10000 ? 'high' : 'medium',
        message: `Batch processing is slow: ${Math.round(duration)}ms for ${batchSize} items`,
        suggestedAction: 'Consider reducing batch size or optimizing database queries',
        threshold: slowBatchThreshold,
        currentValue: duration,
      });
    }
  }

  private checkNetworkPerformance(operationId: string, duration: number, success: boolean): void {
    const slowNetworkThreshold = 3000; // 3 seconds
    
    if (duration > slowNetworkThreshold) {
      this.addWarning({
        type: 'network',
        severity: 'medium',
        message: `Slow network request: ${Math.round(duration)}ms`,
        suggestedAction: 'Check network connection or server performance',
        threshold: slowNetworkThreshold,
        currentValue: duration,
      });
    }

    if (!success) {
      this.addWarning({
        type: 'network',
        severity: 'high',
        message: 'Network request failed',
        suggestedAction: 'Check connectivity and retry logic',
        threshold: 0,
        currentValue: 1,
      });
    }
  }

  private analyzeOverallPerformance(operationId: string): void {
    const metrics = this.metrics.get(operationId);
    if (!metrics || !metrics.duration) return;

    // Check overall operation performance
    const slowOperationThreshold = 30000; // 30 seconds
    if (metrics.duration > slowOperationThreshold) {
      this.addWarning({
        type: 'cpu',
        severity: 'high',
        message: `Operation took ${Math.round(metrics.duration / 1000)}s to complete`,
        suggestedAction: 'Consider breaking operation into smaller chunks or using background processing',
        threshold: slowOperationThreshold / 1000,
        currentValue: metrics.duration / 1000,
      });
    }

    // Check throughput
    if (metrics.batchMetrics.throughput < 10) { // Less than 10 items per second
      this.addWarning({
        type: 'batch',
        severity: 'medium',
        message: `Low throughput: ${Math.round(metrics.batchMetrics.throughput)} items/second`,
        suggestedAction: 'Optimize batch processing or increase batch sizes',
        threshold: 10,
        currentValue: metrics.batchMetrics.throughput,
      });
    }
  }

  private addWarning(warning: PerformanceWarning): void {
    this.warnings.push(warning);
    
    // Keep only last 50 warnings
    if (this.warnings.length > 50) {
      this.warnings.shift();
    }
  }

  /**
   * Get optimization recommendations based on current metrics
   */
  getOptimizationRecommendations(operationId?: string): {
    batchSize: number;
    concurrentBatches: number;
    useVirtualScrolling: boolean;
    enableLazyLoading: boolean;
    recommendations: string[];
  } {
    const recommendations: string[] = [];
    let optimalBatchSize = this.config.maxBatchSize;
    let optimalConcurrency = this.config.concurrentBatches;

    if (operationId) {
      const metrics = this.metrics.get(operationId);
      if (metrics) {
        // Analyze batch performance
        if (metrics.batchMetrics.avgBatchTime > 5000) { // > 5 seconds
          optimalBatchSize = Math.max(this.config.minBatchSize, Math.floor(optimalBatchSize * 0.7));
          recommendations.push('Reduce batch size due to slow processing');
        }

        // Analyze memory usage
        if (metrics.memoryDelta && metrics.memoryDelta > 50 * 1024 * 1024) { // > 50MB
          optimalBatchSize = Math.max(this.config.minBatchSize, Math.floor(optimalBatchSize * 0.5));
          recommendations.push('Reduce batch size due to high memory usage');
        }

        // Analyze error rate
        if (metrics.networkMetrics.errorRate > 0.1) { // > 10% error rate
          optimalConcurrency = Math.max(1, Math.floor(optimalConcurrency * 0.5));
          recommendations.push('Reduce concurrency due to high error rate');
        }
      }
    }

    // Check overall system health
    const latestSnapshot = this.snapshots[this.snapshots.length - 1];
    if (latestSnapshot) {
      if (latestSnapshot.memory.percentage > 80) {
        recommendations.push('Enable virtual scrolling due to high memory usage');
        recommendations.push('Enable lazy loading to reduce memory footprint');
      }
    }

    return {
      batchSize: optimalBatchSize,
      concurrentBatches: optimalConcurrency,
      useVirtualScrolling: this.config.virtualScrolling || latestSnapshot?.memory.percentage > 70,
      enableLazyLoading: this.config.lazyLoading || latestSnapshot?.memory.percentage > 60,
      recommendations,
    };
  }

  /**
   * Get all metrics for an operation
   */
  getMetrics(operationId: string): PerformanceMetrics | null {
    return this.metrics.get(operationId) || null;
  }

  /**
   * Get all current warnings
   */
  getWarnings(): PerformanceWarning[] {
    return [...this.warnings];
  }

  /**
   * Clear warnings
   */
  clearWarnings(): void {
    this.warnings = [];
  }

  /**
   * Get recent resource snapshots
   */
  getResourceSnapshots(count: number = 10): ResourceSnapshot[] {
    return this.snapshots.slice(-count);
  }

  /**
   * Export performance data for analysis
   */
  exportPerformanceData(): {
    metrics: PerformanceMetrics[];
    snapshots: ResourceSnapshot[];
    warnings: PerformanceWarning[];
    config: OptimizationConfig;
  } {
    return {
      metrics: Array.from(this.metrics.values()),
      snapshots: this.snapshots,
      warnings: this.warnings,
      config: this.config,
    };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<OptimizationConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.metrics.clear();
    this.snapshots = [];
    this.warnings = [];
  }
}

/**
 * Utility functions for performance optimization
 */

export function measureAsyncOperation<T>(
  operationName: string,
  operation: () => Promise<T>
): Promise<{ result: T; duration: number; memoryDelta: number }> {
  return new Promise(async (resolve, reject) => {
    const monitor = PerformanceMonitor.getInstance();
    const operationId = `${operationName}-${Date.now()}`;
    
    try {
      monitor.startOperation(operationId);
      const result = await operation();
      const metrics = monitor.completeOperation(operationId);
      
      resolve({
        result,
        duration: metrics?.duration || 0,
        memoryDelta: metrics?.memoryDelta || 0,
      });
    } catch (error) {
      monitor.completeOperation(operationId);
      reject(error);
    }
  });
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

export function createBatchProcessor<T>(
  items: T[],
  batchSize: number,
  processor: (batch: T[]) => Promise<void>,
  onProgress?: (processed: number, total: number) => void
): Promise<void> {
  return new Promise(async (resolve, reject) => {
    const monitor = PerformanceMonitor.getInstance();
    const operationId = `batch-process-${Date.now()}`;
    
    monitor.startOperation(operationId, true);
    
    try {
      let processed = 0;
      
      for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, Math.min(i + batchSize, items.length));
        const batchStart = performance.now();
        
        await processor(batch);
        
        const batchDuration = performance.now() - batchStart;
        monitor.recordBatch(operationId, batch.length, batchDuration);
        
        processed += batch.length;
        onProgress?.(processed, items.length);
        
        // Allow UI to update between batches
        await new Promise(resolve => setTimeout(resolve, 0));
      }
      
      monitor.completeOperation(operationId);
      resolve();
    } catch (error) {
      monitor.completeOperation(operationId);
      reject(error);
    }
  });
}

export const performanceUtils = {
  monitor: PerformanceMonitor.getInstance(),
  measureAsyncOperation,
  debounce,
  throttle,
  createBatchProcessor,
}; 