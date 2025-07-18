import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Plus, Trash2 } from 'lucide-react';

export default function FieldBuilder() {
  const { dispatch } = useAppContext();
  const [fieldData, setFieldData] = useState({
    name: '',
    type: 'text' as const,
    entity: 'opportunity' as const,
    required: false,
    options: [''],
    defaultValue: ''
  });

  const fieldTypes = [
    { value: 'text', label: 'Text' },
    { value: 'number', label: 'Number' },
    { value: 'date', label: 'Date' },
    { value: 'select', label: 'Dropdown' },
    { value: 'multiselect', label: 'Multi-select' },
    { value: 'boolean', label: 'Yes/No' }
  ];

  const entities = [
    { value: 'opportunity', label: 'Opportunity' },
    { value: 'contact', label: 'Contact' },
    { value: 'activity', label: 'Activity' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fieldData.name.trim()) return;

    const newField = {
      id: Date.now().toString(),
      name: fieldData.name,
      type: fieldData.type,
      entity: fieldData.entity,
      required: fieldData.required,
      options: fieldData.type === 'select' || fieldData.type === 'multiselect' 
        ? fieldData.options.filter(opt => opt.trim()) 
        : undefined,
      defaultValue: fieldData.defaultValue || undefined
    };

    dispatch({ type: 'ADD_CUSTOM_FIELD', payload: newField });
    
    // Add success notification
    dispatch({ 
      type: 'ADD_NOTIFICATION', 
      payload: {
        id: (Date.now() + 1).toString(),
        type: 'success',
        title: 'Custom Field Created',
        message: `Field "${fieldData.name}" has been created successfully.`,
        timestamp: new Date(),
        read: false
      }
    });
    
    // Reset form
    setFieldData({
      name: '',
      type: 'text',
      entity: 'opportunity',
      required: false,
      options: [''],
      defaultValue: ''
    });
  };

  const addOption = () => {
    setFieldData(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  const updateOption = (index: number, value: string) => {
    setFieldData(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }));
  };

  const removeOption = (index: number) => {
    if (fieldData.options.length > 1) {
      setFieldData(prev => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index)
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Field Name
        </label>
        <input
          type="text"
          value={fieldData.name}
          onChange={(e) => setFieldData(prev => ({ ...prev, name: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="e.g., Contract Vehicle"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Field Type
          </label>
          <select
            value={fieldData.type}
            onChange={(e) => setFieldData(prev => ({ ...prev, type: e.target.value as any }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {fieldTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Entity
          </label>
          <select
            value={fieldData.entity}
            onChange={(e) => setFieldData(prev => ({ ...prev, entity: e.target.value as any }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {entities.map(entity => (
              <option key={entity.value} value={entity.value}>{entity.label}</option>
            ))}
          </select>
        </div>
      </div>

      {(fieldData.type === 'select' || fieldData.type === 'multiselect') && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Options
          </label>
          <div className="space-y-2">
            {fieldData.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={`Option ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  className="p-2 text-red-600 hover:text-red-800"
                  disabled={fieldData.options.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addOption}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Add Option</span>
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="required"
          checked={fieldData.required}
          onChange={(e) => setFieldData(prev => ({ ...prev, required: e.target.checked }))}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="required" className="text-sm font-medium text-gray-700">
          Required field
        </label>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <button
          type="submit"
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create Field
        </button>
      </div>
    </form>
  );
}