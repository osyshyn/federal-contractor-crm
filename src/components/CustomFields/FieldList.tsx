import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { Edit2, Trash2, Tag } from 'lucide-react';

export default function FieldList() {
  const { state, dispatch } = useAppContext();

  const getFieldTypeColor = (type: string) => {
    const colors = {
      text: 'bg-blue-100 text-blue-800',
      number: 'bg-green-100 text-green-800',
      date: 'bg-purple-100 text-purple-800',
      select: 'bg-orange-100 text-orange-800',
      multiselect: 'bg-red-100 text-red-800',
      boolean: 'bg-gray-100 text-gray-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getEntityColor = (entity: string) => {
    const colors = {
      opportunity: 'bg-blue-50 text-blue-700',
      contact: 'bg-green-50 text-green-700',
      activity: 'bg-purple-50 text-purple-700'
    };
    return colors[entity as keyof typeof colors] || 'bg-gray-50 text-gray-700';
  };

  const groupedFields = state.customFields.reduce((groups, field) => {
    const entity = field.entity;
    if (!groups[entity]) groups[entity] = [];
    groups[entity].push(field);
    return groups;
  }, {} as Record<string, typeof state.customFields>);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Custom Fields</h3>
        <div className="text-sm text-gray-500">
          {state.customFields.length} field(s) configured
        </div>
      </div>

      {Object.entries(groupedFields).map(([entity, fields]) => (
        <div key={entity} className="space-y-3">
          <h4 className="font-medium text-gray-900 capitalize flex items-center space-x-2">
            <Tag className="h-4 w-4" />
            <span>{entity} Fields</span>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
              {fields.length}
            </span>
          </h4>
          
          <div className="space-y-2">
            {fields.map(field => (
              <div key={field.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex flex-col">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{field.name}</span>
                      {field.required && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                          Required
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`text-xs px-2 py-1 rounded ${getFieldTypeColor(field.type)}`}>
                        {field.type}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${getEntityColor(field.entity)}`}>
                        {field.entity}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {field.options && (
                    <span className="text-xs text-gray-500">
                      {field.options.length} options
                    </span>
                  )}
                  <button
                   onClick={() => {
                     dispatch({ 
                       type: 'ADD_NOTIFICATION', 
                       payload: {
                         id: Date.now().toString(),
                         type: 'info',
                         title: 'Edit Field',
                         message: `Editing field "${field.name}". Feature coming soon.`,
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
                      if (confirm(`Are you sure you want to delete the field "${field.name}"?`)) {
                        dispatch({ 
                          type: 'ADD_NOTIFICATION', 
                          payload: {
                            id: Date.now().toString(),
                            type: 'warning',
                            title: 'Field Deleted',
                            message: `Custom field "${field.name}" has been deleted.`,
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
            ))}
          </div>
        </div>
      ))}

      {state.customFields.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Tag className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No custom fields configured</p>
          <p className="text-sm">Use the Field Builder to create your first custom field</p>
        </div>
      )}
    </div>
  );
}