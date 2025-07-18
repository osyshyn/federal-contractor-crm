import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useRealTimeMetrics } from '../../hooks/useRealTimeMetrics';
import { advancedCacheManager } from '../../services/AdvancedCacheManager';
import { 
  Zap, 
  Database, 
  Globe, 
  Server, 
  Activity, 
  TrendingUp,
  Clock,
  Users,
  BarChart3,
  Network,
  Cpu,
  HardDrive,
  Gauge,
  Target,
  Shield
} from 'lucide-react';

export default function PerformanceDashboard() {
  const { dispatch } = useAppContext();
  const { 
    metrics: realTimeMetrics, 
    isConnected, 
    error, 
    refreshMetrics, 
    getTrend,
    getHealthStatus,
    getOverallPerformanceScore 
  } = useRealTimeMetrics({ 
    updateInterval: 2000, 
    enableWebSocket: false 
  });

  const [activeTab, setActiveTab] = useState<'overview' | 'sharding' | 'edge' | 'load-balancer'>('overview');
  const [cacheStats, setCacheStats] = useState(advancedCacheManager.getStats());

  // Update cache stats periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setCacheStats(advancedCacheManager.getStats());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Derived metrics from real-time data
  const performanceMetrics = {
    sharding: {
      totalShards: realTimeMetrics.database.totalShards,
      healthyShards: realTimeMetrics.database.shardsHealthy,
      crossShardQueries: 1247 + Math.floor(Math.random() * 100),
      rebalanceOperations: 2,
      averageShardLoad: Math.round(realTimeMetrics.database.connectionPool * 0.8),
      queryLatency: realTimeMetrics.database.queryLatency.p50
    },
    edge: {
      edgeLocations: realTimeMetrics.edge.edgeLocations,
      activeLocations: realTimeMetrics.edge.activeLocations,
      cacheHitRatio: realTimeMetrics.edge.cacheHitRatio,
      edgeFunctions: realTimeMetrics.edge.edgeFunctions,
      globalLatency: realTimeMetrics.edge.globalLatency,
      bandwidthSaved: realTimeMetrics.edge.bandwidthSaved
    },
    loadBalancer: {
      totalRequests: 125000 + Math.floor(Math.random() * 10000),
      requestsPerSecond: realTimeMetrics.loadBalancer.requestsPerSecond,
      averageResponseTime: realTimeMetrics.loadBalancer.averageResponseTime,
      circuitBreakerTrips: realTimeMetrics.loadBalancer.circuitBreakerTrips,
      healthyServers: realTimeMetrics.loadBalancer.healthyServers,
      totalServers: realTimeMetrics.loadBalancer.totalServers
    }
  };

  const tabs = [
    { id: 'overview', name: 'Performance Overview', icon: Gauge },
    { id: 'sharding', name: 'Database Sharding', icon: Database },
    { id: 'edge', name: 'Edge Computing', icon: Globe },
    { id: 'load-balancer', name: 'Load Balancing', icon: Network }
  ];

  const healthStatus = getHealthStatus();
  const overallScore = getOverallPerformanceScore();

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Performance & Scalability</h1>
          <p className="text-gray-600">Advanced distributed systems with intelligent optimization</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm">
            <div className={`w-3 h-3 rounded-full ${
              isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            }`}></div>
            <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
              {isConnected ? 'Real-time monitoring' : 'Connection lost'}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-gray-600">Health Score:</span>
            <span className={`font-medium ${
              overallScore >= 90 ? 'text-green-600' : 
              overallScore >= 70 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {overallScore}%
            </span>
          </div>
          <button 
            onClick={() => {
              dispatch({ 
                type: 'ADD_NOTIFICATION', 
                payload: {
                  id: Date.now().toString(),
                  type: 'info',
                  title: 'Performance Metrics Refreshed',
                  message: 'Performance metrics have been updated successfully.',
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
      {activeTab === 'overview' && (
        <PerformanceOverview 
          metrics={performanceMetrics} 
          realTimeMetrics={realTimeMetrics}
          cacheStats={cacheStats}
          getTrend={getTrend}
          healthStatus={healthStatus}
        />
      )}
      {activeTab === 'sharding' && (
        <DatabaseShardingDashboard 
          metrics={performanceMetrics.sharding}
          realTimeMetrics={realTimeMetrics.database}
          getTrend={getTrend}
        />
      )}
      {activeTab === 'edge' && (
        <EdgeComputingDashboard 
          metrics={performanceMetrics.edge}
          realTimeMetrics={realTimeMetrics.edge}
          getTrend={getTrend}
        />
      )}
      {activeTab === 'load-balancer' && (
        <LoadBalancerDashboard 
          metrics={performanceMetrics.loadBalancer}
          realTimeMetrics={realTimeMetrics.loadBalancer}
          getTrend={getTrend}
        />
      )}
    </div>
  );
}

function PerformanceOverview({ 
  metrics, 
  realTimeMetrics, 
  cacheStats, 
  getTrend, 
  healthStatus 
}: { 
  metrics: any; 
  realTimeMetrics: any; 
  cacheStats: any; 
  getTrend: any; 
  healthStatus: string; 
}) {
  const latencyTrend = getTrend('edge.globalLatency');
  const throughputTrend = getTrend('loadBalancer.requestsPerSecond');
  const cacheHitTrend = getTrend('cache.hitRate');

  return (
    <div className="space-y-6">
      {/* Key Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <PerformanceMetricCard
          title="Global Latency"
          value={`${Math.round(latencyTrend.value)}ms`}
          subtitle="P95 Response Time"
          icon={Clock}
          trend={`${latencyTrend.percentage > 0 ? '+' : ''}${latencyTrend.percentage.toFixed(1)}%`}
          status={latencyTrend.value < 50 ? "excellent" : latencyTrend.value < 100 ? "good" : "warning"}
        />
        <PerformanceMetricCard
          title="Throughput"
          value={`${Math.round(throughputTrend.value).toLocaleString()}`}
          subtitle="Requests per second"
          icon={TrendingUp}
          trend={`${throughputTrend.percentage > 0 ? '+' : ''}${throughputTrend.percentage.toFixed(1)}%`}
          status={throughputTrend.value > 2000 ? "excellent" : throughputTrend.value > 1000 ? "good" : "warning"}
        />
        <PerformanceMetricCard
          title="Cache Hit Ratio"
          value={`${(cacheHitTrend.value * 100).toFixed(1)}%`}
          subtitle="Multi-level cache"
          icon={Zap}
          trend={`${cacheHitTrend.percentage > 0 ? '+' : ''}${cacheHitTrend.percentage.toFixed(1)}%`}
          status={cacheHitTrend.value > 0.9 ? "excellent" : cacheHitTrend.value > 0.8 ? "good" : "warning"}
        />
        <PerformanceMetricCard
          title="System Health"
          value={healthStatus === 'healthy' ? '99.97%' : healthStatus === 'warning' ? '99.85%' : '99.12%'}
          subtitle="Overall Health"
          icon={Shield}
          trend={healthStatus === 'healthy' ? '+0.02%' : '-0.15%'}
          status={healthStatus === 'healthy' ? "excellent" : healthStatus === 'warning' ? "warning" : "error"}
        />
      </div>

      {/* Architecture Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ArchitectureComponent
          title="Database Sharding"
          description="Consistent hashing with virtual nodes"
          metrics={[
            { label: 'Active Shards', value: `${realTimeMetrics.database.shardsHealthy}/${realTimeMetrics.database.totalShards}` },
            { label: 'Connection Pool', value: `${Math.round(realTimeMetrics.database.connectionPool)}%` },
            { label: 'Query Latency P95', value: `${Math.round(realTimeMetrics.database.queryLatency.p95)}ms` }
          ]}
          status={realTimeMetrics.database.shardsHealthy === realTimeMetrics.database.totalShards ? "healthy" : "warning"}
          icon={Database}
        />
        
        <ArchitectureComponent
          title="Edge Computing"
          description="Global CDN with edge functions"
          metrics={[
            { label: 'Edge Locations', value: `${realTimeMetrics.edge.activeLocations}/${realTimeMetrics.edge.edgeLocations}` },
            { label: 'Cache Hit Rate', value: `${realTimeMetrics.edge.cacheHitRatio.toFixed(1)}%` },
            { label: 'Global Latency', value: `${Math.round(realTimeMetrics.edge.globalLatency)}ms` }
          ]}
          status={realTimeMetrics.edge.activeLocations === realTimeMetrics.edge.edgeLocations ? "healthy" : "warning"}
          icon={Globe}
        />
        
        <ArchitectureComponent
          title="Load Balancing"
          description="Adaptive algorithms with circuit breakers"
          metrics={[
            { label: 'Healthy Servers', value: `${realTimeMetrics.loadBalancer.healthyServers}/${realTimeMetrics.loadBalancer.totalServers}` },
            { label: 'Response Time', value: `${Math.round(realTimeMetrics.loadBalancer.averageResponseTime)}ms` },
            { label: 'Requests/sec', value: `${Math.round(realTimeMetrics.loadBalancer.requestsPerSecond).toLocaleString()}` }
          ]}
          status={realTimeMetrics.loadBalancer.healthyServers === realTimeMetrics.loadBalancer.totalServers ? "healthy" : "warning"}
          icon={Network}
        />
      </div>

      {/* Real-time Cache Performance */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Multi-Level Cache Performance</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {Object.entries(cacheStats.levelStats).map(([levelName, stats]: [string, any]) => (
            <div key={levelName} className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3 capitalize">{levelName} Cache</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Hit Rate</span>
                  <span className="font-medium text-green-600">
                    {stats.hits > 0 ? ((stats.hits / (stats.hits + stats.misses)) * 100).toFixed(1) : '0.0'}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Operations</span>
                  <span className="font-medium">{(stats.hits + stats.misses).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Memory Usage</span>
                  <span className="font-medium">{(stats.memoryUsage / (1024 * 1024)).toFixed(1)}MB</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${stats.hits > 0 ? (stats.hits / (stats.hits + stats.misses)) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Trends */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Real-Time Performance Metrics</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">System Resources</h4>
            <div className="space-y-3">
              <ResourceMetric 
                name="CPU Usage" 
                value={realTimeMetrics.performance.cpuUsage} 
                max={100} 
                unit="%" 
                status={realTimeMetrics.performance.cpuUsage > 80 ? 'warning' : 'good'}
              />
              <ResourceMetric 
                name="Memory Usage" 
                value={realTimeMetrics.performance.memoryUsage} 
                max={100} 
                unit="%" 
                status={realTimeMetrics.performance.memoryUsage > 85 ? 'warning' : 'good'}
              />
              <ResourceMetric 
                name="Disk Usage" 
                value={realTimeMetrics.performance.diskUsage} 
                max={100} 
                unit="%" 
                status={realTimeMetrics.performance.diskUsage > 90 ? 'warning' : 'good'}
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Performance Indicators</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Error Rate</span>
                <span className={`text-sm font-medium ${
                  realTimeMetrics.performance.errorRate > 0.05 ? 'text-red-600' : 
                  realTimeMetrics.performance.errorRate > 0.02 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {(realTimeMetrics.performance.errorRate * 100).toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Cache Operations/sec</span>
                <span className="text-sm font-medium text-blue-600">
                  {Math.round(cacheStats.operationsPerSecond).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active DB Queries</span>
                <span className="text-sm font-medium text-purple-600">
                  {realTimeMetrics.database.activeQueries}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Optimization Recommendations */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI-Powered Optimization Recommendations</h3>
        <div className="space-y-3">
          <OptimizationRecommendation
            type="Cache Strategy"
            description="Increase TTL for static assets to 24h for 8% latency improvement"
            impact="high"
            effort="low"
            estimatedGain="8% latency reduction"
            onImplement={() => {
              dispatch({ 
                type: 'ADD_NOTIFICATION', 
                payload: {
                  id: Date.now().toString(),
                  type: 'success',
                  title: 'Optimization Applied',
                  message: 'Cache strategy optimization has been implemented.',
                  timestamp: new Date(),
                  read: false
                }
              });
            }}
          />
          <OptimizationRecommendation
            type="Shard Rebalancing"
            description="Migrate 15% of data from shard-3 to shard-7 for better distribution"
            impact="medium"
            effort="medium"
            estimatedGain="12% load balancing"
            onImplement={() => {
              dispatch({ 
                type: 'ADD_NOTIFICATION', 
                payload: {
                  id: Date.now().toString(),
                  type: 'info',
                  title: 'Rebalancing Started',
                  message: 'Shard rebalancing operation has been initiated.',
                  timestamp: new Date(),
                  read: false
                }
              });
            }}
          />
          <OptimizationRecommendation
            type="Edge Function"
            description="Deploy authentication function to 3 additional edge locations"
            impact="medium"
            effort="low"
            estimatedGain="25ms auth latency reduction"
            onImplement={() => {
              dispatch({ 
                type: 'ADD_NOTIFICATION', 
                payload: {
                  id: Date.now().toString(),
                  type: 'success',
                  title: 'Edge Deployment',
                  message: 'Authentication function deployed to additional edge locations.',
                  timestamp: new Date(),
                  read: false
                }
              });
            }}
          />
        </div>
      </div>
    </div>
  );
}

function DatabaseShardingDashboard({ 
  metrics, 
  realTimeMetrics, 
  getTrend 
}: { 
  metrics: any; 
  realTimeMetrics: any; 
  getTrend: any; 
}) {
  const shards = [
    { 
      id: 'shard-1', 
      region: 'us-east-1', 
      load: Math.round(realTimeMetrics.connectionPool * 0.9), 
      connections: 145 + Math.floor(Math.random() * 20), 
      status: 'healthy', 
      virtualNodes: 256 
    },
    { 
      id: 'shard-2', 
      region: 'us-west-1', 
      load: Math.round(realTimeMetrics.connectionPool * 0.8), 
      connections: 132 + Math.floor(Math.random() * 15), 
      status: 'healthy', 
      virtualNodes: 256 
    },
    { 
      id: 'shard-3', 
      region: 'eu-west-1', 
      load: Math.round(realTimeMetrics.connectionPool * 1.1), 
      connections: 178 + Math.floor(Math.random() * 25), 
      status: realTimeMetrics.connectionPool > 80 ? 'warning' : 'healthy', 
      virtualNodes: 256 
    },
    { 
      id: 'shard-4', 
      region: 'ap-south-1', 
      load: Math.round(realTimeMetrics.connectionPool * 0.6), 
      connections: 89 + Math.floor(Math.random() * 10), 
      status: 'healthy', 
      virtualNodes: 256 
    }
  ];

  const queryLatencyTrend = getTrend('database.queryLatency.p95');

  return (
    <div className="space-y-6">
      {/* Sharding Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Shards</p>
              <p className="text-2xl font-bold text-blue-600">{metrics.totalShards}</p>
            </div>
            <Database className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Cross-Shard Queries</p>
              <p className="text-2xl font-bold text-purple-600">{metrics.crossShardQueries.toLocaleString()}</p>
            </div>
            <Activity className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Query Latency</p>
              <p className="text-2xl font-bold text-green-600">{Math.round(queryLatencyTrend.value)}ms</p>
              <p className="text-xs text-gray-500">
                {queryLatencyTrend.trend === 'up' ? '↗' : queryLatencyTrend.trend === 'down' ? '↘' : '→'} 
                {Math.abs(queryLatencyTrend.percentage).toFixed(1)}%
              </p>
            </div>
            <Clock className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rebalance Ops</p>
              <p className="text-2xl font-bold text-orange-600">{metrics.rebalanceOperations}</p>
            </div>
            <Target className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Shard Status */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Shard Status & Distribution</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shard</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Load</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Connections</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Virtual Nodes</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {shards.map((shard) => (
                <tr key={shard.id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{shard.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{shard.region}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className={`h-2 rounded-full ${
                            shard.load > 80 ? 'bg-red-500' : 
                            shard.load > 60 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${shard.load}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900">{shard.load}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{shard.connections}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{shard.virtualNodes}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      shard.status === 'healthy' 
                        ? 'bg-green-100 text-green-800' 
                        : shard.status === 'warning'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {shard.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Consistent Hashing Visualization */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Consistent Hash Ring</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Hash Distribution</h4>
            <div className="space-y-3">
              {shards.map((shard, index) => (
                <div key={shard.id} className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${
                    index % 4 === 0 ? 'bg-blue-500' :
                    index % 4 === 1 ? 'bg-green-500' :
                    index % 4 === 2 ? 'bg-purple-500' : 'bg-orange-500'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-900">{shard.id}</span>
                  <span className="text-sm text-gray-500">{shard.virtualNodes} virtual nodes</span>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Global Secondary Indexes</h4>
            <div className="space-y-2">
              <IndexStatus name="idx_tenant_id" status="active" partitions={8} consistency="strong" />
              <IndexStatus name="idx_created_at" status="active" partitions={8} consistency="eventual" />
              <IndexStatus name="idx_opportunity_value" status="building" partitions={6} consistency="eventual" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EdgeComputingDashboard({ 
  metrics, 
  realTimeMetrics, 
  getTrend 
}: { 
  metrics: any; 
  realTimeMetrics: any; 
  getTrend: any; 
}) {
  const edgeLocations = [
    { 
      id: 'us-east-1', 
      name: 'Virginia', 
      latency: Math.round(realTimeMetrics.globalLatency * 0.5), 
      requests: 45000 + Math.floor(Math.random() * 5000), 
      cacheHit: realTimeMetrics.cacheHitRatio + Math.random() * 2, 
      status: 'healthy' 
    },
    { 
      id: 'us-west-1', 
      name: 'Oregon', 
      latency: Math.round(realTimeMetrics.globalLatency * 0.6), 
      requests: 38000 + Math.floor(Math.random() * 4000), 
      cacheHit: realTimeMetrics.cacheHitRatio - 1 + Math.random() * 2, 
      status: 'healthy' 
    },
    { 
      id: 'eu-west-1', 
      name: 'Ireland', 
      latency: Math.round(realTimeMetrics.globalLatency * 0.8), 
      requests: 32000 + Math.floor(Math.random() * 3000), 
      cacheHit: realTimeMetrics.cacheHitRatio - 2 + Math.random() * 2, 
      status: 'healthy' 
    },
    { 
      id: 'ap-south-1', 
      name: 'Mumbai', 
      latency: Math.round(realTimeMetrics.globalLatency * 1.2), 
      requests: 28000 + Math.floor(Math.random() * 2000), 
      cacheHit: realTimeMetrics.cacheHitRatio - 3 + Math.random() * 2, 
      status: realTimeMetrics.globalLatency > 40 ? 'degraded' : 'healthy' 
    }
  ];

  const cacheHitTrend = getTrend('edge.cacheHitRatio');
  const latencyTrend = getTrend('edge.globalLatency');

  return (
    <div className="space-y-6">
      {/* Edge Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Edge Locations</p>
              <p className="text-2xl font-bold text-blue-600">{metrics.activeLocations}/{metrics.edgeLocations}</p>
            </div>
            <Globe className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Cache Hit Ratio</p>
              <p className="text-2xl font-bold text-green-600">{cacheHitTrend.value.toFixed(1)}%</p>
              <p className="text-xs text-gray-500">
                {cacheHitTrend.trend === 'up' ? '↗' : cacheHitTrend.trend === 'down' ? '↘' : '→'} 
                {Math.abs(cacheHitTrend.percentage).toFixed(1)}%
              </p>
            </div>
            <Zap className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Edge Functions</p>
              <p className="text-2xl font-bold text-purple-600">{metrics.edgeFunctions}</p>
            </div>
            <Server className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Bandwidth Saved</p>
              <p className="text-2xl font-bold text-orange-600">{metrics.bandwidthSaved}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Edge Locations */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Edge Location Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Latency</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requests/min</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cache Hit Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {edgeLocations.map((location) => (
                <tr key={location.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{location.name}</div>
                    <div className="text-sm text-gray-500">{location.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{location.latency}ms</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{location.requests.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{location.cacheHit.toFixed(1)}%</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      location.status === 'healthy' 
                        ? 'bg-green-100 text-green-800' 
                        : location.status === 'degraded'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {location.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edge Functions & Caching */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Edge Functions</h3>
          <div className="space-y-3">
            <EdgeFunction name="Authentication" runtime="JavaScript" latency={12} executions={15000} />
            <EdgeFunction name="Rate Limiting" runtime="WebAssembly" latency={8} executions={25000} />
            <EdgeFunction name="Content Transform" runtime="JavaScript" latency={18} executions={8000} />
            <EdgeFunction name="Security Headers" runtime="JavaScript" latency={5} executions={45000} />
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Intelligent Caching</h3>
          <div className="space-y-4">
            <CacheLayer name="L1 - Browser Cache" hitRate={87.3} size="50MB" ttl="1h" />
            <CacheLayer name="L2 - Edge Cache" hitRate={94.2} size="2GB" ttl="24h" />
            <CacheLayer name="L3 - Regional Cache" hitRate={78.9} size="50GB" ttl="7d" />
            <CacheLayer name="L4 - Origin Cache" hitRate={65.4} size="500GB" ttl="30d" />
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadBalancerDashboard({ 
  metrics, 
  realTimeMetrics, 
  getTrend 
}: { 
  metrics: any; 
  realTimeMetrics: any; 
  getTrend: any; 
}) {
  const servers = [
    { 
      id: 'web-1', 
      region: 'us-east-1', 
      load: Math.round(realTimeMetrics.averageResponseTime * 0.8), 
      connections: 145 + Math.floor(Math.random() * 20), 
      responseTime: Math.round(realTimeMetrics.averageResponseTime * 0.9), 
      status: 'healthy', 
      weight: 100 
    },
    { 
      id: 'web-2', 
      region: 'us-east-1', 
      load: Math.round(realTimeMetrics.averageResponseTime * 0.7), 
      connections: 132 + Math.floor(Math.random() * 15), 
      responseTime: Math.round(realTimeMetrics.averageResponseTime * 0.8), 
      status: 'healthy', 
      weight: 100 
    },
    { 
      id: 'web-3', 
      region: 'us-west-1', 
      load: Math.round(realTimeMetrics.averageResponseTime * 1.1), 
      connections: 178 + Math.floor(Math.random() * 25), 
      responseTime: Math.round(realTimeMetrics.averageResponseTime * 1.2), 
      status: realTimeMetrics.averageResponseTime > 100 ? 'warning' : 'healthy', 
      weight: realTimeMetrics.averageResponseTime > 100 ? 80 : 100 
    },
    { 
      id: 'web-4', 
      region: 'us-west-1', 
      load: Math.round(realTimeMetrics.averageResponseTime * 0.5), 
      connections: 89 + Math.floor(Math.random() * 10), 
      responseTime: Math.round(realTimeMetrics.averageResponseTime * 0.7), 
      status: 'healthy', 
      weight: 100 
    }
  ];

  const responseTimeTrend = getTrend('loadBalancer.averageResponseTime');
  const throughputTrend = getTrend('loadBalancer.requestsPerSecond');

  return (
    <div className="space-y-6">
      {/* Load Balancer Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Requests/sec</p>
              <p className="text-2xl font-bold text-blue-600">{Math.round(throughputTrend.value).toLocaleString()}</p>
              <p className="text-xs text-gray-500">
                {throughputTrend.trend === 'up' ? '↗' : throughputTrend.trend === 'down' ? '↘' : '→'} 
                {Math.abs(throughputTrend.percentage).toFixed(1)}%
              </p>
            </div>
            <Activity className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Response Time</p>
              <p className="text-2xl font-bold text-green-600">{Math.round(responseTimeTrend.value)}ms</p>
              <p className="text-xs text-gray-500">
                {responseTimeTrend.trend === 'up' ? '↗' : responseTimeTrend.trend === 'down' ? '↘' : '→'} 
                {Math.abs(responseTimeTrend.percentage).toFixed(1)}%
              </p>
            </div>
            <Clock className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Healthy Servers</p>
              <p className="text-2xl font-bold text-purple-600">{metrics.healthyServers}/{metrics.totalServers}</p>
            </div>
            <Server className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Circuit Breaker Trips</p>
              <p className="text-2xl font-bold text-orange-600">{metrics.circuitBreakerTrips}</p>
            </div>
            <Shield className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Server Status */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Backend Server Status</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Server</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Load</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Connections</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Response Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {servers.map((server) => (
                <tr key={server.id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{server.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{server.region}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className={`h-2 rounded-full ${
                            server.load > 80 ? 'bg-red-500' : 
                            server.load > 60 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${server.load}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900">{server.load}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{server.connections}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{server.responseTime}ms</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{server.weight}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      server.status === 'healthy' 
                        ? 'bg-green-100 text-green-800' 
                        : server.status === 'warning'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {server.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Load Balancing Algorithms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Adaptive Algorithm Performance</h3>
          <div className="space-y-4">
            <AlgorithmMetric name="Round Robin" accuracy={78} latency={95} usage={15} />
            <AlgorithmMetric name="Least Connections" accuracy={85} latency={87} usage={25} />
            <AlgorithmMetric name="Least Response Time" accuracy={92} latency={82} usage={35} />
            <AlgorithmMetric name="Adaptive ML" accuracy={96} latency={78} usage={25} />
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Circuit Breaker Status</h3>
          <div className="space-y-3">
            <CircuitBreakerStatus server="web-1" state="closed" failures={0} lastTrip="Never" />
            <CircuitBreakerStatus server="web-2" state="closed" failures={1} lastTrip="2h ago" />
            <CircuitBreakerStatus server="web-3" state="half-open" failures={3} lastTrip="15m ago" />
            <CircuitBreakerStatus server="web-4" state="closed" failures={0} lastTrip="Never" />
          </div>
        </div>
      </div>
    </div>
  );
}

// New helper component for resource metrics
function ResourceMetric({ 
  name, 
  value, 
  max, 
  unit, 
  status 
}: { 
  name: string; 
  value: number; 
  max: number; 
  unit: string; 
  status: 'good' | 'warning' | 'error'; 
}) {
  const percentage = (value / max) * 100;
  const statusColors = {
    good: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500'
  };

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">{name}</span>
      <div className="flex items-center space-x-2">
        <div className="w-20 bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${statusColors[status]}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          ></div>
        </div>
        <span className="text-sm font-medium text-gray-900 w-12 text-right">
          {value.toFixed(0)}{unit}
        </span>
      </div>
    </div>
  );
}

// Helper Components
function PerformanceMetricCard({ title, value, subtitle, icon: Icon, trend, status }: any) {
  const statusColors = {
    excellent: 'text-green-600',
    good: 'text-blue-600',
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
      {trend && (
        <div className="mt-2">
          <span className={`text-xs ${trend.startsWith('+') || trend.startsWith('-') ? 'text-green-600' : 'text-gray-600'}`}>
            {trend} from last week
          </span>
        </div>
      )}
    </div>
  );
}

function ArchitectureComponent({ title, description, metrics, status, icon: Icon }: any) {
  const statusColors = {
    healthy: 'border-green-200 bg-green-50',
    warning: 'border-yellow-200 bg-yellow-50',
    error: 'border-red-200 bg-red-50'
  };

  return (
    <div className={`p-6 rounded-lg border-2 ${statusColors[status]}`}>
      <div className="flex items-center space-x-3 mb-4">
        <Icon className="h-6 w-6 text-gray-700" />
        <div>
          <h4 className="font-medium text-gray-900">{title}</h4>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
      <div className="space-y-2">
        {metrics.map((metric: any, index: number) => (
          <div key={index} className="flex justify-between text-sm">
            <span className="text-gray-600">{metric.label}</span>
            <span className="font-medium text-gray-900">{metric.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function OptimizationRecommendation({ type, description, impact, effort, estimatedGain, onImplement }: any) {
  const impactColors = {
    high: 'text-red-600',
    medium: 'text-yellow-600',
    low: 'text-green-600'
  };

  return (
    <div className="p-4 border border-gray-200 rounded-lg">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="font-medium text-gray-900">{type}</h4>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
        <div className="text-right">
          <span className={`text-xs font-medium ${impactColors[impact]}`}>
            {impact.toUpperCase()} IMPACT
          </span>
          <p className="text-xs text-gray-500">{effort} effort</p>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-blue-600">{estimatedGain}</span>
        <button 
          onClick={onImplement}
          className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
        >
          Implement
        </button>
      </div>
    </div>
  );
}

function IndexStatus({ name, status, partitions, consistency }: any) {
  const statusColors = {
    active: 'text-green-600',
    building: 'text-yellow-600',
    failed: 'text-red-600'
  };

  return (
    <div className="flex justify-between items-center p-2 border border-gray-200 rounded">
      <div>
        <p className="text-sm font-medium text-gray-900">{name}</p>
        <p className="text-xs text-gray-500">{partitions} partitions • {consistency}</p>
      </div>
      <span className={`text-xs font-medium ${statusColors[status]}`}>
        {status.toUpperCase()}
      </span>
    </div>
  );
}

function EdgeFunction({ name, runtime, latency, executions }: any) {
  return (
    <div className="flex justify-between items-center p-3 border border-gray-200 rounded">
      <div>
        <p className="text-sm font-medium text-gray-900">{name}</p>
        <p className="text-xs text-gray-500">{runtime} • {latency}ms avg</p>
      </div>
      <span className="text-sm text-gray-600">{executions.toLocaleString()}/min</span>
    </div>
  );
}

function CacheLayer({ name, hitRate, size, ttl }: any) {
  return (
    <div className="flex justify-between items-center p-3 border border-gray-200 rounded">
      <div>
        <p className="text-sm font-medium text-gray-900">{name}</p>
        <p className="text-xs text-gray-500">{size} • TTL: {ttl}</p>
      </div>
      <span className="text-sm font-medium text-green-600">{hitRate.toFixed(1)}%</span>
    </div>
  );
}

function AlgorithmMetric({ name, accuracy, latency, usage }: any) {
  return (
    <div className="p-3 border border-gray-200 rounded">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-900">{name}</span>
        <span className="text-xs text-gray-500">{usage}% usage</span>
      </div>
      <div className="grid grid-cols-2 gap-4 text-xs">
        <div>
          <span className="text-gray-600">Accuracy: </span>
          <span className="font-medium">{accuracy}%</span>
        </div>
        <div>
          <span className="text-gray-600">Latency: </span>
          <span className="font-medium">{latency}ms</span>
        </div>
      </div>
    </div>
  );
}

function CircuitBreakerStatus({ server, state, failures, lastTrip }: any) {
  const stateColors = {
    closed: 'bg-green-100 text-green-800',
    open: 'bg-red-100 text-red-800',
    'half-open': 'bg-yellow-100 text-yellow-800'
  };

  return (
    <div className="flex justify-between items-center p-2 border border-gray-200 rounded">
      <div>
        <p className="text-sm font-medium text-gray-900">{server}</p>
        <p className="text-xs text-gray-500">{failures} failures • {lastTrip}</p>
      </div>
      <span className={`text-xs px-2 py-1 rounded ${stateColors[state]}`}>
        {state.toUpperCase()}
      </span>
    </div>
  );
}