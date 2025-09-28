/**
 * Agent Action Registry
 * 
 * Central registry for managing and executing agent actions across the application.
 * Provides type-safe action registration, execution, and discovery capabilities.
 */

import {
  AgentAction,
  AgentActionConfig,
  AgentActionResult,
  AgentActionExecutor,
  AgentActionRegistry as IAgentActionRegistry,
  AgentExecutionContext
} from '../interfaces/agent-action';

/**
 * Global agent action registry implementation
 */
class AgentActionRegistry implements IAgentActionRegistry {
  private actions = new Map<string, AgentActionConfig>();
  private executionHistory: Array<{
    actionId: string;
    timestamp: number;
    success: boolean;
    executionTime: number;
  }> = [];

  /**
   * Register a new agent action
   */
  register(config: AgentActionConfig): void {
    const { action } = config;
    
    // Validate action configuration
    this.validateActionConfig(config);
    
    // Store the action configuration
    this.actions.set(action.id, config);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`Registered agent action: ${action.id}`);
    }
  }

  /**
   * Unregister an agent action
   */
  unregister(actionId: string): void {
    const removed = this.actions.delete(actionId);
    
    if (process.env.NODE_ENV === 'development' && removed) {
      console.log(`Unregistered agent action: ${actionId}`);
    }
  }

  /**
   * Get all available actions
   */
  getActions(): AgentAction[] {
    return Array.from(this.actions.values())
      .map(config => config.action)
      .filter(action => action.enabled !== false);
  }

  /**
   * Get a specific action by ID
   */
  getAction(actionId: string): AgentAction | undefined {
    const config = this.actions.get(actionId);
    return config?.action;
  }

  /**
   * Execute an agent action
   */
  async execute(
    actionId: string,
    parameters: Record<string, any>,
    context: Partial<AgentExecutionContext> = {}
  ): Promise<AgentActionResult> {
    const startTime = performance.now();
    const executionId = generateExecutionId();
    
    try {
      // Get action configuration
      const config = this.actions.get(actionId);
      if (!config) {
        throw new Error(`Action not found: ${actionId}`);
      }

      // Check if action is enabled
      if (config.action.enabled === false) {
        throw new Error(`Action is disabled: ${actionId}`);
      }

      // Validate parameters
      this.validateParameters(config.action, parameters);

      // Check rate limiting
      if (config.rateLimit) {
        this.checkRateLimit(actionId, config.rateLimit);
      }

      // Create execution context
      const executionContext: AgentExecutionContext = {
        executionId,
        timestamp: Date.now(),
        source: { type: 'agent' },
        ...context
      };

      // Execute middleware chain
      let result: AgentActionResult;
      if (config.middleware && config.middleware.length > 0) {
        result = await this.executeWithMiddleware(
          config.executor,
          parameters,
          executionContext,
          config.middleware
        );
      } else {
        result = await config.executor(parameters, executionContext);
      }

      // Record execution metrics
      const executionTime = performance.now() - startTime;
      this.recordExecution(actionId, true, executionTime);

      // Add performance metrics to result
      result.metrics = {
        executionTime,
        timestamp: Date.now()
      };

      // Log successful execution
      if (config.enableLogging) {
        console.log(`Agent action executed successfully: ${actionId}`, {
          executionId,
          executionTime,
          parameters: this.sanitizeForLogging(parameters)
        });
      }

      return result;

    } catch (error) {
      const executionTime = performance.now() - startTime;
      this.recordExecution(actionId, false, executionTime);

      const result: AgentActionResult = {
        success: false,
        error: {
          code: 'EXECUTION_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
          details: error
        },
        metrics: {
          executionTime,
          timestamp: Date.now()
        }
      };

      // Log error
      console.error(`Agent action execution failed: ${actionId}`, {
        executionId,
        error: result.error,
        parameters: this.sanitizeForLogging(parameters)
      });

      return result;
    }
  }

  /**
   * Check if an action exists
   */
  hasAction(actionId: string): boolean {
    return this.actions.has(actionId);
  }

  /**
   * Get actions by category
   */
  getActionsByCategory(category: string): AgentAction[] {
    return this.getActions().filter(action => action.category === category);
  }

  /**
   * Search actions by description or name
   */
  searchActions(query: string): AgentAction[] {
    const lowercaseQuery = query.toLowerCase();
    return this.getActions().filter(action => 
      action.name.toLowerCase().includes(lowercaseQuery) ||
      action.description.toLowerCase().includes(lowercaseQuery) ||
      (action.category && action.category.toLowerCase().includes(lowercaseQuery))
    );
  }

  /**
   * Get registry statistics
   */
  getStatistics() {
    const actions = this.getActions();
    const recentExecutions = this.executionHistory.slice(-100);
    
    return {
      totalActions: actions.length,
      actionsByCategory: this.groupBy(actions, 'category'),
      totalExecutions: this.executionHistory.length,
      recentSuccessRate: recentExecutions.length > 0 
        ? recentExecutions.filter(e => e.success).length / recentExecutions.length
        : 0,
      averageExecutionTime: recentExecutions.length > 0
        ? recentExecutions.reduce((sum, e) => sum + e.executionTime, 0) / recentExecutions.length
        : 0
    };
  }

  /**
   * Validate action configuration
   */
  private validateActionConfig(config: AgentActionConfig): void {
    const { action } = config;
    
    if (!action.id) {
      throw new Error('Action ID is required');
    }
    
    if (!action.name) {
      throw new Error('Action name is required');
    }
    
    if (!action.description) {
      throw new Error('Action description is required');
    }
    
    if (!config.executor || typeof config.executor !== 'function') {
      throw new Error('Action executor function is required');
    }

    // Validate parameter definitions
    action.parameters.forEach(param => {
      if (!param.name || !param.type) {
        throw new Error(`Invalid parameter definition in action ${action.id}`);
      }
    });
  }

  /**
   * Validate parameters against action definition
   */
  private validateParameters(action: AgentAction, parameters: Record<string, any>): void {
    // Check required parameters
    const requiredParams = action.parameters.filter(p => p.required);
    for (const param of requiredParams) {
      if (!(param.name in parameters)) {
        throw new Error(`Missing required parameter: ${param.name}`);
      }
    }

    // Validate parameter types
    for (const param of action.parameters) {
      if (param.name in parameters) {
        const value = parameters[param.name];
        if (!this.validateParameterType(value, param.type)) {
          throw new Error(`Invalid type for parameter ${param.name}: expected ${param.type}`);
        }
      }
    }
  }

  /**
   * Validate parameter type
   */
  private validateParameterType(value: any, expectedType: string): boolean {
    switch (expectedType) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      case 'array':
        return Array.isArray(value);
      default:
        return true; // Unknown types pass validation
    }
  }

  /**
   * Check rate limiting
   */
  private checkRateLimit(actionId: string, rateLimit: { maxCalls: number; windowMs: number }): void {
    const now = Date.now();
    const windowStart = now - rateLimit.windowMs;
    
    const recentCalls = this.executionHistory.filter(
      execution => execution.actionId === actionId && execution.timestamp > windowStart
    );

    if (recentCalls.length >= rateLimit.maxCalls) {
      throw new Error(`Rate limit exceeded for action: ${actionId}`);
    }
  }

  /**
   * Execute action with middleware chain
   */
  private async executeWithMiddleware(
    executor: AgentActionExecutor,
    parameters: Record<string, any>,
    context: AgentExecutionContext,
    middleware: Array<(
      parameters: Record<string, any>,
      context: AgentExecutionContext,
      next: () => Promise<AgentActionResult>
    ) => Promise<AgentActionResult>>
  ): Promise<AgentActionResult> {
    let index = 0;

    const next = async (): Promise<AgentActionResult> => {
      if (index >= middleware.length) {
        return await executor(parameters, context);
      }
      
      const currentMiddleware = middleware[index++];
      return await currentMiddleware(parameters, context, next);
    };

    return await next();
  }

  /**
   * Record action execution for statistics
   */
  private recordExecution(actionId: string, success: boolean, executionTime: number): void {
    this.executionHistory.push({
      actionId,
      timestamp: Date.now(),
      success,
      executionTime
    });

    // Keep only the last 1000 executions
    if (this.executionHistory.length > 1000) {
      this.executionHistory.splice(0, this.executionHistory.length - 1000);
    }
  }

  /**
   * Sanitize parameters for logging (remove sensitive data)
   */
  private sanitizeForLogging(parameters: Record<string, any>): Record<string, any> {
    const sensitiveKeys = ['password', 'token', 'secret', 'apikey', 'auth'];
    const sanitized = { ...parameters };
    
    Object.keys(sanitized).forEach(key => {
      if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
        sanitized[key] = '[REDACTED]';
      }
    });
    
    return sanitized;
  }

  /**
   * Group items by a property
   */
  private groupBy<T>(items: T[], property: keyof T): Record<string, number> {
    return items.reduce((groups, item) => {
      const key = String(item[property] || 'uncategorized');
      groups[key] = (groups[key] || 0) + 1;
      return groups;
    }, {} as Record<string, number>);
  }
}

/**
 * Generate unique execution ID
 */
function generateExecutionId(): string {
  return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Global registry instance
 */
export const agentActionRegistry = new AgentActionRegistry();

/**
 * Export the registry class for testing and custom instances
 */
export { AgentActionRegistry };

/**
 * Convenience function to register an action
 */
export function registerAgentAction(
  action: AgentAction,
  executor: AgentActionExecutor,
  options: Partial<Omit<AgentActionConfig, 'action' | 'executor'>> = {}
): void {
  agentActionRegistry.register({
    action,
    executor,
    enableLogging: process.env.NODE_ENV === 'development',
    ...options
  });
}

/**
 * Convenience function to execute an action
 */
export async function executeAgentAction(
  actionId: string,
  parameters: Record<string, any> = {},
  context?: Partial<AgentExecutionContext>
): Promise<AgentActionResult> {
  return agentActionRegistry.execute(actionId, parameters, context);
}

/**
 * Get all available actions
 */
export function getAvailableActions(): AgentAction[] {
  return agentActionRegistry.getActions();
}

/**
 * Search for actions
 */
export function searchAgentActions(query: string): AgentAction[] {
  return agentActionRegistry.searchActions(query);
}

// Make registry available globally for agent access
if (typeof window !== 'undefined') {
  (window as any).agentActionRegistry = agentActionRegistry;
}

export default agentActionRegistry;