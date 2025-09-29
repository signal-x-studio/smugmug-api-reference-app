/**
 * OperationSelector Component
 * 
 * Extracted from BulkOperations God Component.
 * Handles operation button grid and selection logic.
 */

import React from 'react';
import { Photo } from '../types';
import { BulkOperation } from '../hooks/useBulkOperationState';

export interface OperationSelectorProps {
  availableOperations: BulkOperation[];
  selectedPhotos: Photo[];
  onOperationClick: (operation: BulkOperation, selectedPhotos: Photo[], onExecute: (op: any) => void) => void;
  onOperationExecute: (operation: any) => void;
  isOperationDisabled: (operation: BulkOperation, selectedCount: number) => boolean;
}

export const OperationSelector: React.FC<OperationSelectorProps> = ({
  availableOperations,
  selectedPhotos,
  onOperationClick,
  onOperationExecute,
  isOperationDisabled
}) => {
  const handleOperationClick = (operation: BulkOperation) => {
    onOperationClick(operation, selectedPhotos, onOperationExecute);
  };

  return (
    <div className="operations-grid">
      {availableOperations.map(operation => (
        <button
          key={operation.type}
          className={`operation-button ${operation.destructive ? 'destructive' : ''}`}
          disabled={isOperationDisabled(operation, selectedPhotos.length)}
          onClick={() => handleOperationClick(operation)}
          title={`${operation.label}${operation.maxPhotos ? ` (max ${operation.maxPhotos} photos)` : ''}`}
        >
          <span className="operation-icon">{operation.icon}</span>
          <span className="operation-label">{operation.label}</span>
          {operation.maxPhotos && selectedPhotos.length > operation.maxPhotos && (
            <span className="operation-limit-warning">
              Exceeds limit ({operation.maxPhotos})
            </span>
          )}
        </button>
      ))}
    </div>
  );
};