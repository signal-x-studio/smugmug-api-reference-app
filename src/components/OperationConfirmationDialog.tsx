/**
 * OperationConfirmationDialog Component
 * 
 * Modal dialog for confirming bulk operations, especially destructive ones.
 * Supports operation previews and customizable confirmation messages.
 */

import React from 'react';

export interface OperationPreview {
  existingTags?: string[];
  newTags?: string[];
  changes?: string;
}

export interface OperationConfirmation {
  type: string;
  photoCount: number;
  destructive?: boolean;
  preview?: OperationPreview;
}

export interface ConfirmedOperation {
  type: string;
  confirmed: boolean;
}

export interface OperationConfirmationDialogProps {
  operation: OperationConfirmation;
  onConfirm: (operation: ConfirmedOperation) => void;
  onCancel: () => void;
}

// Helper functions
const getDialogTitle = (operation: OperationConfirmation): string => {
  if (operation.destructive) return 'Confirm Delete';
  if (operation.preview) return 'Operation Preview';
  return 'Confirm Operation';
};

const getDialogMessage = (operation: OperationConfirmation): string => {
  if (operation.type === 'delete') {
    return `Are you sure you want to delete ${operation.photoCount} photos?`;
  }
  return `Proceed with ${operation.type} operation on ${operation.photoCount} photos?`;
};

const getConfirmButtonText = (operationType: string): string => {
  switch (operationType) {
    case 'delete': return 'Delete Photos';
    case 'tag': return 'Apply Tags';
    case 'download': return 'Download';
    default: return 'Confirm';
  }
};

// Preview content component
const OperationPreviewContent: React.FC<{ preview: OperationPreview }> = ({ preview }) => (
  <div className="mt-4 p-3 bg-gray-50 rounded">
    {preview.changes && (
      <p className="text-sm text-gray-800 mb-2">{preview.changes}</p>
    )}
    {preview.newTags && (
      <div className="flex flex-wrap gap-1">
        {preview.newTags.map(tag => (
          <span 
            key={tag}
            className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
          >
            {tag}
          </span>
        ))}
      </div>
    )}
  </div>
);

// Main component
export const OperationConfirmationDialog: React.FC<OperationConfirmationDialogProps> = ({
  operation,
  onConfirm,
  onCancel
}) => {
  const handleConfirm = (): void => {
    onConfirm({ type: operation.type, confirmed: true });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">{getDialogTitle(operation)}</h3>
        
        <div className="mb-4">
          <p className="text-gray-700 mb-2">{getDialogMessage(operation)}</p>
          
          {operation.destructive && (
            <p className="text-red-600 text-sm font-medium">
              This action cannot be undone.
            </p>
          )}
          
          {operation.preview && <OperationPreviewContent preview={operation.preview} />}
        </div>
        
        <div className="flex justify-end space-x-3">
          <button onClick={onCancel} className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className={`px-4 py-2 rounded text-white ${
              operation.destructive ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {getConfirmButtonText(operation.type)}
          </button>
        </div>
      </div>
    </div>
  );
};