/**
 * BasicFilters Component
 * 
 * Extracted from FilterPanel God Component.
 * Handles simple filter controls like location and camera.
 */

import React from 'react';
import { FilterState } from '../hooks/useFilterState';
import { FilterCategory } from '../hooks/useFilterCategories';

interface BasicFiltersProps {
  categories: FilterCategory[];
  currentFilters: FilterState;
  onFilterSelect: (categoryId: string, value: string, selected: boolean) => void;
  expandedCategories: Set<string>;
  onToggleCategory: (categoryId: string) => void;
}

export const BasicFilters: React.FC<BasicFiltersProps> = ({
  categories,
  currentFilters,
  onFilterSelect,
  expandedCategories,
  onToggleCategory
}) => {
  const basicCategories = categories.filter(cat => 
    ['location', 'camera'].includes(cat.id)
  );

  const isFilterSelected = (categoryId: string, value: string): boolean => {
    switch (categoryId) {
      case 'location':
        return currentFilters.spatial?.location === value;
      case 'camera':
        return currentFilters.technical?.camera_make === value;
      default:
        return false;
    }
  };

  return (
    <div className="basic-filters">
      {basicCategories.map(category => (
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
                    type={category.type === 'single-select' ? 'radio' : 'checkbox'}
                    name={category.type === 'single-select' ? category.id : undefined}
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
};