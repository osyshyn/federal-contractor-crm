import React, { useState } from 'react';
import { Opportunity } from '../../context/AppContext';
import { useAppContext } from '../../context/AppContext';
import { 
  X, 
  Calendar, 
  DollarSign, 
  Building, 
  Users, 
  Edit, 
  Save,
  MessageSquare,
  FileText,
  Clock,
  Target,
  TrendingUp
} from 'lucide-react';

interface OpportunityModalProps {
  opportunity?: Opportunity;
  onClose: () => void;
}

export default function OpportunityModal({ opportunity, onClose }: OpportunityModalProps) {
  const { dispatch } = useAppContext();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'team' | 'documents' | 'activity'>('details');

  if (!opportunity) return null;

  const handleSave = () => {
    setIsEditing(false);
    dispatch({ 
      type: 'ADD_NOTIFICATION', 
      payload: {
        id: Date.now().toString(),
        type: 'success',
        title: 'Opportunity Updated',
        message: `${opportunity.title} has been updated successfully.`,
        timestamp: new Date(),
        read: false
      }
    });
  };

  const tabs = [
    { id: 'details', name: 'Details', icon: FileText },
    { id: 'team', name: 'Team', icon: Users },
    { id: 'documents', name: 'Documents', icon: FileText },
    { id: 'activity', name: 'Activity', icon: MessageSquare }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{opportunity.title}</h2>
              <p className="text-sm text-gray-600">{opportunity.agency}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              opportunity.probability >= 70 ? 'bg-green-100 text-green-800' :
              opportunity.probability >= 40 ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {opportunity.probability}% Win Probability
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {isEditing ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
              <span>{isEditing ? 'Save' : 'Edit'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-700">Contract Value</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    ${(opportunity.value / 1000000).toFixed(1)}M
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">Close Date</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(opportunity.closeDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Target className="h-5 w-5 text-purple-600" />
                    <span className="text-sm font-medium text-gray-700">Stage</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{opportunity.stage}</p>
                </div>
              </div>

              {/* Details Form */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Primary Contact
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        defaultValue={opportunity.contact}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">{opportunity.contact}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Agency
                    </label>
                    {isEditing ? (
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option value={opportunity.agency}>{opportunity.agency}</option>
                        <option value="Department of Defense">Department of Defense</option>
                        <option value="NASA">NASA</option>
                        <option value="Department of Homeland Security">Department of Homeland Security</option>
                      </select>
                    ) : (
                      <p className="text-gray-900">{opportunity.agency}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Win Probability
                    </label>
                    {isEditing ? (
                      <input
                        type="range"
                        min="0"
                        max="100"
                        defaultValue={opportunity.probability}
                        className="w-full"
                      />
                    ) : (
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${opportunity.probability}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{opportunity.probability}%</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contract Vehicle
                    </label>
                    <p className="text-gray-900">{opportunity.customFields?.contractVehicle || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              {/* Custom Fields */}
              {opportunity.customFields && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {Object.entries(opportunity.customFields).map(([key, value]) => (
                      <div key={key} className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                        <p className="text-gray-900">{value?.toString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'team' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
                <button 
                  onClick={() => {
                    dispatch({ 
                      type: 'ADD_NOTIFICATION', 
                      payload: {
                        id: Date.now().toString(),
                        type: 'success',
                        title: 'Team Member Added',
                        message: 'New team member has been added to the opportunity.',
                        timestamp: new Date(),
                        read: false
                      }
                    });
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Member
                </button>
              </div>
              <div className="space-y-3">
                {opportunity.assignedTo.map((member, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">
                          {member.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{member}</p>
                        <p className="text-sm text-gray-600">Team Member</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">Active</span>
                      <button 
                        onClick={() => {
                          if (confirm(`Remove ${member} from this opportunity?`)) {
                            dispatch({ 
                              type: 'ADD_NOTIFICATION', 
                              payload: {
                                id: Date.now().toString(),
                                type: 'warning',
                                title: 'Member Removed',
                                message: `${member} has been removed from the opportunity.`,
                                timestamp: new Date(),
                                read: false
                              }
                            });
                          }
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Documents</h3>
                <button 
                  onClick={() => {
                    dispatch({ 
                      type: 'ADD_NOTIFICATION', 
                      payload: {
                        id: Date.now().toString(),
                        type: 'success',
                        title: 'Document Uploaded',
                        message: 'New document has been uploaded successfully.',
                        timestamp: new Date(),
                        read: false
                      }
                    });
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Upload Document
                </button>
              </div>
              <div className="space-y-3">
                {[
                  { name: 'RFP Document.pdf', size: '2.4 MB', date: '2 days ago', type: 'pdf' },
                  { name: 'Technical Proposal.docx', size: '1.8 MB', date: '1 week ago', type: 'doc' },
                  { name: 'Cost Proposal.xlsx', size: '856 KB', date: '1 week ago', type: 'excel' }
                ].map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-8 w-8 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">{doc.name}</p>
                        <p className="text-sm text-gray-600">{doc.size} • {doc.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => {
                          dispatch({ 
                            type: 'ADD_NOTIFICATION', 
                            payload: {
                              id: Date.now().toString(),
                              type: 'info',
                              title: 'Download Started',
                              message: `Downloading ${doc.name}...`,
                              timestamp: new Date(),
                              read: false
                            }
                          });
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Download
                      </button>
                      <button 
                        onClick={() => {
                          if (confirm(`Delete ${doc.name}?`)) {
                            dispatch({ 
                              type: 'ADD_NOTIFICATION', 
                              payload: {
                                id: Date.now().toString(),
                                type: 'warning',
                                title: 'Document Deleted',
                                message: `${doc.name} has been deleted.`,
                                timestamp: new Date(),
                                read: false
                              }
                            });
                          }
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              <div className="space-y-4">
                {[
                  { 
                    action: 'Proposal submitted', 
                    user: 'John Smith', 
                    time: '2 hours ago',
                    type: 'success'
                  },
                  { 
                    action: 'Team member added', 
                    user: 'Sarah Wilson', 
                    time: '1 day ago',
                    type: 'info'
                  },
                  { 
                    action: 'Stage updated to Proposal Development', 
                    user: 'Mike Chen', 
                    time: '3 days ago',
                    type: 'info'
                  },
                  { 
                    action: 'Win probability updated to 75%', 
                    user: 'John Smith', 
                    time: '1 week ago',
                    type: 'warning'
                  }
                ].map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 border-l-4 border-gray-200">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === 'success' ? 'bg-green-500' :
                      activity.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-600">by {activity.user} • {activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}