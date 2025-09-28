# Code Quality Standards

This document defines the code quality standards, best practices, and guidelines for the SmugMug API Reference Application.

## Overview

Our code quality standards are based on the **Architecture Smells Rubric** defined in the [agents.md](../../agents.md) file and follow industry best practices for React/TypeScript applications.

## TypeScript Standards

### Strict Configuration
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true
  }
}
```

### Type Safety Rules

#### ✅ **DO: Use Explicit Interfaces**
```typescript
// Explicit prop interfaces
interface PhotoGridProps {
  photos: Photo[];
  selectionMode: boolean;
  onSelectionChange: (photoIds: string[]) => void;
  gridColumns?: number;
}

// Strong typing for state
interface SearchState {
  query: string;
  results: Photo[];
  loading: boolean;
  error: Error | null;
}
```

#### ❌ **DON'T: Use 'any' Types**
```typescript
// NEVER do this in production
const processData = (input: any) => { 
  return input.someProperty; // No type safety!
};

// DO this instead
interface InputData {
  someProperty: string;
  metadata: Record<string, unknown>;
}

const processData = (input: InputData): string => {
  return input.someProperty; // Type safe!
};
```

#### ✅ **DO: Use Result Pattern for Error Handling**
```typescript
type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

async function fetchPhotos(query: string): Promise<Result<Photo[]>> {
  try {
    const photos = await searchService.search(query);
    return { success: true, data: photos };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error('Unknown error')
    };
  }
}
```

#### ✅ **DO: Use Union Types for Known Variants**
```typescript
type FilterType = 'semantic' | 'spatial' | 'temporal' | 'technical';
type OperationStatus = 'idle' | 'loading' | 'success' | 'error';

interface FilterState {
  type: FilterType;
  status: OperationStatus;
  value: string;
}
```

## React Component Standards

### Component Structure
```typescript
// TEMPLATE: Standard React component structure
import React, { useState, useEffect, useMemo, useCallback } from 'react';

// 1. TYPES: Define interfaces first
interface ComponentProps {
  requiredProp: string;
  optionalProp?: number;
  onAction: (data: ActionData) => void;
}

// 2. COMPONENT: Keep under 200 lines
export const ComponentName: React.FC<ComponentProps> = ({
  requiredProp,
  optionalProp = 0,
  onAction
}) => {
  // 3. STATE: Minimize useState calls (≤5)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<DataType[]>([]);

  // 4. MEMOIZED VALUES: Use useMemo for expensive calculations
  const processedData = useMemo(() => 
    data.filter(item => item.isValid),
    [data]
  );

  // 5. CALLBACKS: Use useCallback for event handlers
  const handleAction = useCallback((actionData: ActionData) => {
    onAction(actionData);
  }, [onAction]);

  // 6. EFFECTS: Keep simple with cleanup (≤3 effects, ≤3 deps each)
  useEffect(() => {
    const controller = new AbortController();
    
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await api.getData({ signal: controller.signal });
        setData(result);
      } catch (error) {
        if (!controller.signal.aborted) {
          setError(error as Error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    return () => controller.abort(); // CLEANUP REQUIRED
  }, [requiredProp]);

  // 7. RENDER: Keep JSX clean and readable
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className="component-container">
      <ProcessedDataDisplay 
        data={processedData} 
        onAction={handleAction}
      />
    </div>
  );
};

// 8. MEMOIZATION: Wrap heavy components
export default React.memo(ComponentName);
```

### Component Quality Gates

#### ✅ **Component Complexity Limits**
- **Lines of code**: <200 including JSX
- **useState calls**: ≤5 per component
- **useEffect calls**: ≤3 per component  
- **Props**: ≤5 per component interface
- **useEffect dependencies**: ≤3 per effect

#### ✅ **Single Responsibility Principle**
```typescript
// BAD: Component doing too much
const PhotoManagement = () => {
  // Search logic
  // Filter logic  
  // Display logic
  // Bulk operations logic
  // Agent integration logic
  // 500+ lines of mixed concerns
};

// GOOD: Focused components
const PhotoSearch = () => { /* Search only */ };
const PhotoFilters = () => { /* Filtering only */ };
const PhotoGrid = () => { /* Display only */ };
const BulkOperations = () => { /* Bulk ops only */ };
```

#### ✅ **Performance Optimization**
```typescript
// Memoize expensive computations
const ExpensiveComponent = ({ items, filters }) => {
  const filteredItems = useMemo(() => 
    items.filter(item => matchesAllFilters(item, filters)),
    [items, filters]
  );

  const handleItemSelect = useCallback((itemId: string) => {
    onItemSelect(itemId);
  }, [onItemSelect]);

  return (
    <div>
      {filteredItems.map(item => 
        <MemoizedItem 
          key={item.id} 
          item={item} 
          onSelect={handleItemSelect}
        />
      )}
    </div>
  );
};

// Memoize heavy child components
const MemoizedItem = React.memo(ItemComponent);
```

## Hook Standards

### Custom Hook Guidelines
```typescript
// TEMPLATE: Single responsibility custom hooks
interface UseAsyncDataOptions<T> {
  initialData?: T[];
  autoFetch?: boolean;
  dependencies?: any[];
}

interface UseAsyncDataReturn<T> {
  data: T[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useAsyncData<T>(
  fetchFn: () => Promise<T[]>,
  options: UseAsyncDataOptions<T> = {}
): UseAsyncDataReturn<T> {
  const { initialData = [], autoFetch = true, dependencies = [] } = options;
  
  const [state, setState] = useState({
    data: initialData,
    loading: false,
    error: null as Error | null
  });

  const fetchData = useCallback(async () => {
    const controller = new AbortController();
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const data = await fetchFn();
      if (!controller.signal.aborted) {
        setState(prev => ({ ...prev, data, loading: false }));
      }
    } catch (error) {
      if (!controller.signal.aborted) {
        setState(prev => ({ 
          ...prev, 
          error: error as Error, 
          loading: false 
        }));
      }
    }
    
    return () => controller.abort();
  }, [fetchFn, ...dependencies]);

  useEffect(() => {
    if (autoFetch) {
      const cleanup = fetchData();
      return cleanup;
    }
  }, [fetchData, autoFetch]);

  return { ...state, refetch: fetchData };
}
```

### Hook Quality Rules
- **Single Responsibility**: One clear purpose per hook
- **Cleanup Required**: All side effects must have cleanup
- **AbortController**: Use for cancelable async operations
- **Dependency Arrays**: ≤3 dependencies per useEffect
- **Error Handling**: Consistent error patterns

## Testing Standards

### Test Structure
```typescript
// TEMPLATE: Component testing structure
describe('PhotoGrid', () => {
  // Setup and utilities
  const mockPhotos = [
    { id: '1', title: 'Beach sunset', metadata: { ... } },
    { id: '2', title: 'Mountain view', metadata: { ... } }
  ];

  const renderPhotoGrid = (props = {}) => {
    const defaultProps = {
      photos: mockPhotos,
      selectionMode: false,
      onSelectionChange: vi.fn()
    };
    return render(<PhotoGrid {...defaultProps} {...props} />);
  };

  // Behavior tests (NOT implementation tests)
  it('should display all photos in grid layout', () => {
    renderPhotoGrid();
    
    expect(screen.getByRole('grid')).toBeInTheDocument();
    expect(screen.getAllByRole('img')).toHaveLength(2);
  });

  it('should enable selection when in selection mode', () => {
    renderPhotoGrid({ selectionMode: true });
    
    expect(screen.getAllByRole('checkbox')).toHaveLength(2);
  });

  it('should handle photo selection', () => {
    const onSelectionChange = vi.fn();
    renderPhotoGrid({ selectionMode: true, onSelectionChange });
    
    fireEvent.click(screen.getAllByRole('checkbox')[0]);
    
    expect(onSelectionChange).toHaveBeenCalledWith(['1']);
  });

  // Edge cases and error scenarios
  it('should handle empty photo list gracefully', () => {
    renderPhotoGrid({ photos: [] });
    
    expect(screen.getByText(/no photos/i)).toBeInTheDocument();
  });

  // Integration tests for complex workflows
  it('should complete full selection workflow', async () => {
    const user = userEvent.setup();
    renderPhotoGrid({ selectionMode: true });
    
    // Select first photo
    await user.click(screen.getAllByRole('checkbox')[0]);
    
    // Select all button should work
    await user.click(screen.getByText(/select all/i));
    
    expect(screen.getAllByRole('checkbox')).toHaveLength(2);
    expect(screen.getAllByRole('checkbox')[0]).toBeChecked();
    expect(screen.getAllByRole('checkbox')[1]).toBeChecked();
  });
});
```

### Testing Quality Gates
- **Coverage**: >90% code coverage required
- **Behavior Focus**: Test what the user sees, not implementation details
- **Edge Cases**: Test error conditions and boundary cases
- **Integration**: Test component interactions and workflows
- **Performance**: Test render performance for critical components

### Testing Patterns

#### ✅ **DO: Test Behavior**
```typescript
// Test what the user experiences
it('should show error message when search fails', async () => {
  const searchService = {
    search: vi.fn().mockRejectedValue(new Error('Search failed'))
  };
  
  render(<SearchComponent searchService={searchService} />);
  
  await user.type(screen.getByRole('textbox'), 'test query');
  await user.click(screen.getByRole('button', { name: /search/i }));
  
  expect(screen.getByText(/search failed/i)).toBeInTheDocument();
});
```

#### ❌ **DON'T: Test Implementation**
```typescript
// Don't test internal state or implementation details
it('should update internal state when search is called', () => {
  const wrapper = shallow(<SearchComponent />);
  wrapper.instance().handleSearch('query');
  expect(wrapper.state('query')).toBe('query'); // WRONG!
});
```

## Performance Standards

### Performance Benchmarks
- **Component Render**: <100ms for complex components
- **Search Response**: <3 seconds for 10k+ photos
- **Memory Growth**: <5MB per operation
- **Bundle Size**: <1MB per route
- **First Contentful Paint**: <2 seconds

### Performance Optimization Rules

#### ✅ **Memoization Requirements**
```typescript
// REQUIRED: Memoize expensive computations
const filteredPhotos = useMemo(() => 
  photos.filter(photo => matchesFilters(photo, filters)),
  [photos, filters]
);

// REQUIRED: Memoize event handlers passed to children
const handlePhotoSelect = useCallback((photoId: string) => {
  setSelectedPhotos(prev => [...prev, photoId]);
}, []);

// REQUIRED: Memoize heavy components
const MemoizedPhotoItem = React.memo(PhotoItem);
```

#### ✅ **Virtual Scrolling for Large Lists**
```typescript
// For lists with >100 items
import { FixedSizeList as List } from 'react-window';

const VirtualizedPhotoGrid = ({ photos }) => (
  <List
    height={600}
    itemCount={photos.length}
    itemSize={200}
    itemData={photos}
  >
    {PhotoItem}
  </List>
);
```

#### ✅ **Debounced Input Handling**
```typescript
// Required for search inputs
const useDebounced = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};
```

## Code Organization Standards

### File Structure
```
src/
├── components/           # React components
│   ├── shared/          # Reusable components
│   ├── PhotoGrid/       # Feature-specific components
│   │   ├── index.tsx    # Main component
│   │   ├── PhotoGrid.tsx
│   │   ├── PhotoItem.tsx
│   │   └── __tests__/   # Component tests
│   └── __tests__/       # Shared component tests
├── hooks/               # Custom React hooks
├── services/            # Business logic
├── utils/               # Pure utility functions
├── types/               # TypeScript definitions
└── constants/           # Application constants
```

### Naming Conventions
```typescript
// Components: PascalCase
const PhotoGrid = () => {};

// Functions: camelCase  
const handlePhotoSelect = () => {};

// Constants: SCREAMING_SNAKE_CASE
const MAX_PHOTOS_PER_PAGE = 50;

// Types/Interfaces: PascalCase
interface PhotoGridProps {}
type SearchStatus = 'idle' | 'loading';

// Files: kebab-case or PascalCase for components
photo-grid.component.tsx
PhotoGrid.tsx
```

## ESLint Configuration

### Required Rules
```json
{
  "extends": [
    "@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  "rules": {
    // TypeScript
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    
    // React
    "react/prop-types": "off", // Using TypeScript
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "error",
    
    // General
    "complexity": ["error", { "max": 10 }],
    "max-lines-per-function": ["error", { "max": 50 }],
    "max-params": ["error", { "max": 5 }],
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  }
}
```

## Documentation Standards

### Code Documentation
```typescript
/**
 * Semantic search engine for photo discovery with AI-powered metadata.
 * 
 * @example
 * ```typescript
 * const engine = new SemanticSearchEngine();
 * await engine.indexPhotos(photos);
 * const results = await engine.search({ semantic_query: "sunset beach" });
 * ```
 */
class SemanticSearchEngine {
  /**
   * Search photos using natural language queries.
   * 
   * @param params - Search parameters including semantic query
   * @returns Promise resolving to search results with metadata
   * @throws {SearchError} When search operation fails
   */
  async search(params: SearchParameters): Promise<SearchResult> {
    // Implementation
  }
}
```

### README Standards
- **Clear setup instructions**
- **Usage examples**
- **API documentation**
- **Contributing guidelines**
- **Architecture overview**

## Quality Assurance Process

### Pre-Commit Checklist
- [ ] TypeScript compiles without errors (`npm run type-check`)
- [ ] All tests pass (`npm run test`)
- [ ] ESLint passes (`npm run lint`)
- [ ] Components follow architecture standards
- [ ] Performance benchmarks met
- [ ] Documentation updated

### Code Review Standards
- [ ] Architecture compliance verified
- [ ] Performance impact assessed
- [ ] Test coverage maintained
- [ ] Documentation updated
- [ ] Security implications reviewed

---

**Tools & Integration:**
- **TypeScript**: Strict mode compilation
- **ESLint**: Automated code quality checks
- **Vitest**: Fast unit testing framework
- **React Testing Library**: Behavior-focused testing
- **Vite**: Optimized build and development

**Next Steps:**
- Review [Architecture Smells Rubric](../../.agent-os/standards/architecture-smells.md)
- Check [Development Workflow](./workflow.md)
- See [Agent Instructions](../../agents.md) for AI development guidelines