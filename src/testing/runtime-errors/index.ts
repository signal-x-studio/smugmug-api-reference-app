/**
 * Runtime Error Detection Framework
 *
 * Entry point for SmugMug API Reference App error capture infrastructure.
 */

// Types
export type * from './types';

// Error Boundary Component
export { RuntimeErrorBoundary } from './ErrorBoundary';

// Error Interceptors
export { agentErrorInterceptor } from './AgentErrorInterceptor';
export { consoleInterceptor } from './ConsoleInterceptor';
export { promiseRejectionHandler } from './PromiseRejectionHandler';
export { networkErrorDetector } from './NetworkErrorDetector';

// Error Capture Manager (Singleton)
export { errorCaptureManager } from './ErrorCaptureManager';

// Convenience function to initialize all error capture
export function initializeErrorCapture(options?: {
  captureAgentErrors?: boolean;
  captureConsoleErrors?: boolean;
  captureNetworkErrors?: boolean;
  captureUnhandledRejections?: boolean;
}): void {
  const {
    captureAgentErrors = true,
    captureConsoleErrors = true,
    captureNetworkErrors = true,
    captureUnhandledRejections = true,
  } = options || {};

  if (captureAgentErrors) {
    import('./AgentErrorInterceptor').then(({ agentErrorInterceptor }) => {
      agentErrorInterceptor.initialize();
    });
  }

  if (captureConsoleErrors) {
    import('./ConsoleInterceptor').then(({ consoleInterceptor }) => {
      consoleInterceptor.initialize();
    });
  }

  if (captureNetworkErrors) {
    import('./NetworkErrorDetector').then(({ networkErrorDetector }) => {
      networkErrorDetector.initialize();
    });
  }

  if (captureUnhandledRejections) {
    import('./PromiseRejectionHandler').then(({ promiseRejectionHandler }) => {
      promiseRejectionHandler.initialize();
    });
  }

  if (import.meta.env.MODE === 'development') {
    console.log('[RuntimeErrorDetection] Initializing error capture');
  }
}

// Convenience function to cleanup all error capture
export function cleanupErrorCapture(): void {
  import('./AgentErrorInterceptor').then(({ agentErrorInterceptor }) => {
    agentErrorInterceptor.cleanup();
  });
  import('./ConsoleInterceptor').then(({ consoleInterceptor }) => {
    consoleInterceptor.cleanup();
  });
  import('./NetworkErrorDetector').then(({ networkErrorDetector }) => {
    networkErrorDetector.cleanup();
  });
  import('./PromiseRejectionHandler').then(({ promiseRejectionHandler }) => {
    promiseRejectionHandler.cleanup();
  });

  if (import.meta.env.MODE === 'development') {
    console.log('[RuntimeErrorDetection] Cleaned up error capture');
  }
}
