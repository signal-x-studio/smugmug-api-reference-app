---
description: Agent-Native Architecture Validator - Ensures dual-interface compliance for AI-ready components
mode: agent-native-validator
activation: User-facing components, agent integration work
version: 1.0
priority: high
---

# Agent-Native Architecture Validator Focus Mode

## Purpose

Validate that user-facing components implement the **dual-interface architecture pattern**, enabling seamless interaction by both humans and AI agents. This enforces the project's agent-native vision.

## When to Activate

### Automatic Triggers

Activate automatically when:
- Creating new user-facing React components
- Modifying interactive components (search, filter, navigation)
- Implementing command or action interfaces
- Adding data exposure capabilities
- Keywords detected: "agent", "interface", "action", "command", "dual", "register", "search", "filter"

### Manual Activation

```bash
# Explicit validation request
/validate-agent-native components/YourComponent.tsx
```

## Agent-Native Requirements

### Core Pattern: Dual-Interface Architecture

Every user-facing component MUST expose both:
1. **Human Interface** - Standard React UI (buttons, inputs, etc.)
2. **Agent Interface** - Programmatic access via `useDualInterface`

## Validation Checklist

### ✅ Required Elements

**1. useDualInterface Hook**
```typescript
// REQUIRED for all user-facing components
import { useDualInterface } from '@/hooks/useAgentIntegration';

const { agentInterface } = useDualInterface({
  componentId: 'unique-component-id',  // Unique across app
  data: componentData,                  // Component's data
  state: componentState,                 // Current state
  setState: setComponentState,           // State updater
  exposeGlobally: true                   // Register globally
});
```

**2. AgentWrapper Component**
```typescript
// REQUIRED to wrap user-facing components
import { AgentWrapper } from '@/components/AgentWrapper';

return (
  <AgentWrapper
    agentInterface={agentInterface}
    schemaType="ItemList" // Schema.org type
  >
    {/* Component content */}
  </AgentWrapper>
);
```

**3. Agent Action Registration**
```typescript
// REQUIRED for interactive components
import { registerAgentAction } from '@/utils/agent-native/agent-actions';

useEffect(() => {
  const actionId = registerAgentAction({
    action: {
      id: 'component-specific-action',
      name: 'Human Readable Action Name',
      description: 'What this action does for agents',
      execute: async (params) => {
        // Action implementation
        return { success: true, data: result };
      }
    }
  });

  // Cleanup
  return () => {
    unregisterAgentAction(actionId);
  };
}, [dependencies]);
```

**4. Schema.org Semantic Markup**
```typescript
// REQUIRED for structured data exposure
<div
  itemScope
  itemType="https://schema.org/ItemList" // Appropriate schema type
  data-agent-component="component-name"  // Agent discovery
>
  <meta itemProp="name" content="Component Title" />
  <meta itemProp="description" content="What this component does" />
  {/* Component content with semantic markup */}
</div>
```

**5. Natural Language Command Support** (for search/filter components)
```typescript
// REQUIRED for search, filter, and query components
import { parseNaturalLanguageQuery } from '@/utils/agent-native/natural-language';

const handleNaturalLanguageCommand = useCallback((command: string) => {
  const intent = parseNaturalLanguageQuery(command);

  switch (intent.type) {
    case 'search':
      performSearch(intent.parameters);
      break;
    case 'filter':
      applyFilters(intent.parameters);
      break;
    default:
      console.warn('Unhandled intent:', intent);
  }
}, [performSearch, applyFilters]);
```

## Validation Process

### Step 1: Detect Requirements

```typescript
// Auto-detect if component needs agent interface
function needsAgentInterface(component: ComponentInfo): boolean {
  return (
    component.isUserFacing &&
    (
      component.hasInteractiveElements ||
      component.exposesData ||
      component.hasSearchCapability ||
      component.hasFilterCapability ||
      component.hasNavigationControls
    )
  );
}
```

### Step 2: Check Implementation

Validate all required elements are present:

```markdown
Component: PhotoSearch.tsx

Checklist:
- [ ] useDualInterface hook imported and used
- [ ] agentInterface created with proper config
- [ ] AgentWrapper wraps component return
- [ ] Agent actions registered in useEffect
- [ ] Schema.org markup present
- [ ] Natural language support (if search/filter)
- [ ] Cleanup functions for registrations

Status: 5/7 elements present
Missing: Schema.org markup, natural language support
Action: BLOCK until complete
```

### Step 3: Validate Integration

Verify integration is correct:

```typescript
const validation = {
  interfaceExposed: checkGlobalRegistry(componentId),
  actionsRegistered: checkActionRegistry(actionIds),
  schemaValid: validateSchemaMarkup(markup),
  commandsWork: testNaturalLanguageHandlers(commands)
};

const allValid = Object.values(validation).every(v => v === true);
```

## Blocking Criteria

### ❌ BLOCK Feature Completion If:

1. **Missing useDualInterface** - Component is user-facing but doesn't expose agent interface
2. **Missing AgentWrapper** - Interactive component not wrapped for agent discovery
3. **Missing Action Registration** - Component has actions but they're not registered globally
4. **Missing Schema.org Markup** - Structured data not exposed for agent understanding
5. **Missing Natural Language Support** - Search/filter component doesn't parse commands
6. **Incomplete Implementation** - Partial implementation (e.g., hook present but wrapper missing)

### ✅ Allow to Proceed If:

1. **All Requirements Met** - Component implements full dual-interface pattern
2. **Purely Presentational** - Component has no user interaction (display-only)
3. **Internal Only** - Component not exposed to end users (admin, dev tools)
4. **Explicitly Excluded** - Component documented as not requiring agent interface

## Auto-Fix Guidance

### Fix 1: Add useDualInterface

**Detection:** Component missing `useDualInterface` hook

**Fix:**
```typescript
// Add import
import { useDualInterface } from '@/hooks/useAgentIntegration';

// Add to component body (before return)
const { agentInterface } = useDualInterface({
  componentId: 'your-component-name', // Make unique
  data: {
    // Expose relevant data
    items: photos,
    total: photos.length,
    filtered: filteredPhotos
  },
  state: {
    // Expose current state
    query: searchQuery,
    filters: activeFilters,
    isLoading
  },
  setState: (newState) => {
    // Allow agents to update state
    if (newState.query !== undefined) setSearchQuery(newState.query);
    if (newState.filters !== undefined) setActiveFilters(newState.filters);
  },
  exposeGlobally: true
});
```

### Fix 2: Add AgentWrapper

**Detection:** Component missing `AgentWrapper`

**Fix:**
```typescript
// Add import
import { AgentWrapper } from '@/components/AgentWrapper';

// Wrap return statement
return (
  <AgentWrapper
    agentInterface={agentInterface}
    schemaType="WebApplication" // or SearchAction, ItemList, etc.
  >
    {/* Your existing JSX */}
  </AgentWrapper>
);
```

### Fix 3: Register Agent Actions

**Detection:** Component has actions but they're not registered

**Fix:**
```typescript
// Add import
import { registerAgentAction, unregisterAgentAction } from '@/utils/agent-native/agent-actions';

// Add registration effect
useEffect(() => {
  const actionIds = [
    registerAgentAction({
      action: {
        id: 'search-photos',
        name: 'Search Photos',
        description: 'Search for photos matching a query',
        execute: async ({ query }) => {
          return await performSearch(query);
        }
      }
    }),
    registerAgentAction({
      action: {
        id: 'filter-photos',
        name: 'Filter Photos',
        description: 'Apply filters to photo collection',
        execute: async ({ filters }) => {
          return await applyFilters(filters);
        }
      }
    })
  ];

  // Cleanup
  return () => {
    actionIds.forEach(id => unregisterAgentAction(id));
  };
}, [performSearch, applyFilters]);
```

### Fix 4: Add Schema.org Markup

**Detection:** Component missing semantic markup

**Fix:**
```typescript
return (
  <AgentWrapper agentInterface={agentInterface} schemaType="SearchAction">
    <div
      itemScope
      itemType="https://schema.org/SearchAction"
      data-agent-component="photo-search"
    >
      <meta itemProp="name" content="Photo Search" />
      <meta itemProp="description" content="Search through photo collection" />

      {/* Add itemProp to data elements */}
      <input
        type="search"
        value={query}
        onChange={handleQueryChange}
        itemProp="query-input"
        aria-label="Search photos"
      />

      <div itemProp="result" itemScope itemType="https://schema.org/ItemList">
        <meta itemProp="numberOfItems" content={results.length.toString()} />
        {results.map((item, index) => (
          <div key={item.id} itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
            <meta itemProp="position" content={(index + 1).toString()} />
            {/* Item content */}
          </div>
        ))}
      </div>
    </div>
  </AgentWrapper>
);
```

### Fix 5: Add Natural Language Support

**Detection:** Search/filter component missing command parsing

**Fix:**
```typescript
// Add import
import { PhotoDiscoveryQueryParser } from '@/utils/agent-native/natural-language';

// Create parser instance
const queryParser = useMemo(() => new PhotoDiscoveryQueryParser(), []);

// Add command handler
const handleNaturalLanguageCommand = useCallback((command: string) => {
  const result = queryParser.processQuery(command);

  if (result.success) {
    const { parameters, intent } = result;

    // Apply search parameters
    if (parameters.semantic?.keywords) {
      setSearchKeywords(parameters.semantic.keywords);
    }
    if (parameters.temporal) {
      setDateFilter(parameters.temporal);
    }
    if (parameters.spatial?.location) {
      setLocationFilter(parameters.spatial.location);
    }

    // Execute search
    performSearch(parameters);
  } else {
    console.error('Failed to parse command:', result.error);
  }
}, [queryParser, setSearchKeywords, setDateFilter, setLocationFilter, performSearch]);

// Register command handler
useEffect(() => {
  registerAgentAction({
    action: {
      id: 'natural-language-search',
      name: 'Natural Language Search',
      description: 'Search using natural language commands',
      execute: async ({ command }) => {
        handleNaturalLanguageCommand(command);
        return { success: true };
      }
    }
  });
}, [handleNaturalLanguageCommand]);
```

## Component Type Patterns

### Pattern 1: Search Component

```typescript
export const PhotoSearch: React.FC<Props> = ({ onSearch }) => {
  // 1. Dual interface
  const { agentInterface } = useDualInterface({
    componentId: 'photo-search',
    data: { results, query },
    state: { isSearching },
    setState: setQuery,
    exposeGlobally: true
  });

  // 2. Action registration
  useEffect(() => {
    const id = registerAgentAction({
      action: {
        id: 'search-photos',
        name: 'Search Photos',
        execute: async ({ query }) => onSearch(query)
      }
    });
    return () => unregisterAgentAction(id);
  }, [onSearch]);

  // 3. Natural language
  const handleCommand = useCallback((cmd: string) => {
    const { parameters } = parseQuery(cmd);
    onSearch(parameters);
  }, [onSearch]);

  // 4. Wrapper + Schema
  return (
    <AgentWrapper agentInterface={agentInterface} schemaType="SearchAction">
      <div itemScope itemType="https://schema.org/SearchAction">
        {/* Search UI */}
      </div>
    </AgentWrapper>
  );
};
```

### Pattern 2: Filter Component

```typescript
export const PhotoFilter: React.FC<Props> = ({ onFilter }) => {
  const { agentInterface } = useDualInterface({
    componentId: 'photo-filter',
    data: { availableFilters, activeFilters },
    state: { filterState },
    setState: setFilterState,
    exposeGlobally: true
  });

  useEffect(() => {
    const id = registerAgentAction({
      action: {
        id: 'apply-filters',
        name: 'Apply Filters',
        execute: async ({ filters }) => onFilter(filters)
      }
    });
    return () => unregisterAgentAction(id);
  }, [onFilter]);

  return (
    <AgentWrapper agentInterface={agentInterface} schemaType="FilterAction">
      <div itemScope itemType="https://schema.org/FilterAction">
        {/* Filter UI */}
      </div>
    </AgentWrapper>
  );
};
```

### Pattern 3: Data Display Component

```typescript
export const PhotoGrid: React.FC<Props> = ({ photos }) => {
  const { agentInterface } = useDualInterface({
    componentId: 'photo-grid',
    data: { photos, total: photos.length },
    state: { selectedIds },
    setState: setSelectedIds,
    exposeGlobally: true
  });

  return (
    <AgentWrapper agentInterface={agentInterface} schemaType="ItemList">
      <div itemScope itemType="https://schema.org/ItemList">
        <meta itemProp="numberOfItems" content={photos.length.toString()} />
        {photos.map((photo, index) => (
          <div key={photo.id} itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
            <meta itemProp="position" content={(index + 1).toString()} />
            {/* Photo card */}
          </div>
        ))}
      </div>
    </AgentWrapper>
  );
};
```

## Success Criteria

**Agent-native validation passes when:**

✅ All required elements implemented (useDualInterface, AgentWrapper, actions, schema)
✅ Integration tested (agent can discover and interact with component)
✅ Actions executable via agent interface
✅ Schema markup validates against Schema.org
✅ Natural language commands work (if applicable)
✅ Cleanup functions prevent memory leaks
✅ Component ID is unique across application

## Validation Report Format

```
✅ Agent-Native Validation: PhotoSearch Component

Required Elements:
- ✅ useDualInterface: Present
- ✅ AgentWrapper: Present
- ✅ Action Registration: 2 actions registered
- ✅ Schema.org Markup: Valid SearchAction schema
- ✅ Natural Language: Command parser integrated
- ✅ Cleanup: All registrations have cleanup
- ✅ Unique ID: 'photo-search' (validated)

Integration Test:
- ✅ Global registry: Component discoverable
- ✅ Action execution: 'search-photos' works
- ✅ State updates: Agent can modify search query
- ✅ Data exposure: Search results accessible

Status: PASSED - Ready for deployment
```

---

**Version**: 1.0
**Activation**: Automatic for user-facing components
**Blocking**: Yes (violations prevent feature completion)
**Integration**: execute-task-sonnet45.md Gate 3 (Architecture Validation)
