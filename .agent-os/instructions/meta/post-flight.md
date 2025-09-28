---
description: Common Post-Flight Steps for Agent OS Instructions
globs:
alwaysApply: false
version: 1.1
encoding: UTF-8
---

# Post-Flight Rules

After completing all steps in a process_flow, always review your work and verify:

## Core Execution Validation

- Every numbered step has read, executed, and delivered according to its instructions.

- All steps that specified a subagent should be used, did in fact delegate those tasks to the specified subagent.  IF they did not, see why the subagent was not used and report your findings to the user.

- IF you notice a step wasn't executed according to its instructions, report your findings and explain which part of the instructions were misread or skipped and why.

## 🤖 SmugMug Photo Discovery Subagent Final Validation

**MANDATORY**: Before completing any task that involved code generation, perform final subagent validation:

### **Architecture Compliance Check**
```bash
echo "🤖 Running final SmugMug Photo Discovery Subagent validation..."
node activate-subagent.cjs test --comprehensive

if [ $? -eq 0 ]; then
  echo "✅ ARCHITECTURE COMPLIANCE: 100%"
  echo "✅ AGENT-NATIVE FEATURES: Integrated"
  echo "✅ PERFORMANCE STANDARDS: Met"
  echo "✅ TYPE SAFETY: Enforced"
else
  echo "❌ SUBAGENT VALIDATION FAILED"
  echo "   Task cannot be marked complete until violations are fixed"
  exit 1
fi
```

### **Final Verification Checklist**
- [ ] **Subagent Validation Passed**: Zero architecture violations detected
- [ ] **Component Compliance**: All components ≤200 lines, proper hook usage
- [ ] **Agent Integration**: useDualInterface and AgentWrapper implemented
- [ ] **Performance**: Memoization applied, cleanup functions present
- [ ] **Type Safety**: No `any` types, explicit interfaces defined
- [ ] **Memory Management**: AbortController used, proper cleanup implemented

### **Report Generation**
If all validations pass, provide this summary:

```markdown
## 🎯 Task Completion Summary

### Architecture Compliance
- ✅ Subagent validation: PASSED
- ✅ Component complexity: Within limits
- ✅ Hook usage: Compliant
- ✅ Type safety: 100%

### Agent-Native Features  
- ✅ Dual interface: Implemented
- ✅ Structured data: Schema.org markup added
- ✅ Action registry: Components registered
- ✅ Natural language: Command support included

### Performance & Quality
- ✅ Memoization: Applied where needed
- ✅ Memory management: Cleanup functions present
- ✅ Bundle size: Within limits
- ✅ Test coverage: Adequate

**Result**: Task completed successfully with full subagent compliance.
```

### **Failure Protocol**
If subagent validation fails:

1. **DOCUMENT**: List all detected violations
2. **PRIORITIZE**: Address critical violations first  
3. **REFACTOR**: Apply subagent-suggested fixes
4. **RE-VALIDATE**: Run subagent test again
5. **REPEAT**: Until 100% compliance achieved

**DO NOT mark the task as complete until subagent validation passes.**
