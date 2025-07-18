import React from 'react';
import { Clock, FileText, Users, Award } from 'lucide-react';

export default function RecentActivities() {
  const activities = [
    {
      id: '1',
      type: 'proposal',
      message: 'Proposal submitted for DOD Cybersecurity RFP',
      time: '2 hours ago',
      icon: FileText,
      color: 'text-blue-600'
    },
    {
      id: '2',
      type: 'team',
      message: 'Mike Chen added to NASA Data Analytics team',
      time: '4 hours ago',
      icon: Users,
      color: 'text-green-600'
    },
    {
      id: '3',
      type: 'opportunity',
      message: 'DHS Border Security Tech moved to RFI Response',
      time: '6 hours ago',
      icon: Award,
      color: 'text-purple-600'
    },
    {
      id: '4',
      type: 'sync',
      message: 'Government data sync completed - 1,247 records updated',
      time: '8 hours ago',
      icon: Clock,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
      
      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = activity.icon;
          return (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className={`p-2 rounded-full bg-gray-50`}>
                <Icon className={`h-4 w-4 ${activity.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">{activity.message}</p>
                <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}