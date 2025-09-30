/**
 * Console Error Interceptor
 *
 * Captures console.error and console.warn calls while preserving
 * original console functionality. Filters React DevTools warnings.
 */

import type { SmugMugAppError, ErrorCaptureHandler } from './types';

type ConsoleMethod = 'error' | 'warn';

export class ConsoleInterceptor implements ErrorCaptureHandler {
  private errors: SmugMugAppError[] = [];
  private initialized = false;
  private originalConsole: {
    error?: typeof console.error;
    warn?: typeof console.warn;
  } = {};

  // Patterns to ignore (React DevTools, common non-issues)
  private ignorePatterns = [
    /^Download the React DevTools/i,
    /^React DevTools/i,
    /^Warning: ReactDOM.render/i,
    /^Warning: useLayoutEffect/i, // SSR warnings
  ];

  initialize(): void {
    if (this.initialized) {
      return;
    }

    this.interceptConsole('error');
    this.interceptConsole('warn');
    this.initialized = true;
  }

  cleanup(): void {
    // Restore original console methods
    if (this.originalConsole.error) {
      console.error = this.originalConsole.error;
    }
    if (this.originalConsole.warn) {
      console.warn = this.originalConsole.warn;
    }

    this.errors = [];
    this.initialized = false;
  }

  getErrors(): SmugMugAppError[] {
    return [...this.errors];
  }

  clearErrors(): void {
    this.errors = [];
  }

  private interceptConsole(method: ConsoleMethod): void {
    // Store original method
    this.originalConsole[method] = console[method];

    // Replace with interceptor
    console[method] = (...args: unknown[]) => {
      // Call original console method first
      this.originalConsole[method]?.(...args);

      // Convert arguments to string for pattern matching
      const message = args
        .map((arg) =>
          typeof arg === 'string'
            ? arg
            : arg instanceof Error
            ? arg.message
            : JSON.stringify(arg)
        )
        .join(' ');

      // Check if should be ignored
      if (this.shouldIgnore(message)) {
        return;
      }

      // Capture as structured error
      const error = this.createStructuredError(message, method, args);
      this.errors.push(error);
    };
  }

  private shouldIgnore(message: string): boolean {
    return this.ignorePatterns.some((pattern) => pattern.test(message));
  }

  private createStructuredError(
    message: string,
    method: ConsoleMethod,
    args: unknown[]
  ): SmugMugAppError {
    // Extract Error object if present
    const errorArg = args.find((arg) => arg instanceof Error) as
      | Error
      | undefined;

    // Classify the error
    const category = this.classifyError(message);
    const severity = method === 'error' ? 'high' : 'medium';

    return {
      errorId: this.generateErrorId(),
      message,
      stack: errorArg?.stack || new Error().stack,
      timestamp: Date.now(),
      category,
      severity,
      browserInfo: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
      },
      routePath: window.location.pathname,
    };
  }

  private classifyError(
    message: string
  ):
    | 'agent-native'
    | 'api-integration'
    | 'data-error'
    | 'component-error'
    | 'hook-error'
    | 'performance-error'
    | 'network-error' {
    const lowerMessage = message.toLowerCase();

    // Agent-native errors
    if (
      lowerMessage.includes('agent') ||
      lowerMessage.includes('interface') ||
      lowerMessage.includes('schema.org')
    ) {
      return 'agent-native';
    }

    // API/Network errors
    if (
      lowerMessage.includes('fetch') ||
      lowerMessage.includes('api') ||
      lowerMessage.includes('network') ||
      lowerMessage.includes('smugmug') ||
      lowerMessage.includes('gemini')
    ) {
      return 'api-integration';
    }

    // Hook errors
    if (
      lowerMessage.includes('hook') ||
      lowerMessage.includes('useeffect') ||
      lowerMessage.includes('usememo') ||
      lowerMessage.includes('usecallback')
    ) {
      return 'hook-error';
    }

    // Data errors
    if (
      lowerMessage.includes('null') ||
      lowerMessage.includes('undefined') ||
      lowerMessage.includes('cannot read') ||
      lowerMessage.includes('cannot access')
    ) {
      return 'data-error';
    }

    // Performance errors
    if (
      lowerMessage.includes('memory') ||
      lowerMessage.includes('leak') ||
      lowerMessage.includes('performance')
    ) {
      return 'performance-error';
    }

    // Default to component error
    return 'component-error';
  }

  private generateErrorId(): string {
    return `console_err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Singleton instance
export const consoleInterceptor = new ConsoleInterceptor();
