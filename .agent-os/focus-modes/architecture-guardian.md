---
description: Architecture Guardian Focus Mode - Self-validation and compliance enforcement
mode: architecture-guardian
activation: Component generation, pre-write validation
version: 1.0
---

# Architecture Guardian Focus Mode

## Purpose

Activate heightened architecture awareness and self-validation capabilities to ensure code compliance with project standards before writing files.

## When to Activate

### Automatic Triggers
- Component generation complete (before Write tool)
- Hook implementation complete
- Service layer modification
- Type definition creation
- Any production code generation

### Manual Triggers
- User requests: "validate architecture"
- Pre-commit validation
- Code review preparation
- Refactoring operations

## Responsibilities

### 1. Self-Assessment Against Standards

**Component Complexity:**
```typescript
// Self-check before writing
const selfAssessment = {
  lineCount: countLines(generatedCode),
  useStateCount: countHookCalls(generatedCode, 'useState'),
  useEffectCount: countHookCalls(generatedCode, 'useEffect'),
  effectDependencies: analyzeEffectDeps(generatedCode),
  anyTypesCount: countAnyTypes(generatedCode)
};

// Validation
if (selfAssessment.lineCount > 200) {
  ACTION: Split component or extract sub-components
  REASON: CS001 - God Component violation
}

if (selfAssessment.useStateCount > 5) {
  ACTION: Extract state management to custom hook
  REASON: CS001 - Too many state variables
}

if (selfAssessment.useEffectCount > 3) {
  ACTION: Extract effects to custom hooks
  REASON: CS002 - Complex component with too many effects
}

if (selfAssessment.effectDependencies.some(deps => deps.length > 3)) {
  ACTION: Simplify effects or extract to custom hook
  REASON: CS002 - Complex useEffect
}

if (selfAssessment.anyTypesCount > 0) {
  ACTION: Define explicit TypeScript interfaces
  REASON: CS005 - Type unsafety
}
```

### 2. Architecture Smell Detection

**Critical Smells (MUST FIX):**

```markdown
## CS001: God Component
DETECT: Component > 200 lines OR > 5 useState OR > 3 useEffect
ACTION:
  - Extract sub-components
  - Create custom hooks
  - Split into feature files

## CS002: Complex useEffect
DETECT: useEffect with > 3 dependencies OR > 20 lines
ACTION:
  - Extract to custom hook
  - Split into multiple focused effects
  - Simplify logic

## CS003: Missing Memoization
DETECT:
  - Array operations (.map, .filter, .reduce) without useMemo
  - Expensive calculations in render
  - Heavy components without React.memo
ACTION:
  - Add useMemo for calculations
  - Add useCallback for handlers
  - Wrap components in React.memo

## CS004: Memory Leaks
DETECT:
  - useEffect without cleanup function
  - Event listeners not removed
  - Timers not cleared
  - Fetch operations without AbortController
ACTION:
  - Add cleanup function to every useEffect
  - Use AbortController for async ops
  - Remove listeners and clear timers

## CS005: Type Unsafety
DETECT:
  - 'any' types present
  - Missing interfaces
  - Record<string, any>
ACTION:
  - Define explicit interfaces
  - Use proper union types
  - Avoid type assertions
```

### 3. Bash Validation Integration

**Workflow:**

```bash
# Step 1: Self-assessment complete
# Step 2: Check if subagent available
if [ -f "activate-subagent.cjs" ]; then
  # Step 3: Write to temp file
  echo "$generatedCode" > /tmp/validate-component.tsx

  # Step 4: Run validation
  node activate-subagent.cjs validate-file /tmp/validate-component.tsx --verbose

  # Step 5: Parse results
  # IF violations: Refactor and retry
  # ELSE: Proceed to Write tool
else
  # Fallback: Self-assessment only
  # Rely on built-in standards knowledge
fi
```

### 4. Pattern Enforcement

**Required Patterns:**

```typescript
// 1. Type Safety - Always define interfaces
interface ComponentProps {
  data: DataType;
  onAction: (item: DataType) => void;
}

// 2. Memoization - For expensive operations
const processedData = useMemo(() =>
  heavyCalculation(data),
  [data]
);

// 3. Callbacks - For event handlers
const handleClick = useCallback((id: string) => {
  onAction(id);
}, [onAction]);

// 4. Cleanup - For all effects
useEffect(() => {
  const controller = new AbortController();
  fetchData(controller.signal);

  return () => controller.abort(); // REQUIRED
}, [dependencies]);

// 5. React.memo - For performance-critical components
export default React.memo(ComponentName);

// 6. Agent Integration - If user-facing
const { agentInterface } = useDualInterface({
  componentId: 'component-name',
  data: componentData,
  exposeGlobally: true
});
```

## Activation Protocol

### Entry

```markdown
# Entering Architecture Guardian Mode

**Mindset Shift:**
- FROM: Code generation focus
- TO: Quality and compliance focus

**Knowledge Activation:**
- Load architecture-smells.md patterns (from memory)
- Reference best-practices.md (from memory)
- Apply code-style.md rules (from memory)

**Validation Stance:**
- Assume code is non-compliant until proven otherwise
- Be strict with standards enforcement
- Prioritize long-term maintainability over speed
```

### During Mode

**Continuous Checks:**
1. ✅ Line count monitoring (warn at 180, stop at 200)
2. ✅ Hook complexity tracking (useState ≤5, useEffect ≤3)
3. ✅ Type safety verification (zero 'any' allowed)
4. ✅ Memoization presence (for expensive ops)
5. ✅ Cleanup function verification (all effects)
6. ✅ Pattern consistency (with existing code)

**Self-Talk:**
- "Does this component exceed limits?" → Check line count
- "Are these effects complex?" → Count dependencies
- "Is this type-safe?" → Look for 'any' types
- "Will this perform well?" → Check for memoization
- "Will this leak memory?" → Verify cleanup

### Exit

```markdown
# Exiting Architecture Guardian Mode

**Validation Complete:**
- Self-assessment passed ✅
- Bash validation passed (if available) ✅
- All quality gates met ✅

**Ready to Write:**
- Component is compliant
- Performance optimized
- Memory-safe
- Type-safe
- Pattern-consistent

**Resume:** Normal development mode
```

## Integration with Workflow

### In execute-task-sonnet45.md

```markdown
## Step 4: Generate Component

# BEFORE Write tool:
ACTIVATE: Architecture Guardian Mode

# SELF-VALIDATE:
- Check line count
- Count hooks
- Verify types
- Ensure memoization
- Confirm cleanup

# IF subagent available:
Bash: validate-file temp-component.tsx

# IF violations:
REFACTOR: Fix issues
RETRY: Validation

# ELSE:
PROCEED: Write tool
DEACTIVATE: Architecture Guardian Mode
```

## Success Metrics

**Target Performance:**
- 99%+ architecture compliance rate
- <5% violations requiring refactor
- Zero critical smells in production
- 100% type safety
- 100% cleanup function coverage

**Quality Indicators:**
- First-time pass rate: >90%
- Refactor iterations: <2 per component
- Bash validation pass: >95%
- Standards adherence: 100%

## Troubleshooting

### High Violation Rate

**Symptoms:**
- Frequent need to refactor
- Multiple validation failures
- Components consistently too large

**Solutions:**
1. Plan component structure BEFORE coding
2. Break down into smaller units earlier
3. Use custom hooks more aggressively
4. Review similar compliant code for patterns

### Unclear Standards

**Symptoms:**
- Unsure if code complies
- Mixed signals from validation
- Conflicting pattern guidance

**Solutions:**
1. Re-read architecture-smells.md section
2. Reference best-practices.md examples
3. Look at existing compliant components
4. Ask for clarification if genuinely unclear

### Bash Validation Failures

**Symptoms:**
- Self-assessment passes but bash fails
- Unexpected violation reports
- Inconsistent results

**Solutions:**
1. Trust bash validation (it's more thorough)
2. Analyze specific violations carefully
3. Adjust self-assessment criteria
4. Learn from discrepancies

## Examples

### Example 1: Component Too Large

```typescript
// BEFORE (Violation)
const PhotoManagement = ({ photos }) => {
  // 250 lines of mixed concerns
  // → CS001: God Component
};

// Architecture Guardian Assessment:
VIOLATION: Component exceeds 200 lines (found: 250)
ACTION: Split into sub-components

// AFTER (Compliant)
const PhotoManagement = ({ photos }) => (
  <div>
    <PhotoSearch photos={photos} />
    <PhotoFilters />
    <PhotoGrid />
    <BulkOperations />
  </div>
);
// Each sub-component: <200 lines ✅
```

### Example 2: Complex Hook

```typescript
// BEFORE (Violation)
useEffect(() => {
  // 30 lines of complex logic
}, [dep1, dep2, dep3, dep4, dep5]); // 5 deps!
// → CS002: Complex useEffect

// Architecture Guardian Assessment:
VIOLATION: useEffect has 5 dependencies (limit: 3)
VIOLATION: useEffect body has 30 lines (limit: 20)
ACTION: Extract to custom hook

// AFTER (Compliant)
const usePhotoManagement = (params) => {
  // Extracted logic with proper structure
  return { data, loading, error };
};

const Component = () => {
  const { data, loading, error } = usePhotoManagement(params);
  // Simple, focused component ✅
};
```

### Example 3: Missing Memoization

```typescript
// BEFORE (Violation)
const Component = ({ items }) => {
  const filtered = items.filter(item =>
    complexFilter(item) // Expensive!
  );
  // → CS003: Missing Memoization
};

// Architecture Guardian Assessment:
VIOLATION: Expensive operation without useMemo
ACTION: Add memoization

// AFTER (Compliant)
const Component = ({ items }) => {
  const filtered = useMemo(
    () => items.filter(item => complexFilter(item)),
    [items]
  );
  // Memoized ✅
};
```

---

**Mode**: Architecture Guardian
**Version**: 1.0
**Activation**: Pre-write validation
**Integration**: execute-task-sonnet45.md Step 4
**Success Rate Target**: >95% first-pass compliance
