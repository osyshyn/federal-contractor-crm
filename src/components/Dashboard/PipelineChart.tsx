import React from 'react';
import { useAppContext } from '../../context/AppContext';

export default function PipelineChart() {
  const { state } = useAppContext();

  const stages = ['RFI Response', 'Qualification', 'Proposal Development', 'Final Review', 'Awarded'];
  const stageData = stages.map(stage => {
    const opportunities = state.opportunities.filter(opp => opp.stage === stage);
    const value = opportunities.reduce((sum, opp) => sum + opp.value, 0);
    return {
      stage,
      count: opportunities.length,
      value,
      opportunities
    };
  });

  const maxValue = Math.max(...stageData.map(s => s.value));

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Opportunity Pipeline</h3>
      
      <div className="space-y-4">
        {stageData.map((stage, index) => (
          <div key={stage.stage} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">{stage.stage}</span>
              <div className="text-right">
                <span className="text-sm font-semibold text-gray-900">
                  ${(stage.value / 1000000).toFixed(1)}M
                </span>
                <span className="text-xs text-gray-500 ml-2">({stage.count} opps)</span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(stage.value / maxValue) * 100}%` }}
              ></div>
            </div>
            {stage.opportunities.length > 0 && (
              <div className="pl-4 space-y-1">
                {stage.opportunities.map(opp => (
                  <div key={opp.id} className="flex justify-between text-xs text-gray-600">
                    <span>{opp.title}</span>
                    <span>{opp.probability}% probability</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}