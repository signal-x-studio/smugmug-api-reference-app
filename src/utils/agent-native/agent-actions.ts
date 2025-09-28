/**
 * Agent Action Registry Infrastructure
 * 
 * Provides a complete registry of programmatic equivalents for all UI functionality
 * that browser agents can discover and execute.
 */

// Type definitions for agent actions
export interface ActionParameter {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required: boolean;
  description?: string;
  validation?: (value: any) => boolean;
  default?: any;
}

export interface AgentAction {
  name: string;
  description: string;
  parameters: { [key: string]: ActionParameter };
  execute: (parameters: any) => Promise<ActionResult>;
  humanEquivalent?: string;
  category?: string;
  examples?: Array<{ parameters: any; description: string }>;
}

export interface ActionResult {
  success: boolean;
  data?: any;
  error?: string;
  warnings?: string[];
  executionTime?: number;
}

export interface ActionExecutionContext {
  actionName: string;
  parameters: any;
  timestamp: number;
  executionId: string;
}

export interface ExecutionHistory {
  actionName: string;
  parameters: any;
  result: ActionResult;
  timestamp: number;
  executionTime: number;
  success: boolean;
}

// Extend global window interface for agent actions
declare global {
  interface Window {
    agentActions: { [actionName: string]: AgentAction };
    agentActionHistory: ExecutionHistory[];
  }
}

/**
 * Global Agent Action Registry
 * Manages the window.agentActions interface for browser agents
 */
export class AgentActionRegistry {
  /**
   * Initialize the global agent action system
   */
  static initialize() {
    if (typeof window !== 'undefined') {
      window.agentActions = window.agentActions || {};
      window.agentActionHistory = window.agentActionHistory || [];
    }
  }

  /**
   * Register an action with the agent system
   */
  static register(actionName: string, action: AgentAction): void {
    this.initialize();
    window.agentActions[actionName] = action;
  }

  /**
   * Unregister an action from the agent system
   */
  static unregister(actionName: string): void {
    if (window.agentActions) {
      delete window.agentActions[actionName];
    }
  }

  /**
   * Get all registered actions
   */
  static getAllActions(): { [actionName: string]: AgentAction } {
    this.initialize();
    return window.agentActions || {};
  }

  /**
   * Get specific action by name
   */
  static getAction(actionName: string): AgentAction | null {
    this.initialize();
    return window.agentActions[actionName] || null;
  }

  /**
   * Execute an action with parameter validation
   */
  static async execute(actionName: string, parameters: any = {}): Promise<ActionResult> {
    const startTime = Date.now();
    
    try {
      const action = this.getAction(actionName);
      if (!action) {
        return {
          success: false,
          error: `Action '${actionName}' not found`
        };
      }

      // Validate parameters
      if (!this.validateParameters(actionName, parameters)) {
        return {
          success: false,
          error: `Invalid parameters for action '${actionName}'`
        };
      }

      // Execute action
      const result = await action.execute(parameters);
      const executionTime = Date.now() - startTime;

      // Record execution history
      this.recordExecution({
        actionName,
        parameters,
        result: { ...result, executionTime },
        timestamp: startTime,
        executionTime,
        success: result.success
      });

      return { ...result, executionTime };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorResult: ActionResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime
      };

      this.recordExecution({
        actionName,
        parameters,
        result: errorResult,
        timestamp: startTime,
        executionTime,
        success: false
      });

      return errorResult;
    }
  }

  /**
   * Validate parameters for an action
   */
  static validateParameters(actionName: string, parameters: any): boolean {
    const action = this.getAction(actionName);
    if (!action) return false;

    for (const [paramName, paramDef] of Object.entries(action.parameters)) {
      const value = parameters[paramName];

      // Check required parameters
      if (paramDef.required && (value === undefined || value === null)) {
        console.warn(`Missing required parameter '${paramName}' for action '${actionName}'`);
        return false;
      }

      // Validate parameter type if value is provided
      if (value !== undefined && value !== null) {
        if (!this.validateParameterValue(value, paramDef)) {
          console.warn(`Invalid type for parameter '${paramName}' in action '${actionName}'`);
          return false;
        }

        // Custom validation if provided
        if (paramDef.validation && !paramDef.validation(value)) {
          console.warn(`Custom validation failed for parameter '${paramName}' in action '${actionName}'`);
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Validate individual parameter value
   */
  static validateParameterValue(value: any, paramDef: ActionParameter): boolean {
    switch (paramDef.type) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'array':
        return Array.isArray(value);
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      default:
        return true;
    }
  }

  /**
   * Record action execution in history
   */
  private static recordExecution(execution: ExecutionHistory): void {
    if (window.agentActionHistory) {
      window.agentActionHistory.push(execution);
      
      // Limit history size to prevent memory issues
      const maxHistorySize = 100;
      if (window.agentActionHistory.length > maxHistorySize) {
        window.agentActionHistory = window.agentActionHistory.slice(-maxHistorySize);
      }
    }
  }

  /**
   * Get execution history
   */
  static getExecutionHistory(): ExecutionHistory[] {
    this.initialize();
    return window.agentActionHistory || [];
  }

  /**
   * Clear execution history
   */
  static clearHistory(): void {
    if (window.agentActionHistory) {
      window.agentActionHistory.length = 0;
    }
  }

  /**
   * Get actions by category
   */
  static getActionsByCategory(category: string): { [actionName: string]: AgentAction } {
    const allActions = this.getAllActions();
    const filtered: { [actionName: string]: AgentAction } = {};
    
    for (const [name, action] of Object.entries(allActions)) {
      if (action.category === category) {
        filtered[name] = action;
      }
    }
    
    return filtered;
  }
}

/**
 * Agent Action Executor with Progress Tracking
 */
export class AgentActionExecutor {
  private executionHistory: ExecutionHistory[] = [];
  private maxHistorySize: number;

  constructor(options: { maxHistorySize?: number } = {}) {
    this.maxHistorySize = options.maxHistorySize || 50;
  }

  /**
   * Execute action with progress tracking and callbacks
   */
  async executeWithProgress(
    actionName: string,
    actionFunction: (parameters: any) => Promise<ActionResult>,
    parameters: any = {},
    progressCallback?: (progress: { status: string; message?: string; progress?: number }) => void
  ): Promise<ActionResult> {
    const startTime = Date.now();
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      progressCallback?.({ status: 'started', message: `Executing ${actionName}` });

      const result = await actionFunction(parameters);
      const executionTime = Date.now() - startTime;

      // Record in local history
      const execution: ExecutionHistory = {
        actionName,
        parameters,
        result,
        timestamp: startTime,
        executionTime,
        success: result.success
      };

      this.recordExecution(execution);

      progressCallback?.({ 
        status: result.success ? 'completed' : 'failed', 
        message: result.success ? 'Action completed successfully' : result.error 
      });

      return { ...result, executionTime };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorResult: ActionResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime
      };

      this.recordExecution({
        actionName,
        parameters,
        result: errorResult,
        timestamp: startTime,
        executionTime,
        success: false
      });

      progressCallback?.({ 
        status: 'error', 
        message: `Action failed: ${errorResult.error}` 
      });

      return errorResult;
    }
  }

  /**
   * Record execution in local history
   */
  private recordExecution(execution: ExecutionHistory): void {
    this.executionHistory.push(execution);
    
    // Limit history size
    if (this.executionHistory.length > this.maxHistorySize) {
      this.executionHistory = this.executionHistory.slice(-this.maxHistorySize);
    }
  }

  /**
   * Get execution history for this executor
   */
  getExecutionHistory(): ExecutionHistory[] {
    return [...this.executionHistory];
  }

  /**
   * Clear execution history
   */
  clearHistory(): void {
    this.executionHistory = [];
  }
}

/**
 * Helper function to create agent actions with proper typing
 */
export function createAgentAction(
  name: string,
  description: string,
  parameters: { [key: string]: ActionParameter },
  execute: (parameters: any) => Promise<ActionResult>,
  humanEquivalent?: string,
  category?: string
): AgentAction {
  return {
    name,
    description,
    parameters,
    execute,
    humanEquivalent: humanEquivalent || `Execute ${name} programmatically`,
    category
  };
}

/**
 * Decorator for automatically registering action methods
 */
export function agentAction(
  name: string,
  description: string,
  parameters: { [key: string]: ActionParameter },
  humanEquivalent?: string,
  category?: string
) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    // Register the action when the method is first accessed
    const action = createAgentAction(
      name,
      description,
      parameters,
      originalMethod,
      humanEquivalent,
      category
    );

    AgentActionRegistry.register(name, action);

    return descriptor;
  };
}

/**
 * Batch action creator for related operations
 */
export function createBatchAction(
  baseName: string,
  description: string,
  itemParameters: { [key: string]: ActionParameter },
  execute: (items: any[]) => Promise<ActionResult>,
  humanEquivalent?: string
): AgentAction {
  return createAgentAction(
    `${baseName}.batch`,
    `Batch ${description}`,
    {
      items: {
        type: 'array',
        required: true,
        description: 'Array of items to process'
      },
      options: {
        type: 'object',
        required: false,
        description: 'Batch processing options'
      }
    },
    execute,
    humanEquivalent || `Batch ${description} using UI selection`,
    'batch'
  );
}

// Initialize the agent action system
AgentActionRegistry.initialize();