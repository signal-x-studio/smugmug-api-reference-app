/**
 * Runtime Error Detection Framework - Type Definitions
 *
 * Comprehensive type system for SmugMug API Reference App error detection
 */

import type { Photo } from '../../types';

// ============================================================================
// Core Error Types
// ============================================================================

export type ErrorCategory =
  | 'agent-native'
  | 'api-integration'
  | 'data-error'
  | 'component-error'
  | 'hook-error'
  | 'performance-error'
  | 'network-error';

export type Severity = 'critical' | 'high' | 'medium' | 'low';

export interface BrowserInfo {
  userAgent: string;
  platform: string;
  language: string;
  viewport: { width: number; height: number };
}

// ============================================================================
// SmugMug App-Specific Context
// ============================================================================

export interface AgentContext {
  registeredInterfaces: string[];
  registeredActions: string[];
  currentState: Record<string, any>;
  interfaceConfigs?: Record<string, any>;
  lastActionExecuted?: {
    actionId: string;
    timestamp: number;
    result: any;
  };
}

export interface PhotoContext {
  currentPhoto?: Photo;
  albumId?: string;
  filterState?: Record<string, any>;
  searchQuery?: string;
  selectedPhotoIds?: string[];
}

export interface APIContext {
  endpoint?: string;
  method?: string;
  statusCode?: number;
  responseBody?: any;
  requestDuration?: number;
  retryCount?: number;
}

// ============================================================================
// Error Object Structure
// ============================================================================

export interface SmugMugAppError {
  // Core error information
  errorId: string;
  message: string;
  stack?: string;
  timestamp: number;

  // Classification
  category: ErrorCategory;
  severity: Severity;

  // SmugMug-specific context
  agentContext?: AgentContext;
  photoContext?: PhotoContext;
  apiContext?: APIContext;

  // Component context
  componentStack?: string;
  componentName?: string;
  props?: Record<string, any>;
  state?: Record<string, any>;

  // User context
  userAction?: string;
  routePath?: string;
  browserInfo?: BrowserInfo;

  // Additional metadata
  recovered?: boolean;
  fixSuggestion?: string;
  relatedErrors?: string[]; // errorIds of related errors
}

// ============================================================================
// Error Detection Configuration
// ============================================================================

export interface RuntimeErrorTestConfig {
  // Test execution
  testTimeout: number;
  retryAttempts: number;
  parallelism: number;

  // Error capture
  captureConsoleErrors: boolean;
  captureNetworkErrors: boolean;
  captureUnhandledRejections: boolean;
  captureAgentErrors: boolean;

  // Scenarios to run
  scenarios: {
    agentNativeIntegration: boolean;
    contextProviders: boolean;
    nullSafety: boolean;
    smugmugApiIntegration: boolean;
    geminiAiIntegration: boolean;
    naturalLanguageParsing: boolean;
    hookDependencies: boolean;
    componentIntegration: boolean;
    e2eCriticalFlows: boolean;
  };

  // Output
  reporters: ('html' | 'json' | 'markdown')[];
  screenshotOnError: boolean;
  videoOnError: boolean;
  outputDir: string;

  // Thresholds
  maxCriticalErrors: number;
  maxHighErrors: number;
  maxMediumErrors: number;
  failOnNewErrors: boolean;

  // SmugMug-specific config
  smugmug: {
    mockApiResponses: boolean;
    testWithRealApi: boolean;
    rateLimitBuffer: number;
  };

  gemini: {
    mockResponses: boolean;
    testWithRealService: boolean;
    timeout: number;
  };

  agentNative: {
    validateSchemaOrg: boolean;
    validateActionRegistry: boolean;
    validateDualInterface: boolean;
  };
}

// ============================================================================
// Error Capture Handlers
// ============================================================================

export interface ErrorCaptureHandler {
  initialize: () => void;
  cleanup: () => void;
  getErrors: () => SmugMugAppError[];
  clearErrors: () => void;
}

export interface ErrorInterceptor {
  name: string;
  category: ErrorCategory;
  intercept: (error: Error, context?: any) => SmugMugAppError | null;
  shouldCapture: (error: Error) => boolean;
}

// ============================================================================
// Test Scenario Types
// ============================================================================

export interface TestScenario {
  name: string;
  category: ErrorCategory;
  severity: Severity;
  description: string;
  setup: () => Promise<void>;
  execute: () => Promise<void>;
  teardown: () => Promise<void>;
  expectedErrors?: number;
  expectedErrorPatterns?: RegExp[];
}

export interface ScenarioResult {
  scenarioName: string;
  passed: boolean;
  errors: SmugMugAppError[];
  duration: number;
  expectedErrors: number;
  actualErrors: number;
  unexpectedErrors: SmugMugAppError[];
}

// ============================================================================
// Reporting Types
// ============================================================================

export interface ErrorReportSummary {
  totalErrors: number;
  byCategory: Record<ErrorCategory, number>;
  bySeverity: Record<Severity, number>;
  passRate: number;
  newErrors: number;
  resolvedErrors: number;
}

export interface AgentNativeIssues {
  missingInterfaces: string[];
  missingActions: string[];
  schemaValidationErrors: SchemaValidationError[];
  dualInterfaceViolations: DualInterfaceViolation[];
}

export interface SchemaValidationError {
  componentName: string;
  schemaType: string;
  missingProperties: string[];
  invalidProperties: string[];
  message: string;
}

export interface DualInterfaceViolation {
  componentName: string;
  issue: 'missing-hook' | 'missing-wrapper' | 'invalid-config';
  details: string;
}

export interface APIErrorSummary {
  endpoint: string;
  method: string;
  errorCount: number;
  statusCodes: Record<number, number>;
  averageResponseTime: number;
  failureRate: number;
}

export interface ComponentErrorSummary {
  componentName: string;
  errorCount: number;
  nullSafetyViolations: number;
  hookIssues: number;
  renderErrors: number;
}

export interface FixSuggestion {
  errorId: string;
  category: ErrorCategory;
  title: string;
  description: string;
  codeExample?: string;
  files: string[];
  automaticFix?: boolean;
}

export interface TestCoverage {
  criticalFlowsCovered: number;
  criticalFlowsTotal: number;
  agentActionsCovered: number;
  agentActionsTotal: number;
  componentsCovered: number;
  componentsTotal: number;
  apiEndpointsCovered: number;
  apiEndpointsTotal: number;
}

export interface SmugMugErrorReport {
  summary: ErrorReportSummary;

  criticalErrors: SmugMugAppError[];
  highPriorityErrors: SmugMugAppError[];

  agentNativeIssues: AgentNativeIssues;

  apiIssues: {
    smugmugFailures: APIErrorSummary[];
    geminiFailures: APIErrorSummary[];
    networkTimeouts: SmugMugAppError[];
  };

  componentIssues: {
    byComponent: Record<string, ComponentErrorSummary>;
    nullSafetyViolations: SmugMugAppError[];
    hookDependencyIssues: SmugMugAppError[];
    cleanupMissing: SmugMugAppError[];
  };

  fixSuggestions: FixSuggestion[];
  testCoverage: TestCoverage;

  generatedAt: number;
  reportVersion: string;
}

// ============================================================================
// Reporter Interface
// ============================================================================

export interface ErrorReporter {
  name: string;
  generate: (report: SmugMugErrorReport) => Promise<string>;
  write: (content: string, outputPath: string) => Promise<void>;
}

// ============================================================================
// Utility Types
// ============================================================================

export interface ErrorFilter {
  category?: ErrorCategory | ErrorCategory[];
  severity?: Severity | Severity[];
  component?: string | string[];
  timeRange?: { start: number; end: number };
  includeRecovered?: boolean;
}

export interface ErrorStats {
  total: number;
  byCategory: Record<ErrorCategory, number>;
  bySeverity: Record<Severity, number>;
  topComponents: Array<{ component: string; count: number }>;
  errorRate: number; // errors per minute
}
