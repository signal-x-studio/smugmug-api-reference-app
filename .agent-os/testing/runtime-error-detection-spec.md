---
description: Automated Runtime Error Detection Framework for SmugMug API Reference App
version: 1.0
date: 2025-09-30
tech_stack: React 19, TypeScript, Vitest, Playwright, Vite
status: Specification
---

# Runtime Error Detection Framework - SmugMug API Reference App

## Purpose

Autonomously detect, categorize, and report runtime JavaScript errors in the SmugMug API Reference App with focus on:
- **Agent-native integration errors** - Missing agent interfaces, action registration failures
- **Context provider missing errors** - Agent state, dual-interface contexts
- **Null/undefined property access** - Photo data, API responses, agent state
- **React lifecycle errors** - Hook dependencies, cleanup functions
- **SmugMug API integration failures** - Network errors, response parsing
- **Gemini AI service errors** - Analysis failures, timeout issues
- **Agent action execution errors** - Parameter validation, execution failures

## Application-Specific Context

### Key Architecture Patterns

**Agent-Native Dual-Interface:**
- Components expose both human UI and agent API
- Requires useDualInterface hook + AgentWrapper
- Global state via window.agentInterfaces and window.agentActions
- Schema.org structured data markup

**Critical Error Scenarios:**
1. Component uses useDualInterface without AgentWrapper
2. Agent action executed before registration
3. Schema.org markup missing required properties
4. Natural language parser receives malformed query
5. Photo data missing expected metadata fields
6. SmugMug API returns unexpected response format
7. Gemini AI analysis timeout/failure
8. Agent state synchronization failures

### Tech Stack Integration

**Frontend:**
- React 19 (latest features, concurrent rendering)
- TypeScript 5.8 (strict mode, no 'any' types)
- Vite 5.4 (build tool, HMR)
- Tailwind CSS (styling)

**Testing:**
- Vitest 3.2 (unit tests, existing)
- Playwright (E2E tests, to add)
- @testing-library/react (component tests)
- happy-dom (DOM simulation)

**Agent Services:**
- Google Generative AI (Gemini)
- Fuse.js (fuzzy search)
- date-fns (date parsing)

---

## Framework Architecture

### Layer 1: Error Capture Engine

**Purpose:** Intercept all runtime errors specific to SmugMug app architecture

**Components:**

1. **Global Error Boundary Wrapper** (`src/testing/runtime-errors/ErrorBoundary.tsx`)
   - Wraps entire app in development/test mode
   - Captures React component errors
   - Preserves component tree context
   - Logs agent interface state at error time

2. **Agent-Native Error Interceptor** (`src/testing/runtime-errors/AgentErrorInterceptor.ts`)
   - Monitors window.agentInterfaces registry
   - Detects missing agent actions
   - Validates useDualInterface usage
   - Checks Schema.org markup integrity

3. **Console Error Interceptor** (`src/testing/runtime-errors/ConsoleInterceptor.ts`)
   - Captures console.error, console.warn
   - Filters React DevTools warnings
   - Preserves original console functionality

4. **Unhandled Promise Rejection Handler** (`src/testing/runtime-errors/PromiseRejectionHandler.ts`)
   - Captures API call failures (SmugMug, Gemini)
   - Detects timeout scenarios
   - Logs network request context

5. **Network Request Failure Detector** (`src/testing/runtime-errors/NetworkErrorDetector.ts`)
   - Monitors fetch/XHR failures
   - Tracks SmugMug API response errors
   - Detects Gemini AI service issues

**Output:** Structured error objects with full SmugMug app context

```typescript
interface SmugMugAppError {
  // Standard error info
  message: string;
  stack: string;
  timestamp: number;
  errorId: string;

  // SmugMug-specific context
  agentContext?: {
    registeredInterfaces: string[];
    registeredActions: string[];
    currentState: Record<string, any>;
  };

  photoContext?: {
    currentPhoto?: Photo;
    albumId?: string;
    filterState?: any;
  };

  apiContext?: {
    endpoint?: string;
    method?: string;
    statusCode?: number;
    responseBody?: any;
  };

  // Component context
  componentStack?: string;
  componentName?: string;
  props?: Record<string, any>;
  state?: Record<string, any>;

  // User context
  userAction?: string;
  routePath?: string;
  browserInfo?: BrowserInfo;
}
```

---

### Layer 2: Error Classification System

**Purpose:** Categorize errors by SmugMug app patterns

**Error Categories:**

1. **Agent-Native Errors** (Critical)
   - Missing useDualInterface hook
   - AgentWrapper not wrapping component
   - Agent action registration failure
   - Schema.org markup validation failure
   - Agent state synchronization failure

2. **API Integration Errors** (High)
   - SmugMug API authentication failure
   - SmugMug API rate limit exceeded
   - SmugMug API malformed response
   - Gemini AI service timeout
   - Gemini AI quota exceeded
   - Gemini AI response parsing failure

3. **Data Errors** (High)
   - Photo metadata missing required fields
   - Album data structure mismatch
   - Filter state corruption
   - Search results empty/malformed
   - Natural language query parsing failure

4. **Component Errors** (Medium)
   - PhotoCard receives null photo
   - ImageGrid receives empty array
   - FilterPanel missing filter state
   - SearchInterface parser initialization failure
   - QueryBuilder condition validation error

5. **Hook Errors** (Medium)
   - useAgentIntegration missing dependencies
   - useFilterState stale closure
   - useBulkOperationState cleanup missing
   - useDualInterface configuration invalid

6. **Performance Errors** (Low)
   - Memory leak in agent state registry
   - Infinite render loop in filter components
   - Excessive re-renders in photo grid
   - Large bundle size threshold exceeded

**Severity Matrix:**

| Error Category | User Impact | System Impact | Severity |
|----------------|-------------|---------------|----------|
| Agent action fails to execute | Feature broken | Agent-native broken | Critical |
| SmugMug API auth fails | Cannot load photos | Complete failure | Critical |
| Photo metadata missing | Display degraded | Partial failure | High |
| Filter state invalid | Filters broken | Feature failure | High |
| Hook dependency warning | Potential bug | Development issue | Medium |
| Memory leak detected | Slow over time | Performance issue | Low |

---

### Layer 3: Automated Testing Scenarios

**Purpose:** Test SmugMug-specific failure modes

**Test Scenarios:**

#### 1. Agent-Native Integration Tests

**Scenario 1.1: Missing Agent Interface**
```typescript
describe('Agent-Native Error Detection', () => {
  it('detects component using useDualInterface without AgentWrapper', async () => {
    // Render SearchInterface without AgentWrapper
    const { errors } = await renderWithErrorCapture(
      <SearchInterface onSearch={mockSearch} />
    );

    expect(errors).toContainError({
      category: 'agent-native',
      message: /AgentWrapper.*missing/i,
      severity: 'critical'
    });
  });

  it('detects agent action executed before registration', async () => {
    const { errors } = await executeAgentAction('search-photos', { query: 'test' });

    expect(errors).toContainError({
      category: 'agent-native',
      message: /action.*not registered/i,
      component: 'AgentActionRegistry'
    });
  });
});
```

**Scenario 1.2: Schema.org Markup Validation**
```typescript
it('detects missing required Schema.org properties', async () => {
  const { errors } = await validateSchemaMarkup(
    <SearchInterface onSearch={mockSearch} />
  );

  expect(errors).toContainError({
    category: 'agent-native',
    message: /Schema\.org.*missing.*itemProp/i,
    schemaType: 'SearchAction'
  });
});
```

#### 2. SmugMug API Integration Tests

**Scenario 2.1: API Response Errors**
```typescript
describe('SmugMug API Error Detection', () => {
  it('detects authentication failures', async () => {
    mockSmugMugAPI.mockAuthFailure();

    const { errors } = await loadPhotos();

    expect(errors).toContainError({
      category: 'api-integration',
      apiEndpoint: '/api/v2/user/photos',
      statusCode: 401,
      severity: 'critical'
    });
  });

  it('detects malformed photo response', async () => {
    mockSmugMugAPI.mockMalformedResponse({
      photos: null // Should be array
    });

    const { errors } = await loadPhotos();

    expect(errors).toContainError({
      category: 'data-error',
      message: /expected array.*received null/i
    });
  });
});
```

#### 3. Gemini AI Service Tests

**Scenario 3.1: AI Analysis Failures**
```typescript
describe('Gemini AI Error Detection', () => {
  it('detects service timeout', async () => {
    mockGemini.mockTimeout(30000);

    const { errors } = await analyzePhoto(photoData);

    expect(errors).toContainError({
      category: 'api-integration',
      service: 'gemini',
      errorType: 'timeout',
      severity: 'high'
    });
  });

  it('detects quota exceeded', async () => {
    mockGemini.mockQuotaExceeded();

    const { errors } = await analyzePhoto(photoData);

    expect(errors).toContainError({
      category: 'api-integration',
      service: 'gemini',
      statusCode: 429
    });
  });
});
```

#### 4. Photo Data Null Safety Tests

**Scenario 4.1: Missing Photo Metadata**
```typescript
describe('Photo Data Error Detection', () => {
  it('detects PhotoCard with null photo', async () => {
    const { errors } = await renderWithErrorCapture(
      <PhotoCard photo={null} onSelect={jest.fn()} />
    );

    expect(errors).toContainError({
      category: 'component-error',
      component: 'PhotoCard',
      message: /cannot read.*null/i
    });
  });

  it('detects missing photo metadata fields', async () => {
    const incompletePhoto = { id: '123' }; // Missing title, url, etc.

    const { errors } = await renderWithErrorCapture(
      <PhotoCard photo={incompletePhoto} onSelect={jest.fn()} />
    );

    expect(errors).toContainError({
      category: 'data-error',
      missingFields: ['title', 'imageUrl', 'thumbnailUrl']
    });
  });
});
```

#### 5. Filter & Search Integration Tests

**Scenario 5.1: Natural Language Parser Errors**
```typescript
describe('Natural Language Parser Error Detection', () => {
  it('detects invalid query format', async () => {
    const { errors } = await parseQuery('invalid @#$% query !@#');

    expect(errors).toContainError({
      category: 'data-error',
      parser: 'PhotoDiscoveryQueryParser',
      confidence: 0
    });
  });

  it('detects ambiguous query', async () => {
    const { errors, warnings } = await parseQuery('photos');

    expect(warnings).toContain({
      message: /query too vague/i,
      suggestions: expect.arrayContaining(['Add location', 'Add date'])
    });
  });
});
```

#### 6. Hook Dependency Tests

**Scenario 6.1: Missing Dependencies**
```typescript
describe('Hook Error Detection', () => {
  it('detects missing useEffect dependencies', async () => {
    const { errors } = await lintComponent('SearchInterface.tsx');

    expect(errors).toContainError({
      category: 'hook-error',
      hook: 'useEffect',
      rule: 'react-hooks/exhaustive-deps',
      missingDeps: ['queryParser']
    });
  });

  it('detects cleanup function missing', async () => {
    const { errors } = await validateCleanup('QueryBuilder.tsx');

    expect(errors).toContainError({
      category: 'hook-error',
      hook: 'useEffect',
      issue: 'missing cleanup for event listeners'
    });
  });
});
```

---

### Layer 4: E2E Test Runner (Playwright)

**Purpose:** Execute browser-based runtime error tests

**Test Suites:**

#### 1. Critical User Flows

```typescript
// e2e/runtime-errors/photo-discovery.spec.ts
describe('Photo Discovery Flow - Runtime Errors', () => {
  test('detects errors during photo search', async ({ page }) => {
    const errors = [];

    // Capture console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Capture uncaught exceptions
    page.on('pageerror', error => {
      errors.push({
        message: error.message,
        stack: error.stack
      });
    });

    await page.goto('/');
    await page.fill('[data-testid="search-input"]', 'sunset photos');
    await page.press('[data-testid="search-input"]', 'Enter');

    await page.waitForTimeout(2000);

    expect(errors).toHaveLength(0);
  });

  test('detects errors during filter operations', async ({ page }) => {
    const errors = await captureErrors(page, async () => {
      await page.goto('/');
      await page.click('[data-testid="add-filter"]');
      await page.selectOption('[data-testid="filter-field"]', 'location');
      await page.fill('[data-testid="filter-value"]', 'Paris');
      await page.click('[data-testid="apply-filter"]');
    });

    expect(errors).toHaveLength(0);
  });
});
```

#### 2. Agent Action Execution

```typescript
// e2e/runtime-errors/agent-actions.spec.ts
describe('Agent Action Execution - Runtime Errors', () => {
  test('detects errors when executing search-photos action', async ({ page }) => {
    await page.goto('/');

    const result = await page.evaluate(async () => {
      try {
        const action = window.agentActions['search-photos'];
        if (!action) {
          return { error: 'Action not registered' };
        }

        const result = await action.execute({ query: 'beach photos' });
        return result;
      } catch (error) {
        return { error: error.message, stack: error.stack };
      }
    });

    expect(result.error).toBeUndefined();
    expect(result.success).toBe(true);
  });
});
```

#### 3. API Integration Resilience

```typescript
// e2e/runtime-errors/api-resilience.spec.ts
describe('API Integration Resilience - Runtime Errors', () => {
  test('handles SmugMug API failure gracefully', async ({ page }) => {
    // Intercept and fail API request
    await page.route('**/api/v2/**', route => {
      route.abort('failed');
    });

    const errors = await captureErrors(page, async () => {
      await page.goto('/');
      await page.waitForTimeout(3000);
    });

    // Should show error UI, not crash
    const errorMessage = await page.textContent('[data-testid="error-message"]');
    expect(errorMessage).toContain('Unable to load photos');

    // Should not have uncaught errors
    const uncaughtErrors = errors.filter(e => e.type === 'uncaught');
    expect(uncaughtErrors).toHaveLength(0);
  });
});
```

---

### Layer 5: Reporting & Analysis

**Purpose:** Generate actionable SmugMug-specific error reports

**Report Format:**

```typescript
interface SmugMugErrorReport {
  summary: {
    totalErrors: number;
    byCategory: Record<ErrorCategory, number>;
    bySeverity: Record<Severity, number>;
    passRate: number;
    newErrors: number; // Regression detection
  };

  criticalErrors: SmugMugAppError[];
  highPriorityErrors: SmugMugAppError[];

  agentNativeIssues: {
    missingInterfaces: string[];
    missingActions: string[];
    schemaValidationErrors: SchemaError[];
  };

  apiIssues: {
    smugmugFailures: APIError[];
    geminiFailures: APIError[];
    networkTimeouts: APIError[];
  };

  componentIssues: {
    nullSafetyViolations: ComponentError[];
    hookDependencyIssues: HookError[];
    cleanupMissing: ComponentError[];
  };

  fixSuggestions: FixSuggestion[];

  testCoverage: {
    criticalFlowsCovered: number;
    agentActionsCovered: number;
    componentsCovered: number;
  };
}
```

**HTML Report Generator** (`src/testing/runtime-errors/reporters/HTMLReporter.ts`)
- Visual dashboard with charts
- Filterable error list
- Component error heat map
- Agent-native compliance score
- API reliability metrics

**JSON Reporter** (`src/testing/runtime-errors/reporters/JSONReporter.ts`)
- Machine-readable for CI/CD
- Historical comparison data
- Trend analysis

**Markdown Reporter** (`src/testing/runtime-errors/reporters/MarkdownReporter.ts`)
- GitHub-friendly format
- Automatic PR comment generation
- Fix suggestion links to code

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/runtime-error-detection.yml
name: Runtime Error Detection

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]
  schedule:
    - cron: '0 0 * * *' # Daily at midnight

jobs:
  runtime-error-tests:
    runs-on: ubuntu-latest
    timeout-minutes: 30

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium

      - name: Run runtime error detection
        run: npm run test:runtime-errors -- --ci
        env:
          CI: true
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: runtime-error-report
          path: test-results/runtime-errors/
          retention-days: 30

      - name: Comment PR with results
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const report = fs.readFileSync('test-results/runtime-errors/summary.md', 'utf8');

            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `## Runtime Error Detection Report\n\n${report}`
            });

      - name: Fail if critical errors found
        if: always()
        run: |
          CRITICAL_ERRORS=$(cat test-results/runtime-errors/summary.json | jq '.summary.bySeverity.critical')
          if [ "$CRITICAL_ERRORS" -gt 0 ]; then
            echo "❌ Found $CRITICAL_ERRORS critical errors"
            exit 1
          fi
```

### Pre-commit Hook

```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo "🔍 Running runtime error detection (quick scan)..."
npm run test:runtime-errors:quick

if [ $? -ne 0 ]; then
  echo "❌ Runtime error tests failed. Fix errors before committing."
  exit 1
fi
```

---

## Configuration

### Runtime Error Test Config

```typescript
// runtime-error-detection.config.ts
import { defineConfig } from './src/testing/runtime-errors/config';

export default defineConfig({
  // Test execution
  testTimeout: 30000,
  retryAttempts: 2,
  parallelism: 4,

  // Error capture
  captureConsoleErrors: true,
  captureNetworkErrors: true,
  captureUnhandledRejections: true,
  captureAgentErrors: true, // SmugMug-specific

  // Scenarios to run
  scenarios: {
    agentNativeIntegration: true, // SmugMug-specific
    contextProviders: true,
    nullSafety: true,
    smugmugApiIntegration: true, // SmugMug-specific
    geminiAiIntegration: true, // SmugMug-specific
    naturalLanguageParsing: true, // SmugMug-specific
    hookDependencies: true,
    componentIntegration: true,
    e2eCriticalFlows: true
  },

  // Output
  reporters: ['html', 'json', 'markdown'],
  screenshotOnError: true,
  videoOnError: process.env.CI === 'true',
  outputDir: 'test-results/runtime-errors',

  // Thresholds
  maxCriticalErrors: 0,
  maxHighErrors: 0,
  maxMediumErrors: 5,
  failOnNewErrors: true,

  // SmugMug-specific config
  smugmug: {
    mockApiResponses: true,
    testWithRealApi: false,
    rateLimitBuffer: 1000 // ms between requests
  },

  gemini: {
    mockResponses: true,
    testWithRealService: false,
    timeout: 10000
  },

  agentNative: {
    validateSchemaOrg: true,
    validateActionRegistry: true,
    validateDualInterface: true
  }
});
```

---

## NPM Scripts

```json
{
  "scripts": {
    "test:runtime-errors": "node scripts/runtime-error-detection.js",
    "test:runtime-errors:quick": "node scripts/runtime-error-detection.js --quick",
    "test:runtime-errors:ci": "node scripts/runtime-error-detection.js --ci --reporters=json,markdown",
    "test:runtime-errors:watch": "node scripts/runtime-error-detection.js --watch",
    "test:runtime-errors:debug": "node scripts/runtime-error-detection.js --debug --headed",
    "test:runtime-errors:agent": "node scripts/runtime-error-detection.js --scenario=agentNativeIntegration",
    "test:runtime-errors:api": "node scripts/runtime-error-detection.js --scenario=smugmugApiIntegration,geminiAiIntegration"
  }
}
```

---

## Success Metrics

### Detection Rate
- **Target:** 98% of runtime errors caught before production
- **Measure:** Errors in tests vs errors in production
- **SmugMug-specific:** 100% agent-native errors caught

### False Positive Rate
- **Target:** < 2% false positives
- **Measure:** Flagged errors that are not real issues

### Coverage
- **Target:** 100% of critical flows tested
- **Flows:**
  - Photo search and display
  - Filter operations
  - Agent action execution
  - Natural language queries
  - SmugMug API integration
  - Gemini AI analysis

### Performance
- **Test Suite Duration:** < 5 minutes (unit + integration)
- **E2E Suite Duration:** < 10 minutes
- **CI/CD Impact:** < 15 minutes total

---

## Maintenance Schedule

### Weekly
- Review new error patterns from production
- Update test scenarios for new agent actions
- Check for flaky E2E tests
- Update SmugMug API mock responses

### Monthly
- Analyze error trends
- Update fix suggestions based on resolutions
- Performance optimization of test suite
- Review Gemini AI integration patterns

### Quarterly
- Update Playwright/Vitest versions
- Framework architecture review
- Add scenarios for new Phase 2.x features
- Update Schema.org validation rules

---

## Version History

**v1.0** - 2025-09-30
- Initial specification
- SmugMug app-specific scenarios
- Agent-native error detection
- API integration testing
- CI/CD workflow integration
