import React from 'react';
import SyncStatus from './SyncStatus';
import SyncHistory from './SyncHistory';
import SyncConfiguration from './SyncConfiguration';
import ApiEndpoints from './ApiEndpoints';

export default function DataSyncPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Government Data Synchronization</h1>
          <p className="text-gray-600">Monitor and manage data synchronization between government sources and CRM</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SyncStatus />
        <SyncConfiguration />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SyncHistory />
        <ApiEndpoints />
      </div>
    </div>
  );
}