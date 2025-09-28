/**
 * Agent Infrastructure Index
 * 
 * Main entry point for all agent-ready architecture components, utilities, and types.
 * This module provides a clean API for integrating agent capabilities into React components.
 */

// Core interfaces
export type {
  // Agent Action interfaces
  AgentAction,
  AgentParameter,
  AgentResponse,
  AgentActionResult,
  AgentActionConfig,
  AgentActionExecutor,
  AgentActionMiddleware,
  AgentExecutionContext,
  AgentActionRegistry as IAgentActionRegistry,
  Permission,
  AgentExample,
  JSONSchema
} from './interfaces/agent-action';

export type {
  // Schema.org interfaces
  SchemaOrgBase,
  SchemaOrgWebApplication,
  SchemaOrgImageGallery,
  SchemaOrgPhotograph,
  SchemaOrgPerson,
  SchemaOrgOrganization,
  SchemaOrgPlace,
  SchemaOrgAction,
  SchemaOrgStructuredData,
  SchemaOrgTypeName,
  SchemaOrgConfig
} from './interfaces/schema-org';

export type {
  // Semantic query interfaces
  SemanticQuery,
  Entity,
  EntityType,
  IntentClassification,
  NLPConfig,
  EntityPattern,
  IntentPattern,
  NLPProcessor,
  QueryContext,
  ContextualSemanticQuery,
  QueryExpansion,
  NLPProcessingResult,
  PhotoQueryType,
  PhotoQueryParameters
} from './interfaces/semantic-query';

export type {
  // State exposure interfaces
  AgentStateExposure,
  StateChangeCallback,
  StateSubscription,
  StateChangeDetails,
  ComponentMetadata,
  ComponentCapability,
  InteractionPattern,
  ComponentRelationship,
  SecurityConfig,
  PerformanceMetrics,
  AgentStateRegistry,
  RegistryChangeCallback,
  RegistryStatistics,
  AgentStateQuery,
  AgentStateQueryResult,
  DualInterfaceConfig
} from './interfaces/state-exposure';

// Core components
export {
  AgentWrapper,
  useAgentWrapper,
  validateAgentWrapper
} from './components/AgentWrapper';

export {
  AgentIntentHandler
} from './components/AgentIntentHandler';

// Hooks
export {
  useDualInterface,
  type DualInterfaceReturn
} from './hooks/useDualInterface';

// Utilities
export {
  generateSchemaOrgData,
  generateWebApplicationSchema,
  generateImageGallerySchema,
  generatePhotographSchema,
  generatePersonSchema,
  generateActionSchema,
  validateSchemaOrg,
  minifySchemaOrg,
  debugSchemaOrg,
  createComponentSchema
} from './utils/schema-generator';

// Registry
export {
  agentActionRegistry,
  AgentActionRegistry,
  registerAgentAction,
  executeAgentAction,
  getAvailableActions,
  searchAgentActions
} from './registry';

/**
 * Quick setup function for adding agent capabilities to a component
 */
import { useDualInterface } from './hooks/useDualInterface';
import { AgentWrapper } from './components/AgentWrapper';
import { DualInterfaceConfig } from './interfaces/state-exposure';

export function createAgentReadyComponent<T extends Record<string, any>>(
  componentId: string,
  data: T,
  state: any,
  setState: (newState: any) => void,
  options: Partial<DualInterfaceConfig> = {}
) {
  const config: DualInterfaceConfig = {
    componentId,
    data,
    state,
    setState,
    exposeGlobally: true,
    performanceMonitoring: {
      enabled: process.env.NODE_ENV === 'development'
    },
    security: {
      accessLevel: 'read-only',
      allowedOperations: ['read', 'subscribe'],
      deniedOperations: ['delete', 'admin'],
      auditLogging: {
        enabled: process.env.NODE_ENV === 'development',
        logLevel: 'standard',
        includeStateSnapshots: false
      },
      dataSanitization: {
        excludeFields: ['password', 'token', 'secret']
      }
    },
    ...options
  };

  return useDualInterface(config);
}

/**
 * Higher-order component for making any React component agent-ready
 */
import React from 'react';

export function withAgentCapabilities<P extends Record<string, any>>(
  WrappedComponent: React.ComponentType<P>,
  config: {
    componentId: string;
    extractData?: (props: P) => any;
    extractState?: (props: P) => any;
    customActions?: import('./interfaces/agent-action').AgentAction[];
    schemaType?: import('./interfaces/schema-org').SchemaOrgTypeName;
  }
) {
  return function AgentReadyComponent(props: P) {
    const [internalState, setInternalState] = React.useState({});
    
    const data = config.extractData ? config.extractData(props) : props;
    const state = config.extractState ? config.extractState(props) : internalState;
    
    const { agentInterface } = useDualInterface({
      componentId: config.componentId,
      data,
      state,
      setState: setInternalState,
      customActions: config.customActions,
      exposeGlobally: true
    });

    return (
      <AgentWrapper 
        agentInterface={agentInterface} 
        schemaType={config.schemaType}
      >
        <WrappedComponent {...props} />
      </AgentWrapper>
    );
  };
}

/**
 * Constants for common Schema.org types
 */
export const SCHEMA_TYPES = {
  WEB_APPLICATION: 'WebApplication' as const,
  IMAGE_GALLERY: 'ImageGallery' as const,
  PHOTOGRAPH: 'Photograph' as const,
  PERSON: 'Person' as const,
  ORGANIZATION: 'Organization' as const,
  PLACE: 'Place' as const,
  ACTION: 'Action' as const,
  VIEW_ACTION: 'ViewAction' as const,
  EDIT_ACTION: 'EditAction' as const,
  SHARE_ACTION: 'ShareAction' as const,
  SEARCH_ACTION: 'SearchAction' as const,
  CREATE_ACTION: 'CreateAction' as const,
  DELETE_ACTION: 'DeleteAction' as const
};

/**
 * Constants for common interaction patterns
 */
export const INTERACTION_PATTERNS = {
  READ_ONLY: 'read-only' as const,
  READ_WRITE: 'read-write' as const,
  EVENT_DRIVEN: 'event-driven' as const,
  STREAMING: 'streaming' as const,
  BATCH_PROCESSING: 'batch-processing' as const,
  REAL_TIME: 'real-time' as const,
  ASYNC_OPERATIONS: 'async-operations' as const
};

/**
 * Constants for security access levels
 */
export const ACCESS_LEVELS = {
  NONE: 'none' as const,
  READ_ONLY: 'read-only' as const,
  LIMITED_WRITE: 'limited-write' as const,
  FULL_ACCESS: 'full-access' as const
};

/**
 * Version information
 */
export const AGENT_INFRASTRUCTURE_VERSION = '1.0.0';

/**
 * Development utilities
 */
export const DevUtils = {
  /**
   * Log agent interface information for debugging
   */
  debugAgentInterface: (componentId: string) => {
    if (typeof window !== 'undefined' && window.agentInterfaces) {
      const agentInterface = window.agentInterfaces[componentId];
      if (agentInterface) {
        console.group(`Agent Interface Debug: ${componentId}`);
        console.log('Current State:', agentInterface.currentState);
        console.log('Available Actions:', agentInterface.availableActions);
        console.log('Metadata:', agentInterface.metadata);
        console.log('Security Config:', agentInterface.security);
        console.log('Performance Metrics:', agentInterface.performance);
        console.log('Structured Data:', agentInterface.structuredData);
        console.groupEnd();
      } else {
        console.warn(`No agent interface found for component: ${componentId}`);
      }
    }
  },

  /**
   * List all registered agent interfaces
   */
  listAgentInterfaces: () => {
    if (typeof window !== 'undefined' && window.agentInterfaces) {
      const interfaces = Object.keys(window.agentInterfaces);
      console.log('Registered Agent Interfaces:', interfaces);
      return interfaces;
    }
    return [];
  },

  /**
   * Validate all agent interfaces
   */
  validateAllInterfaces: () => {
    if (typeof window !== 'undefined' && window.agentInterfaces) {
      Object.entries(window.agentInterfaces).forEach(([id, agentInterface]) => {
        const validation = validateAgentWrapper(agentInterface);
        if (!validation.isValid) {
          console.error(`Invalid agent interface: ${id}`, validation.errors);
        } else if (validation.warnings.length > 0) {
          console.warn(`Agent interface warnings: ${id}`, validation.warnings);
        }
      });
    }
  }
};

// Global type augmentation
declare global {
  interface Window {
    agentInterfaces?: Record<string, import('./interfaces/state-exposure').AgentStateExposure>;
    agentActionRegistry?: import('./interfaces/agent-action').AgentActionRegistry;
  }
}

export default {
  // Main exports
  AgentWrapper,
  useDualInterface,
  createAgentReadyComponent,
  withAgentCapabilities,
  
  // Utilities
  generateSchemaOrgData,
  validateSchemaOrg,
  
  // Registry
  agentActionRegistry,
  registerAgentAction,
  executeAgentAction,
  
  // Constants
  SCHEMA_TYPES,
  INTERACTION_PATTERNS,
  ACCESS_LEVELS,
  
  // Development
  DevUtils,
  
  // Version
  version: AGENT_INFRASTRUCTURE_VERSION
};