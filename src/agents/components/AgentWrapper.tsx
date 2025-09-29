/**
 * AgentWrapper Component
 * 
 * A wrapper component that adds agent-ready capabilities to any React component
 * by injecting Schema.org structured data and exposing agent interfaces.
 */

import React, { useEffect, useMemo, useRef } from 'react';
import type { JSX } from 'react';
import { AgentStateExposure } from '../interfaces/state-exposure';
import { SchemaOrgStructuredData, SchemaOrgTypeName } from '../interfaces/schema-org';
import { AgentAction } from '../interfaces/agent-action';

/**
 * Props for the AgentWrapper component
 */
export interface AgentWrapperProps {
  /** Agent interface configuration */
  agentInterface: AgentStateExposure;
  
  /** Child components to wrap */
  children: React.ReactNode;
  
  /** Schema.org type for the wrapper element */
  schemaType?: SchemaOrgTypeName;
  
  /** HTML element type for the wrapper */
  as?: keyof JSX.IntrinsicElements;
  
  /** Additional CSS classes */
  className?: string;
  
  /** Additional HTML attributes */
  htmlAttributes?: Record<string, string>;
  
  /** Whether to include debug information */
  debug?: boolean;
}

/**
 * AgentWrapper component that makes any React component agent-ready
 */
export const AgentWrapper: React.FC<AgentWrapperProps> = ({
  agentInterface,
  children,
  schemaType = 'WebApplication',
  as: Component = 'article',
  className = '',
  htmlAttributes = {},
  debug = false
}) => {
  const wrapperRef = useRef<HTMLElement>(null);
  const structuredDataRef = useRef<HTMLScriptElement>(null);

  // Generate structured data JSON-LD
  const structuredDataJson = useMemo(() => {
    try {
      return JSON.stringify(agentInterface.structuredData, null, debug ? 2 : 0);
    } catch (error) {
      console.error('Failed to serialize structured data:', error);
      return '{}';
    }
  }, [agentInterface.structuredData, debug]);

  // Generate agent actions data attribute
  const agentActionsData = useMemo(() => {
    try {
      return JSON.stringify(
        agentInterface.availableActions.map(action => ({
          id: action.id,
          name: action.name,
          description: action.description,
          parameters: action.parameters.map(p => ({
            name: p.name,
            type: p.type,
            required: p.required
          }))
        }))
      );
    } catch (error) {
      console.error('Failed to serialize agent actions:', error);
      return '[]';
    }
  }, [agentInterface.availableActions]);

  // Expose agent interface to global window object
  useEffect(() => {
    if (agentInterface.security.accessLevel !== 'none') {
      // Ensure global agent interfaces object exists
      if (typeof window !== 'undefined') {
        window.agentInterfaces = window.agentInterfaces || {};
        window.agentInterfaces[agentInterface.componentId] = agentInterface;

        // Cleanup on unmount
        return () => {
          if (window.agentInterfaces) {
            delete window.agentInterfaces[agentInterface.componentId];
          }
        };
      }
    }
  }, [agentInterface]);

  // Update structured data script element when data changes
  useEffect(() => {
    if (structuredDataRef.current) {
      structuredDataRef.current.textContent = structuredDataJson;
    }
  }, [structuredDataJson]);

  // Performance monitoring
  useEffect(() => {
    if (agentInterface.security.auditLogging.enabled) {
      const startTime = performance.now();
      
      return () => {
        const endTime = performance.now();
        const renderTime = endTime - startTime;
        
        // Log performance metrics (in a real implementation, this would go to your logging system)
        if (debug) {
          console.log(`AgentWrapper render time for ${agentInterface.componentId}:`, renderTime, 'ms');
        }
      };
    }
  }, [agentInterface.componentId, agentInterface.security.auditLogging.enabled, debug]);

  // Validate schema type
  const schemaTypeUrl = useMemo(() => {
    return `https://schema.org/${schemaType}`;
  }, [schemaType]);

  // Combine HTML attributes
  const combinedAttributes = useMemo(() => {
    const baseAttributes = {
      itemScope: true,
      itemType: schemaTypeUrl,
      'data-agent-component': agentInterface.componentId,
      'data-agent-actions': agentActionsData,
      'data-agent-type': agentInterface.metadata.componentType,
      'data-agent-version': agentInterface.metadata.version || '1.0.0',
      'data-agent-access-level': agentInterface.security.accessLevel,
      className: className || undefined,
      ref: wrapperRef,
      ...htmlAttributes
    };

    // Add debug attributes if enabled
    if (debug) {
      baseAttributes['data-agent-debug'] = 'true';
      baseAttributes['data-agent-capabilities'] = JSON.stringify(
        agentInterface.metadata.capabilities.map(c => c.name)
      );
    }

    return baseAttributes;
  }, [
    schemaTypeUrl,
    agentInterface.componentId,
    agentActionsData,
    agentInterface.metadata.componentType,
    agentInterface.metadata.version,
    agentInterface.security.accessLevel,
    agentInterface.metadata.capabilities,
    className,
    htmlAttributes,
    debug
  ]);

  return React.createElement(
    Component,
    combinedAttributes,
    <>
      {/* Schema.org structured data */}
      <script
        ref={structuredDataRef}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(agentInterface.structuredData, null, 2) }}
      />
      
      {/* Debug information (only in development) */}
      {debug && (
        <script
          type="application/json"
          data-agent-debug-info
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              componentId: agentInterface.componentId,
              componentType: agentInterface.metadata.componentType,
              capabilities: agentInterface.metadata.capabilities,
              availableActions: agentInterface.availableActions.length,
              accessLevel: agentInterface.security.accessLevel,
              performanceMetrics: agentInterface.performance
            }, null, 2)
          }}
        />
      )}
      
      {/* Child components */}
      {children}
    </>
  );
};

/**
 * Hook for creating agent wrapper props from component data
 */
export function useAgentWrapper(
  componentId: string,
  componentData: any,
  agentInterface: AgentStateExposure
): Omit<AgentWrapperProps, 'children'> {
  return useMemo(() => ({
    agentInterface,
    schemaType: mapComponentTypeToSchemaType(agentInterface.metadata.componentType),
    className: 'agent-ready-component',
    debug: process.env.NODE_ENV === 'development'
  }), [componentId, componentData, agentInterface]);
}

/**
 * Map component type to appropriate Schema.org type
 */
function mapComponentTypeToSchemaType(componentType: string): SchemaOrgTypeName {
  switch (componentType.toLowerCase()) {
    case 'photogallery':
    case 'gallery':
      return 'ImageGallery';
    case 'photo':
    case 'image':
      return 'Photograph';
    case 'app':
    case 'application':
      return 'WebApplication';
    case 'person':
    case 'user':
      return 'Person';
    default:
      return 'WebApplication';
  }
}

/**
 * Utility function to validate agent wrapper configuration
 */
export function validateAgentWrapper(agentInterface: AgentStateExposure): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required properties
  if (!agentInterface.componentId) {
    errors.push('Agent interface missing componentId');
  }

  if (!agentInterface.structuredData) {
    errors.push('Agent interface missing structuredData');
  }

  if (!agentInterface.metadata) {
    errors.push('Agent interface missing metadata');
  }

  if (!agentInterface.security) {
    errors.push('Agent interface missing security configuration');
  }

  // Check structured data
  if (agentInterface.structuredData) {
    if (!agentInterface.structuredData['@context']) {
      errors.push('Structured data missing @context');
    }

    if (!agentInterface.structuredData['@type']) {
      errors.push('Structured data missing @type');
    }
  }

  // Check security configuration
  if (agentInterface.security) {
    if (!['none', 'read-only', 'limited-write', 'full-access'].includes(agentInterface.security.accessLevel)) {
      errors.push('Invalid security access level');
    }
  }

  // Warnings for best practices
  if (agentInterface.availableActions.length === 0) {
    warnings.push('No agent actions available - component may not be very useful to agents');
  }

  if (!agentInterface.metadata.componentType) {
    warnings.push('Missing component type in metadata');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// Type augmentation for window.agentInterfaces
declare global {
  interface Window {
    agentInterfaces?: Record<string, AgentStateExposure>;
  }
}

export default AgentWrapper;