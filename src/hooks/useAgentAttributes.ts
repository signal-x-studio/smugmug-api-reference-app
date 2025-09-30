/**
 * useAgentAttributes - Custom Hook
 * 
 * Extracts complex attribute generation logic from AgentWrapper component.
 * Addresses useEffect with >3 dependencies architecture smell.
 */

import { useMemo } from 'react';

export interface AgentAttributesConfig {
  schemaTypeUrl: string;
  componentId: string;
  agentActionsData: string;
  componentType: string;
  version?: string;
  accessLevel: string;
  capabilities: Array<{ name: string }>;
  className?: string;
  htmlAttributes: Record<string, string>;
  debug: boolean;
}

export interface AgentAttributesReturn {
  combinedAttributes: Record<string, any>;
}

export const useAgentAttributes = ({
  schemaTypeUrl,
  componentId,
  agentActionsData,
  componentType,
  version,
  accessLevel,
  capabilities,
  className,
  htmlAttributes,
  debug
}: AgentAttributesConfig): AgentAttributesReturn => {
  
  // Combine HTML attributes with proper memoization
  const combinedAttributes = useMemo(() => {
    const baseAttributes: Record<string, any> = {
      itemScope: true,
      itemType: schemaTypeUrl,
      'data-agent-component': componentId,
      'data-agent-actions': agentActionsData,
      'data-agent-type': componentType,
      'data-agent-version': version || '1.0.0',
      'data-agent-access-level': accessLevel,
      className: className || undefined,
      ...htmlAttributes
    };

    // Add debug attributes if enabled
    if (debug) {
      baseAttributes['data-agent-debug'] = 'true';
      baseAttributes['data-agent-capabilities'] = JSON.stringify(
        capabilities.map(c => c.name)
      );
    }

    return baseAttributes;
  }, [
    schemaTypeUrl,
    componentId,
    agentActionsData,
    componentType,
    version,
    accessLevel,
    capabilities,
    className,
    htmlAttributes,
    debug
  ]);

  return {
    combinedAttributes
  };
};