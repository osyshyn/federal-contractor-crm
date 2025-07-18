import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Target, Shield, Settings, FolderSync as Sync, Building2, Cpu, Lock, Zap } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Opportunities', href: '/opportunities', icon: Target },
  { name: 'Permissions', href: '/permissions', icon: Shield },
  { name: 'Custom Fields', href: '/custom-fields', icon: Settings },
  { name: 'Data Sync', href: '/data-sync', icon: Sync },
  { name: 'Technical', href: '/technical', icon: Cpu },
  { name: 'Performance', href: '/performance', icon: Zap },
  { name: 'Security', href: '/security', icon: Lock },
];

export default function Sidebar({ isOpen }: SidebarProps) {
  const location = useLocation();

  return (
    <div className={`${isOpen ? 'w-64' : 'w-16'} bg-slate-900 text-white transition-all duration-300 flex flex-col`}>
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <Building2 className="h-8 w-8 text-blue-400" />
          {isOpen && (
            <div>
              <h1 className="text-lg font-semibold">FedCRM</h1>
              <p className="text-xs text-slate-400">Federal Contractor CRM</p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5" />
              {isOpen && <span className="text-sm font-medium">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <div className="text-xs text-slate-400">
          {isOpen ? 'Enterprise Security Demo' : 'v1.0'}
        </div>
      </div>
    </div>
  );
}