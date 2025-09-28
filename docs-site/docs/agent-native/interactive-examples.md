# Interactive Examples

Experience agent-native architecture in action with these interactive examples. See how AI agents can seamlessly interact with photo management applications through natural language commands and programmatic actions.

## Agent Playground

Try out different agent interaction patterns in our interactive playground:

import AgentPlayground from '@site/src/components/AgentPlayground';

<AgentPlayground />

## Example Scenarios

### Scenario 1: Photo Discovery and Organization

**Human Goal:** "I want to find my best vacation photos and create an album"

**Agent Interaction Flow:**

1. **Natural Language Input:** "Show me my best vacation photos from this summer"

2. **Intent Classification:**
   ```json
   {
     "intent": "filterPhotos",
     "parameters": {
       "keywords": ["vacation"],
       "dateRange": { "start": "2023-06-01", "end": "2023-08-31" },
       "quality": "high-rating"
     },
     "confidence": 0.89
   }
   ```

3. **Action Execution:**
   ```javascript
   const photos = await window.agentActions.filterPhotos({
     keywords: ["vacation"],
     dateRange: { start: "2023-06-01", end: "2023-08-31" },
     minRating: 4,
     limit: 50
   });
   ```

4. **Follow-up Command:** "Create an album with these photos called 'Summer Adventures'"

5. **Album Creation:**
   ```javascript
   await window.agentActions.createAlbum({
     name: "Summer Adventures",
     photos: photos.map(p => p.id),
     description: "Best photos from summer 2023 vacation"
   });
   ```

### Scenario 2: Batch Photo Processing

**Human Goal:** "Organize my messy photo collection automatically"

**Agent Interaction Flow:**

1. **Natural Language Input:** "Organize all my unorganized photos by date and remove duplicates"

2. **Intent Classification:**
   ```json
   {
     "intent": "batchOrganizePhotos", 
     "parameters": {
       "method": "byDate",
       "removeDuplicates": true,
       "scope": "unorganized"
     },
     "confidence": 0.76,
     "requiresConfirmation": true
   }
   ```

3. **Confirmation Dialog:** Agent presents summary and asks for confirmation

4. **Batch Processing:**
   ```javascript
   await window.agentActions.batchOrganizePhotos({
     scope: { albums: null }, // Unorganized photos
     method: "byDate",
     createAlbums: true,
     removeDuplicates: true,
     onProgress: (progress) => {
       updateProgress(progress);
     }
   });
   ```

### Scenario 3: Smart Tagging Workflow

**Human Goal:** "Tag all my outdoor photos appropriately"

**Agent Interaction Flow:**

1. **Natural Language Input:** "Find all outdoor photos and tag them based on what you see"

2. **Multi-step Processing:**
   ```javascript
   // Step 1: Find outdoor photos
   const outdoorPhotos = await window.agentActions.searchPhotos({
     query: "outdoor nature landscape mountain beach",
     aiClassification: true
   });

   // Step 2: Analyze each photo for smart tagging
   for (const photo of outdoorPhotos) {
     const analysis = await window.agentActions.analyzePhoto({
       photoId: photo.id,
       analysisTypes: ["scene", "objects", "weather", "time-of-day"]
     });

     // Step 3: Apply intelligent tags
     await window.agentActions.updatePhotoMetadata({
       photoId: photo.id,
       updates: {
         keywords: [...photo.keywords, ...analysis.suggestedTags],
         location: analysis.detectedLocation,
         weatherConditions: analysis.weather
       }
     });
   }
   ```

## Real-World Integration Examples

### Browser Agent (Gemini-in-Chrome) Integration

Show how browser agents can interact with your photo application:

```javascript
// Browser agent observes the page
const pageContext = window.agentState.getCurrentContext();

// User says: "Share the photos I'm looking at with my family"
const visiblePhotos = pageContext.visibleItems
  .filter(item => item.type === 'photograph');

// Agent executes sharing workflow
await window.agentActions.sharePhotos({
  photoIds: visiblePhotos.map(p => p.id),
  recipients: ['family-group'],
  message: 'Check out these photos!',
  permissions: 'view-only'
});
```

### Voice Assistant Integration

Example of voice-controlled photo management:

```javascript
// Voice assistant processes speech-to-text
const voiceCommand = "Hey Assistant, create a slideshow of my dog photos";

// NLP processing with voice context
const intent = await window.nlpProcessor.processQuery(voiceCommand, {
  inputMode: 'voice',
  userPreferences: { pets: ['dog'] },
  confidenceBoost: 0.1 // Account for speech recognition
});

// Execute slideshow creation
if (intent.understanding.confidence > 0.8) {
  await window.agentActions.createSlideshow({
    criteria: { keywords: ['dog'] },
    autoStart: true,
    duration: 300000, // 5 minutes
    transition: 'fade'
  });
}
```

### Workflow Automation

Automated photo management workflows:

```javascript
// Define workflow trigger
window.agentActions.registerWorkflow({
  name: 'dailyPhotoOrganization',
  trigger: { schedule: 'daily', time: '02:00' },
  actions: [
    {
      action: 'filterPhotos',
      parameters: { 
        dateRange: { start: 'yesterday' },
        albums: null // Unorganized
      }
    },
    {
      action: 'analyzePhotos',
      parameters: { 
        analysisTypes: ['duplicates', 'quality', 'faces'] 
      }
    },
    {
      action: 'batchProcessPhotos',
      parameters: {
        operations: ['generateThumbnails', 'extractMetadata']
      }
    },
    {
      action: 'suggestAlbums',
      parameters: { method: 'smartGrouping' }
    }
  ],
  notifications: {
    onComplete: 'email',
    onError: 'push'
  }
});
```

## Advanced Interaction Patterns

### Multi-Turn Conversations

Handle complex conversations that build context over multiple exchanges:

```javascript
// Turn 1: Initial request
const context1 = await window.nlpProcessor.processQuery(
  "Show me photos from my last vacation",
  { conversationId: 'conv-123' }
);

// Turn 2: Refinement
const context2 = await window.nlpProcessor.processQuery(
  "Just the ones with Sarah in them",
  { 
    conversationId: 'conv-123',
    maintainContext: true,
    previousResults: context1.results
  }
);

// Turn 3: Action
const context3 = await window.nlpProcessor.processQuery(
  "Create a slideshow with these",
  { 
    conversationId: 'conv-123', 
    maintainContext: true,
    targetPhotos: context2.results
  }
);
```

### Contextual State Awareness

Agents can understand and work with current application state:

```javascript
// Agent observes current page state
const currentState = window.agentState.getSnapshot();

// User command: "Add these to my favorites"
// Agent knows "these" refers to currently selected photos
const selectedPhotos = currentState.photoGallery.selectedItems;

await window.agentActions.updatePhotoMetadata({
  photoIds: selectedPhotos.map(p => p.id),
  updates: { 
    tags: [...existingTags, 'favorite'],
    rating: Math.max(currentRating, 4)
  }
});

// Update UI state for immediate feedback
window.agentState.updatePhotoSelection({
  action: 'addTag',
  tag: 'favorite',
  photoIds: selectedPhotos.map(p => p.id)
});
```

### Error Handling and Recovery

Graceful handling of ambiguous or failed requests:

```javascript
try {
  const result = await window.nlpProcessor.processQuery(
    "Delete the bad photos"
  );
  
  if (result.understanding.confidence < 0.7) {
    // Low confidence - ask for clarification
    const clarification = await window.agentActions.requestClarification({
      originalQuery: "Delete the bad photos",
      ambiguity: "What criteria define 'bad photos'?",
      suggestions: [
        "Photos with low rating (1-2 stars)?",
        "Blurry or out-of-focus photos?", 
        "Photos marked for deletion?",
        "Duplicate photos?"
      ]
    });
    
    // Process clarified intent
    const refinedResult = await window.nlpProcessor.processQuery(
      clarification.userChoice,
      { 
        conversationId: result.conversationId,
        originalContext: result.understanding 
      }
    );
  }
} catch (error) {
  // Fallback to alternative interaction method
  window.agentActions.showErrorDialog({
    message: "I couldn't understand that request",
    suggestions: [
      "Try being more specific about which photos to delete",
      "Use the manual selection tools instead", 
      "Ask me to help identify photos to delete"
    ]
  });
}
```

## Performance Monitoring

Track agent interaction performance and optimize user experience:

```javascript
// Monitor agent performance
window.agentActions.onActionComplete((action, metrics) => {
  console.log('Action Performance:', {
    actionId: action.id,
    executionTime: metrics.duration,
    parametersSize: JSON.stringify(action.parameters).length,
    resultSize: metrics.resultSize,
    fromCache: metrics.cached,
    userSatisfaction: metrics.userRating
  });
  
  // Optimize based on performance data
  if (metrics.duration > 5000) {
    // Long-running action - suggest caching or batching
    window.agentActions.suggestOptimization({
      action: action.id,
      suggestion: 'caching',
      reason: 'slow execution time'
    });
  }
});

// A/B test different interaction patterns
window.agentActions.enableExperiment({
  name: 'nlp-confidence-threshold',
  variants: {
    A: { threshold: 0.8 },
    B: { threshold: 0.7 }
  },
  metrics: ['user-satisfaction', 'task-completion-rate']
});
```

## Testing Agent Interactions

### Unit Testing Agent Actions

```javascript
// Test action execution
describe('Agent Actions', () => {
  test('filterPhotos returns expected results', async () => {
    const result = await window.agentActions.filterPhotos({
      keywords: ['sunset'],
      dateRange: { start: '2023-01-01', end: '2023-12-31' }
    });
    
    expect(result.success).toBe(true);
    expect(result.data.length).toBeGreaterThan(0);
    expect(result.data[0]).toHaveProperty('id');
    expect(result.data[0]).toHaveProperty('keywords');
  });
});
```

### Integration Testing

```javascript
// Test complete agent workflow
describe('Agent Workflows', () => {
  test('photo organization workflow completes successfully', async () => {
    // Step 1: Natural language processing
    const nlpResult = await window.nlpProcessor.processQuery(
      "Organize my vacation photos by location"
    );
    
    expect(nlpResult.understanding.intent).toBe('batchOrganizePhotos');
    
    // Step 2: Action execution
    const actionResult = await window.agentActions[nlpResult.understanding.intent](
      nlpResult.understanding.parameters
    );
    
    expect(actionResult.success).toBe(true);
    expect(actionResult.data.albumsCreated).toBeGreaterThan(0);
    
    // Step 3: State synchronization
    const updatedState = window.agentState.getSnapshot();
    expect(updatedState.albums.length).toBeGreaterThan(0);
  });
});
```

## Best Practices for Agent-Native UX

### 1. Progressive Disclosure
Start with simple interactions and gradually expose advanced features:

```javascript
// Level 1: Basic commands
"Show me photos" → Simple photo filtering

// Level 2: Contextual commands  
"Show me more like this" → AI-powered similarity search

// Level 3: Complex workflows
"Organize my photos like a professional photographer would" → Advanced AI curation
```

### 2. Immediate Feedback
Provide instant feedback for agent actions:

```javascript
window.agentActions.onActionStart((action) => {
  showLoadingIndicator({
    message: `${action.description}...`,
    estimatedTime: action.estimatedDuration
  });
});

window.agentActions.onActionProgress((progress) => {
  updateProgressBar({
    completed: progress.completed,
    total: progress.total,
    currentStep: progress.currentStep
  });
});
```

### 3. Explainable Actions
Help users understand what agents are doing:

```javascript
const result = await window.agentActions.smartOrganizePhotos({
  explanation: true
});

showActionExplanation({
  what: "I organized 1,247 photos into 23 albums",
  how: "Based on date, location, and people recognition",
  why: "This makes your photos easier to find and browse",
  undoAvailable: true
});
```

## Next Steps

Ready to implement agent-native features in your application?

- [Implementation Guide](./implementation-guide.md) - Step-by-step development guide
- [Action Registry](./action-registry.md) - Available programmatic actions  
- [Natural Language API](./natural-language-api.md) - Process natural language commands
- [Structured Data](./structured-data.md) - Make your content discoverable to agents