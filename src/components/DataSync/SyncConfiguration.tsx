import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Settings, Save } from 'lucide-react';

export default function SyncConfiguration() {
  const { dispatch } = useAppContext();
  const [config, setConfig] = useState({
    autoSync: true,
    syncInterval: '4',
    retryAttempts: '3',
    batchSize: '500',
    conflictResolution: 'government_wins'
  });

  const handleSave = () => {
    dispatch({ 
      type: 'ADD_NOTIFICATION', 
      payload: {
        id: Date.now().toString(),
        type: 'success',
        title: 'Configuration Saved',
        message: 'Sync configuration has been updated successfully.',
        timestamp: new Date(),
        read: false
      }
    });
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="flex items-center space-x-2 mb-4">
        <Settings className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Sync Configuration</h3>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">Automatic Sync</label>
            <p className="text-xs text-gray-500">Enable scheduled synchronization</p>
          </div>
          <input
            type="checkbox"
            checked={config.autoSync}
            onChange={(e) => setConfig(prev => ({ ...prev, autoSync: e.target.checked }))}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sync Interval (hours)
          </label>
          <select
            value={config.syncInterval}
            onChange={(e) => setConfig(prev => ({ ...prev, syncInterval: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="1">Every hour</option>
            <option value="4">Every 4 hours</option>
            <option value="8">Every 8 hours</option>
            <option value="24">Daily</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Retry Attempts
          </label>
          <input
            type="number"
            value={config.retryAttempts}
            onChange={(e) => setConfig(prev => ({ ...prev, retryAttempts: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min="1"
            max="10"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Batch Size
          </label>
          <input
            type="number"
            value={config.batchSize}
            onChange={(e) => setConfig(prev => ({ ...prev, batchSize: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min="100"
            max="1000"
            step="100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Conflict Resolution
          </label>
          <select
            value={config.conflictResolution}
            onChange={(e) => setConfig(prev => ({ ...prev, conflictResolution: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="government_wins">Government Data Wins</option>
            <option value="crm_wins">CRM Data Wins</option>
            <option value="manual_review">Manual Review Required</option>
            <option value="merge_fields">Merge Non-Conflicting Fields</option>
          </select>
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
        >
          <Save className="h-4 w-4" />
          <span>Save Configuration</span>
        </button>
      </div>
    </div>
  );
}