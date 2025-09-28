---
description: Architecture Smells Detection and Prevention Rubric - Enhanced with SmugMug Photo Discovery Subagent
globs:
alwaysApply: true
version: 1.1
encoding: UTF-8
---

# Architecture Smells Rubric (SUBAGENT ENHANCED)

## Overview

This rubric defines code and architecture smells that MUST be avoided when working with React/TypeScript applications. This project includes a **SmugMug Photo Discovery Subagent** that automatically detects and prevents these smells.

## 🤖 Subagent Integration

**MANDATORY**: Use the SmugMug Photo Discovery Subagent for all code validation:

```bash
# Activate subagent before coding
node activate-subagent.cjs test

# AI agent activation
@SmugMugPhotoDiscoverySubagent validate architecture compliance

# Real-time validation  
const result = require('./activate-subagent.cjs').inspect(code, { verbose: true });
```

The subagent **AUTOMATICALLY REJECTS** code that violates these architecture standards.

## Smell Categories

### 🔴 **CRITICAL SMELLS - IMMEDIATE FIX REQUIRED (SUBAGENT ENFORCED)**

#### **CS001: God Component (AUTOMATIC REJECTION BY SUBAGENT)**
**Detection**: Component > 200 lines OR > 5 useState calls OR > 3 useEffect calls
```typescript
// SMELL: Too many responsibilities
const MegaComponent = ({ photos, filters, operations, commands, analytics }) => {
  const [state1, setState1] = useState();
  const [state2, setState2] = useState();
  const [state3, setState3] = useState();
  const [state4, setState4] = useState();
  const [state5, setState5] = useState(); // TOO MANY!
  
  useEffect(() => { /* logic 1 */ }, [deps1]);
  useEffect(() => { /* logic 2 */ }, [deps2]);
  useEffect(() => { /* logic 3 */ }, [deps3]); // TOO MANY!
  
  // 300+ lines of component logic
};
```
**Fix**: Extract sub-components, custom hooks, or service classes (Subagent provides examples)

#### **CS002: Complex useEffect (AUTOMATIC REJECTION BY SUBAGENT)**
**Detection**: useEffect with > 3 dependencies OR > 20 lines of code
```typescript
// SMELL: Complex effect with many dependencies  
useEffect(() => {
  if (condition1 && condition2 && !condition3) {
    const result = complexCalculation(dep1, dep2);
    updateState1(result);
    updateState2(processResult(result));
    notifyServices(result);
    logAnalytics(result);
  }
}, [condition1, condition2, condition3, dep1, dep2, updateState1, updateState2]); // TOO MANY!
```
**Fix**: Extract custom hooks or break into multiple focused effects (Subagent provides patterns)

#### **CS003: Missing Memoization (AUTOMATIC REJECTION BY SUBAGENT)**
**Detection**: Expensive calculations in render OR missing React.memo on heavy components
```typescript
// SMELL: Expensive operation every render
const Component = ({ items, filters }) => {
  const filteredItems = items.filter(item => 
    filters.every(filter => complexValidation(item, filter)) // EXPENSIVE!
  );
  
  return filteredItems.map(item => 
    <HeavyComponent key={item.id} item={item} /> // NOT MEMOIZED!
  );
};
```
**Fix**: Add useMemo for calculations, React.memo for components (Subagent enforces)

#### **CS004: Memory Leaks (AUTOMATIC REJECTION BY SUBAGENT)**
**Detection**: useEffect without cleanup OR missing AbortController
```typescript
// SMELL: No cleanup
useEffect(() => {
  window.addEventListener('resize', handler);
  const timer = setInterval(update, 1000);
  fetchData(url).then(setData); // Not cancelable!
  // MISSING CLEANUP!
}, []);
```
**Fix**: Always return cleanup function and use AbortController (Subagent enforces)

#### **CS005: Type Unsafety (AUTOMATIC REJECTION BY SUBAGENT)**
**Detection**: `any` types OR `Record<string, any>` OR missing interfaces
```typescript
// SMELL: Weak typing
const processData = (input: any) => { // NO TYPE SAFETY!
  return input.someProperty.map((item: any) => ({
    ...item,
    processed: true
  }));
};
```
**Fix**: Create explicit TypeScript interfaces (Subagent provides examples)

#### **CS006: Missing Agent Integration (SUBAGENT DETECTED)**
**Detection**: Interactive components without useDualInterface OR missing AgentWrapper
```typescript
// SMELL: Component without agent integration
export const PhotoGrid = ({ photos }) => {
  // Missing agent-native capabilities!
  return <div>{/* No agent interface */}</div>;
};
```
**Fix**: Add agent-native capabilities for dual-interface architecture

### 🟡 **WARNING SMELLS - SHOULD FIX**

#### **WS001: Prop Drilling**
**Detection**: Props passed through > 3 component levels
```typescript
// SMELL: Deep prop drilling
<GrandParent onAction={handleAction}>
  <Parent onAction={handleAction}>
    <Child onAction={handleAction}>
      <GrandChild onAction={handleAction} /> {/* 4 LEVELS! */}
    </Child>
  </Parent>
</GrandParent>
```
**Fix**: Use Context API or state management

#### **WS002: Large Bundle**
**Detection**: Component imports > 10 dependencies OR bundle > 1MB
```typescript
// SMELL: Too many imports
import { A, B, C, D, E, F, G, H, I, J, K } from 'library'; // TOO MANY!
import Utils1 from './utils1';
import Utils2 from './utils2';
// ... 15+ more imports
```
**Fix**: Code splitting and lazy loading

#### **WS003: Inconsistent Error Handling**
**Detection**: Mix of thrown errors, returned errors, and undefined
```typescript
// SMELL: Inconsistent patterns
const service1 = () => { throw new Error('fail'); }; // Throws
const service2 = () => ({ error: 'fail' }); // Returns error
const service3 = () => undefined; // Returns undefined
```
**Fix**: Standardize on Result<T, E> pattern

### 🟢 **INFO SMELLS - CONSIDER FIXING**

#### **IS001: Missing Tests**
**Detection**: Component without tests OR < 80% coverage
**Fix**: Add behavior-focused tests

#### **IS002: Hardcoded Values**
**Detection**: Magic numbers OR hardcoded strings
```typescript
// SMELL: Magic numbers
if (items.length > 50) { // WHY 50?
  showVirtualization();
}
```
**Fix**: Extract to named constants

## Automated Detection (SUBAGENT ENHANCED)

### **SmugMug Photo Discovery Subagent**
```bash
# Primary validation tool
node activate-subagent.cjs test

# Real-time code inspection
node -e "
const subagent = require('./activate-subagent.cjs');
const agent = new subagent();
const result = agent.inspect(codeString, { verbose: true, generateFixes: true });
console.log(result);
"

# Integration with AI tools
@SmugMugPhotoDiscoverySubagent validate this component architecture
```

### **Subagent Detection Capabilities**
- **Real-time Analysis**: Detects violations as code is written
- **Automatic Rejection**: Stops generation of non-compliant code
- **Fix Suggestions**: Provides specific refactoring examples
- **Compliance Scoring**: Measures architecture health metrics
- **Agent Integration**: Ensures dual-interface requirements

### **ESLint Rules (Secondary Validation)**
```json
{
  "rules": {
    "complexity": ["error", { "max": 10 }],
    "max-lines-per-function": ["error", { "max": 50 }],
    "max-params": ["error", { "max": 5 }],
    "@typescript-eslint/no-explicit-any": "error",
    "react-hooks/exhaustive-deps": "error"
  }
}
```

### **Custom Hooks Detection (SUBAGENT INTEGRATED)**
```bash
# Primary: Use subagent for comprehensive analysis
node activate-subagent.cjs test --component-analysis

# Backup: Legacy detection methods
# Detect god components
grep -r "useState" src/ | wc -l  # Should be < 5 per file
grep -r "useEffect" src/ | wc -l # Should be < 3 per file

# Detect missing memoization (subagent provides better analysis)
grep -rn "\.map\|\.filter\|\.reduce" src/ --include="*.tsx" 

# Detect agent integration
grep -r "useDualInterface\|AgentWrapper" src/ --include="*.tsx" || echo "⚠️ Missing agent integration"
```

### **Performance Metrics (SUBAGENT MONITORED)**
- Component render time < 16ms (60fps) - Subagent validates memoization
- Bundle size < 1MB per route - Subagent checks imports
- Memory growth < 5MB per operation - Subagent enforces cleanup
- Search response < 3 seconds - Subagent optimizes algorithms
- Agent interface response < 100ms - Subagent ensures efficiency

## Refactoring Strategies

### **God Component → Composition**
```typescript
// BEFORE: God component
const PhotoManagement = ({ photos, filters, operations }) => {
  // 500+ lines of mixed concerns
};

// AFTER: Composed components
const PhotoManagement = ({ photos }) => (
  <div>
    <PhotoSearch photos={photos} />
    <PhotoFilters />
    <PhotoGrid />
    <BulkOperations />
  </div>
);
```

### **Complex Logic → Custom Hooks**
```typescript
// BEFORE: Complex component logic
const Component = () => {
  const [data, setData] = useState();
  const [loading, setLoading] = useState();
  const [error, setError] = useState();
  
  useEffect(() => {
    // 50+ lines of complex logic
  }, [multiple, complex, dependencies]);
};

// AFTER: Custom hook
const useAsyncData = (url) => {
  // Extracted logic with proper error handling
};

const Component = () => {
  const { data, loading, error } = useAsyncData(url);
  return <div>{/* simple render logic */}</div>;
};
```

### **Type Safety Migration**
```typescript
// BEFORE: Weak typing
const processItems = (items: any[]) => {
  return items.map((item: any) => item.value);
};

// AFTER: Strong typing
interface Item {
  id: string;
  value: number;
  metadata: ItemMetadata;
}

const processItems = (items: Item[]): number[] => {
  return items.map(item => item.value);
};
```

## Quality Gates (SUBAGENT ENFORCED)

### **Pre-Commit Checklist (MANDATORY SUBAGENT VALIDATION)**
- [ ] Subagent validation passed (node activate-subagent.cjs test)
- [ ] No components > 200 lines (SUBAGENT ENFORCED)
- [ ] No useEffect > 3 dependencies (SUBAGENT ENFORCED)
- [ ] All expensive operations memoized (SUBAGENT ENFORCED)
- [ ] All side effects have cleanup (SUBAGENT ENFORCED)
- [ ] No `any` types in production code (SUBAGENT ENFORCED)
- [ ] All public APIs have TypeScript interfaces (SUBAGENT ENFORCED)
- [ ] Agent integration included (useDualInterface + AgentWrapper) (SUBAGENT ENFORCED)
- [ ] Tests cover critical workflows
- [ ] Performance benchmarks met

### **Code Review Checklist (SUBAGENT SUPPORTED)**
- [ ] Single Responsibility Principle followed (SUBAGENT VALIDATES)
- [ ] DRY principle applied (no code duplication)
- [ ] SOLID principles respected
- [ ] Error handling consistent (Result<T,E> pattern)
- [ ] Performance considerations addressed (SUBAGENT OPTIMIZES)
- [ ] Accessibility requirements met
- [ ] Security best practices followed
- [ ] Agent-native capabilities included (SUBAGENT ENSURES)

## Exceptions & Context

### **When to Allow Smells**
1. **Prototyping**: Temporarily allow during rapid iteration
2. **Migration**: Gradual refactoring of legacy code
3. **Third-party**: External library constraints
4. **Performance**: Micro-optimizations where proven necessary

### **Documentation Requirements**
When allowing smells, document:
```typescript
// SMELL: God component allowed during migration phase
// TODO: Break down into smaller components by Sprint 15
// Tracking: JIRA-123
const LegacyMegaComponent = () => {
  // 500+ lines of legacy code
};
```

## Measurement & Monitoring (SUBAGENT ENHANCED)

### **Metrics to Track (SUBAGENT AUTOMATED)**
- Average component size (lines of code) - Real-time monitoring
- Number of useEffect per component - Automatic detection  
- Bundle size growth over time - Continuous tracking
- Memory usage patterns - Leak detection
- Test coverage percentage - Integration with test runners
- TypeScript strict mode compliance - Zero tolerance enforcement
- Agent integration coverage - Dual-interface metrics
- Architecture violation frequency - Trend analysis

### **Tools & Integration (SUBAGENT POWERED)**
- **SmugMug Photo Discovery Subagent**: Primary validation and enforcement
- **SonarQube**: Code complexity and maintainability  
- **Bundle Analyzer**: Size and dependency analysis (subagent integrated)
- **React DevTools**: Performance profiling (subagent recommendations)
- **TypeScript**: Strict mode enforcement (subagent ensures compliance)
- **ESLint**: Automated smell detection (subagent enhanced rules)
- **Agent State Registry**: Real-time agent interface monitoring

---

**Last Updated**: 2025-01-27
**Version**: 1.1.0 (Subagent Enhanced)  
**Applies To**: All React/TypeScript projects with SmugMug Photo Discovery Subagent
**Subagent**: Activate with @SmugMugPhotoDiscoverySubagent for all code validation