import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Users, Lock, Globe, UserPlus } from 'lucide-react';

export default function OpportunityPermissions() {
  const { state } = useAppContext();
  const [selectedOpportunity, setSelectedOpportunity] = useState<string>(state.opportunities[0]?.id || '');

  const opportunity = state.opportunities.find(opp => opp.id === selectedOpportunity);
  
  const teamMembers = [
    { id: '1', name: 'John Smith', email: 'john.smith@company.com', role: 'BD Manager', permissions: ['read', 'write', 'share'] },
    { id: '2', name: 'Sarah Wilson', email: 'sarah.wilson@company.com', role: 'Capture Manager', permissions: ['read'] },
    { id: '3', name: 'Mike Chen', email: 'mike.chen@company.com', role: 'Proposal Manager', permissions: ['read', 'write'] },
    { id: '4', name: 'External Consultant', email: 'consultant@external.com', role: 'External', permissions: ['read'], external: true }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Opportunity-Level Permissions</h2>
          <p className="text-sm text-gray-600">Manage access control for specific opportunities</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Select Opportunity</h3>
          <div className="space-y-2">
            {state.opportunities.map(opp => (
              <button
                key={opp.id}
                onClick={() => setSelectedOpportunity(opp.id)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  selectedOpportunity === opp.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium text-gray-900 text-sm">{opp.title}</div>
                <div className="text-xs text-gray-500 mt-1">{opp.agency}</div>
                <div className="flex items-center space-x-2 mt-2">
                  {opp.permissions ? (
                    <div className="flex items-center space-x-1">
                      <Lock className="h-3 w-3 text-orange-600" />
                      <span className="text-xs text-orange-600">Custom permissions</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1">
                      <Globe className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-500">Default permissions</span>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2">
          {opportunity && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">{opportunity.title}</h4>
                <div className="text-sm text-gray-600">
                  <p>Agency: {opportunity.agency}</p>
                  <p>Value: ${(opportunity.value / 1000000).toFixed(1)}M</p>
                  <p>Team: {opportunity.assignedTo.join(', ')}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => {
                      dispatch({ 
                        type: 'ADD_NOTIFICATION', 
                        payload: {
                          id: Date.now().toString(),
                          type: 'success',
                          title: 'Member Added',
                          message: 'New team member has been added to the opportunity.',
                          timestamp: new Date(),
                          read: false
                        }
                      });
                    }}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Add Member</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {teamMembers.map(member => (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                          member.external ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                        }`}>
                          <Users className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900 text-sm">{member.name}</span>
                            {member.external && (
                              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                                External
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">{member.email} • {member.role}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="flex space-x-2">
                          {['read', 'write', 'share', 'delete'].map(permission => (
                            <label key={permission} className="flex items-center space-x-1">
                              <input
                                type="checkbox"
                                checked={member.permissions.includes(permission)}
                                onChange={(e) => {
                                  dispatch({ 
                                    type: 'ADD_NOTIFICATION', 
                                    payload: {
                                      id: Date.now().toString(),
                                      type: 'info',
                                      title: 'Permission Updated',
                                      message: `${permission} permission ${e.target.checked ? 'granted to' : 'revoked from'} ${member.name}`,
                                      timestamp: new Date(),
                                      read: false
                                    }
                                  });
                                }}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-xs text-gray-600 capitalize">{permission}</span>
                            </label>
                          ))}
                        </div>
                        <button
                          onClick={() => {
                            if (confirm(`Remove ${member.name} from this opportunity?`)) {
                              dispatch({ 
                                type: 'ADD_NOTIFICATION', 
                                payload: {
                                  id: Date.now().toString(),
                                  type: 'success',
                                  title: 'Member Removed',
                                  message: `${member.name} has been removed from the opportunity.`,
                                  timestamp: new Date(),
                                  read: false
                                }
                              });
                            }
                          }}
                          className="text-red-600 hover:text-red-800 text-sm"
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h5 className="font-medium text-yellow-800 mb-2">Permission Inheritance</h5>
                <p className="text-sm text-yellow-700">
                  This opportunity inherits base permissions from user roles. Custom permissions override inherited ones.
                  External users only see explicitly granted permissions.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}