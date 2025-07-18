import React, { createContext, useContext, useReducer } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
}

interface Opportunity {
  id: string;
  title: string;
  value: number;
  stage: string;
  probability: number;
  closeDate: string;
  contact: string;
  agency: string;
  assignedTo: string[];
  customFields?: Record<string, any>;
  permissions?: Record<string, string[]>;
}

interface CustomField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'boolean';
  entity: 'opportunity' | 'contact' | 'activity';
  required: boolean;
  options?: string[];
  defaultValue?: any;
}

interface AppState {
  currentUser: User;
  opportunities: Opportunity[];
  customFields: CustomField[];
  roles: Array<{
    id: string;
    name: string;
    permissions: string[];
  }>;
  syncStatus: {
    lastSync: string;
    status: 'success' | 'pending' | 'error';
    recordsProcessed: number;
  };
  notifications: Notification[];
  activeModal: string | null;
  selectedOpportunity: string | null;
}

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

type AppAction = 
  | { type: 'UPDATE_OPPORTUNITY'; payload: Opportunity }
  | { type: 'ADD_CUSTOM_FIELD'; payload: CustomField }
  | { type: 'UPDATE_PERMISSIONS'; payload: { opportunityId: string; userId: string; permissions: string[] } }
  | { type: 'UPDATE_SYNC_STATUS'; payload: Partial<AppState['syncStatus']> }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'SET_ACTIVE_MODAL'; payload: string | null }
  | { type: 'SELECT_OPPORTUNITY'; payload: string | null };

const initialState: AppState = {
  currentUser: {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@company.com',
    role: 'Business Development Manager',
    permissions: ['read_opportunities', 'write_opportunities', 'manage_permissions']
  },
  opportunities: [
    {
      id: '1',
      title: 'DOD Cybersecurity Solutions RFP',
      value: 25000000,
      stage: 'Proposal Development',
      probability: 75,
      closeDate: '2025-03-15',
      contact: 'Col. Sarah Johnson',
      agency: 'Department of Defense',
      assignedTo: ['John Smith', 'Sarah Wilson', 'Mike Chen'],
      customFields: {
        contractVehicle: 'GSA',
        securityClearance: 'Secret',
        primeContractor: 'Yes'
      },
      permissions: {
        '1': ['read', 'write', 'share'],
        '2': ['read'],
        '3': ['read', 'write']
      }
    },
    {
      id: '2',
      title: 'NASA Data Analytics Platform',
      value: 8500000,
      stage: 'Qualification',
      probability: 45,
      closeDate: '2025-04-22',
      contact: 'Dr. Maria Rodriguez',
      agency: 'NASA',
      assignedTo: ['Sarah Wilson', 'Mike Chen'],
      customFields: {
        contractVehicle: 'CIO-SP3',
        securityClearance: 'Public Trust',
        primeContractor: 'No'
      }
    },
    {
      id: '3',
      title: 'DHS Border Security Tech',
      value: 15000000,
      stage: 'RFI Response',
      probability: 30,
      closeDate: '2025-05-10',
      contact: 'Agent Carlos Martinez',
      agency: 'Department of Homeland Security',
      assignedTo: ['John Smith', 'Mike Chen']
    }
  ],
  customFields: [
    {
      id: '1',
      name: 'Contract Vehicle',
      type: 'select',
      entity: 'opportunity',
      required: true,
      options: ['GSA', 'CIO-SP3', 'SEWP', 'OASIS', 'Direct Award']
    },
    {
      id: '2',
      name: 'Security Clearance Required',
      type: 'select',
      entity: 'opportunity',
      required: false,
      options: ['None', 'Public Trust', 'Secret', 'Top Secret']
    },
    {
      id: '3',
      name: 'Prime Contractor',
      type: 'boolean',
      entity: 'opportunity',
      required: true,
      defaultValue: false
    }
  ],
  roles: [
    {
      id: '1',
      name: 'Business Development Manager',
      permissions: ['read_all', 'write_all', 'manage_permissions', 'export_data']
    },
    {
      id: '2',
      name: 'Capture Manager',
      permissions: ['read_opportunities', 'write_opportunities', 'manage_team']
    },
    {
      id: '3',
      name: 'Proposal Manager',
      permissions: ['read_opportunities', 'write_proposals', 'view_financials']
    },
    {
      id: '4',
      name: 'External Consultant',
      permissions: ['read_assigned_opportunities']
    }
  ],
  syncStatus: {
    lastSync: '2025-01-27T10:30:00Z',
    status: 'success',
    recordsProcessed: 1247
  },
  notifications: [
    {
      id: '1',
      type: 'success',
      title: 'Sync Completed',
      message: 'Government data sync completed successfully. 1,247 records processed.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: false
    },
    {
      id: '2',
      type: 'warning',
      title: 'High CPU Usage',
      message: 'Server CPU usage is above 80%. Consider scaling resources.',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      read: false
    },
    {
      id: '3',
      type: 'info',
      title: 'New Opportunity',
      message: 'New opportunity "DHS Border Security Tech" has been added.',
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      read: true
    }
  ],
  activeModal: null,
  selectedOpportunity: null
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'UPDATE_OPPORTUNITY':
      return {
        ...state,
        opportunities: state.opportunities.map(opp => 
          opp.id === action.payload.id ? action.payload : opp
        )
      };
    case 'ADD_CUSTOM_FIELD':
      return {
        ...state,
        customFields: [...state.customFields, action.payload]
      };
    case 'UPDATE_PERMISSIONS':
      return {
        ...state,
        opportunities: state.opportunities.map(opp => 
          opp.id === action.payload.opportunityId 
            ? {
                ...opp,
                permissions: {
                  ...opp.permissions,
                  [action.payload.userId]: action.payload.permissions
                }
              }
            : opp
        )
      };
    case 'UPDATE_SYNC_STATUS':
      return {
        ...state,
        syncStatus: { ...state.syncStatus, ...action.payload }
      };
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications]
      };
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(notif => 
          notif.id === action.payload ? { ...notif, read: true } : notif
        )
      };
    case 'SET_ACTIVE_MODAL':
      return {
        ...state,
        activeModal: action.payload
      };
    case 'SELECT_OPPORTUNITY':
      return {
        ...state,
        selectedOpportunity: action.payload
      };
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}