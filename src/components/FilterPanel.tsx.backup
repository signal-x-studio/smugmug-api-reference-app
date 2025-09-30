/**
 * Advanced Filter Interface Components
 * 
 * Provides comprehensive filtering interface with real-time updates,
 * dynamic filter options, and seamless integration with semantic search.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { SearchParameters } from '../utils/agent-native/photo-discovery-search';
import { SemanticSearchEngine } from '../utils/agent-native/semantic-search-engine';
import { PhotoDiscoveryQueryParser } from '../utils/agent-native/photo-discovery-search';
import { Photo } from '../types';

// Type definitions
export interface FilterState extends SearchParameters {
  // Additional UI-specific state
}

export type FilterCombination = 'AND' | 'OR';

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

export interface SearchInterfaceProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export interface QueryBuilderProps {
  onQueryChange: (query: QueryDefinition) => void;
}

export interface QueryDefinition {
  conditions: QueryCondition[];
  logic: 'AND' | 'OR';
}

export interface QueryCondition {
  field: string;
  operator: string;
  value: any;
}

interface FilterOption {
  value: string;
  count: number;
  selected: boolean;
}

interface FilterCategory {
  id: string;
  label: string;
  options: FilterOption[];
  type: 'single' | 'multiple' | 'range' | 'date';
}

/**
 * Main Filter Panel Component
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
  const [currentFilters, setCurrentFilters] = useState<FilterState>({
    semantic: {},
    spatial: {},
    temporal: {},
    people: {},
    technical: {}
  });
  const [isMobile, setIsMobile] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [combMode, setCombMode] = useState<FilterCombination>(combinationMode);

  // Load persisted state on mount
  useEffect(() => {
    if (persistState) {
      const saved = localStorage.getItem('photo-search-filters');
      if (saved) {
        try {
          setCurrentFilters(JSON.parse(saved));
        } catch (e) {
          console.warn('Failed to load saved filters:', e);
        }
      }
    }
  }, [persistState]);

  // Save state changes
  useEffect(() => {
    if (persistState) {
      localStorage.setItem('photo-search-filters', JSON.stringify(currentFilters));
    }
  }, [currentFilters, persistState]);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Generate dynamic filter options from photo collection
  const filterCategories = useMemo<FilterCategory[]>(() => {
    const categories: FilterCategory[] = [];

    // Location filter
    const locationCounts = new Map<string, number>();
    photos.forEach(photo => {
      if (photo.metadata?.location) {
        locationCounts.set(
          photo.metadata.location,
          (locationCounts.get(photo.metadata.location) || 0) + 1
        );
      }
    });

    if (locationCounts.size > 0) {
      categories.push({
        id: 'location',
        label: 'Location',
        type: 'multiple',
        options: Array.from(locationCounts.entries()).map(([value, count]) => ({
          value,
          count,
          selected: currentFilters.spatial?.location === value
        }))
      });
    }

    // Camera filter
    const cameraCounts = new Map<string, number>();
    photos.forEach(photo => {
      if (photo.metadata?.camera) {
        cameraCounts.set(
          photo.metadata.camera,
          (cameraCounts.get(photo.metadata.camera) || 0) + 1
        );
      }
    });

    if (cameraCounts.size > 0) {
      categories.push({
        id: 'camera',
        label: 'Camera',
        type: 'multiple',
        options: Array.from(cameraCounts.entries()).map(([value, count]) => ({
          value,
          count,
          selected: currentFilters.technical?.camera_make === value || 
                   currentFilters.technical?.camera_model === value
        }))
      });
    }

    // Keywords filter
    const keywordCounts = new Map<string, number>();
    photos.forEach(photo => {
      photo.metadata?.keywords?.forEach(keyword => {
        keywordCounts.set(keyword, (keywordCounts.get(keyword) || 0) + 1);
      });
    });

    if (keywordCounts.size > 0) {
      categories.push({
        id: 'keywords',
        label: 'Keywords',
        type: 'multiple',
        options: Array.from(keywordCounts.entries()).map(([value, count]) => ({
          value,
          count,
          selected: currentFilters.semantic?.objects?.includes(value) || false
        }))
      });
    }

    // Objects filter
    const objectCounts = new Map<string, number>();
    photos.forEach(photo => {
      photo.metadata?.objects?.forEach(object => {
        objectCounts.set(object, (objectCounts.get(object) || 0) + 1);
      });
    });

    if (objectCounts.size > 0) {
      categories.push({
        id: 'objects',
        label: 'Objects',
        type: 'multiple',
        options: Array.from(objectCounts.entries()).map(([value, count]) => ({
          value,
          count,
          selected: currentFilters.semantic?.objects?.includes(value) || false
        }))
      });
    }

    // Scenes filter
    const sceneCounts = new Map<string, number>();
    photos.forEach(photo => {
      photo.metadata?.scenes?.forEach(scene => {
        sceneCounts.set(scene, (sceneCounts.get(scene) || 0) + 1);
      });
    });

    if (sceneCounts.size > 0) {
      categories.push({
        id: 'scenes',
        label: 'Scenes',
        type: 'multiple',
        options: Array.from(sceneCounts.entries()).map(([value, count]) => ({
          value,
          count,
          selected: currentFilters.semantic?.scenes?.includes(value) || false
        }))
      });
    }

    // Date range filter
    categories.push({
      id: 'dateRange',
      label: 'Date Range',
      type: 'date',
      options: []
    });

    return categories;
  }, [photos, currentFilters]);

  // Debounced filter change handler
  const debouncedFilterChange = useCallback(
    debounce((filters: FilterState, combination: FilterCombination) => {
      onFilterChange(filters, combination);
    }, debounceMs),
    [onFilterChange, debounceMs]
  );

  // Handle filter selection
  const handleFilterSelect = (categoryId: string, value: string, selected: boolean) => {
    const newFilters = { ...currentFilters };

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
        if (!newFilters.semantic.objects) newFilters.semantic.objects = [];
        if (selected) {
          newFilters.semantic.objects.push(value);
        } else {
          newFilters.semantic.objects = newFilters.semantic.objects.filter(k => k !== value);
        }
        break;
    }

    setCurrentFilters(newFilters);
    debouncedFilterChange(newFilters, combMode);
  };

  // Handle date range selection
  const handleDateRangeSelect = (startDate: Date, endDate: Date) => {
    const newFilters = { ...currentFilters };
    if (!newFilters.temporal) newFilters.temporal = {};
    newFilters.temporal.date_range = { start: startDate, end: endDate };

    setCurrentFilters(newFilters);
    debouncedFilterChange(newFilters, combMode);
  };

  // Clear all filters
  const handleClearAll = () => {
    const emptyFilters: FilterState = {
      semantic: {},
      spatial: {},
      temporal: {},
      people: {},
      technical: {}
    };
    setCurrentFilters(emptyFilters);
    onFilterChange(emptyFilters, combMode);
  };

  // Toggle category expansion
  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  // Toggle combination mode
  const toggleCombinationMode = () => {
    const newMode = combMode === 'AND' ? 'OR' : 'AND';
    setCombMode(newMode);
    debouncedFilterChange(currentFilters, newMode);
  };

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
            {renderFilterContent()}
          </div>
        )}
      </div>
    );
  }

  function renderFilterContent() {
    return (
      <div className="filter-panel">
        <div className="filter-header">
          <h3>Filters</h3>
          <div className="filter-controls">
            <button 
              className="combination-toggle"
              onClick={toggleCombinationMode}
            >
              {combMode}
            </button>
            <button 
              className="clear-button"
              onClick={handleClearAll}
            >
              Clear All
            </button>
          </div>
        </div>

        {isSearching && (
          <div className="search-status">
            <div role="progressbar" className="loading-spinner"></div>
            <span>Searching...</span>
          </div>
        )}

        {searchResults && (
          <div className="search-results-info">
            <span>{searchResults.totalCount} photos found</span>
            <span className="search-time">{(searchResults.searchTime / 1000).toFixed(1)}s</span>
          </div>
        )}

        {filterCategories.map(category => (
          <div key={category.id} className="filter-category">
            <button
              className="category-header"
              onClick={() => toggleCategory(category.id)}
            >
              {category.label}
            </button>

            {expandedCategories.has(category.id) && (
              <div className="category-content">
                {category.type === 'date' ? (
                  <DateRangeFilter onDateRangeSelect={handleDateRangeSelect} />
                ) : (
                  <div className="filter-options">
                    {category.options.map(option => (
                      <label key={option.value} className="filter-option">
                        <input
                          type="checkbox"
                          checked={option.selected}
                          onChange={(e) => 
                            handleFilterSelect(category.id, option.value, e.target.checked)
                          }
                        />
                        <span className="option-label">
                          {option.value} ({option.count})
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  return renderFilterContent();
};

/**
 * Date Range Filter Component
 */
const DateRangeFilter: React.FC<{ onDateRangeSelect: (start: Date, end: Date) => void }> = ({
  onDateRangeSelect
}) => {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const handleDateChange = () => {
    if (startDate && endDate) {
      onDateRangeSelect(new Date(startDate), new Date(endDate));
    }
  };

  const setPresetRange = (preset: string) => {
    const now = new Date();
    let start: Date;
    
    switch (preset) {
      case 'Last Week':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'Last Month':
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'Last Year':
        start = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        return;
    }

    const startStr = start.toISOString().split('T')[0];
    const endStr = now.toISOString().split('T')[0];
    
    setStartDate(startStr);
    setEndDate(endStr);
    onDateRangeSelect(start, now);
  };

  return (
    <div className="date-range-filter">
      <div className="date-inputs">
        <label>
          Start Date
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              handleDateChange();
            }}
          />
        </label>
        <label>
          End Date
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              handleDateChange();
            }}
          />
        </label>
      </div>
      
      <div className="date-presets">
        {['Last Week', 'Last Month', 'Last Year'].map(preset => (
          <button
            key={preset}
            className="preset-button"
            onClick={() => setPresetRange(preset)}
          >
            {preset}
          </button>
        ))}
      </div>
    </div>
  );
};

/**
 * Search Interface Component
 */
export const SearchInterface: React.FC<SearchInterfaceProps> = ({
  onSearch,
  placeholder = 'Search photos with natural language...'
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [parsedEntities, setParsedEntities] = useState<any[]>([]);
  const [parser] = useState(() => new PhotoDiscoveryQueryParser());

  // Handle query input changes
  const handleInputChange = (value: string) => {
    setQuery(value);
    
    // Parse query in real-time for feedback
    if (value.length > 2) {
      const tokenized = parser.tokenize(value);
      setParsedEntities(tokenized.entities);
      
      // Generate suggestions
      const newSuggestions = generateSuggestions(value);
      setSuggestions(newSuggestions);
    } else {
      setParsedEntities([]);
      setSuggestions([]);
    }
  };

  const generateSuggestions = (input: string): string[] => {
    const lowerInput = input.toLowerCase();
    const commonSuggestions = [
      'sunset photos', 'family vacation', 'beach landscapes', 
      'mountain scenery', 'city nightlife', 'sunny day',
      'portrait photography', 'nature wildlife'
    ];
    
    return commonSuggestions.filter(s => s.includes(lowerInput)).slice(0, 5);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <div className="search-interface">
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-container">
          <input
            type="text"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={placeholder}
            className="search-input"
          />
          <button type="submit" className="search-button">
            🔍
          </button>
        </div>

        {parsedEntities.length > 0 && (
          <div className="parsed-entities">
            {parsedEntities.map((entity, index) => (
              <span key={index} className={`entity entity-${entity.type}`}>
                {entity.type === 'location' && '📍'} {entity.value}
              </span>
            ))}
          </div>
        )}

        {suggestions.length > 0 && (
          <div className="search-suggestions">
            {suggestions.map(suggestion => (
              <button
                key={suggestion}
                type="button"
                className="suggestion"
                onClick={() => {
                  setQuery(suggestion);
                  onSearch(suggestion);
                }}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </form>
    </div>
  );
};

/**
 * Query Builder Component
 */
export const QueryBuilder: React.FC<QueryBuilderProps> = ({ onQueryChange }) => {
  const [conditions, setConditions] = useState<QueryCondition[]>([]);
  const [logic, setLogic] = useState<'AND' | 'OR'>('AND');

  const addCondition = (field: string) => {
    const newCondition: QueryCondition = {
      field,
      operator: 'equals',
      value: ''
    };
    const newConditions = [...conditions, newCondition];
    setConditions(newConditions);
    onQueryChange({ conditions: newConditions, logic });
  };

  const updateCondition = (index: number, updates: Partial<QueryCondition>) => {
    const newConditions = conditions.map((cond, i) =>
      i === index ? { ...cond, ...updates } : cond
    );
    setConditions(newConditions);
    onQueryChange({ conditions: newConditions, logic });
  };

  const removeCondition = (index: number) => {
    const newConditions = conditions.filter((_, i) => i !== index);
    setConditions(newConditions);
    onQueryChange({ conditions: newConditions, logic });
  };

  return (
    <div className="query-builder">
      <div className="builder-header">
        <h3>Query Builder</h3>
        <select value={logic} onChange={(e) => setLogic(e.target.value as 'AND' | 'OR')}>
          <option value="AND">AND</option>
          <option value="OR">OR</option>
        </select>
      </div>

      <div className="conditions">
        {conditions.map((condition, index) => (
          <div key={index} className="condition">
            <select
              value={condition.field}
              onChange={(e) => updateCondition(index, { field: e.target.value })}
            >
              <option value="location">Location</option>
              <option value="date">Date</option>
              <option value="camera">Camera</option>
              <option value="keywords">Keywords</option>
            </select>

            <select
              value={condition.operator}
              onChange={(e) => updateCondition(index, { operator: e.target.value })}
            >
              <option value="equals">equals</option>
              <option value="contains">contains</option>
              <option value="before">before</option>
              <option value="after">after</option>
              <option value="between">between</option>
            </select>

            <input
              type="text"
              value={condition.value}
              onChange={(e) => updateCondition(index, { value: e.target.value })}
              placeholder={`Enter ${condition.field}...`}
            />

            <button onClick={() => removeCondition(index)}>×</button>
          </div>
        ))}
      </div>

      <div className="builder-actions">
        <select onChange={(e) => e.target.value && addCondition(e.target.value)}>
          <option value="">Add Filter</option>
          <option value="location">Location</option>
          <option value="date">Date</option>
          <option value="camera">Camera</option>
          <option value="keywords">Keywords</option>
        </select>
      </div>

      <div className="query-preview">
        <h4>Query Preview</h4>
        <div className="preview-text">
          {conditions.map((cond, index) => (
            <span key={index}>
              {index > 0 && ` ${logic} `}
              {cond.field} {cond.operator} "{cond.value}"
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

// Utility functions
function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}