/**
 * Custom Hook: Filter State Management
 * 
 * Manages filter state with persistence and provides clean interface
 * for filter operations. Extracted from FilterPanel God Component.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { SearchParameters } from '../utils/agent-native/photo-discovery-search';

export interface FilterState extends SearchParameters {
  // Additional UI-specific state
}

export type FilterCombination = 'AND' | 'OR';

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

const INITIAL_FILTER_STATE: FilterState = {
  semantic: {},
  spatial: {},
  temporal: {},
  people: {},
  technical: {}
};

const STORAGE_KEY = 'photo-search-filters';

export const useFilterState = ({
  persistState = false,
  combinationMode = 'AND'
}: UseFilterStateProps = {}): UseFilterStateReturn => {
  const [currentFilters, setCurrentFilters] = useState<FilterState>(INITIAL_FILTER_STATE);
  const [combMode, setCombMode] = useState<FilterCombination>(combinationMode);

  // Load persisted state on mount
  useEffect(() => {
    if (persistState) {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsedFilters = JSON.parse(saved);
          setCurrentFilters(parsedFilters);
        } catch (e) {
          console.warn('Failed to load saved filters:', e);
        }
      }
    }
  }, [persistState]);

  // Persist state when filters change
  useEffect(() => {
    if (persistState) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentFilters));
      } catch (e) {
        console.warn('Failed to save filters:', e);
      }
    }
  }, [currentFilters, persistState]);

  const clearAllFilters = useCallback(() => {
    setCurrentFilters(INITIAL_FILTER_STATE);
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