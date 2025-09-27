---
sidebar_position: 3
---

# Service Layer Architecture

The service layer provides clean abstractions for external APIs, making the application maintainable and testable. This pattern separates business logic from UI concerns and enables easy mocking during development.

import InteractiveCode from '@site/src/components/InteractiveCode';

<InteractiveCode 
  code={`// Service layer structure
services/
├── geminiService.ts      # AI/Gemini Vision integration
├── mockSmugMugService.ts # Development mock service (active)
└── smugmugService.ts     # OAuth reference implementation`}
  language="bash"
  title="📁 Service Architecture"
  description="Clean separation of concerns with dedicated service files"
/>

## Architecture Overview

## Mock Service Pattern

During development, the application uses a mock service that simulates SmugMug API behavior without requiring OAuth setup or external dependencies.

### Mock Service Implementation

```typescript
// services/mockSmugMugService.ts
import { SmugMugService, Album, Photo, SmugMugNode } from '../types';

class MockSmugMugService implements SmugMugService {
  async getCurrentUser() {
    // Simulate API delay
    await this.delay(500);
    
    return {
      id: 'mock-user-123',
      name: 'Demo User',
      nickname: 'demo',
      email: 'demo@example.com'
    };
  }

  async getNodeTree(): Promise<SmugMugNode[]> {
    await this.delay(800);
    
    return [
      {
        id: 'node-1',
        name: 'Travel Photos',
        type: 'folder',
        children: [
          { id: 'album-1', name: 'Europe 2023', type: 'album' },
          { id: 'album-2', name: 'Japan Trip', type: 'album' }
        ]
      },
      {
        id: 'node-2', 
        name: 'Family',
        type: 'folder',
        children: [
          { id: 'album-3', name: 'Holiday Gatherings', type: 'album' }
        ]
      }
    ];
  }

  async getAlbumPhotos(albumId: string): Promise<Photo[]> {
    await this.delay(600);
    
    // Generate mock photos based on album
    const photoCount = Math.floor(Math.random() * 20) + 5;
    const photos: Photo[] = [];
    
    for (let i = 1; i <= photoCount; i++) {
      photos.push({
        id: `${albumId}-photo-${i}`,
        title: `Photo ${i}`,
        filename: `IMG_${1000 + i}.jpg`,
        url: `https://picsum.photos/800/600?random=${albumId}-${i}`,
        thumbnailUrl: `https://picsum.photos/200/150?random=${albumId}-${i}`,
        uploadDate: this.randomDate(),
        status: this.randomStatus()
      });
    }
    
    return photos;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private randomDate(): string {
    const start = new Date(2023, 0, 1);
    const end = new Date();
    const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return date.toISOString();
  }

  private randomStatus(): PhotoStatus {
    const statuses = [
      PhotoStatus.Uploaded,
      PhotoStatus.AIProcessed, 
      PhotoStatus.ReviewNeeded,
      PhotoStatus.Approved
    ];
    return statuses[Math.floor(Math.random() * statuses.length)];
  }
}

export const smugmugService = new MockSmugMugService();
```

### Benefits of Mock Service Pattern

1. **Development Independence**: No external API dependencies during development
2. **Predictable Testing**: Consistent data for UI testing and development
3. **Performance**: Fast responses without network delays
4. **Cost Efficiency**: No API usage costs during development
5. **Offline Development**: Works without internet connectivity

## AI Service Integration

The Gemini service demonstrates production-ready AI integration with proper error handling and structured responses.

### Core AI Service Structure

```typescript
// services/geminiService.ts
import { GoogleGenerativeAI } from '@google/genai';

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json"
      }
    });
  }

  async generatePhotoMetadata(
    image: File, 
    customInstructions: string = ''
  ): Promise<ImageMetadata> {
    try {
      // Convert image to proper format
      const imagePart = await this.fileToGenerativePart(image);
      
      // Build structured prompt
      const prompt = this.buildMetadataPrompt(customInstructions);
      
      // Generate with schema enforcement
      const result = await this.model.generateContent([prompt, imagePart]);
      const responseText = result.response.text();
      
      // Parse and validate response
      const metadata = JSON.parse(responseText) as ImageMetadata;
      this.validateMetadata(metadata);
      
      return metadata;
      
    } catch (error) {
      throw this.handleAIError(error);
    }
  }

  private validateMetadata(metadata: any): void {
    const required = ['title', 'description', 'keywords'];
    
    for (const field of required) {
      if (!metadata[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    
    if (!Array.isArray(metadata.keywords)) {
      throw new Error('Keywords must be an array');
    }
  }

  private handleAIError(error: any): Error {
    if (error.message?.includes('quota')) {
      return new Error('AI service quota exceeded. Please try again later.');
    } else if (error.message?.includes('invalid')) {
      return new Error('Invalid image format. Please use JPEG, PNG, or WebP.');
    } else {
      return new Error(`AI processing failed: ${error.message}`);
    }
  }
}
```

## Error Handling Patterns

### Consistent Error Response Structure

```typescript
interface ServiceError {
  type: 'network' | 'quota' | 'invalid_input' | 'server' | 'unknown';
  message: string;
  retryable: boolean;
  details?: any;
}

class ServiceErrorHandler {
  static handle(error: any): ServiceError {
    // Network errors
    if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
      return {
        type: 'network',
        message: 'Network connection lost. Please check your internet connection.',
        retryable: true
      };
    }
    
    // Rate limiting / quota errors
    if (error.message?.includes('quota') || error.status === 429) {
      return {
        type: 'quota',
        message: 'Service quota exceeded. Please try again later.',
        retryable: true
      };
    }
    
    // Invalid input
    if (error.status >= 400 && error.status < 500) {
      return {
        type: 'invalid_input',
        message: error.message || 'Invalid request. Please check your input.',
        retryable: false
      };
    }
    
    // Server errors
    if (error.status >= 500) {
      return {
        type: 'server',
        message: 'Service temporarily unavailable. Please try again.',
        retryable: true
      };
    }
    
    // Unknown errors
    return {
      type: 'unknown',
      message: error.message || 'An unexpected error occurred.',
      retryable: false,
      details: error
    };
  }
}
```

### Retry Logic Implementation

```typescript
class RetryableService {
  static async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: ServiceError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        const serviceError = ServiceErrorHandler.handle(error);
        lastError = serviceError;
        
        // Don't retry non-retryable errors
        if (!serviceError.retryable) {
          throw serviceError;
        }
        
        // Don't retry on last attempt
        if (attempt === maxRetries) {
          throw serviceError;
        }
        
        // Exponential backoff
        const delay = baseDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError!;
  }
}

// Usage example
const generateMetadataWithRetry = async (image: File, instructions: string) => {
  return RetryableService.withRetry(
    () => geminiService.generatePhotoMetadata(image, instructions),
    3, // max 3 retries
    1000 // start with 1 second delay
  );
};
```

## Service Configuration

### Environment-Based Configuration

```typescript
// config/services.ts
interface ServiceConfig {
  gemini: {
    apiKey: string;
    model: string;
    timeout: number;
  };
  smugmug: {
    baseUrl: string;
    timeout: number;
    mockMode: boolean;
  };
}

const getServiceConfig = (): ServiceConfig => {
  const apiKey = import.meta.env.VITE_API_KEY || process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error('API_KEY environment variable is required');
  }
  
  return {
    gemini: {
      apiKey,
      model: 'gemini-1.5-flash',
      timeout: 30000
    },
    smugmug: {
      baseUrl: 'https://api.smugmug.com/api/v2',
      timeout: 15000,
      mockMode: process.env.NODE_ENV === 'development'
    }
  };
};

export const serviceConfig = getServiceConfig();
```

### Service Factory Pattern

```typescript
// services/factory.ts
interface ServiceFactory {
  createSmugMugService(): SmugMugService;
  createGeminiService(): GeminiService;
}

class ProductionServiceFactory implements ServiceFactory {
  createSmugMugService(): SmugMugService {
    if (serviceConfig.smugmug.mockMode) {
      return new MockSmugMugService();
    }
    return new RealSmugMugService(serviceConfig.smugmug);
  }
  
  createGeminiService(): GeminiService {
    return new GeminiService(serviceConfig.gemini.apiKey);
  }
}

class TestServiceFactory implements ServiceFactory {
  createSmugMugService(): SmugMugService {
    return new MockSmugMugService();
  }
  
  createGeminiService(): GeminiService {
    return new MockGeminiService(); // Returns predictable test data
  }
}

export const serviceFactory: ServiceFactory = 
  process.env.NODE_ENV === 'test' 
    ? new TestServiceFactory()
    : new ProductionServiceFactory();
```

## Testing Service Layer

### Service Testing Patterns

```typescript
// __tests__/services/geminiService.test.ts
describe('GeminiService', () => {
  let geminiService: GeminiService;
  let mockFile: File;
  
  beforeEach(() => {
    geminiService = new GeminiService('test-api-key');
    mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
  });
  
  it('should generate metadata for valid image', async () => {
    const metadata = await geminiService.generatePhotoMetadata(mockFile);
    
    expect(metadata).toHaveProperty('title');
    expect(metadata).toHaveProperty('description');
    expect(metadata).toHaveProperty('keywords');
    expect(Array.isArray(metadata.keywords)).toBe(true);
  });
  
  it('should handle quota exceeded error', async () => {
    // Mock quota exceeded response
    jest.spyOn(geminiService, 'generatePhotoMetadata')
      .mockRejectedValue(new Error('quota exceeded'));
    
    await expect(
      geminiService.generatePhotoMetadata(mockFile)
    ).rejects.toThrow('AI service quota exceeded');
  });
  
  it('should validate response structure', async () => {
    // Mock invalid response
    jest.spyOn(JSON, 'parse')
      .mockReturnValue({ title: 'test' }); // missing required fields
    
    await expect(
      geminiService.generatePhotoMetadata(mockFile)
    ).rejects.toThrow('Missing required field');
  });
});
```

This service layer architecture provides a clean separation of concerns, making the application maintainable, testable, and easy to extend with new external services.

---

**Next**: Explore the complete project and see these patterns in action by running the application locally.