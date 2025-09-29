import { SemanticQuery, Entity, EntityType } from '../interfaces/semantic-query';
import { AgentAction } from '../interfaces/agent-action';

/**
 * AgentIntentHandler provides natural language processing capabilities for photo management queries.
 * It classifies intents, extracts entities, and suggests appropriate actions.
 */
export class AgentIntentHandler {
  private readonly intentPatterns = {
    filter: [
      /\b(show|display|find|filter|get)\b.*\b(photo|picture|image|pic)s?\b.*\b(with|containing|of|tagged)\b/i,
      /\b(photo|picture|image|pic)s?\b.*\b(with|containing|of|tagged)\b/i,
      /\bfilter\b.*\bby\b/i,
    ],
    search: [
      /\b(search|find|look for|locate)\b.*\b(photo|picture|image|pic)s?\b/i,
      /\bfind\b.*\b(picture|photo|image|pic)s?\b/i,
    ],
    navigate: [
      /\b(open|go to|navigate to|show)\b.*\balbum\b/i,
      /\balbum\b.*\b(open|view|show)\b/i,
    ],
    manage: [
      /\b(delete|remove|edit|modify|rename|move)\b.*\b(photo|picture|image|pic|album)s?\b/i,
      /\b(upload|add|create)\b.*\b(photo|picture|image|pic|album)s?\b/i,
    ]
  };

  private readonly entityPatterns = {
    KEYWORD: {
      pattern: /\b(?:with|containing|of|tagged)\s+([a-zA-Z][a-zA-Z\s]*?)(?:\s+and\s+|\s*,\s*|\s+photo|\s+picture|\s+image|\s*$)/gi,
      confidence: 0.8
    },
    DATE: {
      pattern: /\b(\d{4}-\d{2}-\d{2}|\d{4}|\w+\s+\d{4}|last\s+year|this\s+year)\b/gi,
      confidence: 0.9
    },
    LOCATION: {
      pattern: /\b(?:in|from|at)\s+([A-Z][a-zA-Z\s]*?)(?:\s+photo|\s+picture|\s+image|\s*$|\s+and|\s*,)/gi,
      confidence: 0.7
    },
    ALBUM: {
      pattern: /\balbum\s+([a-zA-Z][a-zA-Z0-9\s]*?)(?:\s*$|\s+photo|\s+picture|\s+image)/gi,
      confidence: 0.85
    }
  };

  private readonly fillerWords = ['um', 'uh', 'er', 'ah', 'like', 'you know', 'please', 'hey', 'can', 'could', 'would'];

  /**
   * Classifies the intent of a natural language query and extracts relevant information
   */
  async classifyIntent(query: string): Promise<SemanticQuery> {
    // Handle null/undefined input
    if (!query || typeof query !== 'string') {
      return this.createUnknownIntent(query || '');
    }

    // Clean and normalize the query
    const cleanedQuery = this.cleanQuery(query);
    
    // Handle empty queries after cleaning
    if (!cleanedQuery.trim()) {
      return this.createUnknownIntent(query);
    }

    // Classify the main intent
    const intent = this.classifyMainIntent(cleanedQuery);
    
    // Extract entities from the query
    const entities = this.extractEntities(cleanedQuery);
    
    // Calculate confidence based on intent clarity and entity presence
    const confidence = this.calculateConfidence(intent, entities, cleanedQuery);
    
    // Check if clarification is needed
    const needsClarification = this.checkNeedsClarification(intent, entities, confidence);
    
    // Generate clarification questions if needed
    const clarificationQuestions = needsClarification ? 
      this.generateClarificationQuestions(intent, entities) : undefined;
    
    // Extract parameters for action execution
    const parameters = this.extractParameters(entities);
    
    // Suggest relevant actions
    const suggestedActions = await this.suggestActions(intent, parameters);

    return {
      intent,
      entities,
      confidence,
      parameters,
      suggestedActions,
      originalQuery: query,
      needsClarification,
      clarificationQuestions
    };
  }

  /**
   * Extracts entities from a query text
   */
  extractEntities(query: string): Entity[] {
    const entities: Entity[] = [];
    
    // Extract each type of entity
    for (const [entityType, config] of Object.entries(this.entityPatterns)) {
      const matches = Array.from(query.matchAll(config.pattern));
      
      for (const match of matches) {
        if (match[1]) {
          const value = match[1].trim();
          const start = match.index! + match[0].indexOf(match[1]);
          const end = start + match[1].length;
          
          // Handle special cases for keywords (split on 'and')
          if (entityType === 'KEYWORD' && value.includes(' and ')) {
            const keywords = value.split(' and ').map(k => k.trim()).filter(k => k);
            keywords.forEach((keyword, index) => {
              entities.push({
                type: entityType as EntityType,
                value: keyword,
                confidence: config.confidence - (index * 0.05), // Slightly lower confidence for later keywords
                span: { start: start + index * 10, end: start + index * 10 + keyword.length } // Approximate spans
              });
            });
          } else {
            entities.push({
              type: entityType as EntityType,
              value,
              confidence: config.confidence,
              span: { start, end }
            });
          }
        }
      }
    }

    return entities;
  }

  /**
   * Clean and normalize the query text
   */
  private cleanQuery(query: string): string {
    // Remove extra whitespace
    let cleaned = query.trim().replace(/\s+/g, ' ');
    
    // Remove common filler words for better intent classification
    const words = cleaned.split(' ');
    const filteredWords = words.filter(word => 
      !this.fillerWords.includes(word.toLowerCase().replace(/[.,!?]$/, ''))
    );
    
    return filteredWords.join(' ').toLowerCase();
  }

  /**
   * Classify the main intent from the cleaned query
   */
  private classifyMainIntent(cleanedQuery: string): string {
    const intentScores: Record<string, number> = {};
    
    // Score each intent based on pattern matches
    for (const [intent, patterns] of Object.entries(this.intentPatterns)) {
      intentScores[intent] = 0;
      
      for (const pattern of patterns) {
        if (pattern.test(cleanedQuery)) {
          intentScores[intent] += 1;
        }
      }
    }
    
    // Find the intent with the highest score
    const maxScore = Math.max(...Object.values(intentScores));
    
    if (maxScore === 0) {
      return 'unknown';
    }

    if (cleanedQuery.includes('find') && !cleanedQuery.includes('with')) {
      return 'search';
    }
    
    const bestIntent = Object.entries(intentScores)
      .find(([_, score]) => score === maxScore)?.[0];
    
    return bestIntent || 'unknown';
  }

  /**
   * Calculate confidence score based on various factors
   */
  private calculateConfidence(intent: string, entities: Entity[], query: string): number {
    if (intent === 'unknown') {
      return 0;
    }
    
    let confidence = 0.5; // Base confidence
    
    // Boost confidence based on intent clarity
    if (intent !== 'unknown') {
      confidence += 0.3;
    }
    
    // Boost confidence based on entity presence and quality
    if (entities.length > 0) {
      const avgEntityConfidence = entities.reduce((sum, e) => sum + e.confidence, 0) / entities.length;
      confidence += avgEntityConfidence * 0.3;
    }
    
    // Boost confidence for specific keywords
    const specificKeywords = ['filter', 'search', 'find', 'show', 'open', 'delete'];
    const hasSpecificKeyword = specificKeywords.some(keyword => 
      query.toLowerCase().includes(keyword)
    );
    
    if (hasSpecificKeyword) {
      confidence += 0.2;
    }
    
    // Penalize very short or very long queries
    if (query.length < 5) {
      confidence -= 0.3;
    } else if (query.length > 200) {
      confidence -= 0.1;
    }
    
    return Math.min(1.0, Math.max(0.0, confidence));
  }

  /**
   * Check if the query needs clarification
   */
  private checkNeedsClarification(intent: string, entities: Entity[], confidence: number): boolean {
    // Need clarification if confidence is low
    if (confidence < 0.6) {
      return true;
    }
    
    // Need clarification if intent is clear but lacks specific entities
    if ((intent === 'filter' || intent === 'search') && entities.length === 0) {
      return true;
    }
    
    return false;
  }

  /**
   * Generate clarification questions based on the intent and entities
   */
  private generateClarificationQuestions(intent: string, entities: Entity[]): string[] {
    const questions: string[] = [];
    
    if (intent === 'unknown') {
      questions.push('I didn\'t understand that. Could you please rephrase your request?');
      return questions;
    }
    
    if (intent === 'filter' || intent === 'search') {
      if (entities.length === 0) {
        questions.push('What type of photos would you like to see?');
        questions.push('Are you looking for photos with specific keywords, from a certain date, or location?');
      }
    }
    
    if (intent === 'navigate') {
      const hasAlbum = entities.some(e => e.type === 'ALBUM');
      if (!hasAlbum) {
        questions.push('Which album would you like to open?');
      }
    }
    
    return questions;
  }

  /**
   * Extract parameters from entities for action execution
   */
  private extractParameters(entities: Entity[]): Record<string, any> {
    const parameters: Record<string, any> = {};
    
    // Group entities by type
    const entityGroups: Record<string, string[]> = {};
    for (const entity of entities) {
      if (!entityGroups[entity.type]) {
        entityGroups[entity.type] = [];
      }
      entityGroups[entity.type].push(entity.value);
    }
    
    // Convert to parameter format
    if (entityGroups.KEYWORD) {
      parameters.keywords = entityGroups.KEYWORD;
    }
    
    if (entityGroups.DATE) {
      parameters.dates = entityGroups.DATE;
    }
    
    if (entityGroups.LOCATION) {
      parameters.locations = entityGroups.LOCATION;
    }
    
    if (entityGroups.ALBUM) {
      parameters.albums = entityGroups.ALBUM;
    }
    
    return parameters;
  }

  /**
   * Suggest relevant actions based on intent and parameters
   */
  private async suggestActions(intent: string, parameters: Record<string, any>): Promise<AgentAction[]> {
    const actions: AgentAction[] = [];
    
    // Mock action suggestions based on intent
    switch (intent) {
      case 'filter':
        actions.push({
          id: 'photo-gallery.filter',
          name: 'Filter Photos',
          description: 'Filter photos by specified criteria',
          parameters: [
            {
              name: 'keywords',
              type: 'array',
              required: false,
              description: 'Keywords to filter by'
            },
            {
              name: 'dates', 
              type: 'array',
              required: false,
              description: 'Date ranges to filter by'
            }
          ],
          returns: {
            type: 'object',
            description: 'Filtered photo results'
          },
          permissions: ['read'],
          humanEquivalent: 'Use the filter controls in the photo gallery',
          examples: []
        });
        break;
        
      case 'search':
        actions.push({
          id: 'photo-gallery.search',
          name: 'Search Photos',
          description: 'Search for photos using text query',
          parameters: [
            {
              name: 'query',
              type: 'string',
              required: true,
              description: 'Search query text'
            }
          ],
          returns: {
            type: 'object',
            description: 'Search results'
          },
          permissions: ['read'],
          humanEquivalent: 'Use the search box',
          examples: []
        });
        
        actions.push({
          id: 'photo-gallery.filter',
          name: 'Filter Photos',
          description: 'Filter photos by specified criteria',
          parameters: [
            {
              name: 'keywords',
              type: 'array',
              required: false,
              description: 'Keywords to filter by'
            }
          ],
          returns: {
            type: 'object',
            description: 'Filtered photo results'
          },
          permissions: ['read'],
          humanEquivalent: 'Use the filter controls in the photo gallery',
          examples: []
        });
        break;
        
      case 'navigate':
        actions.push({
          id: 'album-list.navigate',
          name: 'Navigate to Album',
          description: 'Open and navigate to a specific album',
          parameters: [
            {
              name: 'albumId',
              type: 'string',
              required: true,
              description: 'ID or name of the album to open'
            }
          ],
          returns: {
            type: 'object',
            description: 'Album contents'
          },
          permissions: ['read'],
          humanEquivalent: 'Click on album in the album list',
          examples: []
        });
        break;
        
      case 'manage':
        actions.push({
          id: 'photo-manager.delete',
          name: 'Delete Photo',
          description: 'Delete selected photo(s)',
          parameters: [
            {
              name: 'photoIds',
              type: 'array',
              required: true,
              description: 'IDs of photos to delete'
            }
          ],
          returns: {
            type: 'object',
            description: 'Deletion result'
          },
          permissions: ['write', 'delete'],
          humanEquivalent: 'Select photos and click delete button',
          examples: []
        });
        break;
    }
    
    return actions;
  }

  /**
   * Create an unknown intent response
   */
  private createUnknownIntent(query: string): SemanticQuery {
    return {
      intent: 'unknown',
      entities: [],
      confidence: 0,
      parameters: {},
      suggestedActions: [],
      originalQuery: query,
      needsClarification: true,
      clarificationQuestions: [
        'I didn\'t understand that. Could you please rephrase your request?',
        'Try asking me to filter photos, search for images, or navigate to an album.'
      ]
    };
  }
}