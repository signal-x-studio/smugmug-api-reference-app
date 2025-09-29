import { useState } from 'react';
import { renderHook, act } from '@testing-library/react';

import { vi } from 'vitest';
import { 
  AgentStateRegistry,
  AgentStateManager,
  createAgentStateHook,
  AgentStateConfig,
  AgentStateSchema
} from '../agent-state';
import { Photo, Album, PhotoStatus } from '../../../types';

// Mock global window for testing
describe('Agent State Registry System', () => {
  beforeEach(() => {
    // Reset global state before each test
    (global as any).window = {
      agentState: {},
      agentStateEvents: new EventTarget()
    };
  });

  describe('AgentStateRegistry', () => {
    test('should register component state', () => {
      const mockState = { photos: [], selectedIds: [] };
      const mockActions = {
        selectPhoto: vi.fn(),
        clearSelection: vi.fn()
      };

      AgentStateRegistry.register('photoGrid', mockState, mockActions);

      expect(window.agentState.photoGrid).toBeDefined();
      expect(window.agentState.photoGrid.current).toEqual(mockState);
      expect(window.agentState.photoGrid.actions).toEqual(mockActions);
    });

    test('should update existing component state', () => {
      const initialState = { photos: [] };
      const updatedState = { photos: [{ id: 'photo-1' }] };

      AgentStateRegistry.register('photoGrid', initialState, {});
      AgentStateRegistry.updateState('photoGrid', updatedState);

      expect(window.agentState.photoGrid.current).toEqual(updatedState);
    });

    test('should emit state change events', () => {
      const eventListener = vi.fn();
      window.agentStateEvents.addEventListener('stateChange', eventListener);

      const newState = { photos: [] };
      AgentStateRegistry.register('photoGrid', newState, {});

      expect(eventListener).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: {
            componentId: 'photoGrid',
            newState: newState,
            timestamp: expect.any(Number)
          }
        })
      );
    });

    test('should unregister component state', () => {
      AgentStateRegistry.register('photoGrid', {}, {});
      expect(window.agentState.photoGrid).toBeDefined();

      AgentStateRegistry.unregister('photoGrid');
      expect(window.agentState.photoGrid).toBeUndefined();
    });

    test('should get all registered states', () => {
      AgentStateRegistry.register('photoGrid', { photos: [] }, {});
      AgentStateRegistry.register('albumList', { albums: [] }, {});

      const allStates = AgentStateRegistry.getAllStates();
      
      expect(allStates).toHaveProperty('photoGrid');
      expect(allStates).toHaveProperty('albumList');
    });
  });

  describe('AgentStateManager', () => {
    test('should validate state schema', () => {
      const schema: AgentStateSchema = {
        photos: { type: 'array', required: true },
        selectedIds: { type: 'array', required: false }
      };

      const validState = { photos: [], selectedIds: ['id1'] };
      const invalidState = { selectedIds: ['id1'] }; // missing required photos

      expect(AgentStateManager.validateState(validState, schema)).toBe(true);
      expect(AgentStateManager.validateState(invalidState, schema)).toBe(false);
    });

    test('should provide state access controls', () => {
      const config: AgentStateConfig = {
        readOnly: ['photos'],
        writeOnly: [],
        restricted: ['internalData']
      };

      expect(AgentStateManager.canRead('photos', config)).toBe(true);
      expect(AgentStateManager.canWrite('photos', config)).toBe(false);
      expect(AgentStateManager.canAccess('internalData', config)).toBe(false);
    });

    test('should sanitize state for agent access', () => {
      const state = {
        photos: [{ id: 'photo-1', title: 'Test' }],
        _internal: 'secret',
        password: 'hidden'
      };

      const sanitized = AgentStateManager.sanitizeForAgent(state);

      expect(sanitized).toHaveProperty('photos');
      expect(sanitized).not.toHaveProperty('_internal');
      expect(sanitized).not.toHaveProperty('password');
    });

    test('should create state snapshots', () => {
      AgentStateRegistry.register('photoGrid', { photos: [], count: 0 }, {});
      AgentStateRegistry.register('albumList', { albums: [] }, {});

      const snapshot = AgentStateManager.createSnapshot();

      expect(snapshot).toHaveProperty('timestamp');
      expect(snapshot).toHaveProperty('states');
      expect(snapshot.states).toHaveProperty('photoGrid');
      expect(snapshot.states).toHaveProperty('albumList');
    });
  });

  describe('createAgentStateHook', () => {
    test('should create hook that registers component state', () => {
      const useAgentState = createAgentStateHook('photoGrid', {
        photos: { type: 'array', required: true },
        selectedIds: { type: 'array', required: false }
      });

      const { result } = renderHook(() => {
        const [state, setState] = useState({ photos: [], selectedIds: [] });
        return useAgentState(state, setState);
      });

      expect(result.current[0]).toEqual({ photos: [], selectedIds: [] });
      expect(window.agentState.photoGrid).toBeDefined();
      expect(window.agentState.photoGrid.current).toEqual({ photos: [], selectedIds: [] });
    });

    test('should provide agent-compatible setState wrapper', () => {
      const useAgentState = createAgentStateHook('photoGrid', {
        photos: { type: 'array', required: true },
        selectedIds: { type: 'array', required: false }
      });

      const { result } = renderHook(() => {
        const [state, setState] = useState({ photos: [], selectedIds: [] });
        return useAgentState(state, setState);
      });

      const newState = { photos: [{ id: 'photo-1' }], selectedIds: ['photo-1'] };
      act(() => {
        result.current[1](newState);
      });

      expect(result.current[0]).toEqual(newState);
      expect(window.agentState.photoGrid.current).toEqual(newState);
    });

    test('should handle state validation in hook', () => {
      const useAgentState = createAgentStateHook('photoGrid', {
        photos: { type: 'array', required: true },
        selectedIds: { type: 'array', required: false }
      });

      const { result } = renderHook(() => {
        const [state, setState] = useState({ photos: [] });
        return useAgentState(state, setState);
      });
      expect(result.current[0]).toEqual({ photos: [] });

      // Test with invalid state (missing required field)
      const useInvalidAgentState = createAgentStateHook('invalid', {
        required_field: { type: 'string', required: true }
      });
      
      expect(() => {
        renderHook(() => {
          const [state, setState] = useState({});
          return useInvalidAgentState(state, setState);
        });
      }).toThrow();
    });
  });

  describe('Integration Tests', () => {
    test('should handle complex photo management state', () => {
      const photoState = {
        photos: [
          { id: 'photo-1', title: 'Sunset', status: PhotoStatus.ANALYZED },
          { id: 'photo-2', title: 'Beach', status: PhotoStatus.ANALYZED }
        ],
        selectedIds: ['photo-1'],
        isSelectionMode: true,
        loadingPhotos: false
      };

      const photoActions = {
        selectPhoto: vi.fn((photoId: string) => {
          photoState.selectedIds.push(photoId);
        }),
        toggleSelectionMode: vi.fn(() => {
          photoState.isSelectionMode = !photoState.isSelectionMode;
        }),
        batchAnalyze: vi.fn((photoIds: string[]) => {
          console.log(`Analyzing photos: ${photoIds.join(', ')}`);
        })
      };

      AgentStateRegistry.register('photoGrid', photoState, photoActions);

      // Test agent can access state
      expect(window.agentState.photoGrid.current.photos).toHaveLength(2);
      expect(window.agentState.photoGrid.current.selectedIds).toContain('photo-1');

      // Test agent can execute actions
      window.agentState.photoGrid.actions.selectPhoto('photo-2');
      expect(photoActions.selectPhoto).toHaveBeenCalledWith('photo-2');
    });

    test('should handle album management state', () => {
      const albumState = {
        albums: [
          { id: 'album-1', name: 'Vacation 2025', imageCount: 25 },
          { id: 'album-2', name: 'Work Photos', imageCount: 10 }
        ],
        selectedAlbum: null,
        isLoading: false
      };

      const albumActions = {
        selectAlbum: vi.fn((album: Album) => {
          albumState.selectedAlbum = album;
        }),
        createAlbum: vi.fn((name: string) => {
          const newAlbum = { id: `album-${Date.now()}`, name, imageCount: 0 };
          albumState.albums.push(newAlbum);
        })
      };

      AgentStateRegistry.register('albumList', albumState, albumActions);

      // Test initial state
      expect(window.agentState.albumList.current.albums).toHaveLength(2);
      expect(window.agentState.albumList.current.selectedAlbum).toBeNull();

      // Test action execution
      window.agentState.albumList.actions.selectAlbum(albumState.albums[0]);
      expect(albumActions.selectAlbum).toHaveBeenCalledWith(albumState.albums[0]);
    });

    test('should handle state synchronization across components', () => {
      const stateChangeListener = vi.fn();
      window.agentStateEvents.addEventListener('stateChange', stateChangeListener);

      // Register multiple components
      AgentStateRegistry.register('photoGrid', { photos: [] }, {});
      AgentStateRegistry.register('albumList', { albums: [] }, {});

      // Update states
      AgentStateRegistry.updateState('photoGrid', { photos: [{ id: 'photo-1' }] });
      AgentStateRegistry.updateState('albumList', { albums: [{ id: 'album-1' }] });

      // Verify events were emitted for both updates
      expect(stateChangeListener).toHaveBeenCalledTimes(4); // 2 registers + 2 updates
    });
  });
});