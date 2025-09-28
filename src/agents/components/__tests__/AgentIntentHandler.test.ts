import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AgentIntentHandler } from '../AgentIntentHandler';
import { SemanticQuery, Entity } from '../../interfaces/semantic-query';

describe('AgentIntentHandler', () => {
  let intentHandler: AgentIntentHandler;

  beforeEach(() => {
    intentHandler = new AgentIntentHandler();
  });

  describe('Intent Classification', () => {
    it('should classify filter intent from natural language query', async () => {
      const query = 'show me photos with sunset';
      const result = await intentHandler.classifyIntent(query);
      
      expect(result.intent).toBe('filter');
      expect(result.confidence).toBeGreaterThan(0.7);
      expect(result.originalQuery).toBe(query);
    });

    it('should classify search intent', async () => {
      const query = 'find pictures of vacation';
      const result = await intentHandler.classifyIntent(query);
      
      expect(result.intent).toBe('search');
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    it('should classify album navigation intent', async () => {
      const query = 'open album vacation 2023';
      const result = await intentHandler.classifyIntent(query);
      
      expect(result.intent).toBe('navigate');
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    it('should classify photo management intent', async () => {
      const query = 'delete this photo';
      const result = await intentHandler.classifyIntent(query);
      
      expect(result.intent).toBe('manage');
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    it('should handle unknown intents with low confidence', async () => {
      const query = 'xyz random nonsense query';
      const result = await intentHandler.classifyIntent(query);
      
      expect(result.intent).toBe('unknown');
      expect(result.confidence).toBeLessThan(0.5);
    });

    it('should handle empty queries gracefully', async () => {
      const query = '';
      const result = await intentHandler.classifyIntent(query);
      
      expect(result.intent).toBe('unknown');
      expect(result.confidence).toBe(0);
    });
  });

  describe('Parameter Extraction', () => {
    it('should extract keyword entities from queries', () => {
      const query = 'show sunset and beach photos';
      const entities = intentHandler.extractEntities(query);
      
      const keywords = entities.filter(e => e.type === 'KEYWORD');
      expect(keywords).toHaveLength(2);
      expect(keywords[0].value).toBe('sunset');
      expect(keywords[1].value).toBe('beach');
    });

    it('should extract date entities', () => {
      const query = 'photos from 2023-01-15';
      const entities = intentHandler.extractEntities(query);
      
      const dates = entities.filter(e => e.type === 'DATE');
      expect(dates).toHaveLength(1);
      expect(dates[0].value).toBe('2023-01-15');
    });

    it('should extract location entities', () => {
      const query = 'photos taken in Paris';
      const entities = intentHandler.extractEntities(query);
      
      const locations = entities.filter(e => e.type === 'LOCATION');
      expect(locations).toHaveLength(1);
      expect(locations[0].value).toBe('Paris');
    });

    it('should extract album references', () => {
      const query = 'open vacation album';
      const entities = intentHandler.extractEntities(query);
      
      const albums = entities.filter(e => e.type === 'ALBUM');
      expect(albums).toHaveLength(1);
      expect(albums[0].value).toBe('vacation');
    });

    it('should provide confidence scores for entities', () => {
      const query = 'show sunset photos';
      const entities = intentHandler.extractEntities(query);
      
      entities.forEach(entity => {
        expect(entity.confidence).toBeGreaterThan(0);
        expect(entity.confidence).toBeLessThanOrEqual(1);
      });
    });

    it('should provide text span information', () => {
      const query = 'show sunset photos';
      const entities = intentHandler.extractEntities(query);
      
      const keywordEntity = entities.find(e => e.value === 'sunset');
      expect(keywordEntity).toBeDefined();
      expect(keywordEntity!.span).toEqual({
        start: 5,
        end: 11
      });
    });
  });

  describe('Confidence Scoring', () => {
    it('should provide high confidence for clear queries', async () => {
      const query = 'filter photos by sunset';
      const result = await intentHandler.classifyIntent(query);
      
      expect(result.confidence).toBeGreaterThan(0.8);
    });

    it('should provide medium confidence for ambiguous queries', async () => {
      const query = 'show me stuff';
      const result = await intentHandler.classifyIntent(query);
      
      expect(result.confidence).toBeGreaterThan(0.3);
      expect(result.confidence).toBeLessThan(0.7);
    });

    it('should provide low confidence for unclear queries', async () => {
      const query = 'asdf qwerty';
      const result = await intentHandler.classifyIntent(query);
      
      expect(result.confidence).toBeLessThan(0.3);
    });
  });

  describe('Ambiguity Handling', () => {
    it('should detect ambiguous queries', async () => {
      const query = 'show photos';
      const result = await intentHandler.classifyIntent(query);
      
      expect(result.needsClarification).toBe(true);
      expect(result.clarificationQuestions).toBeDefined();
      expect(result.clarificationQuestions!.length).toBeGreaterThan(0);
    });

    it('should suggest clarifying questions for vague queries', async () => {
      const query = 'show photos';
      const result = await intentHandler.classifyIntent(query);
      
      expect(result.clarificationQuestions).toContain('What type of photos would you like to see?');
    });

    it('should not require clarification for specific queries', async () => {
      const query = 'filter photos by keyword sunset from 2023';
      const result = await intentHandler.classifyIntent(query);
      
      expect(result.needsClarification).toBe(false);
    });
  });

  describe('Action Suggestions', () => {
    it('should suggest relevant actions for filter intents', async () => {
      const query = 'show sunset photos';
      const result = await intentHandler.classifyIntent(query);
      
      expect(result.suggestedActions).toBeDefined();
      expect(result.suggestedActions!.length).toBeGreaterThan(0);
      
      const filterAction = result.suggestedActions!.find(
        action => action.id === 'photo-gallery.filter'
      );
      expect(filterAction).toBeDefined();
    });

    it('should provide parameters for suggested actions', async () => {
      const query = 'filter by sunset and beach';
      const result = await intentHandler.classifyIntent(query);
      
      expect(result.parameters).toEqual({
        keywords: ['sunset', 'beach']
      });
    });

    it('should handle multiple possible actions', async () => {
      const query = 'search vacation photos';
      const result = await intentHandler.classifyIntent(query);
      
      expect(result.suggestedActions!.length).toBeGreaterThan(1);
    });
  });

  describe('Multi-format Support', () => {
    it('should handle voice-transcribed text with filler words', async () => {
      const query = 'um, show me, uh, photos with sunset please';
      const result = await intentHandler.classifyIntent(query);
      
      expect(result.intent).toBe('filter');
      const entities = intentHandler.extractEntities(query);
      const keywords = entities.filter(e => e.type === 'KEYWORD');
      expect(keywords.some(k => k.value === 'sunset')).toBe(true);
    });

    it('should handle casual language', async () => {
      const query = "hey can u show me pics from last year's trip?";
      const result = await intentHandler.classifyIntent(query);
      
      expect(result.intent).toBe('search');
    });

    it('should handle formal language', async () => {
      const query = 'Please display photographs containing sunset imagery from the year 2023';
      const result = await intentHandler.classifyIntent(query);
      
      expect(result.intent).toBe('filter');
    });
  });

  describe('Error Handling', () => {
    it('should handle null input gracefully', async () => {
      const result = await intentHandler.classifyIntent(null as any);
      
      expect(result.intent).toBe('unknown');
      expect(result.confidence).toBe(0);
    });

    it('should handle extremely long queries', async () => {
      const longQuery = 'show me photos '.repeat(100);
      const result = await intentHandler.classifyIntent(longQuery);
      
      expect(result).toBeDefined();
      expect(result.intent).toBeDefined();
    });

    it('should handle special characters in queries', async () => {
      const query = 'show photos with @#$%^&*() characters';
      const result = await intentHandler.classifyIntent(query);
      
      expect(result).toBeDefined();
      expect(result.intent).toBeDefined();
    });
  });

  describe('Performance', () => {
    it('should classify intents quickly', async () => {
      const start = Date.now();
      await intentHandler.classifyIntent('show sunset photos');
      const duration = Date.now() - start;
      
      // Should complete within 100ms for simple queries
      expect(duration).toBeLessThan(100);
    });

    it('should handle batch processing efficiently', async () => {
      const queries = [
        'show sunset photos',
        'filter by beach',
        'open vacation album',
        'delete this photo',
        'search for travel pics'
      ];

      const start = Date.now();
      const results = await Promise.all(
        queries.map(q => intentHandler.classifyIntent(q))
      );
      const duration = Date.now() - start;

      expect(results).toHaveLength(5);
      // Should process 5 queries within 300ms
      expect(duration).toBeLessThan(300);
    });
  });
});