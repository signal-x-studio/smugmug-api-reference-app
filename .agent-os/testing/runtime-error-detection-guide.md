---
description: Guide for using the Runtime Error Detection Framework in development workflow
version: 1.0
encoding: UTF-8
---

# Runtime Error Detection Framework - Developer Guide

## Overview

The Runtime Error Detection Framework provides automated detection, classification, and reporting of runtime errors for the SmugMug API Reference App. It integrates into the development workflow through pre-commit hooks, CI/CD pipelines, and manual testing.

## Quick Reference

### Daily Development

```bash
# Before committing - runs automatically via pre-commit hook
git commit -m "Your message"

# Manual unit test run
pnpm test -- src/testing/runtime-errors/__tests__/ --run

# Manual E2E test run
pnpm test:runtime-errors

# Generate error report
pnpm run generate-error-report
```

### CI/CD Integration

The framework runs automatically on:
- **Pull requests** - Validates no new critical errors
- **Pushes to main** - Monitors production code
- **Daily schedule** (midnight UTC) - Catches intermittent issues
- **Manual dispatch** - On-demand testing

## Error Categories

The framework detects 7 categories of runtime errors:

| Category | Description | Examples | Severity |
|----------|-------------|----------|----------|
| `agent-native` | Agent interface/action failures | Missing action registration, schema validation failures | Critical |
| `api-integration` | SmugMug/Gemini API errors | 401 Unauthorized, 429 Rate Limit, timeout | High |
| `network-error` | Network/fetch failures | Connection timeout, DNS failure, CORS | High |
| `data-error` | Null/undefined access, parsing | `Cannot read property 'x' of undefined` | Medium |
| `hook-error` | React hook dependency issues | Missing dependencies, infinite loops | Medium |
| `component-error` | React rendering errors | Unhandled exceptions in render | Medium |
| `performance-error` | Memory leaks, performance | Memory leak in useEffect, expensive re-renders | Low |

## Severity Levels

| Severity | Icon | Action Required | Examples |
|----------|------|-----------------|----------|
| Critical | 🔴 | Fix immediately - blocks deployment | Agent action not registered, app crashes |
| High | 🟠 | Fix before release | API auth failure, network timeout |
| Medium | 🟡 | Fix in next sprint | Null access caught by boundary, hook warnings |
| Low | 🟢 | Monitor and optimize | Console warnings, performance degradation |

## When to Run Tests

### Pre-Commit (Automatic)

The pre-commit hook automatically runs unit tests for runtime error detection:

```bash
# Triggered automatically on:
git commit -m "Your changes"

# What runs:
pnpm test -- src/testing/runtime-errors/__tests__/ --run --reporter=verbose
```

**Pass Criteria**: All 66 unit tests must pass

### During Development (Manual)

Run tests when:
- Adding new components (especially with agent integration)
- Modifying API integration code
- Refactoring error handling
- Debugging runtime issues

```bash
# Unit tests only (fast)
pnpm test -- src/testing/runtime-errors/__tests__/ --run

# E2E tests (comprehensive, slower)
pnpm test:runtime-errors

# E2E tests with UI (debugging)
pnpm test:e2e:ui
```

### Before Pull Request (Manual)

Generate a full error detection report:

```bash
# Run all tests and generate reports
pnpm test -- src/testing/runtime-errors/__tests__/ --run
pnpm test:runtime-errors
pnpm run generate-error-report

# View HTML report
pnpm test:runtime-errors:report
```

## Using Error Reports

### HTML Report

Interactive dashboard with filtering and visualizations:

**Location**: `test-results/runtime-errors/report.html`

**Features**:
- Error summary with severity breakdown
- Component heat map (which components have most errors)
- Filterable error tables
- Fix suggestions with code examples
- Test coverage metrics

**View**:
```bash
pnpm test:runtime-errors:report
# or
open test-results/runtime-errors/report.html
```

### JSON Report

Machine-readable format for CI/CD integration:

**Location**: `test-results/runtime-errors/report.json`

**Use Cases**:
- CI/CD automation (threshold enforcement)
- Historical trend analysis
- Custom tooling integration

**Structure**:
```json
{
  "summary": {
    "totalErrors": 0,
    "bySeverity": {
      "critical": 0,
      "high": 0,
      "medium": 0,
      "low": 0
    },
    "byCategory": { /* ... */ }
  },
  "errors": [ /* ... */ ],
  "criticalErrors": [],
  "fixSuggestions": []
}
```

### Markdown Report

GitHub-friendly format for PR comments:

**Location**: `test-results/runtime-errors/report.md`

**Use Cases**:
- PR review comments (auto-posted by CI)
- Issue descriptions
- Documentation

**Automatically Posted**:
- On pull requests (via GitHub Actions)
- Shows new errors introduced by PR
- Provides fix suggestions inline

## Integration with Quality Gates

Runtime error detection is integrated as **Gate 5** in the quality gate sequence:

```
Gate 1: TypeScript Compilation ✅
  ↓
Gate 2: Test Suite Execution ✅
  ↓
Gate 3: Architecture Validation ✅
  ↓
Gate 4: Build Validation ✅
  ↓
Gate 5: Runtime Error Detection (OPTIONAL) ⏭️
  ↓
✅ Feature Complete
```

**When Gate 5 Runs**:
- New components added (especially with agent integration)
- Significant feature additions
- API integration changes
- Manual execution requested

**When Gate 5 Skips**:
- Minor bug fixes
- Documentation changes
- Style/formatting updates
- Test-only changes

**Gate 5 Failure Handling**:
```bash
# If Gate 5 fails:
1. Analyze error category from test output
2. Apply fix based on error type
3. Re-run Gate 5
4. Iterate until passing

# Common fixes:
- agent-native: Register missing actions in AgentWrapper
- api-integration: Add error boundaries, handle API failures
- data-error: Add null checks, optional chaining
- component-error: Wrap with ErrorBoundary
- hook-error: Fix dependencies, add cleanup functions
```

## Error Fix Patterns

### Agent-Native Errors

**Problem**: Agent action not registered

**Detection**:
```typescript
// Error: Agent action 'search-photos' not registered
window.agentActions['search-photos'].execute(...)
```

**Fix**:
```typescript
// Ensure AgentWrapper is mounted and actions registered
<AgentWrapper>
  <YourComponent />
</AgentWrapper>

// Or check action exists before calling
if (window.agentActions?.['search-photos']) {
  await window.agentActions['search-photos'].execute({...})
}
```

### API Integration Errors

**Problem**: Unhandled API failure (401, 429, 500)

**Detection**:
```typescript
// Error: SmugMug API returned 401 Unauthorized
fetch('https://api.smugmug.com/...')
```

**Fix**:
```typescript
// Add error handling
try {
  const response = await fetch(url)
  if (!response.ok) {
    if (response.status === 401) {
      // Handle unauthorized
      return { error: 'Please log in', status: 401 }
    }
    if (response.status === 429) {
      // Handle rate limit
      return { error: 'Rate limited, retry later', status: 429 }
    }
  }
  return await response.json()
} catch (error) {
  // Handle network errors
  return { error: 'Network error', details: error }
}
```

### Data Errors

**Problem**: Null/undefined property access

**Detection**:
```typescript
// Error: Cannot read property 'Uris' of undefined
const albumUri = photo.Uris.Album.Uri
```

**Fix**:
```typescript
// Use optional chaining
const albumUri = photo?.Uris?.Album?.Uri

// Or provide fallback
const albumUri = photo?.Uris?.Album?.Uri ?? '/default'

// Or type guard
if (photo && photo.Uris && photo.Uris.Album) {
  const albumUri = photo.Uris.Album.Uri
}
```

### Component Errors

**Problem**: Unhandled exception in component render

**Detection**:
```typescript
// Error: Cannot render component due to exception
function MyComponent({ data }) {
  return <div>{data.value}</div> // data might be undefined
}
```

**Fix**:
```typescript
// Wrap with error boundary
import { RuntimeErrorBoundary } from '@/testing/runtime-errors'

<RuntimeErrorBoundary
  fallback={<ErrorFallback />}
  onError={(error) => console.error('Component error:', error)}
>
  <MyComponent data={data} />
</RuntimeErrorBoundary>

// Or add defensive checks
function MyComponent({ data }) {
  if (!data) return <div>Loading...</div>
  return <div>{data.value}</div>
}
```

### Hook Errors

**Problem**: Missing dependencies in useEffect

**Detection**:
```typescript
// Warning: useEffect has missing dependency 'userId'
useEffect(() => {
  fetchUserData(userId)
}, []) // Missing userId dependency
```

**Fix**:
```typescript
// Add missing dependencies
useEffect(() => {
  fetchUserData(userId)
}, [userId]) // Include all dependencies

// Or use exhaustive-deps lint rule
// eslint-disable-next-line react-hooks/exhaustive-deps
```

## Troubleshooting

### Tests Failing Locally

```bash
# Clear test cache
rm -rf node_modules/.vitest

# Reinstall dependencies
pnpm install

# Run tests again
pnpm test -- src/testing/runtime-errors/__tests__/ --run
```

### E2E Tests Timing Out

```bash
# Increase timeout in playwright.config.ts
timeout: 60000, // 60 seconds

# Or run with extended timeout
pnpm test:runtime-errors --timeout=60000
```

### Pre-commit Hook Failing

```bash
# Run tests manually to see detailed output
pnpm test -- src/testing/runtime-errors/__tests__/ --run --reporter=verbose

# Skip pre-commit hook (NOT RECOMMENDED)
git commit --no-verify -m "Your message"
```

### CI/CD Workflow Failing

1. **Check GitHub Actions logs** for specific gate failure
2. **Download test artifacts** from workflow run
3. **Review HTML report** in artifacts
4. **Fix errors** based on category and severity
5. **Push fix** to trigger re-run

## Best Practices

### 1. Run Tests Before Committing

Always run unit tests before committing (or rely on pre-commit hook):

```bash
pnpm test -- src/testing/runtime-errors/__tests__/ --run
```

### 2. Review Error Reports

Check HTML reports after E2E tests to understand error patterns:

```bash
pnpm test:runtime-errors
pnpm test:runtime-errors:report
```

### 3. Fix Critical Errors Immediately

Critical errors (🔴) must be fixed before merging:
- Agent action registration failures
- Unhandled exceptions causing app crashes
- API authentication failures

### 4. Monitor Trends

Review error trends over time using JSON reports:
- Are specific components error-prone?
- Are certain error categories increasing?
- Is overall error count decreasing?

### 5. Add Tests for New Errors

When fixing a runtime error:
1. Add a test case to prevent regression
2. Document the fix pattern
3. Update ErrorClassifier if new error pattern

## Configuration

### Error Capture Options

Customize error capture in `src/testing/runtime-errors/ErrorCaptureManager.ts`:

```typescript
import { initializeErrorCapture } from '@/testing/runtime-errors'

initializeErrorCapture({
  captureAgentErrors: true,
  captureConsoleErrors: true,
  captureNetworkErrors: true,
  captureUnhandledRejections: true,
})
```

### Report Generation Options

Customize report output:

```bash
# Generate specific formats
node scripts/generate-error-report.js --format=html,json

# Custom output directory
node scripts/generate-error-report.js --output=custom/path
```

### Playwright Configuration

Modify E2E test settings in `playwright.config.ts`:

```typescript
export default defineConfig({
  timeout: 30000, // Test timeout
  use: {
    screenshot: 'only-on-failure', // Screenshot settings
    video: 'retain-on-failure', // Video recording
  },
})
```

## Support

For issues or questions:
- Check `src/testing/runtime-errors/README.md` for detailed documentation
- Review `.agent-os/testing/runtime-error-detection-spec.md` for technical spec
- Open GitHub issue for framework bugs
- Check test files in `src/testing/runtime-errors/__tests__/` for examples

## Maintenance Schedule

### Weekly
- Review error patterns from CI runs
- Update test scenarios for new features
- Check for flaky E2E tests

### Monthly
- Analyze error trends
- Update fix suggestions based on common resolutions
- Performance optimization of test suite

### Quarterly
- Update Playwright/Vitest versions
- Framework architecture review
- Add scenarios for new features

---

**Version**: 1.0
**Last Updated**: 2025-09-30
**Framework Location**: `src/testing/runtime-errors/`
**CI Workflow**: `.github/workflows/runtime-error-detection.yml`
