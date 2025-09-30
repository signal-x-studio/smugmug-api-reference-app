---
description: Common Pre-Flight Steps for Agent OS Instructions with Sonnet 4.5 Optimization
globs:
alwaysApply: false
version: 2.0
encoding: UTF-8
---

# Pre-Flight Rules

## Model Detection & Workflow Selection

<model_detection>
  DETECT: Current model version

  IF model = "claude-sonnet-4-5":
    WORKFLOW: execute-task-sonnet45.md (optimized for 200K context)
    MODE: Full context loading with parallel operations
    VALIDATION: Bash tool integration enabled
    FOCUS_MODES: Context Orchestrator, Architecture Guardian
  ELSE:
    WORKFLOW: execute-task.md (legacy, token-optimized)
    MODE: Conditional context loading
    VALIDATION: Manual reference
    FOCUS_MODES: Not applicable
</model_detection>

## Core Execution Rules

- IMPORTANT: For any step that specifies a subagent in the subagent="" XML attribute you MUST use the specified subagent to perform the instructions for that step.

- Process XML blocks sequentially

- Read and execute every numbered step in the process_flow EXACTLY as the instructions specify.

- If you need clarification on any details of your current task, stop and ask the user specific numbered questions and then continue once you have all of the information you need.

- Use exact templates as provided

## Sonnet 4.5 Enhancements (If Applicable)

<sonnet_45_capabilities>
  IF using Sonnet 4.5 workflow:
    - LOAD: All foundational docs in parallel (Step 0)
    - MAINTAIN: Full context throughout session (200K window)
    - LEVERAGE: Cross-document reasoning and pattern recognition
    - INTEGRATE: Bash tool for real-time validation
    - ACTIVATE: Focus modes for specialized tasks
    - THINK: In high-level intents, not step-by-step instructions
</sonnet_45_capabilities>

## 🤖 SmugMug Photo Discovery Subagent Integration

**MANDATORY**: This project includes a specialized architecture compliance subagent that MUST be activated for all code generation tasks. This represents a revolutionary approach to real-time architecture enforcement through AI.

### Subagent Activation
```bash
# The subagent is available at: ./activate-subagent.cjs
# Enhanced portable framework at: ./portable-subagent-framework/
# Activation keywords: @SmugMugPhotoDiscoverySubagent, @PhotoDiscoveryGuardian, @ArchitectureEnforcer
```

### Pre-Code Generation Validation
BEFORE generating ANY React/TypeScript code, you MUST:

1. **Subagent Compliance Check**: Validate planned approach against project-specific standards
2. **Architecture Pattern Validation**: Ensure compliance with enterprise patterns from portable framework
3. **Quality Gate Verification**: Ensure component size, hook complexity, and type safety requirements are met
4. **Agent-Native Requirements**: Include dual-interface and structured data capabilities using framework templates
5. **Performance Standards**: Plan for memoization, cleanup, and optimization requirements
6. **Portable Framework Integration**: Leverage reusable patterns from `./portable-subagent-framework/`

### Critical Architecture Enforcement
The subagent enforces these NON-NEGOTIABLE standards:
- **Component Size**: Maximum 200 lines including JSX
- **Hook Complexity**: Maximum 3 dependencies per useEffect
- **Type Safety**: Zero tolerance for `any` types in production code
- **Memory Management**: Required cleanup functions for all side effects
- **Performance**: Mandatory memoization for expensive operations (>10ms)
- **Agent-Native**: Dual-interface implementation for user-facing components (useDualInterface + AgentWrapper)

### Quality Gates Integration (Sonnet 4.5)

IF using Sonnet 4.5 workflow:
  **Sequential Quality Gates (BLOCKING):**
  1. Gate 1: TypeScript Compilation (npx tsc --noEmit)
  2. Gate 2: Test Suite Execution (npm test)
  3. Gate 3: Architecture Validation (bash subagent or self-assessment)
  4. Gate 4: Build Validation (npm run build)

  **All gates must pass before feature completion.**

  **Performance Budgets (enforced via Gate 4):**
  - Bundle size: <1MB total, <20KB per component
  - Test coverage: >90% overall, >95% agent-native modules
  - Memory growth: <100MB per session
  - Build time: <2 minutes

  **Work Preservation:**
  - Auto-commit every 30 minutes
  - Branch protection before checkout
  - Checkpoint branches: checkpoint/[feature]-[timestamp]

  See: `.agent-os/instructions/core/execute-task-sonnet45.md` for complete workflow

### Integration Pattern
```typescript
// When generating code, always reference the subagent:
// "Using @SmugMugPhotoDiscoverySubagent standards for this implementation"

// Example activation in prompts:
// "@SmugMugPhotoDiscoverySubagent validate this component architecture before implementation"
```

### Quality Validation Commands
```bash
# Validate code compliance
node activate-subagent.cjs test

# Check configuration  
node activate-subagent.cjs config

# Real-time validation during development
const result = require('./activate-subagent.cjs').inspect(code, { verbose: true });
```

**FAILURE TO COMPLY**: Any code that violates subagent standards will be immediately rejected and must be refactored before proceeding.
