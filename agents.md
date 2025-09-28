# SmugMug API Reference App - Agent Instructions

This repository contains a React/TypeScript photo discovery search application with comprehensive AI agent integration. This document provides instructions for AI agents working with this codebase.

## Project Overview

**Purpose**: Advanced photo discovery search system with natural language processing, semantic search, and bulk operations  
**Tech Stack**: React 18, TypeScript, Vite, Vitest, TailwindCSS, Fuse.js  
**Agent Integration**: Browser agent compatible with structured data, programmatic APIs, and natural language commands  

## Code Quality Standards & Architecture Smells Rubric

### 🚨 **Critical Architecture Smells - MUST AVOID**

#### **1. God Component Anti-Pattern**
```typescript
// ❌ SMELL: Component with 500+ lines handling multiple responsibilities
export const MegaComponent = ({ photos, filters, operations, commands }) => {
  // UI rendering + state management + business logic + API calls + validation
  const [state1, setState1] = useState();
  const [state2, setState2] = useState();
  // ... 10+ more useState calls
  
  useEffect(() => { /* complex logic */ }, [dep1, dep2, dep3, dep4]);
  useEffect(() => { /* more complex logic */ }, [dep5, dep6]);
  // ... multiple complex effects
  
  const handleOperation1 = () => { /* 50+ lines */ };
  const handleOperation2 = () => { /* 50+ lines */ };
  
  return <div>{/* 200+ lines of JSX */}</div>;
};

// ✅ FIX: Break into focused, single-responsibility components
export const PhotoGrid = ({ photos, onSelect }) => { /* 50-100 lines max */ };
export const BulkOperationsPanel = ({ operations, onExecute }) => { /* 50-100 lines max */ };
export const CommandProcessor = ({ onCommand }) => { /* 50-100 lines max */ };
```

**Enforcement Rule**: Components MUST be < 200 lines. If larger, extract sub-components or custom hooks.

#### **2. React Hook Complexity Anti-Pattern**
```typescript
// ❌ SMELL: Complex useEffect with many dependencies
useEffect(() => {
  if (photos.length > 0 && filters && searchEngine && !isLoading) {
    const results = searchEngine.search(filters);
    setFilteredPhotos(results);
    updateSearchMetrics(results);
    notifyAgents(results);
    persistState(filters);
  }
}, [photos, filters, searchEngine, isLoading, setFilteredPhotos, updateSearchMetrics]);

// ✅ FIX: Extract custom hooks with single concerns
const useSearchResults = (photos, filters, searchEngine) => {
  return useMemo(() => 
    searchEngine?.search(filters) || [], 
    [photos, filters, searchEngine]
  );
};

const useSearchMetrics = (results) => {
  useEffect(() => {
    if (results.length > 0) updateSearchMetrics(results);
  }, [results]);
};
```

**Enforcement Rule**: useEffect MUST have ≤ 3 dependencies. Extract custom hooks for complex logic.

#### **3. Performance Anti-Pattern**
```typescript
// ❌ SMELL: Expensive operations in render without memoization
const PhotoGrid = ({ photos, operations }) => {
  // Recalculated every render!
  const validOperations = operations.filter(op => 
    photos.every(p => isValidForPhoto(op, p))
  );
  
  return photos.map(photo => 
    <PhotoItem key={photo.id} photo={photo} operations={validOperations} />
  );
};

// ✅ FIX: Memoize expensive computations
const PhotoGrid = ({ photos, operations }) => {
  const validOperations = useMemo(() =>
    operations.filter(op => photos.every(p => isValidForPhoto(op, p))),
    [operations, photos]
  );
  
  return photos.map(photo => 
    <MemoizedPhotoItem key={photo.id} photo={photo} operations={validOperations} />
  );
};

const MemoizedPhotoItem = React.memo(PhotoItem);
```

**Enforcement Rule**: All expensive computations (>10ms) MUST be memoized with useMemo/useCallback.

#### **4. Type Safety Anti-Pattern**
```typescript
// ❌ SMELL: Weak typing that hides errors
interface SearchParams {
  parameters: Record<string, any>; // Too generic!
  options?: any; // No type safety!
}

const processCommand = (cmd: any) => { // Completely untyped!
  return cmd.operation.execute(cmd.params);
};

// ✅ FIX: Strong, specific typing
interface SearchParameters {
  semantic: {
    objects?: string[];
    scenes?: string[];
  };
  spatial: {
    location?: string;
    coordinates?: [number, number];
  };
  temporal: {
    startDate?: Date;
    endDate?: Date;
  };
}

const processCommand = (cmd: AgentCommand): Promise<CommandResult> => {
  // Fully typed with compile-time safety
};
```

**Enforcement Rule**: ALL public APIs MUST have explicit TypeScript interfaces. No `any` types in production code.

#### **5. Memory Leak Anti-Pattern**
```typescript
// ❌ SMELL: Missing cleanup causes memory leaks
useEffect(() => {
  window.addEventListener('resize', handleResize);
  const interval = setInterval(updateMetrics, 1000);
  // Missing cleanup!
}, []);

// ✅ FIX: Always clean up resources
useEffect(() => {
  const handleResize = () => { /* logic */ };
  window.addEventListener('resize', handleResize);
  const interval = setInterval(updateMetrics, 1000);
  
  return () => {
    window.removeEventListener('resize', handleResize);
    clearInterval(interval);
  };
}, []);
```

**Enforcement Rule**: ALL side effects MUST have cleanup. Use AbortController for async operations.

### 📋 **Architecture Compliance Checklist**

#### **Component Design**
- [ ] Single Responsibility: Component has ONE clear purpose
- [ ] < 200 lines per component (including JSX)
- [ ] < 5 props per component (use composition for more)
- [ ] Minimal state (prefer props or context)
- [ ] Pure functions where possible (React.memo eligible)

#### **Hook Usage**
- [ ] Custom hooks for complex logic (> 10 lines)
- [ ] ≤ 3 dependencies per useEffect
- [ ] useMemo/useCallback for expensive operations
- [ ] Cleanup functions for all side effects
- [ ] AbortController for cancelable async operations

#### **Type Safety**
- [ ] Explicit interfaces for all props/state
- [ ] No `any` types in production code
- [ ] Union types for known variants
- [ ] Generic types for reusable components
- [ ] Proper error type definitions

#### **Performance**
- [ ] React.memo for expensive components
- [ ] Virtualization for large lists (>100 items)
- [ ] Debouncing for user input (>300ms)
- [ ] Code splitting for routes/features
- [ ] Image lazy loading and optimization

#### **Testing**
- [ ] Behavior testing over implementation testing
- [ ] Mock external dependencies appropriately
- [ ] Test error boundaries and edge cases
- [ ] Integration tests for critical workflows
- [ ] Performance testing for search operations

## Agent Integration Capabilities

### **Structured Data Access**
The application exposes Schema.org structured data for browser agent discovery:

```javascript
// Available on window.agentState
{
  photoSearch: {
    totalPhotos: number,
    currentResults: Photo[],
    lastQuery: string,
    appliedFilters: FilterState
  },
  bulkOperations: {
    selectedCount: number,
    availableOperations: string[],
    execute: (operation: string, params: any) => Promise<Result>
  }
}
```

### **Programmatic APIs**
Agents can interact through programmatic interfaces:

```typescript
// Search API
const searchInterface = new AgentSearchInterface(searchEngine, queryParser);
const results = await searchInterface.search({
  semantic_query: "sunset beach photos",
  limit: 50
});

// Bulk Operations API  
const executor = new BulkOperationExecutor();
const result = await executor.execute({
  operation: 'download',
  photos: selectedPhotos,
  parameters: { format: 'zip' }
});
```

### **Natural Language Commands**
The system processes natural language commands for agents:

```typescript
// Examples of supported commands
"download all selected photos as zip"
"add tags vacation and beach to selected photos"  
"create album Summer 2023 with these photos"
"find photos taken in Hawaii last year"
```

## Development Guidelines

### **File Structure Standards**
```
src/
├── components/           # React components (< 200 lines each)
│   ├── __tests__/       # Component tests  
│   └── shared/          # Reusable components
├── hooks/               # Custom React hooks
├── utils/               # Pure utility functions
│   └── agent-native/    # Agent integration layer
├── types/               # TypeScript type definitions
└── services/            # Business logic services
```

### **Component Patterns**

#### **Container/Presentation Pattern**
```typescript
// Container: handles logic and state
export const PhotoSearchContainer = () => {
  const [results, setResults] = useState<Photo[]>([]);
  const handleSearch = useCallback((query: string) => {
    // Business logic here
  }, []);
  
  return <PhotoSearchPresentation results={results} onSearch={handleSearch} />;
};

// Presentation: pure UI component
export const PhotoSearchPresentation = ({ results, onSearch }) => {
  return (
    <div>
      <SearchInput onSearch={onSearch} />
      <ResultsGrid photos={results} />
    </div>
  );
};
```

#### **Custom Hook Pattern**
```typescript
// Extract complex logic into custom hooks
export const usePhotoSearch = (initialQuery?: string) => {
  const [results, setResults] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const search = useCallback(async (query: string) => {
    setIsLoading(true);
    try {
      const results = await searchService.search(query);
      setResults(results);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  return { results, isLoading, search };
};
```

### **Error Handling Standards**

#### **Result Pattern for APIs**
```typescript
type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

// Usage
const searchPhotos = async (query: string): Promise<Result<Photo[]>> => {
  try {
    const photos = await searchService.search(query);
    return { success: true, data: photos };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error('Unknown error')
    };
  }
};
```

#### **Error Boundaries for React**
```typescript
export const PhotoSearchErrorBoundary = ({ children }) => {
  return (
    <ErrorBoundary
      fallback={<ErrorFallback />}
      onError={(error, errorInfo) => {
        console.error('PhotoSearch Error:', error, errorInfo);
        // Report to monitoring service
      }}
    >
      {children}
    </ErrorBoundary>
  );
};
```

## Testing Standards

### **Component Testing**
```typescript
describe('PhotoGrid', () => {
  it('should render photos with selection capability', () => {
    const mockPhotos = [/* test data */];
    render(
      <PhotoGrid 
        photos={mockPhotos} 
        selectionMode={true}
        onSelectionChange={vi.fn()}
      />
    );
    
    expect(screen.getByRole('grid')).toBeInTheDocument();
    expect(screen.getAllByRole('checkbox')).toHaveLength(mockPhotos.length);
  });
});
```

### **Hook Testing**
```typescript
describe('usePhotoSearch', () => {
  it('should search photos and update results', async () => {
    const { result } = renderHook(() => usePhotoSearch());
    
    act(() => {
      result.current.search('beach sunset');
    });
    
    await waitFor(() => {
      expect(result.current.results).toHaveLength(2);
    });
  });
});
```

## Agent Development Instructions

When working with this codebase as an AI agent:

### **Code Generation Rules**
1. **Always check the smells rubric** before generating code
2. **Follow the type safety standards** - no `any` types
3. **Implement proper cleanup** for all side effects  
4. **Memoize expensive computations** with useMemo/useCallback
5. **Keep components under 200 lines** - extract sub-components if needed
6. **Write behavior-focused tests** not implementation tests
7. **Use the Result pattern** for error-prone operations
8. **Follow the established file structure** and naming conventions

### **Refactoring Priorities**
When refactoring existing code, prioritize in this order:
1. **Fix memory leaks** and performance issues
2. **Break down god components** into smaller pieces
3. **Add missing type safety** and error handling
4. **Extract complex logic** into custom hooks
5. **Add proper memoization** for expensive operations
6. **Improve test coverage** with behavior tests

### **Quality Gates**
Before committing code, ensure:
- [ ] All components pass the architecture smells check
- [ ] TypeScript compiles with strict mode (no errors/warnings)
- [ ] All tests pass with >90% coverage
- [ ] Performance benchmarks met (<100ms render, <5MB memory growth)
- [ ] Agent integration APIs work correctly
- [ ] No console errors in browser

## API Documentation

### **Search Interface**
```typescript
interface AgentSearchInterface {
  search(params: SearchParameters): Promise<Result<SearchResult>>;
  executeSearch(request: SearchRequest): Promise<AgentSearchResult>;
  processCommand(command: AgentCommand): Promise<AgentCommandResult>;
}
```

### **Bulk Operations Interface** 
```typescript
interface BulkOperationExecutor {
  execute(options: ExecutionOptions): Promise<BulkOperationResult>;
  parseCommand(command: string): Promise<CommandParseResult>;
  setContext(context: Record<string, any>): void;
}
```

### **Agent State Registry**
```typescript
interface AgentStateRegistry {
  registerSearchState(key: string, state: any): void;
  registerCommand(name: string, handler: Function): void;
  getSearchHistory(): SearchRequest[];
}
```

## Support & Maintenance

For issues or questions regarding agent integration:
1. Check existing tests for usage examples
2. Review the structured data output in browser dev tools  
3. Validate agent state is properly exposed on `window.agentState`
4. Ensure all APIs return proper Result types
5. Test natural language command processing in the browser console

---

**Last Updated**: 2025-01-27  
**Version**: 1.0.0  
**Maintainer**: AI Development Team