/**
 * Agent-Native Structured Data Utilities
 * 
 * Provides utilities for generating Schema.org markup and JSON-LD structured data
 * to enable AI agents to discover and interact with application content.
 */

import { Photo, Album, SmugMugNode, PhotoStatus } from '../../types';

// Schema.org types for agent discovery
export interface SchemaOrgPhotograph {
  '@context': 'https://schema.org';
  '@type': 'Photograph';
  identifier: string;
  name: string;
  contentUrl: string;
  thumbnailUrl?: string;
  description?: string;
  keywords?: string[];
  creator?: string;
  dateCreated?: string;
  width?: number;
  height?: number;
  potentialAction?: SchemaOrgAction[];
}

export interface SchemaOrgImageGallery {
  '@context': 'https://schema.org';
  '@type': 'ImageGallery';
  identifier: string;
  name: string;
  description?: string;
  numberOfItems: number;
  associatedMedia?: SchemaOrgPhotograph[];
  potentialAction?: SchemaOrgAction[];
}

export interface SchemaOrgAction {
  '@type': 'Action' | 'ViewAction' | 'ShareAction' | 'AnalyzeAction' | 'SearchAction';
  name: string;
  target: string | ActionTarget;
  description?: string;
}

export interface ActionTarget {
  '@type': 'EntryPoint';
  urlTemplate: string;
  httpMethod?: string;
}

// Agent discovery data attributes
export interface AgentEntityData {
  'data-agent-entity': string;
  'data-agent-id': string;
  'data-agent-actions': string; // JSON stringified array of action names
}

/**
 * Generate Schema.org Photograph markup for a photo
 */
export function generatePhotographSchema(photo: Photo): SchemaOrgPhotograph {
  const potentialActions: SchemaOrgAction[] = [
    {
      '@type': 'ViewAction',
      name: 'View Photo',
      target: `#photo-${photo.id}`
    },
    {
      '@type': 'ShareAction', 
      name: 'Share Photo',
      target: `#share-photo-${photo.id}`
    }
  ];

  // Add analysis action if photo supports AI processing
  if (photo.status !== PhotoStatus.UPLOADING) {
    potentialActions.push({
      '@type': 'AnalyzeAction',
      name: 'Generate AI Metadata',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `/api/photos/${photo.id}/analyze`,
        httpMethod: 'POST'
      }
    });
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'Photograph',
    identifier: photo.id,
    name: photo.title || photo.filename || 'Untitled Photo',
    contentUrl: photo.url || '',
    thumbnailUrl: photo.thumbnailUrl,
    description: photo.description,
    keywords: photo.keywords,
    creator: photo.creator,
    dateCreated: photo.uploadDate,
    width: photo.width,
    height: photo.height,
    potentialAction: potentialActions
  };
}

/**
 * Generate Schema.org ImageGallery markup for an album
 */
export function generateImageGallerySchema(album: Album, photos?: Photo[]): SchemaOrgImageGallery {
  const potentialActions: SchemaOrgAction[] = [
    {
      '@type': 'ViewAction',
      name: 'View Album',
      target: `#album-${album.id}`
    },
    {
      '@type': 'SearchAction',
      name: 'Search Photos',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `/api/albums/${album.id}/search?q={search_term_string}`,
        httpMethod: 'GET'
      }
    }
  ];

  // Add batch processing action for albums with photos
  if (album.imageCount > 0) {
    potentialActions.push({
      '@type': 'AnalyzeAction',
      name: 'Batch Process Photos',
      target: {
        '@type': 'EntryPoint', 
        urlTemplate: `/api/albums/${album.id}/batch-analyze`,
        httpMethod: 'POST'
      }
    });
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'ImageGallery',
    identifier: album.id,
    name: album.name,
    description: album.description,
    numberOfItems: album.imageCount,
    associatedMedia: photos?.map(generatePhotographSchema),
    potentialAction: potentialActions
  };
}

/**
 * Generate agent discovery data attributes
 */
export function generateAgentEntityData(
  entityType: string, 
  entityId: string, 
  actions: string[]
): AgentEntityData {
  return {
    'data-agent-entity': entityType,
    'data-agent-id': entityId,
    'data-agent-actions': JSON.stringify(actions)
  };
}

/**
 * Generate JSON-LD script tag content
 */
export function generateJsonLD(schemaData: SchemaOrgPhotograph | SchemaOrgImageGallery): string {
  return JSON.stringify(schemaData, null, 2);
}

/**
 * Validate Schema.org markup structure
 */
export function validateSchemaOrgStructure(schema: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check required fields
  if (!schema['@context']) {
    errors.push('Missing required @context field');
  }
  if (!schema['@type']) {
    errors.push('Missing required @type field');  
  }
  if (!schema.identifier) {
    errors.push('Missing required identifier field');
  }
  if (!schema.name) {
    errors.push('Missing required name field');
  }

  // Validate @context
  if (schema['@context'] && schema['@context'] !== 'https://schema.org') {
    errors.push('Invalid @context - must be "https://schema.org"');
  }

  // Validate @type
  const validTypes = ['Photograph', 'ImageGallery'];
  if (schema['@type'] && !validTypes.includes(schema['@type'])) {
    errors.push(`Invalid @type "${schema['@type']}" - must be one of: ${validTypes.join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}