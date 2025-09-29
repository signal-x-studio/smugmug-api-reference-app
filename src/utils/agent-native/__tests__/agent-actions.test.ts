/**
 * Tests for Agent Action Registry Infrastructure
 */

import { vi } from 'vitest';
import { 
  AgentActionRegistry,
  AgentActionExecutor,
  createAgentAction,
  ActionResult,
  AgentAction,
  ActionParameter
} from '../agent-actions';
import { Photo, Album, PhotoStatus } from '../../../types';

describe('Agent Action Registry Infrastructure', () => {
  beforeEach(() => {
    // Reset global state before each test
    (global as any).window = {
      agentActions: {},
      agentActionHistory: []
    };
  });

  describe('AgentActionRegistry', () => {
    test('should register action with complete metadata', () => {
      const mockAction: AgentAction = {
        name: 'photo.select',
        description: 'Select a photo by ID',
        parameters: {
          photoId: { type: 'string', required: true, description: 'Photo identifier' }
        },
        execute: vi.fn(),
        humanEquivalent: 'Click on photo card'
      };

      AgentActionRegistry.register('photo.select', mockAction);

      expect(window.agentActions['photo.select']).toBeDefined();
      expect(window.agentActions['photo.select'].name).toBe('photo.select');
      expect(window.agentActions['photo.select'].description).toBe('Select a photo by ID');
    });

    test('should validate action parameters', () => {
      const action = createAgentAction(
        'photo.analyze',
        'Generate AI metadata for a photo',
        {
          photoId: { type: 'string', required: true },
          customInstructions: { type: 'string', required: false }
        },
        vi.fn()
      );

      AgentActionRegistry.register('photo.analyze', action);

      const validParams = { photoId: 'photo-123' };
      const invalidParams = { customInstructions: 'test' }; // missing required photoId

      expect(AgentActionRegistry.validateParameters('photo.analyze', validParams)).toBe(true);
      expect(AgentActionRegistry.validateParameters('photo.analyze', invalidParams)).toBe(false);
    });

    test('should execute action with parameter validation', async () => {
      const mockExecute = vi.fn().mockResolvedValue({ success: true, result: 'executed' });
      
      const action = createAgentAction(
        'album.create',
        'Create a new album',
        {
          name: { type: 'string', required: true },
          description: { type: 'string', required: false }
        },
        mockExecute
      );

      AgentActionRegistry.register('album.create', action);

      const params = { name: 'Test Album', description: 'A test album' };
      const result = await AgentActionRegistry.execute('album.create', params);

      expect(mockExecute).toHaveBeenCalledWith(params);
      expect(result.success).toBe(true);
    });

    test('should reject execution with invalid parameters', async () => {
      const mockExecute = vi.fn();
      
      const action = createAgentAction(
        'photo.delete',
        'Delete a photo',
        { photoId: { type: 'string', required: true } },
        mockExecute
      );

      AgentActionRegistry.register('photo.delete', action);

      const result = await AgentActionRegistry.execute('photo.delete', {});

      expect(mockExecute).not.toHaveBeenCalled();
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid parameters');
    });

    test('should get all available actions', () => {
      const actions = [
        createAgentAction('photo.select', 'Select photo', { photoId: { type: 'string', required: true } }, vi.fn()),
        createAgentAction('album.create', 'Create album', { name: { type: 'string', required: true } }, vi.fn())
      ];

      actions.forEach(action => AgentActionRegistry.register(action.name, action));

      const allActions = AgentActionRegistry.getAllActions();
      
      expect(Object.keys(allActions)).toHaveLength(2);
      expect(allActions).toHaveProperty('photo.select');
      expect(allActions).toHaveProperty('album.create');
    });

    test('should unregister actions', () => {
      const action = createAgentAction('temp.action', 'Temporary action', {}, vi.fn());
      
      AgentActionRegistry.register('temp.action', action);
      expect(window.agentActions['temp.action']).toBeDefined();

      AgentActionRegistry.unregister('temp.action');
      expect(window.agentActions['temp.action']).toBeUndefined();
    });
  });

  describe('AgentActionExecutor', () => {
    test('should execute action with progress tracking', async () => {
      const mockAction = vi.fn()
        .mockImplementation(async (params) => {
          // Simulate async work
          await new Promise(resolve => setTimeout(resolve, 10));
          return { success: true, data: 'completed' };
        });

      const progressCallback = vi.fn();
      const executor = new AgentActionExecutor();

      const result = await executor.executeWithProgress(
        'test.action',
        mockAction,
        { param: 'value' },
        progressCallback
      );

      expect(result.success).toBe(true);
      expect(result.data).toBe('completed');
      expect(progressCallback).toHaveBeenCalledWith(expect.objectContaining({
        status: 'started'
      }));
    });

    test('should handle action execution errors', async () => {
      const mockAction = vi.fn().mockRejectedValue(new Error('Action failed'));
      const executor = new AgentActionExecutor();

      const result = await executor.executeWithProgress('test.action', mockAction, {});

      expect(result.success).toBe(false);
      expect(result.error).toBe('Action failed');
    });

    test('should track execution history', async () => {
      const mockAction = vi.fn().mockResolvedValue({ success: true });
      const executor = new AgentActionExecutor();

      await executor.executeWithProgress('test.action', mockAction, { param: 'value' });

      const history = executor.getExecutionHistory();
      expect(history).toHaveLength(1);
      expect(history[0]).toMatchObject({
        actionName: 'test.action',
        parameters: { param: 'value' },
        success: true
      });
    });

    test('should limit execution history size', async () => {
      const mockAction = vi.fn().mockResolvedValue({ success: true });
      const executor = new AgentActionExecutor({ maxHistorySize: 2 });

      // Execute 3 actions
      for (let i = 0; i < 3; i++) {
        await executor.executeWithProgress(`test.action.${i}`, mockAction, {});
      }

      const history = executor.getExecutionHistory();
      expect(history).toHaveLength(2); // Should only keep last 2
      expect(history[0].actionName).toBe('test.action.1');
      expect(history[1].actionName).toBe('test.action.2');
    });
  });

  describe('createAgentAction', () => {
    test('should create action with all required properties', () => {
      const mockExecute = vi.fn();
      const action = createAgentAction(
        'photo.share',
        'Share a photo',
        {
          photoId: { type: 'string', required: true, description: 'Photo to share' },
          platform: { type: 'string', required: false, description: 'Platform to share on' }
        },
        mockExecute,
        'Click share button on photo'
      );

      expect(action.name).toBe('photo.share');
      expect(action.description).toBe('Share a photo');
      expect(action.parameters.photoId.required).toBe(true);
      expect(action.parameters.platform.required).toBe(false);
      expect(action.execute).toBe(mockExecute);
      expect(action.humanEquivalent).toBe('Click share button on photo');
    });

    test('should create action with default human equivalent', () => {
      const action = createAgentAction(
        'photo.analyze',
        'Analyze photo',
        { photoId: { type: 'string', required: true } },
        vi.fn()
      );

      expect(action.humanEquivalent).toContain('photo.analyze');
    });
  });

  describe('Parameter Validation', () => {
    test('should validate string parameters', () => {
      const param: ActionParameter = { type: 'string', required: true };
      
      expect(AgentActionRegistry.validateParameterValue('test', param)).toBe(true);
      expect(AgentActionRegistry.validateParameterValue(123, param)).toBe(false);
      expect(AgentActionRegistry.validateParameterValue(null, param)).toBe(false);
    });

    test('should validate number parameters', () => {
      const param: ActionParameter = { type: 'number', required: true };
      
      expect(AgentActionRegistry.validateParameterValue(123, param)).toBe(true);
      expect(AgentActionRegistry.validateParameterValue('123', param)).toBe(false);
      expect(AgentActionRegistry.validateParameterValue(null, param)).toBe(false);
    });

    test('should validate boolean parameters', () => {
      const param: ActionParameter = { type: 'boolean', required: true };
      
      expect(AgentActionRegistry.validateParameterValue(true, param)).toBe(true);
      expect(AgentActionRegistry.validateParameterValue(false, param)).toBe(true);
      expect(AgentActionRegistry.validateParameterValue('true', param)).toBe(false);
    });

    test('should validate array parameters', () => {
      const param: ActionParameter = { type: 'array', required: true };
      
      expect(AgentActionRegistry.validateParameterValue(['a', 'b'], param)).toBe(true);
      expect(AgentActionRegistry.validateParameterValue([], param)).toBe(true);
      expect(AgentActionRegistry.validateParameterValue('array', param)).toBe(false);
    });

    test('should validate object parameters', () => {
      const param: ActionParameter = { type: 'object', required: true };
      
      expect(AgentActionRegistry.validateParameterValue({ key: 'value' }, param)).toBe(true);
      expect(AgentActionRegistry.validateParameterValue({}, param)).toBe(true);
      expect(AgentActionRegistry.validateParameterValue(null, param)).toBe(false);
      expect(AgentActionRegistry.validateParameterValue(['array'], param)).toBe(false);
    });

    test('should handle optional parameters', () => {
      const param: ActionParameter = { type: 'string', required: false };
      
      expect(AgentActionRegistry.validateParameterValue('test', param)).toBe(true);
      expect(AgentActionRegistry.validateParameterValue(undefined, param)).toBe(true);
      expect(AgentActionRegistry.validateParameterValue(123, param)).toBe(false);
    });
  });

  describe('Integration Tests', () => {
    test('should handle complete photo management workflow', async () => {
      // Register photo-related actions
      const selectAction = createAgentAction(
        'photo.select',
        'Select a photo',
        { photoId: { type: 'string', required: true } },
        vi.fn().mockResolvedValue({ success: true, selectedId: 'photo-123' })
      );

      const analyzeAction = createAgentAction(
        'photo.analyze',
        'Analyze photo with AI',
        { 
          photoId: { type: 'string', required: true },
          options: { type: 'object', required: false }
        },
        vi.fn().mockResolvedValue({ success: true, metadata: { keywords: ['sunset'] } })
      );

      AgentActionRegistry.register('photo.select', selectAction);
      AgentActionRegistry.register('photo.analyze', analyzeAction);

      // Execute workflow
      const selectResult = await AgentActionRegistry.execute('photo.select', { photoId: 'photo-123' });
      const analyzeResult = await AgentActionRegistry.execute('photo.analyze', { 
        photoId: 'photo-123',
        options: { generateKeywords: true }
      });

      expect(selectResult.success).toBe(true);
      expect(analyzeResult.success).toBe(true);
      expect(analyzeResult.data.metadata.keywords).toContain('sunset');
    });

    test('should handle batch operations', async () => {
      const batchAnalyzeAction = createAgentAction(
        'photos.batchAnalyze',
        'Analyze multiple photos',
        { photoIds: { type: 'array', required: true } },
        vi.fn().mockImplementation(async (params) => {
          const results = params.photoIds.map((id: string) => ({
            id,
            status: 'analyzed',
            metadata: { keywords: ['generated'] }
          }));
          return { success: true, results };
        })
      );

      AgentActionRegistry.register('photos.batchAnalyze', batchAnalyzeAction);

      const result = await AgentActionRegistry.execute('photos.batchAnalyze', {
        photoIds: ['photo-1', 'photo-2', 'photo-3']
      });

      expect(result.success).toBe(true);
      expect(result.data.results).toHaveLength(3);
      expect(result.data.results[0].id).toBe('photo-1');
    });

    test('should handle agent discovery workflow', () => {
      // Register various actions
      const actions = [
        createAgentAction('photo.select', 'Select photo', { photoId: { type: 'string', required: true } }, vi.fn()),
        createAgentAction('photo.analyze', 'Analyze photo', { photoId: { type: 'string', required: true } }, vi.fn()),
        createAgentAction('album.create', 'Create album', { name: { type: 'string', required: true } }, vi.fn()),
        createAgentAction('search.photos', 'Search photos', { query: { type: 'string', required: true } }, vi.fn())
      ];

      actions.forEach(action => AgentActionRegistry.register(action.name, action));

      // Agent discovery
      const allActions = AgentActionRegistry.getAllActions();
      const actionNames = Object.keys(allActions);
      
      expect(actionNames).toContain('photo.select');
      expect(actionNames).toContain('photo.analyze');
      expect(actionNames).toContain('album.create');
      expect(actionNames).toContain('search.photos');

      // Agent can inspect action details
      const photoSelectAction = allActions['photo.select'];
      expect(photoSelectAction.parameters.photoId.required).toBe(true);
      expect(photoSelectAction.description).toBe('Select photo');
    });
  });
});