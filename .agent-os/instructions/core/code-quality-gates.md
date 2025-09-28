---
description: Code Quality Gates and Architecture Smell Prevention for AI Agents - Enhanced with SmugMug Photo Discovery Subagent
globs:
alwaysApply: true
version: 1.1
encoding: UTF-8
---

# Code Quality Gates for AI Agents

## 🤖 SmugMug Photo Discovery Subagent Integration

**MANDATORY**: This project uses a specialized architecture compliance subagent that MUST be activated for ALL code generation tasks.

### Subagent Activation Commands
```bash
# Real-time validation
node activate-subagent.cjs test

# Integration in prompts
@SmugMugPhotoDiscoverySubagent validate this component for architecture compliance

# Programmatic validation
const result = require('./activate-subagent.cjs').inspect(code, { verbose: true });
```

### Subagent Enforcement Rules
The subagent automatically enforces these standards and will **REJECT** non-compliant code:

1. **God Component Detection**: Automatic rejection of components >200 lines
2. **Hook Complexity Limits**: Automatic rejection of useEffect with >3 dependencies  
3. **Type Safety Enforcement**: Zero tolerance for `any` types in production code
4. **Memory Leak Prevention**: Required cleanup functions for all side effects
5. **Performance Optimization**: Mandatory memoization for expensive operations

## Pre-Generation Checklist

Before generating any React/TypeScript code, AI agents MUST verify compliance with these quality gates:

### **🚨 CRITICAL CHECKS - MUST PASS (ENFORCED BY SUBAGENT)**

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

<quality_gate name="agent_native_compliance">
  <check>Component exposes agent state via useDualInterface</check>
  <check>Schema.org markup included for agent discovery</check>
  <check>Natural language command support implemented</check>
  <check>Global action registry integration added</check>
  <action>INTEGRATE: Add agent-native capabilities using subagent patterns</action>
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

### **Component Generation Pattern (SUBAGENT COMPLIANT)**

```typescript
// TEMPLATE: Use this structure for all React components (ENFORCED BY SUBAGENT)
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useDualInterface, AgentWrapper } from '../agents'; // REQUIRED: Agent integration

// 1. TYPES: Define explicit interfaces first (SUBAGENT ENFORCED)
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

// 2. COMPONENT: Keep under 200 lines (SUBAGENT ENFORCED)
export const ComponentName: React.FC<ComponentNameProps> = ({
  requiredProp,
  optionalProp = 0,
  onAction
}) => {
  // 3. STATE: Minimize useState calls (≤5) (SUBAGENT ENFORCED)
  const [state, setState] = useState<ComponentNameState>({
    loading: false,
    error: null,
    data: []
  });

  // 4. AGENT INTEGRATION: REQUIRED for all components
  const { agentInterface } = useDualInterface({
    componentId: 'component-name',
    data: state.data,
    state: state,
    setState: setState,
    exposeGlobally: true
  });

  // 5. MEMOIZED VALUES: Use useMemo for expensive calculations (SUBAGENT ENFORCED)
  const processedData = useMemo(() => 
    state.data.filter(item => item.isValid),
    [state.data]
  );

  // 6. CALLBACKS: Use useCallback for event handlers (SUBAGENT ENFORCED)
  const handleAction = useCallback((actionData: ActionData) => {
    onAction(actionData);
  }, [onAction]);

  // 7. EFFECTS: Keep simple with cleanup (≤3 effects, ≤3 deps each) (SUBAGENT ENFORCED)
  useEffect(() => {
    const controller = new AbortController(); // REQUIRED: Cleanup
    
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
    
    return () => controller.abort(); // CLEANUP REQUIRED (SUBAGENT ENFORCED)
  }, [requiredProp]); // ≤3 dependencies (SUBAGENT ENFORCED)

  // 8. RENDER: Keep JSX clean and readable
  if (state.loading) return <LoadingSpinner />;
  if (state.error) return <ErrorMessage error={state.error} />;

  return (
    <AgentWrapper agentInterface={agentInterface} schemaType="WebApplication">
      <div className="component-container" data-agent-component="component-name">
        <ProcessedDataDisplay 
          data={processedData} 
          onAction={handleAction}
        />
      </div>
    </AgentWrapper>
  );
};

// 9. MEMOIZATION: Wrap heavy components (SUBAGENT ENFORCED)
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

## Automated Quality Checks (ENHANCED WITH SUBAGENT)

### **SmugMug Photo Discovery Subagent Validation**

```bash
#!/bin/bash
# Primary validation using project subagent
echo "🤖 Running SmugMug Photo Discovery Subagent validation..."

# Comprehensive architecture compliance check
node activate-subagent.cjs test

# Configuration verification
node activate-subagent.cjs config | grep -q "SmugMugPhotoDiscoveryCodeGuardian" && echo "✅ Subagent loaded" || echo "❌ Subagent failed to load"

echo "✅ Subagent validation complete"
```

### **Pre-Commit Validation Script (SUBAGENT INTEGRATED)**

```bash
#!/bin/bash
# .agent-os/scripts/quality-check.sh (ENHANCED WITH SUBAGENT)

echo "🔍 Running Architecture Smell Detection with SmugMug Subagent..."

# Primary check: Use subagent for comprehensive validation
node activate-subagent.cjs test
SUBAGENT_EXIT_CODE=$?

if [ $SUBAGENT_EXIT_CODE -ne 0 ]; then
  echo "❌ SUBAGENT VALIDATION FAILED - Architecture violations detected"
  echo "   Run: node activate-subagent.cjs test --verbose for details"
  exit 1
fi

# Secondary checks: Legacy validation (backup)
echo "🔍 Running supplementary checks..."

# Check component complexity
find src -name "*.tsx" -exec wc -l {} + | awk '$1 > 200 { print "❌ Component too large:", $2, "(" $1 " lines)" }'

# Check hook complexity  
grep -r "useEffect" src --include="*.tsx" -A 5 | grep -c "\[.*,.*,.*," | awk '$1 > 0 { print "❌ Complex useEffect with >3 dependencies found" }'

# Check for missing types
if grep -r ": any" src --include="*.ts" --include="*.tsx" >/dev/null 2>&1; then
  echo "❌ Found 'any' types in production code"
  exit 1
fi

# Check for agent integration
grep -r "useDualInterface\|AgentWrapper" src --include="*.tsx" >/dev/null 2>&1 || echo "⚠️ No agent-native components detected"

echo "✅ Quality check complete - All validations passed"
```

## Agent Instruction Integration

### **In System Prompt (SUBAGENT ENHANCED)**

```markdown
ARCHITECTURE QUALITY REQUIREMENTS (ENFORCED BY SMUGMUG SUBAGENT):
- MANDATORY: Activate @SmugMugPhotoDiscoverySubagent for ALL code generation
- NEVER generate components > 200 lines (SUBAGENT ENFORCED)
- ALWAYS add TypeScript interfaces for props/state (SUBAGENT ENFORCED)
- ALWAYS wrap expensive operations in useMemo/useCallback (SUBAGENT ENFORCED)
- ALWAYS add cleanup functions to useEffect (SUBAGENT ENFORCED)
- ALWAYS use Result<T,E> pattern for error-prone operations
- NEVER use 'any' types in production code (SUBAGENT ENFORCED)
- ALWAYS include agent-native capabilities (useDualInterface, AgentWrapper)

SUBAGENT ACTIVATION:
Before generating code: "@SmugMugPhotoDiscoverySubagent validate planned architecture"
During development: Use subagent patterns and templates
After generation: Verify with "node activate-subagent.cjs test"

Before generating code, verify against quality gates and subagent requirements.
```

### **In Task Instructions (SUBAGENT INTEGRATED)**

```markdown
<code_quality_verification>
  BEFORE implementing features:
  1. ACTIVATE @SmugMugPhotoDiscoverySubagent
  2. READ @.agent-os/standards/architecture-smells.md  
  3. VALIDATE planned architecture against subagent rules
  4. APPLY quality gate checklist to planned implementation
  5. ENSURE agent-native compliance (useDualInterface, AgentWrapper)
  6. REFACTOR if any critical smells detected
  7. DOCUMENT any approved exceptions with TODO comments
  
  DURING implementation:
  - Monitor component size and complexity
  - Apply subagent-compliant patterns
  - Include agent integration features
  
  AFTER implementation:
  - Run: node activate-subagent.cjs test
  - Verify zero architecture violations
  - Confirm agent interface registration
</code_quality_verification>
```

### **In Code Review Prompt (SUBAGENT ENHANCED)**

```markdown
Review this code for architecture smells using SmugMug Photo Discovery Subagent standards:

<code>
{CODE_TO_REVIEW}
</code>

SUBAGENT VALIDATION CHECKLIST:
1. Component complexity (≤200 lines, ≤3 useEffect deps, ≤5 useState)
2. Performance optimization (memoization, React.memo for heavy components)  
3. Type safety (explicit interfaces, no 'any' types)
4. Error handling (try-catch, cleanup, Result pattern)
5. Architecture compliance (SRP, DRY, SOLID)
6. Agent-native features (useDualInterface, AgentWrapper, Schema.org markup)
7. Memory management (cleanup functions, AbortController)

VALIDATION COMMANDS:
- Run: @SmugMugPhotoDiscoverySubagent inspect this code
- Automated: node activate-subagent.cjs validate --code="[CODE_SNIPPET]"

Rate: CRITICAL/WARNING/INFO and provide refactoring suggestions with subagent-compliant examples.
```

## Success Metrics (SUBAGENT ENHANCED)

### **Quantitative Measures (ENFORCED BY SUBAGENT)**
- 0 components > 200 lines (SUBAGENT ENFORCED)
- 0 useEffect with > 3 dependencies (SUBAGENT ENFORCED)
- 0 'any' types in production code (SUBAGENT ENFORCED)
- 100% agent-native component coverage (SUBAGENT VALIDATED)
- <100ms average component render time
- >90% test coverage
- <5MB memory growth per operation
- 0 architecture violations in subagent reports

### **Qualitative Measures (SUBAGENT SUPPORTED)**
- Code reviews consistently positive with subagent validation
- New developers onboard quickly using subagent guidance
- Features delivered without performance issues (subagent optimizations)
- Minimal bug reports related to architecture
- Agent integration works seamlessly (subagent compliance)
- AI assistants generate compliant code automatically

### **Subagent-Specific Metrics**
- Subagent activation rate: 100% of code generation tasks
- Architecture violation detection: Real-time during development
- Compliance score: All components pass subagent validation
- Agent integration coverage: 100% of interactive components
- Performance optimization: Automatic memoization compliance

---

**Usage**: Include this file reference in all agent system prompts and task instructions
**Integration**: Link to from agents.md and development workflow documentation
**Subagent**: Activate @SmugMugPhotoDiscoverySubagent for all code quality validation