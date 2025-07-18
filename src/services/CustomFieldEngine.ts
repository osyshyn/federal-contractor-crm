/**
 * Advanced Custom Field Engine
 * Demonstrates expertise in dynamic schema management, validation, and performance optimization
 */

export interface CustomFieldDefinition {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'datetime' | 'select' | 'multiselect' | 'boolean' | 'json' | 'file' | 'lookup';
  entity: string;
  required: boolean;
  defaultValue?: any;
  validation?: FieldValidation;
  options?: FieldOption[];
  lookupConfig?: LookupConfiguration;
  displayConfig?: DisplayConfiguration;
  permissions?: FieldPermissions;
  metadata?: FieldMetadata;
}

export interface FieldValidation {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  min?: number;
  max?: number;
  customValidator?: string; // JavaScript function as string
  errorMessage?: string;
}

export interface FieldOption {
  value: string;
  label: string;
  color?: string;
  icon?: string;
  disabled?: boolean;
  metadata?: Record<string, any>;
}

export interface LookupConfiguration {
  targetEntity: string;
  displayField: string;
  valueField: string;
  filterConditions?: Array<{
    field: string;
    operator: string;
    value: any;
  }>;
  allowMultiple: boolean;
  searchable: boolean;
}

export interface DisplayConfiguration {
  width?: number;
  order: number;
  group?: string;
  conditional?: ConditionalDisplay;
  formatting?: FieldFormatting;
}

export interface ConditionalDisplay {
  dependsOn: string;
  condition: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: any;
}

export interface FieldFormatting {
  prefix?: string;
  suffix?: string;
  decimalPlaces?: number;
  dateFormat?: string;
  currencyCode?: string;
}

export interface FieldPermissions {
  read: string[]; // Role IDs
  write: string[]; // Role IDs
  required: string[]; // Role IDs for which field is required
}

export interface FieldMetadata {
  createdBy: string;
  createdAt: Date;
  updatedBy: string;
  updatedAt: Date;
  version: number;
  tags: string[];
  description?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Array<{
    field: string;
    message: string;
    code: string;
  }>;
}

export class CustomFieldEngine {
  private fieldDefinitions = new Map<string, CustomFieldDefinition>();
  private fieldCache = new Map<string, any>();
  private validationCache = new Map<string, ValidationResult>();
  private schemaVersion = 1;

  /**
   * Advanced field definition management with versioning and validation
   */
  async createField(definition: Omit<CustomFieldDefinition, 'id' | 'metadata'>): Promise<string> {
    const fieldId = this.generateFieldId(definition.entity, definition.name);
    
    // Validate field definition
    const validationResult = await this.validateFieldDefinition(definition);
    if (!validationResult.isValid) {
      throw new Error(`Invalid field definition: ${validationResult.errors.map(e => e.message).join(', ')}`);
    }

    // Check for naming conflicts
    if (this.hasFieldConflict(definition.entity, definition.name)) {
      throw new Error(`Field '${definition.name}' already exists for entity '${definition.entity}'`);
    }

    const fullDefinition: CustomFieldDefinition = {
      ...definition,
      id: fieldId,
      metadata: {
        createdBy: 'current_user', // In real app, get from context
        createdAt: new Date(),
        updatedBy: 'current_user',
        updatedAt: new Date(),
        version: 1,
        tags: [],
        description: definition.name
      }
    };

    // Store field definition
    this.fieldDefinitions.set(fieldId, fullDefinition);
    
    // Update schema version for cache invalidation
    this.schemaVersion++;
    
    // Create database schema changes (mock)
    await this.applySchemaChanges(fullDefinition, 'create');
    
    // Emit field creation event
    this.emitFieldEvent('field_created', { fieldId, definition: fullDefinition });
    
    return fieldId;
  }

  async updateField(fieldId: string, updates: Partial<CustomFieldDefinition>): Promise<void> {
    const existingField = this.fieldDefinitions.get(fieldId);
    if (!existingField) {
      throw new Error(`Field '${fieldId}' not found`);
    }

    // Validate updates
    const updatedDefinition = { ...existingField, ...updates };
    const validationResult = await this.validateFieldDefinition(updatedDefinition);
    if (!validationResult.isValid) {
      throw new Error(`Invalid field update: ${validationResult.errors.map(e => e.message).join(', ')}`);
    }

    // Check for breaking changes
    const breakingChanges = this.detectBreakingChanges(existingField, updatedDefinition);
    if (breakingChanges.length > 0) {
      throw new Error(`Breaking changes detected: ${breakingChanges.join(', ')}`);
    }

    // Update metadata
    updatedDefinition.metadata = {
      ...existingField.metadata!,
      updatedBy: 'current_user',
      updatedAt: new Date(),
      version: existingField.metadata!.version + 1
    };

    // Store updated definition
    this.fieldDefinitions.set(fieldId, updatedDefinition);
    
    // Update schema version
    this.schemaVersion++;
    
    // Apply database changes
    await this.applySchemaChanges(updatedDefinition, 'update');
    
    // Clear related caches
    this.clearFieldCache(fieldId);
    
    this.emitFieldEvent('field_updated', { fieldId, definition: updatedDefinition });
  }

  /**
   * Advanced validation with custom validators and cross-field validation
   */
  async validateFieldValue(
    fieldId: string,
    value: any,
    context: Record<string, any> = {}
  ): Promise<ValidationResult> {
    const cacheKey = `${fieldId}:${JSON.stringify(value)}:${this.schemaVersion}`;
    
    // Check validation cache
    if (this.validationCache.has(cacheKey)) {
      return this.validationCache.get(cacheKey)!;
    }

    const field = this.fieldDefinitions.get(fieldId);
    if (!field) {
      return { isValid: false, errors: [{ field: fieldId, message: 'Field not found', code: 'FIELD_NOT_FOUND' }] };
    }

    const result: ValidationResult = { isValid: true, errors: [] };

    // Required validation
    if (field.required && (value == null || value === '')) {
      result.errors.push({
        field: fieldId,
        message: `${field.name} is required`,
        code: 'REQUIRED'
      });
    }

    // Type-specific validation
    if (value != null && value !== '') {
      await this.validateByType(field, value, result);
    }

    // Custom validation
    if (field.validation?.customValidator) {
      await this.executeCustomValidator(field, value, context, result);
    }

    // Cross-field validation
    await this.validateCrossFieldRules(field, value, context, result);

    result.isValid = result.errors.length === 0;
    
    // Cache result
    this.validationCache.set(cacheKey, result);
    
    return result;
  }

  private async validateByType(
    field: CustomFieldDefinition,
    value: any,
    result: ValidationResult
  ): Promise<void> {
    switch (field.type) {
      case 'text':
        await this.validateTextField(field, value, result);
        break;
      case 'number':
        await this.validateNumberField(field, value, result);
        break;
      case 'date':
      case 'datetime':
        await this.validateDateField(field, value, result);
        break;
      case 'select':
        await this.validateSelectField(field, value, result);
        break;
      case 'multiselect':
        await this.validateMultiSelectField(field, value, result);
        break;
      case 'json':
        await this.validateJsonField(field, value, result);
        break;
      case 'lookup':
        await this.validateLookupField(field, value, result);
        break;
    }
  }

  private async validateTextField(
    field: CustomFieldDefinition,
    value: string,
    result: ValidationResult
  ): Promise<void> {
    if (typeof value !== 'string') {
      result.errors.push({
        field: field.id,
        message: `${field.name} must be a string`,
        code: 'INVALID_TYPE'
      });
      return;
    }

    const validation = field.validation;
    if (!validation) return;

    if (validation.minLength && value.length < validation.minLength) {
      result.errors.push({
        field: field.id,
        message: `${field.name} must be at least ${validation.minLength} characters`,
        code: 'MIN_LENGTH'
      });
    }

    if (validation.maxLength && value.length > validation.maxLength) {
      result.errors.push({
        field: field.id,
        message: `${field.name} must be no more than ${validation.maxLength} characters`,
        code: 'MAX_LENGTH'
      });
    }

    if (validation.pattern) {
      const regex = new RegExp(validation.pattern);
      if (!regex.test(value)) {
        result.errors.push({
          field: field.id,
          message: validation.errorMessage || `${field.name} format is invalid`,
          code: 'PATTERN_MISMATCH'
        });
      }
    }
  }

  private async validateNumberField(
    field: CustomFieldDefinition,
    value: number,
    result: ValidationResult
  ): Promise<void> {
    const numValue = Number(value);
    if (isNaN(numValue)) {
      result.errors.push({
        field: field.id,
        message: `${field.name} must be a valid number`,
        code: 'INVALID_NUMBER'
      });
      return;
    }

    const validation = field.validation;
    if (!validation) return;

    if (validation.min !== undefined && numValue < validation.min) {
      result.errors.push({
        field: field.id,
        message: `${field.name} must be at least ${validation.min}`,
        code: 'MIN_VALUE'
      });
    }

    if (validation.max !== undefined && numValue > validation.max) {
      result.errors.push({
        field: field.id,
        message: `${field.name} must be no more than ${validation.max}`,
        code: 'MAX_VALUE'
      });
    }
  }

  private async validateSelectField(
    field: CustomFieldDefinition,
    value: string,
    result: ValidationResult
  ): Promise<void> {
    if (!field.options) return;

    const validOptions = field.options.filter(opt => !opt.disabled).map(opt => opt.value);
    if (!validOptions.includes(value)) {
      result.errors.push({
        field: field.id,
        message: `${field.name} must be one of: ${validOptions.join(', ')}`,
        code: 'INVALID_OPTION'
      });
    }
  }

  private async validateLookupField(
    field: CustomFieldDefinition,
    value: any,
    result: ValidationResult
  ): Promise<void> {
    if (!field.lookupConfig) return;

    // Validate lookup reference exists
    const exists = await this.validateLookupReference(field.lookupConfig, value);
    if (!exists) {
      result.errors.push({
        field: field.id,
        message: `${field.name} references a non-existent record`,
        code: 'INVALID_REFERENCE'
      });
    }
  }

  private async executeCustomValidator(
    field: CustomFieldDefinition,
    value: any,
    context: Record<string, any>,
    result: ValidationResult
  ): Promise<void> {
    try {
      const validator = new Function('value', 'context', 'field', field.validation!.customValidator!);
      const customResult = await validator(value, context, field);
      
      if (customResult === false || (typeof customResult === 'object' && !customResult.isValid)) {
        result.errors.push({
          field: field.id,
          message: field.validation!.errorMessage || `${field.name} validation failed`,
          code: 'CUSTOM_VALIDATION'
        });
      }
    } catch (error) {
      console.error('Custom validator execution error:', error);
      result.errors.push({
        field: field.id,
        message: 'Validation error occurred',
        code: 'VALIDATOR_ERROR'
      });
    }
  }

  /**
   * Dynamic form generation with conditional fields and grouping
   */
  generateFormSchema(entityType: string, userRoles: string[] = []): any {
    const fields = Array.from(this.fieldDefinitions.values())
      .filter(field => field.entity === entityType)
      .filter(field => this.hasFieldPermission(field, 'read', userRoles))
      .sort((a, b) => (a.displayConfig?.order || 0) - (b.displayConfig?.order || 0));

    const groups = this.groupFields(fields);
    
    return {
      entityType,
      groups,
      schema: this.generateJsonSchema(fields),
      uiSchema: this.generateUiSchema(fields),
      validation: this.generateValidationSchema(fields)
    };
  }

  private groupFields(fields: CustomFieldDefinition[]): Record<string, CustomFieldDefinition[]> {
    const groups: Record<string, CustomFieldDefinition[]> = { default: [] };
    
    for (const field of fields) {
      const groupName = field.displayConfig?.group || 'default';
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(field);
    }
    
    return groups;
  }

  private generateJsonSchema(fields: CustomFieldDefinition[]): any {
    const properties: Record<string, any> = {};
    const required: string[] = [];
    
    for (const field of fields) {
      properties[field.id] = this.fieldToJsonSchema(field);
      if (field.required) {
        required.push(field.id);
      }
    }
    
    return {
      type: 'object',
      properties,
      required
    };
  }

  private fieldToJsonSchema(field: CustomFieldDefinition): any {
    const base: any = {
      title: field.name,
      description: field.metadata?.description
    };
    
    switch (field.type) {
      case 'text':
        return {
          ...base,
          type: 'string',
          minLength: field.validation?.minLength,
          maxLength: field.validation?.maxLength,
          pattern: field.validation?.pattern
        };
      
      case 'number':
        return {
          ...base,
          type: 'number',
          minimum: field.validation?.min,
          maximum: field.validation?.max
        };
      
      case 'select':
        return {
          ...base,
          type: 'string',
          enum: field.options?.map(opt => opt.value) || []
        };
      
      case 'multiselect':
        return {
          ...base,
          type: 'array',
          items: {
            type: 'string',
            enum: field.options?.map(opt => opt.value) || []
          }
        };
      
      case 'boolean':
        return {
          ...base,
          type: 'boolean'
        };
      
      default:
        return {
          ...base,
          type: 'string'
        };
    }
  }

  /**
   * Performance optimization with field indexing and caching
   */
  async getFieldsForEntity(entityType: string, useCache: boolean = true): Promise<CustomFieldDefinition[]> {
    const cacheKey = `entity_fields:${entityType}:${this.schemaVersion}`;
    
    if (useCache && this.fieldCache.has(cacheKey)) {
      return this.fieldCache.get(cacheKey);
    }
    
    const fields = Array.from(this.fieldDefinitions.values())
      .filter(field => field.entity === entityType);
    
    if (useCache) {
      this.fieldCache.set(cacheKey, fields);
    }
    
    return fields;
  }

  // Utility methods
  private generateFieldId(entity: string, name: string): string {
    const sanitized = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    return `${entity}_${sanitized}_${Date.now()}`;
  }

  private hasFieldConflict(entity: string, name: string): boolean {
    return Array.from(this.fieldDefinitions.values())
      .some(field => field.entity === entity && field.name.toLowerCase() === name.toLowerCase());
  }

  private detectBreakingChanges(
    existing: CustomFieldDefinition,
    updated: CustomFieldDefinition
  ): string[] {
    const changes: string[] = [];
    
    if (existing.type !== updated.type) {
      changes.push(`Type change from ${existing.type} to ${updated.type}`);
    }
    
    if (existing.required !== updated.required && updated.required) {
      changes.push('Field made required');
    }
    
    return changes;
  }

  private hasFieldPermission(
    field: CustomFieldDefinition,
    action: 'read' | 'write',
    userRoles: string[]
  ): boolean {
    if (!field.permissions) return true;
    
    const allowedRoles = field.permissions[action] || [];
    return allowedRoles.length === 0 || userRoles.some(role => allowedRoles.includes(role));
  }

  private clearFieldCache(fieldId?: string): void {
    if (fieldId) {
      // Clear specific field caches
      for (const key of this.fieldCache.keys()) {
        if (key.includes(fieldId)) {
          this.fieldCache.delete(key);
        }
      }
    } else {
      // Clear all caches
      this.fieldCache.clear();
    }
    this.validationCache.clear();
  }

  private emitFieldEvent(eventType: string, data: any): void {
    const event = new CustomEvent(eventType, { detail: data });
    window.dispatchEvent(event);
  }

  // Mock implementations (in real system, these would interact with database)
  private async validateFieldDefinition(definition: any): Promise<ValidationResult> {
    return { isValid: true, errors: [] };
  }

  private async applySchemaChanges(definition: CustomFieldDefinition, operation: 'create' | 'update' | 'delete'): Promise<void> {
    console.log(`Schema change: ${operation} field ${definition.name}`);
  }

  private async validateLookupReference(config: LookupConfiguration, value: any): Promise<boolean> {
    // Mock lookup validation
    return true;
  }

  private async validateCrossFieldRules(
    field: CustomFieldDefinition,
    value: any,
    context: Record<string, any>,
    result: ValidationResult
  ): Promise<void> {
    // Mock cross-field validation
  }

  private async validateDateField(field: CustomFieldDefinition, value: any, result: ValidationResult): Promise<void> {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      result.errors.push({
        field: field.id,
        message: `${field.name} must be a valid date`,
        code: 'INVALID_DATE'
      });
    }
  }

  private async validateMultiSelectField(field: CustomFieldDefinition, value: any[], result: ValidationResult): Promise<void> {
    if (!Array.isArray(value)) {
      result.errors.push({
        field: field.id,
        message: `${field.name} must be an array`,
        code: 'INVALID_TYPE'
      });
      return;
    }

    if (field.options) {
      const validOptions = field.options.filter(opt => !opt.disabled).map(opt => opt.value);
      const invalidValues = value.filter(v => !validOptions.includes(v));
      
      if (invalidValues.length > 0) {
        result.errors.push({
          field: field.id,
          message: `${field.name} contains invalid options: ${invalidValues.join(', ')}`,
          code: 'INVALID_OPTIONS'
        });
      }
    }
  }

  private async validateJsonField(field: CustomFieldDefinition, value: any, result: ValidationResult): Promise<void> {
    try {
      if (typeof value === 'string') {
        JSON.parse(value);
      }
    } catch (error) {
      result.errors.push({
        field: field.id,
        message: `${field.name} must be valid JSON`,
        code: 'INVALID_JSON'
      });
    }
  }

  private generateUiSchema(fields: CustomFieldDefinition[]): any {
    const uiSchema: Record<string, any> = {};
    
    for (const field of fields) {
      uiSchema[field.id] = {
        'ui:widget': this.getUiWidget(field),
        'ui:options': this.getUiOptions(field),
        'ui:order': field.displayConfig?.order || 0
      };
    }
    
    return uiSchema;
  }

  private getUiWidget(field: CustomFieldDefinition): string {
    switch (field.type) {
      case 'text': return field.validation?.maxLength && field.validation.maxLength > 100 ? 'textarea' : 'text';
      case 'number': return 'updown';
      case 'date': return 'date';
      case 'datetime': return 'datetime';
      case 'select': return 'select';
      case 'multiselect': return 'checkboxes';
      case 'boolean': return 'checkbox';
      case 'json': return 'textarea';
      default: return 'text';
    }
  }

  private getUiOptions(field: CustomFieldDefinition): any {
    const options: any = {};
    
    if (field.displayConfig?.conditional) {
      options.conditional = field.displayConfig.conditional;
    }
    
    if (field.options) {
      options.enumOptions = field.options.map(opt => ({
        value: opt.value,
        label: opt.label
      }));
    }
    
    return options;
  }

  private generateValidationSchema(fields: CustomFieldDefinition[]): any {
    const validation: Record<string, any> = {};
    
    for (const field of fields) {
      if (field.validation) {
        validation[field.id] = field.validation;
      }
    }
    
    return validation;
  }
}

export const customFieldEngine = new CustomFieldEngine();