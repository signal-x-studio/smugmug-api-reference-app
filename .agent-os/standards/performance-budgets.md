---
description: Performance budgets and quality thresholds for SmugMug API Reference App
version: 1.0
date: 2025-09-30
status: Active - Enforced via Quality Gates
---

# Performance Budgets

## Overview

Quantitative thresholds that define acceptable performance characteristics. All budgets are **enforced automatically** via quality gates. Violations block feature completion.

---

## Bundle Size Budgets

### Total Application

```yaml
Production Bundle (gzipped):
  Maximum: 1MB (1,048,576 bytes)
  Target: 800KB
  Critical Threshold: 1.2MB (triggers warning)

Initial Load (gzipped):
  Maximum: 500KB
  Target: 400KB
  Critical Threshold: 600KB

Code Split Chunks (each):
  Maximum: 200KB
  Target: 150KB
  Critical Threshold: 250KB
```

### Per Module Type

```yaml
Component (gzipped):
  Maximum: 20KB
  Target: 15KB
  Examples:
    - PhotoCard.tsx: <20KB
    - FilterPanel.tsx: <20KB
    - ImageGrid.tsx: <20KB

Utility Module (gzipped):
  Maximum: 5KB
  Target: 3KB
  Examples:
    - agent-actions.ts: <5KB
    - natural-language.ts: <5KB

Hook (gzipped):
  Maximum: 3KB
  Target: 2KB
  Examples:
    - useAgentIntegration.ts: <3KB
    - useFilterState.ts: <3KB

Service Module (gzipped):
  Maximum: 10KB
  Target: 8KB
  Examples:
    - geminiService.ts: <10KB
    - smugmugService.ts: <10KB
```

### Validation Commands

```bash
# Build and analyze bundle
npm run build

# Check bundle size
du -sh dist/*.js | awk '{print $1}'

# Detailed analysis (if webpack-bundle-analyzer installed)
npm run build:analyze

# Expected output:
# dist/main.[hash].js: 847KB (✅ under 1MB budget)
# dist/vendor.[hash].js: 231KB (✅ under 500KB budget)
```

### Enforcement

**Quality Gate 4 (Build Validation):**
```bash
# Build must complete within budget
npm run build

# If bundle exceeds budget:
ERROR: Bundle size 1.2MB exceeds budget of 1MB
BLOCK: Feature completion
ACTION: Optimize bundle (tree-shaking, code-splitting, lazy loading)
```

---

## Memory Budgets

### Session Limits

```yaml
Maximum Memory Growth:
  Per Session: 100MB
  Description: Total memory increase from app start to 30 min usage
  Measurement: Chrome DevTools Memory profiler

Total Memory Consumption:
  Maximum: 250MB
  Target: 150MB
  Description: Total heap size during normal operation

Leak Detection:
  Tolerance: 0 leaks
  Description: No retained detached DOM nodes
  Measurement: Take 3 heap snapshots, compare retained size
```

### Component Limits

```yaml
Re-render Memory Impact:
  Maximum Increase: 5MB per re-render
  Description: Memory growth from component update
  Example: ImageGrid re-render should not increase heap >5MB

Unmount Cleanup:
  Requirement: 100% memory freed
  Description: All listeners removed, refs cleared, subscriptions cancelled
  Measurement: Heap snapshot before mount vs. after unmount
```

### Validation Commands

```bash
# Manual memory testing (Chrome DevTools)
1. Open DevTools → Memory tab
2. Take heap snapshot (baseline)
3. Use app for 5 minutes
4. Take heap snapshot (after usage)
5. Compare: retained size should be <100MB growth

# Automated leak detection (if configured)
npm run test:memory

# Expected output:
# ✅ No memory leaks detected
# ✅ Memory growth: 68MB (under 100MB budget)
# ✅ Retained objects: 0 detached DOM nodes
```

---

## Test Coverage Budgets

### Overall Project

```yaml
Total Coverage:
  Minimum: 90%
  Target: 95%
  Enforcement: Vitest threshold

Critical Paths:
  Minimum: 95%
  Description: Core user workflows (search, filter, view photos)
  Examples:
    - Photo discovery workflow
    - Agent action execution
    - Natural language processing
```

### By Module Type

```yaml
Agent-Native Modules:
  Minimum: 95%
  High Criticality: AI integration, action registry, dual-interface
  Examples:
    - agent-integration.ts: >95%
    - natural-language.ts: >95%
    - agent-actions.ts: >95%

UI Components:
  Minimum: 90%
  Examples:
    - PhotoCard.tsx: >90%
    - FilterPanel.tsx: >90%
    - ImageGrid.tsx: >90%

Utilities:
  Minimum: 95%
  High Reuse: Used across multiple components
  Examples:
    - semantic-search-engine.ts: >95%
    - photo-discovery-search.ts: >95%

Hooks:
  Minimum: 90%
  Examples:
    - useAgentIntegration.ts: >90%
    - useFilterState.ts: >90%

Services:
  Minimum: 95%
  External Dependencies: API calls, third-party integrations
  Examples:
    - geminiService.ts: >95%
    - smugmugService.ts: >95%
```

### By Coverage Type

```yaml
Statements: 90% minimum
Branches: 85% minimum
Functions: 90% minimum
Lines: 90% minimum
```

### Configuration

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        statements: 90,
        branches: 85,
        functions: 90,
        lines: 90,
        // Per-module thresholds
        'src/utils/agent-native/**': {
          statements: 95,
          branches: 90,
          functions: 95,
          lines: 95
        },
        'src/services/**': {
          statements: 95,
          branches: 90,
          functions: 95,
          lines: 95
        }
      }
    }
  }
});
```

### Validation Commands

```bash
# Run tests with coverage
npm run test:coverage

# Expected output:
# ✅ Statements: 94.2% (target: 90%)
# ✅ Branches: 88.1% (target: 85%)
# ✅ Functions: 93.5% (target: 90%)
# ✅ Lines: 94.8% (target: 90%)

# If below threshold:
# ❌ ERROR: Coverage 87.3% below threshold of 90%
# BLOCK: Feature completion
# ACTION: Add missing tests
```

---

## Build Performance Budgets

### Build Time

```yaml
Development Build:
  Maximum: 30 seconds
  Target: 20 seconds
  Description: Time from 'npm run dev' to server ready

Production Build:
  Maximum: 2 minutes (120 seconds)
  Target: 90 seconds
  Description: Time from 'npm run build' to completion

Type Checking:
  Maximum: 10 seconds
  Target: 5 seconds
  Description: Time for 'npx tsc --noEmit'
```

### Hot Module Replacement

```yaml
HMR Update:
  Maximum: 500ms
  Target: 300ms
  Description: Time from save to browser update

Full Reload:
  Maximum: 3 seconds
  Target: 2 seconds
  Description: Complete page reload time
```

### Validation

```bash
# Measure build time
time npm run build

# Expected output:
# real    1m32.456s  (✅ under 2 min budget)

# Measure type checking
time npx tsc --noEmit

# Expected output:
# real    0m7.234s  (✅ under 10 sec budget)
```

---

## API Response Budgets

### SmugMug API Calls

```yaml
Photo Fetch (single):
  Maximum: 2 seconds
  Target: 1 second
  Description: Fetch single photo metadata

Album Fetch:
  Maximum: 1 second
  Target: 500ms
  Description: Fetch album information

Search Query:
  Maximum: 3 seconds
  Target: 2 seconds
  Description: Execute photo search query

Batch Operations:
  Maximum: 5 seconds per 10 items
  Target: 3 seconds per 10 items
  Description: Bulk photo metadata fetch
```

### Gemini AI Analysis

```yaml
Single Photo Analysis:
  Maximum: 5 seconds
  Target: 3 seconds
  Description: AI analysis of single photo

Batch Analysis:
  Maximum: 20 seconds per 10 photos
  Target: 15 seconds per 10 photos
  Description: Batch AI analysis

Natural Language Query:
  Maximum: 3 seconds
  Target: 2 seconds
  Description: Parse and execute NL query
```

### Validation

```bash
# Manual API testing
# Use browser DevTools Network tab or:
curl -w "@curl-format.txt" -o /dev/null -s "API_ENDPOINT"

# Where curl-format.txt contains:
#   time_total: %{time_total}s

# Expected: <2s for photo fetch
```

---

## Enforcement via Quality Gates

### Integration with Sequential Quality Gates

**Gate 4: Build Validation (Step 5 in execute-task-sonnet45.md)**

```markdown
RUN: npm run build

VALIDATE:
- Build completes: ✅
- Bundle size: Check dist/ sizes against budgets
- No errors: ✅
- No critical warnings: ✅

IF bundle size exceeds budget:
  ERROR: Bundle 1.2MB exceeds 1MB budget
  BLOCK: Feature completion
  ACTION: Optimize:
    - Use dynamic imports for large dependencies
    - Enable tree-shaking
    - Remove unused code
    - Split vendor bundles
  RETRY: After optimization
```

**Gate 2: Test Coverage (Step 5 in execute-task-sonnet45.md)**

```markdown
RUN: npm run test:coverage

VALIDATE:
- All tests pass: ✅
- Coverage > 90%: Check thresholds
- Critical paths > 95%: Verify

IF coverage below threshold:
  ERROR: Coverage 87.3% below 90% minimum
  BLOCK: Feature completion
  ACTION: Add tests:
    - Identify uncovered lines (coverage report)
    - Write tests for uncovered branches
    - Test edge cases
    - Verify critical path coverage
  RETRY: After adding tests
```

---

## Budget Violations

### Handling Process

**When budget exceeded:**

1. **Block Feature Completion** - Treat as quality gate failure
2. **Analyze Root Cause:**
   - Large dependency added?
   - Memory leak introduced?
   - Test coverage dropped?
   - Build configuration changed?
3. **Apply Fixes:**
   - Bundle size: Tree-shake, lazy load, code-split
   - Memory: Fix leaks, add cleanup functions
   - Coverage: Add missing tests
   - Build time: Optimize build config, cache dependencies
4. **Re-validate:**
   - Re-run failed quality gate
   - Verify budget now satisfied
5. **Document:**
   - If persistent issue, document investigation
   - Update budgets if justified (rare)

### Common Fixes

**Bundle Size Violations:**
```typescript
// Before (violation): Import entire library
import * as _ from 'lodash';  // +72KB

// After (fixed): Tree-shakeable import
import { debounce } from 'lodash-es';  // +2KB

// Before (violation): All code in main bundle
import HeavyComponent from './HeavyComponent';

// After (fixed): Dynamic import (code-splitting)
const HeavyComponent = lazy(() => import('./HeavyComponent'));
```

**Memory Violations:**
```typescript
// Before (violation): Missing cleanup
useEffect(() => {
  window.addEventListener('resize', handleResize);
  // No cleanup! Memory leak
}, []);

// After (fixed): Proper cleanup
useEffect(() => {
  window.addEventListener('resize', handleResize);
  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, [handleResize]);
```

**Coverage Violations:**
```typescript
// Before (violation): Untested edge cases
function processPhotos(photos) {
  return photos.filter(p => p.metadata);
}

// After (fixed): Comprehensive tests
describe('processPhotos', () => {
  it('filters photos with metadata', () => { /* ... */ });
  it('handles empty array', () => { /* ... */ });
  it('handles null metadata', () => { /* ... */ });
  it('handles undefined input', () => { /* ... */ });
});
```

---

## Monitoring & Tracking

### Metrics File

Track budgets over time in `.agent-os/metrics/performance-budgets.yml`:

```yaml
# Updated: 2025-09-30
bundle_size:
  current: 847KB
  budget: 1024KB (1MB)
  trend: +12KB from last week
  status: within_budget
  last_violation: 2025-09-15

test_coverage:
  current: 94.2%
  budget: 90%
  trend: +1.3% from last week
  status: above_target
  last_violation: null

memory:
  current: 68MB avg session
  budget: 100MB
  trend: -5MB from last week
  status: well_within_budget
  last_violation: null

build_time:
  current: 92s
  budget: 120s (2 min)
  trend: +3s from last week
  status: within_budget
  last_violation: null
```

### Continuous Monitoring

```bash
# Weekly budget check
npm run validate:budgets

# Generates report:
# ✅ Bundle Size: 847KB / 1024KB (82.7% utilized)
# ✅ Test Coverage: 94.2% / 90% (104.7% of minimum)
# ✅ Memory: 68MB / 100MB (68% utilized)
# ✅ Build Time: 92s / 120s (76.7% utilized)
#
# Status: All budgets satisfied
```

---

## Summary

**All budgets are blocking requirements enforced via quality gates.**

### Budget Overview

| Category | Budget | Current | Status |
|----------|--------|---------|--------|
| Bundle Size | <1MB | 847KB | ✅ Within |
| Test Coverage | >90% | 94.2% | ✅ Above |
| Memory Growth | <100MB | 68MB | ✅ Within |
| Build Time | <2min | 92s | ✅ Within |

### Violations Block Deployment

- Quality Gate 2: Test coverage
- Quality Gate 4: Bundle size, build success

### Zero Tolerance

- Memory leaks: 0 allowed
- Critical test paths: Must have >95% coverage
- Type safety: Zero 'any' types

---

**Version**: 1.0
**Last Updated**: 2025-09-30
**Enforcement**: Automatic via Sequential Quality Gates
**Status**: Active and Enforced
