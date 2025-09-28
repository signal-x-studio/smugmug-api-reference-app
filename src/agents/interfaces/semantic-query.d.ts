/**
 * Semantic Query and Natural Language Processing Interface Definitions
 * 
 * TypeScript interfaces for processing natural language queries and converting
 * them into actionable agent commands and structured data operations.
 */

import { AgentAction } from './agent-action';

/**
 * Result of parsing a natural language query
 */
export interface SemanticQuery {
  /** Parsed user intent (e.g., 'filter', 'search', 'create') */
  intent: string;
  
  /** Extracted entities and their values */
  entities: Entity[];
  
  /** Confidence score from 0.0 to 1.0 */
  confidence: number;
  
  /** Mapped parameters ready for action execution */
  parameters: Record<string, any>;
  
  /** Suggested actions that could fulfill this query */
  suggestedActions: AgentAction[];
  
  /** Original query text */
  originalQuery: string;
  
  /** Whether this query needs clarification from the user */
  needsClarification?: boolean;
  
  /** Questions to ask the user for clarification */
  clarificationQuestions?: string[];
  
  /** Normalized/cleaned query text */
  normalizedQuery?: string;
  
  /** Language detected in the query */
  language?: string;
  
  /** Additional metadata from parsing */
  metadata?: Record<string, any>;
}

/**
 * Named entity extracted from natural language
 */
export interface Entity {
  /** Entity type (e.g., 'DATE', 'KEYWORD', 'LOCATION') */
  type: EntityType;
  
  /** Extracted value */
  value: string;
  
  /** Normalized/structured value */
  normalizedValue?: any;
  
  /** Confidence score for this entity */
  confidence: number;
  
  /** Position in original text */
  span: {
    start: number;
    end: number;
  };
  
  /** Additional metadata for this entity */
  metadata?: Record<string, any>;
}

/**
 * Supported entity types for photo management domain
 */
export type EntityType = 
  | 'DATE'
  | 'DATE_RANGE'
  | 'KEYWORD'
  | 'LOCATION'
  | 'PERSON'
  | 'COLOR'
  | 'CAMERA'
  | 'NUMBER'
  | 'FILE_TYPE'
  | 'ALBUM'
  | 'ALBUM_NAME'
  | 'ACTION_TYPE'
  | 'CUSTOM';

/**
 * Intent classification result
 */
export interface IntentClassification {
  /** Primary intent */
  intent: string;
  
  /** Confidence score */
  confidence: number;
  
  /** Alternative intents with lower confidence */
  alternatives: Array<{
    intent: string;
    confidence: number;
  }>;
  
  /** Domain/context of the intent */
  domain?: string;
}

/**
 * Configuration for natural language processing
 */
export interface NLPConfig {
  /** Language to process (ISO 639-1 code) */
  language: string;
  
  /** Minimum confidence threshold for entities */
  minEntityConfidence: number;
  
  /** Minimum confidence threshold for intents */
  minIntentConfidence: number;
  
  /** Custom entity patterns */
  customEntities?: EntityPattern[];
  
  /** Custom intent patterns */
  customIntents?: IntentPattern[];
  
  /** Whether to enable spell correction */
  enableSpellCorrection?: boolean;
  
  /** Whether to enable query expansion */
  enableQueryExpansion?: boolean;
}

/**
 * Pattern for custom entity recognition
 */
export interface EntityPattern {
  /** Entity type name */
  type: string;
  
  /** Regular expression pattern */
  pattern: RegExp;
  
  /** Extraction function */
  extractor?: (match: RegExpMatchArray) => {
    value: string;
    normalizedValue?: any;
    confidence?: number;
    metadata?: Record<string, any>;
  };
  
  /** Priority for conflict resolution */
  priority?: number;
}

/**
 * Pattern for custom intent recognition
 */
export interface IntentPattern {
  /** Intent name */
  intent: string;
  
  /** Regular expression patterns */
  patterns: RegExp[];
  
  /** Required entities for this intent */
  requiredEntities?: EntityType[];
  
  /** Optional entities for this intent */
  optionalEntities?: EntityType[];
  
  /** Parameter mapping function */
  parameterMapper?: (entities: Entity[]) => Record<string, any>;
  
  /** Priority for intent ranking */
  priority?: number;
  
  /** Domain/category */
  domain?: string;
}

/**
 * Natural language processor interface
 */
export interface NLPProcessor {
  /** Process a natural language query */
  process(query: string, config?: Partial<NLPConfig>): Promise<SemanticQuery>;
  
  /** Extract entities from text */
  extractEntities(text: string): Promise<Entity[]>;
  
  /** Classify intent from text */
  classifyIntent(text: string): Promise<IntentClassification>;
  
  /** Normalize and clean query text */
  normalizeQuery(query: string): string;
  
  /** Add custom entity pattern */
  addEntityPattern(pattern: EntityPattern): void;
  
  /** Add custom intent pattern */
  addIntentPattern(pattern: IntentPattern): void;
  
  /** Get supported languages */
  getSupportedLanguages(): string[];
}

/**
 * Query context for better understanding
 */
export interface QueryContext {
  /** Current application state */
  currentState?: Record<string, any>;
  
  /** User's recent actions */
  recentActions?: string[];
  
  /** Available data/content for context */
  availableData?: {
    photos?: number;
    albums?: number;
    keywords?: string[];
    locations?: string[];
  };
  
  /** User preferences */
  userPreferences?: {
    language?: string;
    dateFormat?: string;
    defaultFilters?: Record<string, any>;
  };
  
  /** Session information */
  session?: {
    sessionId: string;
    startTime: number;
    previousQueries?: string[];
  };
}

/**
 * Enhanced semantic query with context
 */
export interface ContextualSemanticQuery extends SemanticQuery {
  /** Context used for processing */
  context: QueryContext;
  
  /** Context-aware suggestions */
  contextualSuggestions?: string[];
  
  /** Ambiguity resolution */
  ambiguityResolution?: Array<{
    ambiguity: string;
    possibleResolutions: Array<{
      interpretation: string;
      confidence: number;
      parameters: Record<string, any>;
    }>;
  }>;
}

/**
 * Query expansion result
 */
export interface QueryExpansion {
  /** Original query */
  originalQuery: string;
  
  /** Expanded query variants */
  expandedQueries: Array<{
    query: string;
    type: 'synonym' | 'related' | 'broader' | 'narrower';
    confidence: number;
  }>;
  
  /** Suggested keywords */
  suggestedKeywords: string[];
  
  /** Related concepts */
  relatedConcepts: string[];
}

/**
 * NLP processing result with diagnostics
 */
export interface NLPProcessingResult {
  /** Semantic query result */
  semanticQuery: SemanticQuery;
  
  /** Processing diagnostics */
  diagnostics: {
    processingTime: number;
    entityExtractionTime: number;
    intentClassificationTime: number;
    parameterMappingTime: number;
  };
  
  /** Debug information */
  debug?: {
    tokenization: string[];
    entityCandidates: Entity[];
    intentCandidates: IntentClassification[];
    processingSteps: string[];
  };
}

/**
 * Photo management specific query types
 */
export type PhotoQueryType = 
  | 'filter-photos'
  | 'search-photos'
  | 'create-album'
  | 'analyze-photos'
  | 'tag-photos'
  | 'organize-photos'
  | 'export-photos'
  | 'share-photos'
  | 'edit-metadata';

/**
 * Photo management query parameters
 */
export interface PhotoQueryParameters {
  /** Date range filter */
  dateRange?: {
    start?: string;
    end?: string;
    relative?: 'today' | 'yesterday' | 'last-week' | 'last-month' | 'last-year';
  };
  
  /** Keyword filters */
  keywords?: string[];
  
  /** Location filters */
  locations?: string[];
  
  /** Person filters */
  people?: string[];
  
  /** Color filters */
  colors?: string[];
  
  /** Camera/device filters */
  cameras?: string[];
  
  /** File type filters */
  fileTypes?: string[];
  
  /** Album filters */
  albums?: string[];
  
  /** AI-generated content filters */
  aiContent?: {
    descriptions?: string[];
    emotions?: string[];
    objects?: string[];
    scenes?: string[];
  };
  
  /** Sorting preferences */
  sortBy?: 'date' | 'name' | 'size' | 'relevance';
  
  /** Sort order */
  sortOrder?: 'asc' | 'desc';
  
  /** Result limits */
  limit?: number;
  
  /** Custom instructions for AI processing */
  customInstructions?: string;
}