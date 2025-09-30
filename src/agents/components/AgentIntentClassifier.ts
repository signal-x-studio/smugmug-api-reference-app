export class AgentIntentClassifier {
  private readonly intentPatterns = {
    filter: [
      /\b(filter|where|with|having|containing|that have)\b/i,
      /\b(beach|sunset|vacation|nature|food|cars?)\b.*\b(photos?|pictures?|images?)\b/i,
      /\bphotos?\b.*\b(from|taken|with|in|at)\b/i
    ],
    search: [
      /\b(search|find|look|discover)\b/i,
      /\bshow\s+me\b/i,
      /\bget\s+(all|some|these|those|my)?\s*(photos?|pictures?|images?|pics?)\b/i
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

  classifyIntent(query: string): string {
    const cleanedQuery = query.trim().replace(/\s+/g, ' ');
    
    return this.classifyMainIntent(cleanedQuery);
  }

  private classifyMainIntent(cleanedQuery: string): string {
    // Enhanced keyword-based classification for better coverage
    const keywords = {
      search: ['show', 'pics', 'pictures', 'images', 'display', 'view', 'get', 'find me', 'stuff'],
      filter: ['filter', 'where', 'with', 'containing', 'beach', 'sunset', 'vacation', 'nature'],
      navigate: ['open', 'go to', 'navigate', 'album'],
      manage: ['delete', 'remove', 'edit', 'upload', 'add', 'create', 'modify']
    };

    const scores: Record<string, number> = {};
    
    // Initialize scores
    Object.keys(keywords).forEach(intent => {
      scores[intent] = 0;
    });

    // Calculate keyword-based scores
    Object.entries(keywords).forEach(([intent, intentKeywords]) => {
      intentKeywords.forEach(keyword => {
        if (cleanedQuery.toLowerCase().includes(keyword)) {
          scores[intent] += 1;
        }
      });
    });

    // Apply pattern-based scoring
    Object.entries(this.intentPatterns).forEach(([intent, patterns]) => {
      patterns.forEach(pattern => {
        if (pattern.test(cleanedQuery)) {
          scores[intent] += 2; // Patterns get higher weight
        }
      });
    });

    // Find the highest scoring intent
    const maxScore = Math.max(...Object.values(scores));
    
    if (maxScore === 0) {
      return 'unknown';
    }

    return Object.entries(scores)
      .find(([, score]) => score === maxScore)?.[0] || 'unknown';
  }
}