/**
 * Tests for Agent-Native Structured Data Utilities
 */

import { 
  generatePhotographSchema,
  generateImageGallerySchema, 
  generateAgentEntityData,
  generateJsonLD,
  validateSchemaOrgStructure,
  SchemaOrgPhotograph,
  SchemaOrgImageGallery
} from '../structured-data';
import { Photo, Album, PhotoStatus } from '../../../types';

describe('Structured Data Utilities', () => {
  // Mock photo data for testing
  const mockPhoto: Photo = {
    id: 'photo-123',
    filename: 'sunset-beach.jpg',
    title: 'Beautiful Sunset at Beach',
    url: 'https://example.com/photos/sunset-beach.jpg',
    thumbnailUrl: 'https://example.com/thumbnails/sunset-beach.jpg',
    description: 'A stunning sunset photograph taken at the beach',
    keywords: ['sunset', 'beach', 'landscape'],
    creator: 'John Photographer',
    uploadDate: '2025-09-27T18:00:00Z',
    width: 1920,
    height: 1080,
    status: PhotoStatus.ANALYZED,
    isAutoProcessed: false,
    albumId: 'album-456'
  };

  // Mock album data for testing
  const mockAlbum: Album = {
    id: 'album-456',
    name: 'Beach Vacation 2025',
    description: 'Photos from our amazing beach vacation',
    imageCount: 25,
    createdDate: '2025-09-20T10:00:00Z'
  };

  describe('generatePhotographSchema', () => {
    test('should generate valid Schema.org Photograph markup', () => {
      const schema = generatePhotographSchema(mockPhoto);
      
      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('Photograph');
      expect(schema.identifier).toBe(mockPhoto.id);
      expect(schema.name).toBe(mockPhoto.title);
      expect(schema.contentUrl).toBe(mockPhoto.url);
      expect(schema.thumbnailUrl).toBe(mockPhoto.thumbnailUrl);
      expect(schema.description).toBe(mockPhoto.description);
      expect(schema.keywords).toEqual(mockPhoto.keywords);
      expect(schema.creator).toBe(mockPhoto.creator);
      expect(schema.dateCreated).toBe(mockPhoto.uploadDate);
      expect(schema.width).toBe(mockPhoto.width);
      expect(schema.height).toBe(mockPhoto.height);
    });

    test('should include standard potential actions', () => {
      const schema = generatePhotographSchema(mockPhoto);
      
      expect(schema.potentialAction).toBeDefined();
      expect(schema.potentialAction?.length).toBeGreaterThan(0);
      
      const actionNames = schema.potentialAction?.map(action => action.name) || [];
      expect(actionNames).toContain('View Photo');
      expect(actionNames).toContain('Share Photo');
    });

    test('should include analyze action for analyzed photos', () => {
      const schema = generatePhotographSchema(mockPhoto);
      
      const analyzeAction = schema.potentialAction?.find(action => action.name === 'Generate AI Metadata');
      expect(analyzeAction).toBeDefined();
      expect(analyzeAction?.target).toHaveProperty('@type', 'EntryPoint');
    });

    test('should exclude analyze action for uploading photos', () => {
      const uploadingPhoto = { ...mockPhoto, status: PhotoStatus.UPLOADING };
      const schema = generatePhotographSchema(uploadingPhoto);
      
      const analyzeAction = schema.potentialAction?.find(action => action.name === 'Generate AI Metadata');
      expect(analyzeAction).toBeUndefined();
    });

    test('should handle photos with minimal data', () => {
      const minimalPhoto: Photo = {
        id: 'photo-minimal',
        filename: 'test.jpg',
        url: 'https://example.com/test.jpg',
        status: PhotoStatus.READY,
        isAutoProcessed: false,
        albumId: 'album-123'
      };

      const schema = generatePhotographSchema(minimalPhoto);
      
      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('Photograph');
      expect(schema.identifier).toBe(minimalPhoto.id);
      expect(schema.name).toBe(minimalPhoto.filename); // Should fallback to filename
      expect(schema.contentUrl).toBe(minimalPhoto.url);
    });
  });

  describe('generateImageGallerySchema', () => {
    test('should generate valid Schema.org ImageGallery markup', () => {
      const schema = generateImageGallerySchema(mockAlbum);
      
      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('ImageGallery');
      expect(schema.identifier).toBe(mockAlbum.id);
      expect(schema.name).toBe(mockAlbum.name);
      expect(schema.description).toBe(mockAlbum.description);
      expect(schema.numberOfItems).toBe(mockAlbum.imageCount);
    });

    test('should include standard potential actions', () => {
      const schema = generateImageGallerySchema(mockAlbum);
      
      expect(schema.potentialAction).toBeDefined();
      expect(schema.potentialAction?.length).toBeGreaterThan(0);
      
      const actionNames = schema.potentialAction?.map(action => action.name) || [];
      expect(actionNames).toContain('View Album');
      expect(actionNames).toContain('Search Photos');
    });

    test('should include batch processing action for albums with photos', () => {
      const schema = generateImageGallerySchema(mockAlbum);
      
      const batchAction = schema.potentialAction?.find(action => action.name === 'Batch Process Photos');
      expect(batchAction).toBeDefined();
      expect(batchAction?.target).toHaveProperty('@type', 'EntryPoint');
    });

    test('should exclude batch processing for empty albums', () => {
      const emptyAlbum = { ...mockAlbum, imageCount: 0 };
      const schema = generateImageGallerySchema(emptyAlbum);
      
      const batchAction = schema.potentialAction?.find(action => action.name === 'Batch Process Photos');
      expect(batchAction).toBeUndefined();
    });

    test('should include associated media when photos provided', () => {
      const photos = [mockPhoto];
      const schema = generateImageGallerySchema(mockAlbum, photos);
      
      expect(schema.associatedMedia).toBeDefined();
      expect(schema.associatedMedia?.length).toBe(1);
      expect(schema.associatedMedia?.[0]).toHaveProperty('@type', 'Photograph');
      expect(schema.associatedMedia?.[0].identifier).toBe(mockPhoto.id);
    });
  });

  describe('generateAgentEntityData', () => {
    test('should generate correct agent entity data attributes', () => {
      const actions = ['view', 'edit', 'share'];
      const entityData = generateAgentEntityData('photo', 'photo-123', actions);
      
      expect(entityData['data-agent-entity']).toBe('photo');
      expect(entityData['data-agent-id']).toBe('photo-123');
      expect(entityData['data-agent-actions']).toBe(JSON.stringify(actions));
    });

    test('should handle empty actions array', () => {
      const entityData = generateAgentEntityData('album', 'album-456', []);
      
      expect(entityData['data-agent-entity']).toBe('album');
      expect(entityData['data-agent-id']).toBe('album-456');
      expect(entityData['data-agent-actions']).toBe('[]');
    });
  });

  describe('generateJsonLD', () => {
    test('should generate properly formatted JSON-LD string', () => {
      const schema = generatePhotographSchema(mockPhoto);
      const jsonLD = generateJsonLD(schema);
      
      // Should be valid JSON
      expect(() => JSON.parse(jsonLD)).not.toThrow();
      
      // Should be formatted (contain newlines and indentation)
      expect(jsonLD).toContain('\n');
      expect(jsonLD).toContain('  '); // 2-space indentation
      
      // Should contain expected schema data
      expect(jsonLD).toContain('"@context": "https://schema.org"');
      expect(jsonLD).toContain('"@type": "Photograph"');
    });

    test('should handle ImageGallery schema', () => {
      const schema = generateImageGallerySchema(mockAlbum);
      const jsonLD = generateJsonLD(schema);
      
      expect(() => JSON.parse(jsonLD)).not.toThrow();
      expect(jsonLD).toContain('"@type": "ImageGallery"');
    });
  });

  describe('validateSchemaOrgStructure', () => {
    test('should validate correct Schema.org structure', () => {
      const validSchema = generatePhotographSchema(mockPhoto);
      const result = validateSchemaOrgStructure(validSchema);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should detect missing required fields', () => {
      const invalidSchema = {
        '@context': 'https://schema.org',
        // Missing @type, identifier, and name
      };
      
      const result = validateSchemaOrgStructure(invalidSchema);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing required @type field');
      expect(result.errors).toContain('Missing required identifier field');
      expect(result.errors).toContain('Missing required name field');
    });

    test('should detect invalid @context', () => {
      const invalidSchema = {
        '@context': 'https://example.com',
        '@type': 'Photograph',
        identifier: 'test',
        name: 'Test'
      };
      
      const result = validateSchemaOrgStructure(invalidSchema);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid @context - must be "https://schema.org"');
    });

    test('should detect invalid @type', () => {
      const invalidSchema = {
        '@context': 'https://schema.org',
        '@type': 'InvalidType',
        identifier: 'test',
        name: 'Test'
      };
      
      const result = validateSchemaOrgStructure(invalidSchema);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid @type "InvalidType" - must be one of: Photograph, ImageGallery');
    });

    test('should handle completely empty schema', () => {
      const result = validateSchemaOrgStructure({});
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});