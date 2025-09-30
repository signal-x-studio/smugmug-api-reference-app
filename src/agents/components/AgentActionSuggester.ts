import { AgentAction } from '../interfaces/agent-action';

export class AgentActionSuggester {
  async suggestActions(intent: string): Promise<AgentAction[]> {
    const actions: AgentAction[] = [];
    
    // Return actions for all recognized intents
    switch (intent) {
      case 'filter':
        actions.push(...this.getFilterActions());
        break;
      case 'search':
        actions.push(...this.getSearchActions());
        break;
      case 'navigate':
        actions.push(...this.getNavigateActions());
        break;
      case 'manage':
        actions.push(...this.getManageActions());
        break;
    }
    
    return actions;
  }

  private getFilterActions(): AgentAction[] {
    return [
      {
        id: 'photo-gallery.filter',
        name: 'Apply Photo Filter',
        description: 'Filter photos based on specified criteria',
        parameters: [
          { name: 'criteria', type: 'string', required: true, description: 'Filter criteria type' },
          { name: 'value', type: 'string', required: true, description: 'Filter value' }
        ],
        returns: { type: 'object', description: 'Filtered photos result' },
        permissions: ['read'],
        humanEquivalent: 'Use filter controls in the UI',
        examples: [{ description: 'Filter beach photos', input: { criteria: 'tag', value: 'beach' }, output: [] }]
      },
      {
        id: 'photo-gallery.advanced-filter',
        name: 'Advanced Photo Filter',
        description: 'Apply multiple filter criteria',
        parameters: [
          { name: 'filters', type: 'array', required: true, description: 'Array of filter criteria' }
        ],
        returns: { type: 'object', description: 'Filtered photos result' },
        permissions: ['read'],
        humanEquivalent: 'Use advanced filter controls in the UI',
        examples: [{ description: 'Filter with multiple criteria', input: { filters: [] }, output: [] }]
      }
    ];
  }

  private getSearchActions(): AgentAction[] {
    return [
      {
        id: 'photo-gallery.search',
        name: 'Search Photos',
        description: 'Search through photo collection',
        parameters: [
          { name: 'query', type: 'string', required: true, description: 'Search query' },
          { name: 'filters', type: 'object', required: false, description: 'Additional filters' }
        ],
        returns: { type: 'array', description: 'Array of matching photos' },
        permissions: ['read'],
        humanEquivalent: 'Use search box in the UI',
        examples: [{ description: 'Search sunset photos', input: { query: 'sunset' }, output: [] }]
      },
      {
        id: 'photo-gallery.semantic-search',
        name: 'Semantic Search',
        description: 'AI-powered semantic search of photos',
        parameters: [
          { name: 'description', type: 'string', required: true, description: 'Natural language description' }
        ],
        returns: { type: 'array', description: 'Array of semantically matched photos' },
        permissions: ['read'],
        humanEquivalent: 'Use AI search features in the UI',
        examples: [{ description: 'Find photos matching description', input: { description: 'happy family moments' }, output: [] }]
      }
    ];
  }

  private getNavigateActions(): AgentAction[] {
    return [
      {
        id: 'open-album',
        name: 'Open Album',
        description: 'Navigate to specific album',
        parameters: [
          { name: 'albumName', type: 'string', required: true, description: 'Name of album to open' }
        ],
        returns: { type: 'object', description: 'Album details and photos' },
        permissions: ['read'],
        humanEquivalent: 'Click on album in the UI',
        examples: [{ description: 'Open vacation album', input: { albumName: 'vacation' }, output: {} }]
      }
    ];
  }

  private getManageActions(): AgentAction[] {
    return [
      {
        id: 'manage-photos',
        name: 'Manage Photos',
        description: 'Perform management operations on photos',
        parameters: [
          { name: 'operation', type: 'string', required: true, description: 'Operation to perform' },
          { name: 'photos', type: 'array', required: true, description: 'Photos to operate on' }
        ],
        returns: { type: 'object', description: 'Operation result' },
        permissions: ['write'],
        humanEquivalent: 'Use photo management tools in the UI',
        examples: [{ description: 'Delete photos', input: { operation: 'delete', photos: [] }, output: {} }]
      }
    ];
  }
}