import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { RefreshCw, CheckCircle, AlertTriangle, Clock, Database } from 'lucide-react';

export default function SyncStatus() {
  const { state, dispatch } = useAppContext();
  const { syncStatus } = state;

  const handleSyncNow = () => {
    dispatch({ type: 'UPDATE_SYNC_STATUS', payload: { status: 'pending' } });
    
    // Simulate sync process
    setTimeout(() => {
      dispatch({ 
        type: 'UPDATE_SYNC_STATUS', 
        payload: { 
          status: 'success',
          lastSync: new Date().toISOString(),
          recordsProcessed: Math.floor(Math.random() * 500) + 1000
        } 
      });
    }, 3000);
  };

  const getStatusConfig = () => {
    switch (syncStatus.status) {
      case 'success':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          text: 'Sync Completed Successfully'
        };
      case 'pending':
        return {
          icon: RefreshCw,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          text: 'Synchronization in Progress'
        };
      case 'error':
        return {
          icon: AlertTriangle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          text: 'Sync Failed - Check Configuration'
        };
      default:
        return {
          icon: Clock,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          text: 'Unknown Status'
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Sync Status</h3>
      
      <div className={`p-4 rounded-lg border ${statusConfig.bgColor} ${statusConfig.borderColor} mb-4`}>
        <div className="flex items-center space-x-3">
          <StatusIcon className={`h-6 w-6 ${statusConfig.color} ${syncStatus.status === 'pending' ? 'animate-spin' : ''}`} />
          <div>
            <p className={`font-medium ${statusConfig.color}`}>{statusConfig.text}</p>
            <p className="text-sm text-gray-600 mt-1">
              Last sync: {new Date(syncStatus.lastSync).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <Database className="h-6 w-6 text-gray-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-900">{syncStatus.recordsProcessed.toLocaleString()}</p>
          <p className="text-xs text-gray-500">Records Processed</p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <Clock className="h-6 w-6 text-gray-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-900">2.3s</p>
          <p className="text-xs text-gray-500">Last Duration</p>
        </div>
      </div>

      <button
        onClick={handleSyncNow}
        disabled={syncStatus.status === 'pending'}
        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {syncStatus.status === 'pending' ? 'Syncing...' : 'Sync Now'}
      </button>
    </div>
  );
}