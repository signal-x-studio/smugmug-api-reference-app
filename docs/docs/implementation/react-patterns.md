---
sidebar_position: 2
---

# React Component Patterns

This project demonstrates modern React patterns with TypeScript, showcasing how to build maintainable, type-safe applications with proper state management and component architecture.

## Centralized State Management

The application uses a **single source of truth** pattern with all state managed in `App.tsx`, avoiding the complexity of external state management libraries for this scale of application.

### State Architecture

```typescript
// App.tsx - Centralized state management
const App: React.FC = () => {
  // Core application state
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  
  // UI state
  const [isLoading, setIsLoading] = useState<'albums' | 'photos' | 'syncing' | false>(false);
  const [viewMode, setViewMode] = useState<'all' | 'review'>('all');
  
  // Settings state
  const [customInstructions, setCustomInstructions] = useState('');
  const [automationMode, setAutomationMode] = useState<AutomationMode>('off');
  
  // Notifications and activity
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);
  
  // ... component logic
};
```

### Props Down, Events Up Pattern

Data flows down through props, events bubble up through callbacks:

```typescript
// Parent passes data down and callbacks up
<ImageGrid
  photos={filteredPhotos}
  onPhotoClick={handlePhotoClick}
  onBatchSelect={handleBatchPhotoSelection}
  onMetadataGenerate={handleSinglePhotoMetadata}
  selectedPhotoIds={selectedPhotoIds}
  viewMode={viewMode}
/>

// Child component receives props and calls callbacks
interface ImageGridProps {
  photos: Photo[];
  onPhotoClick: (photo: Photo) => void;
  onBatchSelect: (photoIds: string[]) => void;
  onMetadataGenerate: (photoId: string) => void;
  selectedPhotoIds: string[];
  viewMode: 'all' | 'review';
}
```

## TypeScript Integration Patterns

### Strict Type Safety

All components use strict TypeScript with proper interface definitions:

```typescript
// types.ts - Centralized type definitions
export interface Photo {
  id: string;
  title: string;
  filename: string;
  url: string;
  thumbnailUrl: string;
  uploadDate: string;
  aiData?: AiData;
  status: PhotoStatus;
}

export interface AiData {
  title?: string;
  description?: string;
  keywords?: string[];
  technicalDetails?: TechnicalDetails;
  suggestedAlbums?: string[];
  confidence?: number;
}

export enum PhotoStatus {
  Uploaded = 'uploaded',
  Processing = 'processing', 
  AIProcessed = 'ai_processed',
  ReviewNeeded = 'review_needed',
  Approved = 'approved'
}
```

### Component Props with Defaults

```typescript
// PhotoCard.tsx - Props with proper types and optional values
interface PhotoCardProps {
  photo: Photo;
  onPhotoClick: (photo: Photo) => void;
  onMetadataGenerate?: (photoId: string) => void;
  showAIMetadata?: boolean;
  isSelected?: boolean;
  className?: string;
}

const PhotoCard: React.FC<PhotoCardProps> = ({
  photo,
  onPhotoClick,
  onMetadataGenerate,
  showAIMetadata = true,
  isSelected = false,
  className = ''
}) => {
  // Component implementation with type-safe props
};
```

## Custom Hook Patterns

### State Management Hooks

```typescript
// hooks/useNotifications.ts
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  
  const showNotification = useCallback((
    type: 'success' | 'error' | 'info',
    message: string,
    duration: number = 5000
  ) => {
    const notification: AppNotification = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: new Date().toISOString()
    };
    
    setNotifications(prev => [...prev, notification]);
    
    // Auto-remove after duration
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, duration);
  }, []);
  
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);
  
  return { notifications, showNotification, removeNotification };
};
```

### AI Service Integration Hook

```typescript
// hooks/usePhotoMetadata.ts
export const usePhotoMetadata = (apiKey: string) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const generateMetadata = useCallback(async (
    photo: File | Photo,
    customInstructions: string = ''
  ) => {
    if (!apiKey) {
      throw new Error('API key is required for metadata generation');
    }
    
    setIsGenerating(true);
    setError(null);
    
    try {
      let imageFile: File;
      
      // Handle both File objects and Photo objects
      if (photo instanceof File) {
        imageFile = photo;
      } else {
        // Convert Photo URL to File (for existing photos)
        imageFile = await urlToFile(photo.url, photo.filename);
      }
      
      const metadata = await generatePhotoMetadata(imageFile, customInstructions, apiKey);
      return metadata;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, [apiKey]);
  
  return { generateMetadata, isGenerating, error };
};
```

## Component Composition Patterns

### Higher-Order Components for Loading States

```typescript
// src/components/withLoadingState.tsx
interface WithLoadingStateProps {
  isLoading: boolean;
  loadingMessage?: string;
  children: React.ReactNode;
}

const WithLoadingState: React.FC<WithLoadingStateProps> = ({
  isLoading,
  loadingMessage = 'Loading...',
  children
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">{loadingMessage}</span>
      </div>
    );
  }
  
  return <>{children}</>;
};
```

### Compound Components Pattern

```typescript
// src/components/Modal/index.tsx
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50">
      <div className="relative p-8 bg-white max-w-2xl mx-auto mt-20 rounded-lg">
        {children}
      </div>
    </div>
  );
};

// Compound components for modal sections
Modal.Header = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-4 pb-4 border-b">
    {children}
  </div>
);

Modal.Body = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-6">
    {children}
  </div>
);

Modal.Footer = ({ children }: { children: React.ReactNode }) => (
  <div className="flex justify-end space-x-3 pt-4 border-t">
    {children}
  </div>
);
```

### Usage Example

```typescript
// Using compound modal components
<Modal isOpen={isPhotoDetailOpen} onClose={() => setSelectedPhoto(null)}>
  <Modal.Header>
    <h2 className="text-xl font-semibold">{selectedPhoto?.title}</h2>
  </Modal.Header>
  
  <Modal.Body>
    <PhotoDetailView photo={selectedPhoto} />
  </Modal.Body>
  
  <Modal.Footer>
    <button onClick={handleGenerateMetadata}>Generate AI Metadata</button>
    <button onClick={() => setSelectedPhoto(null)}>Close</button>
  </Modal.Footer>
</Modal>
```

## Performance Optimization Patterns

### Memoization for Expensive Operations

```typescript
// Memoized filtering for large photo sets
const filteredPhotos = useMemo(() => {
  if (viewMode === 'all') return photos;
  
  return photos.filter(photo => 
    photo.status === PhotoStatus.ReviewNeeded ||
    photo.status === PhotoStatus.Processing
  );
}, [photos, viewMode]);

// Memoized computed values
const photoStats = useMemo(() => {
  const total = photos.length;
  const processed = photos.filter(p => p.aiData).length;
  const needsReview = photos.filter(p => p.status === PhotoStatus.ReviewNeeded).length;
  
  return { total, processed, needsReview };
}, [photos]);
```

### Callback Optimization

```typescript
// Stable callback references with useCallback
const handlePhotoClick = useCallback((photo: Photo) => {
  setSelectedPhoto(photo);
}, []);

const handleBatchMetadataGeneration = useCallback(async (photoIds: string[]) => {
  setIsLoading('syncing');
  
  const photosToProcess = photos.filter(p => photoIds.includes(p.id));
  
  try {
    const results = await batchProcessPhotos(photosToProcess, aiSettings, (processed, total) => {
      // Progress callback
      setProcessingProgress({ processed, total });
    });
    
    // Update photos with new metadata
    setPhotos(prev => prev.map(photo => {
      const result = results.find(r => r.photo.id === photo.id);
      return result?.success 
        ? { ...photo, aiData: result.metadata, status: PhotoStatus.AIProcessed }
        : photo;
    }));
    
  } catch (error) {
    showNotification('error', `Batch processing failed: ${error.message}`);
  } finally {
    setIsLoading(false);
  }
}, [photos, aiSettings, showNotification]);
```

## Error Boundary Patterns

```typescript
// src/components/ErrorBoundary.tsx
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>, 
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-4">
            Something went wrong
          </h2>
          <p className="text-gray-600 mb-4">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Reload Page
          </button>
        </div>
      );
    }
    
    return this.props.children;
  }
}
```

These patterns provide a solid foundation for building maintainable, performant React applications with proper TypeScript integration and modern development practices.

---

**Next**: Learn about the [service layer architecture](./service-layer) that powers the AI integration.