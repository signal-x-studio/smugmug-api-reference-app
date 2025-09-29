/**
 * Photo Management Agent Actions
 * 
 * Defines all photo-related actions that agents can execute programmatically.
 */

import { 
  createAgentAction, 
  createBatchAction,
  AgentActionRegistry,
  ActionResult 
} from '../utils/agent-native/agent-actions';
import { Photo, PhotoStatus } from '../types';

// Photo selection actions
export const photoSelectAction = createAgentAction(
  'photo.select',
  'Select a photo by ID',
  {
    photoId: { 
      type: 'string', 
      required: true, 
      description: 'Unique identifier of the photo to select' 
    }
  },
  async (params): Promise<ActionResult> => {
    try {
      // Access photo state through agent registry
      const photoState = window.agentState?.photoGrid;
      if (!photoState) {
        return { success: false, error: 'Photo grid state not available' };
      }

      const { photoId } = params;
      const photo = photoState.current.photos.find((p: Photo) => p.id === photoId);
      
      if (!photo) {
        return { success: false, error: `Photo with ID '${photoId}' not found` };
      }

      // Execute selection through state action
      if (photoState.actions.selectPhoto) {
        photoState.actions.selectPhoto(photoId);
        return { 
          success: true, 
          data: { 
            selectedPhoto: photo,
            message: `Photo '${photo.title || photo.filename}' selected successfully` 
          }
        };
      }

      return { success: false, error: 'Photo selection action not available' };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error during photo selection' 
      };
    }
  },
  'Click on photo card to select',
  'photo'
);

export const photoDeselectAction = createAgentAction(
  'photo.deselect',
  'Deselect a photo by ID',
  {
    photoId: { 
      type: 'string', 
      required: true, 
      description: 'Unique identifier of the photo to deselect' 
    }
  },
  async (params): Promise<ActionResult> => {
    try {
      const photoState = window.agentState?.photoGrid;
      if (!photoState) {
        return { success: false, error: 'Photo grid state not available' };
      }

      const { photoId } = params;
      
      if (photoState.actions.deselectPhoto) {
        photoState.actions.deselectPhoto(photoId);
        return { 
          success: true, 
          data: { message: `Photo '${photoId}' deselected successfully` }
        };
      }

      return { success: false, error: 'Photo deselection action not available' };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error during photo deselection' 
      };
    }
  },
  'Click on selected photo card to deselect',
  'photo'
);

// Photo analysis actions
export const photoAnalyzeAction = createAgentAction(
  'photo.analyze',
  'Generate AI metadata for a photo',
  {
    photoId: { 
      type: 'string', 
      required: true, 
      description: 'Unique identifier of the photo to analyze' 
    },
    customInstructions: { 
      type: 'string', 
      required: false, 
      description: 'Custom instructions for AI analysis' 
    },
    regenerate: {
      type: 'boolean',
      required: false,
      description: 'Force regeneration even if metadata exists',
      default: false
    }
  },
  async (params): Promise<ActionResult> => {
    try {
      const { photoId, customInstructions, regenerate = false } = params;
      
      // Find photo in current state
      const photoState = window.agentState?.photoGrid;
      if (!photoState) {
        return { success: false, error: 'Photo grid state not available' };
      }

      const photo = photoState.current.photos.find((p: Photo) => p.id === photoId);
      if (!photo) {
        return { success: false, error: `Photo with ID '${photoId}' not found` };
      }

      // Check if analysis is needed
      if (!regenerate && photo.status === PhotoStatus.ANALYZED && photo.keywords?.length) {
        return {
          success: true,
          data: {
            message: 'Photo already analyzed',
            metadata: {
              title: photo.title,
              description: photo.description,
              keywords: photo.keywords
            },
            skipped: true
          }
        };
      }

      // Simulate AI analysis (in real implementation, this would call AI service)
      const analysisResult = {
        title: photo.title || 'AI Generated Title',
        description: customInstructions ? 
          `Analysis with custom instructions: ${customInstructions}` : 
          'AI generated description based on image content',
        keywords: ['ai-generated', 'analyzed', 'metadata'],
        confidence: 0.95
      };

      return {
        success: true,
        data: {
          photoId,
          metadata: analysisResult,
          message: 'Photo analyzed successfully'
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during photo analysis'
      };
    }
  },
  'Click "Generate Metadata" button on photo',
  'photo'
);

// Register all photo actions
export function registerPhotoActions(): void {
  AgentActionRegistry.register('photo.select', photoSelectAction);
  AgentActionRegistry.register('photo.deselect', photoDeselectAction);  
  AgentActionRegistry.register('photo.analyze', photoAnalyzeAction);
}