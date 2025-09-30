/**
 * Global Error Boundary for Runtime Error Detection
 *
 * Wraps the application in development/test mode to capture React component errors
 * with full context including agent state, component tree, and props/state.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import type { SmugMugAppError } from './types';

interface Props {
  children: ReactNode;
  onError?: (error: SmugMugAppError) => void;
  fallback?: ReactNode;
  captureAgentState?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

// Window interface already declared in src/agents and src/utils/agent-native

export class RuntimeErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({
      errorInfo,
    });

    // Capture structured error with full context
    const structuredError = this.captureStructuredError(error, errorInfo);

    // Call error handler if provided
    if (this.props.onError) {
      this.props.onError(structuredError);
    }

    // Log to console in development
    if (import.meta.env.MODE === 'development') {
      console.error('[RuntimeErrorBoundary] Caught error:', structuredError);
    }
  }

  private captureStructuredError(
    error: Error,
    errorInfo: ErrorInfo
  ): SmugMugAppError {
    const errorId = this.generateErrorId();
    const timestamp = Date.now();

    // Capture agent context if enabled
    const agentContext = this.props.captureAgentState
      ? this.captureAgentContext()
      : undefined;

    // Capture browser info
    const browserInfo = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    };

    return {
      errorId,
      message: error.message,
      stack: error.stack,
      timestamp,
      category: 'component-error',
      severity: this.classifySeverity(error),
      componentStack: errorInfo.componentStack,
      browserInfo,
      agentContext,
      routePath: window.location.pathname,
    };
  }

  private captureAgentContext() {
    if (!window.agentInterfaces && !window.agentActions) {
      return undefined;
    }

    return {
      registeredInterfaces: window.agentInterfaces
        ? Object.keys(window.agentInterfaces)
        : [],
      registeredActions: window.agentActions
        ? Object.keys(window.agentActions)
        : [],
      currentState: window.agentState || {},
    };
  }

  private classifySeverity(error: Error): 'critical' | 'high' | 'medium' | 'low' {
    const message = error.message.toLowerCase();

    // Critical: Agent-native failures
    if (
      message.includes('agent') ||
      message.includes('interface') ||
      message.includes('action')
    ) {
      return 'critical';
    }

    // High: Data/API failures
    if (
      message.includes('fetch') ||
      message.includes('api') ||
      message.includes('network')
    ) {
      return 'high';
    }

    // Medium: Component failures
    if (
      message.includes('render') ||
      message.includes('hook') ||
      message.includes('undefined')
    ) {
      return 'medium';
    }

    return 'low';
  }

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          style={{
            padding: '20px',
            backgroundColor: '#fee',
            border: '2px solid #c33',
            borderRadius: '4px',
            fontFamily: 'monospace',
          }}
        >
          <h2>⚠️ Component Error Detected</h2>
          <p>
            <strong>Message:</strong> {this.state.error?.message}
          </p>
          {import.meta.env.MODE === 'development' && this.state.errorInfo && (
            <details>
              <summary>Component Stack</summary>
              <pre>{this.state.errorInfo.componentStack}</pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
