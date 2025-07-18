import React from 'react';
import { useAppContext } from '../../context/AppContext';
import MetricsCards from './MetricsCards';
import PipelineChart from './PipelineChart';
import RecentActivities from './RecentActivities';
import SyncStatusWidget from './SyncStatusWidget';

export default function Dashboard() {
  const { state } = useAppContext();

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Welcome back, {state.currentUser.name}
        </div>
      </div>

      <MetricsCards />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PipelineChart />
        </div>
        <div className="space-y-6">
          <SyncStatusWidget />
          <RecentActivities />
        </div>
      </div>
    </div>
  );
}