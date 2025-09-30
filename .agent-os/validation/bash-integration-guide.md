---
description: Bash Tool Integration Guide for Subagent Validation
version: 1.0
encoding: UTF-8
---

# Bash Tool Integration Guide for Architecture Validation

## Overview

This guide explains how to integrate the SmugMug Photo Discovery Subagent with the Sonnet 4.5 workflow using Bash tool commands for real-time architecture validation.

## Prerequisites

### Check Subagent Availability

```bash
# Check if subagent exists
test -f activate-subagent.cjs && echo "Subagent available" || echo "Subagent not found"

# Check if Node.js is available
which node && echo "Node.js available" || echo "Node.js not found"
```

### Verify Subagent Functionality

```bash
# Test subagent
node activate-subagent.cjs --help

# Expected output: Usage information and available commands
```

## Integration Patterns

### Pattern 1: Validate Single File

**Use Case:** After generating a component, validate before writing

```bash
# Step 1: Generate component code (in memory)
const componentCode = `
export const MyComponent: React.FC<Props> = ({ data }) => {
  // ... implementation ...
};
`;

# Step 2: Write to temporary file
echo "$componentCode" > /tmp/validate-component.tsx

# Step 3: Run validation
node activate-subagent.cjs validate-file /tmp/validate-component.tsx --verbose

# Step 4: Parse output
# If violations: Refactor code
# If clean: Proceed to Write tool
```

**Implementation in Workflow:**

```markdown
## After Code Generation

GENERATE: Component following standards

# Validate before writing
Bash: echo "$componentCode" > /tmp/validate-temp.tsx
Bash: node activate-subagent.cjs validate-file /tmp/validate-temp.tsx --verbose

PARSE: Output for violations

IF violations:
  ANALYZE: Specific issues
  REFACTOR: Fix violations
  RETRY: Validation loop
ELSE:
  PROCEED: Write tool with validated code
```

### Pattern 2: Validate Existing File

**Use Case:** Check existing code for compliance

```bash
# Validate specific file
node activate-subagent.cjs validate-file src/components/PhotoCard.tsx --verbose

# Output: Compliance report with specific violations
```

**Example Output:**

```
Validating: src/components/PhotoCard.tsx

✅ Component Size: 145 lines (limit: 200)
✅ useState Count: 3 (limit: 5)
✅ useEffect Count: 2 (limit: 3)
✅ Type Safety: No 'any' types found
⚠️  Missing Memoization: Line 34 - expensive calculation without useMemo
❌ Missing Cleanup: Line 56 - useEffect without cleanup function

Compliance Score: 75%
Status: NEEDS_REFACTORING
```

### Pattern 3: Validate Entire Project

**Use Case:** Pre-commit or comprehensive validation

```bash
# Validate all source files
node activate-subagent.cjs validate-project --verbose

# Output: Project-wide compliance report
```

**Use in Workflow:**

```markdown
## Post-Implementation Validation (Step 6)

Bash: node activate-subagent.cjs validate-project --verbose

ANALYZE: Project-wide compliance
IF violations:
  PRIORITIZE: Critical issues
  FIX: One by one
  REVALIDATE: After fixes
ELSE:
  CONFIRM: 100% compliance
  PROCEED: Task completion
```

### Pattern 4: Inspect Code String

**Use Case:** Validate generated code before any file operations

```bash
# Inspect code string (advanced)
node -e "
const subagent = require('./activate-subagent.cjs');
const code = \`
  const MyComponent = () => {
    // Generated code here
  };
\`;
const result = subagent.inspect(code, { verbose: true, generateFixes: true });
console.log(JSON.stringify(result, null, 2));
"
```

**Programmatic Integration:**

```javascript
// In workflow automation
const { inspect } = require('./activate-subagent.cjs');

const validationResult = inspect(generatedCode, {
  verbose: true,
  generateFixes: true,
  rules: {
    maxLines: 200,
    maxUseState: 5,
    maxUseEffect: 3,
    allowAnyType: false
  }
});

if (validationResult.violations.length > 0) {
  // Handle violations
  console.log('Violations found:', validationResult.violations);
  // Apply suggested fixes
  const fixedCode = validationResult.suggestedFixes;
} else {
  // Code is compliant
  console.log('Code passes all checks');
}
```

## Validation Workflow Integration

### Sonnet 4.5 Workflow (execute-task-sonnet45.md)

```markdown
## Step 4: Bash-Integrated Architecture Validation

<bash_validation_workflow>
  <step name="availability_check">
    # Check if subagent is available
    Bash: test -f activate-subagent.cjs && echo "available" || echo "not_found"

    IF "available":
      PROCEED: Full bash validation
    ELSE:
      FALLBACK: Self-assessment only
  </step>

  <step name="component_validation">
    FOR each generated component:

      # Self-assess first
      EVALUATE: Line count, hook complexity, type safety

      IF subagent available:
        # Write to temp file
        Bash: echo "$componentCode" > /tmp/validate-component.tsx

        # Run validation
        Bash: node activate-subagent.cjs validate-file /tmp/validate-component.tsx --verbose

        # Parse results
        IF violations detected:
          ANALYZE: Specific issues from output
          REFACTOR: Apply fixes
          RETRY: Validation (max 3 iterations)
        ELSE:
          CONFIRM: Component compliant
          PROCEED: Write tool
      ELSE:
        # Self-validation only
        VERIFY: Manual checklist against standards
        PROCEED: If self-assessment passes
  </step>

  <step name="project_validation">
    # After all components written

    IF subagent available:
      Bash: node activate-subagent.cjs validate-project --verbose

      IF project violations:
        FIX: Prioritize critical issues
        REVALIDATE: After fixes
      ELSE:
        CONFIRM: Project 100% compliant
  </step>
</bash_validation_workflow>
```

## Output Parsing

### Understanding Validation Output

```bash
# Example output structure
{
  "file": "src/components/MyComponent.tsx",
  "compliance": {
    "lineCount": { "value": 145, "limit": 200, "status": "pass" },
    "useStateCount": { "value": 3, "limit": 5, "status": "pass" },
    "useEffectCount": { "value": 2, "limit": 3, "status": "pass" },
    "effectComplexity": [
      { "line": 45, "deps": 4, "limit": 3, "status": "fail" }
    ],
    "typeSafety": { "anyCount": 0, "status": "pass" },
    "memoization": [
      { "line": 34, "operation": "filter", "memoized": false, "status": "warn" }
    ],
    "cleanup": [
      { "line": 56, "hasCleanup": false, "status": "fail" }
    ]
  },
  "violations": [
    {
      "rule": "CS002",
      "severity": "critical",
      "message": "useEffect at line 45 has 4 dependencies (limit: 3)",
      "suggestion": "Extract to custom hook or split into multiple effects"
    },
    {
      "rule": "CS004",
      "severity": "critical",
      "message": "useEffect at line 56 missing cleanup function",
      "suggestion": "Add return () => { /* cleanup */ } to prevent memory leaks"
    }
  ],
  "complianceScore": 75,
  "status": "needs_refactoring"
}
```

### Parsing Strategy

```typescript
// Parse validation output in workflow

interface ValidationResult {
  file: string;
  compliance: ComplianceReport;
  violations: Violation[];
  complianceScore: number;
  status: 'compliant' | 'needs_refactoring' | 'critical_violations';
}

function handleValidationResult(result: ValidationResult): Action {
  if (result.status === 'compliant') {
    return { action: 'proceed', message: 'Code passes all checks' };
  }

  if (result.status === 'critical_violations') {
    const criticalIssues = result.violations.filter(v => v.severity === 'critical');
    return {
      action: 'refactor',
      message: `Must fix ${criticalIssues.length} critical issues`,
      issues: criticalIssues
    };
  }

  return {
    action: 'review',
    message: 'Minor issues found, consider fixing',
    issues: result.violations
  };
}
```

## Error Handling

### Common Issues

**Issue 1: Subagent Not Found**

```bash
# Error: activate-subagent.cjs not found

# Solution:
FALLBACK: Use self-assessment mode
INFORM: User that bash validation unavailable
PROCEED: With built-in standards knowledge
```

**Issue 2: Node.js Not Available**

```bash
# Error: node command not found

# Solution:
CHECK: Environment setup
FALLBACK: Self-assessment only
DOCUMENT: Installation requirements
```

**Issue 3: Validation Timeout**

```bash
# Error: Validation taking too long

# Solution:
TIMEOUT: After 30 seconds
LOG: Timeout issue
FALLBACK: Proceed with self-assessment
```

**Issue 4: Parsing Errors**

```bash
# Error: Cannot parse validation output

# Solution:
LOG: Raw output for debugging
ATTEMPT: Regex-based parsing
FALLBACK: Self-assessment if parsing fails
```

### Retry Logic

```bash
# Validation retry pattern

MAX_RETRIES=3
attempt=0

while [ $attempt -lt $MAX_RETRIES ]; do
  # Run validation
  result=$(node activate-subagent.cjs validate-file $file --verbose)

  # Check if passed
  if echo "$result" | grep -q "status: compliant"; then
    echo "Validation passed"
    break
  fi

  # Increment attempt
  attempt=$((attempt + 1))

  if [ $attempt -eq $MAX_RETRIES ]; then
    echo "Max retries reached, proceeding with warnings"
  else
    echo "Attempting fix, retry $attempt of $MAX_RETRIES"
    # Apply automated fixes here
  fi
done
```

## Best Practices

### DO:
✅ Check subagent availability before attempting validation
✅ Use temp files for code validation (don't pollute working directory)
✅ Parse output carefully and handle errors gracefully
✅ Implement retry logic for transient failures
✅ Fall back to self-assessment if bash validation fails
✅ Clean up temp files after validation

### DON'T:
❌ Assume subagent is always available
❌ Write untested code directly to source files
❌ Ignore validation output
❌ Skip fallback mechanisms
❌ Retry infinitely without max attempts
❌ Leave temporary validation files

## Performance Optimization

### Batch Validation

```bash
# Validate multiple files at once (if supported)
node activate-subagent.cjs validate-files \
  src/components/ComponentA.tsx \
  src/components/ComponentB.tsx \
  src/components/ComponentC.tsx \
  --verbose

# Faster than individual validations
```

### Selective Validation

```bash
# Only validate changed files
git diff --name-only HEAD | grep '\.tsx$' | while read file; do
  node activate-subagent.cjs validate-file "$file"
done
```

### Caching

```bash
# Cache validation results (if subagent supports it)
node activate-subagent.cjs validate-file src/component.tsx --cache

# Skip re-validation of unchanged files
```

## Integration Checklist

Before using bash validation:

- [ ] Verify activate-subagent.cjs exists
- [ ] Confirm Node.js is available
- [ ] Test subagent with sample file
- [ ] Implement fallback to self-assessment
- [ ] Add error handling for all scenarios
- [ ] Set reasonable timeouts
- [ ] Implement retry logic (max 3 attempts)
- [ ] Clean up temporary files
- [ ] Parse output format correctly
- [ ] Document any subagent-specific configuration

## Troubleshooting

### Debug Mode

```bash
# Run with debug output
DEBUG=* node activate-subagent.cjs validate-file component.tsx --verbose

# Check subagent configuration
node activate-subagent.cjs config
```

### Validation Not Working

1. Check file permissions
2. Verify Node.js version compatibility
3. Test with simple example file
4. Review subagent logs
5. Contact maintainer if persistent issues

### Performance Issues

1. Reduce validation frequency
2. Use batch validation
3. Implement caching
4. Validate only changed files
5. Consider async validation

---

**Version**: 1.0
**Integration**: execute-task-sonnet45.md
**Fallback**: Self-assessment mode always available
**Status**: Production-ready with comprehensive error handling
