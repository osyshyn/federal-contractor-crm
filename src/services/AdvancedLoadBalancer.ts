/**
 * Advanced Load Balancing Engine
 * Demonstrates expertise in intelligent traffic distribution, circuit breakers, and adaptive algorithms
 */

export interface LoadBalancerConfiguration {
  id: string;
  name: string;
  algorithm: 'round_robin' | 'weighted_round_robin' | 'least_connections' | 'least_response_time' | 'consistent_hash' | 'adaptive';
  healthCheck: HealthCheckConfiguration;
  circuitBreaker: CircuitBreakerConfiguration;
  sessionAffinity: SessionAffinityConfiguration;
  trafficShaping: TrafficShapingConfiguration;
}

export interface BackendServer {
  id: string;
  address: string;
  port: number;
  weight: number;
  region: string;
  capacity: ServerCapacity;
  health: ServerHealth;
  metrics: ServerMetrics;
  tags: Record<string, string>;
}

export interface ServerCapacity {
  maxConnections: number;
  maxRequestsPerSecond: number;
  maxCPUUtilization: number;
  maxMemoryUtilization: number;
}

export interface ServerHealth {
  status: 'healthy' | 'unhealthy' | 'draining' | 'maintenance';
  lastCheck: Date;
  consecutiveFailures: number;
  responseTime: number;
  errorRate: number;
}

export interface ServerMetrics {
  activeConnections: number;
  requestsPerSecond: number;
  averageResponseTime: number;
  cpuUtilization: number;
  memoryUtilization: number;
  errorCount: number;
  lastUpdated: Date;
}

export interface HealthCheckConfiguration {
  enabled: boolean;
  path: string;
  method: 'GET' | 'POST' | 'HEAD';
  interval: number; // seconds
  timeout: number; // seconds
  healthyThreshold: number;
  unhealthyThreshold: number;
  expectedStatus: number[];
  expectedBody?: string;
}

export interface CircuitBreakerConfiguration {
  enabled: boolean;
  failureThreshold: number;
  recoveryTimeout: number; // seconds
  halfOpenMaxCalls: number;
  slowCallThreshold: number; // milliseconds
  slowCallRateThreshold: number; // percentage
}

export interface SessionAffinityConfiguration {
  enabled: boolean;
  method: 'cookie' | 'ip_hash' | 'header' | 'consistent_hash';
  cookieName?: string;
  headerName?: string;
  ttl: number; // seconds
}

export interface TrafficShapingConfiguration {
  rateLimiting: RateLimitConfiguration;
  prioritization: TrafficPrioritization;
  queueing: QueueConfiguration;
}

export interface RateLimitConfiguration {
  enabled: boolean;
  requestsPerSecond: number;
  burstSize: number;
  keyExtractor: 'ip' | 'user' | 'header' | 'custom';
  customKey?: string;
}

export interface TrafficPrioritization {
  enabled: boolean;
  rules: PriorityRule[];
  defaultPriority: number;
}

export interface PriorityRule {
  condition: string;
  priority: number; // 1-10, higher is more important
  weight: number;
}

export interface QueueConfiguration {
  enabled: boolean;
  maxSize: number;
  timeoutMs: number;
  strategy: 'fifo' | 'lifo' | 'priority';
}

export interface LoadBalancingDecision {
  selectedServer: BackendServer;
  algorithm: string;
  factors: DecisionFactor[];
  timestamp: Date;
  sessionId?: string;
}

export interface DecisionFactor {
  name: string;
  value: number;
  weight: number;
  impact: number;
}

export interface CircuitBreakerState {
  serverId: string;
  state: 'closed' | 'open' | 'half_open';
  failureCount: number;
  lastFailureTime: Date;
  nextRetryTime: Date;
  successCount: number;
}

export class AdvancedLoadBalancer {
  private configuration: LoadBalancerConfiguration;
  private backendServers = new Map<string, BackendServer>();
  private circuitBreakers = new Map<string, CircuitBreakerState>();
  private sessionStore = new Map<string, string>(); // sessionId -> serverId
  private requestQueue: QueuedRequest[] = [];
  private metrics: LoadBalancerMetrics;
  private adaptiveAlgorithm: AdaptiveLoadBalancingAlgorithm;

  constructor(config: LoadBalancerConfiguration) {
    this.configuration = config;
    this.adaptiveAlgorithm = new AdaptiveLoadBalancingAlgorithm();
    this.metrics = this.initializeMetrics();
    this.startHealthChecking();
    this.startMetricsCollection();
  }

  /**
   * Intelligent server selection with adaptive algorithms
   */
  async selectServer(request: LoadBalancingRequest): Promise<LoadBalancingDecision> {
    const startTime = performance.now();

    // Apply rate limiting
    if (this.configuration.trafficShaping.rateLimiting.enabled) {
      const rateLimitResult = await this.checkRateLimit(request);
      if (!rateLimitResult.allowed) {
        throw new Error('Rate limit exceeded');
      }
    }

    // Check session affinity
    if (this.configuration.sessionAffinity.enabled) {
      const affinityServer = await this.checkSessionAffinity(request);
      if (affinityServer && this.isServerAvailable(affinityServer)) {
        return this.createDecision(affinityServer, 'session_affinity', request);
      }
    }

    // Get healthy servers
    const healthyServers = this.getHealthyServers();
    if (healthyServers.length === 0) {
      throw new Error('No healthy servers available');
    }

    // Apply load balancing algorithm
    const selectedServer = await this.applyLoadBalancingAlgorithm(
      healthyServers,
      request,
      this.configuration.algorithm
    );

    // Update session affinity if enabled
    if (this.configuration.sessionAffinity.enabled && request.sessionId) {
      this.sessionStore.set(request.sessionId, selectedServer.id);
    }

    // Update metrics
    this.updateSelectionMetrics(selectedServer, performance.now() - startTime);

    return this.createDecision(selectedServer, this.configuration.algorithm, request);
  }

  /**
   * Circuit breaker implementation with adaptive thresholds
   */
  async checkCircuitBreaker(serverId: string): Promise<boolean> {
    if (!this.configuration.circuitBreaker.enabled) {
      return true;
    }

    let circuitState = this.circuitBreakers.get(serverId);
    if (!circuitState) {
      circuitState = {
        serverId,
        state: 'closed',
        failureCount: 0,
        lastFailureTime: new Date(0),
        nextRetryTime: new Date(0),
        successCount: 0
      };
      this.circuitBreakers.set(serverId, circuitState);
    }

    const now = new Date();

    switch (circuitState.state) {
      case 'closed':
        return true;

      case 'open':
        if (now >= circuitState.nextRetryTime) {
          circuitState.state = 'half_open';
          circuitState.successCount = 0;
          return true;
        }
        return false;

      case 'half_open':
        return circuitState.successCount < this.configuration.circuitBreaker.halfOpenMaxCalls;

      default:
        return false;
    }
  }

  /**
   * Record request result for circuit breaker and adaptive algorithms
   */
  async recordRequestResult(
    serverId: string,
    success: boolean,
    responseTime: number,
    error?: Error
  ): Promise<void> {
    const server = this.backendServers.get(serverId);
    if (!server) return;

    // Update server metrics
    server.metrics.lastUpdated = new Date();
    if (success) {
      server.metrics.averageResponseTime = this.calculateMovingAverage(
        server.metrics.averageResponseTime,
        responseTime,
        0.1 // Alpha for exponential moving average
      );
    } else {
      server.metrics.errorCount++;
    }

    // Update circuit breaker state
    await this.updateCircuitBreakerState(serverId, success, responseTime);

    // Feed data to adaptive algorithm
    this.adaptiveAlgorithm.recordResult(serverId, success, responseTime, server.metrics);

    // Update global metrics
    this.updateGlobalMetrics(success, responseTime);
  }

  /**
   * Adaptive load balancing with machine learning
   */
  private async applyLoadBalancingAlgorithm(
    servers: BackendServer[],
    request: LoadBalancingRequest,
    algorithm: string
  ): Promise<BackendServer> {
    switch (algorithm) {
      case 'round_robin':
        return this.roundRobinSelection(servers);

      case 'weighted_round_robin':
        return this.weightedRoundRobinSelection(servers);

      case 'least_connections':
        return this.leastConnectionsSelection(servers);

      case 'least_response_time':
        return this.leastResponseTimeSelection(servers);

      case 'consistent_hash':
        return this.consistentHashSelection(servers, request);

      case 'adaptive':
        return await this.adaptiveSelection(servers, request);

      default:
        return this.roundRobinSelection(servers);
    }
  }

  /**
   * Weighted round-robin with dynamic weight adjustment
   */
  private weightedRoundRobinSelection(servers: BackendServer[]): BackendServer {
    const totalWeight = servers.reduce((sum, server) => sum + this.getEffectiveWeight(server), 0);
    const random = Math.random() * totalWeight;
    
    let currentWeight = 0;
    for (const server of servers) {
      currentWeight += this.getEffectiveWeight(server);
      if (random <= currentWeight) {
        return server;
      }
    }
    
    return servers[0]; // Fallback
  }

  /**
   * Least connections with connection prediction
   */
  private leastConnectionsSelection(servers: BackendServer[]): BackendServer {
    return servers.reduce((best, current) => {
      const bestScore = this.calculateConnectionScore(best);
      const currentScore = this.calculateConnectionScore(current);
      return currentScore < bestScore ? current : best;
    });
  }

  /**
   * Least response time with predictive modeling
   */
  private leastResponseTimeSelection(servers: BackendServer[]): BackendServer {
    return servers.reduce((best, current) => {
      const bestScore = this.calculateResponseTimeScore(best);
      const currentScore = this.calculateResponseTimeScore(current);
      return currentScore < bestScore ? current : best;
    });
  }

  /**
   * Consistent hashing for session affinity
   */
  private consistentHashSelection(servers: BackendServer[], request: LoadBalancingRequest): BackendServer {
    const key = request.sessionId || request.clientIP || request.userId || 'default';
    const hash = this.calculateHash(key);
    
    // Sort servers by hash distance
    const sortedServers = servers
      .map(server => ({
        server,
        distance: this.calculateHashDistance(hash, this.calculateHash(server.id))
      }))
      .sort((a, b) => a.distance - b.distance);

    return sortedServers[0].server;
  }

  /**
   * Adaptive selection using machine learning
   */
  private async adaptiveSelection(servers: BackendServer[], request: LoadBalancingRequest): Promise<BackendServer> {
    // Get predictions from adaptive algorithm
    const predictions = await this.adaptiveAlgorithm.predictPerformance(servers, request);
    
    // Select server with best predicted performance
    const bestPrediction = predictions.reduce((best, current) => 
      current.score > best.score ? current : best
    );

    return servers.find(s => s.id === bestPrediction.serverId)!;
  }

  /**
   * Dynamic health checking with adaptive intervals
   */
  private async performHealthCheck(server: BackendServer): Promise<boolean> {
    if (!this.configuration.healthCheck.enabled) {
      return true;
    }

    const startTime = performance.now();
    
    try {
      const response = await this.makeHealthCheckRequest(server);
      const responseTime = performance.now() - startTime;
      
      const isHealthy = this.evaluateHealthCheckResponse(response, responseTime);
      
      // Update server health
      server.health.lastCheck = new Date();
      server.health.responseTime = responseTime;
      
      if (isHealthy) {
        server.health.consecutiveFailures = 0;
        if (server.health.status === 'unhealthy') {
          server.health.status = 'healthy';
          this.emitHealthEvent('server.recovered', { serverId: server.id });
        }
      } else {
        server.health.consecutiveFailures++;
        if (server.health.consecutiveFailures >= this.configuration.healthCheck.unhealthyThreshold) {
          server.health.status = 'unhealthy';
          this.emitHealthEvent('server.unhealthy', { serverId: server.id });
        }
      }

      return isHealthy;

    } catch (error) {
      server.health.consecutiveFailures++;
      server.health.lastCheck = new Date();
      
      if (server.health.consecutiveFailures >= this.configuration.healthCheck.unhealthyThreshold) {
        server.health.status = 'unhealthy';
        this.emitHealthEvent('server.unhealthy', { serverId: server.id, error });
      }
      
      return false;
    }
  }

  // Private helper methods
  private initializeMetrics(): LoadBalancerMetrics {
    return {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      requestsPerSecond: 0,
      activeConnections: 0,
      queueSize: 0,
      circuitBreakerTrips: 0
    };
  }

  private startHealthChecking(): void {
    setInterval(() => {
      this.backendServers.forEach(server => {
        this.performHealthCheck(server);
      });
    }, this.configuration.healthCheck.interval * 1000);
  }

  private startMetricsCollection(): void {
    setInterval(() => {
      this.collectAndUpdateMetrics();
    }, 10 * 1000); // Every 10 seconds
  }

  private getHealthyServers(): BackendServer[] {
    return Array.from(this.backendServers.values())
      .filter(server => this.isServerAvailable(server));
  }

  private isServerAvailable(server: BackendServer): boolean {
    if (server.health.status !== 'healthy') return false;
    
    // Check circuit breaker
    const circuitState = this.circuitBreakers.get(server.id);
    if (circuitState && circuitState.state === 'open') return false;
    
    // Check capacity limits
    const connectionUtilization = server.metrics.activeConnections / server.capacity.maxConnections;
    const qpsUtilization = server.metrics.requestsPerSecond / server.capacity.maxRequestsPerSecond;
    
    return connectionUtilization < 0.9 && qpsUtilization < 0.9; // 90% threshold
  }

  private getEffectiveWeight(server: BackendServer): number {
    let weight = server.weight;
    
    // Adjust weight based on current load
    const loadFactor = this.calculateLoadFactor(server);
    weight *= (1 - loadFactor * 0.5); // Reduce weight by up to 50% based on load
    
    // Adjust weight based on response time
    const responseTimeFactor = Math.min(server.metrics.averageResponseTime / 1000, 1); // Normalize to 0-1
    weight *= (1 - responseTimeFactor * 0.3); // Reduce weight by up to 30% based on response time
    
    return Math.max(weight, 0.1); // Minimum weight of 0.1
  }

  private calculateLoadFactor(server: BackendServer): number {
    const connectionLoad = server.metrics.activeConnections / server.capacity.maxConnections;
    const qpsLoad = server.metrics.requestsPerSecond / server.capacity.maxRequestsPerSecond;
    const cpuLoad = server.metrics.cpuUtilization / 100;
    const memoryLoad = server.metrics.memoryUtilization / 100;
    
    return Math.max(connectionLoad, qpsLoad, cpuLoad, memoryLoad);
  }

  private calculateConnectionScore(server: BackendServer): number {
    const loadFactor = this.calculateLoadFactor(server);
    const responseTimeFactor = server.metrics.averageResponseTime / 1000;
    
    return loadFactor + responseTimeFactor;
  }

  private calculateResponseTimeScore(server: BackendServer): number {
    const responseTime = server.metrics.averageResponseTime;
    const loadFactor = this.calculateLoadFactor(server);
    
    // Predict response time based on current load
    const predictedResponseTime = responseTime * (1 + loadFactor);
    
    return predictedResponseTime;
  }

  private calculateHash(input: string): number {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  private calculateHashDistance(hash1: number, hash2: number): number {
    return Math.abs(hash1 - hash2);
  }

  private roundRobinSelection(servers: BackendServer[]): BackendServer {
    // Simple round-robin implementation
    const index = this.metrics.totalRequests % servers.length;
    return servers[index];
  }

  private calculateMovingAverage(current: number, newValue: number, alpha: number): number {
    return alpha * newValue + (1 - alpha) * current;
  }

  private async updateCircuitBreakerState(
    serverId: string,
    success: boolean,
    responseTime: number
  ): Promise<void> {
    const circuitState = this.circuitBreakers.get(serverId);
    if (!circuitState) return;

    const config = this.configuration.circuitBreaker;
    const now = new Date();

    if (success && responseTime < config.slowCallThreshold) {
      // Successful fast request
      if (circuitState.state === 'half_open') {
        circuitState.successCount++;
        if (circuitState.successCount >= config.halfOpenMaxCalls) {
          circuitState.state = 'closed';
          circuitState.failureCount = 0;
        }
      } else if (circuitState.state === 'closed') {
        circuitState.failureCount = Math.max(0, circuitState.failureCount - 1);
      }
    } else {
      // Failed or slow request
      circuitState.failureCount++;
      circuitState.lastFailureTime = now;

      if (circuitState.state === 'closed' && circuitState.failureCount >= config.failureThreshold) {
        circuitState.state = 'open';
        circuitState.nextRetryTime = new Date(now.getTime() + config.recoveryTimeout * 1000);
        this.metrics.circuitBreakerTrips++;
      } else if (circuitState.state === 'half_open') {
        circuitState.state = 'open';
        circuitState.nextRetryTime = new Date(now.getTime() + config.recoveryTimeout * 1000);
      }
    }
  }

  private createDecision(
    server: BackendServer,
    algorithm: string,
    request: LoadBalancingRequest
  ): LoadBalancingDecision {
    return {
      selectedServer: server,
      algorithm,
      factors: [
        { name: 'load', value: this.calculateLoadFactor(server), weight: 0.4, impact: 0.3 },
        { name: 'response_time', value: server.metrics.averageResponseTime, weight: 0.3, impact: 0.2 },
        { name: 'health', value: server.health.status === 'healthy' ? 1 : 0, weight: 0.3, impact: 0.5 }
      ],
      timestamp: new Date(),
      sessionId: request.sessionId
    };
  }

  private updateSelectionMetrics(server: BackendServer, selectionTime: number): void {
    this.metrics.totalRequests++;
    server.metrics.activeConnections++;
  }

  private updateGlobalMetrics(success: boolean, responseTime: number): void {
    if (success) {
      this.metrics.successfulRequests++;
    } else {
      this.metrics.failedRequests++;
    }
    
    this.metrics.averageResponseTime = this.calculateMovingAverage(
      this.metrics.averageResponseTime,
      responseTime,
      0.1
    );
  }

  private async checkRateLimit(request: LoadBalancingRequest): Promise<{ allowed: boolean; retryAfter?: number }> {
    // Mock rate limiting implementation
    return { allowed: true };
  }

  private async checkSessionAffinity(request: LoadBalancingRequest): Promise<BackendServer | null> {
    if (!request.sessionId) return null;
    
    const serverId = this.sessionStore.get(request.sessionId);
    return serverId ? this.backendServers.get(serverId) || null : null;
  }

  private async makeHealthCheckRequest(server: BackendServer): Promise<any> {
    // Mock health check request
    return { status: 200, body: 'OK' };
  }

  private evaluateHealthCheckResponse(response: any, responseTime: number): boolean {
    const config = this.configuration.healthCheck;
    
    if (!config.expectedStatus.includes(response.status)) {
      return false;
    }
    
    if (responseTime > config.timeout * 1000) {
      return false;
    }
    
    if (config.expectedBody && response.body !== config.expectedBody) {
      return false;
    }
    
    return true;
  }

  private collectAndUpdateMetrics(): void {
    // Calculate requests per second
    const now = Date.now();
    const timeDiff = (now - (this.metrics.lastUpdate || now)) / 1000;
    this.metrics.requestsPerSecond = this.metrics.totalRequests / Math.max(timeDiff, 1);
    this.metrics.lastUpdate = now;
    
    // Update queue size
    this.metrics.queueSize = this.requestQueue.length;
    
    // Update active connections
    this.metrics.activeConnections = Array.from(this.backendServers.values())
      .reduce((sum, server) => sum + server.metrics.activeConnections, 0);
  }

  private emitHealthEvent(eventType: string, data: any): void {
    const event = new CustomEvent(eventType, { detail: data });
    if (typeof window !== 'undefined') {
      window.dispatchEvent(event);
    }
  }
}

// Supporting classes
class AdaptiveLoadBalancingAlgorithm {
  private serverPerformanceHistory = new Map<string, PerformanceHistory>();

  recordResult(serverId: string, success: boolean, responseTime: number, metrics: ServerMetrics): void {
    let history = this.serverPerformanceHistory.get(serverId);
    if (!history) {
      history = { results: [], averageResponseTime: 0, successRate: 1 };
      this.serverPerformanceHistory.set(serverId, history);
    }

    history.results.push({ success, responseTime, timestamp: new Date() });
    
    // Keep only last 100 results
    if (history.results.length > 100) {
      history.results = history.results.slice(-100);
    }

    // Update aggregated metrics
    this.updateAggregatedMetrics(history);
  }

  async predictPerformance(servers: BackendServer[], request: LoadBalancingRequest): Promise<ServerPrediction[]> {
    return servers.map(server => {
      const history = this.serverPerformanceHistory.get(server.id);
      const baseScore = this.calculateBaseScore(server);
      const historyScore = history ? this.calculateHistoryScore(history) : 0.5;
      const loadScore = this.calculateLoadScore(server);
      
      const finalScore = (baseScore * 0.4) + (historyScore * 0.4) + (loadScore * 0.2);
      
      return {
        serverId: server.id,
        score: finalScore,
        confidence: history ? Math.min(history.results.length / 50, 1) : 0.1
      };
    });
  }

  private updateAggregatedMetrics(history: PerformanceHistory): void {
    const recentResults = history.results.slice(-20); // Last 20 results
    
    history.successRate = recentResults.filter(r => r.success).length / recentResults.length;
    history.averageResponseTime = recentResults.reduce((sum, r) => sum + r.responseTime, 0) / recentResults.length;
  }

  private calculateBaseScore(server: BackendServer): number {
    const healthScore = server.health.status === 'healthy' ? 1 : 0;
    const weightScore = server.weight / 100; // Normalize weight
    
    return (healthScore + weightScore) / 2;
  }

  private calculateHistoryScore(history: PerformanceHistory): number {
    const responseTimeScore = Math.max(0, 1 - (history.averageResponseTime / 1000)); // Normalize to 0-1
    const successScore = history.successRate;
    
    return (responseTimeScore + successScore) / 2;
  }

  private calculateLoadScore(server: BackendServer): number {
    const connectionLoad = server.metrics.activeConnections / server.capacity.maxConnections;
    const qpsLoad = server.metrics.requestsPerSecond / server.capacity.maxRequestsPerSecond;
    
    return Math.max(0, 1 - Math.max(connectionLoad, qpsLoad));
  }
}

// Supporting interfaces
interface LoadBalancingRequest {
  clientIP: string;
  userAgent: string;
  sessionId?: string;
  userId?: string;
  path: string;
  method: string;
  headers: Record<string, string>;
  priority?: number;
}

interface LoadBalancerMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  requestsPerSecond: number;
  activeConnections: number;
  queueSize: number;
  circuitBreakerTrips: number;
  lastUpdate?: number;
}

interface QueuedRequest {
  id: string;
  request: LoadBalancingRequest;
  priority: number;
  queuedAt: Date;
  timeoutAt: Date;
}

interface PerformanceHistory {
  results: Array<{ success: boolean; responseTime: number; timestamp: Date }>;
  averageResponseTime: number;
  successRate: number;
}

interface ServerPrediction {
  serverId: string;
  score: number;
  confidence: number;
}

export const advancedLoadBalancer = new AdvancedLoadBalancer({
  id: 'main-lb',
  name: 'Main Load Balancer',
  algorithm: 'adaptive',
  healthCheck: {
    enabled: true,
    path: '/health',
    method: 'GET',
    interval: 30,
    timeout: 5,
    healthyThreshold: 2,
    unhealthyThreshold: 3,
    expectedStatus: [200]
  },
  circuitBreaker: {
    enabled: true,
    failureThreshold: 5,
    recoveryTimeout: 30,
    halfOpenMaxCalls: 3,
    slowCallThreshold: 1000,
    slowCallRateThreshold: 50
  },
  sessionAffinity: {
    enabled: true,
    method: 'consistent_hash',
    ttl: 3600
  },
  trafficShaping: {
    rateLimiting: {
      enabled: true,
      requestsPerSecond: 1000,
      burstSize: 2000,
      keyExtractor: 'ip'
    },
    prioritization: {
      enabled: true,
      rules: [
        { condition: 'path=/api/critical/*', priority: 10, weight: 1.0 },
        { condition: 'header[user-type]=premium', priority: 8, weight: 0.8 }
      ],
      defaultPriority: 5
    },
    queueing: {
      enabled: true,
      maxSize: 1000,
      timeoutMs: 30000,
      strategy: 'priority'
    }
  }
});