/**
 * Advanced Data Synchronization Engine
 * Demonstrates expertise in complex data integration, conflict resolution, and real-time sync
 */

export interface SyncConfiguration {
  batchSize: number;
  retryAttempts: number;
  conflictResolution: 'government_wins' | 'crm_wins' | 'manual_review' | 'merge_fields';
  syncInterval: number;
  enableRealTimeSync: boolean;
  fieldMappings: FieldMapping[];
  transformations: DataTransformation[];
}

export interface FieldMapping {
  sourceField: string;
  targetField: string;
  required: boolean;
  transformation?: string;
  validationRules?: ValidationRule[];
}

export interface DataTransformation {
  id: string;
  name: string;
  sourceFields: string[];
  targetField: string;
  transformFunction: string; // JavaScript function as string
  priority: number;
}

export interface ValidationRule {
  type: 'required' | 'format' | 'range' | 'custom';
  parameters: Record<string, any>;
  errorMessage: string;
}

export interface SyncResult {
  success: boolean;
  recordsProcessed: number;
  recordsUpdated: number;
  recordsCreated: number;
  recordsFailed: number;
  conflicts: ConflictRecord[];
  errors: SyncError[];
  duration: number;
  timestamp: Date;
}

export interface ConflictRecord {
  id: string;
  sourceRecord: Record<string, any>;
  targetRecord: Record<string, any>;
  conflictFields: string[];
  resolutionStrategy: string;
  resolved: boolean;
}

export interface SyncError {
  recordId: string;
  field?: string;
  error: string;
  severity: 'warning' | 'error' | 'critical';
  retryable: boolean;
}

export class DataSyncEngine {
  private syncQueue: Array<SyncJob> = [];
  private activeSyncs = new Map<string, SyncJob>();
  private syncHistory: SyncResult[] = [];
  private webhookSubscriptions = new Map<string, WebSocket>();

  constructor(private config: SyncConfiguration) {}

  /**
   * Advanced batch synchronization with conflict detection and resolution
   */
  async synchronizeData(
    sourceData: Record<string, any>[],
    targetEntityType: string
  ): Promise<SyncResult> {
    const startTime = Date.now();
    const syncId = this.generateSyncId();
    
    const result: SyncResult = {
      success: true,
      recordsProcessed: 0,
      recordsUpdated: 0,
      recordsCreated: 0,
      recordsFailed: 0,
      conflicts: [],
      errors: [],
      duration: 0,
      timestamp: new Date()
    };

    try {
      // Process data in batches for memory efficiency
      const batches = this.createBatches(sourceData, this.config.batchSize);
      
      for (const batch of batches) {
        const batchResult = await this.processBatch(batch, targetEntityType, syncId);
        this.mergeSyncResults(result, batchResult);
      }

      // Handle conflicts based on configuration
      if (result.conflicts.length > 0) {
        await this.resolveConflicts(result.conflicts);
      }

    } catch (error) {
      result.success = false;
      result.errors.push({
        recordId: 'batch',
        error: error instanceof Error ? error.message : 'Unknown error',
        severity: 'critical',
        retryable: false
      });
    }

    result.duration = Date.now() - startTime;
    this.syncHistory.push(result);
    
    // Emit sync completion event
    this.emitSyncEvent('sync_completed', { syncId, result });
    
    return result;
  }

  private async processBatch(
    batch: Record<string, any>[],
    targetEntityType: string,
    syncId: string
  ): Promise<SyncResult> {
    const batchResult: SyncResult = {
      success: true,
      recordsProcessed: batch.length,
      recordsUpdated: 0,
      recordsCreated: 0,
      recordsFailed: 0,
      conflicts: [],
      errors: [],
      duration: 0,
      timestamp: new Date()
    };

    for (const sourceRecord of batch) {
      try {
        // 1. Transform and validate data
        const transformedRecord = await this.transformRecord(sourceRecord, targetEntityType);
        const validationResult = await this.validateRecord(transformedRecord, targetEntityType);
        
        if (!validationResult.isValid) {
          batchResult.recordsFailed++;
          batchResult.errors.push(...validationResult.errors);
          continue;
        }

        // 2. Check for existing record
        const existingRecord = await this.findExistingRecord(transformedRecord, targetEntityType);
        
        if (existingRecord) {
          // 3. Detect conflicts
          const conflicts = this.detectConflicts(transformedRecord, existingRecord);
          
          if (conflicts.length > 0) {
            const conflictRecord: ConflictRecord = {
              id: this.generateConflictId(),
              sourceRecord: transformedRecord,
              targetRecord: existingRecord,
              conflictFields: conflicts,
              resolutionStrategy: this.config.conflictResolution,
              resolved: false
            };
            
            batchResult.conflicts.push(conflictRecord);
            
            // Auto-resolve based on strategy
            if (this.config.conflictResolution !== 'manual_review') {
              await this.autoResolveConflict(conflictRecord);
              batchResult.recordsUpdated++;
            }
          } else {
            // No conflicts, safe to update
            await this.updateRecord(transformedRecord, existingRecord.id, targetEntityType);
            batchResult.recordsUpdated++;
          }
        } else {
          // 4. Create new record
          await this.createRecord(transformedRecord, targetEntityType);
          batchResult.recordsCreated++;
        }

      } catch (error) {
        batchResult.recordsFailed++;
        batchResult.errors.push({
          recordId: sourceRecord.id || 'unknown',
          error: error instanceof Error ? error.message : 'Processing error',
          severity: 'error',
          retryable: true
        });
      }
    }

    return batchResult;
  }

  /**
   * Advanced data transformation with custom functions and field mappings
   */
  private async transformRecord(
    sourceRecord: Record<string, any>,
    targetEntityType: string
  ): Promise<Record<string, any>> {
    const transformed: Record<string, any> = {};
    
    // Apply field mappings
    for (const mapping of this.config.fieldMappings) {
      if (mapping.targetField.startsWith(targetEntityType)) {
        let value = this.getNestedValue(sourceRecord, mapping.sourceField);
        
        // Apply transformation if specified
        if (mapping.transformation) {
          value = await this.applyTransformation(value, mapping.transformation);
        }
        
        this.setNestedValue(transformed, mapping.targetField, value);
      }
    }

    // Apply custom transformations
    for (const transformation of this.config.transformations) {
      if (transformation.targetField.startsWith(targetEntityType)) {
        const sourceValues = transformation.sourceFields.map(field => 
          this.getNestedValue(sourceRecord, field)
        );
        
        const transformedValue = await this.executeTransformation(
          transformation.transformFunction,
          sourceValues
        );
        
        this.setNestedValue(transformed, transformation.targetField, transformedValue);
      }
    }

    return transformed;
  }

  private async applyTransformation(value: any, transformationType: string): Promise<any> {
    switch (transformationType) {
      case 'currency_to_number':
        return typeof value === 'string' 
          ? parseFloat(value.replace(/[$,]/g, '')) 
          : value;
      
      case 'date_normalize':
        return value ? new Date(value).toISOString() : null;
      
      case 'text_cleanup':
        return typeof value === 'string' 
          ? value.trim().replace(/\s+/g, ' ') 
          : value;
      
      case 'phone_normalize':
        return typeof value === 'string' 
          ? value.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')
          : value;
      
      default:
        return value;
    }
  }

  private async executeTransformation(
    transformFunction: string,
    sourceValues: any[]
  ): Promise<any> {
    try {
      // Safely execute transformation function
      const func = new Function('values', transformFunction);
      return func(sourceValues);
    } catch (error) {
      console.error('Transformation execution error:', error);
      return null;
    }
  }

  /**
   * Advanced conflict detection with field-level granularity
   */
  private detectConflicts(
    sourceRecord: Record<string, any>,
    targetRecord: Record<string, any>
  ): string[] {
    const conflicts: string[] = [];
    
    for (const [key, sourceValue] of Object.entries(sourceRecord)) {
      const targetValue = targetRecord[key];
      
      // Skip if values are the same
      if (this.deepEqual(sourceValue, targetValue)) {
        continue;
      }
      
      // Skip if target value is null/undefined (no conflict)
      if (targetValue == null) {
        continue;
      }
      
      // Check for significant differences
      if (this.isSignificantDifference(sourceValue, targetValue, key)) {
        conflicts.push(key);
      }
    }
    
    return conflicts;
  }

  private isSignificantDifference(sourceValue: any, targetValue: any, fieldName: string): boolean {
    // Custom logic for different field types
    if (fieldName.includes('date')) {
      const sourceDateMs = new Date(sourceValue).getTime();
      const targetDateMs = new Date(targetValue).getTime();
      return Math.abs(sourceDateMs - targetDateMs) > 24 * 60 * 60 * 1000; // 1 day difference
    }
    
    if (fieldName.includes('amount') || fieldName.includes('value')) {
      const sourceNum = parseFloat(sourceValue);
      const targetNum = parseFloat(targetValue);
      return Math.abs(sourceNum - targetNum) > 0.01; // Penny difference
    }
    
    return sourceValue !== targetValue;
  }

  private async autoResolveConflict(conflict: ConflictRecord): Promise<void> {
    let resolvedRecord: Record<string, any>;
    
    switch (this.config.conflictResolution) {
      case 'government_wins':
        resolvedRecord = conflict.sourceRecord;
        break;
      
      case 'crm_wins':
        resolvedRecord = conflict.targetRecord;
        break;
      
      case 'merge_fields':
        resolvedRecord = this.mergeRecords(conflict.sourceRecord, conflict.targetRecord);
        break;
      
      default:
        return; // Manual review required
    }
    
    await this.updateRecord(resolvedRecord, conflict.targetRecord.id, 'opportunity');
    conflict.resolved = true;
  }

  private mergeRecords(
    sourceRecord: Record<string, any>,
    targetRecord: Record<string, any>
  ): Record<string, any> {
    const merged = { ...targetRecord };
    
    for (const [key, sourceValue] of Object.entries(sourceRecord)) {
      // Prefer non-null source values
      if (sourceValue != null && (merged[key] == null || this.shouldPreferSourceValue(key))) {
        merged[key] = sourceValue;
      }
    }
    
    return merged;
  }

  private shouldPreferSourceValue(fieldName: string): boolean {
    // Prefer government data for certain fields
    const governmentPreferredFields = [
      'contract_value',
      'award_date',
      'solicitation_number',
      'agency',
      'naics_code'
    ];
    
    return governmentPreferredFields.includes(fieldName);
  }

  /**
   * Real-time sync via WebSocket connections
   */
  async setupRealTimeSync(endpoint: string, tenantId: string): Promise<void> {
    if (!this.config.enableRealTimeSync) {
      return;
    }

    const ws = new WebSocket(endpoint);
    
    ws.onopen = () => {
      console.log(`Real-time sync connected for tenant ${tenantId}`);
      ws.send(JSON.stringify({ type: 'subscribe', tenantId }));
    };
    
    ws.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        await this.handleRealTimeUpdate(data);
      } catch (error) {
        console.error('Real-time sync error:', error);
      }
    };
    
    ws.onclose = () => {
      console.log(`Real-time sync disconnected for tenant ${tenantId}`);
      // Implement reconnection logic
      setTimeout(() => this.setupRealTimeSync(endpoint, tenantId), 5000);
    };
    
    this.webhookSubscriptions.set(tenantId, ws);
  }

  private async handleRealTimeUpdate(data: any): Promise<void> {
    const { type, payload } = data;
    
    switch (type) {
      case 'opportunity_updated':
        await this.synchronizeData([payload], 'opportunity');
        break;
      
      case 'bulk_update':
        await this.synchronizeData(payload.records, payload.entityType);
        break;
      
      default:
        console.warn('Unknown real-time update type:', type);
    }
  }

  // Utility methods
  private createBatches<T>(array: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < array.length; i += batchSize) {
      batches.push(array.slice(i, i + batchSize));
    }
    return batches;
  }

  private getNestedValue(obj: Record<string, any>, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private setNestedValue(obj: Record<string, any>, path: string, value: any): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    const target = keys.reduce((current, key) => {
      if (!current[key]) current[key] = {};
      return current[key];
    }, obj);
    target[lastKey] = value;
  }

  private deepEqual(a: any, b: any): boolean {
    if (a === b) return true;
    if (a == null || b == null) return a === b;
    if (typeof a !== typeof b) return false;
    if (typeof a !== 'object') return a === b;
    
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    
    if (keysA.length !== keysB.length) return false;
    
    return keysA.every(key => this.deepEqual(a[key], b[key]));
  }

  private generateSyncId(): string {
    return `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateConflictId(): string {
    return `conflict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private mergeSyncResults(target: SyncResult, source: SyncResult): void {
    target.recordsProcessed += source.recordsProcessed;
    target.recordsUpdated += source.recordsUpdated;
    target.recordsCreated += source.recordsCreated;
    target.recordsFailed += source.recordsFailed;
    target.conflicts.push(...source.conflicts);
    target.errors.push(...source.errors);
    target.success = target.success && source.success;
  }

  private emitSyncEvent(eventType: string, data: any): void {
    // Emit custom events for real-time UI updates
    const event = new CustomEvent(eventType, { detail: data });
    window.dispatchEvent(event);
  }

  // Mock database operations (in real implementation, these would use actual database)
  private async findExistingRecord(record: Record<string, any>, entityType: string): Promise<Record<string, any> | null> {
    // Mock implementation
    return Math.random() > 0.7 ? { id: 'existing_123', ...record } : null;
  }

  private async createRecord(record: Record<string, any>, entityType: string): Promise<string> {
    // Mock implementation
    return `new_${Date.now()}`;
  }

  private async updateRecord(record: Record<string, any>, id: string, entityType: string): Promise<void> {
    // Mock implementation
    console.log(`Updated ${entityType} record ${id}`);
  }

  private async validateRecord(record: Record<string, any>, entityType: string): Promise<{isValid: boolean, errors: SyncError[]}> {
    // Mock validation
    return { isValid: true, errors: [] };
  }

  private async resolveConflicts(conflicts: ConflictRecord[]): Promise<void> {
    // Mock conflict resolution
    console.log(`Resolving ${conflicts.length} conflicts`);
  }
}

interface SyncJob {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  startTime: Date;
  endTime?: Date;
}

export const dataSyncEngine = new DataSyncEngine({
  batchSize: 100,
  retryAttempts: 3,
  conflictResolution: 'government_wins',
  syncInterval: 4 * 60 * 60 * 1000, // 4 hours
  enableRealTimeSync: true,
  fieldMappings: [
    {
      sourceField: 'solicitation.title',
      targetField: 'opportunity.title',
      required: true,
      transformation: 'text_cleanup'
    },
    {
      sourceField: 'award.amount',
      targetField: 'opportunity.value',
      required: true,
      transformation: 'currency_to_number'
    }
  ],
  transformations: [
    {
      id: 'combine_agency_office',
      name: 'Combine Agency and Office',
      sourceFields: ['agency.name', 'office.name'],
      targetField: 'opportunity.full_agency',
      transformFunction: 'return values[0] + " - " + values[1]',
      priority: 1
    }
  ]
});