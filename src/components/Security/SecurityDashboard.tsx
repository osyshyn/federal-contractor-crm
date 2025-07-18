import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Lock, 
  Eye, 
  AlertTriangle, 
  CheckCircle, 
  Activity,
  Users,
  Server,
  Key,
  FileText,
  TrendingUp,
  Clock,
  Globe
} from 'lucide-react';

export default function SecurityDashboard() {
  const { dispatch } = useAppContext();
  const [activeTab, setActiveTab] = useState<'overview' | 'zero-trust' | 'crypto' | 'compliance'>('overview');
  const [securityMetrics, setSecurityMetrics] = useState({
    trustScore: 87,
    threatsBlocked: 1247,
    complianceScore: 94,
    activeDevices: 156,
    riskLevel: 'low',
    encryptedData: 98.7,
    quantumReady: 45
  });

  const tabs = [
    { id: 'overview', name: 'Security Overview', icon: Shield },
    { id: 'zero-trust', name: 'Zero Trust', icon: Lock },
    { id: 'crypto', name: 'Cryptography', icon: Key },
    { id: 'compliance', name: 'Compliance', icon: FileText }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Advanced Security & Compliance</h1>
          <p className="text-gray-600">Enterprise-grade security with zero-trust architecture and quantum-resistant cryptography</p>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <div className={`w-3 h-3 rounded-full ${
            securityMetrics.riskLevel === 'low' ? 'bg-green-500' : 
            securityMetrics.riskLevel === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
          }`}></div>
          <span className="capitalize">{securityMetrics.riskLevel} Risk Level</span>
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
      {activeTab === 'overview' && <SecurityOverview metrics={securityMetrics} />}
      {activeTab === 'zero-trust' && <ZeroTrustDashboard />}
      {activeTab === 'crypto' && <CryptographyDashboard />}
      {activeTab === 'compliance' && <ComplianceDashboard />}
    </div>
  );
}

function SecurityOverview({ metrics }: { metrics: any }) {
  return (
    <div className="space-y-6">
      {/* Key Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SecurityMetricCard
          title="Trust Score"
          value={`${metrics.trustScore}%`}
          subtitle="Zero Trust Architecture"
          icon={Shield}
          trend="+2.3%"
          status="good"
        />
        <SecurityMetricCard
          title="Threats Blocked"
          value={metrics.threatsBlocked.toLocaleString()}
          subtitle="Last 30 days"
          icon={AlertTriangle}
          trend="+15%"
          status="good"
        />
        <SecurityMetricCard
          title="Compliance Score"
          value={`${metrics.complianceScore}%`}
          subtitle="GDPR, SOC2, NIST"
          icon={CheckCircle}
          trend="+1.2%"
          status="good"
        />
        <SecurityMetricCard
          title="Encrypted Data"
          value={`${metrics.encryptedData}%`}
          subtitle="At rest & in transit"
          icon={Lock}
          trend="0%"
          status="good"
        />
      </div>

      {/* Security Architecture Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Architecture</h3>
          <div className="space-y-4">
            <ArchitectureComponent
              name="Zero Trust Network"
              status="active"
              description="Identity-based network segmentation with continuous authentication"
            />
            <ArchitectureComponent
              name="Advanced Cryptography"
              status="active"
              description="Quantum-resistant algorithms with homomorphic encryption"
            />
            <ArchitectureComponent
              name="Behavioral Analytics"
              status="active"
              description="ML-based threat detection and anomaly identification"
            />
            <ArchitectureComponent
              name="Compliance Automation"
              status="active"
              description="Automated GDPR/CCPA compliance with audit trails"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Threat Intelligence</h3>
          <div className="space-y-3">
            <ThreatAlert
              type="Behavioral Anomaly"
              severity="medium"
              description="Unusual access pattern detected for user john.doe@company.com"
              time="2 minutes ago"
            />
            <ThreatAlert
              type="Failed Authentication"
              severity="low"
              description="Multiple failed login attempts from IP 192.168.1.100"
              time="15 minutes ago"
            />
            <ThreatAlert
              type="Compliance Check"
              severity="info"
              description="Automated GDPR compliance scan completed successfully"
              time="1 hour ago"
            />
          </div>
        </div>
      </div>

      {/* Security Trends */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Trends</h3>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <TrendingUp className="h-12 w-12 text-blue-600 mx-auto mb-2" />
            <p className="text-gray-600">Security metrics trending upward</p>
            <p className="text-sm text-gray-500">Trust score improved 12% this month</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ZeroTrustDashboard() {
  return (
    <div className="space-y-6">
      {/* Zero Trust Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Device Trust Score</p>
              <p className="text-2xl font-bold text-green-600">92%</p>
            </div>
            <Server className="h-8 w-8 text-green-600" />
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm">
              <span>Compliant Devices</span>
              <span>147/160</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Network Segments</p>
              <p className="text-2xl font-bold text-blue-600">8</p>
            </div>
            <Globe className="h-8 w-8 text-blue-600" />
          </div>
          <div className="mt-4 space-y-1">
            <div className="flex justify-between text-sm">
              <span>Trusted</span>
              <span className="text-green-600">3</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Restricted</span>
              <span className="text-yellow-600">4</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Quarantine</span>
              <span className="text-red-600">1</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Sessions</p>
              <p className="text-2xl font-bold text-purple-600">234</p>
            </div>
            <Users className="h-8 w-8 text-purple-600" />
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm">
              <span>Continuous Auth</span>
              <span className="text-green-600">✓ Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Identity & Device Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Identity Trust Factors</h3>
          <div className="space-y-4">
            <TrustFactor name="Multi-Factor Authentication" score={95} weight={30} />
            <TrustFactor name="Device Compliance" score={88} weight={25} />
            <TrustFactor name="Network Location" score={92} weight={20} />
            <TrustFactor name="Behavioral Pattern" score={85} weight={15} />
            <TrustFactor name="Time & Context" score={90} weight={10} />
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Behavioral Analytics</h3>
          <div className="space-y-3">
            <BehaviorAlert
              type="Typing Pattern Anomaly"
              user="sarah.wilson@company.com"
              confidence={78}
              action="Additional verification required"
            />
            <BehaviorAlert
              type="Unusual Access Time"
              user="mike.chen@company.com"
              confidence={65}
              action="Monitoring increased"
            />
            <BehaviorAlert
              type="New Device Login"
              user="john.smith@company.com"
              confidence={92}
              action="Device registration pending"
            />
          </div>
        </div>
      </div>

      {/* Network Segmentation */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Network Segmentation Map</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <NetworkSegment
            name="Trusted Internal"
            cidr="10.0.0.0/8"
            trustLevel="high"
            devices={45}
            monitoring="low"
          />
          <NetworkSegment
            name="DMZ"
            cidr="172.16.0.0/12"
            trustLevel="medium"
            devices={23}
            monitoring="high"
          />
          <NetworkSegment
            name="Quarantine"
            cidr="192.168.100.0/24"
            trustLevel="low"
            devices={3}
            monitoring="critical"
          />
        </div>
      </div>
    </div>
  );
}

function CryptographyDashboard() {
  return (
    <div className="space-y-6">
      {/* Cryptography Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Encryption Coverage</p>
              <p className="text-2xl font-bold text-green-600">99.2%</p>
            </div>
            <Lock className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Quantum Ready</p>
              <p className="text-2xl font-bold text-blue-600">67%</p>
            </div>
            <Key className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">HSM Keys</p>
              <p className="text-2xl font-bold text-purple-600">1,247</p>
            </div>
            <Server className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Key Rotations</p>
              <p className="text-2xl font-bold text-orange-600">23</p>
            </div>
            <Activity className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Cryptographic Algorithms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quantum-Resistant Algorithms</h3>
          <div className="space-y-4">
            <CryptoAlgorithm
              name="Kyber (Key Encapsulation)"
              type="Lattice-based"
              securityLevel={3}
              status="deployed"
              usage="Key exchange"
            />
            <CryptoAlgorithm
              name="Dilithium (Digital Signatures)"
              type="Lattice-based"
              securityLevel={3}
              status="deployed"
              usage="Authentication"
            />
            <CryptoAlgorithm
              name="SPHINCS+ (Hash-based)"
              type="Hash-based"
              securityLevel={5}
              status="testing"
              usage="Long-term signatures"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Homomorphic Encryption</h3>
          <div className="space-y-4">
            <HomomorphicScheme
              scheme="BFV"
              purpose="Integer arithmetic"
              performance="High"
              usage="Financial calculations"
            />
            <HomomorphicScheme
              scheme="CKKS"
              purpose="Approximate arithmetic"
              performance="Medium"
              usage="ML inference"
            />
            <HomomorphicScheme
              scheme="TFHE"
              purpose="Boolean circuits"
              performance="Low"
              usage="Private queries"
            />
          </div>
        </div>
      </div>

      {/* Key Management */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Management & HSM Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">HSM Clusters</h4>
            <HSMStatus name="Primary Cluster" status="healthy" utilization={67} />
            <HSMStatus name="DR Cluster" status="healthy" utilization={23} />
            <HSMStatus name="Dev Cluster" status="maintenance" utilization={0} />
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Key Rotation Schedule</h4>
            <KeyRotation type="Encryption Keys" nextRotation="2 days" status="scheduled" />
            <KeyRotation type="Signing Keys" nextRotation="15 days" status="scheduled" />
            <KeyRotation type="Root CA" nextRotation="180 days" status="scheduled" />
          </div>
          
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Multi-Party Computation</h4>
            <MPCProtocol name="Financial Analytics" participants={3} status="active" />
            <MPCProtocol name="Risk Assessment" participants={5} status="active" />
            <MPCProtocol name="Compliance Audit" participants={2} status="completed" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ComplianceDashboard() {
  return (
    <div className="space-y-6">
      {/* Compliance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">GDPR Compliance</p>
              <p className="text-2xl font-bold text-green-600">96%</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Data Subject Requests</p>
              <p className="text-2xl font-bold text-blue-600">47</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Audit Trails</p>
              <p className="text-2xl font-bold text-purple-600">1.2M</p>
            </div>
            <FileText className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Retention Violations</p>
              <p className="text-2xl font-bold text-red-600">3</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Compliance Frameworks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance Frameworks</h3>
          <div className="space-y-4">
            <ComplianceFramework
              name="GDPR"
              score={96}
              requirements={47}
              compliant={45}
              lastAssessment="2 days ago"
            />
            <ComplianceFramework
              name="CCPA"
              score={92}
              requirements={23}
              compliant={21}
              lastAssessment="1 week ago"
            />
            <ComplianceFramework
              name="SOC 2 Type II"
              score={89}
              requirements={64}
              compliant={57}
              lastAssessment="1 month ago"
            />
            <ComplianceFramework
              name="NIST Cybersecurity"
              score={94}
              requirements={108}
              compliant={102}
              lastAssessment="3 days ago"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Subject Requests</h3>
          <div className="space-y-3">
            <DataSubjectRequest
              type="Right to Access"
              count={23}
              avgProcessingTime="2.3 days"
              status="compliant"
            />
            <DataSubjectRequest
              type="Right to Erasure"
              count={15}
              avgProcessingTime="1.8 days"
              status="compliant"
            />
            <DataSubjectRequest
              type="Data Portability"
              count={8}
              avgProcessingTime="3.1 days"
              status="warning"
            />
            <DataSubjectRequest
              type="Right to Rectification"
              count={1}
              avgProcessingTime="1.2 days"
              status="compliant"
            />
          </div>
        </div>
      </div>

      {/* Data Lineage & Audit */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Lineage & Audit Trail</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Data Sources</h4>
            <div className="space-y-2">
              <DataSource name="Customer Database" classification="confidential" records="2.3M" />
              <DataSource name="Analytics Warehouse" classification="internal" records="15.7M" />
              <DataSource name="Audit Logs" classification="restricted" records="890K" />
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Processing Activities</h4>
            <div className="space-y-2">
              <ProcessingActivity name="Customer Analytics" purpose="legitimate_interests" retention="2 years" />
              <ProcessingActivity name="Marketing Campaigns" purpose="consent" retention="1 year" />
              <ProcessingActivity name="Financial Reporting" purpose="legal_obligation" retention="7 years" />
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Regulatory Changes</h4>
            <div className="space-y-2">
              <RegulatoryChange
                title="GDPR Article 25 Update"
                impact="medium"
                deadline="30 days"
                status="in_progress"
              />
              <RegulatoryChange
                title="CCPA Amendment 2024"
                impact="low"
                deadline="90 days"
                status="planned"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function SecurityMetricCard({ title, value, subtitle, icon: Icon, trend, status }: any) {
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
      {trend && (
        <div className="mt-2">
          <span className="text-xs text-green-600">{trend} from last month</span>
        </div>
      )}
    </div>
  );
}

function ArchitectureComponent({ name, status, description }: any) {
  return (
    <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
      <div className={`w-3 h-3 rounded-full mt-1 ${
        status === 'active' ? 'bg-green-500' : 'bg-gray-400'
      }`}></div>
      <div>
        <p className="font-medium text-gray-900">{name}</p>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
}

function ThreatAlert({ type, severity, description, time }: any) {
  const severityColors = {
    critical: 'border-red-500 bg-red-50',
    high: 'border-orange-500 bg-orange-50',
    medium: 'border-yellow-500 bg-yellow-50',
    low: 'border-blue-500 bg-blue-50',
    info: 'border-gray-500 bg-gray-50'
  };

  return (
    <div className={`border-l-4 p-3 ${severityColors[severity]}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="font-medium text-gray-900">{type}</p>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
        <span className="text-xs text-gray-500">{time}</span>
      </div>
    </div>
  );
}

function TrustFactor({ name, score, weight }: any) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="flex justify-between text-sm mb-1">
          <span className="font-medium text-gray-900">{name}</span>
          <span className="text-gray-600">{score}% (weight: {weight}%)</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${
              score >= 90 ? 'bg-green-500' : 
              score >= 70 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${score}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}

function BehaviorAlert({ type, user, confidence, action }: any) {
  return (
    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-medium text-yellow-900">{type}</p>
          <p className="text-sm text-yellow-700">{user}</p>
          <p className="text-xs text-yellow-600">Confidence: {confidence}%</p>
        </div>
        <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">
          {action}
        </span>
      </div>
    </div>
  );
}

function NetworkSegment({ name, cidr, trustLevel, devices, monitoring }: any) {
  const trustColors = {
    high: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-red-100 text-red-800'
  };

  return (
    <div className="p-4 border border-gray-200 rounded-lg">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-gray-900">{name}</h4>
        <span className={`text-xs px-2 py-1 rounded ${trustColors[trustLevel]}`}>
          {trustLevel} trust
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-2">{cidr}</p>
      <div className="flex justify-between text-sm">
        <span>Devices: {devices}</span>
        <span className="capitalize">Monitor: {monitoring}</span>
      </div>
    </div>
  );
}

function CryptoAlgorithm({ name, type, securityLevel, status, usage }: any) {
  const statusColors = {
    deployed: 'bg-green-100 text-green-800',
    testing: 'bg-yellow-100 text-yellow-800',
    planned: 'bg-gray-100 text-gray-800'
  };

  return (
    <div className="p-3 border border-gray-200 rounded-lg">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-gray-900">{name}</h4>
        <span className={`text-xs px-2 py-1 rounded ${statusColors[status]}`}>
          {status}
        </span>
      </div>
      <p className="text-sm text-gray-600">{type} • Level {securityLevel}</p>
      <p className="text-xs text-gray-500">{usage}</p>
    </div>
  );
}

function HomomorphicScheme({ scheme, purpose, performance, usage }: any) {
  const performanceColors = {
    High: 'text-green-600',
    Medium: 'text-yellow-600',
    Low: 'text-red-600'
  };

  return (
    <div className="p-3 border border-gray-200 rounded-lg">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-gray-900">{scheme}</h4>
        <span className={`text-xs font-medium ${performanceColors[performance]}`}>
          {performance}
        </span>
      </div>
      <p className="text-sm text-gray-600">{purpose}</p>
      <p className="text-xs text-gray-500">{usage}</p>
    </div>
  );
}

function HSMStatus({ name, status, utilization }: any) {
  const statusColors = {
    healthy: 'text-green-600',
    maintenance: 'text-yellow-600',
    error: 'text-red-600'
  };

  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-900">{name}</span>
      <div className="text-right">
        <span className={`text-xs font-medium ${statusColors[status]}`}>
          {status}
        </span>
        <p className="text-xs text-gray-500">{utilization}% used</p>
      </div>
    </div>
  );
}

function KeyRotation({ type, nextRotation, status }: any) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-900">{type}</span>
      <div className="text-right">
        <p className="text-xs text-gray-900">{nextRotation}</p>
        <span className="text-xs text-green-600">{status}</span>
      </div>
    </div>
  );
}

function MPCProtocol({ name, participants, status }: any) {
  const statusColors = {
    active: 'text-green-600',
    completed: 'text-blue-600',
    failed: 'text-red-600'
  };

  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-900">{name}</span>
      <div className="text-right">
        <p className="text-xs text-gray-900">{participants} parties</p>
        <span className={`text-xs ${statusColors[status]}`}>{status}</span>
      </div>
    </div>
  );
}

function ComplianceFramework({ name, score, requirements, compliant, lastAssessment }: any) {
  return (
    <div className="p-3 border border-gray-200 rounded-lg">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-gray-900">{name}</h4>
        <span className={`text-sm font-bold ${
          score >= 95 ? 'text-green-600' : 
          score >= 85 ? 'text-yellow-600' : 'text-red-600'
        }`}>
          {score}%
        </span>
      </div>
      <div className="flex justify-between text-sm text-gray-600 mb-1">
        <span>Requirements: {compliant}/{requirements}</span>
        <span>{lastAssessment}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1">
        <div
          className={`h-1 rounded-full ${
            score >= 95 ? 'bg-green-500' : 
            score >= 85 ? 'bg-yellow-500' : 'bg-red-500'
          }`}
          style={{ width: `${score}%` }}
        ></div>
      </div>
    </div>
  );
}

function DataSubjectRequest({ type, count, avgProcessingTime, status }: any) {
  const statusColors = {
    compliant: 'text-green-600',
    warning: 'text-yellow-600',
    violation: 'text-red-600'
  };

  return (
    <div className="flex justify-between items-center p-2 border border-gray-200 rounded">
      <div>
        <p className="text-sm font-medium text-gray-900">{type}</p>
        <p className="text-xs text-gray-500">{count} requests</p>
      </div>
      <div className="text-right">
        <p className="text-sm text-gray-900">{avgProcessingTime}</p>
        <span className={`text-xs ${statusColors[status]}`}>
          {status}
        </span>
      </div>
    </div>
  );
}

function DataSource({ name, classification, records }: any) {
  const classificationColors = {
    confidential: 'bg-red-100 text-red-800',
    internal: 'bg-yellow-100 text-yellow-800',
    restricted: 'bg-purple-100 text-purple-800'
  };

  return (
    <div className="p-2 border border-gray-200 rounded">
      <div className="flex justify-between items-start">
        <p className="text-sm font-medium text-gray-900">{name}</p>
        <span className={`text-xs px-2 py-1 rounded ${classificationColors[classification]}`}>
          {classification}
        </span>
      </div>
      <p className="text-xs text-gray-500">{records} records</p>
    </div>
  );
}

function ProcessingActivity({ name, purpose, retention }: any) {
  return (
    <div className="p-2 border border-gray-200 rounded">
      <p className="text-sm font-medium text-gray-900">{name}</p>
      <p className="text-xs text-gray-600">Purpose: {purpose.replace('_', ' ')}</p>
      <p className="text-xs text-gray-500">Retention: {retention}</p>
    </div>
  );
}

function RegulatoryChange({ title, impact, deadline, status }: any) {
  const impactColors = {
    high: 'text-red-600',
    medium: 'text-yellow-600',
    low: 'text-green-600'
  };

  const statusColors = {
    in_progress: 'bg-blue-100 text-blue-800',
    planned: 'bg-gray-100 text-gray-800',
    completed: 'bg-green-100 text-green-800'
  };

  return (
    <div className="p-2 border border-gray-200 rounded">
      <div className="flex justify-between items-start mb-1">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <span className={`text-xs px-2 py-1 rounded ${statusColors[status]}`}>
          {status.replace('_', ' ')}
        </span>
      </div>
      <div className="flex justify-between text-xs">
        <span className={impactColors[impact]}>{impact} impact</span>
        <span className="text-gray-500">{deadline}</span>
      </div>
    </div>
  );
}