import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { CheckCircle, AlertTriangle, Clock } from 'lucide-react';

export default function SyncHistory() {
  const { dispatch } = useAppContext();
  const syncHistory = [
    {
      id: '1',
      timestamp: '2025-01-27T10:30:00Z',
      status: 'success',
      recordsProcessed: 1247,
      duration: '2.3s',
      changes: 15
    },
    {
      id: '2',
      timestamp: '2025-01-27T06:30:00Z',
      status: 'success',
      recordsProcessed: 1203,
      duration: '1.8s',
      changes: 8
    },
    {
      id: '3',
      timestamp: '2025-01-27T02:30:00Z',
      status: 'error',
      recordsProcessed: 0,
      duration: '0.5s',
      changes: 0,
      error: 'API rate limit exceeded'
    },
    {
      id: '4',
      timestamp: '2025-01-26T22:30:00Z',
      status: 'success',
      recordsProcessed: 1156,
      duration: '2.1s',
      changes: 23
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Sync History</h3>
      
      <div className="space-y-3">
        {syncHistory.map(sync => (
          <div key={sync.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              {getStatusIcon(sync.status)}
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(sync.timestamp).toLocaleString()}
                </p>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span>{sync.recordsProcessed.toLocaleString()} records</span>
                  <span>{sync.duration}</span>
                  {sync.changes > 0 && <span>{sync.changes} changes</span>}
                </div>
                {sync.error && (
                  <p className="text-xs text-red-600 mt-1">{sync.error}</p>
                )}
              </div>
            </div>
            <span className={`text-xs font-medium capitalize ${getStatusColor(sync.status)}`}>
              {sync.status}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 text-center">
        <button 
          onClick={() => {
            dispatch({ 
              type: 'ADD_NOTIFICATION', 
              payload: {
                id: Date.now().toString(),
                type: 'info',
                title: 'History Loaded',
                message: 'Complete sync history has been loaded.',
                timestamp: new Date(),
                read: false
              }
            });
          }}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          View All History
        </button>
      </div>
    </div>
  );
}