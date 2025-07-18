import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Plus, Edit2, Trash2, Shield } from 'lucide-react';

export default function RoleManager() {
  const { state, dispatch } = useAppContext();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const allPermissions = [
    { id: 'read_opportunities', name: 'View Opportunities', category: 'Opportunities' },
    { id: 'write_opportunities', name: 'Edit Opportunities', category: 'Opportunities' },
    { id: 'delete_opportunities', name: 'Delete Opportunities', category: 'Opportunities' },
    { id: 'read_contacts', name: 'View Contacts', category: 'Contacts' },
    { id: 'write_contacts', name: 'Edit Contacts', category: 'Contacts' },
    { id: 'view_financials', name: 'View Financial Data', category: 'Financial' },
    { id: 'edit_financials', name: 'Edit Financial Data', category: 'Financial' },
    { id: 'manage_permissions', name: 'Manage Permissions', category: 'Administration' },
    { id: 'manage_team', name: 'Manage Team', category: 'Administration' },
    { id: 'export_data', name: 'Export Data', category: 'Data' },
    { id: 'import_data', name: 'Import Data', category: 'Data' }
  ];

  const categories = [...new Set(allPermissions.map(p => p.category))];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Role Management</h2>
        <button 
          onClick={() => {
            dispatch({ 
              type: 'ADD_NOTIFICATION', 
              payload: {
                id: Date.now().toString(),
                type: 'success',
                title: 'Role Created',
                message: 'New role "Senior Analyst" has been created successfully.',
                timestamp: new Date(),
                read: false
              }
            });
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>New Role</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Existing Roles</h3>
          {state.roles.map(role => (
            <div
              key={role.id}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedRole === role.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedRole(role.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">{role.name}</h4>
                    <p className="text-sm text-gray-500">{role.permissions.length} permissions</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => {
                      dispatch({ 
                        type: 'ADD_NOTIFICATION', 
                        payload: {
                          id: Date.now().toString(),
                          type: 'info',
                          title: 'Edit Role',
                          message: `Editing role: ${role.name}`,
                          timestamp: new Date(),
                          read: false
                        }
                      });
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
                        dispatch({ 
                          type: 'ADD_NOTIFICATION', 
                          payload: {
                            id: Date.now().toString(),
                            type: 'warning',
                            title: 'Role Deleted',
                            message: `Role "${role.name}" has been deleted.`,
                            timestamp: new Date(),
                            read: false
                          }
                        });
                      }
                    }}
                    className="p-1 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="mt-2 flex flex-wrap gap-1">
                {role.permissions.slice(0, 3).map(permission => (
                  <span key={permission} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                    {permission.replace('_', ' ')}
                  </span>
                ))}
                {role.permissions.length > 3 && (
                  <span className="text-xs text-gray-500">
                    +{role.permissions.length - 3} more
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">
            {selectedRole ? 'Edit Role Permissions' : 'Select a role to view permissions'}
          </h3>
          
          {selectedRole && (
            <div className="space-y-4">
              {categories.map(category => (
                <div key={category} className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700 border-b border-gray-200 pb-1">
                    {category}
                  </h4>
                  <div className="space-y-2">
                    {allPermissions
                      .filter(p => p.category === category)
                      .map(permission => {
                        const role = state.roles.find(r => r.id === selectedRole);
                        const hasPermission = role?.permissions.includes(permission.id);
                        
                        return (
                          <label key={permission.id} className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={hasPermission}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              readOnly
                            />
                            <span className="text-sm text-gray-700">{permission.name}</span>
                          </label>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}