---
sidebar_position: 1
---

# AI Integration Patterns

This guide demonstrates the structured approach to AI integration used in this project. The key insight: treat AI APIs like any other external service with proper abstractions, error handling, and predictable responses.

## The Schema-First Approach

The most critical decision for reliable AI integration is using **structured JSON responses** with schema enforcement. This transforms the probabilistic nature of LLMs into deterministic, API-like behavior.

### Defining Response Schemas

```typescript
// From services/geminiService.ts
const PHOTO_METADATA_SCHEMA = {
  type: "object",
  properties: {
    title: {
      type: "string",
      description: "A descriptive, engaging title for the photo"
    },
    description: {
      type: "string", 
      description: "Detailed description of what's shown in the photo"
    },
    keywords: {
      type: "array",
      items: { type: "string" },
      description: "Relevant keywords for categorization and search"
    },
    technicalDetails: {
      type: "object",
      properties: {
        estimatedLocation: { type: "string" },
        timeOfDay: { type: "string" },
        weather: { type: "string" },
        photographyStyle: { type: "string" }
      }
    },
    suggestedAlbums: {
      type: "array",
      items: { type: "string" },
      description: "Suggested album names where this photo would fit"
    }
  },
  required: ["title", "description", "keywords"],
  additionalProperties: false
};
```

### Schema Benefits

1. **Predictable Responses**: Always get the expected data structure
2. **Type Safety**: Perfect integration with TypeScript
3. **Error Prevention**: Invalid responses are caught early
4. **Documentation**: Schema serves as API documentation

## Service Layer Architecture

All AI interactions go through a dedicated service layer, following the same patterns as any external API integration.

### Core Service Structure

```typescript
// services/geminiService.ts
import { GoogleGenerativeAI } from '@google/genai';

export const generatePhotoMetadata = async (
  image: File,
  customInstructions: string,
  apiKey: string
): Promise<ImageMetadata> => {
  // Input validation
  if (!apiKey) {
    throw new Error('API key is required for AI metadata generation');
  }
  
  if (!image || !image.type.startsWith('image/')) {
    throw new Error('Valid image file is required');
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: PHOTO_METADATA_SCHEMA
      }
    });

    // Convert image to the format Gemini expects
    const imageBytes = await fileToGenerativePart(image);
    
    // Construct detailed prompt
    const prompt = buildMetadataPrompt(customInstructions);
    
    // Make the API call with structured response
    const result = await model.generateContent([prompt, imageBytes]);
    const responseText = result.response.text();
    
    // Parse and validate the JSON response
    const metadata = JSON.parse(responseText) as ImageMetadata;
    
    // Additional validation if needed
    validateMetadata(metadata);
    
    return metadata;
    
  } catch (error) {
    // Structured error handling
    if (error.message?.includes('quota')) {
      throw new Error('API quota exceeded. Please try again later.');
    } else if (error.message?.includes('invalid')) {
      throw new Error('Invalid image format. Please use JPEG, PNG, or WebP.');
    } else {
      throw new Error(`AI metadata generation failed: ${error.message}`);
    }
  }
};
```

## Advanced Integration Patterns

### Pattern 1: Batch Processing with Rate Limiting

```typescript
export const batchProcessPhotos = async (
  photos: File[],
  settings: AiSettings,
  onProgress: (processed: number, total: number) => void
): Promise<PhotoProcessingResult[]> => {
  const results: PhotoProcessingResult[] = [];
  const BATCH_SIZE = 3; // Process 3 photos simultaneously
  const RATE_LIMIT_DELAY = 1000; // 1 second between batches
  
  for (let i = 0; i < photos.length; i += BATCH_SIZE) {
    const batch = photos.slice(i, i + BATCH_SIZE);
    
    // Process batch concurrently
    const batchPromises = batch.map(async (photo, index) => {
      try {
        const metadata = await generatePhotoMetadata(
          photo, 
          settings.customInstructions, 
          settings.apiKey
        );
        return { success: true, photo, metadata };
      } catch (error) {
        return { success: false, photo, error: error.message };
      }
    });
    
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
    
    // Update progress
    onProgress(results.length, photos.length);
    
    // Rate limiting delay between batches
    if (i + BATCH_SIZE < photos.length) {
      await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY));
    }
  }
  
  return results;
};
```

### Pattern 2: Smart Album Matching

```typescript
export const doesImageMatchPrompt = async (
  image: File,
  albumPrompt: string,
  apiKey: string
): Promise<AlbumMatchResult> => {
  const MATCH_SCHEMA = {
    type: "object",
    properties: {
      matches: { type: "boolean" },
      confidence: { type: "number", minimum: 0, maximum: 1 },
      reasoning: { type: "string" },
      suggestedKeywords: {
        type: "array",
        items: { type: "string" }
      }
    },
    required: ["matches", "confidence", "reasoning"]
  };

  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: MATCH_SCHEMA
    }
  });

  const prompt = `
    You are evaluating whether this image matches the following album criteria: "${albumPrompt}"
    
    Analyze the image and determine:
    1. Does it match the criteria? (true/false)
    2. How confident are you? (0.0 to 1.0)
    3. What's your reasoning?
    4. What keywords would help categorize this image?
    
    Be precise and consider both obvious and subtle matches.
  `;

  const imageBytes = await fileToGenerativePart(image);
  const result = await model.generateContent([prompt, imageBytes]);
  
  return JSON.parse(result.response.text()) as AlbumMatchResult;
};
```

### Pattern 3: Custom Instruction Processing

```typescript
const buildMetadataPrompt = (customInstructions: string): string => {
  const basePrompt = `
    You are an expert photo archivist and metadata specialist.
    Analyze this image and generate comprehensive metadata.
    
    Focus on:
    - Descriptive, engaging titles that capture the essence
    - Detailed descriptions of visual elements, mood, and context  
    - Relevant keywords for organization and discoverability
    - Technical observations about lighting, composition, style
    - Suggestions for album categorization
  `;
  
  const customSection = customInstructions 
    ? `\n\nAdditional Instructions:\n${customInstructions}`
    : '';
    
  const formatRequirement = `
    
    Your response must be valid JSON matching the required schema.
    Do not include any explanations outside the JSON structure.
  `;
  
  return basePrompt + customSection + formatRequirement;
};
```

## Error Handling Strategies

### Graceful Degradation

```typescript
const handleAIError = (error: Error, fallbackData?: Partial<ImageMetadata>) => {
  // Log for debugging but don't crash the UI
  console.error('AI Service Error:', error);
  
  if (error.message.includes('quota')) {
    return {
      title: fallbackData?.title || 'Photo',
      description: 'AI analysis temporarily unavailable - quota exceeded',
      keywords: fallbackData?.keywords || ['photo'],
      aiGenerated: false,
      error: 'quota_exceeded'
    };
  }
  
  if (error.message.includes('network')) {
    return {
      title: fallbackData?.title || 'Photo',
      description: 'AI analysis failed due to network issues',
      keywords: fallbackData?.keywords || ['photo'],
      aiGenerated: false,
      error: 'network_error'
    };
  }
  
  // Generic fallback
  return {
    title: 'Untitled Photo',
    description: 'AI analysis not available',
    keywords: ['photo'],
    aiGenerated: false,
    error: 'unknown'
  };
};
```

### Retry Logic with Exponential Backoff

```typescript
const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Don't retry on certain errors
      if (error.message.includes('invalid') || error.message.includes('unauthorized')) {
        throw error;
      }
      
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
};
```

## Performance Optimization

### Image Preprocessing

```typescript
const fileToGenerativePart = async (file: File): Promise<GenerativePart> => {
  // Optimize image size for API efficiency
  const optimizedFile = await optimizeImageForAI(file);
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = (reader.result as string).split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: optimizedFile.type
        }
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(optimizedFile);
  });
};

const optimizeImageForAI = async (file: File): Promise<File> => {
  // Skip optimization if file is already small
  if (file.size < 1024 * 1024) { // 1MB
    return file;
  }
  
  // Create canvas for resizing
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const img = new Image();
  
  return new Promise((resolve) => {
    img.onload = () => {
      // Calculate optimal dimensions (max 1024px on longest side)
      const maxDimension = 1024;
      let { width, height } = img;
      
      if (width > height && width > maxDimension) {
        height = (height * maxDimension) / width;
        width = maxDimension;
      } else if (height > maxDimension) {
        width = (width * maxDimension) / height;
        height = maxDimension;
      }
      
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(resolve, 'image/jpeg', 0.8);
    };
    
    img.src = URL.createObjectURL(file);
  });
};
```

## Integration with React Components

### Hook Pattern for AI Services

```typescript
// hooks/usePhotoMetadata.ts
export const usePhotoMetadata = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const generateMetadata = async (
    photo: File,
    customInstructions: string = '',
    apiKey: string
  ) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const metadata = await withRetry(() => 
        generatePhotoMetadata(photo, customInstructions, apiKey)
      );
      
      return metadata;
    } catch (err) {
      const errorMessage = err.message || 'Failed to generate metadata';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };
  
  return { generateMetadata, isGenerating, error };
};
```

This structured approach to AI integration provides:
- **Reliability** through schema enforcement
- **Maintainability** via proper abstractions  
- **Performance** with optimization and batching
- **User Experience** through proper error handling

---

**Next**: Explore the [React component patterns](./react-patterns) that make this AI integration seamless.