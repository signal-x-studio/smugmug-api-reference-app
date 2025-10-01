---
description: Enhanced task execution workflow optimized for Claude Sonnet 4.5 long-context capabilities
globs:
alwaysApply: false
version: 2.0
encoding: UTF-8
model: claude-sonnet-4-5
---

# Task Execution Rules (Sonnet 4.5 Optimized)

## Overview

Execute tasks using Claude Sonnet 4.5's 200K context window and enhanced agentic capabilities. This workflow shifts from token optimization to full-context orchestration, enabling high-level intent engineering rather than step-by-step instructions.

**Key Differences from Legacy Workflow:**
- Full context loading upfront (no conditional blocks)
- Parallel tool invocation for independent operations
- Bash tool integration for real-time validation
- Intent-driven autonomous execution
- Built-in self-validation loops

<pre_flight_check>
  MODEL: claude-sonnet-4-5 (200K context)
  EXECUTE: Full context mode
  VALIDATION: Bash tool integration enabled
</pre_flight_check>

<process_flow>

<step number="0" name="full_context_initialization">

### Step 0: Full Context Initialization (NEW - SONNET 4.5 ONLY)

Load ALL foundational documentation into working memory using parallel reads. No conditional loading - leverage the 200K context window.

<full_context_loading>
  <parallel_reads>
    EXECUTE: All reads in single message (parallel tool invocation)

    Read(@.agent-os/product/mission.md) +
    Read(@.agent-os/product/tech-stack.md) +
    Read(@.agent-os/standards/architecture-smells.md) +
    Read(@.agent-os/standards/best-practices.md) +
    Read(@.agent-os/standards/code-style.md) +
    Read(current spec file from context) +
    Read(current tasks.md file)
  </parallel_reads>

  <memory_strategy>
    MAINTAIN: All documents in working memory throughout session
    BENEFIT: No re-reading, instant cross-referencing, holistic reasoning
    CONTEXT: ~30K tokens for full project context (15% of budget)
  </memory_strategy>
</full_context_loading>

<instructions>
  ACTION: Batch all foundational reads in single message
  MAINTAIN: Full context throughout execution
  LEVERAGE: Cross-document insights and pattern recognition
  SKIP: Conditional loading logic (no longer needed)
</instructions>

</step>

<step number="1" name="intent_understanding">

### Step 1: High-Level Intent Understanding

With full project context in memory, analyze what needs to be built using holistic reasoning rather than sequential analysis.

<holistic_analysis>
  <understand>
    TASK: Current parent task and all sub-tasks (from tasks.md in memory)
    SPEC: Full feature specification (from spec in memory)
    STANDARDS: All architecture patterns and constraints (in memory)
    CONTEXT: Existing codebase patterns and conventions
  </understand>

  <synthesize>
    INTEGRATION: How this fits into overall architecture
    PATTERNS: Which existing patterns to follow/adapt
    CONSTRAINTS: Architecture limits and quality requirements
    STRATEGY: Optimal implementation approach
  </synthesize>
</holistic_analysis>

<instructions>
  THINK: High-level about feature requirements
  LEVERAGE: Full spec and standards already in context
  IDENTIFY: Architectural patterns needed
  MAP: To existing codebase conventions
  PLAN: Comprehensive implementation strategy
</instructions>

</step>

<step number="2" name="architecture_planning">

### Step 2: Architecture Planning with Full Context

Plan implementation with complete awareness of project standards, existing patterns, and feature requirements.

<architecture_awareness>
  <critical_constraints>
    COMPONENT_SIZE: ≤200 lines including JSX
    HOOK_COMPLEXITY: ≤3 dependencies per useEffect, ≤5 useState per component
    TYPE_SAFETY: Zero 'any' types in production code
    PERFORMANCE: useMemo for expensive ops (>10ms), useCallback for handlers
    MEMORY: All useEffect hooks MUST have cleanup functions
    AGENT_NATIVE: Implement dual-interface if user-facing component
  </critical_constraints>

  <self_assessment>
    BEFORE_CODING: Review planned approach against constraints
    ASK: Does this component exceed 200 lines? → Split if yes
    ASK: Are there >3 useEffect dependencies? → Extract custom hook if yes
    ASK: Are types explicit and safe? → Add interfaces if unclear
    ASK: Are expensive operations memoized? → Add useMemo if needed
    ASK: Does this need agent integration? → Plan dual-interface if yes
  </self_assessment>
</architecture_awareness>

<instructions>
  REVIEW: Planned implementation against all constraints (in memory)
  DESIGN: Component structure to stay within limits
  PLAN: Custom hooks if complexity warrants
  ENSURE: Type safety from the start
  CONSIDER: Agent-native requirements if applicable
</instructions>

</step>

<step number="3" name="test_driven_implementation">

### Step 3: Test-Driven Implementation with Self-Validation

Execute TDD workflow with built-in quality gates and continuous self-assessment.

<tdd_workflow>
  <phase_1_tests>
    WRITE: All tests for the feature (typically subtask 1.1)
    INCLUDE: Unit tests, integration tests, edge cases
    ENSURE: Tests cover architecture compliance (component size, type safety)
    RUN: Tests to verify they fail appropriately
    VALIDATE: Test quality before proceeding
  </phase_1_tests>

  <phase_2_implementation>
    FOR each implementation subtask:
      IMPLEMENT: Feature functionality
      SELF_MONITOR: Line count, hook complexity during coding
      VALIDATE: Against standards continuously
      TEST: Make tests pass
      REFACTOR: While keeping tests green
      COMPLETE: Mark subtask done
  </phase_2_implementation>

  <continuous_validation>
    DURING_CODING:
      - Monitor component line count (stop at 180 lines, refactor at 200)
      - Count useState calls (warn at 4, stop at 5)
      - Count useEffect deps (warn at 2, stop at 3)
      - Check for 'any' types (prevent immediately)
      - Ensure memoization patterns applied
      - Verify cleanup functions present
  </continuous_validation>
</tdd_workflow>

<instructions>
  EXECUTE: TDD workflow with built-in self-monitoring
  WRITE: Comprehensive tests first
  IMPLEMENT: With continuous standards validation
  REFACTOR: Proactively when approaching limits
  VERIFY: Each subtask meets quality gates before marking complete
</instructions>

</step>

<step number="4" name="bash_integrated_validation">

### Step 4: Bash-Integrated Architecture Validation (NEW)

Use Bash tool to integrate with subagent validation when available.

<bash_validation_workflow>
  <availability_check>
    CHECK: Does activate-subagent.cjs exist?
    IF EXISTS: Use bash validation workflow
    IF NOT: Use self-validation only (skip bash steps)
  </availability_check>

  <validation_steps>
    WHEN: Component generation complete

    FOR each new/modified component:
      1. Self-assess against standards (full context awareness)
      2. IF subagent available:
         EXECUTE: Bash tool validation
         ```bash
         # Validate component file
         node activate-subagent.cjs validate-file src/path/to/Component.tsx --verbose
         ```
      3. PARSE: Validation output
      4. IF violations detected:
         - ANALYZE: Root cause with full context
         - REFACTOR: Apply fixes
         - RETRY: Validation
         - ITERATE: Until compliant
      5. ELSE:
         - PROCEED: To next component
  </validation_steps>

  <alternative_validation>
    IF subagent not available:
      - RELY: On self-assessment with full standards in context
      - VERIFY: Manual checklist against architecture-smells.md
      - ENSURE: All critical constraints met
  </alternative_validation>
</bash_validation_workflow>

<instructions>
  CHECK: Subagent availability first
  IF AVAILABLE: Use Bash tool for validation
  PARSE: Validation results carefully
  ITERATE: Until zero violations
  IF NOT AVAILABLE: Rigorous self-assessment
</instructions>

</step>

<step number="5" name="sequential_quality_gates">

### Step 5: Sequential Quality Gate Execution (ENHANCED - BLOCKING)

Execute quality gates in sequence with fail-fast logic. Each gate must pass before proceeding to the next.

<quality_gate_philosophy>
  **Principle:** Fail fast at first blocking issue to avoid wasted work
  **Execution:** Sequential (not parallel) to prevent dependent validation waste
  **Enforcement:** All gates are BLOCKING - violations prevent feature completion
</quality_gate_philosophy>

<gate_sequence>
  Gate 1: TypeScript Compilation ← Fastest, catches syntax
    ↓ MUST PASS
  Gate 2: Test Suite Execution ← Validates behavior
    ↓ MUST PASS
  Gate 3: Architecture Validation ← Validates patterns (bash or self-assessment)
    ↓ MUST PASS or SKIP
  Gate 4: Build Validation ← Ensures production readiness
    ↓ MUST PASS
  Gate 5: Runtime Error Detection ← Validates production errors (optional for new features)
    ↓ PASS or SKIP
  ✅ Feature Complete - All Gates Passed
</gate_sequence>

<gate_1_typescript>
  **Gate 1: TypeScript Compilation**

  RUN: Bash: npx tsc --noEmit

  SUCCESS CRITERIA:
  - Exit code: 0
  - TypeScript errors: 0
  - Type safety: No 'any' types (unless justified)
  - Strict mode: Enabled

  IF FAILURE:
    BLOCK: Feature completion
    ANALYZE: Type errors with full context
    FIX: Common issues:
      - Add explicit type annotations
      - Remove 'any' types → use proper types
      - Import missing type definitions
      - Fix type mismatches
    RETRY: Gate 1
    ITERATE: Until pass

  PROCEED: Gate 2 only after pass
</gate_1_typescript>

<gate_2_tests>
  **Gate 2: Test Suite Execution**

  RUN: Bash: npm test

  SUCCESS CRITERIA:
  - All tests passing
  - No test failures
  - No skipped tests (unless documented)
  - Coverage targets met (if configured)

  IF FAILURE:
    BLOCK: Feature completion
    ANALYZE: Test failures with full context
      - CROSS_REFERENCE: Test expectations with spec
      - UNDERSTAND: Root cause of failure
      - IDENTIFY: Implementation vs. expected behavior gap
    FIX: Common issues:
      - Update tests for new behavior
      - Fix implementation bugs
      - Add missing test cases
      - Fix async/timing issues
      - Correct test setup/teardown
    RETRY: Gate 2
    ITERATE: Until all pass

  PROCEED: Gate 3 only after pass
</gate_2_tests>

<gate_3_architecture>
  **Gate 3: Architecture Validation**

  IF subagent available:
    RUN: Bash: node activate-subagent.cjs validate-project --verbose

    SUCCESS CRITERIA:
    - Architecture violations: 0
    - Component size: ≤200 lines
    - Hook complexity: ≤3 dependencies per useEffect
    - Type safety: Zero 'any' types
    - Cleanup: All effects have cleanup functions
    - Memoization: Applied where needed

    IF FAILURE:
      BLOCK: Feature completion
      ANALYZE: Violations with architecture-smells.md context
      FIX: Common issues:
        - Extract large components (<200 lines)
        - Simplify complex hooks (<3 deps)
        - Add cleanup functions to effects
        - Apply memoization (useMemo, useCallback)
        - Remove 'any' types
      RETRY: Gate 3
      ITERATE: Until compliant

  ELSE:
    SKIP: Bash validation not available
    FALLBACK: Self-assessment via Architecture Guardian mode
      - Manual checklist verification
      - Component size check
      - Hook complexity review
      - Type safety confirmation

  PROCEED: Gate 4 after pass or skip
</gate_3_architecture>

<gate_4_build>
  **Gate 4: Build Validation**

  RUN: Bash: npm run build

  SUCCESS CRITERIA:
  - Build completes successfully
  - No build errors
  - Bundle size within budget (if configured)
  - No critical warnings

  IF FAILURE:
    BLOCK: Feature completion
    ANALYZE: Build errors with full context
    FIX: Common issues:
      - Resolve import errors
      - Fix dynamic imports
      - Address bundler warnings
      - Optimize bundle size (tree-shaking, code-splitting)
      - Fix production-specific issues
    RETRY: Gate 4
    ITERATE: Until build succeeds

  PROCEED: Gate 5 (Runtime Error Detection)
</gate_4_build>

<gate_5_runtime_errors>
  **Gate 5: Runtime Error Detection (OPTIONAL)**

  WHEN: New components or significant features added

  RUN: Bash: pnpm test -- src/testing/runtime-errors/__tests__/ --run

  SUCCESS CRITERIA:
  - All runtime error detection tests passing
  - No new critical errors introduced
  - Agent-native integration errors: 0
  - API integration errors handled gracefully
  - Component errors caught by boundaries

  IF FAILURE:
    ANALYZE: Runtime error test failures
    IDENTIFY: Error category:
      - agent-native: Agent action/interface issues
      - api-integration: SmugMug/Gemini API failures
      - data-error: Null/undefined access violations
      - component-error: React rendering errors
      - hook-error: Hook dependency issues
    FIX: Based on error category
    RETRY: Gate 5
    ITERATE: Until tests pass

  OPTIONAL E2E VALIDATION:
    IF major feature or agent integration:
      RUN: Bash: pnpm test:runtime-errors
      VERIFY: No runtime errors in E2E scenarios
      REPORT: Error detection summary

  PROCEED: Feature completion
</gate_5_runtime_errors>

<failure_handling>
  **Failure Handling Protocol**

  IF any gate fails:
    1. BLOCK feature completion immediately
    2. ANALYZE failure with full context
    3. APPLY fix automatically (if straightforward)
    4. RETRY failed gate
    5. IF 3 attempts fail:
       - ESCALATE to human
       - PROVIDE detailed failure report:
         • Gate that failed
         • Specific violations
         • Fixes attempted
         • Recommended manual intervention
    6. WAIT for human resolution

  NEVER:
  - Skip a gate because it's failing
  - Proceed to next gate before current passes
  - Mark feature complete with gate failures

  ALWAYS:
  - Fix root cause, not symptoms
  - Validate fix with re-run
  - Document persistent issues
</failure_handling>

<instructions>
  EXECUTE: Gates in strict sequence (1 → 2 → 3 → 4)
  BLOCK: At first failure, fix before proceeding
  RETRY: Each gate until pass
  ESCALATE: After 3 failed attempts
  REPORT: Final status with all gate results
</instructions>

</step>

<step number="6" name="work_preservation">

### Step 6: Work Preservation (NEW - PREVENTS WORK LOSS)

Automatically preserve work progress through continuous commits and branch protection.

<work_preservation_system>
  <auto_commit_triggers>
    **Auto-Commit Triggers:**

    WHEN:
    - Every 30 minutes of active work
    - After all quality gates pass
    - Before branch operations (checkout, switch)
    - On explicit user checkpoint request
    - Before major refactoring

    COMMIT FORMAT:
    ```
    wip: [component/feature] - [progress description]

    Progress:
    - [What's been implemented]
    - [What's currently working]
    - [What's next]

    Status:
    - Tests: [X passing / Y total or "WIP"]
    - Quality Gates: [which gates passed]
    - Coverage: [percentage if available]

    🤖 Auto-preserved checkpoint
    Co-Authored-By: Claude <noreply@anthropic.com>
    ```

    EXECUTE: Bash: git add . && git commit -m "[message]"
  </auto_commit_triggers>

  <branch_protection>
    **Branch Protection Protocol:**

    BEFORE any git checkout or branch switch:

    1. DETECT uncommitted changes:
       Bash: git status --porcelain

    2. IF uncommitted work found:
       PROMPT user with options:
       ```
       ⚠️  Uncommitted work detected:

       Modified files:
       - [file1]
       - [file2]
       - [file3]

       Options:
       1. Commit now (recommended) - preserves work with proper message
       2. Create checkpoint branch - saves as checkpoint/[feature]-[timestamp]
       3. Stash with recovery tag - "WIP: [feature] - [timestamp]"
       4. Abort checkout - stays on current branch

       Your choice?
       ```

    3. WAIT for user choice

    4. EXECUTE chosen option:
       - Option 1: Create commit with detailed message
       - Option 2: Bash: git checkout -b checkpoint/[feature]-$(date +%Y%m%d-%H%M)
       - Option 3: Bash: git stash push -m "WIP: [feature] - $(date +%Y-%m-%d-%H:%M)"
       - Option 4: Cancel checkout operation

    5. VERIFY: No work lost, can be recovered

    **Checkpoint Branch Format:**
    checkpoint/[feature-name]-[YYYYMMDD-HHMM]

    Examples:
    - checkpoint/photo-filter-20250930-1430
    - checkpoint/search-interface-20250930-1645
  </branch_protection>

  <recovery_instructions>
    **Work Recovery:**

    List checkpoints:
    Bash: git branch -a | grep checkpoint

    Restore from checkpoint:
    Bash: git checkout checkpoint/[name]

    List stashes:
    Bash: git stash list

    Restore from stash:
    Bash: git stash pop stash@{0}
  </recovery_instructions>
</work_preservation_system>

<instructions>
  COMMIT: Every 30 minutes automatically
  PROTECT: Before any branch operations
  PROMPT: User with 4 options if uncommitted work
  PRESERVE: Zero work loss tolerance
  DOCUMENT: Clear recovery instructions
</instructions>

</step>

<step number="7" name="task_tracking_and_completion">

### Step 7: Task Tracking Updates & Safe Completion

Update task documentation to reflect implementation progress and safely commit all changes.

<task_tracking_protocol>
  <realtime_tracking>
    **During Implementation:**

    USE: TodoWrite tool to track progress in real-time
    UPDATE: Task status as work progresses:
      - pending → in_progress when starting
      - in_progress → completed when done
      - Add new discovered tasks as needed

    MAINTAIN: Single in_progress task at a time
    COMPLETE: Tasks immediately after finishing (no batching)

    BENEFIT: User visibility into progress, prevents forgotten work
  </realtime_tracking>

  <completion_updates>
    **Upon Feature Completion:**

    1. UPDATE tasks.md file:
       READ: Current tasks.md
       IDENTIFY: Parent task and all related subtasks
       MARK: [x] for completed items
       DATE: Add completion timestamp if using dated format
       NOTES: Add implementation notes if significant

    2. VERIFY completion status:
       ✅ All subtasks marked complete
       ✅ No orphaned TODO comments in code
       ✅ All quality gates passed
       ✅ Documentation updated

    3. IF blocked after 3 gate attempts:
       MARK: [ ] (incomplete)
       DOCUMENT:
       ```
       ⚠️ BLOCKED: [Task name]

       Issue: [Specific blocking problem]
       Attempts: [What was tried]
       Gate Failed: [Which gate failed]
       Next Steps: [Manual intervention needed]
       Context: [Relevant file/line references]
       ```
  </completion_updates>

  <roadmap_synchronization>
    **Roadmap Updates (if applicable):**

    IF task is from roadmap.md:
      READ: roadmap.md
      UPDATE: Phase/milestone completion status
      MARK: [x] for completed roadmap items
      UPDATE: Progress percentages if tracked
      NOTE: Implementation completion date
  </roadmap_synchronization>
</task_tracking_protocol>

<safe_commit_protocol>
  <pre_commit_verification>
    **Pre-Commit Checklist:**

    RUN in parallel:
    - Bash: git status --porcelain (detect changes)
    - Bash: git diff --stat (summarize changes)
    - Bash: git log -1 --format='%an %ae' (check authorship)

    VERIFY:
    ✓ Only intended files modified
    ✓ No sensitive data in changes (.env, keys, secrets)
    ✓ All quality gates passed
    ✓ No debug code left behind
    ✓ Documentation updated
  </pre_commit_verification>

  <completion_commit>
    **Feature Completion Commit:**

    FORMAT:
    ```
    feat: [Feature name] - Implementation complete

    Changes:
    - [Component/file changed and why]
    - [New features added]
    - [Tests added/updated]

    Quality Gates:
    ✅ Gate 1 (TypeScript): Passed
    ✅ Gate 2 (Tests): [X/Y] passing ([Z]% coverage)
    ✅ Gate 3 (Architecture): Passed [with warnings]
    ✅ Gate 4 (Build): Passed ([size] gzipped)

    Implementation Notes:
    - [Key decisions made]
    - [Architecture patterns used]
    - [Known limitations/TODOs]

    Task Status:
    - tasks.md: Updated [task reference]
    - roadmap.md: Updated [if applicable]

    🤖 Generated with [Claude Code](https://claude.com/claude-code)

    Co-Authored-By: Claude <noreply@anthropic.com>
    ```

    EXECUTE: Bash: git add . && git commit -m "$(cat <<'EOF'
    [commit message here]
    EOF
    )"
  </completion_commit>

  <post_commit_validation>
    **Post-Commit Verification:**

    RUN: Bash: git log -1 --stat
    VERIFY:
    ✓ Commit created successfully
    ✓ All intended files included
    ✓ Commit message properly formatted
    ✓ No files missed

    REPORT to user:
    ```
    ✅ Feature Implementation Complete

    Commit: [commit hash]
    Files Changed: [count]
    Quality Gates: All Passed

    Tasks Updated:
    - tasks.md: [task marked complete]
    - roadmap.md: [phase updated if applicable]

    Ready for: [next step - PR, deployment, etc.]
    ```
  </post_commit_validation>

  <uncommitted_work_handling>
    **If Uncommitted Work Detected:**

    SCENARIO 1: All gates passed, ready to commit
    → Execute completion commit immediately

    SCENARIO 2: Work in progress, gates not run
    → Trigger auto-commit from Step 6 (work preservation)
    → Use WIP commit format

    SCENARIO 3: Gates failed, investigation needed
    → DO NOT commit broken code
    → Create WIP commit with clear status:
      ```
      wip: [feature] - Investigation in progress

      Status:
      ❌ Gate [X] failed: [reason]

      Debugging:
      - [What's been tried]
      - [Current hypothesis]

      Next: [What to try next]

      🤖 Auto-preserved for investigation
      ```

    NEVER: Leave work uncommitted at session end
    ALWAYS: Preserve state for recovery
  </uncommitted_work_handling>
</safe_commit_protocol>

<instructions>
  **Execution Order:**

  1. UPDATE TodoWrite: Mark all tasks completed
  2. UPDATE tasks.md: Mark [x] for completed items
  3. UPDATE roadmap.md: If applicable
  4. VERIFY: Pre-commit checklist complete
  5. CREATE: Feature completion commit
  6. VERIFY: Post-commit validation
  7. REPORT: Summary to user

  **Completion Criteria:**

  ✅ All quality gates passed
  ✅ TodoWrite tasks marked completed
  ✅ tasks.md updated with [x]
  ✅ roadmap.md updated (if applicable)
  ✅ Clean commit created
  ✅ No uncommitted changes
  ✅ User informed of completion

  **Failure Protocol:**

  IF cannot commit (gate failures):
    - Create WIP commit with status
    - Document blocking issue
    - Mark task incomplete with ⚠️
    - Preserve work for recovery

  NEVER:
  - Leave uncommitted work at session end
  - Commit code with failing gates (unless WIP)
  - Skip task.md updates
  - Lose implementation progress

  ALWAYS:
  - Safe commit with detailed message
  - Task tracking fully updated
  - Clear completion status
  - Recovery path documented
</instructions>

</step>

</process_flow>

<post_flight_check>
  EXECUTE: @.agent-os/instructions/meta/post-flight.md
</post_flight_check>

## Key Advantages of Sonnet 4.5 Workflow

### Full Context Benefits
- **Holistic Reasoning**: Cross-reference specs, standards, and code simultaneously
- **Pattern Recognition**: Identify similar implementations across codebase
- **Better Integration**: Understand how new code fits into architecture
- **Smarter Debugging**: Analyze failures with complete project context

### Parallel Execution
- **Faster Initialization**: Load all docs at once vs. sequential reads
- **Reduced Latency**: Batch independent operations
- **Better Performance**: Minimize round-trips

### Bash Integration
- **Real-time Validation**: Automated architecture enforcement
- **Objective Metrics**: Subagent provides measurable compliance
- **Iterative Refinement**: Quick fix-validate loops
- **Confidence Building**: External validation confirms quality

### Intent-Driven Development
- **Higher Abstraction**: Focus on what to build, not how to code
- **Autonomous Execution**: Model handles implementation details
- **Self-Validation**: Continuous quality checks during coding
- **Efficient Workflow**: Less micro-management, more delegation

## Workflow Comparison

| Aspect | Legacy Workflow | Sonnet 4.5 Workflow |
|--------|----------------|---------------------|
| Context Loading | Conditional (token-optimized) | Full upfront (parallel) |
| File Reads | Sequential | Parallel batches |
| Validation | Manual references | Bash tool integration |
| Execution Style | Step-by-step instructions | Intent + autonomous |
| Error Recovery | 3-attempt limit | Multi-strategy with context |
| Code Generation | Guided line-by-line | Self-monitored with standards |
| Quality Assurance | Post-implementation | Continuous during coding |

## Success Criteria

- [ ] All foundational docs loaded in initial context
- [ ] Parallel reads used for independent files
- [ ] Bash validation integrated (if subagent available)
- [ ] Self-monitoring prevents architecture violations
- [ ] Tests written and passing before completion
- [ ] Zero 'any' types in production code
- [ ] All components ≤200 lines
- [ ] All effects have cleanup functions
- [ ] Memoization applied to expensive operations

---

**Version**: 2.0 (Sonnet 4.5 Optimized)
**Last Updated**: 2025-09-30
**Model**: claude-sonnet-4-5 (200K context)
**Backwards Compatible**: No (use execute-task.md for smaller models)
