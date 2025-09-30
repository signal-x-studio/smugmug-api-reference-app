/**
 * SemanticFilters Component
 * 
 * Extracted from FilterPanel God Component.
 * Handles semantic filter controls like objects, scenes, and keywords.
 */

import React, { useMemo, useCallback } from 'react';
import { FilterCategory, FilterState } from '../types';

interface SemanticFiltersProps {
  categories: FilterCategory[];
  currentFilters: FilterState;
  onFilterSelect: (categoryId: string, value: string, selected: boolean) => void;
  expandedCategories: Set<string>;
  onToggleCategory: (categoryId: string) => void;
}

export const SemanticFilters: React.FC<SemanticFiltersProps> = React.memo(({
  categories,
  currentFilters,
  onFilterSelect,
  expandedCategories,
  onToggleCategory
}) => {
  const semanticCategories = useMemo(() => 
    categories.filter(cat => 
      ['objects', 'scenes', 'keywords'].includes(cat.id)
    ), [categories]
  );

  const isFilterSelected = (categoryId: string, value: string): boolean => {
    switch (categoryId) {
      case 'objects':
        return currentFilters.semantic?.objects?.includes(value) ?? false;
      case 'scenes':
        return currentFilters.semantic?.scenes?.includes(value) ?? false;
      case 'keywords':
        return currentFilters.semantic?.keywords?.includes(value) ?? false;
      default:
        return false;
    }
  };

  return (
    <div className="semantic-filters">
      {semanticCategories.map(category => (
        <div key={category.id} className="filter-category">
          <button
            className={`category-header ${expandedCategories.has(category.id) ? 'expanded' : ''}`}
            onClick={() => onToggleCategory(category.id)}
            aria-expanded={expandedCategories.has(category.id)}
            aria-controls={`${category.id}-options`}
          >
            <span>{category.label}</span>
            <span className="chevron">
              {expandedCategories.has(category.id) ? '▼' : '▶'}
            </span>
          </button>

          {expandedCategories.has(category.id) && (
            <div id={`${category.id}-options`} className="filter-options">
              {category.options.map(option => (
                <label key={option.value} className="filter-option">
                  <input
                    type="checkbox"
                    checked={isFilterSelected(category.id, option.value)}
                    onChange={(e) => onFilterSelect(category.id, option.value, e.target.checked)}
                  />
                  <span className="option-label">
                    {option.label}
                    <span className="option-count">({option.count})</span>
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
});