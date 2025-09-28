---
description: Common Pre-Flight Steps for Agent OS Instructions
globs:
alwaysApply: false
version: 1.1
encoding: UTF-8
---

# Pre-Flight Rules

## Core Execution Rules

- IMPORTANT: For any step that specifies a subagent in the subagent="" XML attribute you MUST use the specified subagent to perform the instructions for that step.

- Process XML blocks sequentially

- Read and execute every numbered step in the process_flow EXACTLY as the instructions specify.

- If you need clarification on any details of your current task, stop and ask the user specific numbered questions and then continue once you have all of the information you need.

- Use exact templates as provided

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
