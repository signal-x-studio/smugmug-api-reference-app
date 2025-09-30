/**
 * React Hooks for Agent State Management
 * 
 * Provides React hooks that integrate with the agent state registry
 * to expose component state to       const newAlbum: Album = {
        id: `album-${Date.now()}`,
        name: name,
        uri: `/api/v2/album/${Date.now()}`,
        description: description,
        keywords: [],
        imageCount: 0,
        type: 'Album'
      };r agents.
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  createAgentStateHook, 
  useAgentActions, 
  useAgentStateListener,
  AgentStateSchema,
  AgentStateConfig 
} from '../utils/agent-native/agent-state';
import { Photo, Album } from '../types';

// Photo management state schema
const photoStateSchema: AgentStateSchema = {
  photos: { type: 'array', required: true, description: 'Array of photo objects' },
  selectedIds: { type: 'array', required: false, description: 'Array of selected photo IDs' },
  isSelectionMode: { type: 'boolean', required: false, description: 'Whether selection mode is active' },
  loadingPhotos: { type: 'boolean', required: false, description: 'Whether photos are currently loading' }
};

// Album management state schema  
const albumStateSchema: AgentStateSchema = {
  albums: { type: 'array', required: true, description: 'Array of album objects' },
  selectedAlbum: { type: 'object', required: false, description: 'Currently selected album' },
  isLoading: { type: 'boolean', required: false, description: 'Whether albums are loading' }
};

// Create agent-ready hooks
export const useAgentPhotoState = createAgentStateHook('photoGrid', photoStateSchema);
export const useAgentAlbumState = createAgentStateHook('albumList', albumStateSchema);

/**
 * Hook for photo grid component with agent integration
 */
export function usePhotoGridAgent(photos: Photo[]) {
  const [photoState, setPhotoState] = useState({
    photos: photos,
    selectedIds: [] as string[],
    isSelectionMode: false,
    loadingPhotos: false
  });

  // Define actions that agents can execute
  const photoActions = {
    selectPhoto: useCallback((photoId: string) => {
      setPhotoState(prev => ({
        ...prev,
        selectedIds: [...prev.selectedIds, photoId]
      }));
    }, [setPhotoState]),

    deselectPhoto: useCallback((photoId: string) => {
      setPhotoState(prev => ({
        ...prev,
        selectedIds: prev.selectedIds.filter(id => id !== photoId)
      }));
    }, [setPhotoState]),

    toggleSelectionMode: useCallback(() => {
      setPhotoState(prev => ({
        ...prev,
        isSelectionMode: !prev.isSelectionMode,
        selectedIds: prev.isSelectionMode ? [] : prev.selectedIds
      }));
    }, [setPhotoState]),

    selectMultiple: useCallback((photoIds: string[]) => {
      setPhotoState(prev => ({
        ...prev,
        selectedIds: [...new Set([...prev.selectedIds, ...photoIds])]
      }));
    }, [setPhotoState]),

    clearSelection: useCallback(() => {
      setPhotoState(prev => ({
        ...prev,
        selectedIds: [],
        isSelectionMode: false
      }));
    }, [setPhotoState]),

    filterByKeywords: useCallback((keywords: string[]) => {
      const filteredPhotos = photos.filter(photo => 
        photo.keywords?.some(keyword => 
          keywords.some(k => keyword.toLowerCase().includes(k.toLowerCase()))
        )
      );
      setPhotoState(prev => ({
        ...prev,
        photos: filteredPhotos
      }));
    }, [photos, setPhotoState]),

    resetFilter: useCallback(() => {
      setPhotoState(prev => ({
        ...prev,
        photos: photos
      }));
    }, [photos, setPhotoState])
  };

  // Register actions with agent system
  useAgentActions('photoGrid', photoActions);

  // Update photos when prop changes
  useEffect(() => {
    setPhotoState(prev => ({
      ...prev,
      photos: photos
    }));
  }, [photos, setPhotoState]);

  return {
    ...photoState,
    ...photoActions,
    setPhotoState
  };
}

/**
 * Hook for album list component with agent integration
 */
export function useAlbumListAgent(albums: Album[]) {
  const [albumState, setAlbumState] = useState({
    albums: albums,
    selectedAlbum: null as Album | null,
    isLoading: false
  });

  // Define actions that agents can execute
  const albumActions = {
    selectAlbum: useCallback((album: Album) => {
      setAlbumState(prev => ({
        ...prev,
        selectedAlbum: album
      }));
    }, [setAlbumState]),

    clearSelection: useCallback(() => {
      setAlbumState(prev => ({
        ...prev,
        selectedAlbum: null
      }));
    }, [setAlbumState]),

    createAlbum: useCallback((albumName: string, description?: string) => {
      const newAlbum: Album = {
        id: `album-${Date.now()}`,
        name: albumName,
        uri: `/api/v2/album/${Date.now()}`,
        description: description || '',
        keywords: [],
        imageCount: 0,
        type: 'Album'
      };
      
      setAlbumState(prev => ({
        ...prev,
        albums: [...prev.albums, newAlbum],
        selectedAlbum: newAlbum
      }));
      
      return newAlbum;
    }, [setAlbumState]),

    deleteAlbum: useCallback((albumId: string) => {
      setAlbumState(prev => ({
        ...prev,
        albums: prev.albums.filter(album => album.id !== albumId),
        selectedAlbum: prev.selectedAlbum?.id === albumId ? null : prev.selectedAlbum
      }));
    }, [setAlbumState]),

    findAlbumsByName: useCallback((searchTerm: string) => {
      return albums.filter(album => 
        album.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }, [albums]),

    getAlbumStats: useCallback(() => {
      return {
        totalAlbums: albumState.albums.length,
        totalPhotos: albumState.albums.reduce((sum, album) => sum + album.imageCount, 0),
        averagePhotosPerAlbum: albumState.albums.length > 0 
          ? Math.round(albumState.albums.reduce((sum, album) => sum + album.imageCount, 0) / albumState.albums.length)
          : 0
      };
    }, [albumState.albums])
  };

  // Register actions with agent system
  useAgentActions('albumList', albumActions);

  // Update albums when prop changes
  useEffect(() => {
    setAlbumState(prev => ({
      ...prev,
      albums: albums
    }));
  }, [albums, setAlbumState]);

  return {
    ...albumState,
    ...albumActions,
    setAlbumState
  };
}