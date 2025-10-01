/**
 * E2E Error Capture Helpers
 *
 * Utilities for capturing and analyzing runtime errors in Playwright tests
 */

import { Page } from '@playwright/test';

export interface CapturedError {
  message: string;
  stack?: string;
  type: 'console-error' | 'console-warn' | 'uncaught' | 'unhandledrejection';
  timestamp: number;
  category?: string;
  severity?: string;
}

export interface ErrorCaptureOptions {
  captureConsoleErrors?: boolean;
  captureConsoleWarnings?: boolean;
  captureUncaughtExceptions?: boolean;
  captureUnhandledRejections?: boolean;
  filterReactDevTools?: boolean;
}

/**
 * Setup comprehensive error capture on a page
 */
export async function setupErrorCapture(
  page: Page,
  options: ErrorCaptureOptions = {}
): Promise<CapturedError[]> {
  const {
    captureConsoleErrors = true,
    captureConsoleWarnings = true,
    captureUncaughtExceptions = true,
    captureUnhandledRejections = true,
    filterReactDevTools = true,
  } = options;

  const errors: CapturedError[] = [];

  // Capture console errors
  if (captureConsoleErrors || captureConsoleWarnings) {
    page.on('console', (msg) => {
      if (msg.type() === 'error' && captureConsoleErrors) {
        const message = msg.text();

        // Filter React DevTools if requested
        if (filterReactDevTools && isReactDevToolsMessage(message)) {
          return;
        }

        errors.push({
          message,
          type: 'console-error',
          timestamp: Date.now(),
        });
      } else if (msg.type() === 'warning' && captureConsoleWarnings) {
        const message = msg.text();

        if (filterReactDevTools && isReactDevToolsMessage(message)) {
          return;
        }

        errors.push({
          message,
          type: 'console-warn',
          timestamp: Date.now(),
        });
      }
    });
  }

  // Capture uncaught exceptions
  if (captureUncaughtExceptions) {
    page.on('pageerror', (error) => {
      errors.push({
        message: error.message,
        stack: error.stack,
        type: 'uncaught',
        timestamp: Date.now(),
      });
    });
  }

  // Capture unhandled promise rejections
  if (captureUnhandledRejections) {
    await page.exposeFunction('__captureRejection', (message: string, stack?: string) => {
      errors.push({
        message,
        stack,
        type: 'unhandledrejection',
        timestamp: Date.now(),
      });
    });

    await page.evaluate(() => {
      window.addEventListener('unhandledrejection', (event) => {
        const message =
          event.reason instanceof Error
            ? event.reason.message
            : String(event.reason);
        const stack =
          event.reason instanceof Error ? event.reason.stack : undefined;

        (window as any).__captureRejection(message, stack);
      });
    });
  }

  return errors;
}

/**
 * Check if message is from React DevTools
 */
function isReactDevToolsMessage(message: string): boolean {
  const patterns = [
    /Download the React DevTools/i,
    /React DevTools/i,
    /Warning: ReactDOM\.render/i,
    /Warning: useLayoutEffect/i,
  ];

  return patterns.some((pattern) => pattern.test(message));
}

/**
 * Filter errors by type
 */
export function filterErrorsByType(
  errors: CapturedError[],
  type: CapturedError['type']
): CapturedError[] {
  return errors.filter((e) => e.type === type);
}

/**
 * Get only critical errors (uncaught exceptions and unhandled rejections)
 */
export function getCriticalErrors(errors: CapturedError[]): CapturedError[] {
  return errors.filter(
    (e) => e.type === 'uncaught' || e.type === 'unhandledrejection'
  );
}

/**
 * Check if errors contain specific pattern
 */
export function hasErrorMatching(
  errors: CapturedError[],
  pattern: RegExp
): boolean {
  return errors.some((e) => pattern.test(e.message));
}

/**
 * Get error summary
 */
export function getErrorSummary(errors: CapturedError[]) {
  return {
    total: errors.length,
    byType: {
      'console-error': errors.filter((e) => e.type === 'console-error').length,
      'console-warn': errors.filter((e) => e.type === 'console-warn').length,
      uncaught: errors.filter((e) => e.type === 'uncaught').length,
      unhandledrejection: errors.filter((e) => e.type === 'unhandledrejection')
        .length,
    },
    critical: getCriticalErrors(errors).length,
  };
}

/**
 * Execute action and capture errors
 */
export async function executeWithErrorCapture(
  page: Page,
  action: () => Promise<void>,
  options?: ErrorCaptureOptions
): Promise<CapturedError[]> {
  const errors = await setupErrorCapture(page, options);
  await action();
  return errors;
}
