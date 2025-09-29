/**
 * ProgressTracker Component
 * 
 * Extracted from BulkOperations God Component.
 * Displays operation progress and status information.
 */

import React from 'react';

export interface OperationProgress {
  operation: string;
  progress: number;
  currentFile?: string;
  completed: number;
  total: number;
  estimatedTime?: number;
}

export interface OperationStatus {
  status: 'success' | 'partial_failure' | 'error';
  completed: number;
  failed: number;
  errors?: Array<{ photoId: string; error: string; code?: string; }>;
  rollbackToken?: string;
}

export interface ProgressTrackerProps {
  operationProgress?: OperationProgress;
  operationStatus?: OperationStatus;
  onRetryFailed?: () => void;
  onRollback?: () => void;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  operationProgress,
  operationStatus,
  onRetryFailed,
  onRollback
}) => {
  if (!operationProgress && !operationStatus) {
    return null;
  }

  return (
    <div className="progress-tracker">
      {operationProgress && (
        <div className="operation-progress">
          <div className="progress-header">
            <span className="progress-label">
              {operationProgress.operation}... {Math.round(operationProgress.progress * 100)}%
            </span>
            {operationProgress.currentFile && (
              <span className="current-file">
                Current: {operationProgress.currentFile}
              </span>
            )}
            {operationProgress.estimatedTime && (
              <span className="estimated-time">
                ~{Math.round(operationProgress.estimatedTime / 1000)}s remaining
              </span>
            )}
          </div>
          
          <progress 
            value={Math.round(operationProgress.progress * 100)}
            max="100"
            className="progress-bar"
          />
          
          <div className="progress-stats">
            <span>{operationProgress.completed} of {operationProgress.total} completed</span>
          </div>
        </div>
      )}

      {operationStatus && operationStatus.status !== 'success' && (
        <div className={`operation-status ${operationStatus.status}`}>
          {operationStatus.status === 'partial_failure' && (
            <>
              <h4>Partial Success</h4>
              <p>
                {operationStatus.completed} of {operationStatus.completed + operationStatus.failed} photos processed
              </p>
              {operationStatus.failed > 0 && (
                <p className="error-count">
                  {operationStatus.failed} photos failed to process
                </p>
              )}
            </>
          )}
          
          {operationStatus.status === 'error' && (
            <>
              <h4>Operation Failed</h4>
              <p>The bulk operation could not be completed.</p>
            </>
          )}

          <div className="status-actions">
            {operationStatus.rollbackToken && onRollback && (
              <button 
                className="rollback-button"
                onClick={onRollback}
              >
                Rollback Changes
              </button>
            )}
            {operationStatus.failed > 0 && onRetryFailed && (
              <button 
                className="retry-button"
                onClick={onRetryFailed}
              >
                Retry Failed ({operationStatus.failed})
              </button>
            )}
          </div>

          {operationStatus.errors && operationStatus.errors.length > 0 && (
            <details className="error-details">
              <summary>View Error Details ({operationStatus.errors.length})</summary>
              <div className="error-list">
                {operationStatus.errors.slice(0, 10).map((error, index) => (
                  <div key={index} className="error-item">
                    <span className="error-photo">Photo: {error.photoId}</span>
                    <span className="error-message">{error.error}</span>
                    {error.code && <span className="error-code">({error.code})</span>}
                  </div>
                ))}
                {operationStatus.errors.length > 10 && (
                  <div className="error-truncated">
                    ... and {operationStatus.errors.length - 10} more errors
                  </div>
                )}
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  );
};