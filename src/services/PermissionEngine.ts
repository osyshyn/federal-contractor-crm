/**
 * Advanced Permission Engine - Enterprise-grade RBAC + ABAC Implementation
 * Demonstrates expertise in complex permission systems with caching and optimization
 */

export interface Permission {
  id: string;
  resource: string;
  action: 'read' | 'write' | 'delete' | 'share' | 'export';
  conditions?: PermissionCondition[];
  priority: number;
}

export interface PermissionCondition {
  field: string;
  operator: 'equals' | 'contains' | 'in' | 'not_in' | 'greater_than' | 'less_than';
  value: any;
  context?: 'user' | 'resource' | 'tenant' | 'time';
}

export interface PermissionContext {
  userId: string;
  tenantId: string;
  resourceId?: string;
  resourceType: string;
  timestamp: Date;
  userRoles: string[];
  userAttributes: Record<string, any>;
  resourceAttributes?: Record<string, any>;
}

export class PermissionEngine {
  private permissionCache = new Map<string, boolean>();
  private cacheExpiry = new Map<string, number>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Advanced permission evaluation with caching and condition processing
   * Supports both role-based (RBAC) and attribute-based (ABAC) access control
   */
  async evaluatePermission(
    permission: Permission,
    context: PermissionContext
  ): Promise<boolean> {
    const cacheKey = this.generateCacheKey(permission, context);
    
    // Check cache first for performance
    if (this.isCacheValid(cacheKey)) {
      return this.permissionCache.get(cacheKey)!;
    }

    let hasPermission = false;

    // 1. Check role-based permissions first
    hasPermission = await this.evaluateRoleBasedPermission(permission, context);

    // 2. Apply attribute-based conditions if role check passes
    if (hasPermission && permission.conditions) {
      hasPermission = await this.evaluateConditions(permission.conditions, context);
    }

    // 3. Apply tenant-level overrides
    hasPermission = await this.applyTenantOverrides(hasPermission, permission, context);

    // Cache the result
    this.cachePermission(cacheKey, hasPermission);

    return hasPermission;
  }

  private async evaluateRoleBasedPermission(
    permission: Permission,
    context: PermissionContext
  ): Promise<boolean> {
    // Simulate complex role hierarchy evaluation
    const roleHierarchy = await this.getRoleHierarchy(context.tenantId);
    const effectiveRoles = this.expandRoles(context.userRoles, roleHierarchy);
    
    return effectiveRoles.some(role => 
      this.roleHasPermission(role, permission.resource, permission.action)
    );
  }

  private async evaluateConditions(
    conditions: PermissionCondition[],
    context: PermissionContext
  ): Promise<boolean> {
    for (const condition of conditions) {
      if (!await this.evaluateCondition(condition, context)) {
        return false;
      }
    }
    return true;
  }

  private async evaluateCondition(
    condition: PermissionCondition,
    context: PermissionContext
  ): Promise<boolean> {
    let contextValue: any;

    switch (condition.context) {
      case 'user':
        contextValue = context.userAttributes[condition.field];
        break;
      case 'resource':
        contextValue = context.resourceAttributes?.[condition.field];
        break;
      case 'tenant':
        contextValue = await this.getTenantAttribute(context.tenantId, condition.field);
        break;
      case 'time':
        contextValue = context.timestamp;
        break;
      default:
        contextValue = context.resourceAttributes?.[condition.field];
    }

    return this.evaluateOperator(contextValue, condition.operator, condition.value);
  }

  private evaluateOperator(contextValue: any, operator: string, expectedValue: any): boolean {
    switch (operator) {
      case 'equals':
        return contextValue === expectedValue;
      case 'contains':
        return Array.isArray(contextValue) 
          ? contextValue.includes(expectedValue)
          : String(contextValue).includes(String(expectedValue));
      case 'in':
        return Array.isArray(expectedValue) && expectedValue.includes(contextValue);
      case 'not_in':
        return Array.isArray(expectedValue) && !expectedValue.includes(contextValue);
      case 'greater_than':
        return Number(contextValue) > Number(expectedValue);
      case 'less_than':
        return Number(contextValue) < Number(expectedValue);
      default:
        return false;
    }
  }

  private generateCacheKey(permission: Permission, context: PermissionContext): string {
    return `${context.userId}:${context.tenantId}:${permission.id}:${context.resourceId || 'global'}`;
  }

  private isCacheValid(cacheKey: string): boolean {
    const expiry = this.cacheExpiry.get(cacheKey);
    return expiry ? Date.now() < expiry : false;
  }

  private cachePermission(cacheKey: string, result: boolean): void {
    this.permissionCache.set(cacheKey, result);
    this.cacheExpiry.set(cacheKey, Date.now() + this.CACHE_TTL);
  }

  // Simulate complex role hierarchy expansion
  private expandRoles(userRoles: string[], hierarchy: Record<string, string[]>): string[] {
    const expanded = new Set(userRoles);
    
    for (const role of userRoles) {
      const inheritedRoles = hierarchy[role] || [];
      inheritedRoles.forEach(inherited => expanded.add(inherited));
    }
    
    return Array.from(expanded);
  }

  private roleHasPermission(role: string, resource: string, action: string): boolean {
    // Simulate role permission lookup
    const rolePermissions = this.getRolePermissions(role);
    return rolePermissions.some(p => 
      p.resource === resource && p.action === action
    );
  }

  private getRolePermissions(role: string): Permission[] {
    // Mock implementation - in real system this would query database
    const permissions: Record<string, Permission[]> = {
      'admin': [
        { id: '1', resource: '*', action: 'read', priority: 100 },
        { id: '2', resource: '*', action: 'write', priority: 100 },
        { id: '3', resource: '*', action: 'delete', priority: 100 },
      ],
      'manager': [
        { id: '4', resource: 'opportunity', action: 'read', priority: 80 },
        { id: '5', resource: 'opportunity', action: 'write', priority: 80 },
        { id: '6', resource: 'contact', action: 'read', priority: 80 },
      ],
      'user': [
        { id: '7', resource: 'opportunity', action: 'read', priority: 60 },
        { id: '8', resource: 'contact', action: 'read', priority: 60 },
      ]
    };
    
    return permissions[role] || [];
  }

  private async getRoleHierarchy(tenantId: string): Promise<Record<string, string[]>> {
    // Mock role hierarchy - in real system this would be tenant-specific
    return {
      'admin': ['manager', 'user'],
      'manager': ['user'],
      'user': []
    };
  }

  private async getTenantAttribute(tenantId: string, field: string): Promise<any> {
    // Mock tenant attribute lookup
    const tenantAttributes: Record<string, any> = {
      'security_level': 'high',
      'compliance_required': true,
      'data_classification': 'confidential'
    };
    
    return tenantAttributes[field];
  }

  private async applyTenantOverrides(
    hasPermission: boolean,
    permission: Permission,
    context: PermissionContext
  ): Promise<boolean> {
    // Apply tenant-specific permission overrides
    const tenantOverrides = await this.getTenantOverrides(context.tenantId);
    const override = tenantOverrides.find(o => 
      o.resource === permission.resource && o.action === permission.action
    );
    
    if (override) {
      return override.allowed;
    }
    
    return hasPermission;
  }

  private async getTenantOverrides(tenantId: string): Promise<Array<{resource: string, action: string, allowed: boolean}>> {
    // Mock tenant overrides
    return [
      { resource: 'financial_data', action: 'read', allowed: false },
      { resource: 'classified_docs', action: 'export', allowed: false }
    ];
  }

  /**
   * Bulk permission evaluation for UI optimization
   * Reduces API calls by evaluating multiple permissions at once
   */
  async evaluatePermissions(
    permissions: Permission[],
    context: PermissionContext
  ): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};
    
    // Use Promise.all for parallel evaluation
    const evaluations = permissions.map(async (permission) => {
      const result = await this.evaluatePermission(permission, context);
      return { id: permission.id, result };
    });
    
    const resolvedEvaluations = await Promise.all(evaluations);
    
    resolvedEvaluations.forEach(({ id, result }) => {
      results[id] = result;
    });
    
    return results;
  }

  /**
   * Clear cache for specific user/tenant (useful for real-time permission updates)
   */
  clearCache(userId?: string, tenantId?: string): void {
    if (!userId && !tenantId) {
      this.permissionCache.clear();
      this.cacheExpiry.clear();
      return;
    }
    
    const keysToDelete: string[] = [];
    
    for (const key of this.permissionCache.keys()) {
      const [keyUserId, keyTenantId] = key.split(':');
      
      if ((userId && keyUserId === userId) || (tenantId && keyTenantId === tenantId)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => {
      this.permissionCache.delete(key);
      this.cacheExpiry.delete(key);
    });
  }
}

export const permissionEngine = new PermissionEngine();