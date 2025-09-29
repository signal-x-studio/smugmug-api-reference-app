/**
 * FilterHeader Component
 * 
 * Extracted from FilterPanel God Component.
 * Handles filter header controls and search status display.
 */

import React from 'react';
import { FilterCombination } from '../hooks/useFilterState';

interface FilterHeaderProps {
  combMode: FilterCombination;
  onToggleCombination: () => void;
  onClearAll: () => void;
  isSearching?: boolean;
  searchResults?: {
    totalCount: number;
    searchTime: number;
  };
}

export const FilterHeader: React.FC<FilterHeaderProps> = ({
  combMode,
  onToggleCombination,
  onClearAll,
  isSearching = false,
  searchResults
}) => {
  return (
    <div className="filter-header">
      <h3>Filters</h3>
      <div className="filter-controls">
        <button 
          className="combination-toggle"
          onClick={onToggleCombination}
          aria-label={`Switch to ${combMode === 'AND' ? 'OR' : 'AND'} mode`}
        >
          {combMode}
        </button>
        <button 
          className="clear-button"
          onClick={onClearAll}
          aria-label="Clear all filters"
        >
          Clear All
        </button>
      </div>

      {isSearching && (
        <div className="search-status" role="status" aria-live="polite">
          <div role="progressbar" className="loading-spinner" aria-label="Searching"></div>
          <span>Searching...</span>
        </div>
      )}

      {searchResults && !isSearching && (
        <div className="search-results-info" role="status" aria-live="polite">
          <span>{searchResults.totalCount} photos found</span>
          <span className="search-time">
            {(searchResults.searchTime / 1000).toFixed(1)}s
          </span>
        </div>
      )}
    </div>
  );
};