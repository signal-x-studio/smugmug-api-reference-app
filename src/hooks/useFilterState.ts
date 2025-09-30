/**
 * Custom Hook: Filter State Management
 * 
 * Manages filter state with persistence and provides clean interface
 * for filter operations. Extracted from FilterPanel God Component.
 */

import { useState, useEffect, useCallback } from 'react';
import { FilterState, FilterCombination } from '../types';

interface UseFilterStateProps {
  persistState?: boolean;
  combinationMode?: FilterCombination;
}

interface UseFilterStateReturn {
  currentFilters: FilterState;
  combMode: FilterCombination;
  setCurrentFilters: (filters: FilterState) => void;
  setCombMode: (mode: FilterCombination) => void;
  clearAllFilters: () => void;
  toggleCombinationMode: () => void;
}

const createInitialFilterState = (): FilterState => ({
  semantic: {},
  spatial: {},
  temporal: {},
  people: {},
  technical: {}
});

const STORAGE_KEY = 'photo-search-filters';

export const useFilterState = ({
  persistState = false,
  combinationMode = 'AND'
}: UseFilterStateProps = {}): UseFilterStateReturn => {
  const [currentFilters, setCurrentFilters] = useState<FilterState>(createInitialFilterState);
  const [combMode, setCombMode] = useState<FilterCombination>(combinationMode);

  // Load persisted state on mount
  useEffect(() => {
    if (persistState) {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsedFilters = JSON.parse(saved);
          setCurrentFilters(parsedFilters);
        } catch {
          // Silently fail to load saved filters
        }
      }
    }
  }, [persistState]);

  // Persist state when filters change
  useEffect(() => {
    if (persistState) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentFilters));
      } catch {
        // Silently fail to save filters
      }
    }
  }, [currentFilters, persistState]);

  const clearAllFilters = useCallback(() => {
    setCurrentFilters(createInitialFilterState());
  }, []);

  const toggleCombinationMode = useCallback(() => {
    setCombMode(prev => prev === 'AND' ? 'OR' : 'AND');
  }, []);

  return {
    currentFilters,
    combMode,
    setCurrentFilters,
    setCombMode,
    clearAllFilters,
    toggleCombinationMode
  };
};