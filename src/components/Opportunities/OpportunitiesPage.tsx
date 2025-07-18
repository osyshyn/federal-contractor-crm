import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import OpportunityCard from './OpportunityCard';
import KanbanBoard from './KanbanBoard';
import OpportunityModal from './OpportunityModal';
import { LayoutGrid, List, Plus } from 'lucide-react';

export default function OpportunitiesPage() {
  const { state, dispatch } = useAppContext();
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('kanban');

  return (
    <div className="p-6 relative">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Opportunities</h1>
        
        <div className="flex items-center space-x-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'kanban' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
          
          <button 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            onClick={() => {
              dispatch({ type: 'SET_ACTIVE_MODAL', payload: 'new-opportunity' });
            }}
          >
            <Plus className="h-4 w-4" />
            <span>New Opportunity</span>
          </button>
        </div>
      </div>

      <div className="mb-4 flex items-center space-x-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search opportunities..."
            onChange={(e) => {
              // Search functionality would be implemented here
              console.log('Searching for:', e.target.value);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <select 
          onChange={(e) => {
            dispatch({ 
              type: 'ADD_NOTIFICATION', 
              payload: {
                id: Date.now().toString(),
                type: 'info',
                title: 'Filter Applied',
                message: `Filtered by agency: ${e.target.value || 'All'}`,
                timestamp: new Date(),
                read: false
              }
            });
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Agencies</option>
          <option value="dod">Department of Defense</option>
          <option value="nasa">NASA</option>
          <option value="dhs">Department of Homeland Security</option>
        </select>
        <select 
          onChange={(e) => {
            dispatch({ 
              type: 'ADD_NOTIFICATION', 
              payload: {
                id: Date.now().toString(),
                type: 'info',
                title: 'Filter Applied',
                message: `Filtered by stage: ${e.target.value || 'All'}`,
                timestamp: new Date(),
                read: false
              }
            });
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All Stages</option>
          <option value="rfi">RFI Response</option>
          <option value="qualification">Qualification</option>
          <option value="proposal">Proposal Development</option>
          <option value="review">Final Review</option>
        </select>
      </div>

      {viewMode === 'kanban' ? (
        <KanbanBoard opportunities={state.opportunities} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {state.opportunities.map(opportunity => (
            <OpportunityCard key={opportunity.id} opportunity={opportunity} />
          ))}
        </div>
      )}

      {/* Modals */}
      {state.activeModal === 'opportunity-details' && (
        <OpportunityModal
          opportunity={state.opportunities.find(o => o.id === state.selectedOpportunity)}
          onClose={() => {
            dispatch({ type: 'SET_ACTIVE_MODAL', payload: null });
            dispatch({ type: 'SELECT_OPPORTUNITY', payload: null });
          }}
        />
      )}
      
      {state.activeModal === 'new-opportunity' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Opportunity</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Opportunity Title
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter opportunity title..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Agency
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">Select Agency</option>
                    <option value="dod">Department of Defense</option>
                    <option value="nasa">NASA</option>
                    <option value="dhs">Department of Homeland Security</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estimated Value
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => dispatch({ type: 'SET_ACTIVE_MODAL', payload: null })}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={(e) => {
                    e.preventDefault();
                    dispatch({ 
                      type: 'ADD_NOTIFICATION', 
                      payload: {
                        id: Date.now().toString(),
                        type: 'success',
                        title: 'Opportunity Created',
                        message: 'New opportunity has been created successfully.',
                        timestamp: new Date(),
                        read: false
                      }
                    });
                    dispatch({ type: 'SET_ACTIVE_MODAL', payload: null });
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Opportunity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}