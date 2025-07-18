import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';

export default function SyncStatusWidget() {
  const { state, dispatch } = useAppContext();
  const { syncStatus } = state;

  const handleSyncNow = () => {
    dispatch({ type: 'UPDATE_SYNC_STATUS', payload: { status: 'pending' } });
    
    // Add notification for sync start
    dispatch({ 
      type: 'ADD_NOTIFICATION', 
      payload: {
        id: Date.now().toString(),
        type: 'info',
        title: 'Sync Started',
        message: 'Government data synchronization has been initiated.',
        timestamp: new Date(),
        read: false
      }
    });
    
    // Simulate sync process
    setTimeout(() => {
      const recordsProcessed = Math.floor(Math.random() * 500) + 1000;
      dispatch({ 
        type: 'UPDATE_SYNC_STATUS', 
        payload: { 
          status: 'success',
          lastSync: new Date().toISOString(),
          recordsProcessed
        } 
      });
      
      // Add notification for sync completion
      dispatch({ 
        type: 'ADD_NOTIFICATION', 
        payload: {
          id: (Date.now() + 1).toString(),
          type: 'success',
          title: 'Sync Completed',
          message: `Government data sync completed successfully. ${recordsProcessed.toLocaleString()} records processed.`,
          timestamp: new Date(),
          read: false
        }
      });
    }, 3000);
  };

  const getStatusIcon = () => {
    switch (syncStatus.status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'pending':
        return <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <RefreshCw className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusText = () => {
    switch (syncStatus.status) {
      case 'success':
        return 'Sync Completed';
      case 'pending':
        return 'Syncing...';
      case 'error':
        return 'Sync Failed';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = () => {
    switch (syncStatus.status) {
      case 'success':
        return 'text-green-600';
      case 'pending':
        return 'text-blue-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Government Data Sync</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <span className={`text-sm font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </span>
          </div>
          <button className="text-xs text-blue-600 hover:text-blue-800">
            View Details
          </button>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Last Sync:</span>
            <span className="text-gray-900">
              {new Date(syncStatus.lastSync).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Records Processed:</span>
            <span className="text-gray-900">{syncStatus.recordsProcessed.toLocaleString()}</span>
          </div>
        </div>

        <button 
          onClick={handleSyncNow}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Sync Now
        </button>
      </div>
    </div>
  );
}