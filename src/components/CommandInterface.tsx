/**
 * CommandInterface Component
 * 
 * Extracted from BulkOperations God Component.
 * Handles natural language command input and suggestions.
 */

import React from 'react';
import { Photo } from '../types';

export interface CommandInterfaceProps {
  commandInput: string;
  setCommandInput: (input: string) => void;
  commandSuggestions: string[];
  onCommandSubmit: (executor: any, selectedPhotos: Photo[], onExecute: (op: any) => void) => Promise<void>;
  selectedPhotos: Photo[];
  onOperationExecute: (operation: any) => void;
  executor?: any;
  showCommandHelp: boolean;
}

export const CommandInterface: React.FC<CommandInterfaceProps> = ({
  commandInput,
  setCommandInput,
  commandSuggestions,
  onCommandSubmit,
  selectedPhotos,
  onOperationExecute,
  executor,
  showCommandHelp
}) => {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCommandSubmit(executor, selectedPhotos, onOperationExecute);
  };

  if (!showCommandHelp) {
    return null;
  }

  return (
    <div className="command-interface">
      <div className="command-header">
        <h4>Natural Language Commands</h4>
        <span className="command-help">
          Type commands like "download all selected photos" or "create album with these photos"
        </span>
      </div>

      <form onSubmit={handleSubmit} className="command-form">
        <div className="command-input-group">
          <input
            type="text"
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            placeholder="Type bulk operation command..."
            className="command-input"
            disabled={selectedPhotos.length === 0}
          />
          <button 
            type="submit" 
            className="command-submit"
            disabled={!commandInput.trim() || selectedPhotos.length === 0}
          >
            Execute
          </button>
        </div>
      </form>
      
      {commandSuggestions.length > 0 && (
        <div className="command-suggestions">
          <div className="suggestions-header">Suggestions:</div>
          <div className="suggestions-list">
            {commandSuggestions.map((suggestion, index) => (
              <button
                key={index}
                className="suggestion-button"
                onClick={() => setCommandInput(suggestion)}
                title={`Click to use: ${suggestion}`}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedPhotos.length === 0 && (
        <div className="command-disabled-notice">
          Select photos to enable command interface
        </div>
      )}
    </div>
  );
};