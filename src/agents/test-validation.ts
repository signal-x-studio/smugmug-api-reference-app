/**
 * Test validation for agent infrastructure
 * This file validates that all our TypeScript interfaces compile correctly
 */

import { AgentAction, AgentActionResult } from './interfaces/agent-action';
import { SchemaOrgPhotograph, SchemaOrgImageGallery } from './interfaces/schema-org';
import { SemanticQuery, Entity } from './interfaces/semantic-query';
import { AgentStateExposure, DualInterfaceConfig } from './interfaces/state-exposure';

// Test AgentAction interface
const testAction: AgentAction = {
  id: 'photo-gallery.filter',
  name: 'Filter Photos',
  description: 'Filter photos by criteria',
  parameters: [
    {
      name: 'keywords',
      type: 'array',
      required: true,
      description: 'Keywords to filter by'
    }
  ],
  returns: {
    type: 'object',
    description: 'Filtered photos result'
  },
  permissions: ['read'],
  humanEquivalent: 'Use filter controls',
  examples: [
    {
      description: 'Filter sunset photos',
      input: { keywords: ['sunset'] },
      output: { photos: [], count: 0 }
    }
  ]
};

// Test Schema.org interfaces
const testPhotograph: SchemaOrgPhotograph = {
  '@context': 'https://schema.org',
  '@type': 'Photograph',
  identifier: 'photo-123',
  name: 'Test Photo',
  contentUrl: 'https://example.com/photo.jpg'
};

const testGallery: SchemaOrgImageGallery = {
  '@context': 'https://schema.org',
  '@type': 'ImageGallery',
  numberOfItems: 1,
  image: [testPhotograph]
};

// Test SemanticQuery interface
const testQuery: SemanticQuery = {
  intent: 'filter',
  entities: [
    {
      type: 'KEYWORD',
      value: 'sunset',
      confidence: 0.9,
      span: { start: 0, end: 6 }
    }
  ],
  confidence: 0.85,
  parameters: { keywords: ['sunset'] },
  suggestedActions: [testAction],
  originalQuery: 'show sunset photos'
};

// Test AgentStateExposure interface
const testStateExposure: AgentStateExposure = {
  componentId: 'test-component',
  currentState: { photos: [] },
  availableActions: [testAction],
  stateActions: {
    get: () => ({}),
    set: () => {},
    reset: () => {},
    subscribe: () => ({
      id: 'sub-1',
      unsubscribe: () => {},
      isActive: true,
      createdAt: Date.now()
    })
  },
  structuredData: testGallery,
  metadata: {
    componentType: 'PhotoGallery',
    version: '1.0.0',
    capabilities: [
      {
        name: 'filter',
        description: 'Filter photos',
        enabled: true,
        performanceImpact: 'low'
      }
    ],
    dataTypes: ['photo'],
    interactionPatterns: ['read-write'],
    relationships: [],
    performanceProfile: {
      averageResponseTime: 100,
      throughput: 1000,
      memoryUsage: 1024
    },
    lastUpdated: Date.now()
  },
  security: {
    accessLevel: 'read-only',
    allowedOperations: ['read'],
    deniedOperations: ['delete'],
    auditLogging: {
      enabled: true,
      logLevel: 'standard',
      includeStateSnapshots: false
    },
    dataSanitization: {
      excludeFields: ['password'],
      maskFields: ['email']
    }
  },
  performance: {
    interactionCount: 0,
    averageResponseTime: 0,
    memoryUsage: 0,
    cpuUsage: 0,
    errorRate: 0,
    lastMeasurement: Date.now(),
    performanceTrend: []
  }
};

// Test DualInterfaceConfig
const testConfig: DualInterfaceConfig = {
  componentId: 'test-component',
  data: { photos: [] },
  state: { filter: '' },
  setState: () => {}
};

// If this file compiles without errors, our TypeScript interfaces are valid
console.log('Agent infrastructure TypeScript validation passed!');

export {
  testAction,
  testPhotograph,
  testGallery,
  testQuery,
  testStateExposure,
  testConfig
};