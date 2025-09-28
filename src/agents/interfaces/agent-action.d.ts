/**
 * Agent Action Interface Definitions
 * 
 * Comprehensive TypeScript interfaces for defining and managing agent-executable actions.
 * These interfaces ensure type safety and standardized interaction patterns between
 * human users, AI agents, and application components.
 */

/**
 * Core agent action definition that describes an executable action available to AI agents
 */
export interface AgentAction {
  /** Unique identifier for the action (e.g., 'photo-gallery.filter') */
  id: string;
  
  /** Human-readable name for the action */
  name: string;
  
  /** Clear description of what the action does */
  description: string;
  
  /** Array of parameters the action accepts */
  parameters: AgentParameter[];
  
  /** Expected return value structure */
  returns: AgentResponse;
  
  /** Required permissions to execute this action */
  permissions: Permission[];
  
  /** Description of equivalent human UI action */
  humanEquivalent: string;
  
  /** Usage examples and expected outputs */
  examples: AgentExample[];
  
  /** Optional category for organizing actions */
  category?: string;
  
  /** Whether this action is currently available */
  enabled?: boolean;
  
  /** Version of the action for compatibility */
  version?: string;
}

/**
 * Parameter definition for agent actions
 */
export interface AgentParameter {
  /** Parameter name */
  name: string;
  
  /** Parameter type */
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  
  /** Whether the parameter is required */
  required: boolean;
  
  /** Description of the parameter */
  description: string;
  
  /** JSON Schema validation for the parameter */
  validation?: JSONSchema;
  
  /** Default value if not provided */
  default?: any;
  
  /** Example values for documentation */
  examples?: any[];
}

/**
 * Expected response structure from agent actions
 */
export interface AgentResponse {
  /** Response type */
  type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'void';
  
  /** JSON Schema describing the response structure */
  schema?: JSONSchema;
  
  /** Human-readable description of the response */
  description?: string;
  
  /** Example response values */
  examples?: any[];
}

/**
 * Permission types for agent actions
 */
export type Permission = 'read' | 'write' | 'delete' | 'admin' | 'execute';

/**
 * Usage example for agent actions
 */
export interface AgentExample {
  /** Description of the example scenario */
  description: string;
  
  /** Example input parameters */
  input: Record<string, any>;
  
  /** Expected output */
  output: any;
  
  /** Additional context or notes */
  notes?: string;
}

/**
 * JSON Schema definition for parameter validation
 */
export interface JSONSchema {
  type?: string;
  properties?: Record<string, JSONSchema>;
  required?: string[];
  items?: JSONSchema;
  enum?: any[];
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  additionalProperties?: boolean | JSONSchema;
}

/**
 * Result of executing an agent action
 */
export interface AgentActionResult {
  /** Whether the action executed successfully */
  success: boolean;
  
  /** Result data if successful */
  data?: any;
  
  /** Error information if unsuccessful */
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  
  /** Performance metrics */
  metrics?: {
    executionTime: number;
    timestamp: number;
  };
  
  /** Additional metadata */
  metadata?: Record<string, any>;
}

/**
 * Configuration for registering agent actions
 */
export interface AgentActionConfig {
  /** The action definition */
  action: AgentAction;
  
  /** Function to execute the action */
  executor: AgentActionExecutor;
  
  /** Optional middleware functions */
  middleware?: AgentActionMiddleware[];
  
  /** Whether to log action executions */
  enableLogging?: boolean;
  
  /** Rate limiting configuration */
  rateLimit?: {
    maxCalls: number;
    windowMs: number;
  };
}

/**
 * Function signature for action executors
 */
export type AgentActionExecutor = (
  parameters: Record<string, any>,
  context: AgentExecutionContext
) => Promise<AgentActionResult>;

/**
 * Middleware function for action execution
 */
export type AgentActionMiddleware = (
  parameters: Record<string, any>,
  context: AgentExecutionContext,
  next: () => Promise<AgentActionResult>
) => Promise<AgentActionResult>;

/**
 * Execution context provided to action executors
 */
export interface AgentExecutionContext {
  /** Unique execution ID */
  executionId: string;
  
  /** Agent identifier if available */
  agentId?: string;
  
  /** User identifier if available */
  userId?: string;
  
  /** Timestamp of execution */
  timestamp: number;
  
  /** Additional context data */
  metadata?: Record<string, any>;
  
  /** Request source information */
  source: {
    type: 'human' | 'agent' | 'system';
    userAgent?: string;
    ip?: string;
  };
}

/**
 * Agent action registry interface
 */
export interface AgentActionRegistry {
  /** Register a new action */
  register(config: AgentActionConfig): void;
  
  /** Unregister an action */
  unregister(actionId: string): void;
  
  /** Get all available actions */
  getActions(): AgentAction[];
  
  /** Get a specific action by ID */
  getAction(actionId: string): AgentAction | undefined;
  
  /** Execute an action */
  execute(
    actionId: string,
    parameters: Record<string, any>,
    context?: Partial<AgentExecutionContext>
  ): Promise<AgentActionResult>;
  
  /** Check if an action exists */
  hasAction(actionId: string): boolean;
  
  /** Get actions by category */
  getActionsByCategory(category: string): AgentAction[];
  
  /** Search actions by description or name */
  searchActions(query: string): AgentAction[];
}