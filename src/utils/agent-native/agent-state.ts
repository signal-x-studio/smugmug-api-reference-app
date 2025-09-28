/**
 * Agent State Registry System
 * 
 * Provides global state management that exposes React application state
 * to browser agents through a standardized interface.
 */

import { useEffect } from 'react';

// Type definitions for agent state management
export interface AgentStateSchema {
  [key: string]: {
    type: 'string' | 'number' | 'boolean' | 'array' | 'object';
    required: boolean;
    description?: string;
  };
}

export interface AgentStateConfig {
  readOnly?: string[];
  writeOnly?: string[];
  restricted?: string[];
  schema?: AgentStateSchema;
}

export interface AgentStateEntry {
  current: any;
  actions: { [key: string]: Function };
  schema?: AgentStateSchema;
  config?: AgentStateConfig;
  lastUpdated: number;
}

export interface AgentStateSnapshot {
  timestamp: number;
  states: { [componentId: string]: any };
}

// Extend global window interface for agent state
declare global {
  interface Window {
    agentState: { [componentId: string]: AgentStateEntry };
    agentStateEvents: EventTarget;
  }
}

/**
 * Global Agent State Registry
 * Manages the window.agentState interface for browser agents
 */
export class AgentStateRegistry {
  /**
   * Initialize the global agent state system
   */
  static initialize() {
    if (typeof window !== 'undefined') {
      window.agentState = window.agentState || {};
      window.agentStateEvents = window.agentStateEvents || new EventTarget();
    }
  }

  /**
   * Register a component's state and actions with the agent system
   */
  static register(
    componentId: string, 
    state: any, 
    actions: { [key: string]: Function },
    config?: AgentStateConfig
  ): void {
    this.initialize();
    
    const stateEntry: AgentStateEntry = {
      current: state,
      actions: actions,
      schema: config?.schema,
      config: config,
      lastUpdated: Date.now()
    };

    window.agentState[componentId] = stateEntry;
    
    // Emit state change event
    this.emitStateChange(componentId, state);
  }

  /**
   * Update the state for a registered component
   */
  static updateState(componentId: string, newState: any): void {
    if (window.agentState && window.agentState[componentId]) {
      const entry = window.agentState[componentId];
      
      // Validate state if schema exists
      if (entry.schema && !AgentStateManager.validateState(newState, entry.schema)) {
        console.warn(`Agent State: Invalid state update for ${componentId}`, newState);
        return;
      }

      entry.current = newState;
      entry.lastUpdated = Date.now();
      
      // Emit state change event
      this.emitStateChange(componentId, newState);
    }
  }

  /**
   * Unregister a component from the agent state system
   */
  static unregister(componentId: string): void {
    if (window.agentState) {
      delete window.agentState[componentId];
    }
  }

  /**
   * Get all registered states (for debugging and agent discovery)
   */
  static getAllStates(): { [componentId: string]: AgentStateEntry } {
    this.initialize();
    return window.agentState || {};
  }

  /**
   * Get specific component state
   */
  static getState(componentId: string): AgentStateEntry | null {
    this.initialize();
    return window.agentState[componentId] || null;
  }

  /**
   * Emit state change event for agent listeners
   */
  private static emitStateChange(componentId: string, newState: any): void {
    if (window.agentStateEvents) {
      const event = new CustomEvent('stateChange', {
        detail: {
          componentId,
          newState,
          timestamp: Date.now()
        }
      });
      window.agentStateEvents.dispatchEvent(event);
    }
  }
}

/**
 * Agent State Manager
 * Provides utilities for state validation, access control, and sanitization
 */
export class AgentStateManager {
  /**
   * Validate state against a schema
   */
  static validateState(state: any, schema: AgentStateSchema): boolean {
    for (const [key, definition] of Object.entries(schema)) {
      if (definition.required && !(key in state)) {
        return false;
      }
      
      if (key in state) {
        const value = state[key];
        const expectedType = definition.type;
        
        if (!this.validateType(value, expectedType)) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Validate individual value type
   */
  private static validateType(value: any, expectedType: string): boolean {
    switch (expectedType) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number';
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
   * Check if an agent can read a specific state property
   */
  static canRead(property: string, config?: AgentStateConfig): boolean {
    if (!config) return true;
    
    if (config.restricted?.includes(property)) return false;
    if (config.writeOnly?.includes(property)) return false;
    
    return true;
  }

  /**
   * Check if an agent can write to a specific state property
   */
  static canWrite(property: string, config?: AgentStateConfig): boolean {
    if (!config) return true;
    
    if (config.restricted?.includes(property)) return false;
    if (config.readOnly?.includes(property)) return false;
    
    return true;
  }

  /**
   * Check if an agent can access a specific property at all
   */
  static canAccess(property: string, config?: AgentStateConfig): boolean {
    if (!config) return true;
    
    return !config.restricted?.includes(property);
  }

  /**
   * Sanitize state for agent access (remove restricted/internal properties)
   */
  static sanitizeForAgent(state: any): any {
    if (typeof state !== 'object' || state === null) {
      return state;
    }

    const sanitized: any = {};
    
    for (const [key, value] of Object.entries(state)) {
      // Skip internal properties (starting with _) and sensitive data
      if (key.startsWith('_') || key.toLowerCase().includes('password') || key.toLowerCase().includes('secret')) {
        continue;
      }
      
      sanitized[key] = value;
    }
    
    return sanitized;
  }

  /**
   * Create a snapshot of all current states
   */
  static createSnapshot(): AgentStateSnapshot {
    const states: { [componentId: string]: any } = {};
    
    for (const [componentId, entry] of Object.entries(AgentStateRegistry.getAllStates())) {
      states[componentId] = this.sanitizeForAgent(entry.current);
    }
    
    return {
      timestamp: Date.now(),
      states
    };
  }
}

/**
 * Create an agent-compatible React hook for state management
 */
export function createAgentStateHook<T>(
  componentId: string, 
  schema?: AgentStateSchema,
  config?: AgentStateConfig
) {
  return function useAgentState(
    initialState: T,
    setState: React.Dispatch<React.SetStateAction<T>>,
    actions?: { [key: string]: Function }
  ): [T, React.Dispatch<React.SetStateAction<T>>] {
    
    // Validate initial state
    if (schema && !AgentStateManager.validateState(initialState, schema)) {
      throw new Error(`Invalid initial state for component ${componentId}`);
    }

    // Create agent-compatible setState wrapper
    const agentSetState: React.Dispatch<React.SetStateAction<T>> = (newState) => {
      // Handle function updates
      const resolvedState = typeof newState === 'function' 
        ? (newState as Function)(initialState)
        : newState;

      // Validate new state
      if (schema && !AgentStateManager.validateState(resolvedState, schema)) {
        console.warn(`Invalid state update for ${componentId}`, resolvedState);
        return;
      }

      // Update React state
      setState(resolvedState);
      
      // Update agent state
      AgentStateRegistry.updateState(componentId, resolvedState);
    };

    // Register with agent system on mount
    useEffect(() => {
      AgentStateRegistry.register(
        componentId, 
        initialState, 
        actions || {}, 
        { ...config, schema }
      );

      // Cleanup on unmount
      return () => {
        AgentStateRegistry.unregister(componentId);
      };
    }, []);

    // Update agent state when React state changes
    useEffect(() => {
      AgentStateRegistry.updateState(componentId, initialState);
    }, [initialState]);

    return [initialState, agentSetState];
  };
}

/**
 * Hook for components to register actions only (no state)
 */
export function useAgentActions(
  componentId: string,
  actions: { [key: string]: Function }
): void {
  useEffect(() => {
    const currentEntry = AgentStateRegistry.getState(componentId);
    if (currentEntry) {
      currentEntry.actions = { ...currentEntry.actions, ...actions };
    } else {
      AgentStateRegistry.register(componentId, {}, actions);
    }

    return () => {
      AgentStateRegistry.unregister(componentId);
    };
  }, [componentId, actions]);
}

/**
 * Agent event listener hook for components that need to react to agent interactions
 */
export function useAgentStateListener(
  callback: (event: CustomEvent) => void,
  componentIds?: string[]
): void {
  useEffect(() => {
    const handleStateChange = (event: CustomEvent) => {
      const { componentId } = event.detail;
      
      // Filter by component IDs if specified
      if (componentIds && !componentIds.includes(componentId)) {
        return;
      }
      
      callback(event);
    };

    AgentStateRegistry.initialize();
    window.agentStateEvents.addEventListener('stateChange', handleStateChange as EventListener);

    return () => {
      window.agentStateEvents.removeEventListener('stateChange', handleStateChange as EventListener);
    };
  }, [callback, componentIds]);
}

// Initialize the agent state system
AgentStateRegistry.initialize();