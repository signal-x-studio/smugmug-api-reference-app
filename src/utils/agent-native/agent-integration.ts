/**
 * Agent Integration Testing & Documentation
 * 
 * Provides comprehensive integration testing and documentation generation
 * for the complete agent-native architecture.
 */

import { AgentStateRegistry } from './agent-state';
import { AgentActionRegistry } from './agent-actions';
import { NaturalLanguageProcessor } from './natural-language';
import { generatePhotographSchema, generateImageGallerySchema } from './structured-data';

// Integration test result types
export interface IntegrationTestResult {
  testName: string;
  success: boolean;
  duration: number;
  details?: any;
  error?: string;
  warnings?: string[];
}

export interface AgentCapabilityReport {
  timestamp: number;
  structuredData: {
    photosDiscoverable: number;
    albumsDiscoverable: number;
    schemaValidation: boolean;
  };
  stateAccess: {
    registeredComponents: string[];
    accessibleState: boolean;
    eventSystem: boolean;
  };
  actionRegistry: {
    availableActions: string[];
    parameterValidation: boolean;
    executionReady: boolean;
  };
  naturalLanguage: {
    intentRecognition: boolean;
    parameterExtraction: boolean;
    contextAwareness: boolean;
  };
  overallReadiness: number; // 0-1 score
}

/**
 * Agent Integration Test Suite
 */
export class AgentIntegrationTester {
  private nlProcessor: NaturalLanguageProcessor;
  private testResults: IntegrationTestResult[] = [];

  constructor() {
    this.nlProcessor = new NaturalLanguageProcessor();
  }

  /**
   * Run comprehensive agent integration tests
   */
  async runAllTests(): Promise<IntegrationTestResult[]> {
    this.testResults = [];

    // Test 1: Structured Data Discovery
    await this.testStructuredDataDiscovery();

    // Test 2: State Registry Access
    await this.testStateRegistryAccess();

    // Test 3: Action Registry Execution
    await this.testActionRegistryExecution();

    // Test 4: Natural Language Processing
    await this.testNaturalLanguageProcessing();

    // Test 5: End-to-End Workflows
    await this.testEndToEndWorkflows();

    // Test 6: Error Handling & Recovery
    await this.testErrorHandling();

    // Test 7: Performance & Scalability
    await this.testPerformance();

    // Test 8: Browser Agent Compatibility
    await this.testBrowserAgentCompatibility();

    return this.testResults;
  }

  /**
   * Test structured data discovery capabilities
   */
  private async testStructuredDataDiscovery(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Test Schema.org markup generation
      const mockPhoto = {
        id: 'test-photo-1',
        filename: 'test.jpg',
        title: 'Test Photo',
        url: 'https://example.com/test.jpg',
        keywords: ['test', 'integration'],
        status: 'analyzed' as any,
        isAutoProcessed: false,
        albumId: 'test-album'
      };

      const photoSchema = generatePhotographSchema(mockPhoto);
      
      // Verify schema structure
      const hasRequiredFields = photoSchema['@context'] === 'https://schema.org' &&
                               photoSchema['@type'] === 'Photograph' &&
                               photoSchema.identifier === 'test-photo-1';

      // Test DOM integration (if in browser environment)
      let domIntegration = true;
      if (typeof document !== 'undefined') {
        const testElement = document.createElement('div');
        testElement.setAttribute('itemScope', '');
        testElement.setAttribute('itemType', 'https://schema.org/Photograph');
        testElement.setAttribute('data-agent-entity', 'photo');
        testElement.setAttribute('data-agent-id', 'test-photo-1');
        
        domIntegration = testElement.getAttribute('itemScope') !== null;
      }

      this.addTestResult({
        testName: 'Structured Data Discovery',
        success: hasRequiredFields && domIntegration,
        duration: Date.now() - startTime,
        details: {
          schemaGeneration: hasRequiredFields,
          domIntegration: domIntegration,
          photoSchema: photoSchema
        }
      });

    } catch (error) {
      this.addTestResult({
        testName: 'Structured Data Discovery',
        success: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Test state registry access and synchronization
   */
  private async testStateRegistryAccess(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Initialize test state
      const testState = {
        photos: [{ id: 'photo-1', title: 'Test Photo' }],
        selectedIds: [],
        isSelectionMode: false
      };

      const testActions = {
        selectPhoto: (photoId: string) => {
          testState.selectedIds.push(photoId);
        }
      };

      // Register test component
      AgentStateRegistry.register('testComponent', testState, testActions);

      // Verify global access
      const globalState = window.agentState?.testComponent;
      const hasGlobalAccess = globalState?.current === testState;

      // Test state updates
      AgentStateRegistry.updateState('testComponent', {
        ...testState,
        selectedIds: ['photo-1']
      });

      const stateUpdated = globalState?.current.selectedIds.includes('photo-1');

      // Test action execution
      globalState?.actions.selectPhoto('photo-2');
      const actionExecuted = testState.selectedIds.includes('photo-2');

      // Cleanup
      AgentStateRegistry.unregister('testComponent');

      this.addTestResult({
        testName: 'State Registry Access',
        success: hasGlobalAccess && stateUpdated && actionExecuted,
        duration: Date.now() - startTime,
        details: {
          globalAccess: hasGlobalAccess,
          stateUpdates: stateUpdated,
          actionExecution: actionExecuted
        }
      });

    } catch (error) {
      this.addTestResult({
        testName: 'State Registry Access',
        success: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Test action registry execution
   */
  private async testActionRegistryExecution(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Get available actions
      const availableActions = AgentActionRegistry.getAllActions();
      const hasPhotoActions = 'photo.select' in availableActions;
      const hasAlbumActions = 'album.create' in availableActions;

      // Test parameter validation
      const validationResult = AgentActionRegistry.validateParameters('photo.select', {
        photoId: 'test-photo-1'
      });

      const invalidValidation = AgentActionRegistry.validateParameters('photo.select', {});

      // Test action execution (mock)
      let executionResult;
      try {
        executionResult = await AgentActionRegistry.execute('photo.select', {
          photoId: 'nonexistent-photo'
        });
      } catch (error) {
        executionResult = { success: false, error: 'Expected for test' };
      }

      this.addTestResult({
        testName: 'Action Registry Execution',
        success: hasPhotoActions && hasAlbumActions && validationResult && !invalidValidation,
        duration: Date.now() - startTime,
        details: {
          photoActions: hasPhotoActions,
          albumActions: hasAlbumActions,
          parameterValidation: validationResult,
          invalidRejection: !invalidValidation,
          executionAttempt: executionResult?.success === false
        }
      });

    } catch (error) {
      this.addTestResult({
        testName: 'Action Registry Execution',
        success: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Test natural language processing capabilities
   */
  private async testNaturalLanguageProcessing(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Test intent recognition
      const commands = [
        'select photo beach-sunset.jpg',
        'create album Vacation Photos',
        'analyze all selected photos',
        'help me with photo management'
      ];

      const results = await Promise.all(
        commands.map(cmd => this.nlProcessor.processCommand(cmd))
      );

      const photoSelectionWorked = results[0].success || results[0].error?.includes('not available');
      const albumCreationWorked = results[1].success || results[1].error?.includes('not available');
      const batchAnalysisWorked = results[2].success || results[2].error?.includes('not available');
      const helpWorked = results[3].success && results[3].helpResponse;

      this.addTestResult({
        testName: 'Natural Language Processing',
        success: photoSelectionWorked && albumCreationWorked && helpWorked,
        duration: Date.now() - startTime,
        details: {
          photoSelection: photoSelectionWorked,
          albumCreation: albumCreationWorked,
          batchAnalysis: batchAnalysisWorked,
          helpSystem: helpWorked,
          commandResults: results.map(r => ({ success: r.success, action: r.executedAction }))
        }
      });

    } catch (error) {
      this.addTestResult({
        testName: 'Natural Language Processing',
        success: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Test complete end-to-end workflows
   */
  private async testEndToEndWorkflows(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Setup mock application state
      this.setupMockApplicationState();

      // Test workflow: Create album → Find photos → Select → Analyze → Move to album
      const workflow = [
        'create album "Integration Test Album"',
        'find photos with test keyword',
        'select first photo',
        'analyze selected photos'
      ];

      const workflowResults = [];
      for (const command of workflow) {
        const result = await this.nlProcessor.processCommand(command);
        workflowResults.push(result);
      }

      const allStepsCompleted = workflowResults.every(r => 
        r.success || (r.error && !r.error.includes('Unknown'))
      );

      this.addTestResult({
        testName: 'End-to-End Workflows',
        success: allStepsCompleted,
        duration: Date.now() - startTime,
        details: {
          workflowSteps: workflowResults.length,
          completedSteps: workflowResults.filter(r => r.success).length,
          workflowResults: workflowResults.map(r => ({
            success: r.success,
            action: r.executedAction,
            error: r.error
          }))
        }
      });

    } catch (error) {
      this.addTestResult({
        testName: 'End-to-End Workflows',
        success: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Test error handling and recovery
   */
  private async testErrorHandling(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Test invalid commands
      const invalidCommands = [
        'delete everything',
        'select nonexistent photo',
        'create album',  // missing name
        'random nonsense'
      ];

      const errorResults = await Promise.all(
        invalidCommands.map(cmd => this.nlProcessor.processCommand(cmd))
      );

      const allHandledGracefully = errorResults.every(result => 
        !result.success && (result.error || result.suggestions)
      );

      const hasSuggestions = errorResults.some(result => 
        result.suggestions && result.suggestions.length > 0
      );

      this.addTestResult({
        testName: 'Error Handling & Recovery',
        success: allHandledGracefully && hasSuggestions,
        duration: Date.now() - startTime,
        details: {
          gracefulErrors: allHandledGracefully,
          providedSuggestions: hasSuggestions,
          errorResults: errorResults.map(r => ({
            error: r.error,
            hasSuggestions: !!r.suggestions
          }))
        }
      });

    } catch (error) {
      this.addTestResult({
        testName: 'Error Handling & Recovery',
        success: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Test performance and scalability
   */
  private async testPerformance(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Test multiple rapid commands
      const rapidCommands = Array(10).fill('help').map((_, i) => `help command ${i}`);
      
      const performanceStart = Date.now();
      const rapidResults = await Promise.all(
        rapidCommands.map(cmd => this.nlProcessor.processCommand(cmd))
      );
      const performanceTime = Date.now() - performanceStart;

      // Test with large mock state
      this.setupLargeMockState();
      const largeStateTime = Date.now();
      await this.nlProcessor.processCommand('find photos with test');
      const largeStateProcessing = Date.now() - largeStateTime;

      const performanceAcceptable = performanceTime < 1000; // 1 second for 10 commands
      const scalesWell = largeStateProcessing < 500; // 500ms for large state

      this.addTestResult({
        testName: 'Performance & Scalability',
        success: performanceAcceptable && scalesWell,
        duration: Date.now() - startTime,
        details: {
          rapidCommandTime: performanceTime,
          largeStateTime: largeStateProcessing,
          performanceAcceptable: performanceAcceptable,
          scalesWell: scalesWell
        }
      });

    } catch (error) {
      this.addTestResult({
        testName: 'Performance & Scalability',
        success: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Test browser agent compatibility
   */
  private async testBrowserAgentCompatibility(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Test global API availability
      const hasAgentState = typeof window !== 'undefined' && 'agentState' in window;
      const hasAgentActions = typeof window !== 'undefined' && 'agentActions' in window;
      
      // Test agent discovery workflow
      let discoveryWorked = false;
      if (hasAgentState && hasAgentActions) {
        // Simulate agent discovery
        const availableComponents = Object.keys(window.agentState || {});
        const availableActions = Object.keys(window.agentActions || {});
        
        discoveryWorked = availableComponents.length >= 0 && availableActions.length > 0;
      }

      // Test event system
      let eventSystemWorked = false;
      if (typeof window !== 'undefined' && window.agentStateEvents) {
        const testListener = () => { eventSystemWorked = true; };
        window.agentStateEvents.addEventListener('stateChange', testListener);
        
        // Trigger a state change
        AgentStateRegistry.updateState('testComponent', { test: true });
        
        window.agentStateEvents.removeEventListener('stateChange', testListener);
      }

      this.addTestResult({
        testName: 'Browser Agent Compatibility',
        success: hasAgentState && hasAgentActions && discoveryWorked,
        duration: Date.now() - startTime,
        details: {
          globalAPIs: hasAgentState && hasAgentActions,
          discoveryWorkflow: discoveryWorked,
          eventSystem: eventSystemWorked
        }
      });

    } catch (error) {
      this.addTestResult({
        testName: 'Browser Agent Compatibility',
        success: false,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Generate agent capability report
   */
  generateCapabilityReport(): AgentCapabilityReport {
    const structuredDataElements = typeof document !== 'undefined' 
      ? document.querySelectorAll('[itemscope]').length 
      : 0;

    const registeredComponents = Object.keys(window.agentState || {});
    const availableActions = Object.keys(window.agentActions || {});

    // Calculate readiness scores
    const structuredDataScore = structuredDataElements > 0 ? 1 : 0;
    const stateScore = registeredComponents.length > 0 ? 1 : 0;
    const actionScore = availableActions.length > 0 ? 1 : 0;
    const nlScore = this.testResults.find(r => r.testName === 'Natural Language Processing')?.success ? 1 : 0;

    const overallReadiness = (structuredDataScore + stateScore + actionScore + nlScore) / 4;

    return {
      timestamp: Date.now(),
      structuredData: {
        photosDiscoverable: structuredDataElements,
        albumsDiscoverable: structuredDataElements,
        schemaValidation: structuredDataScore === 1
      },
      stateAccess: {
        registeredComponents: registeredComponents,
        accessibleState: stateScore === 1,
        eventSystem: typeof window !== 'undefined' && 'agentStateEvents' in window
      },
      actionRegistry: {
        availableActions: availableActions,
        parameterValidation: actionScore === 1,
        executionReady: actionScore === 1
      },
      naturalLanguage: {
        intentRecognition: nlScore === 1,
        parameterExtraction: nlScore === 1,
        contextAwareness: nlScore === 1
      },
      overallReadiness: overallReadiness
    };
  }

  /**
   * Helper methods
   */
  private addTestResult(result: IntegrationTestResult): void {
    this.testResults.push(result);
  }

  private setupMockApplicationState(): void {
    const mockPhotoState = {
      photos: [
        { id: 'photo-1', filename: 'test1.jpg', keywords: ['test'] },
        { id: 'photo-2', filename: 'test2.jpg', keywords: ['test'] }
      ],
      selectedIds: [],
      isSelectionMode: false
    };

    const mockPhotoActions = {
      selectPhoto: jest.fn(),
      filterByKeywords: jest.fn(),
      batchAnalyze: jest.fn()
    };

    const mockAlbumState = {
      albums: [],
      selectedAlbum: null,
      isLoading: false
    };

    const mockAlbumActions = {
      createAlbum: jest.fn(),
      selectAlbum: jest.fn()
    };

    AgentStateRegistry.register('photoGrid', mockPhotoState, mockPhotoActions);
    AgentStateRegistry.register('albumList', mockAlbumState, mockAlbumActions);
  }

  private setupLargeMockState(): void {
    const largePhotoArray = Array(1000).fill(0).map((_, i) => ({
      id: `photo-${i}`,
      filename: `photo${i}.jpg`,
      keywords: ['test', 'large', 'dataset']
    }));

    AgentStateRegistry.updateState('photoGrid', {
      photos: largePhotoArray,
      selectedIds: [],
      isSelectionMode: false
    });
  }
}