import React from 'react';
import { useAppContext } from '../../context/AppContext';

export default function FieldPreview() {
  const { state } = useAppContext();
  const opportunity = state.opportunities[0];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Preview</h3>
      
      <div className="field-builder-preview">
        <h4 className="font-medium text-gray-900 mb-4">Opportunity Form Preview</h4>
        
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Opportunity Title *
            </label>
            <input
              type="text"
              value={opportunity?.title || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              readOnly
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contract Value *
            </label>
            <input
              type="number"
              value={opportunity?.value || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              readOnly
            />
          </div>

          {state.customFields
            .filter(field => field.entity === 'opportunity')
            .map(field => (
              <div key={field.id}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.name} {field.required && '*'}
                </label>
                
                {field.type === 'text' && (
                  <input
                    type="text"
                    value={opportunity?.customFields?.[field.name] || field.defaultValue || ''}
                    onChange={(e) => {
                      dispatch({ 
                        type: 'ADD_NOTIFICATION', 
                        payload: {
                          id: Date.now().toString(),
                          type: 'info',
                          title: 'Field Updated',
                          message: `${field.name} field updated in preview`,
                          timestamp: new Date(),
                          read: false
                        }
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                )}
                
                {field.type === 'select' && (
                  <select 
                    value={opportunity?.customFields?.[field.name] || field.defaultValue || ''}
                    onChange={(e) => {
                      dispatch({ 
                        type: 'ADD_NOTIFICATION', 
                        payload: {
                          id: Date.now().toString(),
                          type: 'info',
                          title: 'Field Updated',
                          message: `${field.name} field updated in preview`,
                          timestamp: new Date(),
                          read: false
                        }
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select...</option>
                    {field.options?.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                )}
                
                {field.type === 'boolean' && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={opportunity?.customFields?.[field.name] || field.defaultValue || false}
                      className="rounded border-gray-300 text-blue-600"
                      readOnly
                    />
                    <span className="text-sm text-gray-600">Yes</span>
                  </div>
                )}
              </div>
            ))}
        </form>
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-700">
          This preview shows how custom fields appear in the opportunity form. 
          Changes made in the Field Builder will be reflected here in real-time.
        </p>
      </div>
    </div>
  );
}