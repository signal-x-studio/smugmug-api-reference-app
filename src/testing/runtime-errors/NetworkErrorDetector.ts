/**
 * Network Request Failure Detector
 *
 * Monitors fetch/XHR failures and tracks SmugMug API and Gemini AI
 * service response errors.
 */

import type { SmugMugAppError, ErrorCaptureHandler, APIContext } from './types';

export class NetworkErrorDetector implements ErrorCaptureHandler {
  private errors: SmugMugAppError[] = [];
  private initialized = false;
  private originalFetch?: typeof fetch;

  initialize(): void {
    if (this.initialized) {
      return;
    }

    this.interceptFetch();
    this.initialized = true;
  }

  cleanup(): void {
    // Restore original fetch
    if (this.originalFetch) {
      window.fetch = this.originalFetch;
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

  private interceptFetch(): void {
    this.originalFetch = window.fetch;

    window.fetch = async (
      input: RequestInfo | URL,
      init?: RequestInit
    ): Promise<Response> => {
      const startTime = Date.now();
      const url = typeof input === 'string' ? input : input.toString();
      const method = init?.method || 'GET';

      try {
        const response = await this.originalFetch!(input, init);

        // Check for error status codes
        if (!response.ok) {
          await this.captureResponseError(response, url, method, startTime);
        }

        return response;
      } catch (error) {
        // Network failure (no response)
        this.captureNetworkError(error, url, method, startTime);
        throw error;
      }
    };
  }

  private async captureResponseError(
    response: Response,
    url: string,
    method: string,
    startTime: number
  ): Promise<void> {
    const duration = Date.now() - startTime;
    let responseBody: unknown;

    try {
      // Try to parse response body
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        responseBody = await response.clone().json();
      } else {
        responseBody = await response.clone().text();
      }
    } catch {
      responseBody = null;
    }

    const apiContext: APIContext = {
      endpoint: url,
      method,
      statusCode: response.status,
      responseBody,
      requestDuration: duration,
    };

    const error: SmugMugAppError = {
      errorId: this.generateErrorId(),
      message: `HTTP ${response.status} ${response.statusText} - ${method} ${url}`,
      timestamp: Date.now(),
      category: this.classifyAPIError(url, response.status),
      severity: this.classifyStatusCodeSeverity(response.status),
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
      fixSuggestion: this.suggestFix(url, response.status),
    };

    this.errors.push(error);

    // Log in development
    if (import.meta.env.MODE === 'development') {
      console.error('[NetworkErrorDetector] API Error:', error);
    }
  }

  private captureNetworkError(
    error: unknown,
    url: string,
    method: string,
    startTime: number
  ): void {
    const duration = Date.now() - startTime;
    const message =
      error instanceof Error ? error.message : String(error);

    const apiContext: APIContext = {
      endpoint: url,
      method,
      requestDuration: duration,
    };

    const structuredError: SmugMugAppError = {
      errorId: this.generateErrorId(),
      message: `Network Error: ${message} - ${method} ${url}`,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: Date.now(),
      category: 'network-error',
      severity: 'high',
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
      fixSuggestion: this.suggestNetworkFix(message),
    };

    this.errors.push(structuredError);

    // Log in development
    if (import.meta.env.MODE === 'development') {
      console.error('[NetworkErrorDetector] Network Error:', structuredError);
    }
  }

  private classifyAPIError(
    url: string,
    statusCode: number
  ): 'api-integration' | 'network-error' {
    // SmugMug API errors
    if (url.includes('smugmug.com') || url.includes('/api/v2/')) {
      return 'api-integration';
    }

    // Gemini AI errors
    if (url.includes('generativelanguage.googleapis.com')) {
      return 'api-integration';
    }

    // Network-level errors
    if (statusCode >= 500) {
      return 'network-error';
    }

    return 'api-integration';
  }

  private classifyStatusCodeSeverity(
    statusCode: number
  ): 'critical' | 'high' | 'medium' | 'low' {
    // Authentication failures
    if (statusCode === 401 || statusCode === 403) {
      return 'critical';
    }

    // Server errors, rate limits
    if (statusCode >= 500 || statusCode === 429) {
      return 'high';
    }

    // Client errors
    if (statusCode >= 400 && statusCode < 500) {
      return 'medium';
    }

    return 'low';
  }

  private suggestFix(url: string, statusCode: number): string {
    // SmugMug API specific suggestions
    if (url.includes('smugmug.com')) {
      if (statusCode === 401) {
        return 'SmugMug API authentication failed. Check OAuth credentials and token validity.';
      }
      if (statusCode === 429) {
        return 'SmugMug API rate limit exceeded. Implement request throttling and retry with exponential backoff.';
      }
      if (statusCode === 404) {
        return 'SmugMug API endpoint not found. Verify API version and endpoint path.';
      }
    }

    // Gemini AI specific suggestions
    if (url.includes('generativelanguage.googleapis.com')) {
      if (statusCode === 401) {
        return 'Gemini API key invalid or missing. Check VITE_GEMINI_API_KEY environment variable.';
      }
      if (statusCode === 429) {
        return 'Gemini API quota exceeded. Check quota limits in Google Cloud Console.';
      }
      if (statusCode === 400) {
        return 'Invalid Gemini API request. Check request payload and parameters.';
      }
    }

    // Generic suggestions
    if (statusCode === 401) {
      return 'Authentication required. Check credentials and authentication flow.';
    }
    if (statusCode === 403) {
      return 'Access forbidden. Verify permissions and authorization.';
    }
    if (statusCode === 429) {
      return 'Rate limit exceeded. Implement request throttling.';
    }
    if (statusCode >= 500) {
      return 'Server error. Implement retry logic with exponential backoff.';
    }

    return `HTTP ${statusCode} error. Check request and API documentation.`;
  }

  private suggestNetworkFix(message: string): string {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('timeout')) {
      return 'Request timeout. Increase timeout value or optimize request payload size.';
    }

    if (lowerMessage.includes('aborted')) {
      return 'Request aborted. Check if component unmounted during fetch or user cancelled operation.';
    }

    if (lowerMessage.includes('network')) {
      return 'Network connection failed. Check internet connectivity and CORS configuration.';
    }

    return 'Network error occurred. Check connection and retry request.';
  }

  private generateErrorId(): string {
    return `net_err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Singleton instance
export const networkErrorDetector = new NetworkErrorDetector();
