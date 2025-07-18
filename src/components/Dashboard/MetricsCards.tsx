import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { DollarSign, Target, TrendingUp, Users } from 'lucide-react';

export default function MetricsCards() {
  const { state } = useAppContext();

  const totalValue = state.opportunities.reduce((sum, opp) => sum + opp.value, 0);
  const averageProbability = state.opportunities.reduce((sum, opp) => sum + opp.probability, 0) / state.opportunities.length;
  const activeOpportunities = state.opportunities.length;
  const teamMembers = new Set(state.opportunities.flatMap(opp => opp.assignedTo)).size;

  const metrics = [
    {
      title: 'Total Pipeline Value',
      value: `$${(totalValue / 1000000).toFixed(1)}M`,
      change: '+12.3%',
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      title: 'Active Opportunities',
      value: activeOpportunities.toString(),
      change: '+3',
      icon: Target,
      color: 'text-blue-600'
    },
    {
      title: 'Avg Win Probability',
      value: `${averageProbability.toFixed(0)}%`,
      change: '+5.2%',
      icon: TrendingUp,
      color: 'text-purple-600'
    },
    {
      title: 'Team Members',
      value: teamMembers.toString(),
      change: '+1',
      icon: Users,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <div key={metric.title} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{metric.value}</p>
                <p className={`text-sm mt-1 ${metric.color}`}>{metric.change} from last month</p>
              </div>
              <div className={`p-3 rounded-full bg-gray-50`}>
                <Icon className={`h-6 w-6 ${metric.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}