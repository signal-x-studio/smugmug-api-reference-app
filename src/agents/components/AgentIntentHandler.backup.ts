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
      // Enhanced pattern to catch more keyword variations
      pattern: /\b(?:sunset|beach|mountain|nature|landscape|portrait|wildlife|flower|city|ocean|forest|snow|rain|cloud|sky|water|animal|person|people|building|car|tree|field|garden|park|street|road|bridge|lake|river|night|day|morning|evening|vacation|travel|family|wedding|party|celebration|food|indoor|outdoor|summer|winter|spring|fall|autumn)\b/gi,
      confidence: 0.8
    },
    DATE: {
      // Improved date pattern with better extraction
      pattern: /\b((?:19|20)\d{2}-\d{2}-\d{2}|(?:19|20)\d{2}|\w+\s+(?:19|20)\d{2}|last\s+year|this\s+year|from\s+(?:19|20)\d{2})\b/gi,
      confidence: 0.9
    },
    LOCATION: {
      // Better location extraction
      pattern: /\b(?:in|from|at|taken\s+in)\s+([A-Z][a-zA-Z\s]{1,20})(?:\s|$|,|\.|!|\?)/gi,
      confidence: 0.7
    },
    ALBUM: {
      // Improved album pattern
      pattern: /(?:album\s+(?:called\s+)?([a-zA-Z][a-zA-Z0-9\s]{1,30})|([a-zA-Z][a-zA-Z0-9\s]{1,30})\s+album)/gi,
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
    const lowerQuery = query.toLowerCase();
    
    // Extract KEYWORD entities - direct pattern matching
    if (this.entityPatterns.KEYWORD.pattern) {
      this.entityPatterns.KEYWORD.pattern.lastIndex = 0; // Reset regex
      let match;
      while ((match = this.entityPatterns.KEYWORD.pattern.exec(lowerQuery)) !== null) {
        const value = match[0].trim();
        const start = match.index || 0;
        entities.push({
          type: 'KEYWORD' as EntityType,
          value,
          confidence: this.entityPatterns.KEYWORD.confidence,
          span: { start, end: start + value.length }
        });
      }
    }
    
    // Extract DATE entities - prioritize specific formats to avoid duplicates
    const datePatterns = [
      { pattern: /\b(\d{4}-\d{2}-\d{2})\b/g, priority: 1 }, // YYYY-MM-DD format (highest priority)
      { pattern: /\bfrom\s+(\d{4}-\d{2}-\d{2})\b/g, priority: 2 }, // from YYYY-MM-DD  
      { pattern: /\b(\d{4})\b/g, priority: 3 } // Just year (lowest priority)
    ];
    
    const foundDates = new Set<string>(); // Track found dates to avoid duplicates
    
    for (const { pattern, priority } of datePatterns) {
      pattern.lastIndex = 0;
      let match;
      while ((match = pattern.exec(query)) !== null) {
        const value = match[1];
        
        // Skip if we already found a higher priority date that contains this one
        const isSubstring = Array.from(foundDates).some(existing => 
          existing.includes(value) || value.includes(existing)
        );
        
        if (!isSubstring) {
          foundDates.add(value);
          const start = match.index || 0;
          entities.push({
            type: 'DATE' as EntityType,
            value,
            confidence: this.entityPatterns.DATE.confidence,
            span: { start, end: start + value.length }
          });
        }
      }
    }
    
    // Extract LOCATION entities
    if (this.entityPatterns.LOCATION.pattern) {
      this.entityPatterns.LOCATION.pattern.lastIndex = 0;
      let match;
      while ((match = this.entityPatterns.LOCATION.pattern.exec(query)) !== null) {
        const value = (match[1] || match[0]).trim();
        const start = match.index || 0;
        entities.push({
          type: 'LOCATION' as EntityType,
          value,
          confidence: this.entityPatterns.LOCATION.confidence,
          span: { start, end: start + value.length }
        });
      }
    }
    
    // Extract ALBUM entities - use single pattern to avoid duplicates
    const albumPattern = /(?:open\s+)?([a-zA-Z][a-zA-Z0-9\s]*?)\s+album/gi;
    let match; 
    
    while ((match = albumPattern.exec(query)) !== null) {
      let value = match[1].trim();
      
      const start = match.index + match[0].indexOf(value);
      entities.push({
        type: 'ALBUM' as EntityType,
        value,
        confidence: this.entityPatterns.ALBUM.confidence,
        span: { start, end: start + value.length }
      });
    }    return entities;
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
    // Enhanced keyword-based classification for better coverage
    const keywords = {
      search: ['show', 'pics', 'pictures', 'images', 'trip', 'find', 'look', 'locate', 'search'],
      filter: ['display', 'photographs', 'containing', 'imagery', 'sunset', 'filter', 'with', 'tagged'],
      navigate: ['open', 'go', 'navigate', 'album'],
      manage: ['delete', 'remove', 'edit', 'modify', 'upload', 'add', 'create']
    };
    
    const intentScores: Record<string, number> = {};
    
    // Initialize scores
    Object.keys(keywords).forEach(intent => {
      intentScores[intent] = 0;
    });
    
    // Score based on keyword presence
    for (const [intent, intentKeywords] of Object.entries(keywords)) {
      for (const keyword of intentKeywords) {
        if (cleanedQuery.includes(keyword)) {
          intentScores[intent] += 1;
        }
      }
    }
    
    // Score each intent based on pattern matches
    for (const [intent, patterns] of Object.entries(this.intentPatterns)) {
      for (const pattern of patterns) {
        if (pattern.test(cleanedQuery)) {
          intentScores[intent] += 2; // Pattern matches get higher weight
        }
      }
    }
    
    // Special handling for common phrases
    if (cleanedQuery.includes('show') && (cleanedQuery.includes('pics') || cleanedQuery.includes('photos'))) {
      intentScores.search += 2;
    }
    
    if (cleanedQuery.includes('display') && cleanedQuery.includes('containing')) {
      intentScores.filter += 2;
    }
    
    // Find the intent with the highest score
    const maxScore = Math.max(...Object.values(intentScores));
    
    if (maxScore === 0) {
      return 'unknown';
    }
    
    const bestIntent = Object.entries(intentScores)
      .find(([intent, score]) => score === maxScore)?.[0];
    
    return bestIntent || 'unknown';
  }

  /**
   * Calculate confidence score based on various factors
   */
  private calculateConfidence(intent: string, entities: Entity[], query: string): number {
    if (intent === 'unknown') {
      return 0;
    }
    
    let confidence = 0.4; // Base confidence for recognized intents
    
    // Boost confidence based on intent clarity
    if (intent !== 'unknown') {
      confidence += 0.2;
    }
    
    // Special handling for vague queries
    if (query.toLowerCase().includes('stuff') || query.toLowerCase().includes('things')) {
      confidence = 0.5; // Medium confidence for vague queries
    } else {
      // Boost confidence based on entity presence and quality
      if (entities.length > 0) {
        const avgEntityConfidence = entities.reduce((sum, e) => sum + e.confidence, 0) / entities.length;
        confidence += avgEntityConfidence * 0.2;
      }
      
      // Boost confidence for specific keywords
      const specificKeywords = ['filter', 'search', 'find', 'show', 'open', 'delete'];
      const hasSpecificKeyword = specificKeywords.some(keyword => 
        query.toLowerCase().includes(keyword)
      );
      
      if (hasSpecificKeyword) {
        confidence += 0.1;
      }
    }
    
    // Penalize very short or very long queries
    if (query.length < 5) {
      confidence -= 0.2;
    } else if (query.length > 200) {
      confidence -= 0.1;
    }
    
    // Ensure medium confidence for ambiguous but valid queries
    if (confidence < 0.3 && intent !== 'unknown') {
      confidence = 0.4; // Minimum medium confidence
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
    
    // For vague queries that got classified but need clarification
    if (entities.length === 0 && intent !== 'unknown') {
      questions.push('What type of photos would you like to see?');
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
  private async suggestActions(intent: string, parameters: Record<string, unknown>): Promise<AgentAction[]> {
    const actions: AgentAction[] = [];
    
    // Return actions for all recognized intents
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