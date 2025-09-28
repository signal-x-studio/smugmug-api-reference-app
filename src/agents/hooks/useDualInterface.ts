/**
 * useDualInterface Hook
 * 
 * React hook for managing dual-interface components that work with both
 * human users and AI agents. Provides state management, action registration,
 * and Schema.org data generation.
 */

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  AgentStateExposure, 
  DualInterfaceConfig,
  StateChangeCallback,
  StateSubscription,
  ComponentMetadata,
  SecurityConfig,
  PerformanceMetrics
} from '../interfaces/state-exposure';
import { AgentAction } from '../interfaces/agent-action';
import { SchemaOrgStructuredData } from '../interfaces/schema-org';
import { createComponentSchema } from '../utils/schema-generator';

/**
 * Return type for the useDualInterface hook
 */
export interface DualInterfaceReturn {
  /** Agent state exposure object */
  agentInterface: AgentStateExposure;
  
  /** Register a new agent action */
  registerAction: (action: AgentAction) => void;
  
  /** Unregister an agent action */
  unregisterAction: (actionId: string) => void;
  
  /** Subscribe to state changes */
  subscribe: (callback: StateChangeCallback) => StateSubscription;
  
  /** Update component metadata */
  updateMetadata: (metadata: Partial<ComponentMetadata>) => void;
  
  /** Update security configuration */
  updateSecurity: (security: Partial<SecurityConfig>) => void;
  
  /** Get current performance metrics */
  getPerformanceMetrics: () => PerformanceMetrics;
  
  /** Validate current configuration */
  validate: () => { isValid: boolean; errors: string[]; warnings: string[] };
}

/**
 * Default security configuration
 */
const DEFAULT_SECURITY: SecurityConfig = {
  accessLevel: 'read-only',
  allowedOperations: ['read', 'subscribe'],
  deniedOperations: ['delete', 'admin'],
  rateLimit: {
    maxRequestsPerMinute: 60,
    maxConcurrentRequests: 5
  },
  auditLogging: {
    enabled: false,
    logLevel: 'standard',
    includeStateSnapshots: false
  },
  dataSanitization: {
    excludeFields: ['password', 'token', 'secret'],
    maskFields: ['email', 'phone']
  }
};

/**
 * Default component metadata
 */
const DEFAULT_METADATA: Partial<ComponentMetadata> = {
  version: '1.0.0',
  capabilities: [],
  dataTypes: ['unknown'],
  interactionPatterns: ['read-only'],
  relationships: [],
  performanceProfile: {
    averageResponseTime: 0,
    throughput: 0,
    memoryUsage: 0
  }
};

/**
 * Hook for managing dual-interface components
 */
export function useDualInterface(config: DualInterfaceConfig): DualInterfaceReturn {
  // Internal state for agent actions
  const [agentActions, setAgentActions] = useState<AgentAction[]>(config.customActions || []);
  
  // Internal state for metadata
  const [metadata, setMetadata] = useState<ComponentMetadata>({
    componentType: extractComponentTypeFromId(config.componentId),
    lastUpdated: Date.now(),
    ...DEFAULT_METADATA,
    ...config.schemaConfig
  } as ComponentMetadata);
  
  // Internal state for security configuration
  const [security, setSecurity] = useState<SecurityConfig>({
    ...DEFAULT_SECURITY,
    ...config.security
  });
  
  // Performance tracking
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    interactionCount: 0,
    averageResponseTime: 0,
    memoryUsage: 0,
    cpuUsage: 0,
    errorRate: 0,
    lastMeasurement: Date.now(),
    performanceTrend: []
  });
  
  // Subscription management
  const subscriptions = useRef<Map<string, StateChangeCallback>>(new Map());
  const subscriptionCounter = useRef(0);
  
  // Previous state reference for change detection
  const previousState = useRef(config.state);
  
  // Generate structured data
  const structuredData = useMemo<SchemaOrgStructuredData>(() => {
    try {
      return createComponentSchema(
        metadata.componentType,
        {
          id: config.componentId,
          ...config.data,
          state: sanitizeStateForAgents(config.state, security)
        },
        agentActions,
        {
          baseUrl: window.location.origin,
          applicationName: document.title || 'Agent-Ready Application'
        }
      );
    } catch (error) {
      console.error('Failed to generate structured data:', error);
      return {
        '@context': 'https://schema.org',
        '@type': 'WebPageElement',
        identifier: config.componentId,
        name: `Component ${config.componentId}`
      };
    }
  }, [config.componentId, config.data, config.state, agentActions, metadata.componentType, security]);
  
  // State management functions
  const stateActions = useMemo(() => ({
    get: () => sanitizeStateForAgents(config.state, security),
    set: (newState: any) => {
      if (security.accessLevel === 'read-only') {
        throw new Error('Component is in read-only mode');
      }
      
      const oldState = config.state;
      config.setState(newState);
      
      // Notify subscribers
      notifyStateChange(oldState, newState, {
        changeType: 'update',
        source: { type: 'agent' },
        timestamp: Date.now()
      });
    },
    reset: () => {
      if (security.accessLevel === 'read-only') {
        throw new Error('Component is in read-only mode');
      }
      
      const oldState = config.state;
      // Assuming initial state is stored somewhere or can be derived
      const initialState = {}; // This would need to be properly implemented
      config.setState(initialState);
      
      // Notify subscribers
      notifyStateChange(oldState, initialState, {
        changeType: 'reset',
        source: { type: 'agent' },
        timestamp: Date.now()
      });
    },
    subscribe: (callback: StateChangeCallback): StateSubscription => {
      const id = `sub_${++subscriptionCounter.current}`;
      subscriptions.current.set(id, callback);
      
      return {
        id,
        unsubscribe: () => {
          subscriptions.current.delete(id);
        },
        isActive: true,
        createdAt: Date.now()
      };
    }
  }), [config.state, config.setState, security.accessLevel]);
  
  // Create agent interface object
  const agentInterface = useMemo<AgentStateExposure>(() => ({
    componentId: config.componentId,
    currentState: sanitizeStateForAgents(config.state, security),
    availableActions: agentActions,
    stateActions,
    structuredData,
    metadata,
    security,
    performance: performanceMetrics
  }), [
    config.componentId,
    config.state,
    agentActions,
    stateActions,
    structuredData,
    metadata,
    security,
    performanceMetrics
  ]);
  
  // Helper function to notify state change subscribers
  const notifyStateChange = useCallback((
    oldState: any, 
    newState: any, 
    changeDetails: Omit<import('../interfaces/state-exposure').StateChangeDetails, 'previousValue' | 'newValue'>
  ) => {
    const fullChangeDetails: import('../interfaces/state-exposure').StateChangeDetails = {
      ...changeDetails,
      previousValue: oldState,
      newValue: newState
    };
    
    subscriptions.current.forEach(callback => {
      try {
        callback(newState, oldState, fullChangeDetails);
      } catch (error) {
        console.error('Error in state change callback:', error);
      }
    });
  }, []);
  
  // Watch for state changes from human interface
  useEffect(() => {
    if (config.state !== previousState.current) {
      notifyStateChange(previousState.current, config.state, {
        changeType: 'update',
        source: { type: 'user' },
        timestamp: Date.now()
      });
      previousState.current = config.state;
    }
  }, [config.state, notifyStateChange]);
  
  // Performance monitoring
  useEffect(() => {
    if (config.performanceMonitoring?.enabled) {
      const interval = setInterval(() => {
        // Update performance metrics (simplified implementation)
        setPerformanceMetrics(prev => ({
          ...prev,
          lastMeasurement: Date.now(),
          // In a real implementation, these would be actual measurements
          memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
          cpuUsage: 0, // TODO: Replace with actual CPU usage measurement
        }));
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [config.performanceMonitoring?.enabled]);
  
  // Expose to global window object if configured
  useEffect(() => {
    if (config.exposeGlobally && security.accessLevel !== 'none') {
      if (typeof window !== 'undefined') {
        window.agentInterfaces = window.agentInterfaces || {};
        window.agentInterfaces[config.componentId] = agentInterface;
        
        return () => {
          if (window.agentInterfaces) {
            delete window.agentInterfaces[config.componentId];
          }
        };
      }
    }
  }, [config.componentId, config.exposeGlobally, agentInterface, security.accessLevel]);
  
  // Action management functions
  const registerAction = useCallback((action: AgentAction) => {
    setAgentActions(prev => {
      const existing = prev.find(a => a.id === action.id);
      if (existing) {
        // Update existing action
        return prev.map(a => a.id === action.id ? action : a);
      } else {
        // Add new action
        return [...prev, action];
      }
    });
  }, []);
  
  const unregisterAction = useCallback((actionId: string) => {
    setAgentActions(prev => prev.filter(a => a.id !== actionId));
  }, []);
  
  // Metadata management
  const updateMetadata = useCallback((newMetadata: Partial<ComponentMetadata>) => {
    setMetadata(prev => ({
      ...prev,
      ...newMetadata,
      lastUpdated: Date.now()
    }));
  }, []);
  
  // Security management
  const updateSecurity = useCallback((newSecurity: Partial<SecurityConfig>) => {
    setSecurity(prev => ({
      ...prev,
      ...newSecurity
    }));
  }, []);
  
  // Performance metrics getter
  const getPerformanceMetrics = useCallback(() => performanceMetrics, [performanceMetrics]);
  
  // Configuration validation
  const validate = useCallback(() => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Validate component ID
    if (!config.componentId) {
      errors.push('Component ID is required');
    }
    
    // Validate security configuration
    if (!security.accessLevel) {
      errors.push('Security access level is required');
    }
    
    // Validate structured data
    if (!structuredData['@context']) {
      errors.push('Structured data missing @context');
    }
    
    // Warnings
    if (agentActions.length === 0) {
      warnings.push('No agent actions defined - component may not be useful to agents');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }, [config.componentId, security.accessLevel, structuredData, agentActions.length]);
  
  return {
    agentInterface,
    registerAction,
    unregisterAction,
    subscribe: stateActions.subscribe,
    updateMetadata,
    updateSecurity,
    getPerformanceMetrics,
    validate
  };
}

/**
 * Sanitize state data for agent consumption
 */
function sanitizeStateForAgents(state: any, security: SecurityConfig): any {
  if (!state || typeof state !== 'object') {
    return state;
  }
  
  const sanitized = { ...state };
  
  // Remove excluded fields
  security.dataSanitization.excludeFields?.forEach(field => {
    delete sanitized[field];
  });
  
  // Mask sensitive fields
  security.dataSanitization.maskFields?.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });
  
  // Apply custom sanitization functions
  if (security.dataSanitization.sanitizeFunctions) {
    Object.entries(security.dataSanitization.sanitizeFunctions).forEach(([field, sanitizer]) => {
      if (sanitized[field]) {
        sanitized[field] = sanitizer(sanitized[field]);
      }
    });
  }
  
  return sanitized;
}

/**
 * Extract component type from component ID
 */
function extractComponentTypeFromId(componentId: string): string {
  // Extract type from ID like 'photo-gallery-123' -> 'PhotoGallery'
  const parts = componentId.split('-');
  return parts
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

export default useDualInterface;