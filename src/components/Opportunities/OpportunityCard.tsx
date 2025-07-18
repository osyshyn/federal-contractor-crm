import React from 'react';
import { Opportunity } from '../../context/AppContext';
import { useAppContext } from '../../context/AppContext';
import { Calendar, DollarSign, Building, Users, Lock } from 'lucide-react';

interface OpportunityCardProps {
  opportunity: Opportunity;
  compact?: boolean;
}

export default function OpportunityCard({ opportunity, compact = false }: OpportunityCardProps) {
  const { dispatch } = useAppContext();
  
  const getProbabilityColor = (probability: number) => {
    if (probability >= 70) return 'text-green-600 bg-green-100';
    if (probability >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div 
      className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => {
        dispatch({ type: 'SELECT_OPPORTUNITY', payload: opportunity.id });
        dispatch({ type: 'SET_ACTIVE_MODAL', payload: 'opportunity-details' });
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <h4 className={`font-semibold text-gray-900 ${compact ? 'text-sm' : 'text-base'}`}>
          {opportunity.title}
        </h4>
        {opportunity.permissions && (
          <Lock className="h-4 w-4 text-gray-400" title="Custom permissions applied" />
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Building className="h-4 w-4" />
          <span>{opportunity.agency}</span>
        </div>

        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <DollarSign className="h-4 w-4" />
          <span>${(opportunity.value / 1000000).toFixed(1)}M</span>
          <span className={`ml-auto px-2 py-1 rounded-full text-xs font-medium ${getProbabilityColor(opportunity.probability)}`}>
            {opportunity.probability}%
          </span>
        </div>

        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>{new Date(opportunity.closeDate).toLocaleDateString()}</span>
        </div>

        {!compact && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Users className="h-4 w-4" />
            <span>{opportunity.assignedTo.length} team member(s)</span>
          </div>
        )}

        {opportunity.customFields && (
          <div className="pt-2 border-t border-gray-100">
            <div className="flex flex-wrap gap-1">
              {Object.entries(opportunity.customFields).map(([key, value]) => (
                <span
                  key={key}
                  className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded"
                >
                  {key}: {value?.toString()}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {!compact && (
        <div className="mt-4 flex justify-between items-center">
          <span className="text-xs text-gray-500">
            Contact: {opportunity.contact}
          </span>
          <button 
            className="text-xs text-blue-600 hover:text-blue-800"
            onClick={(e) => {
              e.stopPropagation();
              dispatch({ type: 'SELECT_OPPORTUNITY', payload: opportunity.id });
              dispatch({ type: 'SET_ACTIVE_MODAL', payload: 'opportunity-details' });
            }}
          >
            View Details
          </button>
        </div>
      )}
    </div>
  );
}