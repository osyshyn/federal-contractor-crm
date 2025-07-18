/**
 * Advanced Permission Hook - React integration for complex permission system
 * Demonstrates expertise in React patterns, performance optimization, and real-time updates
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { permissionEngine, Permission, PermissionContext } from '../services/PermissionEngine';

export interface UsePermissionsOptions {
  userId: string;
  tenantId: string;
  resourceType: string;
  resourceId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  enableRealTimeUpdates?: boolean;
}

export interface PermissionState {
  permissions: Record<string, boolean>;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export interface PermissionActions {
  checkPermission: (resource: string, action: string) => boolean;
  refreshPermissions: () => Promise<void>;
  hasAnyPermission: (permissions: Array<{resource: string, action: string}>) => boolean;
  hasAllPermissions: (permissions: Array<{resource: string, action: string}>) => boolean;
  getPermissionContext: () => PermissionContext;
}

/**
 * Advanced permission hook with caching, real-time updates, and performance optimization
 */
export function useAdvancedPermissions(
  options: UsePermissionsOptions
): PermissionState & PermissionActions {
  const [state, setState] = useState<PermissionState>({
    permissions: {},
    loading: true,
    error: null,
    lastUpdated: null
  });

  const refreshIntervalRef = useRef<NodeJS.Timeout>();
  const wsRef = useRef<WebSocket>();
  const abortControllerRef = useRef<AbortController>();

  // Memoized permission context to prevent unnecessary re-evaluations
  const permissionContext = useMemo<PermissionContext>(() => ({
    userId: options.userId,
    tenantId: options.tenantId,
    resourceId: options.resourceId,
    resourceType: options.resourceType,
    timestamp: new Date(),
    userRoles: [], // Would be fetched from user context
    userAttributes: {} // Would be fetched from user context
  }), [options.userId, options.tenantId, options.resourceId, options.resourceType]);

  // Optimized permission loading with batch evaluation
  const loadPermissions = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Get all relevant permissions for the resource type
      const relevantPermissions = await getRelevantPermissions(
        options.resourceType,
        abortControllerRef.current.signal
      );

      // Batch evaluate permissions for performance
      const permissionResults = await permissionEngine.evaluatePermissions(
        relevantPermissions,
        permissionContext
      );

      if (!abortControllerRef.current.signal.aborted) {
        setState(prev => ({
          ...prev,
          permissions: permissionResults,
          loading: false,
          lastUpdated: new Date()
        }));
      }
    } catch (error) {
      if (!abortControllerRef.current.signal.aborted) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Permission loading failed'
        }));
      }
    }
  }, [options.resourceType, permissionContext]);

  // Real-time permission updates via WebSocket
  const setupRealTimeUpdates = useCallback(() => {
    if (!options.enableRealTimeUpdates) return;

    const wsUrl = `wss://api.example.com/permissions/ws?tenantId=${options.tenantId}&userId=${options.userId}`;
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log('Permission WebSocket connected');
      wsRef.current?.send(JSON.stringify({
        type: 'subscribe',
        resourceType: options.resourceType,
        resourceId: options.resourceId
      }));
    };

    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleRealTimeUpdate(data);
      } catch (error) {
        console.error('WebSocket message parsing error:', error);
      }
    };

    wsRef.current.onclose = () => {
      console.log('Permission WebSocket disconnected');
      // Implement reconnection logic
      setTimeout(setupRealTimeUpdates, 5000);
    };

    wsRef.current.onerror = (error) => {
      console.error('Permission WebSocket error:', error);
    };
  }, [options.enableRealTimeUpdates, options.tenantId, options.userId, options.resourceType, options.resourceId]);

  const handleRealTimeUpdate = useCallback((data: any) => {
    const { type, payload } = data;

    switch (type) {
      case 'permission_updated':
        // Update specific permission
        setState(prev => ({
          ...prev,
          permissions: {
            ...prev.permissions,
            [payload.permissionId]: payload.granted
          },
          lastUpdated: new Date()
        }));
        break;

      case 'role_updated':
        // Refresh all permissions when user role changes
        loadPermissions();
        break;

      case 'resource_updated':
        // Refresh permissions for specific resource
        if (payload.resourceId === options.resourceId) {
          loadPermissions();
        }
        break;

      case 'bulk_update':
        // Handle bulk permission updates
        setState(prev => ({
          ...prev,
          permissions: {
            ...prev.permissions,
            ...payload.permissions
          },
          lastUpdated: new Date()
        }));
        break;

      default:
        console.warn('Unknown permission update type:', type);
    }
  }, [loadPermissions, options.resourceId]);

  // Auto-refresh setup
  useEffect(() => {
    if (options.autoRefresh && options.refreshInterval) {
      refreshIntervalRef.current = setInterval(
        loadPermissions,
        options.refreshInterval
      );
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [options.autoRefresh, options.refreshInterval, loadPermissions]);

  // Initial load and cleanup
  useEffect(() => {
    loadPermissions();
    setupRealTimeUpdates();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [loadPermissions, setupRealTimeUpdates]);

  // Optimized permission checking functions
  const checkPermission = useCallback((resource: string, action: string): boolean => {
    const permissionKey = `${resource}:${action}`;
    return state.permissions[permissionKey] || false;
  }, [state.permissions]);

  const hasAnyPermission = useCallback((
    permissions: Array<{resource: string, action: string}>
  ): boolean => {
    return permissions.some(({ resource, action }) => 
      checkPermission(resource, action)
    );
  }, [checkPermission]);

  const hasAllPermissions = useCallback((
    permissions: Array<{resource: string, action: string}>
  ): boolean => {
    return permissions.every(({ resource, action }) => 
      checkPermission(resource, action)
    );
  }, [checkPermission]);

  const refreshPermissions = useCallback(async (): Promise<void> => {
    await loadPermissions();
  }, [loadPermissions]);

  const getPermissionContext = useCallback((): PermissionContext => {
    return permissionContext;
  }, [permissionContext]);

  return {
    ...state,
    checkPermission,
    refreshPermissions,
    hasAnyPermission,
    hasAllPermissions,
    getPermissionContext
  };
}

/**
 * Hook for field-level permissions with conditional rendering support
 */
export function useFieldPermissions(
  fieldIds: string[],
  options: UsePermissionsOptions
) {
  const [fieldPermissions, setFieldPermissions] = useState<Record<string, {
    canRead: boolean;
    canWrite: boolean;
    isRequired: boolean;
  }>>({});

  const { permissions, loading } = useAdvancedPermissions(options);

  useEffect(() => {
    const newFieldPermissions: typeof fieldPermissions = {};

    for (const fieldId of fieldIds) {
      newFieldPermissions[fieldId] = {
        canRead: permissions[`field:${fieldId}:read`] || false,
        canWrite: permissions[`field:${fieldId}:write`] || false,
        isRequired: permissions[`field:${fieldId}:required`] || false
      };
    }

    setFieldPermissions(newFieldPermissions);
  }, [fieldIds, permissions]);

  return {
    fieldPermissions,
    loading,
    getFieldPermission: (fieldId: string) => fieldPermissions[fieldId] || {
      canRead: false,
      canWrite: false,
      isRequired: false
    }
  };
}

/**
 * Hook for bulk permission operations with optimized batching
 */
export function useBulkPermissions(
  resources: Array<{id: string, type: string}>,
  actions: string[],
  options: Omit<UsePermissionsOptions, 'resourceType' | 'resourceId'>
) {
  const [bulkPermissions, setBulkPermissions] = useState<Record<string, Record<string, boolean>>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBulkPermissions = async () => {
      setLoading(true);
      
      try {
        const permissionPromises = resources.map(async (resource) => {
          const context: PermissionContext = {
            ...options,
            resourceId: resource.id,
            resourceType: resource.type,
            timestamp: new Date(),
            userRoles: [], // Would be fetched from context
            userAttributes: {}
          };

          const permissions: Permission[] = actions.map(action => ({
            id: `${resource.type}:${action}`,
            resource: resource.type,
            action: action as any,
            priority: 1
          }));

          const results = await permissionEngine.evaluatePermissions(permissions, context);
          return { resourceId: resource.id, permissions: results };
        });

        const results = await Promise.all(permissionPromises);
        
        const newBulkPermissions: typeof bulkPermissions = {};
        results.forEach(({ resourceId, permissions }) => {
          newBulkPermissions[resourceId] = permissions;
        });

        setBulkPermissions(newBulkPermissions);
      } catch (error) {
        console.error('Bulk permission loading error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBulkPermissions();
  }, [resources, actions, options]);

  return {
    bulkPermissions,
    loading,
    hasPermission: (resourceId: string, action: string) => {
      const resourcePermissions = bulkPermissions[resourceId];
      return resourcePermissions ? resourcePermissions[action] || false : false;
    }
  };
}

// Utility function to get relevant permissions for a resource type
async function getRelevantPermissions(
  resourceType: string,
  signal: AbortSignal
): Promise<Permission[]> {
  // Mock implementation - in real system, this would fetch from API
  const allPermissions: Permission[] = [
    { id: 'read', resource: resourceType, action: 'read', priority: 1 },
    { id: 'write', resource: resourceType, action: 'write', priority: 1 },
    { id: 'delete', resource: resourceType, action: 'delete', priority: 1 },
    { id: 'share', resource: resourceType, action: 'share', priority: 1 },
    { id: 'export', resource: resourceType, action: 'export', priority: 1 }
  ];

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  if (signal.aborted) {
    throw new Error('Permission loading aborted');
  }

  return allPermissions;
}