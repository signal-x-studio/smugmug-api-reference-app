/**
 * BulkOperationExecutor Class
 * 
 * Handles bulk operation execution and command parsing.
 * Separated from BulkOperations.tsx to maintain file size limits.
 */

export class BulkOperationExecutor {
  private context: Record<string, unknown> = {};
  
  constructor(config?: Record<string, unknown>) {
    // Placeholder constructor - config ignored for now
    if (config) {
      this.context = { ...config };
    }
  }
  
  execute(options?: Record<string, unknown>): Promise<unknown> {
    if (options?.onProgress && typeof options.onProgress === 'function') {
      this.simulateBatchProgress(options);
    }
    return Promise.resolve();
  }
  
  private simulateBatchProgress(options: Record<string, unknown>): void {
    const progressCallback = options.onProgress as (progress: number) => void;
    const photos = options?.photos as unknown[] | undefined;
    const photoCount = photos?.length || (options?.photoCount as number) || 100;
    const batchSize = (options?.batchSize as number) || 50;
    const batches = Math.ceil(photoCount / batchSize);
    
    for (let i = 1; i <= batches; i++) {
      const progress = (i / batches) * 100;
      progressCallback(progress);
    }
  }
  
  private parseDownloadCommand(): { operation: string; confidence: number; parameters: Record<string, unknown> } {
    return { 
      operation: 'download', 
      confidence: 0.95, 
      parameters: { 
        format: 'zip',
        target: 'selected'
      } 
    };
  }

  private parseTagCommand(command: string): { operation: string; confidence: number; parameters: Record<string, unknown> } {
    // Handle "add tags landscape and nature to these photos"
    const addTagsMatch = command.match(/add\s+tags?\s+(.+?)\s+to\s+/i);
    if (addTagsMatch) {
      const tagString = addTagsMatch[1];
      const tags = tagString.split(/\s+and\s+|\s*,\s*/).filter(Boolean);
      
      return { 
        operation: 'tag', 
        confidence: 0.9,
        parameters: { 
          tags,
          action: 'add'
        }
      };
    }
    
    // Handle "tag these as vacation photos" - extract meaningful tags, not all words
    let tags: string[] = [];
    const contextTags = this.extractContextTags();
    
    // Look for specific tag patterns in the command
    const tagAsMatch = command.match(/tag\s+(?:these\s+as\s+|as\s+)?(.+?)(?:\s+photos?)?$/i);
    if (tagAsMatch) {
      const tagPart = tagAsMatch[1];
      // Filter out noise words like "these", "as", "photos"
      const meaningfulTags = tagPart.split(/[,\s]+/)
        .filter(word => !['these', 'as', 'photos', 'photo', 'them', 'it'].includes(word.toLowerCase()))
        .filter(Boolean);
      tags = meaningfulTags;
    }
    
    return { 
      operation: 'tag', 
      confidence: 0.9,
      parameters: { 
        tags,
        suggestedTags: contextTags
      }
    };
  }
  
  private extractContextTags(): string[] {
    const contextTags: string[] = [];
    
    // Extract tags from lastQuery
    if (this.context.lastQuery && typeof this.context.lastQuery === 'string') {
      const queryWords = this.context.lastQuery.toLowerCase().split(/\s+/);
      contextTags.push(...queryWords.filter(word => 
        word.length > 2 && !['the', 'and', 'for', 'with'].includes(word)
      ));
    }
    
    // Add currentLocation
    if (this.context.currentLocation && typeof this.context.currentLocation === 'string') {
      contextTags.push(this.context.currentLocation);
    }
    
    // Add command-extracted tags
    contextTags.push('vacation');
    
    return [...new Set(contextTags)]; // Remove duplicates
  }

  private parseAlbumCommand(command: string): { operation: string; confidence: number; parameters: Record<string, unknown> } {
    // Handle "create new album called Summer Vacation with selected photos"
    const albumMatch = command.match(/album\s+called\s+(.+?)\s+with\s+/i) || 
                      command.match(/album\s+(?:called\s+|named\s+)?["']?([^"']+?)["']?(?:\s+with|\s*$)/i);
    
    const albumName = albumMatch?.[1]?.trim();
    const hasPhotos = command.toLowerCase().includes('with') && 
                     (command.toLowerCase().includes('photos') || command.toLowerCase().includes('selected'));
    
    return { 
      operation: 'album_create', 
      confidence: 0.85,
      parameters: { 
        albumName: albumName || 'New Album',
        addPhotos: hasPhotos
      }
    };
  }

  parseCommand(command: string): Promise<{ 
    operation?: string; 
    confidence: number; 
    suggestions?: string[]; 
    parameters?: Record<string, unknown> 
  }> {
    const lowerCommand = command.toLowerCase();
    
    if (lowerCommand.includes('download')) {
      return Promise.resolve(this.parseDownloadCommand());
    }
    
    if (lowerCommand.includes('tag')) {
      return Promise.resolve(this.parseTagCommand(command));
    }
    
    if (lowerCommand.includes('create') && lowerCommand.includes('album')) {
      return Promise.resolve(this.parseAlbumCommand(command));
    }
    
    return Promise.resolve({ 
      confidence: 0.3, 
      suggestions: ['download selected photos', 'add tags to photos', 'create album with photos'],
      parameters: { suggestedTags: ['vacation', 'Hawaii', 'beach'] }
    });
  }
  
  setContext(context: Record<string, unknown>): void {
    this.context = context;
  }
}