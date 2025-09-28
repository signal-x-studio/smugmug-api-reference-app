---
description: Code Quality Gates and Architecture Smell Prevention for AI Agents
globs:
alwaysApply: true
version: 1.0
encoding: UTF-8
---

# Code Quality Gates for AI Agents

## Pre-Generation Checklist

Before generating any React/TypeScript code, AI agents MUST verify compliance with these quality gates:

### **🚨 CRITICAL CHECKS - MUST PASS**

<quality_gate name="component_complexity">
  <check>Component length ≤ 200 lines including JSX</check>
  <check>useState calls ≤ 5 per component</check>  
  <check>useEffect calls ≤ 3 per component</check>
  <check>Props ≤ 5 per component interface</check>
  <action>REFACTOR: Extract sub-components or custom hooks if limits exceeded</action>
</quality_gate>

<quality_gate name="hook_complexity">
  <check>useEffect dependencies ≤ 3 items</check>
  <check>useEffect body ≤ 20 lines</check>
  <check>All side effects have cleanup functions</check>
  <check>Async operations use AbortController</check>
  <action>EXTRACT: Create custom hooks for complex logic</action>
</quality_gate>

<quality_gate name="performance">
  <check>Expensive computations wrapped in useMemo</check>
  <check>Event handlers wrapped in useCallback</check>
  <check>Heavy components wrapped in React.memo</check>
  <check>Large lists use virtualization (>100 items)</check>
  <action>OPTIMIZE: Add memoization to prevent unnecessary re-renders</action>
</quality_gate>

<quality_gate name="type_safety">
  <check>No 'any' types in production code</check>
  <check>All props have explicit TypeScript interfaces</check>
  <check>Union types used for known variants</check>
  <check>Generic types for reusable components</check>
  <action>STRENGTHEN: Add explicit type definitions</action>
</quality_gate>

<quality_gate name="error_handling">
  <check>All async operations wrapped in try-catch</check>
  <check>Error boundaries around component trees</check>
  <check>Result<T, E> pattern for error-prone functions</check>
  <check>Consistent error propagation strategy</check>
  <action>STANDARDIZE: Implement proper error handling patterns</action>
</quality_gate>

### **⚠️ WARNING CHECKS - SHOULD PASS**

<quality_gate name="architecture">
  <check>Single Responsibility Principle per component</check>
  <check>Dependency inversion for testability</check>
  <check>Clear separation of concerns</check>
  <check>Consistent file structure and naming</check>
  <action>REFACTOR: Improve architectural compliance</action>
</quality_gate>

<quality_gate name="maintainability">
  <check>Self-documenting code with clear naming</check>
  <check>Complex logic extracted to named functions</check>
  <check>Magic numbers replaced with constants</check>
  <check>Duplicate code eliminated</check>
  <action>IMPROVE: Enhance code readability</action>
</quality_gate>

## Code Generation Templates

### **Component Generation Pattern**

```typescript
// TEMPLATE: Use this structure for all React components
import React, { useState, useEffect, useMemo, useCallback } from 'react';

// 1. TYPES: Define explicit interfaces first
interface ComponentNameProps {
  requiredProp: string;
  optionalProp?: number;
  onAction: (data: ActionData) => void;
}

interface ComponentNameState {
  loading: boolean;
  error: Error | null;
  data: DataType[];
}

// 2. COMPONENT: Keep under 200 lines
export const ComponentName: React.FC<ComponentNameProps> = ({
  requiredProp,
  optionalProp = 0,
  onAction
}) => {
  // 3. STATE: Minimize useState calls (≤5)
  const [state, setState] = useState<ComponentNameState>({
    loading: false,
    error: null,
    data: []
  });

  // 4. MEMOIZED VALUES: Use useMemo for expensive calculations
  const processedData = useMemo(() => 
    state.data.filter(item => item.isValid),
    [state.data]
  );

  // 5. CALLBACKS: Use useCallback for event handlers
  const handleAction = useCallback((actionData: ActionData) => {
    onAction(actionData);
  }, [onAction]);

  // 6. EFFECTS: Keep simple with cleanup (≤3 effects, ≤3 deps each)
  useEffect(() => {
    const controller = new AbortController();
    
    const fetchData = async () => {
      setState(prev => ({ ...prev, loading: true }));
      try {
        const result = await api.getData({ signal: controller.signal });
        setState(prev => ({ ...prev, data: result, loading: false }));
      } catch (error) {
        if (!controller.signal.aborted) {
          setState(prev => ({ 
            ...prev, 
            error: error as Error, 
            loading: false 
          }));
        }
      }
    };

    fetchData();
    
    return () => controller.abort(); // CLEANUP REQUIRED
  }, [requiredProp]);

  // 7. RENDER: Keep JSX clean and readable
  if (state.loading) return <LoadingSpinner />;
  if (state.error) return <ErrorMessage error={state.error} />;

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

### **Custom Hook Generation Pattern**

```typescript
// TEMPLATE: Extract complex logic into custom hooks
import { useState, useEffect, useCallback } from 'react';

interface UseAsyncDataOptions {
  initialData?: T[];
  autoFetch?: boolean;
}

interface UseAsyncDataReturn<T> {
  data: T[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

// PATTERN: Single responsibility custom hooks
export function useAsyncData<T>(
  url: string, 
  options: UseAsyncDataOptions = {}
): UseAsyncDataReturn<T> {
  const { initialData = [], autoFetch = true } = options;
  
  const [state, setState] = useState({
    data: initialData,
    loading: false,
    error: null as Error | null
  });

  const fetchData = useCallback(async () => {
    const controller = new AbortController();
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      setState(prev => ({ ...prev, data, loading: false }));
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
  }, [url]);

  useEffect(() => {
    if (autoFetch) {
      const cleanup = fetchData();
      return cleanup;
    }
  }, [fetchData, autoFetch]);

  return {
    ...state,
    refetch: fetchData
  };
}
```

### **Error Handling Pattern**

```typescript
// TEMPLATE: Consistent error handling with Result pattern
type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

// SERVICE LAYER: Always return Result type
export const dataService = {
  async fetchPhotos(query: string): Promise<Result<Photo[]>> {
    try {
      const response = await fetch(`/api/photos?q=${query}`);
      if (!response.ok) {
        return { 
          success: false, 
          error: new Error(`HTTP ${response.status}: ${response.statusText}`)
        };
      }
      
      const photos = await response.json();
      return { success: true, data: photos };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error('Unknown error')
      };
    }
  }
};

// COMPONENT LAYER: Handle Result pattern consistently
export const PhotoList = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (query: string) => {
    const result = await dataService.fetchPhotos(query);
    
    if (result.success) {
      setPhotos(result.data);
      setError(null);
    } else {
      setError(result.error.message);
      setPhotos([]);
    }
  };

  return (
    <ErrorBoundary>
      {error && <ErrorMessage message={error} />}
      <PhotoGrid photos={photos} />
    </ErrorBoundary>
  );
};
```

## Automated Quality Checks

### **Pre-Commit Validation Script**

```bash
#!/bin/bash
# .agent-os/scripts/quality-check.sh

echo "🔍 Running Architecture Smell Detection..."

# Check component complexity
find src -name "*.tsx" -exec wc -l {} + | awk '$1 > 200 { print "❌ Component too large:", $2, "(" $1 " lines)" }'

# Check hook complexity  
grep -r "useEffect" src --include="*.tsx" | wc -l | awk '$1 > 3 { print "❌ Too many useEffects in file" }'

# Check for missing types
grep -r ": any" src --include="*.ts" --include="*.tsx" && echo "❌ Found 'any' types"

# Check for missing memoization
grep -rn "\.map\|\.filter\|\.reduce" src --include="*.tsx" | grep -v "useMemo\|useCallback" && echo "⚠️ Potential missing memoization"

# Check for missing cleanup
grep -A5 -B5 "useEffect" src --include="*.tsx" | grep -L "return.*cleanup\|return.*abort" && echo "❌ Missing cleanup in useEffect"

echo "✅ Quality check complete"
```

## Agent Instruction Integration

### **In System Prompt**

```markdown
ARCHITECTURE QUALITY REQUIREMENTS:
- NEVER generate components > 200 lines
- ALWAYS add TypeScript interfaces for props/state  
- ALWAYS wrap expensive operations in useMemo/useCallback
- ALWAYS add cleanup functions to useEffect
- ALWAYS use Result<T,E> pattern for error-prone operations
- NEVER use 'any' types in production code

Before generating code, verify against quality gates in @.agent-os/standards/architecture-smells.md
```

### **In Task Instructions**

```markdown
<code_quality_verification>
  BEFORE implementing features:
  1. READ @.agent-os/standards/architecture-smells.md
  2. APPLY quality gate checklist to planned implementation
  3. REFACTOR if any critical smells detected
  4. DOCUMENT any approved exceptions with TODO comments
</code_quality_verification>
```

### **In Code Review Prompt**

```markdown
Review this code for architecture smells:

<code>
{CODE_TO_REVIEW}
</code>

Check against:
1. Component complexity (lines, hooks, props)
2. Performance (memoization, re-renders)  
3. Type safety (explicit interfaces, no 'any')
4. Error handling (try-catch, cleanup, Result pattern)
5. Architecture compliance (SRP, DRY, SOLID)

Rate: CRITICAL/WARNING/INFO and provide refactoring suggestions.
```

## Success Metrics

### **Quantitative Measures**
- 0 components > 200 lines
- 0 useEffect with > 3 dependencies
- 0 'any' types in production code
- <100ms average component render time
- >90% test coverage
- <5MB memory growth per operation

### **Qualitative Measures**
- Code reviews consistently positive
- New developers onboard quickly
- Features delivered without performance issues
- Minimal bug reports related to architecture
- Agent integration works seamlessly

---

**Usage**: Include this file reference in all agent system prompts and task instructions
**Integration**: Link to from agents.md and development workflow documentation