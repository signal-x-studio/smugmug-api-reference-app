/**
 * Tests for ErrorClassifier
 */

import { describe, it, expect } from 'vitest';
import { ErrorClassifier } from '../ErrorClassifier';
import type { SmugMugAppError } from '../types';

describe('ErrorClassifier', () => {
  describe('classifyCategory', () => {
    it('should classify agent-native errors', () => {
      const error: Partial<SmugMugAppError> = {
        message: 'Agent action not registered',
        stack: 'at agentInterfaces.execute',
      };

      expect(ErrorClassifier.classifyCategory(error)).toBe('agent-native');
    });

    it('should classify API integration errors', () => {
      const error: Partial<SmugMugAppError> = {
        message: 'SmugMug API request failed',
        stack: 'at smugmugService.fetchPhotos',
      };

      expect(ErrorClassifier.classifyCategory(error)).toBe('api-integration');
    });

    it('should classify network errors', () => {
      const error: Partial<SmugMugAppError> = {
        message: 'Network timeout exceeded',
        stack: 'at fetch',
      };

      expect(ErrorClassifier.classifyCategory(error)).toBe('network-error');
    });

    it('should classify hook errors', () => {
      const error: Partial<SmugMugAppError> = {
        message: 'useEffect dependency missing',
        stack: 'at useEffect',
      };

      expect(ErrorClassifier.classifyCategory(error)).toBe('hook-error');
    });

    it('should classify data errors', () => {
      const error: Partial<SmugMugAppError> = {
        message: 'Cannot read property of undefined',
        stack: '',
      };

      expect(ErrorClassifier.classifyCategory(error)).toBe('data-error');
    });

    it('should classify performance errors', () => {
      const error: Partial<SmugMugAppError> = {
        message: 'Memory leak detected',
        stack: '',
      };

      expect(ErrorClassifier.classifyCategory(error)).toBe('performance-error');
    });

    it('should default to component-error for unknown types', () => {
      const error: Partial<SmugMugAppError> = {
        message: 'Unknown error occurred',
        stack: '',
      };

      expect(ErrorClassifier.classifyCategory(error)).toBe('component-error');
    });
  });

  describe('classifySeverity', () => {
    it('should classify agent-native errors as critical', () => {
      const error: Partial<SmugMugAppError> = {
        message: 'Agent interface failed',
        category: 'agent-native',
      };

      expect(ErrorClassifier.classifySeverity(error)).toBe('critical');
    });

    it('should classify authentication errors as critical', () => {
      const error: Partial<SmugMugAppError> = {
        message: 'HTTP 401 Unauthorized',
        category: 'api-integration',
      };

      expect(ErrorClassifier.classifySeverity(error)).toBe('critical');
    });

    it('should classify API failures as high severity', () => {
      const error: Partial<SmugMugAppError> = {
        message: 'API request failed',
        category: 'api-integration',
      };

      expect(ErrorClassifier.classifySeverity(error)).toBe('high');
    });

    it('should classify network errors as high severity', () => {
      const error: Partial<SmugMugAppError> = {
        message: 'Network timeout',
        category: 'network-error',
      };

      expect(ErrorClassifier.classifySeverity(error)).toBe('high');
    });

    it('should classify hook errors as medium severity', () => {
      const error: Partial<SmugMugAppError> = {
        message: 'useEffect issue',
        category: 'hook-error',
      };

      expect(ErrorClassifier.classifySeverity(error)).toBe('medium');
    });

    it('should classify data errors as medium severity', () => {
      const error: Partial<SmugMugAppError> = {
        message: 'Data validation failed',
        category: 'data-error',
      };

      expect(ErrorClassifier.classifySeverity(error)).toBe('medium');
    });

    it('should classify component errors as medium severity', () => {
      const error: Partial<SmugMugAppError> = {
        message: 'Component render failed',
        category: 'component-error',
      };

      expect(ErrorClassifier.classifySeverity(error)).toBe('medium');
    });

    it('should classify performance errors as low severity', () => {
      const error: Partial<SmugMugAppError> = {
        message: 'Performance warning',
        category: 'performance-error',
      };

      expect(ErrorClassifier.classifySeverity(error)).toBe('low');
    });
  });

  describe('generateFixSuggestions', () => {
    describe('Agent-native suggestions', () => {
      it('should suggest registering missing agent actions', () => {
        const error: SmugMugAppError = {
          errorId: 'test-1',
          message: 'Agent action not registered',
          timestamp: Date.now(),
          category: 'agent-native',
          severity: 'critical',
        };

        const suggestions = ErrorClassifier.generateFixSuggestions(error);

        expect(suggestions).toHaveLength(1);
        expect(suggestions[0]).toMatchObject({
          category: 'agent-native',
          title: 'Register agent action before use',
          codeExample: expect.stringContaining('AgentWrapper'),
        });
      });

      it('should suggest wrapping in AgentWrapper for interface errors', () => {
        const error: SmugMugAppError = {
          errorId: 'test-2',
          message: 'missing interface configuration',
          timestamp: Date.now(),
          category: 'agent-native',
          severity: 'high',
        };

        const suggestions = ErrorClassifier.generateFixSuggestions(error);

        expect(suggestions.length).toBeGreaterThan(0);
        const wrapperSuggestion = suggestions.find((s) => s.title.includes('AgentWrapper'));
        expect(wrapperSuggestion).toBeDefined();
        expect(wrapperSuggestion?.codeExample).toContain('useDualInterface');
      });
    });

    describe('API integration suggestions', () => {
      it('should suggest fixing authentication for 401 errors', () => {
        const error: SmugMugAppError = {
          errorId: 'test-3',
          message: 'API authentication failed',
          timestamp: Date.now(),
          category: 'api-integration',
          severity: 'critical',
          apiContext: {
            statusCode: 401,
          },
        };

        const suggestions = ErrorClassifier.generateFixSuggestions(error);

        const authSuggestion = suggestions.find((s) => s.title.includes('authentication'));
        expect(authSuggestion).toBeDefined();
        expect(authSuggestion?.description).toContain('credentials');
      });

      it('should suggest rate limiting for 429 errors', () => {
        const error: SmugMugAppError = {
          errorId: 'test-4',
          message: 'Rate limit exceeded',
          timestamp: Date.now(),
          category: 'api-integration',
          severity: 'high',
          apiContext: {
            statusCode: 429,
          },
        };

        const suggestions = ErrorClassifier.generateFixSuggestions(error);

        const rateLimitSuggestion = suggestions.find((s) => s.title.includes('rate limiting'));
        expect(rateLimitSuggestion).toBeDefined();
        expect(rateLimitSuggestion?.codeExample).toContain('retry');
      });
    });

    describe('Hook error suggestions', () => {
      it('should suggest adding missing dependencies', () => {
        const error: SmugMugAppError = {
          errorId: 'test-5',
          message: 'React Hook useEffect has a missing dependency',
          timestamp: Date.now(),
          category: 'hook-error',
          severity: 'medium',
        };

        const suggestions = ErrorClassifier.generateFixSuggestions(error);

        const depSuggestion = suggestions.find((s) => s.title.includes('dependencies'));
        expect(depSuggestion).toBeDefined();
        expect(depSuggestion?.automaticFix).toBe(true);
      });
    });

    describe('Data error suggestions', () => {
      it('should suggest null safety checks', () => {
        const error: SmugMugAppError = {
          errorId: 'test-6',
          message: 'Cannot read property of undefined',
          timestamp: Date.now(),
          category: 'data-error',
          severity: 'high',
        };

        const suggestions = ErrorClassifier.generateFixSuggestions(error);

        const nullSafetySuggestion = suggestions.find((s) => s.title.includes('null safety'));
        expect(nullSafetySuggestion).toBeDefined();
        expect(nullSafetySuggestion?.codeExample).toContain('?.'); // Optional chaining
      });
    });

    describe('Network error suggestions', () => {
      it('should suggest timeout adjustments', () => {
        const error: SmugMugAppError = {
          errorId: 'test-7',
          message: 'Request timeout exceeded',
          timestamp: Date.now(),
          category: 'network-error',
          severity: 'high',
        };

        const suggestions = ErrorClassifier.generateFixSuggestions(error);

        const timeoutSuggestion = suggestions.find((s) => s.title.includes('timeout'));
        expect(timeoutSuggestion).toBeDefined();
        expect(timeoutSuggestion?.codeExample).toContain('AbortController');
      });
    });
  });

  describe('Complex error classification', () => {
    it('should handle errors with both message and stack patterns', () => {
      const error: Partial<SmugMugAppError> = {
        message: 'Generic error message',
        stack: 'at agentActions.execute\nat SmugMugService.fetch',
      };

      const category = ErrorClassifier.classifyCategory(error);
      expect(category).toBe('agent-native'); // Stack takes precedence
    });

    it('should handle errors with agent context', () => {
      const error: Partial<SmugMugAppError> = {
        message: 'Unknown error',
        stack: '',
        agentContext: {
          registeredInterfaces: [],
          registeredActions: [],
          currentState: {},
        },
      };

      const category = ErrorClassifier.classifyCategory(error);
      expect(category).toBe('agent-native');
    });

    it('should handle errors with API context', () => {
      const error: Partial<SmugMugAppError> = {
        message: 'Unknown error',
        stack: '',
        apiContext: {
          endpoint: 'https://api.smugmug.com/photos',
          statusCode: 500,
        },
      };

      const category = ErrorClassifier.classifyCategory(error);
      expect(category).toBe('api-integration');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty error objects', () => {
      const error: Partial<SmugMugAppError> = {};

      expect(() => ErrorClassifier.classifyCategory(error)).not.toThrow();
      expect(() => ErrorClassifier.classifySeverity(error)).not.toThrow();
    });

    it('should handle null/undefined values', () => {
      const error: Partial<SmugMugAppError> = {
        message: undefined,
        stack: undefined,
      };

      expect(() => ErrorClassifier.classifyCategory(error)).not.toThrow();
      const category = ErrorClassifier.classifyCategory(error);
      expect(category).toBe('component-error'); // Default
    });
  });
});
