import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import RoleManager from './RoleManager';
import PermissionMatrix from './PermissionMatrix';
import OpportunityPermissions from './OpportunityPermissions';

export default function PermissionsPage() {
  const [activeTab, setActiveTab] = useState<'roles' | 'matrix' | 'opportunities'>('roles');

  const tabs = [
    { id: 'roles', name: 'Role Management', description: 'Define and manage user roles' },
    { id: 'matrix', name: 'Permission Matrix', description: 'Granular field-level permissions' },
    { id: 'opportunities', name: 'Opportunity Access', description: 'Per-opportunity permissions' }
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Security & Permissions</h1>
        <p className="text-gray-600">
          Enterprise-grade security with role-based and element-level access controls
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div>
                  <div>{tab.name}</div>
                  <div className="text-xs text-gray-400 mt-1">{tab.description}</div>
                </div>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'roles' && <RoleManager />}
          {activeTab === 'matrix' && <PermissionMatrix />}
          {activeTab === 'opportunities' && <OpportunityPermissions />}
        </div>
      </div>
    </div>
  );
}