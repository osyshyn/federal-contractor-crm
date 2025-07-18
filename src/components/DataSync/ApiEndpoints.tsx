import React from 'react';
import { ExternalLink, Copy, Check } from 'lucide-react';

export default function ApiEndpoints() {
  const [copiedEndpoint, setCopiedEndpoint] = React.useState<string | null>(null);

  const endpoints = [
    {
      name: 'Government Opportunities',
      method: 'GET',
      url: '/api/v1/government/opportunities',
      description: 'Fetch latest government opportunity data',
      lastUsed: '2 minutes ago'
    },
    {
      name: 'Sync Status',
      method: 'GET',
      url: '/api/v1/sync/status',
      description: 'Get current synchronization status',
      lastUsed: '5 minutes ago'
    },
    {
      name: 'Push CRM Data',
      method: 'POST',
      url: '/api/v1/crm/opportunities',
      description: 'Send opportunity updates to CRM',
      lastUsed: '10 minutes ago'
    },
    {
      name: 'Webhook Receiver',
      method: 'POST',
      url: '/api/v1/webhooks/government',
      description: 'Receive real-time government data updates',
      lastUsed: '1 hour ago'
    }
  ];

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(`https://api.fedcrm.com${url}`);
    setCopiedEndpoint(url);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET':
        return 'bg-green-100 text-green-800';
      case 'POST':
        return 'bg-blue-100 text-blue-800';
      case 'PUT':
        return 'bg-yellow-100 text-yellow-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">API Endpoints</h3>
        <button
          onClick={() => {
            window.open('https://docs.fedcrm.com/api', '_blank');
          }}
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
        >
          <ExternalLink className="h-4 w-4" />
          <span>View Documentation</span>
        </button>
      </div>
      
      <div className="space-y-3">
        {endpoints.map(endpoint => (
          <div key={endpoint.url} className="p-3 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <span className={`text-xs font-medium px-2 py-1 rounded ${getMethodColor(endpoint.method)}`}>
                  {endpoint.method}
                </span>
                <span className="font-medium text-gray-900 text-sm">{endpoint.name}</span>
              </div>
              <button
                onClick={() => copyToClipboard(endpoint.url)}
                className="p-1 text-gray-400 hover:text-gray-600"
                title="Copy endpoint URL"
              >
                {copiedEndpoint === endpoint.url ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
            
            <div className="text-xs text-gray-600 space-y-1">
              <p className="font-mono bg-gray-50 px-2 py-1 rounded">
                https://api.fedcrm.com{endpoint.url}
              </p>
              <p>{endpoint.description}</p>
              <p className="text-gray-500">Last used: {endpoint.lastUsed}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> All API endpoints require proper authentication and 
          adhere to the same permission model as the CRM interface.
        </p>
      </div>
    </div>
  );
}