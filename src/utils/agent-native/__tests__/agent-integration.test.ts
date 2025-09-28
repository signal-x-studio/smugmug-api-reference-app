/**
 * Tests for Agent-Ready Search Results and Integration
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import {
  AgentSearchInterface,
  AgentResultFormatter,
  AgentStateRegistry,
  StructuredDataMarkup,
  AgentCommand,
  AgentSearchResult
} from '../agent-integration';
import { SemanticSearchEngine } from '../semantic-search-engine';
import { PhotoDiscoveryQueryParser } from '../photo-discovery-search';
import { Photo } from '../../../types';

// Mock DOM environment
Object.defineProperty(window, 'agentState', {
  value: {},
  writable: true
});

describe('Agent-Ready Search Results', () => {
  let mockPhotos: Photo[];
  let searchEngine: SemanticSearchEngine;
  let queryParser: PhotoDiscoveryQueryParser;
  let agentInterface: AgentSearchInterface;

  beforeEach(() => {
    mockPhotos = [
      {
        id: 'photo-1',
        filename: 'sunset-hawaii.jpg',
        url: '/photos/sunset-hawaii.jpg',
        thumbnail: '/thumbs/sunset-hawaii.jpg',
        metadata: {
          keywords: ['sunset', 'hawaii', 'beach'],
          objects: ['ocean', 'sky'],
          scenes: ['landscape'],
          location: 'Hawaii',
          camera: 'Canon EOS R5',
          takenAt: new Date('2023-07-15T19:30:00Z'),
          confidence: 0.95
        }
      },
      {
        id: 'photo-2',
        filename: 'family-vacation.jpg', 
        url: '/photos/family-vacation.jpg',
        thumbnail: '/thumbs/family-vacation.jpg',
        metadata: {
          keywords: ['family', 'vacation', 'children'],
          objects: ['people', 'beach'],
          scenes: ['portrait'],
          location: 'Florida',
          camera: 'Nikon D850',
          takenAt: new Date('2023-08-20T14:15:00Z'),
          confidence: 0.88
        }
      }
    ];

    searchEngine = new SemanticSearchEngine({
      performanceThreshold: 3000,
      maxResults: 50,
      fuzzyMatchThreshold: 0.6
    });

    queryParser = new PhotoDiscoveryQueryParser();
    agentInterface = new AgentSearchInterface(searchEngine, queryParser);

    // Reset agent state
    window.agentState = {};
  });

  describe('Structured Data Output', () => {
    test('should format search results with Schema.org markup', async () => {
      await searchEngine.indexPhotos(mockPhotos);
      
      const results = await agentInterface.executeSearch({
        query: 'sunset photos from Hawaii',
        format: 'structured'
      });

      expect(results.structuredData).toBeDefined();
      expect(results.structuredData['@context']).toBe('https://schema.org');
      expect(results.structuredData['@type']).toBe('SearchResultsPage');
      
      // Check individual photo structured data
      const firstPhoto = results.structuredData.mainEntity[0];
      expect(firstPhoto['@type']).toBe('Photograph');
      expect(firstPhoto.name).toBe('sunset-hawaii.jpg');
      expect(firstPhoto.contentUrl).toBe('/photos/sunset-hawaii.jpg');
      expect(firstPhoto.thumbnailUrl).toBe('/thumbs/sunset-hawaii.jpg');
    });

    test('should include comprehensive metadata in structured format', async () => {
      await searchEngine.indexPhotos(mockPhotos);
      
      const results = await agentInterface.executeSearch({
        query: 'beach photos',
        format: 'structured'
      });

      const photo = results.structuredData.mainEntity[0];
      expect(photo.locationCreated).toBeDefined();
      expect(photo.dateCreated).toBe('2023-07-15T19:30:00.000Z');
      expect(photo.keywords).toEqual(['sunset', 'hawaii', 'beach']);
      expect(photo.exifData).toBeDefined();
      expect(photo.exifData.camera).toBe('Canon EOS R5');
    });

    test('should provide agent-accessible search metadata', async () => {
      await searchEngine.indexPhotos(mockPhotos);
      
      const results = await agentInterface.executeSearch({
        query: 'family photos',
        format: 'structured'
      });

      expect(results.searchMetadata).toBeDefined();
      expect(results.searchMetadata.totalResults).toBe(results.photos.length);
      expect(results.searchMetadata.searchTime).toBeGreaterThan(0);
      expect(results.searchMetadata.queryAnalysis).toBeDefined();
      expect(results.searchMetadata.appliedFilters).toBeDefined();
    });

    test('should format results for different agent types', async () => {
      await searchEngine.indexPhotos(mockPhotos);
      
      const browserResults = await agentInterface.executeSearch({
        query: 'vacation photos',
        format: 'browser-agent'
      });

      const apiResults = await agentInterface.executeSearch({
        query: 'vacation photos', 
        format: 'api-client'
      });

      // Browser agent format should include DOM-ready elements
      expect(browserResults.domElements).toBeDefined();
      expect(browserResults.domElements.length).toBeGreaterThan(0);

      // API format should be clean JSON
      expect(apiResults.structuredData).toBeDefined();
      expect(apiResults.domElements).toBeUndefined();
    });
  });

  describe('Agent State Registry', () => {
    test('should register search state for agent access', async () => {
      const registry = new AgentStateRegistry();
      
      await searchEngine.indexPhotos(mockPhotos);
      const searchResult = await searchEngine.search({
        semantic: { objects: ['sunset'] },
        spatial: {},
        temporal: {},
        people: {}
      });

      registry.registerSearchState('photo-search', {
        query: 'sunset photos',
        results: searchResult,
        filters: { location: 'Hawaii' },
        timestamp: Date.now()
      });

      expect(window.agentState['photo-search']).toBeDefined();
      expect(window.agentState['photo-search'].query).toBe('sunset photos');
      expect(window.agentState['photo-search'].results).toBeDefined();
    });

    test('should provide agent command interface', () => {
      const registry = new AgentStateRegistry();
      
      registry.registerCommand('search-photos', async (params) => {
        return await agentInterface.executeSearch({
          query: params.query,
          format: 'structured'
        });
      });

      expect(window.agentState.commands['search-photos']).toBeDefined();
    });

    test('should track search history for agents', async () => {
      const registry = new AgentStateRegistry();
      
      // Execute multiple searches
      await agentInterface.executeSearch({ query: 'sunset photos' });
      await agentInterface.executeSearch({ query: 'family vacation' });
      await agentInterface.executeSearch({ query: 'beach landscapes' });

      const history = registry.getSearchHistory();
      expect(history).toHaveLength(3);
      expect(history[0].query).toBe('sunset photos');
      expect(history[2].query).toBe('beach landscapes');
    });
  });

  describe('Actionable Result Elements', () => {
    test('should provide actionable elements for each photo', async () => {
      await searchEngine.indexPhotos(mockPhotos);
      
      const results = await agentInterface.executeSearch({
        query: 'hawaii photos',
        includeActions: true
      });

      const photo = results.photos[0];
      expect(photo.actions).toBeDefined();
      expect(photo.actions.view).toBeDefined();
      expect(photo.actions.download).toBeDefined();
      expect(photo.actions.share).toBeDefined();
      expect(photo.actions.addToCollection).toBeDefined();
    });

    test('should generate agent-compatible action URLs', async () => {
      await searchEngine.indexPhotos(mockPhotos);
      
      const results = await agentInterface.executeSearch({
        query: 'sunset photos',
        includeActions: true
      });

      const photo = results.photos[0];
      expect(photo.actions.view.url).toBe('/photos/photo-1/view');
      expect(photo.actions.download.url).toBe('/photos/photo-1/download');
      expect(photo.actions.share.url).toBe('/photos/photo-1/share');
      
      // Actions should include method and parameters
      expect(photo.actions.addToCollection.method).toBe('POST');
      expect(photo.actions.addToCollection.parameters).toBeDefined();
    });

    test('should support bulk action coordination', async () => {
      await searchEngine.indexPhotos(mockPhotos);
      
      const results = await agentInterface.executeSearch({
        query: 'beach photos',
        includeBulkActions: true
      });

      expect(results.bulkActions).toBeDefined();
      expect(results.bulkActions.downloadAll).toBeDefined();
      expect(results.bulkActions.addToAlbum).toBeDefined();
      expect(results.bulkActions.export).toBeDefined();
      
      // Bulk actions should work with selected photo IDs
      expect(results.bulkActions.downloadAll.url).toBe('/photos/bulk/download');
      expect(results.bulkActions.downloadAll.method).toBe('POST');
    });
  });

  describe('Programmatic Search API', () => {
    test('should execute searches via programmatic interface', async () => {
      await searchEngine.indexPhotos(mockPhotos);
      
      // Direct API call
      const results = await agentInterface.search({
        semantic_query: 'sunset beach',
        spatial_filter: { location: 'Hawaii' },
        limit: 10,
        offset: 0
      });

      expect(results.success).toBe(true);
      expect(results.photos).toBeDefined();
      expect(results.totalCount).toBeGreaterThan(0);
      expect(results.searchTime).toBeGreaterThan(0);
    });

    test('should validate programmatic search parameters', async () => {
      const invalidResult = await agentInterface.search({
        invalid_param: 'test',
        semantic_query: 'photos'
      });

      expect(invalidResult.success).toBe(false);
      expect(invalidResult.error).toContain('invalid_param');
    });

    test('should support advanced programmatic queries', async () => {
      await searchEngine.indexPhotos(mockPhotos);
      
      const results = await agentInterface.search({
        semantic_query: 'vacation photos',
        temporal_filter: {
          start_date: '2023-07-01',
          end_date: '2023-08-31'
        },
        technical_filter: {
          camera_make: 'Canon'
        },
        sort_by: 'relevance',
        sort_order: 'desc'
      });

      expect(results.success).toBe(true);
      expect(results.photos.length).toBeGreaterThan(0);
      
      // Results should be sorted by relevance
      if (results.photos.length > 1) {
        expect(results.photos[0].relevanceScore).toBeGreaterThanOrEqual(
          results.photos[1].relevanceScore
        );
      }
    });
  });

  describe('Result Metadata Exposure', () => {
    test('should expose comprehensive result metadata', async () => {
      await searchEngine.indexPhotos(mockPhotos);
      
      const results = await agentInterface.executeSearch({
        query: 'family photos',
        includeMetadata: true
      });

      expect(results.metadata).toBeDefined();
      expect(results.metadata.totalIndexedPhotos).toBe(2);
      expect(results.metadata.searchEngineVersion).toBeDefined();
      expect(results.metadata.indexLastUpdated).toBeDefined();
      expect(results.metadata.availableFilters).toBeDefined();
    });

    test('should include performance metrics', async () => {
      await searchEngine.indexPhotos(mockPhotos);
      
      const results = await agentInterface.executeSearch({
        query: 'beach sunset',
        includeMetrics: true
      });

      expect(results.metrics).toBeDefined();
      expect(results.metrics.indexLookupTime).toBeGreaterThan(0);
      expect(results.metrics.semanticMatchTime).toBeGreaterThan(0);
      expect(results.metrics.totalExecutionTime).toBeGreaterThan(0);
      expect(results.metrics.memoryUsage).toBeDefined();
    });

    test('should provide filter suggestion metadata', async () => {
      await searchEngine.indexPhotos(mockPhotos);
      
      const results = await agentInterface.executeSearch({
        query: 'photos',
        includeSuggestions: true
      });

      expect(results.suggestions).toBeDefined();
      expect(results.suggestions.refinements).toBeDefined();
      expect(results.suggestions.relatedQueries).toBeDefined();
      expect(results.suggestions.filterOptions).toBeDefined();
    });
  });

  describe('Agent Command Processing', () => {
    test('should process natural language agent commands', async () => {
      await searchEngine.indexPhotos(mockPhotos);
      
      const command: AgentCommand = {
        type: 'search',
        naturalLanguage: 'Find all sunset photos from Hawaii taken in 2023',
        parameters: {}
      };

      const result = await agentInterface.processCommand(command);

      expect(result.success).toBe(true);
      expect(result.parsedQuery).toBeDefined();
      expect(result.searchResults).toBeDefined();
      expect(result.action).toBe('search_executed');
    });

    test('should handle bulk operation commands', async () => {
      await searchEngine.indexPhotos(mockPhotos);
      
      const command: AgentCommand = {
        type: 'bulk_operation',
        naturalLanguage: 'Download all beach photos from this search',
        parameters: {
          operation: 'download',
          filter: { semantic: { objects: ['beach'] } }
        }
      };

      const result = await agentInterface.processCommand(command);

      expect(result.success).toBe(true);
      expect(result.action).toBe('bulk_download_prepared');
      expect(result.selectedPhotos).toBeDefined();
      expect(result.downloadUrl).toBeDefined();
    });

    test('should validate agent command permissions', async () => {
      const restrictedCommand: AgentCommand = {
        type: 'system',
        naturalLanguage: 'Delete all photos',
        parameters: { operation: 'delete_all' }
      };

      const result = await agentInterface.processCommand(restrictedCommand);

      expect(result.success).toBe(false);
      expect(result.error).toContain('permission');
      expect(result.action).toBe('permission_denied');
    });
  });

  describe('Schema.org Integration', () => {
    test('should generate proper Schema.org SearchAction markup', () => {
      const markup = StructuredDataMarkup.createSearchAction({
        target: '/photos/search?q={search_term_string}',
        queryInput: 'required name=search_term_string'
      });

      expect(markup['@context']).toBe('https://schema.org');
      expect(markup['@type']).toBe('SearchAction');
      expect(markup.target).toBe('/photos/search?q={search_term_string}');
      expect(markup['query-input']).toBe('required name=search_term_string');
    });

    test('should create ImageObject markup for photos', () => {
      const photo = mockPhotos[0];
      const markup = StructuredDataMarkup.createImageObject(photo);

      expect(markup['@type']).toBe('ImageObject');
      expect(markup.contentUrl).toBe('/photos/sunset-hawaii.jpg');
      expect(markup.thumbnailUrl).toBe('/thumbs/sunset-hawaii.jpg');
      expect(markup.name).toBe('sunset-hawaii.jpg');
      expect(markup.keywords).toEqual(['sunset', 'hawaii', 'beach']);
    });

    test('should embed structured data in DOM for agents', () => {
      const searchResults = {
        photos: mockPhotos,
        totalCount: 2,
        searchTime: 150
      };

      StructuredDataMarkup.embedInDOM(searchResults);

      const scriptTags = document.querySelectorAll('script[type="application/ld+json"]');
      expect(scriptTags.length).toBeGreaterThan(0);
      
      const structuredData = JSON.parse(scriptTags[0].textContent);
      expect(structuredData['@type']).toBe('SearchResultsPage');
    });
  });
});