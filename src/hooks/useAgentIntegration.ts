/**
 * useAgentIntegration - Custom Hook
 * 
 * Manages agent state exposure and contextual suggestions
 * for AI agent integration in bulk operations.
 */

import { useEffect, useMemo } from 'react';
import { Photo } from '../types';
import { BulkOperation } from './useBulkOperationState';

export interface AgentIntegrationConfig {
  exposeToAgents: boolean;
  useAgentContext: boolean;
  selectedPhotos: Photo[];
  availableOperations: BulkOperation[];
  onOperationExecute: (operation: any) => void;
}

export interface AgentIntegrationReturn {
  contextualSuggestions: string[];
}

export const useAgentIntegration = ({
  exposeToAgents,
  useAgentContext,
  selectedPhotos,
  availableOperations,
  onOperationExecute
}: AgentIntegrationConfig): AgentIntegrationReturn => {
  
  // Expose to agent state if requested
  useEffect(() => {
    if (exposeToAgents && typeof window !== 'undefined') {
      window.agentState = window.agentState || {};
      window.agentState.bulkOperations = {
        current: {
          selectedCount: selectedPhotos.length,
          availableOperations: availableOperations.map(op => op.type)
        },
        actions: {
          execute: (operation: string, params: any) => {
            onOperationExecute({ type: operation, parameters: params });
          }
        },
        lastUpdated: Date.now()
      };
    }
  }, [selectedPhotos, exposeToAgents, onOperationExecute, availableOperations]);

  // Generate contextual suggestions based on agent state
  const contextualSuggestions = useMemo(() => {
    if (!useAgentContext || typeof window === 'undefined') return [];
    
    const agentState = (window as any).agentState?.photoSearch;
    if (!agentState) return [];

    const suggestions: string[] = [];
    
    // Add suggestions based on search context
    if (agentState.current?.lastQuery?.includes('beach')) {
      suggestions.push('Create "Hawaii Beach Photos" album');
    }
    
    if (agentState.current?.currentFilters?.location) {
      suggestions.push(`Tag as ${agentState.current.currentFilters.location} photos`);
    }
    
    // Add suggestions based on selection count
    if (selectedPhotos.length > 50) {
      suggestions.push('Download as bulk ZIP file');
    }
    
    if (selectedPhotos.length > 0) {
      suggestions.push('Export metadata for selected photos');
    }
    
    return suggestions;
  }, [useAgentContext, selectedPhotos]);

  return {
    contextualSuggestions
  };
};