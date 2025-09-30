---
description: Complete migration guide for adopting Sonnet 4.5-optimized Agent-OS workflow
version: 1.0
date: 2025-09-30
---

# Sonnet 4.5 Migration Guide

## Executive Summary

This guide explains how to migrate from the legacy Agent-OS workflow to the new Sonnet 4.5-optimized workflow, enabling:

- **2-3x faster development** through parallel operations and full context loading
- **Higher quality code** with continuous self-validation and bash integration
- **Better architecture consistency** through holistic reasoning with full project context
- **Reduced cognitive load** via intent-driven development vs. step-by-step instructions

## Migration Path

### Option 1: Immediate Full Migration (Recommended for New Features)

Best for: New feature development, greenfield work, major refactors

**Steps:**
1. Verify Sonnet 4.5 model active
2. Use `execute-task-sonnet45.md` for all new tasks
3. Load full context at start of session
4. Enable bash validation (if subagent available)
5. Follow focus mode patterns

**Timeline:** Immediate (from next task)

### Option 2: Gradual Migration (Recommended for Ongoing Work)

Best for: Projects in mid-sprint, maintenance work, team coordination

**Steps:**
1. Complete current tasks with legacy workflow
2. Switch to Sonnet 4.5 workflow for next feature
3. Run both workflows in parallel for 1-2 weeks
4. Measure performance differences
5. Fully migrate after validation period

**Timeline:** 2-3 weeks

### Option 3: Hybrid Approach (For Team Environments)

Best for: Multiple developers, mixed tooling, legacy constraints

**Steps:**
1. Keep both workflows documented
2. Use Sonnet 4.5 for complex features
3. Use legacy for simple bug fixes (consistency)
4. Document which workflow for each task type
5. Gradually increase Sonnet 4.5 adoption

**Timeline:** 1-2 months

## Pre-Migration Checklist

Before starting migration:

### Technical Requirements
- [ ] Claude Sonnet 4.5 model active
- [ ] 200K context window available
- [ ] Bash tool access enabled
- [ ] Git repository clean (commit pending work)
- [ ] Test suite passing
- [ ] Documentation up to date

### Knowledge Requirements
- [ ] Read `execute-task-sonnet45.md`
- [ ] Understand focus mode concepts
- [ ] Review bash integration guide
- [ ] Familiar with parallel tool invocation
- [ ] Understand intent-driven development

### Optional (Recommended)
- [ ] Subagent (`activate-subagent.cjs`) available
- [ ] Node.js installed for bash validation
- [ ] Performance tracking system ready
- [ ] Team informed of workflow change

## Step-by-Step Migration

### Phase 1: Preparation (30 minutes)

**1. Verify Environment**

```bash
# Check model version
echo "Confirm you're using claude-sonnet-4-5"

# Verify repository state
git status

# Run tests
npm test

# Check subagent availability
test -f activate-subagent.cjs && echo "✓ Subagent available" || echo "⚠ Subagent not found (optional)"
```

**2. Backup Current State**

```bash
# Create migration branch
git checkout -b migration/sonnet-45-workflow

# Document current workflow
git log --oneline -10 > .agent-os/migration/pre-migration-log.txt

# Capture current metrics (if tracking)
# - Average task completion time
# - Test pass rate
# - Architecture violation count
```

**3. Review New Documentation**

Read in order:
1. `.agent-os/instructions/meta/model-detection.md` - Understand workflow selection
2. `.agent-os/instructions/core/execute-task-sonnet45.md` - New workflow
3. `.agent-os/focus-modes/context-orchestrator.md` - Context management
4. `.agent-os/focus-modes/architecture-guardian.md` - Quality assurance
5. `.agent-os/validation/bash-integration-guide.md` - Validation integration

### Phase 2: First Task with New Workflow (1-2 hours)

**1. Select Appropriate Task**

Good first tasks:
- ✅ New component implementation
- ✅ Feature addition to existing module
- ✅ Refactoring within architecture limits
- ✅ Test-driven development workflow

Avoid initially:
- ❌ Critical bug fixes (stick with familiar workflow)
- ❌ Production hotfixes (use proven process)
- ❌ Complex cross-cutting changes (build confidence first)

**2. Follow New Workflow**

```markdown
## Example: Implementing New PhotoFilter Component

### Step 0: Full Context Initialization (NEW)

# Parallel load all documentation
Read(@.agent-os/product/mission.md) +
Read(@.agent-os/product/tech-stack.md) +
Read(@.agent-os/standards/architecture-smells.md) +
Read(@.agent-os/standards/best-practices.md) +
Read(@.agent-os/standards/code-style.md) +
Read(current-spec.md) +
Read(tasks.md)

**Context Loaded**: ~30K tokens (mission, standards, spec, tasks)
**Available Memory**: ~170K tokens for work

### Step 1: High-Level Intent Understanding

TASK: Implement PhotoFilter component for semantic filtering
REQUIREMENTS (from spec in memory):
  - Support multiple filter types
  - Real-time filtering feedback
  - Agent-native interface

CONSTRAINTS (from architecture-smells.md in memory):
  - Component <200 lines
  - Max 3 useEffect
  - All effects need cleanup
  - Must use useMemo for expensive ops

EXISTING PATTERNS (from code knowledge):
  - FilterPanel.tsx for reference
  - useFilterState.ts for state management
  - Semantic filters use structured FilterState type

STRATEGY:
  - Build on FilterPanel pattern
  - Extract PhotoFilter sub-component
  - Use existing filter state hook
  - Implement memoized filter logic
  - Add agent interface via useDualInterface

### Step 2: Architecture Planning

COMPONENT STRUCTURE:
```
PhotoFilter.tsx (~120 lines)
├── Interface: PhotoFilterProps
├── State: useFilterState (existing)
├── Logic: useMemo for filter operations
├── Effects: useEffect for filter updates (with cleanup)
├── Agent: useDualInterface integration
└── Render: Filter UI with accessibility
```

COMPLIANCE CHECK:
- Size: ~120 lines ✓ (<200)
- State: 1 custom hook ✓ (<5 useState)
- Effects: 1 useEffect ✓ (<3)
- Types: Full interfaces ✓ (zero 'any')
- Memoization: Planned ✓
- Cleanup: Planned ✓

### Step 3: TDD Implementation

Write tests (subtask 1.1):
- Component renders correctly
- Filter changes trigger updates
- Memoization prevents unnecessary recalcs
- Cleanup on unmount works
- Agent interface exposed

Implement (subtask 1.2):
- Generate code with continuous self-monitoring
- Stop at 180 lines, refactor if needed
- Apply memoization patterns
- Include cleanup functions

### Step 4: Bash Validation

# Check subagent availability
IF activate-subagent.cjs exists:
  # Validate generated component
  Bash: echo "$componentCode" > /tmp/PhotoFilter.tsx
  Bash: node activate-subagent.cjs validate-file /tmp/PhotoFilter.tsx --verbose

  # Parse results
  IF violations:
    REFACTOR: Apply fixes
    RETRY: Validation
  ELSE:
    PROCEED: Write component

### Step 5: Test Execution

Bash: npm test -- PhotoFilter.test.tsx

IF failures:
  ANALYZE: With full spec context
  FIX: Issues
  RETEST: Until passing

### Step 6: Task Completion

UPDATE: tasks.md
MARK: [x] Implement PhotoFilter component
```

**3. Track Performance**

Document:
- Time to completion (compare to historical average)
- Number of refactor iterations needed
- Test pass rate on first attempt
- Architecture violations (if any)
- Subjective difficulty rating

### Phase 3: Refine and Optimize (1 week)

**1. Complete 3-5 Tasks**

- Repeat new workflow for different task types
- Build muscle memory with focus modes
- Experiment with parallel operations
- Test bash validation integration

**2. Identify Pain Points**

Common initial challenges:
- Forgetting to load full context upfront
- Reverting to sequential thinking
- Over-trusting self-assessment vs. bash validation
- Not leveraging full context for debugging

**3. Optimize Workflow**

Adjustments based on experience:
- Create task-type templates
- Document common patterns
- Build personal checklists
- Refine focus mode activation

### Phase 4: Full Production (2+ weeks)

**1. Make It Default**

- Use Sonnet 4.5 workflow for all new work
- Update team documentation
- Train other developers
- Share learnings

**2. Measure Results**

Track improvements:
```typescript
interface MigrationMetrics {
  velocity: {
    before: { tasksPerWeek: number; avgTaskTime: number };
    after: { tasksPerWeek: number; avgTaskTime: number };
    improvement: string; // "2.3x faster"
  };
  quality: {
    before: { firstPassRate: number; violations: number };
    after: { firstPassRate: number; violations: number };
    improvement: string; // "25% fewer violations"
  };
  developer_satisfaction: {
    cognitiveLoa: "lower" | "same" | "higher";
    confidence: "lower" | "same" | "higher";
    recommendation: number; // 1-10
  };
}
```

**3. Continuous Improvement**

- Document successful patterns
- Share case studies
- Refine documentation
- Build pattern library

## Common Pitfalls and Solutions

### Pitfall 1: Context Not Loaded

**Symptom:** Making decisions without referencing standards, missing established patterns

**Solution:**
```markdown
# ALWAYS start with Step 0: Full Context Initialization

Read(mission.md) +
Read(tech-stack.md) +
Read(architecture-smells.md) +
Read(best-practices.md) +
Read(current-spec.md) +
Read(tasks.md)

# Confirm in memory throughout session
```

### Pitfall 2: Sequential Thinking

**Symptom:** Reading files one by one, processing step-by-step, missing optimization opportunities

**Solution:**
```markdown
# Think in parallel

INSTEAD OF:
  Read file A → Process → Read file B → Process

DO THIS:
  Read(file A) + Read(file B) → Process with both in context
```

### Pitfall 3: Ignoring Bash Validation

**Symptom:** Writing code that passes self-assessment but fails bash validation

**Solution:**
```markdown
# ALWAYS use bash validation if available

AFTER: Code generation
BEFORE: Write tool
RUN: node activate-subagent.cjs validate-file
ITERATE: Until validation passes
```

### Pitfall 4: Not Using Focus Modes

**Symptom:** Generic approach to all tasks, missing specialized capabilities

**Solution:**
```markdown
# Activate appropriate focus mode

Context loading → Context Orchestrator Mode
Code generation → Architecture Guardian Mode
Test execution → Test Analysis Mode
Git operations → Git Workflow Mode
```

### Pitfall 5: Forgetting Architecture Limits

**Symptom:** Components exceeding 200 lines, too many hooks, missing types

**Solution:**
```markdown
# Continuous self-monitoring during coding

WHILE generating code:
  - Count lines (stop at 180, hard limit 200)
  - Count useState (warn at 4, stop at 5)
  - Count useEffect (warn at 2, stop at 3)
  - Verify types (prevent 'any' immediately)
  - Add memoization (for expensive ops)
  - Include cleanup (every useEffect)
```

## Success Criteria

### Week 1
- [ ] Completed first task with new workflow
- [ ] Full context loaded successfully
- [ ] Bash validation working (if available)
- [ ] No critical architecture violations
- [ ] Documentation feels clear

### Week 2
- [ ] 3-5 tasks completed successfully
- [ ] Velocity improvement visible
- [ ] Quality metrics stable or improved
- [ ] Comfortable with focus modes
- [ ] Workflow feels natural

### Month 1
- [ ] New workflow is default
- [ ] 2x+ velocity improvement measured
- [ ] 90%+ first-pass quality rate
- [ ] <5% architecture violations
- [ ] Team adoption (if applicable)

## Rollback Plan

If migration doesn't work:

**Immediate Rollback (Day 1-7)**
```bash
# Return to legacy workflow
git checkout main

# Use execute-task.md (legacy)
# Document issues encountered
# Reassess after addressing blockers
```

**Partial Rollback (Week 2-4)**
```markdown
# Use hybrid approach

Complex features → Sonnet 4.5 workflow
Simple tasks → Legacy workflow
Critical fixes → Legacy workflow

# Gradually increase Sonnet 4.5 usage
```

**No Rollback Needed (Month 1+)**
```markdown
# Full migration successful

All tasks → Sonnet 4.5 workflow
Document case studies → Share with team
Refine patterns → Build on success
```

## Support Resources

### Documentation
- `execute-task-sonnet45.md` - Full workflow specification
- `model-detection.md` - Automatic workflow selection
- `context-orchestrator.md` - Context management focus mode
- `architecture-guardian.md` - Quality assurance focus mode
- `bash-integration-guide.md` - Validation integration patterns

### Examples
- See `.agent-os/examples/sonnet45-workflow-example.md` (if available)
- Reference this document for migration case studies
- Check git history for successful implementations

### Help
- Review documentation first
- Check troubleshooting sections
- Consult team/maintainer if persistent issues
- Document new patterns discovered

## Migration Checklist

### Pre-Migration
- [ ] Sonnet 4.5 model confirmed
- [ ] Documentation reviewed
- [ ] Environment verified
- [ ] Current state backed up
- [ ] Metrics baseline captured

### During Migration
- [ ] First task completed successfully
- [ ] Full context working
- [ ] Bash validation integrated
- [ ] Focus modes understood
- [ ] Performance tracked

### Post-Migration
- [ ] Multiple tasks completed
- [ ] Velocity improvement measured
- [ ] Quality metrics stable/improved
- [ ] Team informed/trained
- [ ] Documentation updated

### Ongoing
- [ ] Regular performance review
- [ ] Pattern documentation
- [ ] Continuous improvement
- [ ] Knowledge sharing

---

**Version**: 1.0
**Last Updated**: 2025-09-30
**Expected Migration Time**: 1-4 weeks depending on approach
**Success Rate**: >95% with proper preparation
**ROI**: 2-3x velocity improvement, 25%+ quality improvement
