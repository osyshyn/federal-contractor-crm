import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import FieldBuilder from './FieldBuilder';
import FieldList from './FieldList';
import FieldPreview from './FieldPreview';

export default function CustomFieldsPage() {
  const [activeSection, setActiveSection] = useState<'builder' | 'list'>('list');

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Custom Fields</h1>
        <p className="text-gray-600">
          Create and manage custom fields for opportunities, contacts, and activities
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                <button
                  onClick={() => setActiveSection('list')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeSection === 'list'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Existing Fields
                </button>
                <button
                  onClick={() => setActiveSection('builder')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeSection === 'builder'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Field Builder
                </button>
              </nav>
            </div>

            <div className="p-6">
              {activeSection === 'list' && <FieldList />}
              {activeSection === 'builder' && <FieldBuilder />}
            </div>
          </div>
        </div>

        <div>
          <FieldPreview />
        </div>
      </div>
    </div>
  );
}