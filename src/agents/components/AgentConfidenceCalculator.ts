import { Entity } from '../interfaces/semantic-query';

export class AgentConfidenceCalculator {
  calculateConfidence(intent: string, entities: Entity[], query: string): number {
    if (intent === 'unknown') {
      return 0;
    }
    
    let confidence = this.getBaseConfidence(intent);
    confidence = this.adjustForQueryType(confidence, query);
    confidence = this.adjustForEntities(confidence, entities);
    confidence = this.adjustForQueryLength(confidence, query);
    confidence = this.ensureMinimumConfidence(confidence, intent);
    
    return Math.min(1.0, Math.max(0.0, confidence));
  }

  private getBaseConfidence(intent: string): number {
    return intent !== 'unknown' ? 0.6 : 0.4; // Base confidence for recognized intents
  }

  private adjustForQueryType(confidence: number, query: string): number {
    // Special handling for vague queries
    if (query.toLowerCase().includes('stuff') || query.toLowerCase().includes('things')) {
      return 0.5; // Medium confidence for vague queries
    }
    
    // Boost confidence for specific action words
    const specificKeywords = ['filter', 'search', 'find', 'show', 'open', 'delete', 'upload'];
    const hasSpecificKeyword = specificKeywords.some(keyword => 
      query.toLowerCase().includes(keyword)
    );
    
    if (hasSpecificKeyword) {
      confidence += 0.15; // Boost for specific keywords
    }
    
    return confidence;
  }

  private adjustForEntities(confidence: number, entities: Entity[]): number {
    if (entities.length > 0) {
      const avgEntityConfidence = entities.reduce((sum, e) => sum + e.confidence, 0) / entities.length;
      confidence += avgEntityConfidence * 0.3; // Increased boost for entity presence
    }
    return confidence;
  }

  private adjustForQueryLength(confidence: number, query: string): number {
    if (query.length < 5) {
      confidence -= 0.2;
    } else if (query.length > 200) {
      confidence -= 0.1;
    }
    return confidence;
  }

  private ensureMinimumConfidence(confidence: number, intent: string): number {
    if (confidence < 0.3 && intent !== 'unknown') {
      return 0.4; // Minimum medium confidence
    }
    return confidence;
  }

  checkNeedsClarification(intent: string, entities: Entity[], confidence: number): boolean {
    // Need clarification if confidence is low
    if (confidence < 0.5) {
      return true;
    }
    
    // Need clarification if intent is unknown
    if (intent === 'unknown') {
      return true;
    }
    
    // Need clarification if query has very few entities for complex intents
    if (['filter', 'search'].includes(intent) && entities.length === 0) {
      return true;
    }
    
    return false;
  }

  generateClarificationQuestions(intent: string, entities: Entity[]): string[] {
    const questions: string[] = [];
    
    if (intent === 'unknown') {
      questions.push('Could you clarify what you want to do with your photos?');
    }
    
    if (intent === 'search' && entities.length === 0) {
      questions.push('What type of photos would you like to see?');
    }
    
    if (intent === 'filter' && entities.length === 0) {
      questions.push('What criteria would you like to filter by?');
    }
    
    return questions;
  }
}