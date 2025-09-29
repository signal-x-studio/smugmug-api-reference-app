# Natural Language API

The Natural Language API enables AI agents to interact with your photo management application using natural language commands. This API processes text input, classifies user intent, extracts parameters, and translates queries into executable actions.

## Overview

The Natural Language Processing (NLP) system is accessible through `window.nlpProcessor` and provides:

- **Intent Classification**: Understand what the user wants to do
- **Parameter Extraction**: Pull relevant details from natural language
- **Query Translation**: Convert queries into structured action calls
- **Confidence Scoring**: Measure certainty of interpretations
- **Ambiguity Handling**: Request clarification when needed

## Core API Methods

### classifyIntent(text, context?)

Analyzes text to determine user intent and extract parameters.

```javascript
const result = await window.nlpProcessor.classifyIntent(
  "Show me sunset photos from last summer",
  { currentView: 'gallery', userPreferences: {...} }
);

// Returns:
{
  intent: 'filterPhotos',
  parameters: {
    keywords: ['sunset'],
    dateRange: { start: '2023-06-01', end: '2023-08-31' },
    context: 'seasonal'
  },
  confidence: 0.92,
  alternativeIntents: [
    { intent: 'searchPhotos', confidence: 0.15 }
  ]
}
```

### extractEntities(text)

Extracts structured entities from natural language text.

```javascript
const entities = await window.nlpProcessor.extractEntities(
  "Find photos of John and Sarah at the beach in California from December 2022"
);

// Returns:
{
  people: ['John', 'Sarah'],
  locations: ['beach', 'California'],
  dates: [{ year: 2022, month: 12 }],
  keywords: ['beach'],
  confidence: {
    people: 0.95,
    locations: 0.88,
    dates: 0.99
  }
}
```

### processQuery(text, options?)

Complete query processing pipeline from text to executable action.

```javascript
const result = await window.nlpProcessor.processQuery(
  "Create an album called 'Best of 2023' with my highest rated photos",
  { 
    autoExecute: false,  // Don't execute immediately
    requireConfirmation: true 
  }
);

// Returns:
{
  understanding: {
    intent: 'createAlbum',
    parameters: {
      name: 'Best of 2023',
      criteria: { minRating: 4 },
      autoSelect: true
    },
    confidence: 0.89
  },
  action: {
    id: 'createAlbum',
    parameters: {...},
    estimatedResults: 23
  },
  needsConfirmation: true,
  confirmationMessage: "Create album 'Best of 2023' with 23 highly rated photos?"
}
```

## Supported Intent Categories

### Photo Operations

#### Filter and Search Intents
- **"Show me photos from [time]"** → `filterPhotos` with date parameters
- **"Find pictures of [subject]"** → `searchPhotos` with keyword parameters  
- **"Photos taken in [location]"** → `filterPhotos` with location parameters
- **"My best [category] photos"** → `filterPhotos` with rating/category filters

#### Photo Management Intents
- **"Delete this photo"** → `deletePhoto` action
- **"Tag these photos as [tag]"** → `updatePhotoMetadata` with keyword updates
- **"Set this as my profile picture"** → `setProfilePhoto` action
- **"Download these photos"** → `exportPhotos` action

### Album Operations

#### Album Creation
- **"Create album [name]"** → `createAlbum` with specified name
- **"Make a slideshow of [criteria]"** → `createAlbum` with presentation mode
- **"Group photos by [criteria]"** → Multiple `createAlbum` calls with grouping logic

#### Album Management  
- **"Add these photos to [album]"** → `addPhotosToAlbum` 
- **"Remove [photo] from [album]"** → `removePhotosFromAlbum`
- **"Rename album to [name]"** → `updateAlbumMetadata`

### Batch Operations

#### Smart Organization
- **"Organize my photos automatically"** → `batchOrganizePhotos`
- **"Find and delete duplicates"** → `findDuplicates` + confirmation
- **"Clean up blurry photos"** → `filterPhotos` with quality filters

#### Bulk Updates
- **"Tag all beach photos as vacation"** → `batchUpdateMetadata`
- **"Resize all photos in this album"** → `batchProcessPhotos` 
- **"Generate thumbnails for new uploads"** → `batchProcessPhotos`

## Natural Language Query Tester

Try out the natural language processing capabilities:

import NaturalLanguageQueryTester from '@site/src/components/NaturalLanguageQueryTester';

<NaturalLanguageQueryTester />

## Entity Recognition Patterns

### Date and Time Parsing

The NLP system recognizes various temporal expressions:

```javascript
// Absolute dates
"photos from January 15, 2023" → { start: '2023-01-15', end: '2023-01-15' }
"pictures taken on Christmas 2022" → { start: '2022-12-25', end: '2022-12-25' }

// Relative dates  
"photos from last week" → { start: '2023-10-01', end: '2023-10-07' }
"recent photos" → { start: '2023-10-01', end: 'now' }
"older photos" → { end: '2022-12-31' }

// Seasonal references
"summer vacation photos" → { start: '2023-06-01', end: '2023-08-31' }
"holiday photos" → { start: '2023-11-15', end: '2024-01-15' }

// Special occasions
"birthday photos" → Tagged with 'birthday', date context
"wedding photos" → Tagged with 'wedding', formal event context
```

### Location Recognition

```javascript
// Specific places
"photos from Paris" → { location: 'Paris', type: 'city' }
"beach photos" → { keywords: ['beach'], locationContext: 'coastal' }
"mountain hiking pictures" → { keywords: ['mountain', 'hiking'], activity: 'outdoor' }

// Geographic regions  
"California road trip photos" → { region: 'California', activity: 'travel' }
"European vacation photos" → { region: 'Europe', activity: 'travel' }

// Venue types
"restaurant photos" → { venueType: 'restaurant', category: 'food' }
"concert photos" → { venueType: 'venue', category: 'music' }
```

### People Recognition

```javascript
// Named individuals
"photos of Sarah" → { people: ['Sarah'] }
"pictures with John and Mike" → { people: ['John', 'Mike'] }

// Relationship contexts
"family photos" → { category: 'family', peopleContext: 'related' }
"friend photos" → { category: 'social', peopleContext: 'friends' }
"selfies" → { category: 'self', composition: 'selfie' }

// Group dynamics
"group photos" → { composition: 'group', minPeople: 3 }
"couple photos" → { composition: 'couple', exactPeople: 2 }
```

## Advanced Features

### Multi-Turn Conversations

The NLP system maintains conversation context:

```javascript
// Initial query
await window.nlpProcessor.processQuery("Show me vacation photos");

// Follow-up query (maintains context)
await window.nlpProcessor.processQuery(
  "Now just the ones from Italy",
  { conversationId: 'conv-123', maintainContext: true }
);

// Further refinement
await window.nlpProcessor.processQuery(
  "Create an album with the best ones",
  { conversationId: 'conv-123', maintainContext: true }
);
```

### Ambiguity Resolution

When queries are ambiguous, the system requests clarification:

```javascript
const result = await window.nlpProcessor.processQuery("Delete these photos");

if (result.needsClarification) {
  // Returns:
  {
    clarificationNeeded: true,
    ambiguity: {
      type: 'referenceAmbiguity',
      field: 'photoSelection',
      question: 'Which photos would you like to delete?',
      options: [
        'Currently selected photos (5 items)',
        'All photos in current view (127 items)', 
        'All photos in current album (43 items)'
      ]
    }
  }
}
```

### Confidence Thresholds

Configure confidence requirements for different action types:

```javascript
window.nlpProcessor.configure({
  confidenceThresholds: {
    destructiveActions: 0.95,  // Delete, overwrite operations
    creativeActions: 0.80,     // Create albums, tag photos  
    queryActions: 0.60,        // Search, filter operations
    ambiguousActions: 0.85     // Actions affecting multiple items
  },
  fallbackBehavior: 'requestClarification'
});
```

## Integration Patterns

### Voice Assistant Integration

```javascript
// Voice assistant processes speech-to-text
const speechText = "Find my sunset photos and create a slideshow";

// NLP processes the text intent
const nlpResult = await window.nlpProcessor.processQuery(speechText, {
  inputMode: 'voice',
  confidenceBoost: 0.1  // Account for speech recognition uncertainty
});

// Execute the resulting action
if (nlpResult.understanding.confidence > 0.8) {
  await window.agentActions[nlpResult.action.id](nlpResult.action.parameters);
}
```

### Browser Agent Integration

```javascript
// Browser agent observes page context
const pageContext = {
  currentView: 'album-view',
  selectedPhotos: ['photo-1', 'photo-2'],
  visibleAlbums: ['vacation-2023', 'family-photos']
};

// Natural language command with context
const result = await window.nlpProcessor.processQuery(
  "Add these to my family album",
  { context: pageContext }
);

// Context helps resolve "these" and "family album"
// Result: addPhotosToAlbum({ albumId: 'family-photos', photoIds: ['photo-1', 'photo-2'] })
```

### Workflow Automation

```javascript
// Define natural language workflow triggers
const workflows = [
  {
    trigger: /organize my (.*) photos/i,
    handler: async (match, context) => {
      const category = match[1];
      return await window.nlpProcessor.processQuery(
        `Create albums by date for all ${category} photos and remove duplicates`,
        { batchMode: true, requireConfirmation: true }
      );
    }
  }
];

// Register workflows with NLP processor
window.nlpProcessor.registerWorkflows(workflows);
```

## Error Handling and Fallbacks

### Graceful Degradation

```javascript
try {
  const result = await window.nlpProcessor.processQuery(userInput);
  
  if (result.understanding.confidence < 0.6) {
    // Low confidence - offer alternatives
    showAlternativeSuggestions(result.alternativeIntents);
  } else {
    // High confidence - proceed with action
    executeAction(result.action);
  }
} catch (error) {
  if (error.type === 'UnsupportedIntent') {
    // Fallback to traditional search
    fallbackToKeywordSearch(userInput);
  } else {
    // Handle other errors gracefully
    showErrorMessage('Sorry, I didn\'t understand that. Try rephrasing?');
  }
}
```

### Learning from Corrections

```javascript
// When user corrects an interpretation
window.nlpProcessor.submitCorrection({
  originalQuery: "Show me beach photos",
  originalIntent: { intent: 'searchPhotos', parameters: { keywords: ['beach'] } },
  correctedIntent: { intent: 'filterPhotos', parameters: { location: 'beach' } },
  feedback: 'User wanted location filter, not keyword search'
});
```

## Performance Optimization

### Caching Strategies

```javascript
// Cache common query patterns
window.nlpProcessor.configure({
  caching: {
    enabled: true,
    ttl: 300000, // 5 minutes
    maxEntries: 1000,
    keyStrategy: 'semantic' // Cache by meaning, not exact text
  }
});
```

### Batch Processing

```javascript
// Process multiple queries efficiently
const queries = [
  "sunset photos",
  "beach vacation pictures", 
  "family dinner photos"
];

const results = await window.nlpProcessor.batchProcess(queries, {
  parallel: true,
  shareContext: false
});
```

## Best Practices

### 1. Provide Context
Always include relevant context to improve interpretation accuracy:

```javascript
const context = {
  currentPage: 'album-view',
  selectedItems: [...],
  userPreferences: {...},
  recentActions: [...]
};

await window.nlpProcessor.processQuery(query, { context });
```

### 2. Handle Confidence Appropriately
Use confidence scores to determine appropriate actions:

```javascript
if (confidence > 0.9) {
  executeImmediately();
} else if (confidence > 0.7) {
  showConfirmationDialog();
} else {
  requestClarification();
}
```

### 3. Provide Feedback
Help users understand what the system interpreted:

```javascript
const result = await window.nlpProcessor.processQuery(query);

showInterpretation({
  understood: result.understanding.summary,
  action: result.action.description,
  confidence: result.understanding.confidence
});
```

### 4. Enable Corrections
Allow users to correct misinterpretations:

```javascript
if (result.understanding.confidence < 0.8) {
  showAlternatives({
    primary: result.understanding,
    alternatives: result.alternativeIntents,
    allowEdit: true
  });
}
```

## Next Steps

- [Action Registry](./action-registry.md) - Explore available programmatic actions
- [Interactive Examples](./interactive-examples.md) - Complete agent interaction workflows
- [Implementation Guide](./implementation-guide.md) - Add agent-native features to your app