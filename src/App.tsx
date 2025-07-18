import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './components/Dashboard/Dashboard';
import OpportunitiesPage from './components/Opportunities/OpportunitiesPage';
import PermissionsPage from './components/Permissions/PermissionsPage';
import CustomFieldsPage from './components/CustomFields/CustomFieldsPage';
import DataSyncPage from './components/DataSync/DataSyncPage';
import TechnicalDashboard from './components/Technical/TechnicalDashboard';
import PerformanceDashboard from './components/Performance/PerformanceDashboard';
import SecurityDashboard from './components/Security/SecurityDashboard';
import './App.css';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <AppProvider>
      <Router>
        <div className="flex h-screen bg-gray-50">
          <Sidebar isOpen={sidebarOpen} />
          
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
            
            <main className="flex-1 overflow-auto">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/opportunities" element={<OpportunitiesPage />} />
                <Route path="/permissions" element={<PermissionsPage />} />
                <Route path="/custom-fields" element={<CustomFieldsPage />} />
                <Route path="/data-sync" element={<DataSyncPage />} />
                <Route path="/technical" element={<TechnicalDashboard />} />
                <Route path="/performance" element={<PerformanceDashboard />} />
                <Route path="/security" element={<SecurityDashboard />} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;