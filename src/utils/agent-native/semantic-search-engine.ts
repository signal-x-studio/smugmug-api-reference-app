/**
 * Semantic Search Engine for Photo Discovery
 * 
 * Provides fast, semantic search capabilities over photo collections with
 * AI-generated metadata, fuzzy matching, and real-time filtering.
 */

import Fuse from 'fuse.js';
import { SearchParameters } from './photo-discovery-search';
import { Photo } from '../../types';

// Core data structures
export interface MetadataEntry {
  photoIds: string[];
  confidence: number;
  frequency: number;
}

export interface PhotoIndex {
  photos: Map<string, IndexedPhoto>;
  keywordIndex: Map<string, MetadataEntry>;
  objectIndex: Map<string, MetadataEntry>;
  sceneIndex: Map<string, MetadataEntry>;
  locationIndex: Map<string, MetadataEntry>;
  peopleIndex: Map<string, MetadataEntry>;
  temporalIndex: Map<string, string[]>; // year/month -> photo IDs
  cameraIndex: Map<string, MetadataEntry>;
}

export interface IndexedPhoto extends Photo {
  searchableText: string;
  indexedAt: Date;
}

export interface SearchResult {
  photos: SearchResultPhoto[];
  totalCount: number;
  searchTime: number;
  query: SearchParameters;
  searchMetadata: {
    appliedFilters: SearchParameters;
    matchedCriteria: string[];
    performanceMetrics: {
      indexLookupTime: number;
      fuzzyMatchTime: number;
      sortingTime: number;
    };
  };
}

export interface SearchResultPhoto extends Photo {
  relevanceScore: number;
  matchedCriteria: string[];
  highlightedFields: { [key: string]: string };
}

export interface SearchQuery extends SearchParameters {
  fuzzyMatch?: boolean;
  sortBy?: 'relevance' | 'date' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchConfig {
  performanceThreshold: number;
  maxResults: number;
  fuzzyMatchThreshold: number;
  debounceDelay?: number;
}

export interface SearchOptions {
  limit?: number;
  offset?: number;
  includeMetadata?: boolean;
}

/**
 * Semantic Search Engine Implementation
 */
export class SemanticSearchEngine {
  private index: PhotoIndex;
  private fuseInstances: Map<string, Fuse<any>>;
  private config: SearchConfig;
  private debounceTimer: NodeJS.Timeout | null = null;

  constructor(config: SearchConfig) {
    this.config = {
      debounceDelay: 300,
      ...config
    };
    this.index = this.initializeIndex();
    this.fuseInstances = new Map();
  }

  /**
   * Initialize empty search index
   */
  private initializeIndex(): PhotoIndex {
    return {
      photos: new Map(),
      keywordIndex: new Map(),
      objectIndex: new Map(),
      sceneIndex: new Map(),
      locationIndex: new Map(),
      peopleIndex: new Map(),
      temporalIndex: new Map(),
      cameraIndex: new Map()
    };
  }

  /**
   * Index photos for searching
   */
  async indexPhotos(photos: Photo[]): Promise<void> {
    const startTime = Date.now();

    // Reset index
    this.index = this.initializeIndex();

    for (const photo of photos) {
      await this.indexSinglePhoto(photo);
    }

    // Create Fuse instances for fuzzy searching
    this.createFuseInstances();

    const indexTime = Date.now() - startTime;
    console.log(`Indexed ${photos.length} photos in ${indexTime}ms`);
  }

  /**
   * Index a single photo
   */
  private async indexSinglePhoto(photo: Photo): Promise<void> {
    const indexedPhoto: IndexedPhoto = {
      ...photo,
      searchableText: this.createSearchableText(photo),
      indexedAt: new Date()
    };

    this.index.photos.set(photo.id, indexedPhoto);

    if (!photo.metadata) return;

    // Index keywords
    if (photo.metadata.keywords) {
      for (const keyword of photo.metadata.keywords) {
        this.addToIndex(this.index.keywordIndex, keyword, photo.id, photo.metadata.confidence || 1.0);
      }
    }

    // Index objects
    if (photo.metadata.objects) {
      for (const object of photo.metadata.objects) {
        this.addToIndex(this.index.objectIndex, object, photo.id, photo.metadata.confidence || 1.0);
      }
    }

    // Index scenes
    if (photo.metadata.scenes) {
      for (const scene of photo.metadata.scenes) {
        this.addToIndex(this.index.sceneIndex, scene, photo.id, photo.metadata.confidence || 1.0);
      }
    }

    // Index location
    if (photo.metadata.location) {
      this.addToIndex(this.index.locationIndex, photo.metadata.location, photo.id, photo.metadata.confidence || 1.0);
    }

    // Index people
    if (photo.metadata.people) {
      for (const person of photo.metadata.people) {
        this.addToIndex(this.index.peopleIndex, person, photo.id, photo.metadata.confidence || 1.0);
      }
    }

    // Index temporal data
    if (photo.metadata.takenAt) {
      const year = photo.metadata.takenAt.getFullYear().toString();
      const month = `${year}-${(photo.metadata.takenAt.getMonth() + 1).toString().padStart(2, '0')}`;
      
      this.addToTemporalIndex(year, photo.id);
      this.addToTemporalIndex(month, photo.id);
    }

    // Index camera
    if (photo.metadata.camera) {
      this.addToIndex(this.index.cameraIndex, photo.metadata.camera, photo.id, photo.metadata.confidence || 1.0);
    }
  }

  /**
   * Create searchable text from photo metadata
   */
  private createSearchableText(photo: Photo): string {
    const parts: string[] = [photo.filename];
    
    if (photo.metadata) {
      if (photo.metadata.keywords) parts.push(...photo.metadata.keywords);
      if (photo.metadata.objects) parts.push(...photo.metadata.objects);
      if (photo.metadata.scenes) parts.push(...photo.metadata.scenes);
      if (photo.metadata.people) parts.push(...photo.metadata.people);
      if (photo.metadata.location) parts.push(photo.metadata.location);
      if (photo.metadata.camera) parts.push(photo.metadata.camera);
    }

    return parts.join(' ').toLowerCase();
  }

  /**
   * Add entry to a specific index
   */
  private addToIndex(index: Map<string, MetadataEntry>, key: string, photoId: string, confidence: number): void {
    const normalizedKey = key.toLowerCase();
    const existing = index.get(normalizedKey);

    if (existing) {
      if (!existing.photoIds.includes(photoId)) {
        existing.photoIds.push(photoId);
        existing.frequency++;
        existing.confidence = Math.max(existing.confidence, confidence);
      }
    } else {
      index.set(normalizedKey, {
        photoIds: [photoId],
        confidence,
        frequency: 1
      });
    }
  }

  /**
   * Add entry to temporal index
   */
  private addToTemporalIndex(key: string, photoId: string): void {
    const existing = this.index.temporalIndex.get(key);
    if (existing) {
      if (!existing.includes(photoId)) {
        existing.push(photoId);
      }
    } else {
      this.index.temporalIndex.set(key, [photoId]);
    }
  }

  /**
   * Create Fuse instances for fuzzy searching
   */
  private createFuseInstances(): void {
    const fuseOptions = {
      threshold: 1 - this.config.fuzzyMatchThreshold,
      keys: ['key']
    };

    // Create fuse instances for each index
    const indexes = [
      { name: 'keywords', data: Array.from(this.index.keywordIndex.keys()) },
      { name: 'objects', data: Array.from(this.index.objectIndex.keys()) },
      { name: 'scenes', data: Array.from(this.index.sceneIndex.keys()) },
      { name: 'locations', data: Array.from(this.index.locationIndex.keys()) },
      { name: 'people', data: Array.from(this.index.peopleIndex.keys()) }
    ];

    for (const indexData of indexes) {
      const fuseData = indexData.data.map(key => ({ key }));
      this.fuseInstances.set(indexData.name, new Fuse(fuseData, fuseOptions));
    }
  }

  /**
   * Main search method
   */
  async search(query: SearchQuery, options: SearchOptions = {}): Promise<SearchResult> {
    const startTime = Date.now();
    const performanceMetrics = {
      indexLookupTime: 0,
      fuzzyMatchTime: 0,
      sortingTime: 0
    };

    // Get matching photo IDs from each criteria
    const lookupStart = Date.now();
    const matchingSets = await this.getMatchingPhotoSets(query);
    performanceMetrics.indexLookupTime = Date.now() - lookupStart;

    // Find intersection of all matching sets
    const matchingPhotoIds = this.intersectPhotoSets(matchingSets);

    // Convert to search result photos with relevance scoring
    const sortingStart = Date.now();
    const resultPhotos = this.createSearchResultPhotos(matchingPhotoIds, query, matchingSets);
    
    // Sort by relevance
    resultPhotos.sort((a, b) => b.relevanceScore - a.relevanceScore);
    performanceMetrics.sortingTime = Date.now() - sortingStart;

    // Apply pagination
    const { limit = this.config.maxResults, offset = 0 } = options;
    const paginatedPhotos = resultPhotos.slice(offset, offset + limit);

    const searchTime = Date.now() - startTime;

    return {
      photos: paginatedPhotos,
      totalCount: resultPhotos.length,
      searchTime,
      query,
      searchMetadata: {
        appliedFilters: query,
        matchedCriteria: Object.keys(matchingSets),
        performanceMetrics
      }
    };
  }

  /**
   * Get matching photo sets for each search criteria
   */
  private async getMatchingPhotoSets(query: SearchQuery): Promise<{ [key: string]: {photoIds: Set<string>, exactMatches: Set<string>} }> {
    const matchingSets: { [key: string]: {photoIds: Set<string>, exactMatches: Set<string>} } = {};

    // Semantic matching
    if (query.semantic) {
      if (query.semantic.objects) {
        const objectMatches = new Set<string>();
        const exactMatches = new Set<string>();
        for (const object of query.semantic.objects) {
          const matches = await this.findMatches(object, this.index.objectIndex, 'objects');
          matches.forEach(match => {
            objectMatches.add(match.id);
            if (match.isExact) exactMatches.add(match.id);
          });
        }
        if (objectMatches.size > 0) {
          matchingSets.objects = {photoIds: objectMatches, exactMatches};
        }
      }

      if (query.semantic.scenes) {
        const sceneMatches = new Set<string>();
        const exactMatches = new Set<string>();
        for (const scene of query.semantic.scenes) {
          const matches = await this.findMatches(scene, this.index.sceneIndex, 'scenes');
          matches.forEach(match => {
            sceneMatches.add(match.id);
            if (match.isExact) exactMatches.add(match.id);
          });
        }
        if (sceneMatches.size > 0) {
          matchingSets.scenes = {photoIds: sceneMatches, exactMatches};
        }
      }
    }

    // Spatial matching
    if (query.spatial?.location) {
      const matches = await this.findMatches(query.spatial.location, this.index.locationIndex, 'locations');
      if (matches.length > 0) {
        const locationMatches = new Set(matches.map(m => m.id));
        const exactMatches = new Set(matches.filter(m => m.isExact).map(m => m.id));
        matchingSets.location = {photoIds: locationMatches, exactMatches};
      }
    }

    // People matching
    if (query.people?.named_people) {
      const peopleMatches = new Set<string>();
      const exactMatches = new Set<string>();
      for (const person of query.people.named_people) {
        const matches = await this.findMatches(person, this.index.peopleIndex, 'people');
        matches.forEach(match => {
          peopleMatches.add(match.id);
          if (match.isExact) exactMatches.add(match.id);
        });
      }
      if (peopleMatches.size > 0) {
        matchingSets.people = {photoIds: peopleMatches, exactMatches};
      }
    }

    // Temporal matching
    if (query.temporal) {
      const temporalMatches = this.findTemporalMatches(query.temporal);
      if (temporalMatches.size > 0) {
        matchingSets.temporal = {photoIds: temporalMatches, exactMatches: temporalMatches}; // Temporal matches are always exact
      }
    }

    return matchingSets;
  }

  /**
   * Find matches for a term (exact and fuzzy)
   */
  private async findMatches(term: string, index: Map<string, MetadataEntry>, fuseKey: string): Promise<Array<{id: string, isExact: boolean}>> {
    const normalizedTerm = term.toLowerCase();
    const results: Array<{id: string, isExact: boolean}> = [];
    
    // Try exact match first
    const exactMatch = index.get(normalizedTerm);
    if (exactMatch) {
      exactMatch.photoIds.forEach(id => results.push({id, isExact: true}));
    }

    // Try fuzzy match if no exact match
    if (results.length === 0) {
      const fuse = this.fuseInstances.get(fuseKey);
      if (fuse) {
        const fuzzyResults = fuse.search(normalizedTerm);
        
        for (const result of fuzzyResults) {
          const entry = index.get(result.item.key);
          if (entry) {
            entry.photoIds.forEach(id => results.push({id, isExact: false}));
          }
        }
      }
    }

    return results;
  }

  /**
   * Find temporal matches
   */
  private findTemporalMatches(temporal: SearchParameters['temporal']): Set<string> {
    const matches = new Set<string>();

    if (temporal?.year) {
      const yearMatches = this.index.temporalIndex.get(temporal.year.toString());
      if (yearMatches) {
        yearMatches.forEach(id => matches.add(id));
      }
    }

    if (temporal?.start_month && temporal?.end_month) {
      // Handle month range logic here
      const startMonth = temporal.start_month.toLowerCase();
      const endMonth = temporal.end_month.toLowerCase();
      
      // Simplified month range matching
      const monthMap = {
        'january': '01', 'february': '02', 'march': '03',
        'april': '04', 'may': '05', 'june': '06',
        'july': '07', 'august': '08', 'september': '09',
        'october': '10', 'november': '11', 'december': '12'
      };
      
      const currentYear = new Date().getFullYear();
      const startNum = monthMap[startMonth];
      const endNum = monthMap[endMonth];
      
      if (startNum && endNum) {
        for (let month = parseInt(startNum); month <= parseInt(endNum); month++) {
          const monthKey = `${currentYear}-${month.toString().padStart(2, '0')}`;
          const monthMatches = this.index.temporalIndex.get(monthKey);
          if (monthMatches) {
            monthMatches.forEach(id => matches.add(id));
          }
        }
      }
    }

    return matches;
  }

  /**
   * Find intersection of photo sets
   */
  private intersectPhotoSets(sets: { [key: string]: {photoIds: Set<string>, exactMatches: Set<string>} }): string[] {
    const setValues = Object.values(sets).map(s => s.photoIds);
    
    if (setValues.length === 0) {
      return []; // No criteria, no results
    }

    if (setValues.length === 1) {
      return Array.from(setValues[0]);
    }

    // Find intersection
    let result = setValues[0];
    for (let i = 1; i < setValues.length; i++) {
      result = new Set([...result].filter(id => setValues[i].has(id)));
    }

    return Array.from(result);
  }

  /**
   * Create search result photos with relevance scoring
   */
  private createSearchResultPhotos(
    photoIds: string[], 
    query: SearchQuery, 
    matchingSets: { [key: string]: {photoIds: Set<string>, exactMatches: Set<string>} }
  ): SearchResultPhoto[] {
    return photoIds.map(id => {
      const photo = this.index.photos.get(id);
      if (!photo) throw new Error(`Photo ${id} not found in index`);

      const relevanceScore = this.calculateRelevanceScore(id, query, matchingSets);
      const matchedCriteria = Object.keys(matchingSets).filter(key => matchingSets[key].photoIds.has(id));

      return {
        ...photo,
        relevanceScore,
        matchedCriteria,
        highlightedFields: {} // TODO: Implement field highlighting
      };
    });
  }

  /**
   * Calculate relevance score for a photo
   */
  private calculateRelevanceScore(
    photoId: string, 
    query: SearchQuery, 
    matchingSets: { [key: string]: {photoIds: Set<string>, exactMatches: Set<string>} }
  ): number {
    const photo = this.index.photos.get(photoId);
    if (!photo) return 0;

    let score = 0;
    let criteriaCount = 0;
    let exactMatchCount = 0;

    // Base confidence score from metadata
    const baseConfidence = photo.metadata?.confidence || 0.5;
    score += baseConfidence * 0.3;

    // Score for each matching criteria
    Object.keys(matchingSets).forEach(criteria => {
      if (matchingSets[criteria].photoIds.has(photoId)) {
        criteriaCount++;
        
        // Higher score for exact matches
        if (matchingSets[criteria].exactMatches.has(photoId)) {
          exactMatchCount++;
          score += 0.25; // Exact match bonus
        } else {
          score += 0.15; // Fuzzy match
        }
      }
    });

    // Boost for multiple matching criteria
    if (criteriaCount > 1) {
      score += (criteriaCount - 1) * 0.1;
    }

    // Exact match boost
    if (exactMatchCount > 0) {
      score += exactMatchCount * 0.05;
    }

    // Normalize to 0-1 range
    return Math.min(score, 1.0);
  }

  /**
   * Debounced search for real-time filtering
   */
  searchWithDebounce(query: SearchQuery, options?: SearchOptions): Promise<SearchResult> {
    return new Promise((resolve) => {
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }

      this.debounceTimer = setTimeout(async () => {
        const result = await this.search(query, options);
        resolve(result);
      }, this.config.debounceDelay);
    });
  }

  /**
   * Execute search without debouncing (for testing)
   */
  async executeSearch(query: SearchQuery, options?: SearchOptions): Promise<SearchResult> {
    return this.search(query, options);
  }

  /**
   * Get current index (for testing)
   */
  getIndex(): PhotoIndex {
    return this.index;
  }
}

// Export utility types
export type { SearchParameters } from './photo-discovery-search';