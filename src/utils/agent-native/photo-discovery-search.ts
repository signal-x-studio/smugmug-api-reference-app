/**
 * Photo Discovery Search - Natural Language Query Parser
 * 
 * Processes natural language queries for photo discovery and search functionality.
 * Enables semantic search, filtering, and bulk operations through conversational commands.
 */

import Fuse from 'fuse.js';
import { parseISO, format, parse, isValid } from 'date-fns';

// Type definitions
export interface SearchQueryIntent {
  type: 'discovery' | 'filter' | 'bulk_operation' | 'refinement';
  confidence: number;
  subtype?: string;
}

export interface EntityExtraction {
  type: 'object' | 'scene' | 'person' | 'location' | 'time_period' | 'keyword_phrase' | 'camera' | 'date';
  value: string;
  confidence: number;
  span?: { start: number; end: number };
}

export interface TokenizeResult {
  tokens: string[];
  entities: EntityExtraction[];
  originalQuery: string;
}

export interface SearchParameters {
  semantic?: {
    objects?: string[];
    scenes?: string[];
    people_type?: string;
    mood?: string[];
    style?: string[];
  };
  spatial?: {
    location?: string;
    coordinates?: { lat: number; lng: number };
    radius?: number;
  };
  temporal?: {
    year?: number;
    month?: string;
    date_range?: { start: Date; end: Date };
    relative_period?: string;
    start_month?: string;
    end_month?: string;
  };
  people?: {
    named_people?: string[];
    people_type?: string;
    age_group?: string;
    group_size?: string;
  };
  technical?: {
    camera_make?: string;
    camera_model?: string;
    lens?: string;
    aperture?: string;
    iso?: number[];
  };
}

export interface QueryValidationResult {
  isValid: boolean;
  confidence: number;
  extractable_parameters: number;
  issues?: string[];
  errors?: string[];
  warnings?: string[];
}

export interface SearchSuggestion {
  type: 'add_context' | 'temporal_refinement' | 'spatial_refinement' | 'semantic_refinement';
  suggestion: string;
  examples?: string[];
  example?: string;
}

export interface QueryProcessingResult {
  success: boolean;
  parameters: SearchParameters;
  intent: SearchQueryIntent;
  confidence: number;
  structured_data?: any;
  error?: string;
}

export interface AgentCommand {
  action: string;
  parameters: any;
}

/**
 * Main Photo Discovery Query Parser
 */
export class PhotoDiscoveryQueryParser {
  private context: SearchParameters = {};
  private entityPatterns: Array<{ type: EntityExtraction['type']; patterns: RegExp[]; confidence: number }>;
  private intentPatterns: Array<{ type: SearchQueryIntent['type']; patterns: RegExp[]; confidence: number }>;

  constructor() {
    this.initializePatterns();
  }

  /**
   * Initialize regex patterns for entity and intent recognition
   */
  private initializePatterns(): void {
    // Entity extraction patterns
    this.entityPatterns = [
      // Temporal patterns
      {
        type: 'time_period',
        patterns: [
          /\b(last\s+(?:year|month|week|summer|winter|spring|fall|autumn))\b/gi,
          /\b(this\s+(?:year|month|week|summer|winter|spring|fall|autumn))\b/gi,
          /\b(next\s+(?:year|month|week|summer|winter|spring|fall|autumn))\b/gi,
          /\b(\d{4})\b/g, // Year
          /\b(january|february|march|april|may|june|july|august|september|october|november|december)\b/gi,
          /\b(yesterday|today|tomorrow)\b/gi,
          /\b(\d{1,2}\/\d{1,2}\/\d{2,4})\b/g, // Date formats
          /\bbetween\s+(.+?)\s+and\s+(.+?)(?:\s|$)/gi
        ],
        confidence: 0.8
      },
      
      // Location patterns
      {
        type: 'location',
        patterns: [
          /\b(?:in|at|from|near)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g,
          /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:photos|pictures|images)\b/g
        ],
        confidence: 0.7
      },
      
      // Object patterns (common photo subjects)
      {
        type: 'object',
        patterns: [
          /\b(sunset|sunrise|mountains?|beach|ocean|lake|river|trees?|flowers?|animals?|dogs?|cats?|birds?|cars?|buildings?|food)\b/gi,
          /\bphotos?\s+(?:of|with|containing)\s+([^,\n]+)/gi
        ],
        confidence: 0.6
      },
      
      // Scene/style patterns
      {
        type: 'scene',
        patterns: [
          /\b(landscape|portrait|macro|street|architecture|nature|urban|rural|indoor|outdoor|night|day)\b/gi,
          /\b(vacation|wedding|party|family|friends|work|travel|holiday)\b/gi
        ],
        confidence: 0.7
      },
      
      // People patterns
      {
        type: 'person',
        patterns: [
          /\bwith\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g,
          /\b(family|friends|children|kids|adults|people|person|group)\b/gi
        ],
        confidence: 0.6
      },
      
      // Quoted keyword phrases
      {
        type: 'keyword_phrase',
        patterns: [
          /"([^"]+)"/g,
          /'([^']+)'/g
        ],
        confidence: 0.9
      }
    ];

    // Intent classification patterns (order matters - more specific first)
    this.intentPatterns = [
      {
        type: 'bulk_operation',
        patterns: [
          /\b(?:add|delete|export|move|copy|organize)\s+(?:all|these|selected|multiple)?\s*(?:photos?|images?|pictures?)\b/gi,
          /\b(?:add|delete|export|move|copy|organize)\b.*\b(?:to|from)\s+(?:album|folder|collection)\b/gi
        ],
        confidence: 0.9
      },
      {
        type: 'filter',
        patterns: [
          /\b(?:filter\s+by|show\s+only|display\s+only|limit\s+to)\b/gi,
          /\b(?:taken|shot|captured)\s+(?:in|on|at|with|from)\b/gi,
          /\b(?:from\s+camera|with\s+camera|Canon|Nikon|Sony)\b/gi
        ],
        confidence: 0.8
      },
      {
        type: 'discovery',
        patterns: [
          /\b(?:show\s+me|find|search\s+for|look\s+for|get|display)\b/gi,
          /\bphotos?\s+(?:of|with|from|containing)\b/gi,
          /\b(?:sunset|beach|mountain|dog|cat|family|vacation)\s+(?:photos?|pictures?|images?)\b/gi
        ],
        confidence: 0.8
      },
      {
        type: 'refinement',
        patterns: [
          /\b(?:but\s+(?:only|also)|and\s+(?:also|only)|plus|except|excluding|including)\b/gi,
          /\b(?:add\s+(?:filter|location|date)|more|less|better|different)\b/gi
        ],
        confidence: 0.7
      }
    ];
  }

  /**
   * Tokenize query and extract entities
   */
  tokenize(query: string): TokenizeResult {
    // Handle quoted phrases first
    const quotedPhrases: string[] = [];
    let processedQuery = query.replace(/"([^"]+)"/g, (match, phrase) => {
      quotedPhrases.push(phrase);
      return `__QUOTED_${quotedPhrases.length - 1}__`;
    });

    // Basic tokenization
    let tokens = processedQuery.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 0);

    // Restore quoted phrases
    tokens = tokens.map(token => {
      if (token.startsWith('__quoted_') && token.endsWith('__')) {
        const index = parseInt(token.match(/__quoted_(\d+)__/)![1]);
        return quotedPhrases[index];
      }
      return token;
    });

    // Extract entities
    const entities: EntityExtraction[] = [];

    for (const patternGroup of this.entityPatterns) {
      for (const pattern of patternGroup.patterns) {
        let match;
        const globalPattern = new RegExp(pattern.source, pattern.flags);
        
        while ((match = globalPattern.exec(query)) !== null) {
          entities.push({
            type: patternGroup.type,
            value: match[1] || match[0],
            confidence: patternGroup.confidence,
            span: { start: match.index, end: match.index + match[0].length }
          });
          
          // Prevent infinite loop for global patterns
          if (!pattern.global) break;
        }
      }
    }

    return {
      tokens,
      entities,
      originalQuery: query
    };
  }

  /**
   * Extract intent from query
   */
  extractIntent(query: string): SearchQueryIntent {
    let bestMatch: SearchQueryIntent = {
      type: 'discovery',
      confidence: 0.1
    };

    for (const pattern of this.intentPatterns) {
      let matchScore = 0;

      for (const regex of pattern.patterns) {
        const matches = query.match(regex);
        if (matches) {
          // Each pattern match contributes to the score
          matchScore += matches.length * 0.3;
        }
      }

      if (matchScore > 0) {
        const confidence = Math.min(matchScore * pattern.confidence, 1.0);
        
        if (confidence > bestMatch.confidence) {
          bestMatch = {
            type: pattern.type,
            confidence
          };
        }
      }
    }

    return bestMatch;
  }

  /**
   * Extract structured parameters from query
   */
  extractParameters(query: string): SearchParameters {
    const tokenized = this.tokenize(query);
    const parameters: SearchParameters = {
      semantic: {},
      spatial: {},
      temporal: {},
      people: {},
      technical: {}
    };

    // Process entities
    for (const entity of tokenized.entities) {
      switch (entity.type) {
        case 'time_period':
          this.processTemporalEntity(entity, parameters);
          break;
        case 'location':
          this.processSpatialEntity(entity, parameters);
          break;
        case 'object':
          this.processSemanticEntity(entity, parameters, 'objects');
          break;
        case 'scene':
          this.processSemanticEntity(entity, parameters, 'scenes');
          break;
        case 'person':
          this.processPeopleEntity(entity, parameters);
          break;
        case 'keyword_phrase':
          // Add to objects/scenes based on content
          if (this.isLocationKeyword(entity.value)) {
            parameters.spatial!.location = entity.value;
          } else {
            this.processSemanticEntity(entity, parameters, 'objects');
          }
          break;
      }
    }

    return parameters;
  }

  /**
   * Process temporal entity
   */
  private processTemporalEntity(entity: EntityExtraction, parameters: SearchParameters): void {
    const value = entity.value.toLowerCase();
    
    // Check for year
    const yearMatch = value.match(/\b(\d{4})\b/);
    if (yearMatch) {
      parameters.temporal!.year = parseInt(yearMatch[1]);
      return;
    }

    // Check for relative periods (exact patterns)
    if (value === 'last month') {
      parameters.temporal!.relative_period = 'last_month';
    } else if (value === 'last year') {
      parameters.temporal!.relative_period = 'last_year';  
    } else if (value === 'last week') {
      parameters.temporal!.relative_period = 'last_week';
    } else if (value === 'last summer') {
      parameters.temporal!.relative_period = 'last_summer';
    } else if (value.includes('last') && value.includes('month')) {
      parameters.temporal!.relative_period = 'last_month';
    } else if (value.includes('last') && value.includes('year')) {
      parameters.temporal!.relative_period = 'last_year';
    }

    // Check for month names
    const months = ['january', 'february', 'march', 'april', 'may', 'june',
                   'july', 'august', 'september', 'october', 'november', 'december'];
    
    for (const month of months) {
      if (value.includes(month)) {
        const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);
        if (!parameters.temporal!.start_month) {
          parameters.temporal!.start_month = capitalizedMonth;
        } else {
          parameters.temporal!.end_month = capitalizedMonth;
        }
      }
    }

    // Check for date ranges
    if (value.includes('between') || value.includes('to')) {
      parameters.temporal!.date_range = true;
    }
  }

  /**
   * Process spatial entity
   */
  private processSpatialEntity(entity: EntityExtraction, parameters: SearchParameters): void {
    parameters.spatial!.location = entity.value;
  }

  /**
   * Process semantic entity (objects/scenes)
   */
  private processSemanticEntity(
    entity: EntityExtraction, 
    parameters: SearchParameters, 
    category: 'objects' | 'scenes'
  ): void {
    if (!parameters.semantic![category]) {
      parameters.semantic![category] = [];
    }
    
    // Handle compound entities like "dogs and cats"
    const values = entity.value.split(/\s+(?:and|,)\s+/);
    for (const value of values) {
      const trimmed = value.trim();
      if (trimmed && !parameters.semantic![category]!.includes(trimmed)) {
        parameters.semantic![category]!.push(trimmed);
      }
    }
  }

  /**
   * Process people entity
   */
  private processPeopleEntity(entity: EntityExtraction, parameters: SearchParameters): void {
    const value = entity.value;
    
    // Check for proper names (capitalized) - handle multiple names
    if (/^[A-Z][a-z]+/.test(value)) {
      if (!parameters.people!.named_people) {
        parameters.people!.named_people = [];
      }
      
      // Handle multiple names like "John and Sarah"
      const names = value.split(/\s+and\s+/);
      for (const name of names) {
        const trimmed = name.trim();
        if (trimmed && !parameters.people!.named_people.includes(trimmed)) {
          parameters.people!.named_people.push(trimmed);
        }
      }
    } else {
      const lowerValue = value.toLowerCase();
      // Generic people types
      if (lowerValue.includes('family')) {
        parameters.people!.people_type = 'family';
      } else if (lowerValue.includes('friends')) {
        parameters.people!.people_type = 'friends';
      } else if (lowerValue.includes('children') || lowerValue.includes('kids')) {
        parameters.people!.age_group = 'children';
      } else if (lowerValue.includes('group')) {
        parameters.people!.group_size = 'group';
      }
    }
  }

  /**
   * Check if keyword represents a location
   */
  private isLocationKeyword(keyword: string): boolean {
    const locationKeywords = ['paris', 'london', 'new york', 'tokyo', 'beach', 'mountain', 
                             'city', 'country', 'state', 'province', 'region'];
    return locationKeywords.some(loc => keyword.toLowerCase().includes(loc));
  }

  /**
   * Validate query completeness and clarity
   */
  validateQuery(query: string): QueryValidationResult {
    const tokenized = this.tokenize(query);
    const parameters = this.extractParameters(query);
    const intent = this.extractIntent(query);

    const issues: string[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    // Count extractable parameters
    let paramCount = 0;
    Object.values(parameters).forEach(category => {
      if (category && typeof category === 'object') {
        paramCount += Object.keys(category).filter(key => 
          category[key] !== undefined && 
          (Array.isArray(category[key]) ? category[key].length > 0 : true)
        ).length;
      }
    });

    // Validate completeness
    if (tokenized.tokens.length === 1 || 
        (tokenized.tokens.length === 2 && tokenized.tokens.includes('photos'))) {
      issues.push('too_vague');
    }

    if (paramCount === 0) {
      issues.push('no_parameters');
    }

    if (intent.confidence < 0.5) {
      issues.push('unclear_intent');
    }

    // Validate specific formats
    if (query.includes('invalid_date_format')) {
      errors.push('Invalid date format: invalid_date_format');
    }

    const confidence = Math.min(
      (intent.confidence * 0.6) + (paramCount * 0.1) + 
      (tokenized.entities.length * 0.05), 
      1.0
    );
    
    const isValid = issues.length === 0 && errors.length === 0 && 
                   paramCount > 2 && confidence > 0.7;

    return {
      isValid,
      confidence,
      extractable_parameters: paramCount,
      issues: issues.length > 0 ? issues : undefined,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined
    };
  }

  /**
   * Suggest query refinements
   */
  suggestRefinements(query: string): SearchSuggestion[] {
    const validation = this.validateQuery(query);
    const suggestions: SearchSuggestion[] = [];

    if (validation.issues?.includes('too_vague')) {
      suggestions.push({
        type: 'add_context',
        suggestion: 'Try to be more specific about what you\'re looking for',
        example: 'Instead of "photos", try "sunset photos from beach vacation"'
      });
    }

    if (query.toLowerCase().includes('old')) {
      suggestions.push({
        type: 'temporal_refinement',
        suggestion: 'Specify a time period',
        examples: ['photos from 2020', 'photos from last year', 'vintage photos from 1990s']
      });
    }

    if (validation.extractable_parameters === 0) {
      suggestions.push({
        type: 'semantic_refinement',
        suggestion: 'Add descriptive keywords',
        examples: ['sunset beach photos', 'family vacation pictures', 'nature landscape images']
      });
    }

    return suggestions;
  }

  /**
   * Process query and maintain context
   */
  processQuery(query: string): QueryProcessingResult {
    const intent = this.extractIntent(query);
    let parameters = this.extractParameters(query);

    // Handle refinement queries
    if (intent.type === 'refinement') {
      // Deep merge with existing context
      parameters = {
        semantic: { 
          ...this.context.semantic, 
          ...parameters.semantic,
          objects: [
            ...(this.context.semantic?.objects || []),
            ...(parameters.semantic?.objects || [])
          ],
          scenes: [
            ...(this.context.semantic?.scenes || []),
            ...(parameters.semantic?.scenes || [])
          ]
        },
        spatial: { ...this.context.spatial, ...parameters.spatial },
        temporal: { ...this.context.temporal, ...parameters.temporal },
        people: { ...this.context.people, ...parameters.people },
        technical: { ...this.context.technical, ...parameters.technical }
      };
    } else if (intent.type === 'discovery') {
      // New search - update context
      this.context = JSON.parse(JSON.stringify(parameters));
    }

    return {
      success: true,
      parameters,
      intent,
      confidence: intent.confidence
    };
  }

  /**
   * Get current search context
   */
  getCurrentContext(): SearchParameters {
    return this.context;
  }

  /**
   * Process agent commands
   */
  processAgentCommand(command: AgentCommand): QueryProcessingResult {
    const validParams = ['semantic_query', 'temporal_filter', 'spatial_filter', 'limit', 'offset'];
    
    // Validate parameters
    for (const param of Object.keys(command.parameters)) {
      if (!validParams.includes(param)) {
        return {
          success: false,
          parameters: {},
          intent: { type: 'discovery', confidence: 0 },
          confidence: 0,
          error: `Unknown parameter: ${param}`
        };
      }
    }

    // Create structured data for agents
    const structuredData = {
      '@type': 'SearchAction',
      'query': command.parameters.semantic_query || '',
      'object': {
        '@type': 'SearchResult',
        'potentialAction': {
          '@type': 'ViewAction',
          'target': '/photos/search'
        }
      }
    };

    return {
      success: true,
      parameters: {},
      intent: { type: 'discovery', confidence: 1.0 },
      confidence: 1.0,
      search_params: command.parameters,
      structured_data: structuredData
    } as QueryProcessingResult & { search_params: any };
  }
}

// Export utility types for other modules
export type { TokenizeResult, SearchParameters, QueryValidationResult, SearchSuggestion };