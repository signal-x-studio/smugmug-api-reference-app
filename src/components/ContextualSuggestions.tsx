/**
 * ContextualSuggestions Component
 * 
 * Extracted from BulkOperations God Component.
 * Displays AI-generated contextual suggestions based on agent state.
 */

import React from 'react';

export interface ContextualSuggestionsProps {
  suggestions: string[];
  onSuggestionClick?: (suggestion: string) => void;
}

export const ContextualSuggestions: React.FC<ContextualSuggestionsProps> = ({
  suggestions,
  onSuggestionClick
}) => {
  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="contextual-suggestions">
      <div className="suggestions-header">
        <h4>🤖 AI Suggestions</h4>
        <span className="suggestions-subtitle">
          Based on your current search and selection
        </span>
      </div>
      
      <div className="suggestions-grid">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            className="contextual-suggestion"
            onClick={() => onSuggestionClick?.(suggestion)}
            title={`AI suggestion: ${suggestion}`}
          >
            <span className="suggestion-icon">💡</span>
            <span className="suggestion-text">{suggestion}</span>
          </button>
        ))}
      </div>
    </div>
  );
};