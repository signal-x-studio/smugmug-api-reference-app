/**
 * Error Capture Manager
 *
 * Coordinates all error capture handlers and provides unified interface
 * for initializing, collecting, and managing runtime errors.
 */

import type { SmugMugAppError, ErrorCaptureHandler, ErrorFilter } from './types';
import { agentErrorInterceptor } from './AgentErrorInterceptor';
import { consoleInterceptor } from './ConsoleInterceptor';
import { promiseRejectionHandler } from './PromiseRejectionHandler';
import { networkErrorDetector } from './NetworkErrorDetector';

export class ErrorCaptureManager {
  private handlers: ErrorCaptureHandler[] = [];
  private initialized = false;

  constructor() {
    // Register all error handlers
    this.handlers = [
      agentErrorInterceptor,
      consoleInterceptor,
      promiseRejectionHandler,
      networkErrorDetector,
    ];
  }

  /**
   * Initialize all error capture handlers
   */
  initialize(): void {
    if (this.initialized) {
      console.warn('[ErrorCaptureManager] Already initialized');
      return;
    }

    this.handlers.forEach((handler) => {
      try {
        handler.initialize();
      } catch (error) {
        console.error('[ErrorCaptureManager] Failed to initialize handler:', error);
      }
    });

    this.initialized = true;

    if (import.meta.env.MODE === 'development') {
      console.log('[ErrorCaptureManager] Initialized with', this.handlers.length, 'handlers');
    }
  }

  /**
   * Cleanup all error capture handlers
   */
  cleanup(): void {
    this.handlers.forEach((handler) => {
      try {
        handler.cleanup();
      } catch (error) {
        console.error('[ErrorCaptureManager] Failed to cleanup handler:', error);
      }
    });

    this.initialized = false;
  }

  /**
   * Get all captured errors from all handlers
   */
  getAllErrors(): SmugMugAppError[] {
    const allErrors: SmugMugAppError[] = [];

    this.handlers.forEach((handler) => {
      try {
        const errors = handler.getErrors();
        allErrors.push(...errors);
      } catch (error) {
        console.error('[ErrorCaptureManager] Failed to get errors from handler:', error);
      }
    });

    // Sort by timestamp (newest first)
    return allErrors.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Get filtered errors
   */
  getFilteredErrors(filter: ErrorFilter): SmugMugAppError[] {
    const allErrors = this.getAllErrors();

    return allErrors.filter((error) => {
      // Filter by category
      if (filter.category) {
        const categories = Array.isArray(filter.category)
          ? filter.category
          : [filter.category];
        if (!categories.includes(error.category)) {
          return false;
        }
      }

      // Filter by severity
      if (filter.severity) {
        const severities = Array.isArray(filter.severity)
          ? filter.severity
          : [filter.severity];
        if (!severities.includes(error.severity)) {
          return false;
        }
      }

      // Filter by component
      if (filter.component && error.componentName) {
        const components = Array.isArray(filter.component)
          ? filter.component
          : [filter.component];
        if (!components.includes(error.componentName)) {
          return false;
        }
      }

      // Filter by time range
      if (filter.timeRange) {
        const { start, end } = filter.timeRange;
        if (error.timestamp < start || error.timestamp > end) {
          return false;
        }
      }

      // Filter by recovered status
      if (filter.includeRecovered === false && error.recovered === true) {
        return false;
      }

      return true;
    });
  }

  /**
   * Get error statistics
   */
  getStats() {
    const allErrors = this.getAllErrors();

    const byCategory = allErrors.reduce((acc, error) => {
      acc[error.category] = (acc[error.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const bySeverity = allErrors.reduce((acc, error) => {
      acc[error.severity] = (acc[error.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Group by component
    const componentCounts = allErrors
      .filter((error) => error.componentName)
      .reduce((acc, error) => {
        const component = error.componentName!;
        acc[component] = (acc[component] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const topComponents = Object.entries(componentCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([component, count]) => ({ component, count }));

    // Calculate error rate (errors per minute)
    const timeSpan = allErrors.length > 0
      ? (Date.now() - allErrors[allErrors.length - 1].timestamp) / 60000
      : 0;
    const errorRate = timeSpan > 0 ? allErrors.length / timeSpan : 0;

    return {
      total: allErrors.length,
      byCategory,
      bySeverity,
      topComponents,
      errorRate: Math.round(errorRate * 100) / 100,
    };
  }

  /**
   * Clear all errors from all handlers
   */
  clearAllErrors(): void {
    this.handlers.forEach((handler) => {
      try {
        handler.clearErrors();
      } catch (error) {
        console.error('[ErrorCaptureManager] Failed to clear errors from handler:', error);
      }
    });
  }

  /**
   * Get errors grouped by category
   */
  getErrorsByCategory() {
    const allErrors = this.getAllErrors();

    return {
      'agent-native': allErrors.filter((e) => e.category === 'agent-native'),
      'api-integration': allErrors.filter((e) => e.category === 'api-integration'),
      'data-error': allErrors.filter((e) => e.category === 'data-error'),
      'component-error': allErrors.filter((e) => e.category === 'component-error'),
      'hook-error': allErrors.filter((e) => e.category === 'hook-error'),
      'performance-error': allErrors.filter((e) => e.category === 'performance-error'),
      'network-error': allErrors.filter((e) => e.category === 'network-error'),
    };
  }

  /**
   * Get critical errors only
   */
  getCriticalErrors(): SmugMugAppError[] {
    return this.getFilteredErrors({ severity: 'critical' });
  }

  /**
   * Get high priority errors
   */
  getHighPriorityErrors(): SmugMugAppError[] {
    return this.getFilteredErrors({ severity: ['critical', 'high'] });
  }

  /**
   * Check if any critical errors exist
   */
  hasCriticalErrors(): boolean {
    return this.getCriticalErrors().length > 0;
  }

  /**
   * Export errors to JSON
   */
  exportToJSON(): string {
    const allErrors = this.getAllErrors();
    const stats = this.getStats();

    return JSON.stringify(
      {
        timestamp: Date.now(),
        totalErrors: allErrors.length,
        stats,
        errors: allErrors,
      },
      null,
      2
    );
  }
}

// Singleton instance
export const errorCaptureManager = new ErrorCaptureManager();
