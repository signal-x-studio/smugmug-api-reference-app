/**
 * SearchInterface Component
 *
 * Agent-native natural language search interface for photo discovery.
 * Supports search suggestions, real-time query parsing, and agent programmatic access.
 *
 * Agent-Native Features:
 * - Dual-interface (human UI + agent API)
 * - Action registration for programmatic search
 * - Schema.org SearchAction markup
 * - Natural language command processing
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useDualInterface } from '../agents/hooks/useDualInterface';
import { AgentWrapper } from '../agents/components/AgentWrapper';
import { PhotoDiscoveryQueryParser } from '../utils/agent-native/photo-discovery-search';

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

  // Natural language query parser
  const queryParser = useMemo(() => new PhotoDiscoveryQueryParser(), []);

  // Agent-native dual interface
  const { agentInterface, registerAction } = useDualInterface({
    componentId: 'photo-search-interface',
    data: {
      query,
      suggestions,
      parsedEntities,
      lastSearchResults: []
    },
    state: {
      query,
      showSuggestions,
      entityCount: parsedEntities.length
    },
    setState: (newState: any) => {
      if (newState.query !== undefined) {
        handleInputChange({ target: { value: newState.query } } as any);
      }
    },
    exposeGlobally: true,
    security: {
      accessLevel: 'limited-write',
      allowedOperations: ['read', 'search', 'subscribe'],
      deniedOperations: ['delete', 'admin'],
      rateLimit: {
        maxRequestsPerMinute: 60,
        maxConcurrentRequests: 5
      },
      auditLogging: {
        enabled: false,
        logLevel: 'standard',
        includeStateSnapshots: false
      },
      dataSanitization: {
        excludeFields: [],
        maskFields: []
      }
    }
  });

  // Register agent action for programmatic search
  useEffect(() => {
    registerAction({
      id: 'search-photos',
      name: 'Search Photos',
      description: 'Execute a photo search with natural language query',
      parameters: [
        {
          name: 'query',
          type: 'string',
          required: true,
          description: 'Natural language search query (e.g., "sunset photos from last summer")'
        }
      ],
      returns: {
        type: 'object',
        description: 'Search execution result with parsed parameters'
      },
      permissions: ['read', 'execute'],
      humanEquivalent: 'Type query in search box and press Enter',
      examples: [
        {
          description: 'Search for sunset photos from last summer',
          input: { query: 'sunset photos from last summer' },
          output: {
            success: true,
            data: {
              query: 'sunset photos from last summer',
              parameters: { semantic: { objects: ['sunset'] } },
              confidence: 0.9
            }
          }
        }
      ],
      category: 'search'
    });

    registerAction({
      id: 'parse-natural-language-query',
      name: 'Parse Natural Language Query',
      description: 'Parse a natural language query and extract search parameters',
      parameters: [
        {
          name: 'query',
          type: 'string',
          required: true,
          description: 'Natural language query to parse'
        }
      ],
      returns: {
        type: 'object',
        description: 'Parsed query parameters and intent'
      },
      permissions: ['read'],
      humanEquivalent: 'View parsed entities below search box',
      examples: [
        {
          description: 'Parse a location query',
          input: { query: 'photos from Paris' },
          output: {
            success: true,
            data: {
              parameters: { spatial: { location: 'Paris' } },
              intent: { type: 'discovery', confidence: 0.9 }
            }
          }
        }
      ],
      category: 'query-processing'
    });
  }, [registerAction, onSearch, queryParser]);

  return (
    <AgentWrapper
      agentInterface={agentInterface}
      schemaType="SearchAction"
      as="section"
      className="search-interface"
    >
      <div
        itemScope
        itemType="https://schema.org/SearchAction"
        data-agent-component="photo-search"
      >
        <meta itemProp="name" content="Photo Search" />
        <meta itemProp="description" content="Search photos using natural language queries" />

        <SearchInput
          query={query}
          handleInputChange={handleInputChange}
          handleKeyPress={handleKeyPress}
          handleKeyDown={handleKeyDown}
          handleSearchClick={handleSearchClick}
        />

        {parsedEntities.length > 0 && (
          <div
            className="parsed-entities"
            itemProp="query-input"
          >
            {parsedEntities.map((entity, index) => (
              <span
                key={index}
                className="entity-tag"
                itemProp="about"
                itemScope
                itemType="https://schema.org/Thing"
              >
                <meta itemProp="additionalType" content={entity.type} />
                {entity.type === 'location' && '📍'} {entity.value}
              </span>
            ))}
          </div>
        )}

        {showSuggestions && (
          <div
            className="suggestions-dropdown"
            itemProp="result"
            itemScope
            itemType="https://schema.org/ItemList"
          >
            <meta itemProp="numberOfItems" content={suggestions.length.toString()} />
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="suggestion-item"
                itemProp="itemListElement"
                itemScope
                itemType="https://schema.org/ListItem"
              >
                <meta itemProp="position" content={(index + 1).toString()} />
                <span itemProp="name">{suggestion}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </AgentWrapper>
  );
};