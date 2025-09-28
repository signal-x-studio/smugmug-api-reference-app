/**
 * Album Management Agent Actions
 * 
 * Defines all album-related actions that agents can execute programmatically.
 */

import { 
  createAgentAction, 
  AgentActionRegistry,
  ActionResult 
} from '../utils/agent-native/agent-actions';
import { Album } from '../../types';

// Album selection actions
export const albumSelectAction = createAgentAction(
  'album.select',
  'Select an album by ID',
  {
    albumId: { 
      type: 'string', 
      required: true, 
      description: 'Unique identifier of the album to select' 
    }
  },
  async (params): Promise<ActionResult> => {
    try {
      const albumState = window.agentState?.albumList;
      if (!albumState) {
        return { success: false, error: 'Album list state not available' };
      }

      const { albumId } = params;
      const album = albumState.current.albums.find((a: Album) => a.id === albumId);
      
      if (!album) {
        return { success: false, error: `Album with ID '${albumId}' not found` };
      }

      if (albumState.actions.selectAlbum) {
        albumState.actions.selectAlbum(album);
        return { 
          success: true, 
          data: { 
            selectedAlbum: album,
            message: `Album '${album.name}' selected successfully` 
          }
        };
      }

      return { success: false, error: 'Album selection action not available' };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error during album selection' 
      };
    }
  },
  'Click on album in the album list',
  'album'
);

// Album creation actions
export const albumCreateAction = createAgentAction(
  'album.create',
  'Create a new album',
  {
    name: { 
      type: 'string', 
      required: true, 
      description: 'Name for the new album' 
    },
    description: { 
      type: 'string', 
      required: false, 
      description: 'Optional description for the album' 
    },
    selectAfterCreate: {
      type: 'boolean',
      required: false,
      description: 'Whether to select the album after creation',
      default: true
    }
  },
  async (params): Promise<ActionResult> => {
    try {
      const albumState = window.agentState?.albumList;
      if (!albumState) {
        return { success: false, error: 'Album list state not available' };
      }

      const { name, description, selectAfterCreate = true } = params;

      // Check if album with same name already exists (case-insensitive)
      const nameLower = name.toLowerCase();
      const existingAlbum = albumState.current.albums.find((a: Album) => 
        a.name.toLowerCase() === nameLower
      );
      
      if (existingAlbum) {
        return { 
          success: false, 
          error: `Album with name '${name}' already exists` 
        };
      }

      if (albumState.actions.createAlbum) {
        const newAlbum = albumState.actions.createAlbum(name, description);
        return { 
          success: true, 
          data: { 
            album: newAlbum,
            message: `Album '${name}' created successfully` 
          }
        };
      }

      return { success: false, error: 'Album creation action not available' };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error during album creation' 
      };
    }
  },
  'Click "Create New Album" button and fill in the form',
  'album'
);

// Album search and discovery actions
export const albumFindByNameAction = createAgentAction(
  'album.findByName',
  'Find albums by name search',
  {
    searchTerm: { 
      type: 'string', 
      required: true, 
      description: 'Search term to match against album names' 
    },
    caseSensitive: {
      type: 'boolean',
      required: false,
      description: 'Whether search should be case sensitive',
      default: false
    }
  },
  async (params): Promise<ActionResult> => {
    try {
      const albumState = window.agentState?.albumList;
      if (!albumState) {
        return { success: false, error: 'Album list state not available' };
      }

      const { searchTerm, caseSensitive = false } = params;

      if (albumState.actions.findAlbumsByName) {
        const matchingAlbums = albumState.actions.findAlbumsByName(searchTerm);
        return { 
          success: true, 
          data: { 
            albums: matchingAlbums,
            searchTerm,
            count: matchingAlbums.length,
            message: `Found ${matchingAlbums.length} albums matching '${searchTerm}'` 
          }
        };
      }

      return { success: false, error: 'Album search action not available' };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error during album search' 
      };
    }
  },
  'Use search field in album list',
  'album'
);

// Album statistics and info actions
export const albumGetStatsAction = createAgentAction(
  'album.getStats',
  'Get statistics about all albums',
  {},
  async (params): Promise<ActionResult> => {
    try {
      const albumState = window.agentState?.albumList;
      if (!albumState) {
        return { success: false, error: 'Album list state not available' };
      }

      if (albumState.actions.getAlbumStats) {
        const stats = albumState.actions.getAlbumStats();
        return { 
          success: true, 
          data: { 
            stats,
            message: `Retrieved statistics for ${stats.totalAlbums} albums` 
          }
        };
      }

      return { success: false, error: 'Album statistics action not available' };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error getting album statistics' 
      };
    }
  },
  'View album statistics in the UI',
  'album'
);

export const albumGetDetailsAction = createAgentAction(
  'album.getDetails',
  'Get detailed information about a specific album',
  {
    albumId: { 
      type: 'string', 
      required: true, 
      description: 'Unique identifier of the album' 
    }
  },
  async (params): Promise<ActionResult> => {
    try {
      const albumState = window.agentState?.albumList;
      if (!albumState) {
        return { success: false, error: 'Album list state not available' };
      }

      const { albumId } = params;
      const album = albumState.current.albums.find((a: Album) => a.id === albumId);
      
      if (!album) {
        return { success: false, error: `Album with ID '${albumId}' not found` };
      }

      return { 
        success: true, 
        data: { 
          album: {
            id: album.id,
            name: album.name,
            description: album.description,
            imageCount: album.imageCount,
            createdDate: album.createdDate
          },
          message: `Retrieved details for album '${album.name}'` 
        }
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error getting album details' 
      };
    }
  },
  'Click on album to view its details',
  'album'
);

// Album management actions
export const albumClearSelectionAction = createAgentAction(
  'album.clearSelection',
  'Clear the currently selected album',
  {},
  async (params): Promise<ActionResult> => {
    try {
      const albumState = window.agentState?.albumList;
      if (!albumState) {
        return { success: false, error: 'Album list state not available' };
      }

      const previousSelection = albumState.current.selectedAlbum;

      if (albumState.actions.clearSelection) {
        albumState.actions.clearSelection();
        return { 
          success: true, 
          data: { 
            previousAlbum: previousSelection,
            message: previousSelection 
              ? `Cleared selection of album '${previousSelection.name}'`
              : 'No album was selected'
          }
        };
      }

      return { success: false, error: 'Album clear selection action not available' };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error clearing album selection' 
      };
    }
  },
  'Click away from albums or press Escape',
  'album'
);

export const albumDeleteAction = createAgentAction(
  'album.delete',
  'Delete an album by ID',
  {
    albumId: { 
      type: 'string', 
      required: true, 
      description: 'Unique identifier of the album to delete' 
    },
    confirmDelete: {
      type: 'boolean',
      required: true,
      description: 'Confirmation that the album should be deleted'
    }
  },
  async (params): Promise<ActionResult> => {
    try {
      const albumState = window.agentState?.albumList;
      if (!albumState) {
        return { success: false, error: 'Album list state not available' };
      }

      const { albumId, confirmDelete } = params;

      if (!confirmDelete) {
        return { 
          success: false, 
          error: 'Album deletion requires explicit confirmation (confirmDelete: true)' 
        };
      }

      const album = albumState.current.albums.find((a: Album) => a.id === albumId);
      if (!album) {
        return { success: false, error: `Album with ID '${albumId}' not found` };
      }

      if (albumState.actions.deleteAlbum) {
        albumState.actions.deleteAlbum(albumId);
        return { 
          success: true, 
          data: { 
            deletedAlbum: album,
            message: `Album '${album.name}' deleted successfully` 
          }
        };
      }

      return { success: false, error: 'Album deletion action not available' };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error during album deletion' 
      };
    }
  },
  'Right-click album and select delete, then confirm',
  'album'
);

// Register all album actions
export function registerAlbumActions(): void {
  AgentActionRegistry.register('album.select', albumSelectAction);
  AgentActionRegistry.register('album.create', albumCreateAction);
  AgentActionRegistry.register('album.findByName', albumFindByNameAction);
  AgentActionRegistry.register('album.getStats', albumGetStatsAction);
  AgentActionRegistry.register('album.getDetails', albumGetDetailsAction);
  AgentActionRegistry.register('album.clearSelection', albumClearSelectionAction);
  AgentActionRegistry.register('album.delete', albumDeleteAction);
}