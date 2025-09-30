/**
 * Agent-Native Error Interceptor
 *
 * Monitors window.agentInterfaces and window.agentActions registries
 * to detect agent-native integration errors specific to SmugMug app.
 */

import type {
  SmugMugAppError,
  ErrorCaptureHandler,
  AgentContext,
} from './types';

// Window interface already declared in src/agents and src/utils/agent-native

export class AgentErrorInterceptor implements ErrorCaptureHandler {
  private errors: SmugMugAppError[] = [];
  private initialized = false;
  private originalActions?: Record<string, unknown>;

  initialize(): void {
    if (this.initialized) {
      return;
    }

    this.monitorAgentRegistry();
    this.initialized = true;
  }

  cleanup(): void {
    this.errors = [];
    this.initialized = false;
  }

  getErrors(): SmugMugAppError[] {
    return [...this.errors];
  }

  clearErrors(): void {
    this.errors = [];
  }

  private monitorAgentRegistry(): void {
    // Monitor agent actions registry for missing actions
    this.interceptActionCalls();

    // Validate dual-interface implementation
    this.validateDualInterfaceUsage();

    // Check Schema.org markup integrity
    this.validateSchemaMarkup();
  }

  private interceptActionCalls(): void {
    // Store original actions reference
    this.originalActions = window.agentActions;

    // Create proxy to intercept action calls
    if (!window.agentActions) {
      window.agentActions = {};
    }

    window.agentActions = new Proxy(window.agentActions, {
      get: (target, prop: string) => {
        if (!(prop in target)) {
          this.captureError({
            errorId: this.generateErrorId(),
            message: `Agent action '${prop}' not registered. Action was called before registration.`,
            timestamp: Date.now(),
            category: 'agent-native',
            severity: 'critical',
            agentContext: this.captureAgentContext(),
            fixSuggestion:
              'Ensure AgentWrapper is mounted and action is registered before calling.',
          });
        }
        return target[prop as keyof typeof target];
      },
    });
  }

  private validateDualInterfaceUsage(): void {
    // Check if components using useDualInterface are wrapped in AgentWrapper
    const checkInterval = setInterval(() => {
      if (!window.agentInterfaces) {
        return;
      }

      // Validate each registered interface has proper configuration
      Object.entries(window.agentInterfaces).forEach(([interfaceId, config]) => {
        if (!this.isValidInterfaceConfig(config)) {
          this.captureError({
            errorId: this.generateErrorId(),
            message: `Invalid agent interface configuration for '${interfaceId}'`,
            timestamp: Date.now(),
            category: 'agent-native',
            severity: 'high',
            agentContext: this.captureAgentContext(),
            fixSuggestion:
              'Check that useDualInterface hook is called with valid configuration object.',
          });
        }
      });
    }, 1000);

    // Clean up interval after 10 seconds (only validate during initialization)
    setTimeout(() => clearInterval(checkInterval), 10000);
  }

  private validateSchemaMarkup(): void {
    // Check for Schema.org markup on agent-enabled components
    const checkMarkup = () => {
      const schemaElements = document.querySelectorAll('[itemscope]');

      schemaElements.forEach((element) => {
        const itemType = element.getAttribute('itemtype');
        const itemProps = element.querySelectorAll('[itemprop]');

        if (!itemType) {
          this.captureError({
            errorId: this.generateErrorId(),
            message: 'Schema.org element missing itemtype attribute',
            timestamp: Date.now(),
            category: 'agent-native',
            severity: 'medium',
            componentName: element.tagName.toLowerCase(),
            fixSuggestion:
              'Add itemtype attribute to define Schema.org entity type.',
          });
        }

        // Validate required properties for SearchAction
        if (itemType?.includes('SearchAction')) {
          const hasTarget = Array.from(itemProps).some(
            (prop) => prop.getAttribute('itemprop') === 'target'
          );
          const hasQueryInput = Array.from(itemProps).some(
            (prop) => prop.getAttribute('itemprop') === 'query-input'
          );

          if (!hasTarget || !hasQueryInput) {
            this.captureError({
              errorId: this.generateErrorId(),
              message: 'SearchAction missing required Schema.org properties',
              timestamp: Date.now(),
              category: 'agent-native',
              severity: 'high',
              componentName: element.tagName.toLowerCase(),
              fixSuggestion:
                "SearchAction requires 'target' and 'query-input' properties.",
            });
          }
        }
      });
    };

    // Check on mount and after DOM changes
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', checkMarkup);
    } else {
      checkMarkup();
    }

    // Re-check after 2 seconds to catch lazy-loaded components
    setTimeout(checkMarkup, 2000);
  }

  private isValidInterfaceConfig(config: unknown): boolean {
    if (!config || typeof config !== 'object') {
      return false;
    }

    const typedConfig = config as Record<string, unknown>;

    // Check for required dual-interface properties
    return (
      'interfaceId' in typedConfig &&
      typeof typedConfig.interfaceId === 'string' &&
      typedConfig.interfaceId.length > 0
    );
  }

  private captureAgentContext(): AgentContext {
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

  private captureError(error: SmugMugAppError): void {
    this.errors.push(error);

    // Log in development
    if (import.meta.env.MODE === 'development') {
      console.error('[AgentErrorInterceptor]', error);
    }
  }

  private generateErrorId(): string {
    return `agent_err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Singleton instance
export const agentErrorInterceptor = new AgentErrorInterceptor();
