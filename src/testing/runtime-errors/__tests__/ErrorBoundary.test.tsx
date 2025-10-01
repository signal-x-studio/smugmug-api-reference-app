/**
 * Tests for RuntimeErrorBoundary component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RuntimeErrorBoundary } from '../ErrorBoundary';
import type { SmugMugAppError } from '../types';

// Component that throws an error
function ThrowError({ shouldThrow = false, message = 'Test error' }: { shouldThrow?: boolean; message?: string }) {
  if (shouldThrow) {
    throw new Error(message);
  }
  return <div>No error</div>;
}

describe('RuntimeErrorBoundary', () => {
  beforeEach(() => {
    // Clear console errors for clean test output
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('Normal operation', () => {
    it('should render children when no error occurs', () => {
      render(
        <RuntimeErrorBoundary>
          <div>Test content</div>
        </RuntimeErrorBoundary>
      );

      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('should not call onError handler when no error occurs', () => {
      const onError = vi.fn();

      render(
        <RuntimeErrorBoundary onError={onError}>
          <div>Test content</div>
        </RuntimeErrorBoundary>
      );

      expect(onError).not.toHaveBeenCalled();
    });
  });

  describe('Error handling', () => {
    it('should catch and display errors from children', () => {
      render(
        <RuntimeErrorBoundary>
          <ThrowError shouldThrow={true} message="Component crashed" />
        </RuntimeErrorBoundary>
      );

      expect(screen.getByText(/Component Error Detected/i)).toBeInTheDocument();
      expect(screen.getByText(/Component crashed/i)).toBeInTheDocument();
    });

    it('should call onError handler with structured error', () => {
      const onError = vi.fn<(error: SmugMugAppError) => void>();

      render(
        <RuntimeErrorBoundary onError={onError}>
          <ThrowError shouldThrow={true} message="Test error message" />
        </RuntimeErrorBoundary>
      );

      expect(onError).toHaveBeenCalledTimes(1);

      const capturedError = onError.mock.calls[0][0];
      expect(capturedError).toMatchObject({
        errorId: expect.stringMatching(/^err_/),
        message: 'Test error message',
        category: 'component-error',
        severity: expect.stringMatching(/^(critical|high|medium|low)$/),
        timestamp: expect.any(Number),
      });
    });

    it('should capture component stack trace', () => {
      const onError = vi.fn<(error: SmugMugAppError) => void>();

      render(
        <RuntimeErrorBoundary onError={onError}>
          <ThrowError shouldThrow={true} />
        </RuntimeErrorBoundary>
      );

      const capturedError = onError.mock.calls[0][0];
      expect(capturedError.componentStack).toBeDefined();
      expect(capturedError.stack).toBeDefined();
    });

    it('should render custom fallback when provided', () => {
      const fallback = <div>Custom error fallback</div>;

      render(
        <RuntimeErrorBoundary fallback={fallback}>
          <ThrowError shouldThrow={true} />
        </RuntimeErrorBoundary>
      );

      expect(screen.getByText('Custom error fallback')).toBeInTheDocument();
      expect(screen.queryByText(/Component Error Detected/i)).not.toBeInTheDocument();
    });
  });

  describe('Agent context capture', () => {
    it('should capture agent context when enabled', () => {
      const onError = vi.fn<(error: SmugMugAppError) => void>();

      // Mock window.agentInterfaces and agentActions
      window.agentInterfaces = {
        'test-interface': {} as any,
      };
      window.agentActions = {
        'test-action': {} as any,
      };

      render(
        <RuntimeErrorBoundary onError={onError} captureAgentState={true}>
          <ThrowError shouldThrow={true} />
        </RuntimeErrorBoundary>
      );

      const capturedError = onError.mock.calls[0][0];
      expect(capturedError.agentContext).toBeDefined();
      expect(capturedError.agentContext?.registeredInterfaces).toContain('test-interface');
      expect(capturedError.agentContext?.registeredActions).toContain('test-action');

      // Cleanup
      delete window.agentInterfaces;
      delete window.agentActions;
    });

    it('should not capture agent context when disabled', () => {
      const onError = vi.fn<(error: SmugMugAppError) => void>();

      window.agentInterfaces = {
        'test-interface': {} as any,
      };

      render(
        <RuntimeErrorBoundary onError={onError} captureAgentState={false}>
          <ThrowError shouldThrow={true} />
        </RuntimeErrorBoundary>
      );

      const capturedError = onError.mock.calls[0][0];
      expect(capturedError.agentContext).toBeUndefined();

      // Cleanup
      delete window.agentInterfaces;
    });
  });

  describe('Browser info capture', () => {
    it('should capture browser information', () => {
      const onError = vi.fn<(error: SmugMugAppError) => void>();

      render(
        <RuntimeErrorBoundary onError={onError}>
          <ThrowError shouldThrow={true} />
        </RuntimeErrorBoundary>
      );

      const capturedError = onError.mock.calls[0][0];
      expect(capturedError.browserInfo).toBeDefined();
      expect(capturedError.browserInfo?.userAgent).toBeDefined();
      expect(capturedError.browserInfo?.platform).toBeDefined();
      expect(capturedError.browserInfo?.viewport).toMatchObject({
        width: expect.any(Number),
        height: expect.any(Number),
      });
    });
  });

  describe('Error classification', () => {
    it('should classify agent-native errors as critical', () => {
      const onError = vi.fn<(error: SmugMugAppError) => void>();

      render(
        <RuntimeErrorBoundary onError={onError}>
          <ThrowError shouldThrow={true} message="Agent action failed to execute" />
        </RuntimeErrorBoundary>
      );

      const capturedError = onError.mock.calls[0][0];
      expect(capturedError.severity).toBe('critical');
    });

    it('should classify API errors as high severity', () => {
      const onError = vi.fn<(error: SmugMugAppError) => void>();

      render(
        <RuntimeErrorBoundary onError={onError}>
          <ThrowError shouldThrow={true} message="API fetch failed with 500" />
        </RuntimeErrorBoundary>
      );

      const capturedError = onError.mock.calls[0][0];
      expect(capturedError.severity).toBe('high');
    });

    it('should classify render errors as medium severity', () => {
      const onError = vi.fn<(error: SmugMugAppError) => void>();

      render(
        <RuntimeErrorBoundary onError={onError}>
          <ThrowError shouldThrow={true} message="Cannot render component" />
        </RuntimeErrorBoundary>
      );

      const capturedError = onError.mock.calls[0][0];
      expect(capturedError.severity).toBe('medium');
    });
  });

  describe('Error ID generation', () => {
    it('should generate unique error IDs', () => {
      const onError1 = vi.fn<(error: SmugMugAppError) => void>();
      const onError2 = vi.fn<(error: SmugMugAppError) => void>();

      // Trigger first error in first boundary
      render(
        <RuntimeErrorBoundary onError={onError1}>
          <ThrowError shouldThrow={true} message="First error" />
        </RuntimeErrorBoundary>
      );

      const firstErrorId = onError1.mock.calls[0][0].errorId;
      expect(firstErrorId).toMatch(/^err_\d+_[a-z0-9]+$/);

      // Trigger second error in separate boundary
      render(
        <RuntimeErrorBoundary onError={onError2}>
          <ThrowError shouldThrow={true} message="Second error" />
        </RuntimeErrorBoundary>
      );

      const secondErrorId = onError2.mock.calls[0][0].errorId;
      expect(secondErrorId).toMatch(/^err_\d+_[a-z0-9]+$/);

      // IDs should be unique
      expect(firstErrorId).not.toBe(secondErrorId);
    });
  });
});
