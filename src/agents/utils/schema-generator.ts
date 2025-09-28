/**
 * Schema.org Data Generation Utilities
 * 
 * Utility functions for generating valid Schema.org structured data
 * that enables AI agents to understand and interact with components.
 */

import { 
  SchemaOrgStructuredData,
  SchemaOrgWebApplication,
  SchemaOrgImageGallery,
  SchemaOrgPhotograph,
  SchemaOrgPerson,
  SchemaOrgAction,
  SchemaOrgConfig,
  SchemaOrgTypeName
} from '../interfaces/schema-org';

import { AgentAction } from '../interfaces/agent-action';

/**
 * Default Schema.org configuration
 */
const DEFAULT_CONFIG: SchemaOrgConfig = {
  baseUrl: 'https://example.com',
  applicationName: 'SmugMug Photo Manager',
  applicationDescription: 'AI-powered photo management and organization platform',
  includeDebug: false
};

/**
 * Generate Schema.org structured data for any supported type
 */
export function generateSchemaOrgData(
  type: SchemaOrgTypeName,
  data: any,
  config: Partial<SchemaOrgConfig> = {}
): SchemaOrgStructuredData {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };

  switch (type) {
    case 'WebApplication':
      return generateWebApplicationSchema(data, mergedConfig);
    case 'ImageGallery':
      return generateImageGallerySchema(data, mergedConfig);
    case 'Photograph':
      return generatePhotographSchema(data, mergedConfig);
    case 'Person':
      return generatePersonSchema(data, mergedConfig);
    default:
      throw new Error(`Unsupported Schema.org type: ${type}`);
  }
}

/**
 * Generate WebApplication schema for the main application
 */
export function generateWebApplicationSchema(
  appData: {
    name?: string;
    description?: string;
    version?: string;
    features?: string[];
    actions?: AgentAction[];
  },
  config: SchemaOrgConfig = DEFAULT_CONFIG
): SchemaOrgWebApplication {
  const potentialActions = appData.actions?.map(action => 
    generateActionSchema(action, config)
  ) || [];

  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    identifier: `${config.baseUrl}/app`,
    name: appData.name || config.applicationName,
    description: appData.description || config.applicationDescription,
    url: config.baseUrl,
    applicationCategory: 'PhotoManagement',
    operatingSystem: 'Web',
    softwareVersion: appData.version || '1.0.0',
    featureList: appData.features || [
      'AI Photo Analysis',
      'Smart Album Creation',
      'Batch Metadata Generation',
      'Natural Language Search'
    ],
    potentialAction: potentialActions,
    creator: config.defaultCreator || {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'SmugMug API Reference Team'
    }
  };
}

/**
 * Generate ImageGallery schema for photo gallery components
 */
export function generateImageGallerySchema(
  galleryData: {
    photos: Array<{
      id: string;
      url: string;
      title?: string;
      description?: string;
      keywords?: string[];
      uploadDate?: string;
      creator?: string;
      thumbnailUrl?: string;
      width?: number;
      height?: number;
    }>;
    title?: string;
    description?: string;
    creator?: string;
    actions?: AgentAction[];
  },
  config: SchemaOrgConfig = DEFAULT_CONFIG
): SchemaOrgImageGallery {
  const images = galleryData.photos.map(photo => 
    generatePhotographSchema(photo, config)
  );

  const potentialActions = galleryData.actions?.map(action => 
    generateActionSchema(action, config)
  ) || [];

  return {
    '@context': 'https://schema.org',
    '@type': 'ImageGallery',
    identifier: `${config.baseUrl}/gallery`,
    name: galleryData.title || 'Photo Gallery',
    description: galleryData.description || 'Collection of user photos with AI-generated metadata',
    numberOfItems: galleryData.photos.length,
    image: images,
    dateCreated: new Date().toISOString(),
    creator: galleryData.creator ? generatePersonSchema({ name: galleryData.creator }, config) : undefined,
    potentialAction: potentialActions
  };
}

/**
 * Generate Photograph schema for individual photo items
 */
export function generatePhotographSchema(
  photoData: {
    id: string;
    url: string;
    title?: string;
    description?: string;
    keywords?: string[];
    uploadDate?: string;
    creator?: string;
    thumbnailUrl?: string;
    width?: number;
    height?: number;
    fileSize?: number;
    mimeType?: string;
    location?: {
      name?: string;
      latitude?: number;
      longitude?: number;
    };
    device?: string;
  },
  config: SchemaOrgConfig = DEFAULT_CONFIG
): SchemaOrgPhotograph {
  const potentialActions: SchemaOrgAction[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'ViewAction',
      name: 'View Photo',
      target: photoData.url
    },
    {
      '@context': 'https://schema.org',
      '@type': 'EditAction',
      name: 'Edit Photo Metadata',
      target: `${config.baseUrl}/photos/${photoData.id}/edit`
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ShareAction',
      name: 'Share Photo',
      target: `${config.baseUrl}/photos/${photoData.id}/share`
    }
  ];

  const schema: SchemaOrgPhotograph = {
    '@context': 'https://schema.org',
    '@type': 'Photograph',
    identifier: photoData.id,
    name: photoData.title || `Photo ${photoData.id}`,
    description: photoData.description,
    contentUrl: photoData.url,
    thumbnailUrl: photoData.thumbnailUrl,
    width: photoData.width,
    height: photoData.height,
    contentSize: photoData.fileSize ? `${photoData.fileSize}` : undefined,
    encodingFormat: photoData.mimeType,
    keywords: photoData.keywords?.join(', '),
    dateCreated: photoData.uploadDate,
    creator: photoData.creator ? generatePersonSchema({ name: photoData.creator }, config) : undefined,
    device: photoData.device,
    potentialAction: potentialActions
  };

  // Add location if available
  if (photoData.location) {
    schema.locationCreated = {
      '@context': 'https://schema.org',
      '@type': 'Place',
      name: photoData.location.name,
      geo: photoData.location.latitude && photoData.location.longitude ? {
        '@context': 'https://schema.org',
        '@type': 'GeoCoordinates',
        latitude: photoData.location.latitude,
        longitude: photoData.location.longitude
      } : undefined
    };
  }

  return schema;
}

/**
 * Generate Person schema for creator information
 */
export function generatePersonSchema(
  personData: {
    name: string;
    email?: string;
    image?: string;
    givenName?: string;
    familyName?: string;
    socialProfiles?: string[];
  },
  config: SchemaOrgConfig = DEFAULT_CONFIG
): SchemaOrgPerson {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: personData.name,
    givenName: personData.givenName,
    familyName: personData.familyName,
    email: personData.email,
    image: personData.image,
    sameAs: personData.socialProfiles
  };
}

/**
 * Generate Action schema from AgentAction definition
 */
export function generateActionSchema(
  action: AgentAction,
  config: SchemaOrgConfig = DEFAULT_CONFIG
): SchemaOrgAction {
  // Determine Schema.org action type based on action ID
  const actionType = getSchemaOrgActionType(action.id);
  
  const target = action.id.includes('search') 
    ? {
        '@context': 'https://schema.org',
        '@type': 'EntryPoint',
        urlTemplate: `${config.baseUrl}/api/actions/${action.id}?{parameters}`,
        encodingType: 'application/json',
        httpMethod: 'POST' as const
      }
    : `${config.baseUrl}/api/actions/${action.id}`;

  const schema: SchemaOrgAction = {
    '@context': 'https://schema.org',
    '@type': actionType,
    identifier: action.id,
    name: action.name,
    description: action.description,
    target: target
  };

  // Add query-input for SearchAction
  if (actionType === 'SearchAction') {
    (schema as any)['query-input'] = 'required name=query';
  }

  return schema;
}

/**
 * Map action ID to appropriate Schema.org action type
 */
function getSchemaOrgActionType(actionId: string): SchemaOrgAction['@type'] {
  if (actionId.includes('search') || actionId.includes('filter')) {
    return 'SearchAction';
  }
  if (actionId.includes('view') || actionId.includes('show')) {
    return 'ViewAction';
  }
  if (actionId.includes('edit') || actionId.includes('update')) {
    return 'EditAction';
  }
  if (actionId.includes('share')) {
    return 'ShareAction';
  }
  if (actionId.includes('create') || actionId.includes('add')) {
    return 'CreateAction';
  }
  if (actionId.includes('delete') || actionId.includes('remove')) {
    return 'DeleteAction';
  }
  return 'Action';
}

/**
 * Validate Schema.org structured data against basic requirements
 */
export function validateSchemaOrg(data: SchemaOrgStructuredData): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required properties
  if (!data['@context'] || data['@context'] !== 'https://schema.org') {
    errors.push('Missing or invalid @context property');
  }

  if (!data['@type']) {
    errors.push('Missing @type property');
  }

  // Type-specific validations
  switch (data['@type']) {
    case 'WebApplication':
      validateWebApplication(data as SchemaOrgWebApplication, errors, warnings);
      break;
    case 'ImageGallery':
      validateImageGallery(data as SchemaOrgImageGallery, errors, warnings);
      break;
    case 'Photograph':
      validatePhotograph(data as SchemaOrgPhotograph, errors, warnings);
      break;
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate WebApplication schema
 */
function validateWebApplication(
  data: SchemaOrgWebApplication, 
  errors: string[], 
  warnings: string[]
): void {
  if (!data.name) {
    errors.push('WebApplication missing required name property');
  }

  if (!data.applicationCategory) {
    warnings.push('WebApplication missing applicationCategory property');
  }

  if (!data.operatingSystem) {
    warnings.push('WebApplication missing operatingSystem property');
  }
}

/**
 * Validate ImageGallery schema
 */
function validateImageGallery(
  data: SchemaOrgImageGallery, 
  errors: string[], 
  warnings: string[]
): void {
  if (typeof data.numberOfItems !== 'number') {
    errors.push('ImageGallery missing or invalid numberOfItems property');
  }

  if (!data.image || !Array.isArray(data.image)) {
    warnings.push('ImageGallery missing image array');
  }
}

/**
 * Validate Photograph schema
 */
function validatePhotograph(
  data: SchemaOrgPhotograph, 
  errors: string[], 
  warnings: string[]
): void {
  if (!data.contentUrl) {
    errors.push('Photograph missing required contentUrl property');
  }

  if (!data.name) {
    warnings.push('Photograph missing name property');
  }
}

/**
 * Minify Schema.org data for production use
 */
export function minifySchemaOrg(data: SchemaOrgStructuredData): SchemaOrgStructuredData {
  return JSON.parse(JSON.stringify(data, (key, value) => {
    // Remove undefined values
    if (value === undefined) {
      return undefined;
    }
    
    // Remove empty arrays
    if (Array.isArray(value) && value.length === 0) {
      return undefined;
    }
    
    // Remove empty objects
    if (typeof value === 'object' && value !== null && Object.keys(value).length === 0) {
      return undefined;
    }
    
    return value;
  }));
}

/**
 * Pretty print Schema.org data for debugging
 */
export function debugSchemaOrg(data: SchemaOrgStructuredData): string {
  return JSON.stringify(data, null, 2);
}

/**
 * Create a complete Schema.org data structure for a component
 */
export function createComponentSchema(
  componentType: string,
  componentData: any,
  actions: AgentAction[] = [],
  config: Partial<SchemaOrgConfig> = {}
): SchemaOrgStructuredData {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  
  // Add actions to component data
  const dataWithActions = {
    ...componentData,
    actions
  };

  // Determine Schema.org type from component type
  const schemaType = mapComponentTypeToSchemaOrgType(componentType);
  
  return generateSchemaOrgData(schemaType, dataWithActions, mergedConfig);
}

/**
 * Map component type to Schema.org type
 */
function mapComponentTypeToSchemaOrgType(componentType: string): SchemaOrgTypeName {
  switch (componentType.toLowerCase()) {
    case 'photogallery':
    case 'gallery':
      return 'ImageGallery';
    case 'photo':
    case 'image':
      return 'Photograph';
    case 'app':
    case 'application':
      return 'WebApplication';
    case 'person':
    case 'user':
      return 'Person';
    default:
      throw new Error(`Cannot map component type "${componentType}" to Schema.org type`);
  }
}