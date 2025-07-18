import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { Eye, Edit, Share, Trash2 } from 'lucide-react';

export default function PermissionMatrix() {
  const { state } = useAppContext();

  const fields = [
    { name: 'Opportunity Title', category: 'Basic', sensitive: false },
    { name: 'Contract Value', category: 'Financial', sensitive: true },
    { name: 'Win Probability', category: 'Financial', sensitive: true },
    { name: 'Contact Information', category: 'Basic', sensitive: false },
    { name: 'Security Clearance', category: 'Compliance', sensitive: true },
    { name: 'Contract Vehicle', category: 'Compliance', sensitive: false },
    { name: 'Prime Contractor Status', category: 'Business', sensitive: true },
    { name: 'Proposal Documents', category: 'Documents', sensitive: true },
    { name: 'Team Assignments', category: 'Team', sensitive: false }
  ];

  const permissions = [
    { id: 'read', name: 'View', icon: Eye, color: 'text-blue-600' },
    { id: 'write', name: 'Edit', icon: Edit, color: 'text-green-600' },
    { id: 'share', name: 'Share', icon: Share, color: 'text-purple-600' },
    { id: 'delete', name: 'Delete', icon: Trash2, color: 'text-red-600' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Permission Matrix</h2>
          <p className="text-sm text-gray-600">Define granular field-level permissions for each role</p>
        </div>
        <button
          onClick={() => {
            dispatch({ 
              type: 'ADD_NOTIFICATION', 
              payload: {
                id: Date.now().toString(),
                type: 'success',
                title: 'Permissions Saved',
                message: 'Permission matrix changes have been saved successfully.',
                timestamp: new Date(),
                read: false
              }
            });
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Save Changes
        </button>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <div className="permission-grid text-sm font-medium text-gray-700 mb-4">
          <div>Field / Role</div>
          {permissions.map(perm => (
            <div key={perm.id} className="text-center">{perm.name}</div>
          ))}
        </div>

        <div className="space-y-4">
          {state.roles.map(role => (
            <div key={role.id} className="bg-white rounded-lg p-4 space-y-3">
              <h4 className="font-medium text-gray-900">{role.name}</h4>
              
              {fields.map(field => (
                <div key={field.name} className="permission-grid text-sm">
                  <div className="flex items-center space-x-2">
                    <span className={field.sensitive ? 'text-red-700' : 'text-gray-700'}>
                      {field.name}
                    </span>
                    {field.sensitive && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                        Sensitive
                      </span>
                    )}
                  </div>
                  
                  {permissions.map(perm => {
                    const Icon = perm.icon;
                    // Simplified permission logic for demo
                    const hasPermission = role.permissions.includes('read_all') || 
                                        (perm.id === 'read' && role.permissions.includes('read_opportunities')) ||
                                        (perm.id === 'write' && role.permissions.includes('write_opportunities'));
                    
                    return (
                      <div key={perm.id} className="flex justify-center">
                        <button
                          onClick={() => {
                            dispatch({ 
                              type: 'ADD_NOTIFICATION', 
                              payload: {
                                id: Date.now().toString(),
                                type: 'info',
                                title: 'Permission Toggled',
                                message: `${perm.name} permission toggled for ${role.name} on ${field.name}`,
                                timestamp: new Date(),
                                read: false
                              }
                            });
                          }}
                          className={`p-2 rounded-lg transition-colors ${
                            hasPermission
                              ? `bg-gray-100 ${perm.color}`
                              : 'text-gray-300 hover:text-gray-500'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}