# Agent Action Registry

The Agent Action Registry provides programmatic access to all application functionality through a standardized JavaScript API. This allows AI agents to perform any action a human user could perform through the UI.

## Overview

The action registry exposes a global `window.agentActions` object containing all available actions with complete type definitions, parameter validation, and execution tracking.

## Core Concepts

### Action Structure
Every action follows a consistent structure:

```javascript
{
  id: 'unique-action-id',
  name: 'Human Readable Name',
  description: 'What this action does',
  category: 'photos|albums|search|user',
  parameters: {
    // Parameter definitions with types and validation
  },
  execute: async (params) => {
    // Implementation
  },
  permissions: ['read', 'write'],
  examples: [
    {
      description: 'Example usage',
      parameters: { /* example params */ }
    }
  ]
}
```

### Available Actions

#### Photo Management Actions

##### filterPhotos
Filter photos by various criteria:

```javascript
await window.agentActions.filterPhotos({
  keywords: ['sunset', 'beach'],
  dateRange: {
    start: '2023-01-01',
    end: '2023-12-31'
  },
  location: 'California',
  limit: 50
});
```

**Parameters:**
- `keywords` (array): Keywords to filter by
- `dateRange` (object): Start and end dates
- `location` (string): Location filter
- `limit` (number): Maximum results (default: 100)

##### getPhotoDetails
Get detailed information about a specific photo:

```javascript
await window.agentActions.getPhotoDetails({
  photoId: 'photo-12345'
});
```

##### updatePhotoMetadata
Update photo metadata:

```javascript
await window.agentActions.updatePhotoMetadata({
  photoId: 'photo-12345',
  updates: {
    title: 'New Title',
    description: 'Updated description',
    keywords: ['new', 'tags']
  }
});
```

#### Album Management Actions

##### createAlbum
Create a new photo album:

```javascript
await window.agentActions.createAlbum({
  name: 'Vacation 2023',
  description: 'Best photos from our summer vacation',
  photos: ['photo-1', 'photo-2', 'photo-3'],
  privacy: 'private'
});
```

##### addPhotosToAlbum
Add photos to an existing album:

```javascript
await window.agentActions.addPhotosToAlbum({
  albumId: 'album-456',
  photoIds: ['photo-789', 'photo-101']
});
```

##### getAlbumContents
Retrieve all photos in an album:

```javascript
await window.agentActions.getAlbumContents({
  albumId: 'album-456',
  includeMetadata: true
});
```

#### Search Actions

##### searchPhotos
Perform text-based photo search:

```javascript
await window.agentActions.searchPhotos({
  query: 'sunset mountains california',
  filters: {
    dateRange: { start: '2023-01-01' },
    minRating: 4
  },
  sort: 'relevance',
  limit: 25
});
```

##### searchSimilarPhotos
Find visually similar photos:

```javascript
await window.agentActions.searchSimilarPhotos({
  sourcePhotoId: 'photo-12345',
  similarity: 0.8,
  limit: 10
});
```

## Action Registry Explorer

import ActionRegistryExplorer from '@site/src/components/ActionRegistryExplorer';

<ActionRegistryExplorer />

## Implementation Details

### Parameter Validation

All actions include comprehensive parameter validation:

```javascript
const actionSchema = {
  id: 'filterPhotos',
  parameters: {
    keywords: {
      type: 'array',
      items: { type: 'string' },
      description: 'Keywords to filter by'
    },
    dateRange: {
      type: 'object',
      properties: {
        start: { type: 'string', format: 'date' },
        end: { type: 'string', format: 'date' }
      }
    },
    limit: {
      type: 'number',
      minimum: 1,
      maximum: 1000,
      default: 100
    }
  },
  required: []
};
```

### Error Handling

Actions provide detailed error information:

```javascript
try {
  const result = await window.agentActions.filterPhotos(params);
} catch (error) {
  console.log('Error type:', error.type);
  console.log('Error message:', error.message);
  console.log('Invalid parameters:', error.validationErrors);
}
```

### Progress Tracking

Long-running actions support progress callbacks:

```javascript
await window.agentActions.batchProcessPhotos({
  photoIds: ['photo-1', 'photo-2', /* ... many photos */],
  operation: 'generateThumbnails',
  onProgress: (progress) => {
    console.log(`Processing: ${progress.completed}/${progress.total}`);
  }
});
```

### Action Discovery

Agents can discover available actions:

```javascript
// Get all available actions
const allActions = window.agentActions.getRegistry();

// Get actions by category
const photoActions = window.agentActions.getActionsByCategory('photos');

// Get actions by permission requirement
const readOnlyActions = window.agentActions.getActionsByPermission('read');

// Search actions by capability
const searchActions = window.agentActions.searchActions('search');
```

## Integration Examples

### Browser Agent Integration

```javascript
// Gemini-in-Chrome can call actions directly
const photos = await window.agentActions.searchPhotos({
  query: 'family vacation beach',
  limit: 20
});

// Create an album with results
await window.agentActions.createAlbum({
  name: 'Beach Vacation Highlights',
  photos: photos.map(p => p.id)
});
```

### Voice Assistant Integration

```javascript
// Voice assistant processes natural language
const intent = await window.nlpProcessor.classifyIntent(
  "Show me sunset photos from last summer"
);

// Execute corresponding action
const results = await window.agentActions[intent.action](intent.parameters);
```

### Automation Workflows

```javascript
// Automated photo organization
const unorganizedPhotos = await window.agentActions.filterPhotos({
  albums: null, // Photos not in any album
  limit: 1000
});

// Group by date and create albums
const albumsByMonth = groupPhotosByMonth(unorganizedPhotos);
for (const [month, photos] of Object.entries(albumsByMonth)) {
  await window.agentActions.createAlbum({
    name: `Photos from ${month}`,
    photos: photos.map(p => p.id)
  });
}
```

## Security and Permissions

### Action Permissions

Each action declares required permissions:

```javascript
{
  id: 'deletePhoto',
  permissions: ['write', 'delete'],
  execute: async (params) => {
    // Implementation requires write and delete permissions
  }
}
```

### Rate Limiting

Actions include built-in rate limiting:

```javascript
{
  id: 'searchPhotos',
  rateLimit: {
    requests: 100,
    window: '1m' // 100 requests per minute
  }
}
```

### User Confirmation

Destructive actions can require user confirmation:

```javascript
{
  id: 'deleteAlbum',
  requiresConfirmation: true,
  confirmationMessage: 'This will permanently delete the album and cannot be undone.',
  execute: async (params, { confirmed }) => {
    if (!confirmed) {
      throw new Error('User confirmation required');
    }
    // Proceed with deletion
  }
}
```

## Best Practices

### 1. Action Naming
Use clear, consistent naming conventions:
- Verbs first: `createAlbum`, `deletePhoto`, `searchPhotos`
- Category prefixes for disambiguation: `photoSearch` vs `albumSearch`

### 2. Parameter Design
Design parameters for both programmatic and natural language use:

```javascript
// Good: Flexible parameter structure
{
  dateRange: {
    start: '2023-01-01',
    end: '2023-12-31'
  }
}

// Also good: Natural language friendly
{
  dateRange: 'last summer'  // Processed by NLP layer
}
```

### 3. Return Values
Provide consistent, rich return values:

```javascript
{
  success: true,
  data: [...],
  metadata: {
    totalCount: 150,
    executionTime: 245,
    fromCache: false
  }
}
```

### 4. Error Handling
Include actionable error information:

```javascript
{
  success: false,
  error: {
    type: 'ValidationError',
    message: 'Invalid photo ID format',
    field: 'photoId',
    expectedFormat: 'photo-[uuid]',
    receivedValue: 'invalid-id'
  }
}
```

## Testing Your Actions

The interactive explorer above allows you to:
- Browse all available actions
- Test actions with sample parameters
- View response formats
- Check error handling
- Measure performance

## Next Steps

- [Natural Language API](./natural-language-api.md) - Process natural language commands
- [Interactive Examples](./interactive-examples.md) - See complete workflows in action