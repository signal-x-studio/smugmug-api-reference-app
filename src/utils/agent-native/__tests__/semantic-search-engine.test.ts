/**
 * Tests for Semantic Search Engine
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { PhotoStatus } from '../../../types';
import { 
  SemanticSearchEngine,
  PhotoIndex,
  SearchResult,
  SearchQuery,
  MetadataEntry,
  SearchConfig
} from '../semantic-search-engine';
import { Photo } from '../../../types';

describe('Semantic Search Engine', () => {
  let searchEngine: SemanticSearchEngine;
  let mockPhotos: Photo[];

  beforeEach(() => {
    searchEngine = new SemanticSearchEngine({
      performanceThreshold: 3000,
      maxResults: 50,
      fuzzyMatchThreshold: 0.6
    });

    mockPhotos = [
      {
        id: 'photo-1',
        uri: '/api/v2/image/photo-1',
        imageUrl: '/photos/sunset-beach-vacation.jpg',
        filename: 'sunset-beach-vacation.jpg',
        status: PhotoStatus.ANALYZED,
        aiData: {
          title: 'Sunset Beach Vacation',
          description: 'Beautiful sunset over the beach during vacation',
          keywords: ['sunset', 'beach', 'vacation']
        },
        error: null,
        metadata: {
          keywords: ['sunset', 'beach', 'vacation', 'golden hour'],
          objects: ['ocean', 'sky', 'sand'],
          scenes: ['landscape', 'outdoor'],
          people: [],
          location: 'Hawaii',
          camera: 'Canon EOS R5',
          takenAt: new Date('2023-07-15T19:30:00Z'),
          confidence: 0.95
        }
      },
      {
        id: 'photo-2',
        uri: '/api/v2/image/photo-2',
        imageUrl: '/photos/family-portrait-park.jpg',
        filename: 'family-portrait-park.jpg',
        status: PhotoStatus.ANALYZED,
        aiData: {
          title: 'Family Portrait at Park',
          description: 'Family portrait taken at Central Park',
          keywords: ['family', 'portrait', 'park']
        },
        error: null,
        metadata: {
          keywords: ['family', 'portrait', 'park', 'children'],
          objects: ['trees', 'grass', 'people'],
          scenes: ['portrait', 'outdoor'],
          people: ['John', 'Sarah', 'Emma'],
          location: 'Central Park',
          camera: 'Nikon D850',
          takenAt: new Date('2023-08-20T14:15:00Z'),
          confidence: 0.88
        }
      },
      {
        id: 'photo-3',
        uri: '/api/v2/image/photo-3',
        imageUrl: '/photos/mountain-landscape-snow.jpg',
        filename: 'mountain-landscape-snow.jpg',
        status: PhotoStatus.ANALYZED,
        aiData: {
          title: 'Mountain Landscape with Snow',
          description: 'Beautiful snow-covered mountain landscape in the Swiss Alps',
          keywords: ['mountain', 'landscape', 'snow']
        },
        error: null,
        metadata: {
          keywords: ['mountain', 'landscape', 'snow', 'winter'],
          objects: ['peaks', 'snow', 'clouds'],
          scenes: ['landscape', 'outdoor'],
          people: [],
          location: 'Swiss Alps',
          camera: 'Sony A7R IV',
          takenAt: new Date('2023-12-10T11:45:00Z'),
          confidence: 0.92
        }
      }
    ];
  });

  describe('Metadata Indexing', () => {
    test('should create searchable index from photo metadata', async () => {
      await searchEngine.indexPhotos(mockPhotos);
      const index = searchEngine.getIndex();

      expect(index).toBeDefined();
      expect(index.photos).toHaveLength(3);
      expect(index.keywordIndex.get('sunset')).toBeDefined();
      expect(index.keywordIndex.get('family')).toBeDefined();
      expect(index.locationIndex.get('hawaii')).toBeDefined();
    });

    test('should handle AI-generated metadata confidence scores', async () => {
      await searchEngine.indexPhotos(mockPhotos);
      const index = searchEngine.getIndex();

      const sunsetEntry = index.keywordIndex.get('sunset');
      expect(sunsetEntry).toBeDefined();
      expect(sunsetEntry?.confidence).toBe(0.95);
      expect(sunsetEntry?.photoIds).toContain('photo-1');
    });

    test('should create efficient lookup structures', async () => {
      const largePhotoSet = Array.from({ length: 1000 }, (_, i) => ({
        ...mockPhotos[0],
        id: `photo-${i}`,
        filename: `test-photo-${i}.jpg`
      }));

      const startTime = Date.now();
      await searchEngine.indexPhotos(largePhotoSet);
      const indexTime = Date.now() - startTime;

      expect(indexTime).toBeLessThan(1000); // Should index 1000 photos in under 1s
    });
  });

  describe('Semantic Matching', () => {
    beforeEach(async () => {
      await searchEngine.indexPhotos(mockPhotos);
    });

    test('should match exact keywords', async () => {
      const results = await searchEngine.search({
        semantic: { keywords: ['sunset'] },
        spatial: {},
        temporal: {},
        people: {}
      });

      expect(results.photos).toHaveLength(1);
      expect(results.photos[0].id).toBe('photo-1');
      expect(results.totalCount).toBe(1);
    });

    test('should support fuzzy matching for misspelled terms', async () => {
      const results = await searchEngine.search({
        semantic: { keywords: ['sunest'] }, // Misspelled 'sunset'
        spatial: {},
        temporal: {},
        people: {}
      });

      expect(results.photos).toHaveLength(1);
      expect(results.photos[0].id).toBe('photo-1');
      expect(results.photos[0].relevanceScore).toBeLessThan(1.0);
    });

    test('should match related terms and synonyms', async () => {
      const results = await searchEngine.search({
        semantic: { objects: ['ocean', 'sea'] },
        spatial: {},
        temporal: {},
        people: {}
      });

      expect(results.photos.length).toBeGreaterThan(0);
      expect(results.photos[0].id).toBe('photo-1');
    });

    test('should combine multiple search criteria', async () => {
      const results = await searchEngine.search({
        semantic: { scenes: ['outdoor'] },
        spatial: { location: 'Hawaii' },
        temporal: {},
        people: {}
      });

      expect(results.photos).toHaveLength(1);
      expect(results.photos[0].id).toBe('photo-1');
    });
  });

  describe('Search Ranking and Relevance Scoring', () => {
    beforeEach(async () => {
      await searchEngine.indexPhotos(mockPhotos);
    });

    test('should score results based on metadata confidence', async () => {
      const results = await searchEngine.search({
        semantic: { scenes: ['outdoor'] },
        spatial: {},
        temporal: {},
        people: {}
      });

      // Should be sorted by relevance (confidence × match strength)
      expect(results.photos[0].relevanceScore).toBeGreaterThan(results.photos[1].relevanceScore);
    });

    test('should weight exact matches higher than fuzzy matches', async () => {
      const exactResults = await searchEngine.search({
        semantic: { keywords: ['sunset'] },
        spatial: {},
        temporal: {},
        people: {}
      });

      const fuzzyResults = await searchEngine.search({
        semantic: { keywords: ['sunest'] },
        spatial: {},
        temporal: {},
        people: {}
      });

      expect(exactResults.photos[0].relevanceScore).toBeGreaterThan(
        fuzzyResults.photos[0].relevanceScore
      );
    });

    test('should boost scores for multiple matching criteria', async () => {
      const singleCriteria = await searchEngine.search({
        semantic: { keywords: ['sunset'] },
        spatial: {},
        temporal: {},
        people: {}
      });

      const multipleCriteria = await searchEngine.search({
        semantic: { keywords: ['sunset'], scenes: ['landscape'] },
        spatial: { location: 'Hawaii' },
        temporal: {},
        people: {}
      });

      expect(multipleCriteria.photos[0].relevanceScore).toBeGreaterThan(
        singleCriteria.photos[0].relevanceScore
      );
    });
  });

  describe('Performance Optimization', () => {
    test('should complete searches in under 3 seconds', async () => {
      const largePhotoSet = Array.from({ length: 5000 }, (_, i) => ({
        ...mockPhotos[i % 3],
        id: `photo-${i}`,
        filename: `test-photo-${i}.jpg`
      }));

      await searchEngine.indexPhotos(largePhotoSet);

      const startTime = Date.now();
      const results = await searchEngine.search({
        semantic: { objects: ['sunset'] },
        spatial: {},
        temporal: {},
        people: {}
      });
      const searchTime = Date.now() - startTime;

      expect(searchTime).toBeLessThan(3000);
      expect(results.searchTime).toBeLessThan(3000);
    });

    test('should handle concurrent search requests efficiently', async () => {
      await searchEngine.indexPhotos(mockPhotos);

      const searches = Array.from({ length: 10 }, () => 
        searchEngine.search({
          semantic: { scenes: ['outdoor'] },
          spatial: {},
          temporal: {},
          people: {}
        })
      );

      const startTime = Date.now();
      const results = await Promise.all(searches);
      const totalTime = Date.now() - startTime;

      expect(totalTime).toBeLessThan(5000); // 10 concurrent searches in under 5s
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result.photos.length).toBeGreaterThan(0);
      });
    });

    test('should implement result pagination for large result sets', async () => {
      const manyPhotos = Array.from({ length: 100 }, (_, i) => ({
        ...mockPhotos[0],
        id: `photo-${i}`,
        filename: `outdoor-photo-${i}.jpg`
      }));

      await searchEngine.indexPhotos(manyPhotos);

      const page1 = await searchEngine.search({
        semantic: { scenes: ['outdoor'] },
        spatial: {},
        temporal: {},
        people: {}
      }, { limit: 20, offset: 0 });

      const page2 = await searchEngine.search({
        semantic: { scenes: ['outdoor'] },
        spatial: {},
        temporal: {},
        people: {}
      }, { limit: 20, offset: 20 });

      expect(page1.photos).toHaveLength(20);
      expect(page2.photos).toHaveLength(20);
      expect(page1.photos[0].id).not.toBe(page2.photos[0].id);
      expect(page1.totalCount).toBe(100);
    });
  });

  describe('Real-time Filtering', () => {
    beforeEach(async () => {
      await searchEngine.indexPhotos(mockPhotos);
    });

    test('should debounce rapid search requests', async () => {
      const searchSpy = vi.spyOn(searchEngine, 'executeSearch');
      
      // Simulate rapid typing
      searchEngine.searchWithDebounce({
        semantic: { objects: ['s'] },
        spatial: {},
        temporal: {},
        people: {}
      });
      searchEngine.searchWithDebounce({
        semantic: { objects: ['su'] },
        spatial: {},
        temporal: {},
        people: {}
      });
      searchEngine.searchWithDebounce({
        semantic: { objects: ['sun'] },
        spatial: {},
        temporal: {},
        people: {}
      });

      // Wait for debounce
      await new Promise(resolve => setTimeout(resolve, 350));

      expect(searchSpy).toHaveBeenCalledTimes(1);
    });

    test('should apply progressive filters efficiently', async () => {
      let results = await searchEngine.search({
        semantic: { scenes: ['outdoor'] },
        spatial: {},
        temporal: {},
        people: {}
      });

      expect(results.photos.length).toBeGreaterThan(1);

      // Add location filter
      results = await searchEngine.search({
        semantic: { scenes: ['outdoor'] },
        spatial: { location: 'Hawaii' },
        temporal: {},
        people: {}
      });

      expect(results.photos).toHaveLength(1);
      expect(results.photos[0].id).toBe('photo-1');
    });
  });

  describe('Visual Content Analysis Integration', () => {
    test('should integrate with AI-generated visual metadata', async () => {
      const photoWithAIAnalysis = {
        ...mockPhotos[0],
        metadata: {
          ...mockPhotos[0].metadata,
          aiAnalysis: {
            dominantColors: ['orange', 'blue', 'yellow'],
            composition: 'rule-of-thirds',
            lighting: 'golden-hour',
            mood: 'peaceful',
            technicalQuality: 0.92
          }
        }
      };

      await searchEngine.indexPhotos([photoWithAIAnalysis]);

      const results = await searchEngine.search({
        semantic: { mood: ['peaceful'] },
        spatial: {},
        temporal: {},
        people: {}
      });

      expect(results.photos).toHaveLength(1);
      expect(results.photos[0].id).toBe('photo-1');
    });

    test('should handle missing or incomplete AI metadata gracefully', async () => {
      const incompletePhoto = {
        ...mockPhotos[0],
        metadata: {
          keywords: ['test'],
          // Missing other metadata fields
        }
      };

      await expect(searchEngine.indexPhotos([incompletePhoto])).resolves.not.toThrow();
      
      const results = await searchEngine.search({
        semantic: { keywords: ['test'] },
        spatial: {},
        temporal: {},
        people: {}
      });

      expect(results.photos).toHaveLength(1);
    });
  });

  describe('Search Result Data Structures', () => {
    beforeEach(async () => {
      await searchEngine.indexPhotos(mockPhotos);
    });

    test('should return properly structured search results', async () => {
      const results = await searchEngine.search({
        semantic: { keywords: ['sunset'] },
        spatial: {},
        temporal: {},
        people: {}
      });

      expect(results).toMatchObject({
        photos: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            filename: expect.any(String),
            metadata: expect.any(Object),
            relevanceScore: expect.any(Number)
          })
        ]),
        totalCount: expect.any(Number),
        searchTime: expect.any(Number),
        query: expect.any(Object)
      });
    });

    test('should include search metadata in results', async () => {
      const results = await searchEngine.search({
        semantic: { objects: ['sunset'] },
        spatial: { location: 'Hawaii' },
        temporal: {},
        people: {}
      });

      expect(results.searchMetadata).toBeDefined();
      expect(results.searchMetadata).toMatchObject({
        appliedFilters: expect.any(Object),
        matchedCriteria: expect.any(Array),
        performanceMetrics: expect.any(Object)
      });
    });
  });
});