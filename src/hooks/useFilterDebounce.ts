/**
 * Custom Hook: Filter Debouncing
 * 
 * Provides debounced filter change handling to prevent excessive
 * API calls during rapid user interactions.
 */

import { useCallback, useRef } from 'react';
import { FilterState, FilterCombination } from '../types';

interface UseFilterDebounceProps {
  onFilterChange: (filters: FilterState, combination?: FilterCombination) => void;
  debounceMs?: number;
}

interface UseFilterDebounceReturn {
  debouncedFilterChange: (filters: FilterState, combination?: FilterCombination) => void;
}

export const useFilterDebounce = ({
  onFilterChange,
  debounceMs = 300
}: UseFilterDebounceProps): UseFilterDebounceReturn => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const debouncedFilterChange = useCallback(
    (filters: FilterState, combination?: FilterCombination) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        if (combination !== undefined) {
          onFilterChange(filters, combination);
        } else {
          onFilterChange(filters);
        }
      }, debounceMs);
    },
    [onFilterChange, debounceMs]
  );

  return {
    debouncedFilterChange
  };
};