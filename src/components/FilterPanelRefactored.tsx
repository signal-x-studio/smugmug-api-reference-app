/**
 * FilterPanel Component - Refactored Architecture
 * 
 * BEFORE: 734 lines God Component
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

import React, { useState, useCallback } from 'react';
import { Photo } from '../types';
import { SemanticSearchEngine } from '../utils/agent-native/semantic-search-engine';

// Custom hooks (extracted from God Component)
import { useFilterState, FilterState, FilterCombination } from '../hooks/useFilterState';
import { useFilterDebounce } from '../hooks/useFilterDebounce';
import { useMobileDetection } from '../hooks/useMobileDetection';
import { useFilterCategories } from '../hooks/useFilterCategories';

// Extracted components (from God Component)
import { FilterHeader } from './FilterHeader';
import { BasicFilters } from './BasicFilters';
import { SemanticFilters } from './SemanticFilters';
import { DateRangeFilter } from './DateRangeFilter';

export interface FilterPanelProps {
  photos: Photo[];
  onFilterChange: (filters: FilterState, combination?: FilterCombination) => void;
  searchEngine?: SemanticSearchEngine;
  combinationMode?: FilterCombination;
  persistState?: boolean;
  debounceMs?: number;
  isSearching?: boolean;
  searchResults?: {
    totalCount: number;
    searchTime: number;
  };
}

/**
 * Refactored FilterPanel - Clean Architecture
 * 
 * Uses extracted hooks and components for maintainable code.
 * Each concern is properly separated and testable.
 */
export const FilterPanel: React.FC<FilterPanelProps> = ({
  photos,
  onFilterChange,
  searchEngine,
  combinationMode = 'AND',
  persistState = false,
  debounceMs = 300,
  isSearching = false,
  searchResults
}) => {
  // State management through custom hooks
  const {
    currentFilters,
    combMode,
    setCurrentFilters,
    clearAllFilters,
    toggleCombinationMode
  } = useFilterState({ persistState, combinationMode });

  const { debouncedFilterChange } = useFilterDebounce({ onFilterChange, debounceMs });
  const { isMobile } = useMobileDetection();
  const { filterCategories } = useFilterCategories({ photos });

  // Local UI state (minimal)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Event handlers
  const toggleCategory = useCallback((categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  }, []);

  const handleFilterSelect = useCallback((categoryId: string, value: string, selected: boolean) => {
    const newFilters = { ...currentFilters };

    // Update filters based on category
    switch (categoryId) {
      case 'location':
        if (!newFilters.spatial) newFilters.spatial = {};
        newFilters.spatial.location = selected ? value : undefined;
        break;

      case 'objects':
        if (!newFilters.semantic) newFilters.semantic = {};
        if (!newFilters.semantic.objects) newFilters.semantic.objects = [];
        if (selected) {
          newFilters.semantic.objects.push(value);
        } else {
          newFilters.semantic.objects = newFilters.semantic.objects.filter(o => o !== value);
        }
        break;

      case 'scenes':
        if (!newFilters.semantic) newFilters.semantic = {};
        if (!newFilters.semantic.scenes) newFilters.semantic.scenes = [];
        if (selected) {
          newFilters.semantic.scenes.push(value);
        } else {
          newFilters.semantic.scenes = newFilters.semantic.scenes.filter(s => s !== value);
        }
        break;

      case 'camera':
        if (!newFilters.technical) newFilters.technical = {};
        newFilters.technical.camera_make = selected ? value : undefined;
        break;

      case 'keywords':
        if (!newFilters.semantic) newFilters.semantic = {};
        if (!newFilters.semantic.keywords) newFilters.semantic.keywords = [];
        if (selected) {
          newFilters.semantic.keywords.push(value);
        } else {
          newFilters.semantic.keywords = newFilters.semantic.keywords.filter(k => k !== value);
        }
        break;
    }

    setCurrentFilters(newFilters);
    debouncedFilterChange(newFilters, combMode);
  }, [currentFilters, combMode, setCurrentFilters, debouncedFilterChange]);

  const handleDateRangeSelect = useCallback((start: Date, end: Date) => {
    const newFilters = { ...currentFilters };
    if (!newFilters.temporal) newFilters.temporal = {};
    newFilters.temporal.date_range = { start, end };
    
    setCurrentFilters(newFilters);
    debouncedFilterChange(newFilters, combMode);
  }, [currentFilters, combMode, setCurrentFilters, debouncedFilterChange]);

  const handleClearAll = useCallback(() => {
    clearAllFilters();
    debouncedFilterChange(currentFilters, combMode);
  }, [clearAllFilters, currentFilters, combMode, debouncedFilterChange]);

  // Mobile layout
  if (isMobile) {
    return (
      <div className="filter-panel-mobile">
        <button 
          className="filter-toggle"
          aria-label="Toggle filters"
          onClick={() => toggleCategory('mobile-filters')}
        >
          Filters
        </button>
        {expandedCategories.has('mobile-filters') && (
          <div className="mobile-filter-content">
            <FilterContent />
          </div>
        )}
      </div>
    );
  }

  // Desktop layout
  function FilterContent() {
    return (
      <div className="filter-panel">
        <FilterHeader
          combMode={combMode}
          onToggleCombination={toggleCombinationMode}
          onClearAll={handleClearAll}
          isSearching={isSearching}
          searchResults={searchResults}
        />

        <div className="filter-sections">
          <BasicFilters
            categories={filterCategories}
            currentFilters={currentFilters}
            onFilterSelect={handleFilterSelect}
            expandedCategories={expandedCategories}
            onToggleCategory={toggleCategory}
          />

          <SemanticFilters
            categories={filterCategories}
            currentFilters={currentFilters}
            onFilterSelect={handleFilterSelect}
            expandedCategories={expandedCategories}
            onToggleCategory={toggleCategory}
          />

          <DateRangeFilter
            onDateRangeSelect={handleDateRangeSelect}
          />
        </div>
      </div>
    );
  }

  return <FilterContent />;
};