import { Entity, EntityType } from '../interfaces/semantic-query';

export class AgentEntityExtractor {
  private readonly entityPatterns = {
    KEYWORD: {
      pattern: /\b(vacation|beach|sunset|sunrise|portrait|landscape|nature|city|car|food)\b/gi,
      confidence: 0.7
    },
    DATE: {
      pattern: /\b(\d{4}|\d{1,2}\/\d{1,2}\/\d{4}|january|february|march|april|may|june|july|august|september|october|november|december)\b/gi,
      confidence: 0.8
    },
    LOCATION: {
      pattern: /\b(at|in|from|near)\s+([A-Z][a-zA-Z\s,]+?)(?:\s|$|[,.!?])/gi,
      confidence: 0.6
    },
    ALBUM: {
      // Improved album pattern
      pattern: /(?:album\s+(?:called\s+)?([a-zA-Z][a-zA-Z0-9\s]{1,30})|([a-zA-Z][a-zA-Z0-9\s]{1,30})\s+album)/gi,
      confidence: 0.8
    }
  };

  extractEntities(query: string): Entity[] {
    const entities: Entity[] = [];
    
    entities.push(...this.extractKeywordEntities(query));
    entities.push(...this.extractDateEntities(query));
    entities.push(...this.extractLocationEntities(query));
    entities.push(...this.extractAlbumEntities(query));

    return entities;
  }

  private extractKeywordEntities(query: string): Entity[] {
    const entities: Entity[] = [];
    
    if (this.entityPatterns.KEYWORD.pattern.test(query)) {
      this.entityPatterns.KEYWORD.pattern.lastIndex = 0;
      let match;
      while ((match = this.entityPatterns.KEYWORD.pattern.exec(query)) !== null) {
        const start = match.index || 0;
        entities.push({
          type: 'KEYWORD' as EntityType,
          value: match[1],
          confidence: this.entityPatterns.KEYWORD.confidence,
          span: { start, end: start + match[1].length }
        });
      }
    }
    
    return entities;
  }

  private extractDateEntities(query: string): Entity[] {
    const entities: Entity[] = [];
    const foundDates = new Set<string>();
    
    // Prioritize full dates over partial dates
    const datePatterns = [
      { pattern: /(\d{4}-\d{2}-\d{2})/gi, priority: 1 }, // ISO format: 2023-01-15
      { pattern: /(\d{1,2}\/\d{1,2}\/\d{4})/gi, priority: 2 }, // US format: 1/15/2023
      { pattern: /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s+\d{4}/gi, priority: 3 }, // January 15, 2023
      { pattern: /\b(\d{4})\b/gi, priority: 4 } // Year only: 2023
    ];
    
    // Sort by priority and extract
    for (const { pattern } of datePatterns.sort((a, b) => a.priority - b.priority)) {
      pattern.lastIndex = 0;
      let match;
      while ((match = pattern.exec(query)) !== null) {
        const dateValue = match[1];
        
        // Don't add if we already found a higher priority date containing this one
        const alreadyFound = Array.from(foundDates).some(existing => 
          existing.includes(dateValue.toLowerCase()) || dateValue.toLowerCase().includes(existing)
        );
        
        if (!alreadyFound) {
          foundDates.add(dateValue.toLowerCase());
          const start = match.index || 0;
          entities.push({
            type: 'DATE' as EntityType,
            value: dateValue,
            confidence: this.entityPatterns.DATE.confidence,
            span: { start, end: start + dateValue.length }
          });
        }
      }
    }
    
    return entities;
  }

  private extractLocationEntities(query: string): Entity[] {
    const entities: Entity[] = [];
    
    this.entityPatterns.LOCATION.pattern.lastIndex = 0;
    let match;
    while ((match = this.entityPatterns.LOCATION.pattern.exec(query)) !== null) {
      const start = match.index || 0;
      entities.push({
        type: 'LOCATION' as EntityType,
        value: match[2].trim(),
        confidence: this.entityPatterns.LOCATION.confidence,
        span: { start, end: start + match[0].length }
      });
    }
    
    return entities;
  }

  private extractAlbumEntities(query: string): Entity[] {
    const entities: Entity[] = [];
    const albumPattern = /(?:open\s+)?([a-zA-Z][a-zA-Z0-9\s]*?)\s+album/gi;
    let match; 
    
    while ((match = albumPattern.exec(query)) !== null) {
      const value = match[1].trim();
      const start = match.index + match[0].indexOf(value);
      entities.push({
        type: 'ALBUM' as EntityType,
        value,
        confidence: this.entityPatterns.ALBUM.confidence,
        span: { start, end: start + value.length }
      });
    }
    
    return entities;
  }

  extractParameters(entities: Entity[]): Record<string, unknown> {
    const parameters: Record<string, unknown> = {};

    for (const entity of entities) {
      let key = entity.type.toLowerCase();
      // Convert KEYWORD to keywords to match test expectations
      if (key === 'keyword') {
        key = 'keywords';
      }
      
      if (!parameters[key]) {
        parameters[key] = [];
      }
      (parameters[key] as unknown[]).push(entity.value);
    }

    return parameters;
  }
}