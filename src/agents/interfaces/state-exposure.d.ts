/**
 * Agent State Exposure Interface Definitions
 * 
 * TypeScript interfaces for exposing component state and actions to AI agents
 * in a standardized, secure, and performant manner.
 */

import { AgentAction } from './agent-action';
import { SchemaOrgStructuredData } from './schema-org';

/**
 * Main interface for exposing component state to agents
 */
export interface AgentStateExposure {
  /** Unique identifier for this component instance */
  componentId: string;
  
  /** Current component state (read-only for agents) */
  currentState: any;
  
  /** Available agent actions for this component */
  availableActions: AgentAction[];
  
  /** State management functions */
  stateActions: {
    /** Get current state */
    get: () => any;
    
    /** Set new state (if permitted) */
    set: (newState: any) => void;
    
    /** Reset to initial state */
    reset: () => void;
    
    /** Subscribe to state changes */
    subscribe: (callback: StateChangeCallback) => StateSubscription;
  };
  
  /** Schema.org structured data for this component */
  structuredData: SchemaOrgStructuredData;
  
  /** Component metadata */
  metadata: ComponentMetadata;
  
  /** Security configuration */
  security: SecurityConfig;
  
  /** Performance tracking */
  performance: PerformanceMetrics;
}

/**
 * Callback function for state change notifications
 */
export type StateChangeCallback = (
  newState: any,
  previousState: any,
  changeDetails: StateChangeDetails
) => void;

/**
 * Subscription handle for state change callbacks
 */
export interface StateSubscription {
  /** Unique subscription ID */
  id: string;
  
  /** Unsubscribe from state changes */
  unsubscribe: () => void;
  
  /** Whether subscription is still active */
  isActive: boolean;
  
  /** Subscription creation time */
  createdAt: number;
}

/**
 * Details about a state change
 */
export interface StateChangeDetails {
  /** Type of change that occurred */
  changeType: 'update' | 'reset' | 'merge' | 'delete';
  
  /** Path to changed property (for nested changes) */
  changePath?: string[];
  
  /** Previous value */
  previousValue?: any;
  
  /** New value */
  newValue?: any;
  
  /** Source of the change */
  source: {
    type: 'user' | 'agent' | 'system';
    identifier?: string;
  };
  
  /** Timestamp of change */
  timestamp: number;
  
  /** Additional metadata */
  metadata?: Record<string, any>;
}

/**
 * Component metadata exposed to agents
 */
export interface ComponentMetadata {
  /** Component type/name */
  componentType: string;
  
  /** Component version */
  version?: string;
  
  /** Component capabilities */
  capabilities: ComponentCapability[];
  
  /** Data types handled by this component */
  dataTypes: string[];
  
  /** Supported interaction patterns */
  interactionPatterns: InteractionPattern[];
  
  /** Component relationships */
  relationships: ComponentRelationship[];
  
  /** Performance characteristics */
  performanceProfile: {
    averageResponseTime: number;
    throughput: number;
    memoryUsage: number;
  };
  
  /** Last updated timestamp */
  lastUpdated: number;
}

/**
 * Component capability definition
 */
export interface ComponentCapability {
  /** Capability name */
  name: string;
  
  /** Capability description */
  description: string;
  
  /** Whether capability is currently enabled */
  enabled: boolean;
  
  /** Required permissions */
  requiredPermissions?: string[];
  
  /** Performance impact level */
  performanceImpact: 'low' | 'medium' | 'high';
  
  /** Related agent actions */
  relatedActions?: string[];
}

/**
 * Supported interaction patterns
 */
export type InteractionPattern = 
  | 'read-only'
  | 'read-write'
  | 'event-driven'
  | 'streaming'
  | 'batch-processing'
  | 'real-time'
  | 'async-operations';

/**
 * Component relationship definition
 */
export interface ComponentRelationship {
  /** Related component ID */
  componentId: string;
  
  /** Type of relationship */
  relationshipType: 'parent' | 'child' | 'sibling' | 'dependency' | 'observer';
  
  /** Description of relationship */
  description?: string;
  
  /** Whether relationship affects this component's state */
  affectsState: boolean;
  
  /** Data flow direction */
  dataFlow?: 'inbound' | 'outbound' | 'bidirectional';
}

/**
 * Security configuration for agent access
 */
export interface SecurityConfig {
  /** Access level for agents */
  accessLevel: 'none' | 'read-only' | 'limited-write' | 'full-access';
  
  /** Allowed operations */
  allowedOperations: string[];
  
  /** Denied operations */
  deniedOperations: string[];
  
  /** Rate limiting configuration */
  rateLimit?: {
    maxRequestsPerMinute: number;
    maxConcurrentRequests: number;
  };
  
  /** Audit logging settings */
  auditLogging: {
    enabled: boolean;
    logLevel: 'minimal' | 'standard' | 'detailed';
    includeStateSnapshots: boolean;
  };
  
  /** Data sanitization rules */
  dataSanitization: {
    excludeFields?: string[];
    maskFields?: string[];
    sanitizeFunctions?: Record<string, (value: any) => any>;
  };
}

/**
 * Performance metrics for agent interactions
 */
export interface PerformanceMetrics {
  /** Number of agent interactions */
  interactionCount: number;
  
  /** Average response time for agent requests */
  averageResponseTime: number;
  
  /** Current memory usage */
  memoryUsage: number;
  
  /** CPU usage percentage */
  cpuUsage: number;
  
  /** Error rate for agent operations */
  errorRate: number;
  
  /** Last performance measurement timestamp */
  lastMeasurement: number;
  
  /** Performance trend over time */
  performanceTrend: {
    timestamp: number;
    responseTime: number;
    memoryUsage: number;
  }[];
}

/**
 * Global agent state registry
 */
export interface AgentStateRegistry {
  /** Register a component for agent access */
  register(exposure: AgentStateExposure): void;
  
  /** Unregister a component */
  unregister(componentId: string): void;
  
  /** Get all registered components */
  getAllComponents(): AgentStateExposure[];
  
  /** Get a specific component by ID */
  getComponent(componentId: string): AgentStateExposure | undefined;
  
  /** Get components by type */
  getComponentsByType(componentType: string): AgentStateExposure[];
  
  /** Search components by capability */
  getComponentsByCapability(capability: string): AgentStateExposure[];
  
  /** Subscribe to registry changes */
  subscribe(callback: RegistryChangeCallback): StateSubscription;
  
  /** Get registry statistics */
  getStatistics(): RegistryStatistics;
}

/**
 * Registry change notification
 */
export type RegistryChangeCallback = (
  changeType: 'register' | 'unregister' | 'update',
  componentId: string,
  component?: AgentStateExposure
) => void;

/**
 * Registry statistics
 */
export interface RegistryStatistics {
  /** Total number of registered components */
  totalComponents: number;
  
  /** Components by type */
  componentsByType: Record<string, number>;
  
  /** Components by access level */
  componentsByAccessLevel: Record<string, number>;
  
  /** Average performance metrics */
  averagePerformance: {
    responseTime: number;
    memoryUsage: number;
    errorRate: number;
  };
  
  /** Total agent interactions across all components */
  totalInteractions: number;
  
  /** Registry uptime */
  uptime: number;
}

/**
 * Agent state query interface
 */
export interface AgentStateQuery {
  /** Component type filter */
  componentType?: string;
  
  /** Capability requirements */
  requiredCapabilities?: string[];
  
  /** Data type filters */
  dataTypes?: string[];
  
  /** Access level filter */
  accessLevel?: string;
  
  /** Performance requirements */
  performanceRequirements?: {
    maxResponseTime?: number;
    minThroughput?: number;
  };
  
  /** Sort criteria */
  sortBy?: 'performance' | 'name' | 'lastUpdated' | 'interactionCount';
  
  /** Sort order */
  sortOrder?: 'asc' | 'desc';
  
  /** Result limit */
  limit?: number;
  
  /** Offset for pagination */
  offset?: number;
}

/**
 * Agent state query result
 */
export interface AgentStateQueryResult {
  /** Matching components */
  components: AgentStateExposure[];
  
  /** Total count without pagination */
  totalCount: number;
  
  /** Query performance metrics */
  queryMetrics: {
    executionTime: number;
    componentsSearched: number;
    filtersApplied: number;
  };
  
  /** Suggested refinements */
  suggestions?: string[];
}

/**
 * Configuration for dual interface components
 */
export interface DualInterfaceConfig {
  /** Component identifier */
  componentId: string;
  
  /** Component data */
  data: any;
  
  /** Current state */
  state: any;
  
  /** State setter function */
  setState: (newState: any) => void;
  
  /** Custom agent actions */
  customActions?: AgentAction[];
  
  /** Security configuration */
  security?: Partial<SecurityConfig>;
  
  /** Whether to expose to window.agentInterfaces */
  exposeGlobally?: boolean;
  
  /** Performance monitoring settings */
  performanceMonitoring?: {
    enabled: boolean;
    sampleRate: number;
    thresholds: {
      responseTime: number;
      memoryUsage: number;
      errorRate: number;
    };
  };
  
  /** Schema.org configuration */
  schemaConfig?: {
    type: string;
    customProperties?: Record<string, any>;
  };
}