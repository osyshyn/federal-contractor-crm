import React from 'react';
import { Opportunity } from '../../context/AppContext';
import OpportunityCard from './OpportunityCard';

interface KanbanBoardProps {
  opportunities: Opportunity[];
}

const stages = [
  'RFI Response',
  'Qualification', 
  'Proposal Development',
  'Final Review',
  'Awarded'
];

export default function KanbanBoard({ opportunities }: KanbanBoardProps) {
  return (
    <div className="flex space-x-6 overflow-x-auto pb-6">
      {stages.map(stage => {
        const stageOpportunities = opportunities.filter(opp => opp.stage === stage);
        const stageValue = stageOpportunities.reduce((sum, opp) => sum + opp.value, 0);
        
        return (
          <div key={stage} className="flex-shrink-0 w-80">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">{stage}</h3>
                <div className="text-right">
                  <div className="text-xs text-gray-500">{stageOpportunities.length} opportunities</div>
                  <div className="text-sm font-medium text-gray-700">
                    ${(stageValue / 1000000).toFixed(1)}M
                  </div>
                </div>
              </div>
              
              <div className="space-y-3 kanban-column">
                {stageOpportunities.map(opportunity => (
                  <OpportunityCard
                    key={opportunity.id}
                    opportunity={opportunity}
                    compact
                  />
                ))}
                
                {stageOpportunities.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <p className="text-sm">No opportunities in this stage</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}