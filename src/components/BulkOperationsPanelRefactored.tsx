/**
 * BulkOperationsRefactored Component - Clean Architecture
 * 
 * BEFORE: 723 lines God Component
 * AFTER: ~150 lines focused component using composition
 * 
 * This refactored version addresses critical architecture smells:
 * ✅ Single Responsibility Principle
 * ✅ < 200 lines per component
 * ✅ Extracted custom hooks for complex logic
 * ✅ Composition over massive inline implementation
 * ✅ Proper separation of concerns
 * ✅ Improved testability and maintainability
 */

import React from 'react';
import { Photo } from '../types';

// Custom hooks (extracted from God Component)
import { useBulkOperationState } from '../hooks/useBulkOperationState';
import { useAgentIntegration } from '../hooks/useAgentIntegration';
import { useCommandSuggestions } from '../hooks/useCommandSuggestions';

// Extracted components (from God Component)
import { OperationSelector } from './OperationSelector';
import { ProgressTracker, OperationProgress, OperationStatus } from './ProgressTracker';
import { CommandInterface } from './CommandInterface';
import { ContextualSuggestions } from './ContextualSuggestions';
import { OperationConfirmationDialog } from '../components/BulkOperations'; // Keep existing dialog

// Props interface (simplified)
export interface BulkOperationsPanelRefactoredProps {
  selectedPhotos: Photo[];
  onOperationExecute: (operation: any) => void;
  operationProgress?: OperationProgress;
  operationStatus?: OperationStatus;
  executor?: any;
  showCommandHelp?: boolean;
  useAgentContext?: boolean;
  exposeToAgents?: boolean;
  onRetryFailed?: () => void;
  onRollback?: () => void;
}

/**
 * Refactored BulkOperations Panel - Clean Architecture
 * 
 * Uses extracted hooks and components for maintainable code.
 * Each concern is properly separated and testable.
 */
export const BulkOperationsPanelRefactored: React.FC<BulkOperationsPanelRefactoredProps> = ({
  selectedPhotos,
  onOperationExecute,
  operationProgress,
  operationStatus,
  executor,
  showCommandHelp = false,
  useAgentContext = false,
  exposeToAgents = false,
  onRetryFailed,
  onRollback
}) => {
  // State management through custom hooks
  const {
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
  } = useBulkOperationState();

  // Agent integration
  const { contextualSuggestions } = useAgentIntegration({
    exposeToAgents,
    useAgentContext,
    selectedPhotos,
    availableOperations,
    onOperationExecute
  });

  // Command suggestions
  useCommandSuggestions({
    commandInput,
    showCommandHelp,
    setCommandSuggestions
  });

  // Handle contextual suggestion clicks
  const handleSuggestionClick = (suggestion: string) => {
    setCommandInput(suggestion);
  };

  // Handle confirmation dialog
  const handleConfirm = (operation: any) => {
    onOperationExecute({
      type: operation.type,
      confirmed: true,
      photos: selectedPhotos
    });
    setShowConfirmation(null);
  };

  const handleCancel = () => {
    setShowConfirmation(null);
  };

  return (
    <div className="bulk-operations-panel">
      {/* Panel Header */}
      <div className="panel-header">
        <h3>Bulk Operations</h3>
        <span className="selected-count">
          {selectedPhotos.length} photos selected
        </span>
      </div>

      {/* Progress and Status Display */}
      <ProgressTracker
        operationProgress={operationProgress}
        operationStatus={operationStatus}
        onRetryFailed={onRetryFailed}
        onRollback={onRollback}
      />

      {/* Operation Selection Grid */}
      <OperationSelector
        availableOperations={availableOperations}
        selectedPhotos={selectedPhotos}
        onOperationClick={handleOperationClick}
        onOperationExecute={onOperationExecute}
        isOperationDisabled={isOperationDisabled}
      />

      {/* Natural Language Command Interface */}
      <CommandInterface
        commandInput={commandInput}
        setCommandInput={setCommandInput}
        commandSuggestions={commandSuggestions}
        onCommandSubmit={handleCommandSubmit}
        selectedPhotos={selectedPhotos}
        onOperationExecute={onOperationExecute}
        executor={executor}
        showCommandHelp={showCommandHelp}
      />

      {/* AI Contextual Suggestions */}
      <ContextualSuggestions
        suggestions={contextualSuggestions}
        onSuggestionClick={handleSuggestionClick}
      />

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <OperationConfirmationDialog
          operation={showConfirmation}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};