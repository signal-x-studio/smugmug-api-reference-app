/**
 * Type Safety Improvements - Explicit Interfaces
 * 
 * Replaces 'any' types with proper TypeScript interfaces
 * to improve type safety and development experience.
 */

import type { Photo, Album } from './index';

// =============================================================================
// BULK OPERATION TYPES
// =============================================================================

export interface BulkOperationExecutor {
  parseCommand(command: string): Promise<CommandParseResult>;
  execute(operation: BulkOperationRequest): Promise<BulkOperationResult>;
}

export interface BulkOperationRequest {
  type: string;
  photos: Photo[];
  parameters?: Record<string, unknown>;
  confirmed?: boolean;
}

export interface BulkOperationResult {
  success: boolean;
  operation: string;
  processed: number;
  failed: number;
  errors?: OperationError[];
  rollbackToken?: string;
}

export interface CommandParseResult {
  operation: string;
  parameters: Record<string, unknown>;
  confidence: number;
  suggestions?: string[];
}

export interface OperationError {
  photoId: string;
  error: string;
  code?: string;
}

export interface OperationPreview {
  photoCount: number;
  estimatedTime: number;
  requiresConfirmation: boolean;
  previewData?: {
    samplePhotos: Photo[];
    affectedAlbums: string[];
    estimatedFileSize?: number;
  };
}

// =============================================================================
// AGENT INTEGRATION TYPES
// =============================================================================

export interface AgentOperationExecutor {
  (operation: AgentOperation): Promise<AgentOperationResult>;
}

export interface AgentOperation {
  type: string;
  parameters: Record<string, unknown>;
  photos: Photo[];
  metadata?: {
    source: 'manual' | 'agent' | 'automation';
    timestamp: number;
    userId?: string;
  };
}

export interface AgentOperationResult {
  success: boolean;
  data?: unknown;
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface AgentParameters {
  operation: string;
  params: Record<string, unknown>;
}

// =============================================================================
// SCHEMA.ORG AND STRUCTURED DATA TYPES
// =============================================================================

export interface SchemaOrgStructure {
  '@context': string;
  '@type': string;
  [key: string]: unknown;
}

export interface StructuredDataValidationResult {
  valid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface ComponentStructuredData {
  schema: SchemaOrgStructure;
  metadata: {
    componentId: string;
    componentType: string;
    version: string;
  };
}

// =============================================================================
// SEARCH AND QUERY TYPES
// =============================================================================

export interface SearchParameters {
  semantic?: {
    objects?: string[];
    scenes?: string[];
    keywords?: string[];
  };
  spatial?: {
    location?: string;
    coordinates?: [number, number];
  };
  temporal?: {
    date_range?: {
      start: Date;
      end: Date;
    };
  };
  technical?: {
    camera_make?: string;
    camera_model?: string;
  };
}

export interface QueryProcessingResult {
  success: boolean;
  query_type: 'semantic' | 'spatial' | 'temporal' | 'hybrid';
  search_params: SearchParameters;
  confidence: number;
  structured_data?: ComponentStructuredData;
}

export interface SearchExecutorParams extends SearchParameters {
  limit?: number;
  offset?: number;
  sortBy?: 'relevance' | 'date' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchResult {
  success: boolean;
  photos?: Photo[];
  totalCount?: number;
  searchTime?: number;
  metadata?: Record<string, unknown>;
}

// =============================================================================
// STATE MANAGEMENT TYPES
// =============================================================================

export interface StateChangeHandler<T = unknown> {
  (oldState: T, newState: T, path: string): void;
}

export interface StateSetter<T = unknown> {
  (newState: T): void;
}

export interface AgentStateRegistry {
  [key: string]: unknown;
}

export interface SanitizedState {
  [key: string]: unknown;
}

// =============================================================================
// ACTION PARAMETER TYPES
// =============================================================================

export interface ActionParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required: boolean;
  description: string;
  validation?: (value: unknown) => boolean;
  default?: unknown;
}

export interface ActionExecutionContext {
  userId?: string;
  timestamp: number;
  source: 'manual' | 'agent' | 'automation';
  metadata?: Record<string, unknown>;
}

export interface ActionResult {
  success: boolean;
  message: string;
  data?: unknown;
  error?: string;
}

export interface AgentAction {
  id: string;
  name: string;
  description: string;
  parameters: ActionParameter[];
  execute: (parameters: Record<string, unknown>, context?: ActionExecutionContext) => Promise<ActionResult>;
  examples?: Array<{ 
    parameters: Record<string, unknown>; 
    description: string; 
  }>;
}

// =============================================================================
// SERVICE API TYPES
// =============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
  headers?: Record<string, string>;
}

export interface ApiRequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
}

// =============================================================================
// RE-EXPORT EXISTING TYPES
// =============================================================================

export type { Photo, Album } from '../types';