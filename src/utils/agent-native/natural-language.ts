/**
 * Natural Language API Development
 * 
 * Provides natural language processing capabilities for agents to understand
 * and execute commands in plain English.
 */

import { AgentActionRegistry, ActionResult } from './agent-actions';
import { Photo, Album } from '../../types';

// Type definitions for natural language processing
export interface CommandIntent {
  action: string;
  confidence: number;
  category: string;
  alternativeActions?: string[];
}

export interface ParsedCommand {
  intent: CommandIntent;
  parameters: { [key: string]: any };
  confidence: number;
  errors?: string[];
  warnings?: string[];
  originalCommand: string;
}

export interface NLProcessingResult {
  success: boolean;
  executedAction?: string;
  parameters?: { [key: string]: any };
  result?: ActionResult;
  error?: string;
  suggestions?: string[];
  helpResponse?: string;
  requiresConfirmation?: boolean;
  confirmationPrompt?: string;
  multiStep?: boolean;
  steps?: Array<{ action: string; parameters: any }>;
}

export interface ProcessingOptions {
  onProgress?: (progress: { status: string; message?: string; progress?: number }) => void;
  context?: { [key: string]: any };
  allowMultiStep?: boolean;
}

/**
 * Intent Recognition System
 */
export class IntentRecognizer {
  private patterns: Array<{
    action: string;
    patterns: RegExp[];
    category: string;
    confidence: number;
  }>;

  constructor() {
    this.patterns = [
      // Photo selection patterns
      {
        action: 'photo.select',
        patterns: [
          /(?:select|choose|pick|click)\s+(?:photo|image|picture)\s+(.+)/i,
          /(?:select|choose|pick)\s+(.+\.(?:jpg|jpeg|png|gif))/i,
          /(?:click\s+on|tap)\s+(?:the\s+)?(.+)/i
        ],
        category: 'photo',
        confidence: 0.9
      },
      // Photo analysis patterns
      {
        action: 'photo.analyze',
        patterns: [
          /(?:analyze|process)\s+(?:photo|image|picture)\s+(.+)/i,
          /(?:generate|create)\s+(?:metadata|keywords|tags)\s+for\s+(.+)/i,
          /(?:add\s+(?:keywords|tags|metadata)|process\s+with\s+ai)\s+(.+)/i,
          /(?:ai\s+analysis|smart\s+tagging)\s+(.+)/i
        ],
        category: 'photo',
        confidence: 0.85
      },
      // Album creation patterns
      {
        action: 'album.create',
        patterns: [
          /(?:create|make|add)\s+(?:a\s+)?(?:new\s+)?album\s+(?:called|named)?\s*["']?([^"']+)["']?/i,
          /new\s+album\s+["']?([^"']+)["']?/i,
          /(?:create|make)\s+["']?([^"']+)["']?\s+album/i
        ],
        category: 'album',
        confidence: 0.9
      },
      // Search and filter patterns
      {
        action: 'photo.search',
        patterns: [
          /(?:find|search\s+for|show\s+me|filter\s+by)\s+(.+)/i,
          /(?:photos|images|pictures)\s+(?:with|containing|tagged)\s+(.+)/i,
          /(?:filter|search)\s+(.+)/i
        ],
        category: 'search',
        confidence: 0.8
      },
      // Batch operations
      {
        action: 'photo.batchAnalyze',
        patterns: [
          /(?:analyze|process)\s+(?:all|selected|multiple)\s+(?:photos|images)/i,
          /batch\s+(?:analyze|process|operation)/i,
          /(?:analyze|process)\s+(?:them|these|selection)/i
        ],
        category: 'batch',
        confidence: 0.85
      },
      // Album selection
      {
        action: 'album.select',
        patterns: [
          /(?:select|open|view)\s+album\s+(.+)/i,
          /(?:go\s+to|switch\s+to)\s+album\s+(.+)/i,
          /album\s+(.+)/i
        ],
        category: 'album',
        confidence: 0.8
      }
    ];
  }

  /**
   * Recognize intent from natural language command
   */
  recognize(command: string): CommandIntent {
    let bestMatch: CommandIntent = {
      action: 'unknown',
      confidence: 0,
      category: 'unknown'
    };

    for (const pattern of this.patterns) {
      for (const regex of pattern.patterns) {
        const match = command.match(regex);
        if (match) {
          const confidence = pattern.confidence * this.calculateMatchQuality(command, match);
          
          if (confidence > bestMatch.confidence) {
            bestMatch = {
              action: pattern.action,
              confidence,
              category: pattern.category
            };
          }
        }
      }
    }

    // Add alternative suggestions for low confidence matches
    if (bestMatch.confidence < 0.6) {
      bestMatch.alternativeActions = this.getSimilarActions(command);
    }

    return bestMatch;
  }

  /**
   * Calculate match quality based on command structure
   */
  private calculateMatchQuality(command: string, match: RegExpMatchArray): number {
    const commandLength = command.length;
    const matchLength = match[0].length;
    const coverage = matchLength / commandLength;
    
    // Bonus for specific identifiers (filenames, IDs, etc.)
    const hasSpecificId = /\.(jpg|jpeg|png|gif)|photo-\d+|img_\d+/i.test(command);
    const specificBonus = hasSpecificId ? 0.1 : 0;
    
    return Math.min(coverage + specificBonus, 1.0);
  }

  /**
   * Get similar actions for suggestion
   */
  private getSimilarActions(command: string): string[] {
    const suggestions = [];
    const lowerCommand = command.toLowerCase();
    
    if (lowerCommand.includes('photo') || lowerCommand.includes('image')) {
      suggestions.push('photo.select', 'photo.analyze', 'photo.search');
    }
    if (lowerCommand.includes('album')) {
      suggestions.push('album.create', 'album.select', 'album.getStats');
    }
    if (lowerCommand.includes('search') || lowerCommand.includes('find')) {
      suggestions.push('photo.search', 'album.findByName');
    }
    
    return suggestions.slice(0, 3); // Limit suggestions
  }
}

/**
 * Parameter Extraction System
 */
export class ParameterExtractor {
  /**
   * Extract parameters from command based on intended action
   */
  extract(command: string, action: string): { [key: string]: any } {
    const parameters: { [key: string]: any } = {};
    
    switch (action) {
      case 'photo.select':
        return this.extractPhotoId(command);
      
      case 'album.create':
        return this.extractAlbumParams(command);
      
      case 'photo.search':
      case 'photo.filterByKeywords':
        return this.extractSearchParams(command);
      
      case 'photo.analyze':
        return this.extractAnalysisParams(command);
      
      case 'photo.batchAnalyze':
        return this.extractBatchParams(command);
      
      default:
        return this.extractGenericParams(command);
    }
  }

  /**
   * Extract photo ID from command
   */
  private extractPhotoId(command: string): { [key: string]: any } {
    // Try to find specific photo identifiers
    const patterns = [
      /(?:photo|image|picture)\s+([^\s"']+\.(?:jpg|jpeg|png|gif))/i,
      /(?:photo|image)\s+(?:with\s+id\s+)?([^\s"']+)/i,
      /(?:id|ID)\s+([^\s"']+)/i,
      /"([^"]+)"/,
      /'([^']+)'/
    ];

    for (const pattern of patterns) {
      const match = command.match(pattern);
      if (match) {
        return { photoId: match[1].trim() };
      }
    }

    // Try relative references
    if (/(?:first|top|initial)/i.test(command)) {
      return { position: 'first' };
    }
    if (/(?:last|latest|recent|newest)/i.test(command)) {
      return { position: 'last' };
    }

    return {};
  }

  /**
   * Extract album creation parameters
   */
  private extractAlbumParams(command: string): { [key: string]: any } {
    const params: { [key: string]: any } = {};
    
    // Extract album name (quoted or unquoted)
    const namePatterns = [
      /album\s+(?:called|named)\s*["']([^"']+)["']/i,
      /["']([^"']+)["']\s+album/i,
      /album\s+["']([^"']+)["']/i,
      /(?:create|make|new)\s+album\s+([^"'\n]+?)(?:\s+with|\s+description|$)/i
    ];

    for (const pattern of namePatterns) {
      const match = command.match(pattern);
      if (match) {
        params.name = match[1].trim();
        break;
      }
    }

    // Extract description
    const descPatterns = [
      /description\s+["']([^"']+)["']/i,
      /with\s+description\s+([^"'\n]+)/i,
      /described?\s+as\s+["']([^"']+)["']/i
    ];

    for (const pattern of descPatterns) {
      const match = command.match(pattern);
      if (match) {
        params.description = match[1].trim();
        break;
      }
    }

    return params;
  }

  /**
   * Extract search and filter parameters
   */
  private extractSearchParams(command: string): { [key: string]: any } {
    const params: { [key: string]: any } = {};
    
    // Extract keywords
    const keywordPatterns = [
      /(?:keywords?|tags?)\s+([^"'\n]+)/i,
      /(?:with|containing|tagged)\s+([^"'\n]+)/i,
      /(?:find|search\s+for|filter\s+by)\s+([^"'\n]+)/i
    ];

    for (const pattern of keywordPatterns) {
      const match = command.match(pattern);
      if (match) {
        const keywordString = match[1].trim();
        
        // Split by common delimiters
        const keywords = keywordString
          .split(/[,;]\s*/)
          .map(k => k.trim())
          .filter(k => k.length > 0);
        
        if (keywords.length > 1) {
          params.keywords = keywords;
        } else {
          params.query = keywordString;
        }
        break;
      }
    }

    return params;
  }

  /**
   * Extract analysis parameters
   */
  private extractAnalysisParams(command: string): { [key: string]: any } {
    const params = this.extractPhotoId(command);
    
    // Extract custom instructions
    const instructionPatterns = [
      /(?:instructions?|prompt)\s+["']([^"']+)["']/i,
      /with\s+["']([^"']+)["']/i,
      /focus\s+on\s+([^"'\n]+)/i
    ];

    for (const pattern of instructionPatterns) {
      const match = command.match(pattern);
      if (match) {
        params.customInstructions = match[1].trim();
        break;
      }
    }

    // Check for regeneration flag
    if (/(?:regenerate|redo|again|force)/i.test(command)) {
      params.regenerate = true;
    }

    return params;
  }

  /**
   * Extract batch operation parameters
   */
  private extractBatchParams(command: string): { [key: string]: any } {
    const params: { [key: string]: any } = {};
    
    // Determine target
    if (/(?:all|every)\s+(?:photos?|images?)/i.test(command)) {
      params.target = 'all';
    } else if (/(?:selected|chosen)\s+(?:photos?|images?)/i.test(command)) {
      params.target = 'selected';
    } else if (/(?:them|these)/i.test(command)) {
      params.target = 'contextual';
    }

    // Extract count if specified
    const countMatch = command.match(/(?:first|last)\s+(\d+)/i);
    if (countMatch) {
      params.count = parseInt(countMatch[1]);
      params.position = countMatch[0].toLowerCase().includes('first') ? 'first' : 'last';
    }

    return params;
  }

  /**
   * Extract generic parameters
   */
  private extractGenericParams(command: string): { [key: string]: any } {
    const params: { [key: string]: any } = {};
    
    // Extract quoted strings as values
    const quotedMatches = command.match(/["']([^"']+)["']/g);
    if (quotedMatches) {
      params.values = quotedMatches.map(match => match.slice(1, -1));
    }

    // Extract numbers
    const numbers = command.match(/\d+/g);
    if (numbers) {
      params.numbers = numbers.map(n => parseInt(n));
    }

    return params;
  }
}

/**
 * Command Parser - Combines intent recognition and parameter extraction
 */
export class CommandParser {
  private intentRecognizer: IntentRecognizer;
  private parameterExtractor: ParameterExtractor;

  constructor() {
    this.intentRecognizer = new IntentRecognizer();
    this.parameterExtractor = new ParameterExtractor();
  }

  /**
   * Parse natural language command into structured format
   */
  parse(command: string): ParsedCommand {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic validation
    if (!command || command.trim().length === 0) {
      errors.push('Empty command provided');
    }

    // Recognize intent
    const intent = this.intentRecognizer.recognize(command);
    
    // Extract parameters
    const parameters = this.parameterExtractor.extract(command, intent.action);
    
    // Validate parameters based on action requirements
    const validation = this.validateParameters(intent.action, parameters);
    if (!validation.valid) {
      errors.push(...validation.errors);
    }
    
    // Calculate overall confidence
    const parameterConfidence = Object.keys(parameters).length > 0 ? 0.8 : 0.4;
    const overallConfidence = (intent.confidence + parameterConfidence) / 2;

    return {
      intent,
      parameters,
      confidence: overallConfidence,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
      originalCommand: command
    };
  }

  /**
   * Validate extracted parameters against action requirements
   */
  private validateParameters(action: string, parameters: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Get action definition from registry
    const actionDef = AgentActionRegistry.getAction(action);
    if (!actionDef) {
      return { valid: true, errors }; // Unknown action, skip validation
    }

    // Check required parameters
    for (const [paramName, paramDef] of Object.entries(actionDef.parameters)) {
      if (paramDef.required && !(paramName in parameters)) {
        errors.push(`Missing required parameter: ${paramName}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

/**
 * Main Natural Language Processor
 */
export class NaturalLanguageProcessor {
  private commandParser: CommandParser;
  private context: { [key: string]: any } = {};

  constructor() {
    this.commandParser = new CommandParser();
  }

  /**
   * Process natural language command and execute corresponding action
   */
  async processCommand(
    command: string, 
    options: ProcessingOptions = {}
  ): Promise<NLProcessingResult> {
    try {
      // Parse command
      const parsed = this.commandParser.parse(command);
      
      // Handle low confidence commands
      if (parsed.confidence < 0.5) {
        return this.handleLowConfidenceCommand(command, parsed);
      }

      // Handle errors in parsing
      if (parsed.errors && parsed.errors.length > 0) {
        return {
          success: false,
          error: parsed.errors.join('; '),
          suggestions: this.generateSuggestions(parsed.intent.action)
        };
      }

      // Handle help requests
      if (this.isHelpRequest(command)) {
        return this.generateHelpResponse();
      }

      // Check for destructive actions requiring confirmation
      if (this.requiresConfirmation(parsed.intent.action)) {
        return this.handleConfirmationRequired(parsed);
      }

      // Handle multi-step operations
      if (options.allowMultiStep && this.isMultiStepCommand(command)) {
        return this.handleMultiStepCommand(command, options);
      }

      // Resolve contextual parameters
      const resolvedParams = this.resolveContextualParameters(parsed.parameters, parsed.intent.action);

      // Execute action
      const result = await AgentActionRegistry.execute(parsed.intent.action, resolvedParams);

      // Update context for future commands
      this.updateContext(parsed.intent.action, resolvedParams, result);

      return {
        success: result.success,
        executedAction: parsed.intent.action,
        parameters: resolvedParams,
        result,
        error: result.error
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown processing error'
      };
    }
  }

  /**
   * Handle commands with low confidence
   */
  private handleLowConfidenceCommand(command: string, parsed: ParsedCommand): NLProcessingResult {
    const suggestions = [];
    
    if (parsed.intent.alternativeActions) {
      suggestions.push(...parsed.intent.alternativeActions.map(action => 
        this.generateExampleCommand(action)
      ));
    } else {
      suggestions.push(
        'select photo [photo-id]',
        'create album "Album Name"',
        'analyze photo [photo-id]',
        'search for [keywords]'
      );
    }

    return {
      success: false,
      error: `Could not understand command: "${command}"`,
      suggestions
    };
  }

  /**
   * Check if command is a help request
   */
  private isHelpRequest(command: string): boolean {
    return /(?:help|what\s+can\s+you\s+do|commands|usage)/i.test(command);
  }

  /**
   * Generate help response
   */
  private generateHelpResponse(): NLProcessingResult {
    const helpText = `
Available commands:

📷 Photo Management:
• "select photo [filename]" - Select a specific photo
• "analyze photo [filename]" - Generate AI metadata
• "analyze all selected photos" - Batch analysis

📁 Album Management:  
• "create album 'Album Name'" - Create new album
• "select album 'Album Name'" - Switch to album
• "album statistics" - Show album stats

🔍 Search & Filter:
• "find photos with [keywords]" - Search by keywords
• "show me [description] photos" - Natural search

💡 Examples:
• "select photo sunset.jpg"
• "create album 'Vacation 2025' with description 'Beach photos'"
• "find photos with sunset, beach, landscape"
• "analyze all photos in album Travel"
    `;

    return {
      success: true,
      helpResponse: helpText.trim()
    };
  }

  /**
   * Check if action requires confirmation
   */
  private requiresConfirmation(action: string): boolean {
    const destructiveActions = ['album.delete', 'photo.delete', 'photo.batchDelete'];
    return destructiveActions.includes(action);
  }

  /**
   * Handle confirmation required for destructive actions
   */
  private handleConfirmationRequired(parsed: ParsedCommand): NLProcessingResult {
    return {
      success: false,
      requiresConfirmation: true,
      confirmationPrompt: `This will ${parsed.intent.action.replace('.', ' ')}. Are you sure you want to continue?`
    };
  }

  /**
   * Check if command requires multiple steps
   */
  private isMultiStepCommand(command: string): boolean {
    return /(?:and\s+then|and\s+also|,\s+then|;)/.test(command);
  }

  /**
   * Handle multi-step command execution
   */
  private async handleMultiStepCommand(
    command: string, 
    options: ProcessingOptions
  ): Promise<NLProcessingResult> {
    // Split command into steps
    const steps = command.split(/(?:and\s+then|and\s+also|,\s+then|;)/).map(s => s.trim());
    
    const parsedSteps = steps.map(step => this.commandParser.parse(step));
    
    return {
      success: true,
      multiStep: true,
      steps: parsedSteps.map(parsed => ({
        action: parsed.intent.action,
        parameters: parsed.parameters
      }))
    };
  }

  /**
   * Resolve contextual parameters (selected photos, current album, etc.)
   */
  private resolveContextualParameters(parameters: any, action: string): any {
    const resolved = { ...parameters };

    // Handle contextual photo references
    if (parameters.target === 'selected' || parameters.target === 'contextual') {
      const photoState = window.agentState?.photoGrid;
      if (photoState?.current.selectedIds) {
        resolved.photoIds = photoState.current.selectedIds;
      }
    }

    // Handle relative position references
    if (parameters.position) {
      const photoState = window.agentState?.photoGrid;
      if (photoState?.current.photos) {
        const photos = photoState.current.photos;
        if (parameters.position === 'first' && photos.length > 0) {
          resolved.photoId = photos[0].id;
        } else if (parameters.position === 'last' && photos.length > 0) {
          resolved.photoId = photos[photos.length - 1].id;
        }
      }
    }

    return resolved;
  }

  /**
   * Update context after command execution
   */
  private updateContext(action: string, parameters: any, result: ActionResult): void {
    this.context.lastAction = action;
    this.context.lastParameters = parameters;
    this.context.lastResult = result;
    this.context.timestamp = Date.now();
  }

  /**
   * Generate suggestions for unclear commands
   */
  private generateSuggestions(action: string): string[] {
    const suggestions: { [key: string]: string[] } = {
      'photo.select': [
        'select photo beach-sunset.jpg',
        'choose photo with id photo-123',
        'click on the first photo'
      ],
      'album.create': [
        'create album "Vacation Photos"',
        'make new album Travel with description "Summer trip"',
        'new album Family'
      ],
      'photo.analyze': [
        'analyze photo sunset.jpg',
        'generate metadata for selected photos',
        'process image with AI'
      ]
    };

    return suggestions[action] || [
      'Try being more specific',
      'Use "help" to see available commands'
    ];
  }

  /**
   * Generate example command for an action
   */
  private generateExampleCommand(action: string): string {
    const examples: { [key: string]: string } = {
      'photo.select': 'select photo [filename]',
      'photo.analyze': 'analyze photo [filename]',
      'album.create': 'create album "Album Name"',
      'album.select': 'select album "Album Name"',
      'photo.search': 'find photos with [keywords]'
    };

    return examples[action] || `execute ${action}`;
  }
}