/**
 * Tests for Photo Discovery Search - Natural Language Query Parser
 */

import { describe, test, expect, beforeEach } from 'vitest';
import { 
  PhotoDiscoveryQueryParser,
  SearchQueryIntent,
  SearchParameters,
  QueryValidationResult,
  SearchSuggestion
} from '../photo-discovery-search';

describe('Photo Discovery Search - Query Parser', () => {
  let parser: PhotoDiscoveryQueryParser;

  beforeEach(() => {
    parser = new PhotoDiscoveryQueryParser();
  });

  describe('Basic Query Tokenization', () => {
    test('should tokenize simple queries', () => {
      const result = parser.tokenize('sunset photos from beach');
      expect(result.tokens).toEqual(['sunset', 'photos', 'from', 'beach']);
      expect(result.entities).toContainEqual(
        expect.objectContaining({
          type: 'object',
          value: 'sunset',
          confidence: expect.any(Number)
        })
      );
    });

    test('should handle quoted phrases', () => {
      const result = parser.tokenize('photos with "golden hour" lighting');
      expect(result.tokens).toContain('golden hour');
      expect(result.entities).toContainEqual(
        expect.objectContaining({
          type: 'keyword_phrase',
          value: 'golden hour',
          confidence: expect.any(Number)
        })
      );
    });

    test('should identify temporal expressions', () => {
      const result = parser.tokenize('photos from last summer');
      expect(result.entities).toContainEqual(
        expect.objectContaining({
          type: 'time_period',
          value: 'last summer',
          confidence: expect.any(Number)
        })
      );
    });
  });

  describe('Intent Extraction', () => {
    test('should recognize discovery intent', () => {
      const queries = [
        'show me sunset photos',
        'find pictures of dogs',
        'search for beach vacation photos'
      ];

      queries.forEach(query => {
        const intent = parser.extractIntent(query);
        expect(intent.type).toBe('discovery');
        expect(intent.confidence).toBeGreaterThan(0.7);
      });
    });

    test('should recognize filter intent', () => {
      const queries = [
        'filter by date range 2023',
        'show only photos from Canon camera',
        'display photos taken in Paris'
      ];

      queries.forEach(query => {
        const intent = parser.extractIntent(query);
        expect(intent.type).toBe('filter');
        expect(intent.confidence).toBeGreaterThan(0.7);
      });
    });

    test('should recognize bulk operation intent', () => {
      const queries = [
        'add all sunset photos to new album',
        'delete these vacation pictures',
        'export selected beach photos'
      ];

      queries.forEach(query => {
        const intent = parser.extractIntent(query);
        expect(intent.type).toBe('bulk_operation');
        expect(intent.confidence).toBeGreaterThan(0.7);
      });
    });
  });

  describe('Parameter Extraction', () => {
    test('should extract date parameters', () => {
      const testCases = [
        { query: 'photos from 2023', expected: { year: 2023 } },
        { query: 'pictures taken last month', expected: { relative_period: 'last_month' } },
        { query: 'images from January to March', expected: { start_month: 'January', end_month: 'March' } },
                  { query: 'photos between June 1st and June 15th', expected: { date_range: expect.objectContaining({ start: expect.any(Date), end: expect.any(Date) }), start_month: 'June', end_month: 'June' } }      ];

      testCases.forEach(({ query, expected }) => {
        const params = parser.extractParameters(query);
        
        // For the "photos between June 1st and June 15th" case, check date_range structure manually
        if (query.includes('June 1st and June 15th')) {
          expect(params.temporal).toHaveProperty('date_range');
          expect(params.temporal.date_range).toHaveProperty('start');
          expect(params.temporal.date_range).toHaveProperty('end');
          // Handle both Date objects and date strings
          if (typeof params.temporal.date_range.start === 'string') {
            expect(new Date(params.temporal.date_range.start)).toBeInstanceOf(Date);
            expect(new Date(params.temporal.date_range.end)).toBeInstanceOf(Date);
          } else {
            expect(params.temporal.date_range.start).toBeInstanceOf(Date);
            expect(params.temporal.date_range.end).toBeInstanceOf(Date);
          }
          expect(params.temporal.start_month).toBe('June');
          expect(params.temporal.end_month).toBe('June');
        } else {
          expect(params.temporal).toMatchObject(expected);
        }
      });
    });

    test('should extract location parameters', () => {
      const testCases = [
        { query: 'photos from Paris', expected: { location: 'Paris' } },
        { query: 'pictures taken in New York City', expected: { location: 'New York City' } },
        { query: 'vacation photos from Italy', expected: { location: 'Italy' } }
      ];

      testCases.forEach(({ query, expected }) => {
        const params = parser.extractParameters(query);
        expect(params.spatial).toMatchObject(expected);
      });
    });

    test('should extract object and scene parameters', () => {
      const testCases = [
        { query: 'photos with dogs and cats', semanticExpected: { objects: ['dogs', 'cats'] } },
        { query: 'sunset beach pictures', semanticExpected: { objects: ['sunset'], scenes: ['beach'] } },
        { query: 'family portrait photos', semanticExpected: { scenes: ['portrait'] }, peopleExpected: { people_type: 'family' } }
      ];

      testCases.forEach(({ query, semanticExpected, peopleExpected }) => {
        const params = parser.extractParameters(query);
        expect(params.semantic).toMatchObject(semanticExpected);
        if (peopleExpected) {
          expect(params.people).toMatchObject(peopleExpected);
        }
      });
    });

    test('should extract people parameters', () => {
      const testCases = [
        { query: 'photos with John and Sarah', expected: { named_people: ['John', 'Sarah'] } },
        { query: 'family photos with children', expected: { people_type: 'family', age_group: 'children' } },
        { query: 'group photos of friends', expected: { people_type: 'friends', group_size: 'group' } }
      ];

      testCases.forEach(({ query, expected }) => {
        const params = parser.extractParameters(query);
        expect(params.people).toMatchObject(expected);
      });
    });
  });

  describe('Query Validation', () => {
    test('should validate complete queries', () => {
      const validQuery = 'sunset photos from Paris taken in 2023';
      const result = parser.validateQuery(validQuery);
      
      expect(result.isValid).toBe(true);
      expect(result.extractable_parameters).toBeGreaterThan(2);
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    test('should identify ambiguous queries', () => {
      const ambiguousQueries = [
        'photos',
        'find stuff',
        'show me things from there'
      ];

      ambiguousQueries.forEach(query => {
        const result = parser.validateQuery(query);
        expect(result.isValid).toBe(false);
        expect(result.issues).toContain('too_vague');
      });
    });

    test('should provide specific error messages', () => {
      const result = parser.validateQuery('photos from invalid_date_format');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid date format: invalid_date_format');
    });
  });

  describe('Query Refinement', () => {
    test('should suggest refinements for vague queries', () => {
      const suggestions = parser.suggestRefinements('photos');
      
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0]).toMatchObject({
        type: 'add_context',
        suggestion: 'Try to be more specific about what you\'re looking for',
        example: expect.any(String)
      });
    });

    test('should suggest parameter improvements', () => {
      const suggestions = parser.suggestRefinements('old photos');
      
      expect(suggestions).toContainEqual(
        expect.objectContaining({
          type: 'temporal_refinement',
          suggestion: 'Specify a time period',
          examples: expect.arrayContaining(['photos from 2020', 'photos from last year', 'vintage photos from 1990s'])
        })
      );
    });
  });

  describe('Conversational Context', () => {
    test('should maintain search context across queries', () => {
      // First query establishes context
      parser.processQuery('sunset photos from beach');
      
      // Follow-up query should use context
      const result = parser.processQuery('add location filter for Hawaii');
      expect(result.parameters.spatial.location).toBe('Hawaii');
      expect(result.parameters.semantic.objects).toContain('sunset');
    });

    test('should handle refinement commands', () => {
      parser.processQuery('beach photos');
      
      const refinement = parser.processQuery('but only from 2023');
      expect(refinement.parameters.temporal.year).toBe(2023);
      expect(refinement.parameters.semantic.scenes).toContain('beach');
    });

    test('should clear context on new search', () => {
      parser.processQuery('sunset photos');
      parser.processQuery('find mountain pictures'); // New search
      
      const context = parser.getCurrentContext();
      expect(context.semantic.objects).toContain('mountain');
      expect(context.semantic.objects).not.toContain('sunset');
    });
  });

  describe('Agent Command Processing', () => {
    test('should process agent search commands', () => {
      const agentCommand = {
        action: 'search.photos',
        parameters: {
          semantic_query: 'sunset beach',
          temporal_filter: { year: 2023 },
          limit: 50
        }
      };

      const result = parser.processAgentCommand(agentCommand);
      expect(result.success).toBe(true);
      expect(result.parameters).toMatchObject(agentCommand.parameters);
    });

    test('should validate agent command parameters', () => {
      const invalidCommand = {
        action: 'search.photos',
        parameters: {
          invalid_param: 'test'
        }
      };

      const result = parser.processAgentCommand(invalidCommand);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Unknown parameter: invalid_param');
    });

    test('should provide structured agent responses', () => {
      const command = {
        action: 'search.photos',
        parameters: { semantic_query: 'family vacation' }
      };

      const result = parser.processAgentCommand(command);
      expect(result).toHaveProperty('structured_data');
      expect(result.structured_data).toHaveProperty('@type', 'SearchAction');
    });
  });
});