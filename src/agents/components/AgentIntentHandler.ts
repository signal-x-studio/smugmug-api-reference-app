import { SemanticQuery, Entity } from '../interfaces/semantic-query';
import { AgentEntityExtractor } from './AgentEntityExtractor';
import { AgentIntentClassifier } from './AgentIntentClassifier';
import { AgentConfidenceCalculator } from './AgentConfidenceCalculator';
import { AgentActionSuggester } from './AgentActionSuggester';

/**
 * Refactored AgentIntentHandler - Main orchestrator class under 200 lines
 * 
 * Coordinates natural language processing by delegating to specialized classes:
 * - AgentEntityExtractor: Extracts entities (dates, locations, keywords, albums)
 * - AgentIntentClassifier: Classifies user intent (search, filter, navigate, manage)
 * - AgentConfidenceCalculator: Calculates confidence scores and clarification needs
 * - AgentActionSuggester: Suggests appropriate actions based on intent
 */
export class AgentIntentHandler {
  private entityExtractor: AgentEntityExtractor;
  private intentClassifier: AgentIntentClassifier;
  private confidenceCalculator: AgentConfidenceCalculator;
  private actionSuggester: AgentActionSuggester;

  constructor() {
    this.entityExtractor = new AgentEntityExtractor();
    this.intentClassifier = new AgentIntentClassifier();
    this.confidenceCalculator = new AgentConfidenceCalculator();
    this.actionSuggester = new AgentActionSuggester();
  }

  /**
   * Main entry point - classifies user intent and provides comprehensive analysis
   */
  async classifyIntent(query: string): Promise<SemanticQuery> {
    if (!query?.trim()) {
      return this.createUnknownResult(query);
    }

    // Extract entities from query
    const entities = this.entityExtractor.extractEntities(query);
    
    // Classify the main intent
    const intent = this.intentClassifier.classifyIntent(query);
    
    // Calculate confidence score
    const confidence = this.confidenceCalculator.calculateConfidence(intent, entities, query);
    
    // Check if clarification is needed
    const needsClarification = this.confidenceCalculator.checkNeedsClarification(
      intent, 
      entities, 
      confidence
    );
    
    // Generate clarification questions if needed
    const clarificationQuestions = needsClarification 
      ? this.confidenceCalculator.generateClarificationQuestions(intent, entities)
      : [];
    
    // Extract parameters from entities
    const parameters = this.entityExtractor.extractParameters(entities);
    
    // Suggest relevant actions
    const suggestedActions = await this.actionSuggester.suggestActions(intent);

    return {
      intent,
      confidence,
      entities,
      parameters,
      needsClarification,
      clarificationQuestions,
      suggestedActions,
      originalQuery: query
    };
  }

  /**
   * Public entity extraction method for external use
   */
  extractEntities(query: string): Entity[] {
    return this.entityExtractor.extractEntities(query);
  }

  /**
   * Creates standardized result for unknown/invalid queries
   */
  private createUnknownResult(query: string): SemanticQuery {
    return {
      intent: 'unknown',
      confidence: 0,
      entities: [],
      parameters: {},
      needsClarification: true,
      clarificationQuestions: ['Could you please clarify what you want to do?'],
      suggestedActions: [],
      originalQuery: query || ''
    };
  }

  /**
   * Health check method for testing
   */
  isHealthy(): boolean {
    return !!(
      this.entityExtractor &&
      this.intentClassifier &&
      this.confidenceCalculator &&
      this.actionSuggester
    );
  }

  /**
   * Get handler version for debugging
   */
  getVersion(): string {
    return '2.0.0-refactored';
  }

  /**
   * Get processing statistics
   */
  getStats(): Record<string, unknown> {
    return {
      version: this.getVersion(),
      components: {
        entityExtractor: !!this.entityExtractor,
        intentClassifier: !!this.intentClassifier,
        confidenceCalculator: !!this.confidenceCalculator,
        actionSuggester: !!this.actionSuggester
      },
      healthy: this.isHealthy()
    };
  }
}