/**
 * Tests for ConsoleInterceptor
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ConsoleInterceptor } from '../ConsoleInterceptor';

describe('ConsoleInterceptor', () => {
  let interceptor: ConsoleInterceptor;
  let originalConsoleError: typeof console.error;
  let originalConsoleWarn: typeof console.warn;

  beforeEach(() => {
    // Store original console methods
    originalConsoleError = console.error;
    originalConsoleWarn = console.warn;

    interceptor = new ConsoleInterceptor();
  });

  afterEach(() => {
    // Cleanup interceptor
    interceptor.cleanup();

    // Restore original console methods
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
  });

  describe('Initialization', () => {
    it('should initialize without errors', () => {
      expect(() => interceptor.initialize()).not.toThrow();
    });

    it('should intercept console.error calls', () => {
      interceptor.initialize();

      console.error('Test error message');

      const errors = interceptor.getErrors();
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('Test error message');
    });

    it('should intercept console.warn calls', () => {
      interceptor.initialize();

      console.warn('Test warning message');

      const errors = interceptor.getErrors();
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('Test warning message');
    });

    it('should preserve original console functionality', () => {
      interceptor.initialize();

      // Console methods should still work (captured by original)
      expect(() => console.error('Test')).not.toThrow();
      expect(() => console.warn('Test')).not.toThrow();
    });
  });

  describe('Error capture', () => {
    beforeEach(() => {
      interceptor.initialize();
    });

    it('should capture error messages', () => {
      console.error('Network request failed');

      const errors = interceptor.getErrors();
      expect(errors).toHaveLength(1);
      expect(errors[0]).toMatchObject({
        message: 'Network request failed',
        category: expect.any(String),
        severity: 'high',
        errorId: expect.stringMatching(/^console_err_/),
      });
    });

    it('should capture Error objects', () => {
      const testError = new Error('Test error object');
      console.error(testError);

      const errors = interceptor.getErrors();
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('Test error object');
      expect(errors[0].stack).toBeDefined();
    });

    it('should capture multiple arguments', () => {
      console.error('Error:', 'Multiple', 'arguments', { data: 'test' });

      const errors = interceptor.getErrors();
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('Error:');
      expect(errors[0].message).toContain('Multiple');
      expect(errors[0].message).toContain('arguments');
    });

    it('should filter React DevTools warnings', () => {
      console.error('Download the React DevTools for a better development experience');

      const errors = interceptor.getErrors();
      expect(errors).toHaveLength(0);
    });

    it('should filter useLayoutEffect SSR warnings', () => {
      console.warn('Warning: useLayoutEffect does nothing on the server');

      const errors = interceptor.getErrors();
      expect(errors).toHaveLength(0);
    });
  });

  describe('Error classification', () => {
    beforeEach(() => {
      interceptor.initialize();
    });

    it('should classify agent-native errors', () => {
      console.error('Agent interface registration failed');

      const errors = interceptor.getErrors();
      expect(errors[0].category).toBe('agent-native');
    });

    it('should classify API integration errors', () => {
      console.error('SmugMug API request failed');

      const errors = interceptor.getErrors();
      expect(errors[0].category).toBe('api-integration');
    });

    it('should classify hook errors', () => {
      console.error('useEffect dependency array is missing');

      const errors = interceptor.getErrors();
      expect(errors[0].category).toBe('hook-error');
    });

    it('should classify data errors', () => {
      console.error('Cannot read property of null');

      const errors = interceptor.getErrors();
      expect(errors[0].category).toBe('data-error');
    });

    it('should classify performance errors', () => {
      console.error('Memory leak detected in component');

      const errors = interceptor.getErrors();
      expect(errors[0].category).toBe('performance-error');
    });

    it('should classify network errors', () => {
      console.error('Network fetch failed');

      const errors = interceptor.getErrors();
      expect(errors[0].category).toBe('api-integration');
    });

    it('should default to component-error for unknown patterns', () => {
      console.error('Some random error message');

      const errors = interceptor.getErrors();
      expect(errors[0].category).toBe('component-error');
    });
  });

  describe('Severity classification', () => {
    beforeEach(() => {
      interceptor.initialize();
    });

    it('should classify console.error as high severity', () => {
      console.error('Error message');

      const errors = interceptor.getErrors();
      expect(errors[0].severity).toBe('high');
    });

    it('should classify console.warn as medium severity', () => {
      console.warn('Warning message');

      const errors = interceptor.getErrors();
      expect(errors[0].severity).toBe('medium');
    });
  });

  describe('Error management', () => {
    beforeEach(() => {
      interceptor.initialize();
    });

    it('should return all captured errors', () => {
      console.error('Error 1');
      console.error('Error 2');
      console.warn('Warning 1');

      const errors = interceptor.getErrors();
      expect(errors).toHaveLength(3);
    });

    it('should clear all errors', () => {
      console.error('Error 1');
      console.error('Error 2');

      expect(interceptor.getErrors()).toHaveLength(2);

      interceptor.clearErrors();

      expect(interceptor.getErrors()).toHaveLength(0);
    });

    it('should return copy of errors array', () => {
      console.error('Test error');

      const errors1 = interceptor.getErrors();
      const errors2 = interceptor.getErrors();

      expect(errors1).toEqual(errors2);
      expect(errors1).not.toBe(errors2); // Different array instances
    });
  });

  describe('Cleanup', () => {
    it('should restore original console methods', () => {
      interceptor.initialize();

      const interceptedError = console.error;
      const interceptedWarn = console.warn;

      interceptor.cleanup();

      expect(console.error).toBe(originalConsoleError);
      expect(console.warn).toBe(originalConsoleWarn);
      expect(console.error).not.toBe(interceptedError);
      expect(console.warn).not.toBe(interceptedWarn);
    });

    it('should clear captured errors on cleanup', () => {
      interceptor.initialize();

      console.error('Test error');
      expect(interceptor.getErrors()).toHaveLength(1);

      interceptor.cleanup();
      expect(interceptor.getErrors()).toHaveLength(0);
    });
  });

  describe('Browser context capture', () => {
    beforeEach(() => {
      interceptor.initialize();
    });

    it('should capture browser information', () => {
      console.error('Test error');

      const errors = interceptor.getErrors();
      expect(errors[0].browserInfo).toMatchObject({
        userAgent: expect.any(String),
        platform: expect.any(String),
        language: expect.any(String),
        viewport: {
          width: expect.any(Number),
          height: expect.any(Number),
        },
      });
    });

    it('should capture current route path', () => {
      console.error('Test error');

      const errors = interceptor.getErrors();
      expect(errors[0].routePath).toBe(window.location.pathname);
    });

    it('should capture timestamp', () => {
      const before = Date.now();
      console.error('Test error');
      const after = Date.now();

      const errors = interceptor.getErrors();
      expect(errors[0].timestamp).toBeGreaterThanOrEqual(before);
      expect(errors[0].timestamp).toBeLessThanOrEqual(after);
    });
  });
});
