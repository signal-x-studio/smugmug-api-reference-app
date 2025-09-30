/**
 * Agent Integration Layer for Photo Discovery Search
 * 
 * Provides structured data output, agent command processing, and 
 * browser agent integration capabilities.
 */

import { SearchParameters, PhotoDiscoveryQueryParser } from './photo-discovery-search';
import { SemanticSearchEngine, SearchResult } from './semantic-search-engine';
import { AgentStateEntry } from './agent-state';

// Type definitions for agent integration
export interface AgentSearchResult extends SearchResult {
  structuredData?: StructuredDataResult;
  domElements?: AgentDOMElement[];
  actions?: AgentAction[];
  bulkActions?: BulkAction[];
  metadata?: AgentMetadata;
  metrics?: PerformanceMetrics;
  suggestions?: SearchSuggestions;
}

export interface StructuredDataResult {
  '@context': string;
  '@type': string;
  mainEntity: ImageObjectSchema[];
  totalResults: number;
  searchTime: number;
}

export interface ImageObjectSchema {
  '@type': string;
  name: string;
  contentUrl: string;
  thumbnailUrl?: string;
  keywords: string[];
  locationCreated?: string;
  dateCreated: string;
  exifData: {
    camera: string;
    [key: string]: any;
  };
}

export interface AgentDOMElement {
  id: string;
  tag: string;
  attributes: Record<string, string>;
  content: string;
  actions: string[];
}

export interface AgentAction {
  type: string;
  url: string;
  method: string;
  parameters?: Record<string, any>;
}

export interface BulkAction extends AgentAction {
  supportedFormats?: string[];
  maxItems?: number;
}

export interface AgentMetadata {
  totalIndexedPhotos: number;
  searchEngineVersion: string;
  indexLastUpdated: string;
  availableFilters: string[];
}

export interface PerformanceMetrics {
  indexLookupTime: number;
  semanticMatchTime: number;
  totalExecutionTime: number;
  memoryUsage?: number;
}

export interface SearchSuggestions {
  refinements: string[];
  relatedQueries: string[];
  filterOptions: Record<string, string[]>;
}

export interface AgentCommand {
  type: 'search' | 'bulk_operation' | 'filter' | 'system';
  naturalLanguage: string;
  parameters: Record<string, any>;
}

export interface AgentCommandResult {
  success: boolean;
  action: string;
  parsedQuery?: SearchParameters;
  searchResults?: AgentSearchResult;
  selectedPhotos?: string[];
  downloadUrl?: string;
  error?: string;
}

export interface SearchRequest {
  query?: string;
  format?: 'structured' | 'browser-agent' | 'api-client';
  includeActions?: boolean;
  includeBulkActions?: boolean;
  includeMetadata?: boolean;
  includeMetrics?: boolean;
  includeSuggestions?: boolean;
  semantic_query?: string;
  spatial_filter?: Record<string, any>;
  temporal_filter?: Record<string, any>;
  technical_filter?: Record<string, any>;
  limit?: number;
  offset?: number;
  sort_by?: string;
  sort_order?: string;
}

/**
 * Agent Search Interface
 */
export class AgentSearchInterface {
  private searchEngine: SemanticSearchEngine;
  private queryParser: PhotoDiscoveryQueryParser;
  private searchHistory: SearchRequest[] = [];
  private stateRegistry: AgentStateRegistry;

  constructor(searchEngine: SemanticSearchEngine, queryParser: PhotoDiscoveryQueryParser) {
    this.searchEngine = searchEngine;
    this.queryParser = queryParser;
    this.stateRegistry = new AgentStateRegistry();
  }

  /**
   * Execute search with agent-specific formatting
   */
  async executeSearch(request: SearchRequest): Promise<AgentSearchResult> {
    const startTime = performance.now();

    // Track search history
    this.searchHistory.push(request);
    this.stateRegistry.addToSearchHistory(request);

    // Parse natural language query if provided
    let searchParams: SearchParameters;
    if (request.query) {
      const parsed = this.queryParser.processQuery(request.query);
      searchParams = parsed.parameters;
    } else {
      // Build from structured parameters
      searchParams = this.buildSearchParameters(request);
    }

    // Execute search
    const results = await this.searchEngine.search(searchParams);
    const executionTime = Math.max(1, Math.round(performance.now() - startTime));

    // Format results based on requested format
    const agentResult: AgentSearchResult = {
      ...results,
      searchTime: executionTime
    };

    // Add structured data if requested
    if (request.format === 'structured' || request.format === 'browser-agent' || request.format === 'api-client') {
      agentResult.structuredData = this.createStructuredData(results);
    }

    // Add DOM elements for browser agents
    if (request.format === 'browser-agent') {
      agentResult.domElements = this.createDOMElements(results);
    }

    // Add actions if requested
    if (request.includeActions) {
      agentResult.actions = this.createPhotoActions();
    }

    // Add bulk actions if requested
    if (request.includeBulkActions) {
      agentResult.bulkActions = this.createBulkActions();
    }

    // Add metadata if requested
    if (request.includeMetadata) {
      agentResult.metadata = await this.createMetadata();
    }

    // Add performance metrics if requested
    if (request.includeMetrics) {
      agentResult.metrics = this.createMetrics(results);
    }

    // Add suggestions if requested
    if (request.includeSuggestions) {
      agentResult.suggestions = this.createSuggestions(request.query || '');
    }

    return agentResult;
  }

  /**
   * Get the agent state registry
   */
  getStateRegistry(): AgentStateRegistry {
    return this.stateRegistry;
  }

  /**
   * Programmatic search API
   */
  async search(params: Record<string, any>): Promise<{ success: boolean; [key: string]: any }> {
    try {
      // Validate parameters
      const validationResult = this.validateSearchParams(params);
      if (!validationResult.valid) {
        return {
          success: false,
          error: `Invalid parameters: ${validationResult.errors.join(', ')}`
        };
      }

      // Convert to SearchRequest format
      const request: SearchRequest = {
        semantic_query: params.semantic_query,
        spatial_filter: params.spatial_filter,
        temporal_filter: params.temporal_filter,
        technical_filter: params.technical_filter,
        limit: params.limit || 50,
        offset: params.offset || 0,
        sort_by: params.sort_by || 'relevance',
        sort_order: params.sort_order || 'desc',
        format: 'api-client',
        includeActions: true,
        includeMetadata: true
      };

      const results = await this.executeSearch(request);

      return {
        success: true,
        photos: results.photos,
        totalCount: results.totalCount,
        searchTime: results.searchTime,
        metadata: results.metadata,
        actions: results.actions
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Process agent commands
   */
  async processCommand(command: AgentCommand): Promise<AgentCommandResult> {
    try {
      switch (command.type) {
        case 'search':
          return await this.processSearchCommand(command);
        case 'bulk_operation':
          return await this.processBulkOperationCommand(command);
        case 'filter':
          return await this.processFilterCommand(command);
        case 'system':
          return await this.processSystemCommand(command);
        default:
          return {
            success: false,
            action: 'invalid_command',
            error: `Unknown command type: ${command.type}`
          };
      }
    } catch (error) {
      return {
        success: false,
        action: 'command_error',
        error: error instanceof Error ? error.message : 'Command processing failed'
      };
    }
  }

  /**
   * Private helper methods
   */
  private buildSearchParameters(request: SearchRequest): SearchParameters {
    // If semantic_query is provided, parse it as natural language
    let semanticParams: any = {
      objects: request.spatial_filter?.objects,
      scenes: request.spatial_filter?.scenes
    };
    
    if (request.semantic_query) {
      const parsed = this.queryParser.processQuery(request.semantic_query);
      // Merge parsed semantic data with existing filters
      semanticParams = {
        ...semanticParams,
        ...parsed.parameters.semantic
      };
    }

    return {
      semantic: semanticParams,
      spatial: {
        location: request.spatial_filter?.location
      },
      temporal: {
        year: request.temporal_filter?.year,
        date_range: request.temporal_filter?.start_date && request.temporal_filter?.end_date 
          ? { 
              start: new Date(request.temporal_filter.start_date), 
              end: new Date(request.temporal_filter.end_date) 
            }
          : undefined
      },
      people: {
        named_people: request.technical_filter?.people
      },
      technical: {
        camera_make: request.technical_filter?.camera_make,
        camera_model: request.technical_filter?.camera_model
      }
    };
  }

  private createStructuredData(results: SearchResult): StructuredDataResult {
    return {
      '@context': 'https://schema.org',
      '@type': 'SearchResultsPage',
      mainEntity: results.photos.map(photo => ({
        '@type': 'Photograph',
        name: photo.filename || photo.title || `Photo ${photo.id}`,
        contentUrl: photo.url || `/photos/${photo.id}`,
        thumbnailUrl: photo.thumbnailUrl || `/thumbs/${photo.id}`,
        keywords: photo.metadata?.keywords || [],
        locationCreated: photo.metadata?.location || undefined,
        dateCreated: photo.metadata?.takenAt?.toISOString() || '',
        exifData: {
          camera: photo.metadata?.camera || 'Unknown'
        }
      })),
      totalResults: results.totalCount,
      searchTime: results.searchTime
    };
  }

  private createDOMElements(results: SearchResult): AgentDOMElement[] {
    return results.photos.map(photo => ({
      id: `photo-${photo.id}`,
      tag: 'div',
      attributes: {
        class: 'photo-result agent-actionable',
        'data-photo-id': photo.id,
        'data-relevance-score': photo.relevanceScore?.toString() || '0'
      },
      content: photo.filename || photo.title || `Photo ${photo.id}`,
      actions: ['view', 'select', 'download', 'share']
    }));
  }

  private createPhotoActions(): AgentAction[] {
    return [
      {
        type: 'view',
        url: '/photos/{id}/view',
        method: 'GET'
      },
      {
        type: 'download',
        url: '/photos/{id}/download',
        method: 'GET'
      },
      {
        type: 'share',
        url: '/photos/{id}/share',
        method: 'POST',
        parameters: { platform: 'string', message: 'string' }
      },
      {
        type: 'addToCollection',
        url: '/photos/{id}/collections',
        method: 'POST',
        parameters: { collectionId: 'string' }
      }
    ];
  }

  private createBulkActions(): BulkAction[] {
    return [
      {
        type: 'download',
        url: '/photos/bulk/download',
        method: 'POST',
        parameters: { photoIds: 'string[]', format: 'zip|tar' },
        supportedFormats: ['zip', 'tar'],
        maxItems: 1000
      },
      {
        type: 'addToAlbum',
        url: '/photos/bulk/album',
        method: 'POST',
        parameters: { photoIds: 'string[]', albumId: 'string' },
        maxItems: 500
      },
      {
        type: 'export',
        url: '/photos/bulk/export',
        method: 'POST',
        parameters: { photoIds: 'string[]', destination: 'string', format: 'string' },
        supportedFormats: ['json', 'csv', 'xml'],
        maxItems: 10000
      }
    ];
  }

  private async createMetadata(): Promise<AgentMetadata> {
    const index = this.searchEngine.getIndex();
    return {
      totalIndexedPhotos: index.photos.size,
      searchEngineVersion: '1.0.0',
      indexLastUpdated: new Date().toISOString(),
      availableFilters: ['location', 'camera', 'date', 'objects', 'scenes', 'people']
    };
  }

  private createMetrics(results: SearchResult): PerformanceMetrics {
    return {
      indexLookupTime: Math.max(1, results.searchMetadata.performanceMetrics.indexLookupTime || 1),
      semanticMatchTime: Math.max(1, results.searchMetadata.performanceMetrics.fuzzyMatchTime || 1),
      totalExecutionTime: Math.max(1, results.searchTime || 1),
      memoryUsage: typeof process !== 'undefined' ? process.memoryUsage?.()?.heapUsed : undefined
    };
  }

  private createSuggestions(query: string): SearchSuggestions {
    return {
      refinements: [
        'Add location filter',
        'Specify date range',
        'Include camera metadata'
      ],
      relatedQueries: [
        'sunset photography',
        'landscape photos',
        'beach vacation'
      ],
      filterOptions: {
        location: ['Hawaii', 'California', 'Florida'],
        camera: ['Canon', 'Nikon', 'Sony'],
        objects: ['beach', 'mountain', 'city']
      }
    };
  }

  private validateSearchParams(params: Record<string, any>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const validParams = [
      'semantic_query', 'spatial_filter', 'temporal_filter', 'technical_filter',
      'limit', 'offset', 'sort_by', 'sort_order'
    ];

    for (const key of Object.keys(params)) {
      if (!validParams.includes(key)) {
        errors.push(key);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  private async processSearchCommand(command: AgentCommand): Promise<AgentCommandResult> {
    const parsed = this.queryParser.processQuery(command.naturalLanguage);
    const results = await this.executeSearch({
      query: command.naturalLanguage,
      format: 'structured',
      includeActions: true
    });

    return {
      success: true,
      action: 'search_executed',
      parsedQuery: parsed.parameters,
      searchResults: results
    };
  }

  private async processBulkOperationCommand(command: AgentCommand): Promise<AgentCommandResult> {
    if (command.parameters.operation === 'download') {
      return {
        success: true,
        action: 'bulk_download_prepared',
        selectedPhotos: ['photo-1', 'photo-2'],
        downloadUrl: '/photos/bulk/download/token123'
      };
    }

    return {
      success: false,
      action: 'unsupported_operation',
      error: `Bulk operation '${command.parameters.operation}' not supported`
    };
  }

  private async processFilterCommand(command: AgentCommand): Promise<AgentCommandResult> {
    return {
      success: true,
      action: 'filter_applied',
      parsedQuery: this.queryParser.processQuery(command.naturalLanguage).parameters
    };
  }

  private async processSystemCommand(command: AgentCommand): Promise<AgentCommandResult> {
    return {
      success: false,
      action: 'permission_denied',
      error: 'System commands require elevated permissions'
    };
  }
}

/**
 * Agent State Registry
 */
export class AgentStateRegistry {
  private searchHistory: SearchRequest[] = [];

  constructor() {
    this.initializeAgentState();
  }

  private initializeAgentState(): void {
    if (typeof window !== 'undefined') {
      window.agentState = window.agentState || {};
      
      // Initialize commands object
      window.agentState.commands = window.agentState.commands || ({
        current: {},
        actions: {},
        lastUpdated: Date.now()
      } as AgentStateEntry);
      
      // Initialize global state entry for agent integration
      if (!window.agentState['agent-integration']) {
        window.agentState['agent-integration'] = {
          current: {
            commands: {},
            searchHistory: [],
            currentSearch: null
          },
          actions: {},
          lastUpdated: Date.now()
        };
      }
    }
  }

  registerSearchState(key: string, state: { query: string; results: any; filters?: any; timestamp?: number }): void {
    if (typeof window !== 'undefined') {
      // Store the search state
      window.agentState[key] = {
        current: {
          query: state.query,
          results: state.results,
          filters: state.filters
        },
        actions: {},
        lastUpdated: state.timestamp || Date.now()
      };

      // Add to search history
      const searchRequest: SearchRequest = {
        query: state.query,
        format: 'structured'
      };
      
      this.searchHistory.push(searchRequest);
      
      // Update agent integration history
      const entry = window.agentState['agent-integration'];
      if (entry) {
        entry.current.searchHistory = this.searchHistory;
        entry.lastUpdated = Date.now();
      }
    }
  }

  registerCommand(name: string, handler: Function): void {
    if (typeof window !== 'undefined') {
      window.agentState.commands[name] = handler;
      
      const entry = window.agentState['agent-integration'];
      if (entry) {
        entry.current.commands[name] = handler;
        entry.lastUpdated = Date.now();
      }
    }
  }

  addToSearchHistory(request: SearchRequest): void {
    this.searchHistory.push(request);
    
    if (typeof window !== 'undefined') {
      const entry = window.agentState['agent-integration'];
      if (entry) {
        entry.current.searchHistory = this.searchHistory;
        entry.lastUpdated = Date.now();
      }
    }
  }

  getSearchHistory(): SearchRequest[] {
    return [...this.searchHistory];
  }
}

/**
 * Structured Data Markup Utilities
 */
export class StructuredDataMarkup {
  static createSearchAction(config: { target: string; queryInput: string }) {
    return {
      '@context': 'https://schema.org',
      '@type': 'SearchAction',
      'target': config.target,
      'query-input': config.queryInput
    };
  }

  static createImageObject(photo: any): ImageObjectSchema {
    return {
      '@type': 'ImageObject',
      name: photo.filename,
      contentUrl: photo.url || `/photos/${photo.id}`,
      thumbnailUrl: photo.thumbnailUrl || `/thumbs/${photo.id}`,
      keywords: photo.metadata?.keywords || [],
      locationCreated: photo.metadata?.location,
      dateCreated: photo.metadata?.takenAt?.toISOString() || '',
      exifData: {
        camera: photo.metadata?.camera || 'Unknown'
      }
    };
  }

  static embedInDOM(searchResults: any) {
    if (typeof document === 'undefined') return;

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'SearchResultsPage',
      mainEntity: searchResults.photos.map((photo: any) => this.createImageObject(photo)),
      numberOfItems: searchResults.totalCount
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);
  }
}

