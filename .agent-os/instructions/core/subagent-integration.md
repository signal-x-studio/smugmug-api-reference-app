---
description: SmugMug Photo Discovery Subagent Integration Guide for AI Agents
globs:
alwaysApply: true
version: 1.0
encoding: UTF-8
---

# SmugMug Photo Discovery Subagent Integration

## Overview

This project includes a specialized AI coding assistant (subagent) that enforces architecture standards and ensures agent-native compliance. ALL AI agents working on this codebase MUST integrate with and comply to this subagent.

## Mandatory Subagent Activation

### **Before ANY Code Generation**
```markdown
REQUIRED: Activate the subagent with one of these commands:
- @SmugMugPhotoDiscoverySubagent validate planned architecture for [FEATURE_NAME]
- @PhotoDiscoveryGuardian check component design before implementation
- @ArchitectureEnforcer ensure compliance with project standards
```

### **During Development**
```bash
# Real-time validation
node activate-subagent.cjs test

# Programmatic validation
const subagent = require('./activate-subagent.cjs');
const result = subagent.inspect(generatedCode, { verbose: true, generateFixes: true });
```

### **After Implementation**
```bash
# Final compliance check
node activate-subagent.cjs test
if [ $? -ne 0 ]; then
  echo "❌ SUBAGENT VALIDATION FAILED - Refactor required"
  exit 1
fi
```

## Subagent Enforcement Rules

### **🚨 Critical Architecture Violations (IMMEDIATE REJECTION)**

1. **God Component Detection**
   - Components >200 lines = AUTOMATIC REJECTION
   - Must break into smaller, focused components
   - Example fix provided by subagent

2. **Hook Complexity Violations**  
   - useEffect with >3 dependencies = AUTOMATIC REJECTION
   - Must extract custom hooks
   - Subagent provides refactoring guidance

3. **Type Safety Violations**
   - Any `any` types in production = AUTOMATIC REJECTION
   - Must use explicit TypeScript interfaces
   - Subagent suggests proper type definitions

4. **Memory Leak Prevention**
   - Missing cleanup functions = AUTOMATIC REJECTION
   - Must use AbortController for async operations
   - Subagent enforces proper cleanup patterns

5. **Performance Violations**
   - Missing memoization for expensive operations = AUTOMATIC REJECTION
   - Must use useMemo/useCallback appropriately
   - Subagent identifies optimization opportunities

## Agent-Native Compliance Requirements

### **Mandatory Features for All Interactive Components**

1. **Dual Interface Architecture**
   ```typescript
   // REQUIRED: Every component must expose agent interface
   const { agentInterface } = useDualInterface({
     componentId: 'unique-component-id',
     data: componentData,
     state: componentState,
     setState: setComponentState,
     exposeGlobally: true
   });
   ```

2. **Structured Data Exposure**
   ```typescript
   // REQUIRED: Schema.org markup for agent discovery
   return (
     <AgentWrapper agentInterface={agentInterface} schemaType="WebApplication">
       <div data-agent-component="component-name" itemScope itemType="https://schema.org/WebApplication">
         {/* Component JSX */}
       </div>
     </AgentWrapper>
   );
   ```

3. **Natural Language Command Support**
   ```typescript
   // REQUIRED: Register natural language handlers
   useEffect(() => {
     registerAgentAction({
       action: {
         id: 'component-action',
         name: 'Execute Component Action',
         description: 'Performs component-specific action',
         execute: handleComponentAction
       }
     });
   }, []);
   ```

## Subagent Workflow Integration

### **Step 1: Pre-Implementation Validation**
```markdown
<subagent_validation>
  ACTION: @SmugMugPhotoDiscoverySubagent
  REQUEST: "Validate planned architecture for [FEATURE_NAME]:
           - Component structure: [PLANNED_COMPONENTS]
           - State management: [PLANNED_STATE]
           - Agent integration: [PLANNED_AGENT_FEATURES]
           - Performance considerations: [OPTIMIZATION_PLAN]"
  PROCESS: Subagent recommendations
  REFACTOR: Implementation plan if violations detected
  PROCEED: Only after 100% compliance confirmation
</subagent_validation>
```

### **Step 2: Real-Time Development Validation**
```typescript
// During code generation, continuously validate
const validateComponent = (code: string) => {
  const subagent = require('./activate-subagent.cjs');
  const agent = new subagent();
  const result = agent.inspect(code, { 
    verbose: true, 
    generateFixes: true 
  });
  
  if (!result.isValid) {
    console.error('❌ Architecture violations:', result.violations);
    throw new Error('Subagent validation failed - refactor required');
  }
  
  return result;
};
```

### **Step 3: Post-Implementation Verification**
```bash
# Final validation before task completion
echo "🤖 Running final subagent validation..."
node activate-subagent.cjs test --comprehensive

if [ $? -eq 0 ]; then
  echo "✅ All components pass subagent validation"
  echo "✅ Architecture compliance: 100%"
  echo "✅ Agent-native features: Integrated"
else
  echo "❌ VALIDATION FAILED - Review and fix violations"
  exit 1
fi
```

## Subagent Configuration Reference

### **Available Validation Commands**
```bash
# Basic validation
node activate-subagent.cjs test

# Show configuration
node activate-subagent.cjs config

# Help and usage
node activate-subagent.cjs --help
```

### **Programmatic Integration**
```typescript
// Load subagent in AI tools
const SmugMugSubagent = require('./activate-subagent.cjs');
const subagent = new SmugMugSubagent();

// Validate code
const result = subagent.inspect(codeString, {
  verbose: true,
  generateFixes: true
});

// Get architecture rules
const rules = subagent.getArchitectureRules();

// Get agent-native requirements
const agentRequirements = subagent.getAgentNativeRequirements();
```

## Error Handling and Recovery

### **When Subagent Detects Violations**
1. **STOP** code generation immediately
2. **ANALYZE** violation details provided by subagent
3. **APPLY** suggested fixes with proper patterns
4. **VALIDATE** fixed code passes subagent checks
5. **PROCEED** only after achieving 100% compliance

### **Common Violation Fixes**

#### **God Component → Composition Pattern**
```typescript
// ❌ BEFORE: God component (rejected by subagent)
export const MegaComponent = ({ photos, filters, operations }) => {
  // 300+ lines of mixed responsibilities
};

// ✅ AFTER: Composed components (approved by subagent)
export const PhotoManagement = ({ photos }) => (
  <div>
    <PhotoSearch photos={photos} />
    <PhotoFilters />
    <PhotoGrid />
    <BulkOperations />
  </div>
);
```

#### **Complex Hook → Custom Hook Extraction**
```typescript
// ❌ BEFORE: Complex useEffect (rejected by subagent)
useEffect(() => {
  // Complex logic
}, [dep1, dep2, dep3, dep4, dep5]); // >3 dependencies

// ✅ AFTER: Custom hook (approved by subagent)  
const usePhotoData = (photos, filters) => {
  // Extracted logic with proper cleanup
  return { processedPhotos, loading, error };
};
```

## Success Metrics and Monitoring

### **Subagent Integration KPIs**
- **Activation Rate**: 100% of code generation tasks
- **Compliance Score**: Zero architecture violations
- **Agent Coverage**: All interactive components agent-ready
- **Performance**: Sub-100ms renders, proper memoization
- **Type Safety**: Zero `any` types in production

### **Continuous Monitoring**
```bash
# Daily compliance check
node activate-subagent.cjs validate-all --report

# Integration in CI/CD
# .github/workflows/subagent-validation.yml
- name: Architecture Validation
  run: node activate-subagent.cjs test
```

## Emergency Protocols

### **Subagent Validation Failure**
If the subagent detects critical violations:

1. **IMMEDIATE STOP**: Halt all code generation
2. **ANALYZE**: Review detailed violation report
3. **REFACTOR**: Apply subagent-suggested fixes
4. **RE-VALIDATE**: Ensure 100% compliance
5. **DOCUMENT**: Update implementation approach
6. **PROCEED**: Continue only after validation passes

### **Legacy Code Integration**
When working with existing code that may not be compliant:

1. **ASSESS**: Run subagent validation on existing code
2. **PRIORITIZE**: Fix critical violations first
3. **INCREMENTAL**: Apply improvements gradually
4. **VALIDATE**: Ensure changes don't break functionality
5. **DOCUMENT**: Track compliance improvements

---

## Quick Reference

### **Subagent Activation Commands**
```bash
# For GitHub Copilot
@SmugMugPhotoDiscoverySubagent validate this component

# For Claude/Cursor  
@PhotoDiscoveryGuardian check architecture compliance

# For any AI tool
@ArchitectureEnforcer ensure project standards
```

### **Quality Gates Checklist**
- [ ] Subagent activated before code generation
- [ ] Component size ≤200 lines
- [ ] Hook complexity ≤3 dependencies
- [ ] Type safety: no `any` types
- [ ] Agent integration: useDualInterface + AgentWrapper
- [ ] Performance: proper memoization
- [ ] Memory: cleanup functions included
- [ ] Final validation: subagent test passes

**This subagent integration ensures every code change maintains the project's revolutionary agent-native architecture while delivering enterprise-grade quality and performance.**