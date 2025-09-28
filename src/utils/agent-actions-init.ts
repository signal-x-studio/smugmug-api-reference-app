/**
 * Agent Actions Initialization
 * 
 * Centralized initialization of all agent actions to ensure they are
 * properly registered when the application starts.
 */

import { registerPhotoActions } from '../actions/photo-actions';
import { registerAlbumActions } from '../actions/album-actions';

/**
 * Initialize all agent actions by calling their registration functions
 */
export function initializeAgentActions(): void {
  try {
    // Register photo actions
    registerPhotoActions();
    
    // Register album actions  
    registerAlbumActions();
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Agent actions initialized successfully');
    }
  } catch (error) {
    console.error('Failed to initialize agent actions:', error);
  }
}

// Auto-initialize when module is imported
initializeAgentActions();