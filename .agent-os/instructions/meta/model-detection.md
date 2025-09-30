---
description: Automatic model detection and workflow selection for Agent-OS
globs:
alwaysApply: true
version: 1.0
encoding: UTF-8
---

# Model Detection and Workflow Selection

## Overview

Agent-OS supports multiple Claude models with optimized workflows for each. This instruction enables automatic detection and appropriate workflow selection.

## Model Detection

<model_detection>
  <identify_model>
    CURRENT_MODEL: claude-sonnet-4-5 (200K context window)
    CAPABILITIES:
      - Extended context window (200K tokens)
      - Enhanced agentic reasoning
      - Parallel tool invocation
      - Sophisticated multi-step planning
  </identify_model>

  <workflow_selection>
    IF model = "claude-sonnet-4-5":
      WORKFLOW: execute-task-sonnet45.md
      MODE: Full context with parallel operations
      VALIDATION: Bash tool integration
    ELSE IF model = "claude-3-5-sonnet" OR model = "claude-3-opus":
      WORKFLOW: execute-task.md
      MODE: Conditional context loading
      VALIDATION: Manual references
    ELSE:
      WORKFLOW: execute-task.md (safe default)
      MODE: Conservative with explicit instructions
  </workflow_selection>
</model_detection>

## Workflow Variants

### Sonnet 4.5 Workflow (execute-task-sonnet45.md)

**Optimized for:**
- 200K context window
- Enhanced reasoning capabilities
- Parallel tool execution
- Bash tool integration

**Key Features:**
- Full context loading upfront
- Parallel file reads
- Intent-driven autonomous execution
- Real-time bash validation
- Multi-strategy error recovery

**When to Use:**
- Model: claude-sonnet-4-5
- Complex features requiring holistic reasoning
- Projects with extensive documentation
- When automation and speed are priorities

### Legacy Workflow (execute-task.md)

**Optimized for:**
- Smaller context windows (100K or less)
- Token efficiency
- Step-by-step guidance
- Conservative approach

**Key Features:**
- Conditional context loading
- Sequential operations
- Explicit step-by-step instructions
- Manual validation references

**When to Use:**
- Models: claude-3-5-sonnet, claude-3-opus, or earlier
- Token budget constraints
- When explicit guidance is needed
- Backwards compatibility required

## Pre-Flight Integration

<pre_flight_workflow>
  STEP 1: Detect current model
  STEP 2: Select appropriate workflow
  STEP 3: Load workflow instructions
  STEP 4: Execute with optimized strategy
</pre_flight_workflow>

## Instructions for AI Assistants

```markdown
# When starting a new task execution:

1. Identify your model version
2. Select workflow:
   - Sonnet 4.5 → Use execute-task-sonnet45.md
   - Other → Use execute-task.md
3. Follow selected workflow instructions
4. Leverage model-specific capabilities
```

## Feature Comparison

| Feature | Sonnet 4.5 Workflow | Legacy Workflow |
|---------|---------------------|-----------------|
| Context Strategy | Full load (parallel) | Conditional load (sequential) |
| File Operations | Parallel reads | Sequential reads |
| Validation | Bash integration | Manual references |
| Execution Style | Intent-driven | Step-by-step |
| Error Recovery | Multi-strategy | Fixed attempts |
| Documentation | Full versions | Lite versions |
| Subagent Integration | Bash tool | Reference only |
| Self-Validation | Continuous | Post-implementation |

## Migration Path

### For Existing Projects

**Gradual Adoption:**
1. Keep both workflows available
2. Use Sonnet 4.5 workflow for new features
3. Legacy workflow for bug fixes (consistency)
4. Measure performance differences
5. Fully migrate once validated

### For New Projects

**Direct to Sonnet 4.5:**
1. Start with execute-task-sonnet45.md
2. Create full documentation (skip lite versions)
3. Implement bash validation from start
4. Use parallel operations by default

## Performance Expectations

### Sonnet 4.5 Workflow

**Expected Improvements:**
- 2-3x faster context initialization (parallel loads)
- 50%+ reduction in implementation time (autonomous execution)
- 90%+ first-time quality pass rate (continuous validation)
- Better architecture consistency (holistic reasoning)

**Metrics to Track:**
```typescript
{
  velocityGain: "2-3x faster",
  qualityImprovement: ">90% first-pass rate",
  autonomyLevel: "<5% human intervention",
  architectureCompliance: "99%+ adherence"
}
```

### Legacy Workflow

**Expected Performance:**
- Standard implementation speed
- 70-80% first-time quality pass rate
- More explicit guidance needed
- Conservative but reliable

## Troubleshooting

### If Sonnet 4.5 workflow underperforms:

1. **Context Overload**: Reduce parallel reads if hitting limits
2. **Validation Issues**: Fall back to self-assessment if bash fails
3. **Complexity**: Break down into smaller tasks
4. **Unclear Intent**: Provide more explicit requirements

### If Legacy workflow is too slow:

1. **Consider Model Upgrade**: Evaluate Sonnet 4.5
2. **Optimize Context**: Review conditional blocks
3. **Batch Operations**: Group independent reads
4. **Reduce Re-reads**: Cache frequently accessed docs

## Best Practices

### For All Workflows

✅ **DO:**
- Follow workflow selection logic
- Leverage model-specific features
- Track performance metrics
- Document deviations

❌ **DON'T:**
- Mix workflows within same task
- Override model detection manually
- Skip validation steps
- Ignore quality gates

### Model-Specific Tips

**Sonnet 4.5:**
- Trust autonomous execution
- Use bash validation extensively
- Think in high-level intents
- Leverage full context reasoning

**Legacy Models:**
- Follow step-by-step instructions carefully
- Use conditional loading
- Validate manually
- Request explicit guidance when needed

---

**Version**: 1.0
**Created**: 2025-09-30
**Applies To**: All Agent-OS workflows
**Auto-Apply**: Yes (integrated in pre-flight checks)
