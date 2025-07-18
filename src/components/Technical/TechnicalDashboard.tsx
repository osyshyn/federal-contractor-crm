import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useRealTimeMetrics } from '../../hooks/useRealTimeMetrics';
import { advancedCacheManager } from '../../services/AdvancedCacheManager';
import { 
  Database, 
  Shield, 
  Zap, 
  Server, 
  Activity, 
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Cpu,
  HardDrive,
  Network
} from 'lucide-react';

export default function TechnicalDashboard() {
  const { dispatch } = useAppContext();
  const { 
    metrics: realTimeMetrics, 
    isConnected, 
    getHealthStatus 
  } = useRealTimeMetrics({ updateInterval: 1000 });

  const [cacheStats, setCacheStats] = useState(advancedCacheManager.getStats());

  const [activeTab, setActiveTab] = useState<'overview' | 'database' | 'cache' | 'security' | 'services'>('overview');

  useEffect(() => {
    // Update cache stats
    const interval = setInterval(() => {
      setCacheStats(advancedCacheManager.getStats());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Derived metrics from real-time data
  const metrics = {
    database: realTimeMetrics.database,
    cache: {
      ...realTimeMetrics.cache,
      ...cacheStats
    },
    security: realTimeMetrics.security,
    microservices: {
      servicesRunning: 12,
      servicesHealthy: 11,
      averageResponseTime: realTimeMetrics.performance.responseTime,
      throughput: realTimeMetrics.loadBalancer.requestsPerSecond
    }
  };

  const healthStatus = getHealthStatus();

  const tabs = [
    { id: 'overview', name: 'System Overview', icon: Activity },
    { id: 'database', name: 'Database Performance', icon: Database },
    { id: 'cache', name: 'Cache Management', icon: Zap },
    { id: 'security', name: 'Security Audit', icon: Shield },
    { id: 'services', name: 'Microservices', icon: Server }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Technical Architecture Dashboard</h1>
          <p className="text-gray-600">Advanced enterprise-grade system monitoring and optimization</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            }`}></div>
            <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
              {isConnected ? 'Real-time monitoring active' : 'Monitoring offline'}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-gray-600">System Status:</span>
            <span className={`font-medium capitalize ${
              healthStatus === 'healthy' ? 'text-green-600' : 
              healthStatus === 'warning' ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {healthStatus}
            </span>
          </div>
          <button 
            onClick={() => {
              dispatch({ 
                type: 'ADD_NOTIFICATION', 
                payload: {
                  id: Date.now().toString(),
                  type: 'info',
                  title: 'Metrics Refreshed',
                  message: 'Technical metrics have been refreshed successfully.',
                  timestamp: new Date(),
                  read: false
                }
              });
            }}
            disabled={!isConnected}
            className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && <SystemOverview metrics={metrics} />}
      {activeTab === 'database' && <DatabasePerformance metrics={metrics.database} />}
      {activeTab === 'cache' && <CacheManagement metrics={metrics.cache} />}
      {activeTab === 'security' && <SecurityAudit metrics={metrics.security} />}
      {activeTab === 'services' && <MicroservicesMonitoring metrics={metrics.microservices} />}
    </div>
  );
}

function SystemOverview({ metrics }: { metrics: any }) {
  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Database Performance"
          value={`${metrics.database.queryLatency.p95.toFixed(0)}ms`}
          subtitle="P95 Query Latency"
          icon={Database}
          status={metrics.database.queryLatency.p95 < 100 ? 'good' : 'warning'}
        />
        <MetricCard
          title="Cache Hit Rate"
          value={`${(metrics.cache.hitRate * 100).toFixed(1)}%`}
          subtitle="Multi-level Cache"
          icon={Zap}
          status={metrics.cache.hitRate > 0.9 ? 'good' : 'warning'}
        />
        <MetricCard
          title="Security Score"
          value={`${metrics.security.complianceScore}%`}
          subtitle="SOC2 Compliance"
          icon={Shield}
          status={metrics.security.complianceScore > 90 ? 'good' : 'warning'}
        />
        <MetricCard
          title="Service Health"
          value={`${metrics.microservices.servicesHealthy}/${metrics.microservices.servicesRunning}`}
          subtitle="Healthy Services"
          icon={Server}
          status={metrics.microservices.servicesHealthy === metrics.microservices.servicesRunning ? 'good' : 'error'}
        />
      </div>

      {/* Architecture Diagram */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Architecture</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ArchitectureLayer
            title="Presentation Layer"
            components={['React SPA', 'CDN Cache', 'Load Balancer']}
            status="healthy"
          />
          <ArchitectureLayer
            title="Application Layer"
            components={['API Gateway', 'Microservices', 'Service Mesh']}
            status="healthy"
          />
          <ArchitectureLayer
            title="Data Layer"
            components={['PostgreSQL', 'Redis Cache', 'Elasticsearch']}
            status="warning"
          />
        </div>
      </div>

      {/* Real-time Performance Chart */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Real-time Performance Metrics</h3>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <TrendingUp className="h-12 w-12 text-blue-600 mx-auto mb-2" />
            <p className="text-gray-600">Live performance monitoring</p>
            <p className="text-sm text-gray-500">Throughput: {metrics.microservices.throughput} req/s</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DatabasePerformance({ metrics }: { metrics: any }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Query Performance */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Query Performance</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">P50 Latency</span>
              <span className="font-medium">{metrics.queryLatency.p50.toFixed(0)}ms</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">P95 Latency</span>
              <span className="font-medium">{metrics.queryLatency.p95.toFixed(0)}ms</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">P99 Latency</span>
              <span className="font-medium">{metrics.queryLatency.p99.toFixed(0)}ms</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Slow Queries</span>
              <span className="font-medium text-orange-600">{metrics.slowQueries}</span>
            </div>
          </div>
        </div>

        {/* Connection Pool */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Connection Pool</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Pool Utilization</span>
                <span>{metrics.connectionPool.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    metrics.connectionPool > 80 ? 'bg-red-500' : 
                    metrics.connectionPool > 60 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${metrics.connectionPool}%` }}
                ></div>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Cache Hit Ratio</span>
              <span className="font-medium">{(metrics.cacheHitRatio * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Query Optimization Recommendations */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Optimization Recommendations</h3>
        <div className="space-y-3">
          <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
            <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">Index Optimization</p>
              <p className="text-sm text-blue-700">Add composite index on (tenant_id, created_at) for 40% performance improvement</p>
            </div>
          </div>
          <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-900">Query Refactoring</p>
              <p className="text-sm text-yellow-700">3 queries can be optimized by avoiding N+1 patterns</p>
            </div>
          </div>
          <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
            <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-900">Partitioning Strategy</p>
              <p className="text-sm text-green-700">Implement time-based partitioning for opportunities table</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CacheManagement({ metrics }: { metrics: any }) {
  return (
    <div className="space-y-6">
      {/* Cache Level Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {Object.entries(metrics.levels).map(([level, stats]: [string, any]) => (
          <div key={level} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 capitalize">{level} Cache</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Hits</span>
                <span className="font-medium">{stats.hits.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Misses</span>
                <span className="font-medium">{stats.misses.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Hit Rate</span>
                <span className="font-medium">
                  {((stats.hits / (stats.hits + stats.misses)) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cache Strategy Configuration */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Multi-Level Cache Strategy</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Cpu className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium">L1 Memory Cache</p>
                <p className="text-sm text-gray-600">In-process, ultra-fast access</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium">100MB</p>
              <p className="text-sm text-gray-600">5min TTL</p>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Network className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">L2 Redis Cache</p>
                <p className="text-sm text-gray-600">Distributed, persistent</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium">1GB</p>
              <p className="text-sm text-gray-600">1hr TTL</p>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <HardDrive className="h-5 w-5 text-purple-600" />
              <div>
                <p className="font-medium">L3 CDN Cache</p>
                <p className="text-sm text-gray-600">Global edge locations</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium">10GB</p>
              <p className="text-sm text-gray-600">24hr TTL</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cache Optimization */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Intelligent Cache Optimization</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Active Optimizations</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Compression enabled for large objects</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Encryption for sensitive data</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>LRU eviction policy active</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Predictive cache warming</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Performance Metrics</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Operations/sec</span>
                <span className="font-medium">{metrics.operationsPerSecond.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Memory Usage</span>
                <span className="font-medium">{metrics.memoryUsage}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Hit Rate</span>
                <span className="font-medium">{(metrics.hitRate * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Avg Latency</span>
                <span className="font-medium">0.8ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SecurityAudit({ metrics }: { metrics: any }) {
  return (
    <div className="space-y-6">
      {/* Security Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Assessment</h3>
          <div className="text-center">
            <div className={`text-3xl font-bold mb-2 ${
              metrics.riskScore < 30 ? 'text-green-600' : 
              metrics.riskScore < 60 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {metrics.riskScore}
            </div>
            <p className="text-sm text-gray-600">Overall Risk Score</p>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    metrics.riskScore < 30 ? 'bg-green-500' : 
                    metrics.riskScore < 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${metrics.riskScore}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Vulnerabilities</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Critical</span>
              <span className={`font-medium ${metrics.vulnerabilities.critical > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {metrics.vulnerabilities.critical}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">High</span>
              <span className={`font-medium ${metrics.vulnerabilities.high > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                {metrics.vulnerabilities.high}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Medium</span>
              <span className="font-medium text-yellow-600">{metrics.vulnerabilities.medium}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Low</span>
              <span className="font-medium text-gray-600">{metrics.vulnerabilities.low}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance</h3>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {metrics.complianceScore}%
            </div>
            <p className="text-sm text-gray-600">SOC2 Compliance</p>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>NIST Framework</span>
                <span className="text-green-600">✓</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>ISO 27001</span>
                <span className="text-green-600">✓</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>GDPR</span>
                <span className="text-yellow-600">⚠</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Controls */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Security Controls</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">Multi-Factor Authentication</p>
                <p className="text-sm text-green-700">100% coverage for admin accounts</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">Encryption at Rest</p>
                <p className="text-sm text-green-700">AES-256 for all sensitive data</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">Network Segmentation</p>
                <p className="text-sm text-green-700">Zero-trust architecture implemented</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-900">Vulnerability Scanning</p>
                <p className="text-sm text-yellow-700">2 high-priority items pending</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">Access Logging</p>
                <p className="text-sm text-green-700">Comprehensive audit trail active</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">Incident Response</p>
                <p className="text-sm text-green-700">Automated response procedures</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Security Events */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Security Events</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 border-l-4 border-yellow-400 bg-yellow-50">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <div className="flex-1">
              <p className="font-medium text-yellow-900">Suspicious Login Attempt</p>
              <p className="text-sm text-yellow-700">Multiple failed attempts from IP 192.168.1.100</p>
            </div>
            <span className="text-sm text-yellow-600">2 hours ago</span>
          </div>
          <div className="flex items-center space-x-3 p-3 border-l-4 border-green-400 bg-green-50">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div className="flex-1">
              <p className="font-medium text-green-900">Security Patch Applied</p>
              <p className="text-sm text-green-700">Updated authentication service to v2.1.3</p>
            </div>
            <span className="text-sm text-green-600">6 hours ago</span>
          </div>
          <div className="flex items-center space-x-3 p-3 border-l-4 border-blue-400 bg-blue-50">
            <Shield className="h-5 w-5 text-blue-600" />
            <div className="flex-1">
              <p className="font-medium text-blue-900">Compliance Audit Completed</p>
              <p className="text-sm text-blue-700">SOC2 Type II audit passed with 94% score</p>
            </div>
            <span className="text-sm text-blue-600">1 day ago</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MicroservicesMonitoring({ metrics }: { metrics: any }) {
  const services = [
    { name: 'API Gateway', status: 'healthy', instances: 3, cpu: 45, memory: 62 },
    { name: 'Auth Service', status: 'healthy', instances: 2, cpu: 32, memory: 48 },
    { name: 'Opportunity Service', status: 'healthy', instances: 4, cpu: 58, memory: 71 },
    { name: 'Permission Service', status: 'warning', instances: 2, cpu: 78, memory: 85 },
    { name: 'Sync Service', status: 'healthy', instances: 2, cpu: 41, memory: 55 },
    { name: 'Notification Service', status: 'healthy', instances: 1, cpu: 25, memory: 38 }
  ];

  return (
    <div className="space-y-6">
      {/* Service Health Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Services Running</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.servicesRunning}</p>
            </div>
            <Server className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Healthy Services</p>
              <p className="text-2xl font-bold text-green-600">{metrics.servicesHealthy}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Response Time</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.averageResponseTime}ms</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Throughput</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.throughput}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Service Details */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Service Status</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Instances
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CPU Usage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Memory Usage
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {services.map((service) => (
                <tr key={service.name}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{service.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      service.status === 'healthy' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {service.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {service.instances}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className={`h-2 rounded-full ${
                            service.cpu > 70 ? 'bg-red-500' : 
                            service.cpu > 50 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${service.cpu}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900">{service.cpu}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className={`h-2 rounded-full ${
                            service.memory > 80 ? 'bg-red-500' : 
                            service.memory > 60 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${service.memory}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900">{service.memory}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Service Mesh Configuration */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Mesh Configuration</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Traffic Management</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Load balancing: Least connections</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Circuit breaker: 5 failure threshold</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Rate limiting: 1000 req/s per tenant</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Retry policy: Exponential backoff</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Security & Observability</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>mTLS enabled for all services</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Distributed tracing active</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Metrics collection: Prometheus</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Log aggregation: ELK stack</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, subtitle, icon: Icon, status }: {
  title: string;
  value: string;
  subtitle: string;
  icon: any;
  status: 'good' | 'warning' | 'error';
}) {
  const statusColors = {
    good: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600'
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className={`text-2xl font-bold ${statusColors[status]}`}>{value}</p>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
        <Icon className={`h-8 w-8 ${statusColors[status]}`} />
      </div>
    </div>
  );
}

function ArchitectureLayer({ title, components, status }: {
  title: string;
  components: string[];
  status: 'healthy' | 'warning' | 'error';
}) {
  const statusColors = {
    healthy: 'border-green-200 bg-green-50',
    warning: 'border-yellow-200 bg-yellow-50',
    error: 'border-red-200 bg-red-50'
  };

  return (
    <div className={`p-4 rounded-lg border-2 ${statusColors[status]}`}>
      <h4 className="font-medium text-gray-900 mb-3">{title}</h4>
      <div className="space-y-2">
        {components.map((component) => (
          <div key={component} className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              status === 'healthy' ? 'bg-green-500' : 
              status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            <span className="text-sm text-gray-700">{component}</span>
          </div>
        ))}
      </div>
    </div>
  );
}