/**
 * useBulkOperationState - Custom Hook
 * 
 * Manages state for bulk operations including selected photos,
 * operation progress, confirmation dialogs, and command processing.
 */

import { useState, useCallback, useMemo } from 'react';
import { Photo } from '../types';

export interface BulkOperation {
  type: string;
  label: string;
  icon: string;
  destructive?: boolean;
  requiresConfirmation?: boolean;
  maxPhotos?: number;
  supportedFormats?: string[];
}

export interface OperationConfirmation {
  type: string;
  photoCount: number;
  destructive?: boolean;
  preview?: any;
}

export interface BulkOperationStateReturn {
  // Command state
  commandInput: string;
  setCommandInput: (input: string) => void;
  commandSuggestions: string[];
  setCommandSuggestions: (suggestions: string[]) => void;
  
  // Confirmation state
  showConfirmation: OperationConfirmation | null;
  setShowConfirmation: (confirmation: OperationConfirmation | null) => void;
  
  // Available operations
  availableOperations: BulkOperation[];
  
  // Utility functions
  isOperationDisabled: (operation: BulkOperation, selectedCount: number) => boolean;
  handleOperationClick: (operation: BulkOperation, selectedPhotos: Photo[], onExecute: (op: any) => void) => void;
  handleCommandSubmit: (executor: any, selectedPhotos: Photo[], onExecute: (op: any) => void) => Promise<void>;
}

export const useBulkOperationState = (): BulkOperationStateReturn => {
  // State management
  const [commandInput, setCommandInput] = useState('');
  const [commandSuggestions, setCommandSuggestions] = useState<string[]>([]);
  const [showConfirmation, setShowConfirmation] = useState<OperationConfirmation | null>(null);

  // Available operations configuration
  const availableOperations: BulkOperation[] = useMemo(() => [
    {
      type: 'download',
      label: 'Download Selected',
      icon: '📥',
      maxPhotos: 1000
    },
    {
      type: 'album_add',
      label: 'Add to Album',
      icon: '📁',
      maxPhotos: 500
    },
    {
      type: 'export_metadata',
      label: 'Export Metadata',
      icon: '📋',
      supportedFormats: ['json', 'csv', 'xml']
    },
    {
      type: 'analyze',
      label: 'Analyze Photos',
      icon: '🔍',
      maxPhotos: 100
    },
    {
      type: 'tag',
      label: 'Tag Photos',
      icon: '🏷️'
    },
    {
      type: 'delete',
      label: 'Delete Selected',
      icon: '🗑️',
      destructive: true,
      requiresConfirmation: true
    }
  ], []);

  // Operation validation
  const isOperationDisabled = useCallback((operation: BulkOperation, selectedCount: number): boolean => {
    if (selectedCount === 0) return true;
    if (operation.maxPhotos && selectedCount > operation.maxPhotos) return true;
    return false;
  }, []);

  // Handle operation click
  const handleOperationClick = useCallback((
    operation: BulkOperation, 
    selectedPhotos: Photo[], 
    onExecute: (op: any) => void
  ) => {
    if (selectedPhotos.length === 0) return;

    if (operation.requiresConfirmation) {
      setShowConfirmation({
        type: operation.type,
        photoCount: selectedPhotos.length,
        destructive: operation.destructive
      });
    } else {
      onExecute({
        type: operation.type,
        photos: selectedPhotos
      });
    }
  }, []);

  // Handle command submission
  const handleCommandSubmit = useCallback(async (
    executor: any, 
    selectedPhotos: Photo[], 
    onExecute: (op: any) => void
  ) => {
    if (!commandInput.trim()) return;

    try {
      if (executor) {
        // Handle function-based processor (for tests)
        if (typeof executor === 'function') {
          const parseResult = await executor(commandInput);
          if (parseResult && parseResult.operation) {
            onExecute({
              type: parseResult.operation,
              parameters: parseResult.parameters,
              photos: selectedPhotos
            });
            setCommandInput('');
          }
        } 
        // Handle object-based executor (for production)
        else if (executor.parseCommand) {
          const parseResult = await executor.parseCommand(commandInput);
          if (parseResult.confidence > 0.7) {
            onExecute({
              type: parseResult.operation,
              parameters: parseResult.parameters,
              photos: selectedPhotos
            });
            setCommandInput('');
          } else {
            // Show suggestions for low confidence commands
            setCommandSuggestions(parseResult.suggestions || []);
          }
        }
      }
    } catch (error) {
      console.error('Command processing error:', error);
    }
  }, [commandInput]);

  return {
    commandInput,
    setCommandInput,
    commandSuggestions,
    setCommandSuggestions,
    showConfirmation,
    setShowConfirmation,
    availableOperations,
    isOperationDisabled,
    handleOperationClick,
    handleCommandSubmit
  };
};