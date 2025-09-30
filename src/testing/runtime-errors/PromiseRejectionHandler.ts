/**
 * Unhandled Promise Rejection Handler
 *
 * Captures unhandled promise rejections from API calls, async operations,
 * and network requests (SmugMug API, Gemini AI service).
 */

import type { SmugMugAppError, ErrorCaptureHandler } from './types';

export class PromiseRejectionHandler implements ErrorCaptureHandler {
  private errors: SmugMugAppError[] = [];
  private initialized = false;
  private handler: ((event: PromiseRejectionEvent) => void) | null = null;

  initialize(): void {
    if (this.initialized) {
      return;
    }

    this.handler = (event: PromiseRejectionEvent) => {
      this.handleRejection(event);
    };

    window.addEventListener('unhandledrejection', this.handler);
    this.initialized = true;
  }

  cleanup(): void {
    if (this.handler) {
      window.removeEventListener('unhandledrejection', this.handler);
      this.handler = null;
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

  private handleRejection(event: PromiseRejectionEvent): void {
    const error = this.createStructuredError(event);
    this.errors.push(error);

    // Log in development
    if (import.meta.env.MODE === 'development') {
      console.error('[PromiseRejectionHandler]', error);
    }
  }

  private createStructuredError(
    event: PromiseRejectionEvent
  ): SmugMugAppError {
    const { reason } = event;

    // Extract error information
    const message =
      reason instanceof Error
        ? reason.message
        : typeof reason === 'string'
        ? reason
        : JSON.stringify(reason);

    const stack =
      reason instanceof Error ? reason.stack : new Error(message).stack;

    // Classify error based on message/reason
    const category = this.classifyRejection(reason);
    const severity = this.classifySeverity(reason);

    // Extract API context if available
    const apiContext = this.extractAPIContext(reason);

    return {
      errorId: this.generateErrorId(),
      message: `Unhandled Promise Rejection: ${message}`,
      stack,
      timestamp: Date.now(),
      category,
      severity,
      apiContext,
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

  private classifyRejection(
    reason: unknown
  ):
    | 'agent-native'
    | 'api-integration'
    | 'data-error'
    | 'component-error'
    | 'hook-error'
    | 'performance-error'
    | 'network-error' {
    const message =
      reason instanceof Error
        ? reason.message.toLowerCase()
        : String(reason).toLowerCase();

    // Network errors
    if (
      message.includes('fetch') ||
      message.includes('network') ||
      message.includes('timeout') ||
      message.includes('aborted')
    ) {
      return 'network-error';
    }

    // API integration errors
    if (
      message.includes('api') ||
      message.includes('smugmug') ||
      message.includes('gemini') ||
      message.includes('401') ||
      message.includes('403') ||
      message.includes('429') ||
      message.includes('500')
    ) {
      return 'api-integration';
    }

    // Agent-native errors
    if (message.includes('agent') || message.includes('action')) {
      return 'agent-native';
    }

    // Data errors
    if (
      message.includes('parse') ||
      message.includes('json') ||
      message.includes('invalid')
    ) {
      return 'data-error';
    }

    return 'component-error';
  }

  private classifySeverity(
    reason: unknown
  ): 'critical' | 'high' | 'medium' | 'low' {
    const message =
      reason instanceof Error
        ? reason.message.toLowerCase()
        : String(reason).toLowerCase();

    // Critical: Authentication/authorization failures
    if (message.includes('401') || message.includes('403')) {
      return 'critical';
    }

    // High: API failures, timeouts
    if (
      message.includes('timeout') ||
      message.includes('500') ||
      message.includes('429')
    ) {
      return 'high';
    }

    // Medium: Parse errors, data issues
    if (message.includes('parse') || message.includes('invalid')) {
      return 'medium';
    }

    return 'low';
  }

  private extractAPIContext(reason: unknown): {
    endpoint?: string;
    method?: string;
    statusCode?: number;
    responseBody?: unknown;
  } | undefined {
    // Check if reason contains fetch/API information
    if (
      reason &&
      typeof reason === 'object' &&
      'response' in reason &&
      reason.response &&
      typeof reason.response === 'object'
    ) {
      const response = reason.response as {
        url?: string;
        status?: number;
        statusText?: string;
        data?: unknown;
      };

      return {
        endpoint: response.url,
        statusCode: response.status,
        responseBody: response.data,
      };
    }

    // Check if it's a fetch error with URL in message
    const message =
      reason instanceof Error ? reason.message : String(reason);
    const urlMatch = message.match(/https?:\/\/[^\s]+/);

    if (urlMatch) {
      return {
        endpoint: urlMatch[0],
      };
    }

    return undefined;
  }

  private generateErrorId(): string {
    return `promise_err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Singleton instance
export const promiseRejectionHandler = new PromiseRejectionHandler();
