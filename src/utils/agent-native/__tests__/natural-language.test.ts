/**
 * Tests for Natural Language API Development
 */

import { vi } from 'vitest';
import { 
  NaturalLanguageProcessor,
  CommandParser,
  IntentRecognizer,
  ParameterExtractor,
  CommandIntent,
  ParsedCommand,
  NLProcessingResult
} from '../natural-language';
import { Photo, Album, PhotoStatus } from '../../../types';

describe('Natural Language API Development', () => {
  let nlProcessor: NaturalLanguageProcessor;
  let commandParser: CommandParser;
  let intentRecognizer: IntentRecognizer;
  let parameterExtractor: ParameterExtractor;

  beforeEach(() => {
    nlProcessor = new NaturalLanguageProcessor();
    commandParser = new CommandParser();
    intentRecognizer = new IntentRecognizer();
    parameterExtractor = new ParameterExtractor();
  });

  describe('IntentRecognizer', () => {
    test('should recognize photo selection intents', () => {
      const commands = [
        'select photo beach-sunset.jpg',
        'choose the first photo',
        'pick photo with id photo-123',
        'click on the sunset photo'
      ];

      commands.forEach(command => {
        const intent = intentRecognizer.recognize(command);
        expect(intent.action).toBe('photo.select');
        expect(intent.confidence).toBeGreaterThan(0.7);
      });
    });

    test('should recognize album creation intents', () => {
      const commands = [
        'create a new album called Vacation',
        'make an album named Beach Photos',
        'add album Family Trip with description Summer vacation',
        'new album Pets'
      ];

      commands.forEach(command => {
        const intent = intentRecognizer.recognize(command);
        expect(intent.action).toBe('album.create');
        expect(intent.confidence).toBeGreaterThan(0.7);
      });
    });

    test('should recognize photo analysis intents', () => {
      const commands = [
        'analyze photo beach-sunset.jpg',
        'generate metadata for photo-123',
        'add keywords to the selected photos',
        'process this image with AI'
      ];

      commands.forEach(command => {
        const intent = intentRecognizer.recognize(command);
        expect(intent.action).toBe('photo.analyze');
        expect(intent.confidence).toBeGreaterThan(0.7);
      });
    });

    test('should recognize search and filter intents', () => {
      const commands = [
        'find photos with sunset keyword',
        'show me beach photos',
        'filter by landscape images',
        'search for vacation pictures'
      ];

      commands.forEach(command => {
        const intent = intentRecognizer.recognize(command);
        expect(intent.action).toBe('photo.search');
        expect(intent.confidence).toBeGreaterThan(0.6);
      });
    });

    test('should handle ambiguous commands with lower confidence', () => {
      const ambiguousCommands = [
        'do something',
        'help me',
        'what can you do'
      ];

      ambiguousCommands.forEach(command => {
        const intent = intentRecognizer.recognize(command);
        expect(intent.confidence).toBeLessThan(0.5);
      });
    });
  });

  describe('ParameterExtractor', () => {
    test('should extract photo IDs from commands', () => {
      const testCases = [
        { command: 'select photo photo-123', expected: { photoId: 'photo-123' } },
        { command: 'analyze beach-sunset.jpg', expected: { photoId: 'beach-sunset.jpg' } },
        { command: 'delete photo with id img_001', expected: { photoId: 'img_001' } }
      ];

      testCases.forEach(({ command, expected }) => {
        const params = parameterExtractor.extract(command, 'photo.select');
        expect(params).toMatchObject(expected);
      });
    });

    test('should extract album names and descriptions', () => {
      const testCases = [
        {
          command: 'create album Vacation Photos',
          expected: { name: 'Vacation Photos' }
        },
        {
          command: 'make album "Beach Trip" with description "Summer 2025 beach vacation"',
          expected: { name: 'Beach Trip', description: 'Summer 2025 beach vacation' }
        },
        {
          command: 'new album Family Reunion description Our annual family get-together',
          expected: { name: 'Family Reunion', description: 'Our annual family get-together' }
        }
      ];

      testCases.forEach(({ command, expected }) => {
        const params = parameterExtractor.extract(command, 'album.create');
        expect(params).toMatchObject(expected);
      });
    });

    test('should extract keywords and search terms', () => {
      const testCases = [
        {
          command: 'find photos with keywords sunset, beach, landscape',
          expected: { keywords: ['sunset', 'beach', 'landscape'] }
        },
        {
          command: 'search for vacation photos',
          expected: { query: 'vacation photos' }
        },
        {
          command: 'filter by nature and wildlife',
          expected: { keywords: ['nature', 'wildlife'] }
        }
      ];

      testCases.forEach(({ command, expected }) => {
        const params = parameterExtractor.extract(command, 'photo.search');
        expect(params).toMatchObject(expected);
      });
    });

    test('should extract numeric parameters', () => {
      const testCases = [
        {
          command: 'select the first 5 photos',
          expected: { count: 5, position: 'first' }
        },
        {
          command: 'analyze last 3 uploaded images',
          expected: { count: 3, position: 'last' }
        },
        {
          command: 'show page 2 of results',
          expected: { page: 2 }
        }
      ];

      testCases.forEach(({ command, expected }) => {
        const params = parameterExtractor.extract(command, 'photo.batch');
        expect(params).toMatchObject(expected);
      });
    });
  });

  describe('CommandParser', () => {
    test('should parse complete photo selection commands', () => {
      const command = 'select photo beach-sunset.jpg';
      const parsed = commandParser.parse(command);

      expect(parsed.intent.action).toBe('photo.select');
      expect(parsed.parameters.photoId).toBe('beach-sunset.jpg');
      expect(parsed.confidence).toBeGreaterThan(0.8);
    });

    test('should parse complex album creation commands', () => {
      const command = 'create new album "Vacation 2025" with description "Beach photos from summer vacation"';
      const parsed = commandParser.parse(command);

      expect(parsed.intent.action).toBe('album.create');
      expect(parsed.parameters.name).toBe('Vacation 2025');
      expect(parsed.parameters.description).toBe('Beach photos from summer vacation');
      expect(parsed.confidence).toBeGreaterThan(0.8);
    });

    test('should parse batch operations', () => {
      const command = 'analyze all selected photos with custom instructions "focus on nature elements"';
      const parsed = commandParser.parse(command);

      expect(parsed.intent.action).toBe('photo.batchAnalyze');
      expect(parsed.parameters.target).toBe('selected');
      expect(parsed.parameters.customInstructions).toBe('focus on nature elements');
    });

    test('should handle parsing errors gracefully', () => {
      const invalidCommands = [
        '',
        'random nonsense text',
        'do the thing with the stuff'
      ];

      invalidCommands.forEach(command => {
        const parsed = commandParser.parse(command);
        expect(parsed.confidence).toBeLessThan(0.3);
        expect(parsed.errors).toBeDefined();
        expect(parsed.errors.length).toBeGreaterThan(0);
      });
    });
  });

  describe('NaturalLanguageProcessor', () => {
    test('should process and execute photo commands', async () => {
      const mockPhotoState = {
        current: {
          photos: [
            { id: 'photo-123', filename: 'beach.jpg', title: 'Beach Photo' },
            { id: 'photo-456', filename: 'sunset.jpg', title: 'Sunset Photo' }
          ]
        },
        actions: {
          selectPhoto: vi.fn()
        }
      };

      // Mock global state
      global.window = { agentState: { photoGrid: mockPhotoState } };

      const result = await nlProcessor.processCommand('select photo beach.jpg');

      expect(result.success).toBe(true);
      expect(result.executedAction).toBe('photo.select');
      expect(result.parameters.photoId).toBe('beach.jpg');
    });

    test('should handle command suggestions for unclear intents', async () => {
      const result = await nlProcessor.processCommand('do something with photos');

      expect(result.success).toBe(false);
      expect(result.suggestions).toBeDefined();
      expect(result.suggestions.length).toBeGreaterThan(0);
      expect(result.suggestions[0]).toContain('select');
    });

    test('should provide help for unrecognized commands', async () => {
      const result = await nlProcessor.processCommand('help me with photo management');

      expect(result.success).toBe(true);
      expect(result.helpResponse).toBeDefined();
      expect(result.helpResponse).toContain('photo');
      expect(result.helpResponse).toContain('album');
    });

    test('should handle confirmation dialogs for destructive actions', async () => {
      const mockAlbumState = {
        current: { albums: [{ id: 'album-123', name: 'Test Album' }] },
        actions: { deleteAlbum: vi.fn() }
      };

      global.window = { agentState: { albumList: mockAlbumState } };

      const result = await nlProcessor.processCommand('delete album Test Album');

      expect(result.success).toBe(false);
      expect(result.requiresConfirmation).toBe(true);
      expect(result.confirmationPrompt).toContain('delete');
      expect(result.confirmationPrompt).toContain('Test Album');
    });
  });

  describe('Context Awareness', () => {
    test('should use current selection as context', async () => {
      const mockState = {
        current: {
          photos: [{ id: 'photo-123', filename: 'test.jpg' }],
          selectedIds: ['photo-123']
        },
        actions: { selectPhoto: vi.fn() }
      };

      global.window = { agentState: { photoGrid: mockState } };

      const result = await nlProcessor.processCommand('analyze selected photos');

      expect(result.success).toBe(true);
      expect(result.parameters.photoIds).toEqual(['photo-123']);
    });

    test('should resolve relative references', async () => {
      const mockState = {
        current: {
          photos: [
            { id: 'photo-1', uploadDate: '2025-01-01' },
            { id: 'photo-2', uploadDate: '2025-01-02' },
            { id: 'photo-3', uploadDate: '2025-01-03' }
          ]
        },
        actions: { selectPhoto: vi.fn() }
      };

      global.window = { agentState: { photoGrid: mockState } };

      const result = await nlProcessor.processCommand('select the latest photo');

      expect(result.success).toBe(true);
      expect(result.parameters.photoId).toBe('photo-3'); // Most recent
    });

    test('should handle multi-step operations', async () => {
      const processor = new NaturalLanguageProcessor();
      
      // Start multi-step operation
      let result = await processor.processCommand('select all beach photos and analyze them');

      expect(result.success).toBe(true);
      expect(result.multiStep).toBe(true);
      expect(result.steps).toHaveLength(2);
      expect(result.steps[0].action).toBe('photo.filterByKeywords');
      expect(result.steps[1].action).toBe('photo.batchAnalyze');
    });
  });

  describe('Error Handling and Feedback', () => {
    test('should provide helpful error messages', async () => {
      const result = await nlProcessor.processCommand('select photo nonexistent-id');

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
      expect(result.suggestions).toBeDefined();
    });

    test('should handle parameter validation errors', async () => {
      const result = await nlProcessor.processCommand('create album');

      expect(result.success).toBe(false);
      expect(result.error).toContain('name');
      expect(result.suggestions[0]).toContain('create album "Album Name"');
    });

    test('should provide progress updates for long operations', async () => {
      const progressCallback = vi.fn();
      
      const result = await nlProcessor.processCommand(
        'analyze all photos in album Vacation',
        { onProgress: progressCallback }
      );

      expect(progressCallback).toHaveBeenCalled();
      expect(progressCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          status: expect.stringContaining('progress')
        })
      );
    });
  });

  describe('Integration Tests', () => {
    test('should handle complete workflow commands', async () => {
      const mockStates = {
        photoGrid: {
          current: { photos: [], selectedIds: [] },
          actions: { 
            filterByKeywords: vi.fn(),
            selectMultiple: vi.fn(),
            batchAnalyze: vi.fn()
          }
        },
        albumList: {
          current: { albums: [] },
          actions: { createAlbum: vi.fn() }
        }
      };

      global.window = { agentState: mockStates };

      const commands = [
        'create album Processed Photos',
        'find all sunset photos',
        'select first 10 results',
        'analyze selected photos',
        'move analyzed photos to Processed Photos album'
      ];

      const results = [];
      for (const command of commands) {
        const result = await nlProcessor.processCommand(command);
        results.push(result);
      }

      // Verify workflow execution
      expect(results.every(r => r.success)).toBe(true);
      expect(mockStates.albumList.actions.createAlbum).toHaveBeenCalled();
      expect(mockStates.photoGrid.actions.filterByKeywords).toHaveBeenCalled();
    });

    test('should handle conversational context', async () => {
      const processor = new NaturalLanguageProcessor();
      
      // Build conversation context
      await processor.processCommand('select album Vacation Photos');
      await processor.processCommand('show me the beach photos'); // Should filter within selected album
      const result = await processor.processCommand('analyze them'); // Should analyze filtered photos

      expect(result.success).toBe(true);
      expect(result.executedAction).toBe('photo.batchAnalyze');
    });
  });
});