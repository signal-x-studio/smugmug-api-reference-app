/**
 * SearchInterface Component
 * 
 * Natural language search interface for photo discovery.
 * Supports search suggestions and real-time query parsing.
 */

import React, { useState, useCallback, useEffect } from 'react';

interface SearchInterfaceProps {
  onSearch: (query: string) => void;
}

const generateMockSuggestions = (query: string): string[] => {
  const suggestions = [];
  if (query.toLowerCase().includes('sun')) {
    suggestions.push('sunset photos', 'sunny day');
  }
  return suggestions;
};

const parseEntities = (query: string): Array<{ type: string; value: string }> => {
  const entities = [];
  if (query.toLowerCase().includes('paris')) {
    entities.push({ type: 'location', value: 'Paris' });
  }
  return entities;
};

const useSearchInterface = (onSearch: (query: string) => void): {
  query: string;
  suggestions: string[];
  showSuggestions: boolean;
  parsedEntities: Array<{ type: string; value: string }>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleSearchClick: () => void;
} => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [parsedEntities, setParsedEntities] = useState<Array<{ type: string; value: string }>>([]);

  // Mock suggestions based on input
  useEffect(() => {
    if (query.length > 2) {
      const mockSuggestions = generateMockSuggestions(query);
      setSuggestions(mockSuggestions);
      setShowSuggestions(mockSuggestions.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [query]);

  // Mock entity parsing
  useEffect(() => {
    setParsedEntities(parseEntities(query));
  }, [query]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  }, []);

  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim()) {
      onSearch(query.trim());
      setShowSuggestions(false);
    }
  }, [query, onSearch]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim()) {
      onSearch(query.trim());
      setShowSuggestions(false);
    }
  }, [query, onSearch]);

  const handleSearchClick = useCallback(() => {
    onSearch(query);
    setShowSuggestions(false);
  }, [query, onSearch]);

  return {
    query,
    suggestions,
    showSuggestions,
    parsedEntities,
    handleInputChange,
    handleKeyPress,
    handleKeyDown,
    handleSearchClick
  };
};

const SearchInput = ({ query, handleInputChange, handleKeyPress, handleKeyDown, handleSearchClick }: {
  query: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleSearchClick: () => void;
}): React.ReactElement => (
  <div className="search-input-container">
    <input
      type="text"
      placeholder="Search photos with natural language..."
      value={query}
      onChange={handleInputChange}
      onKeyPress={handleKeyPress}
      onKeyDown={handleKeyDown}
      className="search-input"
    />
    <button onClick={handleSearchClick} className="search-button" type="button">
      🔍
    </button>
  </div>
);

export const SearchInterface: React.FC<SearchInterfaceProps> = ({ onSearch }) => {
  const {
    query,
    suggestions,
    showSuggestions,
    parsedEntities,
    handleInputChange,
    handleKeyPress,
    handleKeyDown,
    handleSearchClick
  } = useSearchInterface(onSearch);

  return (
    <div className="search-interface">
      <SearchInput 
        query={query}
        handleInputChange={handleInputChange}
        handleKeyPress={handleKeyPress}
        handleKeyDown={handleKeyDown}
        handleSearchClick={handleSearchClick}
      />

      {parsedEntities.length > 0 && (
        <div className="parsed-entities">
          {parsedEntities.map((entity, index) => (
            <span key={index} className="entity-tag">
              {entity.type === 'location' && '📍'} {entity.value}
            </span>
          ))}
        </div>
      )}

      {showSuggestions && (
        <div className="suggestions-dropdown">
          {suggestions.map((suggestion, index) => (
            <div key={index} className="suggestion-item">
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};