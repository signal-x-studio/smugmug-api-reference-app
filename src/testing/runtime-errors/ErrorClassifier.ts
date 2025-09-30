/**
 * Error Classification Engine
 *
 * Analyzes errors to determine category, severity, and generate fix suggestions
 * based on SmugMug app patterns and common error scenarios.
 */

import type {
  SmugMugAppError,
  ErrorCategory,
  Severity,
  FixSuggestion,
} from './types';

export class ErrorClassifier {
  /**
   * Classify error category based on error message, stack, and context
   */
  static classifyCategory(error: Partial<SmugMugAppError>): ErrorCategory {
    const message = (error.message || '').toLowerCase();
    const stack = (error.stack || '').toLowerCase();

    // Agent-native errors (highest priority)
    if (this.isAgentNativeError(message, stack, error)) {
      return 'agent-native';
    }

    // API integration errors
    if (this.isAPIIntegrationError(message, stack, error)) {
      return 'api-integration';
    }

    // Network errors
    if (this.isNetworkError(message, stack)) {
      return 'network-error';
    }

    // Hook errors
    if (this.isHookError(message, stack)) {
      return 'hook-error';
    }

    // Data errors
    if (this.isDataError(message, stack)) {
      return 'data-error';
    }

    // Performance errors
    if (this.isPerformanceError(message, stack)) {
      return 'performance-error';
    }

    // Default to component error
    return 'component-error';
  }

  /**
   * Classify error severity
   */
  static classifySeverity(error: Partial<SmugMugAppError>): Severity {
    const category = error.category || this.classifyCategory(error);
    const message = (error.message || '').toLowerCase();

    // Critical: Agent-native failures, auth failures
    if (
      category === 'agent-native' ||
      message.includes('401') ||
      message.includes('403') ||
      message.includes('authentication') ||
      message.includes('authorization')
    ) {
      return 'critical';
    }

    // High: API failures, data corruption, critical component failures
    if (
      category === 'api-integration' ||
      category === 'network-error' ||
      message.includes('500') ||
      message.includes('429') ||
      message.includes('timeout') ||
      message.includes('cannot read property') ||
      message.includes('undefined is not')
    ) {
      return 'high';
    }

    // Medium: Hook issues, component errors, data validation
    if (
      category === 'hook-error' ||
      category === 'data-error' ||
      category === 'component-error'
    ) {
      return 'medium';
    }

    // Low: Performance warnings, non-critical issues
    return 'low';
  }

  /**
   * Generate fix suggestions based on error patterns
   */
  static generateFixSuggestions(error: SmugMugAppError): FixSuggestion[] {
    const suggestions: FixSuggestion[] = [];
    const message = error.message.toLowerCase();

    // Agent-native suggestions
    if (error.category === 'agent-native') {
      suggestions.push(...this.getAgentNativeFixSuggestions(error));
    }

    // API integration suggestions
    if (error.category === 'api-integration') {
      suggestions.push(...this.getAPIFixSuggestions(error));
    }

    // Hook error suggestions
    if (error.category === 'hook-error' || message.includes('hook')) {
      suggestions.push(...this.getHookFixSuggestions(error));
    }

    // Data error suggestions
    if (error.category === 'data-error' || message.includes('undefined')) {
      suggestions.push(...this.getDataErrorFixSuggestions(error));
    }

    // Network error suggestions
    if (error.category === 'network-error') {
      suggestions.push(...this.getNetworkFixSuggestions(error));
    }

    return suggestions;
  }

  // Private helper methods

  private static isAgentNativeError(
    message: string,
    stack: string,
    error: Partial<SmugMugAppError>
  ): boolean {
    return (
      message.includes('agent') ||
      message.includes('interface') ||
      message.includes('action') ||
      message.includes('schema.org') ||
      message.includes('dual-interface') ||
      stack.includes('agentinterfaces') ||
      stack.includes('agentactions') ||
      !!error.agentContext
    );
  }

  private static isAPIIntegrationError(
    message: string,
    stack: string,
    error: Partial<SmugMugAppError>
  ): boolean {
    return (
      message.includes('api') ||
      message.includes('smugmug') ||
      message.includes('gemini') ||
      message.includes('generativelanguage') ||
      stack.includes('smugmugservice') ||
      stack.includes('geminiservice') ||
      !!error.apiContext
    );
  }

  private static isNetworkError(message: string, stack: string): boolean {
    return (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('xhr') ||
      message.includes('timeout') ||
      message.includes('aborted') ||
      stack.includes('fetch')
    );
  }

  private static isHookError(message: string, stack: string): boolean {
    return (
      message.includes('hook') ||
      message.includes('useeffect') ||
      message.includes('usememo') ||
      message.includes('usecallback') ||
      message.includes('usestate') ||
      message.includes('dependency') ||
      stack.includes('useeffect') ||
      stack.includes('usememo')
    );
  }

  private static isDataError(message: string, stack: string): boolean {
    return (
      message.includes('null') ||
      message.includes('undefined') ||
      message.includes('cannot read') ||
      message.includes('cannot access') ||
      message.includes('parse') ||
      message.includes('json') ||
      message.includes('invalid')
    );
  }

  private static isPerformanceError(message: string, stack: string): boolean {
    return (
      message.includes('memory') ||
      message.includes('leak') ||
      message.includes('performance') ||
      message.includes('too many re-renders') ||
      message.includes('maximum update depth')
    );
  }

  private static getAgentNativeFixSuggestions(
    error: SmugMugAppError
  ): FixSuggestion[] {
    const suggestions: FixSuggestion[] = [];

    if (error.message.includes('not registered')) {
      suggestions.push({
        errorId: error.errorId,
        category: 'agent-native',
        title: 'Register agent action before use',
        description:
          'Ensure AgentWrapper is mounted and action is registered in window.agentActions before calling.',
        codeExample: `// In component with AgentWrapper
useEffect(() => {
  const config = {
    interfaceId: 'my-interface',
    actions: {
      'my-action': async (params) => { /* implementation */ }
    }
  };

  // Action is now registered in window.agentActions
}, []);`,
        files: ['src/agents/components/AgentWrapper.tsx'],
        automaticFix: false,
      });
    }

    if (error.message.includes('missing') && error.message.includes('interface')) {
      suggestions.push({
        errorId: error.errorId,
        category: 'agent-native',
        title: 'Wrap component in AgentWrapper',
        description:
          'Components using useDualInterface must be wrapped in AgentWrapper.',
        codeExample: `import { AgentWrapper } from '@/agents/components/AgentWrapper';

export function MyComponent() {
  const { interfaceConfig } = useDualInterface({
    interfaceId: 'my-interface',
    // ... config
  });

  return (
    <AgentWrapper config={interfaceConfig}>
      {/* Component content */}
    </AgentWrapper>
  );
}`,
        files: ['src/components/MyComponent.tsx'],
        automaticFix: false,
      });
    }

    return suggestions;
  }

  private static getAPIFixSuggestions(error: SmugMugAppError): FixSuggestion[] {
    const suggestions: FixSuggestion[] = [];

    if (error.apiContext?.statusCode === 401) {
      suggestions.push({
        errorId: error.errorId,
        category: 'api-integration',
        title: 'Fix authentication',
        description: 'API authentication failed. Check credentials and token validity.',
        codeExample: `// Check environment variables
console.log('VITE_GEMINI_API_KEY:', import.meta.env.VITE_GEMINI_API_KEY);

// For SmugMug, verify OAuth flow
// For Gemini, verify API key is set`,
        files: ['.env.local', 'src/services/geminiService.ts'],
        automaticFix: false,
      });
    }

    if (error.apiContext?.statusCode === 429) {
      suggestions.push({
        errorId: error.errorId,
        category: 'api-integration',
        title: 'Implement rate limiting',
        description: 'API rate limit exceeded. Add request throttling and retry logic.',
        codeExample: `// Add exponential backoff retry
async function retryWithBackoff(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.status === 429 && i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
}`,
        files: ['src/services/apiUtils.ts'],
        automaticFix: false,
      });
    }

    return suggestions;
  }

  private static getHookFixSuggestions(error: SmugMugAppError): FixSuggestion[] {
    const suggestions: FixSuggestion[] = [];

    if (error.message.includes('dependency')) {
      suggestions.push({
        errorId: error.errorId,
        category: 'hook-error',
        title: 'Add missing dependencies',
        description: 'Add all dependencies to useEffect dependency array.',
        codeExample: `// Include all values used in effect
useEffect(() => {
  fetchData(userId, filter);
}, [userId, filter]); // Add all dependencies`,
        files: [error.componentName || 'component file'].map((f) => `src/components/${f}`),
        automaticFix: true,
      });
    }

    return suggestions;
  }

  private static getDataErrorFixSuggestions(
    error: SmugMugAppError
  ): FixSuggestion[] {
    const suggestions: FixSuggestion[] = [];

    if (error.message.includes('undefined') || error.message.includes('null')) {
      suggestions.push({
        errorId: error.errorId,
        category: 'data-error',
        title: 'Add null safety checks',
        description: 'Use optional chaining and nullish coalescing to handle missing data.',
        codeExample: `// Use optional chaining
const title = photo?.title ?? 'Untitled';
const url = photo?.imageUrl;

// Or add guard clause
if (!photo) {
  return <div>Loading...</div>;
}`,
        files: [error.componentName || 'component file'].map((f) => `src/components/${f}`),
        automaticFix: false,
      });
    }

    return suggestions;
  }

  private static getNetworkFixSuggestions(
    error: SmugMugAppError
  ): FixSuggestion[] {
    const suggestions: FixSuggestion[] = [];

    if (error.message.includes('timeout')) {
      suggestions.push({
        errorId: error.errorId,
        category: 'network-error',
        title: 'Increase timeout or optimize request',
        description: 'Request timed out. Increase timeout or reduce payload size.',
        codeExample: `// Increase timeout
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s

fetch(url, { signal: controller.signal })
  .finally(() => clearTimeout(timeoutId));`,
        files: ['src/services/apiClient.ts'],
        automaticFix: false,
      });
    }

    return suggestions;
  }
}
