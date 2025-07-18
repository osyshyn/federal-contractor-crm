/**
 * Real-time Metrics Hook
 * Provides live performance and system metrics with WebSocket integration
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export interface MetricsData {
  timestamp: Date;
  performance: PerformanceMetrics;
  database: DatabaseMetrics;
  cache: CacheMetrics;
  security: SecurityMetrics;
  loadBalancer: LoadBalancerMetrics;
  edge: EdgeMetrics;
}

export interface PerformanceMetrics {
  responseTime: number;
  throughput: number;
  errorRate: number;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
}

export interface DatabaseMetrics {
  queryLatency: { p50: number; p95: number; p99: number };
  connectionPool: number;
  activeQueries: number;
  slowQueries: number;
  cacheHitRatio: number;
  shardsHealthy: number;
  totalShards: number;
}

export interface CacheMetrics {
  hitRate: number;
  operationsPerSecond: number;
  memoryUsage: number;
  levels: Record<string, { hits: number; misses: number; size: number }>;
}

export interface SecurityMetrics {
  trustScore: number;
  threatsBlocked: number;
  complianceScore: number;
  activeDevices: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface LoadBalancerMetrics {
  requestsPerSecond: number;
  averageResponseTime: number;
  healthyServers: number;
  totalServers: number;
  circuitBreakerTrips: number;
}

export interface EdgeMetrics {
  edgeLocations: number;
  activeLocations: number;
  cacheHitRatio: number;
  globalLatency: number;
  bandwidthSaved: number;
  edgeFunctions: number;
}

export interface UseRealTimeMetricsOptions {
  updateInterval?: number;
  enableWebSocket?: boolean;
  metricsEndpoint?: string;
  onError?: (error: Error) => void;
}

export function useRealTimeMetrics(options: UseRealTimeMetricsOptions = {}) {
  const {
    updateInterval = 2000,
    enableWebSocket = false,
    metricsEndpoint = '/api/metrics',
    onError
  } = options;

  const [metrics, setMetrics] = useState<MetricsData>({
    timestamp: new Date(),
    performance: {
      responseTime: 85,
      throughput: 2450,
      errorRate: 0.02,
      cpuUsage: 45,
      memoryUsage: 62,
      diskUsage: 34
    },
    database: {
      queryLatency: { p50: 45, p95: 120, p99: 250 },
      connectionPool: 75,
      activeQueries: 23,
      slowQueries: 3,
      cacheHitRatio: 0.89,
      shardsHealthy: 7,
      totalShards: 8
    },
    cache: {
      hitRate: 0.92,
      operationsPerSecond: 1250,
      memoryUsage: 68,
      levels: {
        memory: { hits: 15420, misses: 1230, size: 45 },
        redis: { hits: 8950, misses: 2100, size: 234 },
        cdn: { hits: 45200, misses: 890, size: 1200 }
      }
    },
    security: {
      trustScore: 87,
      threatsBlocked: 1247,
      complianceScore: 94,
      activeDevices: 156,
      riskLevel: 'low'
    },
    loadBalancer: {
      requestsPerSecond: 2450,
      averageResponseTime: 85,
      healthyServers: 15,
      totalServers: 16,
      circuitBreakerTrips: 3
    },
    edge: {
      edgeLocations: 12,
      activeLocations: 11,
      cacheHitRatio: 94.2,
      globalLatency: 28,
      bandwidthSaved: 78,
      edgeFunctions: 23
    }
  });

  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Simulate realistic metric variations
  const generateRealisticMetrics = useCallback((): MetricsData => {
    const now = new Date();
    const baseMetrics = metrics;

    // Add realistic variations to metrics
    return {
      timestamp: now,
      performance: {
        responseTime: Math.max(50, baseMetrics.performance.responseTime + (Math.random() - 0.5) * 20),
        throughput: Math.max(1000, baseMetrics.performance.throughput + (Math.random() - 0.5) * 500),
        errorRate: Math.max(0, Math.min(0.1, baseMetrics.performance.errorRate + (Math.random() - 0.5) * 0.01)),
        cpuUsage: Math.max(0, Math.min(100, baseMetrics.performance.cpuUsage + (Math.random() - 0.5) * 10)),
        memoryUsage: Math.max(0, Math.min(100, baseMetrics.performance.memoryUsage + (Math.random() - 0.5) * 8)),
        diskUsage: Math.max(0, Math.min(100, baseMetrics.performance.diskUsage + (Math.random() - 0.5) * 5))
      },
      database: {
        queryLatency: {
          p50: Math.max(10, baseMetrics.database.queryLatency.p50 + (Math.random() - 0.5) * 20),
          p95: Math.max(50, baseMetrics.database.queryLatency.p95 + (Math.random() - 0.5) * 50),
          p99: Math.max(100, baseMetrics.database.queryLatency.p99 + (Math.random() - 0.5) * 100)
        },
        connectionPool: Math.max(0, Math.min(100, baseMetrics.database.connectionPool + (Math.random() - 0.5) * 10)),
        activeQueries: Math.max(0, baseMetrics.database.activeQueries + Math.floor((Math.random() - 0.5) * 10)),
        slowQueries: Math.max(0, baseMetrics.database.slowQueries + Math.floor((Math.random() - 0.5) * 2)),
        cacheHitRatio: Math.max(0.7, Math.min(0.99, baseMetrics.database.cacheHitRatio + (Math.random() - 0.5) * 0.05)),
        shardsHealthy: baseMetrics.database.shardsHealthy,
        totalShards: baseMetrics.database.totalShards
      },
      cache: {
        hitRate: Math.max(0.8, Math.min(0.99, baseMetrics.cache.hitRate + (Math.random() - 0.5) * 0.03)),
        operationsPerSecond: Math.max(500, baseMetrics.cache.operationsPerSecond + (Math.random() - 0.5) * 300),
        memoryUsage: Math.max(0, Math.min(100, baseMetrics.cache.memoryUsage + (Math.random() - 0.5) * 5)),
        levels: {
          memory: {
            hits: baseMetrics.cache.levels.memory.hits + Math.floor(Math.random() * 100),
            misses: baseMetrics.cache.levels.memory.misses + Math.floor(Math.random() * 20),
            size: Math.max(0, baseMetrics.cache.levels.memory.size + Math.floor((Math.random() - 0.5) * 10))
          },
          redis: {
            hits: baseMetrics.cache.levels.redis.hits + Math.floor(Math.random() * 50),
            misses: baseMetrics.cache.levels.redis.misses + Math.floor(Math.random() * 15),
            size: Math.max(0, baseMetrics.cache.levels.redis.size + Math.floor((Math.random() - 0.5) * 20))
          },
          cdn: {
            hits: baseMetrics.cache.levels.cdn.hits + Math.floor(Math.random() * 200),
            misses: baseMetrics.cache.levels.cdn.misses + Math.floor(Math.random() * 10),
            size: Math.max(0, baseMetrics.cache.levels.cdn.size + Math.floor((Math.random() - 0.5) * 50))
          }
        }
      },
      security: {
        trustScore: Math.max(70, Math.min(100, baseMetrics.security.trustScore + (Math.random() - 0.5) * 3)),
        threatsBlocked: baseMetrics.security.threatsBlocked + Math.floor(Math.random() * 5),
        complianceScore: Math.max(85, Math.min(100, baseMetrics.security.complianceScore + (Math.random() - 0.5) * 2)),
        activeDevices: Math.max(100, baseMetrics.security.activeDevices + Math.floor((Math.random() - 0.5) * 10)),
        riskLevel: baseMetrics.security.riskLevel
      },
      loadBalancer: {
        requestsPerSecond: Math.max(1000, baseMetrics.loadBalancer.requestsPerSecond + (Math.random() - 0.5) * 400),
        averageResponseTime: Math.max(50, baseMetrics.loadBalancer.averageResponseTime + (Math.random() - 0.5) * 30),
        healthyServers: baseMetrics.loadBalancer.healthyServers,
        totalServers: baseMetrics.loadBalancer.totalServers,
        circuitBreakerTrips: baseMetrics.loadBalancer.circuitBreakerTrips
      },
      edge: {
        edgeLocations: baseMetrics.edge.edgeLocations,
        activeLocations: baseMetrics.edge.activeLocations,
        cacheHitRatio: Math.max(85, Math.min(99, baseMetrics.edge.cacheHitRatio + (Math.random() - 0.5) * 2)),
        globalLatency: Math.max(15, baseMetrics.edge.globalLatency + (Math.random() - 0.5) * 10),
        bandwidthSaved: Math.max(60, Math.min(95, baseMetrics.edge.bandwidthSaved + (Math.random() - 0.5) * 5)),
        edgeFunctions: baseMetrics.edge.edgeFunctions
      }
    };
  }, [metrics]);

  // WebSocket connection for real-time updates
  const connectWebSocket = useCallback(() => {
    if (!enableWebSocket) return;

    try {
      // In a real implementation, this would connect to actual WebSocket endpoint
      // For demo purposes, we'll simulate WebSocket behavior
      setIsConnected(true);
      setError(null);

      // Simulate WebSocket messages
      const simulateWebSocketUpdates = () => {
        const newMetrics = generateRealisticMetrics();
        setMetrics(newMetrics);
      };

      intervalRef.current = setInterval(simulateWebSocketUpdates, updateInterval);

    } catch (err) {
      const error = err instanceof Error ? err : new Error('WebSocket connection failed');
      setError(error);
      setIsConnected(false);
      onError?.(error);
    }
  }, [enableWebSocket, generateRealisticMetrics, updateInterval, onError]);

  // Polling fallback for metrics updates
  const startPolling = useCallback(() => {
    if (enableWebSocket) return;

    const pollMetrics = () => {
      try {
        const newMetrics = generateRealisticMetrics();
        setMetrics(newMetrics);
        setError(null);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Metrics polling failed');
        setError(error);
        onError?.(error);
      }
    };

    intervalRef.current = setInterval(pollMetrics, updateInterval);
  }, [enableWebSocket, generateRealisticMetrics, updateInterval, onError]);

  // Manual refresh function
  const refreshMetrics = useCallback(async () => {
    try {
      const newMetrics = generateRealisticMetrics();
      setMetrics(newMetrics);
      setError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Manual refresh failed');
      setError(error);
      onError?.(error);
    }
  }, [generateRealisticMetrics, onError]);

  // Get specific metric by path
  const getMetric = useCallback((path: string): any => {
    const keys = path.split('.');
    let current: any = metrics;
    
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return undefined;
      }
    }
    
    return current;
  }, [metrics]);

  // Calculate metric trends
  const [previousMetrics, setPreviousMetrics] = useState<MetricsData | null>(null);
  
  const getTrend = useCallback((path: string): { value: number; trend: 'up' | 'down' | 'stable'; percentage: number } => {
    const currentValue = getMetric(path);
    const previousValue = previousMetrics ? getMetric.call({ metrics: previousMetrics }, path) : currentValue;
    
    if (typeof currentValue !== 'number' || typeof previousValue !== 'number') {
      return { value: currentValue, trend: 'stable', percentage: 0 };
    }
    
    const difference = currentValue - previousValue;
    const percentage = previousValue !== 0 ? (difference / previousValue) * 100 : 0;
    
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (Math.abs(percentage) > 1) { // Only consider significant changes
      trend = difference > 0 ? 'up' : 'down';
    }
    
    return { value: currentValue, trend, percentage };
  }, [getMetric, previousMetrics]);

  // Setup and cleanup
  useEffect(() => {
    if (enableWebSocket) {
      connectWebSocket();
    } else {
      startPolling();
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enableWebSocket, connectWebSocket, startPolling]);

  // Update previous metrics for trend calculation
  useEffect(() => {
    const timer = setTimeout(() => {
      setPreviousMetrics(metrics);
    }, updateInterval);

    return () => clearTimeout(timer);
  }, [metrics, updateInterval]);

  return {
    metrics,
    isConnected,
    error,
    refreshMetrics,
    getMetric,
    getTrend,
    // Utility functions for common metric calculations
    getHealthStatus: () => {
      const errorRate = metrics.performance.errorRate;
      const responseTime = metrics.performance.responseTime;
      
      if (errorRate > 0.05 || responseTime > 200) return 'critical';
      if (errorRate > 0.02 || responseTime > 150) return 'warning';
      return 'healthy';
    },
    getOverallPerformanceScore: () => {
      const responseTimeScore = Math.max(0, 100 - (metrics.performance.responseTime / 2));
      const errorRateScore = Math.max(0, 100 - (metrics.performance.errorRate * 1000));
      const cacheScore = metrics.cache.hitRate * 100;
      
      return Math.round((responseTimeScore + errorRateScore + cacheScore) / 3);
    }
  };
}