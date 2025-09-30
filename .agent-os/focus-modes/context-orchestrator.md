---
description: Context Orchestrator Focus Mode - Full context management and cross-document reasoning
mode: context-orchestrator
activation: Task initialization, complex analysis
version: 1.0
---

# Context Orchestrator Focus Mode

## Purpose

Leverage Sonnet 4.5's 200K context window to maintain comprehensive project awareness, enabling holistic reasoning and sophisticated cross-document analysis.

## When to Activate

### Automatic Triggers
- Beginning of new task execution
- Complex feature analysis required
- Architecture planning phase
- Multi-component integration work

### Manual Triggers
- User requests: "analyze the full codebase"
- Strategic planning sessions
- Refactoring large features
- Cross-cutting concern analysis

## Responsibilities

### 1. Comprehensive Context Loading

**Parallel Document Loading:**

```markdown
# Execute in SINGLE message (parallel tool invocation)

Read(@.agent-os/product/mission.md) +
Read(@.agent-os/product/tech-stack.md) +
Read(@.agent-os/product/roadmap.md) +
Read(@.agent-os/standards/architecture-smells.md) +
Read(@.agent-os/standards/best-practices.md) +
Read(@.agent-os/standards/code-style.md) +
Read(@.agent-os/specs/[current-spec]/spec.md) +
Read(@.agent-os/specs/[current-spec]/tasks.md) +
Read(@.agent-os/specs/[current-spec]/sub-specs/technical-spec.md)

# Result: ~30K tokens loaded, ~170K available for work
```

**Context Budget Management:**

```typescript
interface ContextBudget {
  total: 200_000;    // 200K tokens
  allocated: {
    foundationalDocs: 20_000;  // Mission, tech stack, standards
    currentSpec: 8_000;         // Feature specification
    taskList: 2_000;            // Current tasks
    codeContext: 30_000;        // Relevant source files
    workingMemory: 140_000;     // Available for execution
  };
}

// Strategy: Load once, reference throughout session
// Benefit: No re-reads, instant cross-referencing
```

### 2. Cross-Document Reasoning

**Pattern Recognition:**

```markdown
# Analyze patterns across multiple sources simultaneously

EXAMPLE: Planning new SearchInterface component

Cross-Reference:
1. mission.md → Agent-native architecture requirement
2. tech-stack.md → React 19, TypeScript 5.8, Tailwind CSS
3. architecture-smells.md → Component max 200 lines, <5 useState
4. best-practices.md → Service layer separation, Result<T,E> pattern
5. existing codebase → AgentSearchInterface pattern (agent-integration.ts:121)

Synthesis:
- Build on existing AgentSearchInterface pattern
- Ensure dual-interface (human + agent)
- Keep component <200 lines via composition
- Use established error handling pattern
- Follow TypeScript strict mode standards
```

**Integration Planning:**

```markdown
# With full context, identify integration points

TASK: Add new photo discovery feature

Analysis (cross-document):
1. semantic-search-engine.ts → Existing search infrastructure
2. photo-discovery-search.ts → Query parser patterns
3. natural-language.ts → Intent recognition system
4. agent-integration.ts → Agent action registry
5. FilterPanel.tsx → UI integration point
6. useFilterState.ts → State management pattern

Integration Strategy:
- Extend SearchParameters interface
- Add new intent patterns to PhotoDiscoveryQueryParser
- Register actions in AgentActionRegistry
- Integrate with existing FilterPanel workflow
- Follow established hook patterns
```

### 3. Holistic Architecture Understanding

**System-Wide Awareness:**

```markdown
# Maintain mental model of entire system

Architecture Layers (from context):

┌─────────────────────────────────────┐
│  UI Components (React)              │
│  - PhotoCard, FilterPanel, etc.    │
│  - Keep <200 lines, agent-native   │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│  Custom Hooks (State Management)    │
│  - useFilterState, useAgentState    │
│  - Max 3 useEffect deps             │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│  Service Layer (Business Logic)     │
│  - geminiService, smugmugService    │
│  - Result<T,E> error pattern        │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│  Agent Integration (Dual Interface) │
│  - AgentActionRegistry              │
│  - NaturalLanguageProcessor         │
│  - SemanticSearchEngine             │
└─────────────────────────────────────┘

When adding new code:
- PLACE in correct layer
- FOLLOW layer-specific patterns
- RESPECT layer boundaries
- MAINTAIN architecture consistency
```

### 4. Context-Aware Decision Making

**Leverage Full Knowledge:**

```typescript
// Example: Deciding on component structure

Decision: Should FilterPanel be one component or split?

Context Analysis:
1. Current size: ~350 lines (from Read tool)
2. Architecture limit: 200 lines (from architecture-smells.md)
3. User stories: Multiple filter types (from spec.md)
4. Existing pattern: Composed components (from ImageGrid.tsx)

Decision: SPLIT
Rationale:
- Exceeds architecture limit (350 > 200)
- Natural split: BasicFilters + SemanticFilters + DateRangeFilter
- Follows established composition pattern
- Each sub-component can be <200 lines
- Better testability and maintainability

Implementation Strategy:
- Extract BasicFilters.tsx (~80 lines)
- Extract SemanticFilters.tsx (~100 lines)
- Extract DateRangeFilter.tsx (~90 lines)
- Main FilterPanel.tsx becomes ~80 line wrapper
```

## Activation Protocol

### Entry

```markdown
# Entering Context Orchestrator Mode

**Mindset Shift:**
- FROM: Sequential, file-by-file thinking
- TO: Holistic, system-wide reasoning

**Context Activation:**
- Load ALL foundational documents (parallel)
- Build mental model of entire system
- Identify key integration points
- Recognize established patterns

**Reasoning Mode:**
- Cross-reference multiple sources simultaneously
- Think in system architecture, not individual files
- Plan with complete awareness of constraints
- Leverage full project knowledge
```

### During Mode

**Continuous Context Utilization:**

```markdown
# Keep referring to loaded context

WHEN: Making any decision
ASK: What do the standards say? (in memory)
ASK: How is this done elsewhere? (in memory)
ASK: What are the architectural constraints? (in memory)
ASK: What patterns should I follow? (in memory)

WHEN: Implementing feature
REFERENCE: Technical spec (in memory)
REFERENCE: Similar implementations (in memory)
REFERENCE: Architecture standards (in memory)
REFERENCE: Type definitions (in memory)

WHEN: Encountering issues
ANALYZE: Root cause with full context
SEARCH: Similar patterns in codebase
APPLY: Established solution approaches
LEARN: Document for future reference
```

**Mental Context Map:**

```markdown
# Maintain awareness of all loaded documents

├── Mission & Vision
│   └── Agent-native architecture goals
├── Technical Stack
│   └── React 19, TypeScript 5.8, Tailwind
├── Architecture Standards
│   ├── Component limits (<200 lines)
│   ├── Hook complexity (<3 deps)
│   └── Type safety (zero 'any')
├── Current Feature Spec
│   ├── Requirements
│   ├── User stories
│   └── Technical approach
├── Existing Patterns
│   ├── Service layer structure
│   ├── Error handling (Result<T,E>)
│   ├── Agent integration patterns
│   └── Component composition
└── Task List
    ├── Current task
    ├── Dependencies
    └── Acceptance criteria
```

### Exit

```markdown
# Exiting Context Orchestrator Mode

**Context Handoff:**
- Maintain loaded context in memory (don't lose it!)
- Context remains available for other focus modes
- Can return to orchestrator mode anytime

**Transition:**
- Ready for implementation (Architecture Guardian mode)
- Ready for testing (Test Execution mode)
- Ready for validation (final checks)
```

## Integration with Workflow

### In execute-task-sonnet45.md

```markdown
## Step 0: Full Context Initialization

ACTIVATE: Context Orchestrator Mode

# Load all documents (parallel)
Read(mission.md) +
Read(tech-stack.md) +
Read(all standards files) +
Read(current spec) +
Read(tasks.md)

# Build system mental model
ANALYZE: Architecture layers
IDENTIFY: Integration points
RECOGNIZE: Established patterns
UNDERSTAND: Constraints and goals

MAINTAIN: Context throughout session
```

## Benefits

### 1. Holistic Reasoning

**Example:**
```markdown
TASK: Add photo filtering by AI mood

Without Context Orchestrator:
- Read spec → implement → test → discover integration issues
- Miss existing mood index in semantic-search-engine.ts
- Duplicate functionality or create inconsistent patterns
- Need multiple refactor cycles

With Context Orchestrator:
- IMMEDIATELY SEE: Mood already indexed (aiAnalysis.mood)
- RECOGNIZE: Existing moodIndex in SemanticSearchEngine
- IDENTIFY: Integration point in extractParameters
- PLAN: Extend existing infrastructure, not duplicate
- IMPLEMENT: Once, correctly, consistently
```

### 2. Better Integration

**Cross-Component Awareness:**
```markdown
# Can see how changes ripple through system

Change: Add new filter type "technical quality"

Impact Analysis (with full context):
1. Type definitions (types/index.ts) → Add to FilterState
2. Query parser (photo-discovery-search.ts) → Add entity extraction
3. Search engine (semantic-search-engine.ts) → Add quality index
4. UI component (FilterPanel.tsx) → Add filter UI
5. State management (useFilterState.ts) → Handle new filter
6. Agent integration (agent-integration.ts) → Expose to agents

ALL visible in context → comprehensive plan → clean implementation
```

### 3. Pattern Consistency

**Automatic Pattern Recognition:**
```markdown
# With full codebase context, automatically follow patterns

TASK: Add new service function

Pattern Recognition (from context):
1. All services use Result<T, E> error pattern ✓
2. All services have async methods ✓
3. All services have TypeScript interfaces ✓
4. All services handle AbortController ✓

Generated Code:
export interface PhotoAnalysisService {
  analyzePhoto(id: string, signal?: AbortSignal): Promise<Result<Analysis>>;
}

// Automatically follows established pattern
// No need to reference other files
// Pattern already in working memory
```

### 4. Faster Problem Solving

**Multi-Strategy Analysis:**
```markdown
PROBLEM: Tests failing for new component

Context-Enabled Analysis:
1. Test file → See what's being tested
2. Component → See implementation
3. Similar components → See how they handle same issue
4. Best practices → See recommended approach
5. Architecture standards → See constraints

Root Cause: Missing memoization causing infinite re-renders
Solution: (from best-practices.md pattern in memory)
- Add useMemo for computed values
- Add useCallback for handlers
- Verified against existing patterns

Time to solve: 2 minutes (vs. 15+ without context)
```

## Success Metrics

**Target Performance:**
- Context loading: <5 seconds (parallel reads)
- Cross-reference accuracy: >95%
- Pattern recognition: >90% automatic
- Integration planning: Zero missing dependencies

**Quality Indicators:**
- Clean first-time implementations: >80%
- Refactor iterations: <2 per feature
- Integration issues: <5% of implementations
- Pattern consistency: >95% adherence

## Best Practices

### DO:
✅ Load all documents in parallel (single message)
✅ Build comprehensive mental model before coding
✅ Cross-reference multiple sources for decisions
✅ Leverage full context for problem-solving
✅ Maintain context throughout session

### DON'T:
❌ Re-read documents already in context
❌ Make decisions without consulting loaded context
❌ Forget about loaded standards when coding
❌ Lose context between focus modes
❌ Revert to sequential, file-by-file thinking

## Examples

### Example 1: Feature Planning

```markdown
TASK: Implement bulk photo analysis

Context Orchestrator Analysis:
1. Mission (loaded) → Agent-native, user-centric
2. Tech stack (loaded) → React 19, Gemini API
3. Existing code (loaded):
   - NaturalLanguageProcessor handles commands
   - AgentActionRegistry for action registration
   - BulkOperations component for UI
   - geminiService for API calls

Integration Plan (holistic):
- Extend NaturalLanguageProcessor with batch intent
- Register bulk analysis action in registry
- Add UI trigger in BulkOperations
- Use existing geminiService.analyzePhoto in loop
- Follow established error handling pattern
- Ensure <200 lines per component

Result: Clean, integrated implementation following all patterns
```

### Example 2: Debugging

```markdown
PROBLEM: Agent state not updating

Context-Enabled Debug:
1. useAgentState.ts (loaded) → State management logic
2. agent-integration.ts (loaded) → Registration system
3. agentWrapper.tsx (loaded) → Integration point
4. Architecture standards (loaded) → State patterns

Cross-Reference Analysis:
- State updates use setState correctly ✓
- Agent registration happens on mount ✓
- BUT: Missing cleanup in useEffect! (violates CS004)
- AND: State object not properly initialized

Root Cause: Two issues (memory leak + initialization)
Fix: Add cleanup + proper init (from patterns in memory)

Solved with full context awareness in minutes
```

---

**Mode**: Context Orchestrator
**Version**: 1.0
**Activation**: Task initialization
**Integration**: execute-task-sonnet45.md Step 0
**Context Budget**: 30K tokens (15% of 200K)
**Benefit**: Holistic reasoning, faster development, better quality
