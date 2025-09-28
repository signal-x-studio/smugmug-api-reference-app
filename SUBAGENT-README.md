# SmugMug Photo Discovery Subagent

A specialized AI coding assistant designed to enforce architecture standards and ensure code quality for the SmugMug Photo Discovery application.

## 🚀 Quick Start

### For AI Coding Assistants (Copilot, Claude, Gemini)

```typescript
// Activate the subagent by referencing it in your prompts:
"@SmugMugPhotoDiscoverySubagent validate this component for architecture compliance"

// Or load the configuration directly:
const subagent = require('./activate-subagent.cjs');
const result = subagent.inspect(yourCode, { verbose: true });
```

### Command Line Usage

```bash
# Test the subagent
node activate-subagent.cjs test

# Show configuration
node activate-subagent.cjs config

# Get help
node activate-subagent.cjs
```

## 🎯 What It Enforces

### ✅ Architecture Standards
- **Component Size**: Max 200 lines per component
- **Hook Complexity**: Max 3 dependencies per useEffect
- **Type Safety**: Zero tolerance for `any` types
- **Memory Management**: Required cleanup for all side effects
- **Performance**: Memoization for expensive operations

### 🤖 Agent-Native Features
- **Dual Interface**: Human UI + programmatic API
- **Structured Data**: Schema.org markup for AI discovery
- **Natural Language**: Command processing support
- **Global State**: Window-exposed agent interfaces

## 📋 Validation Results

The subagent returns detailed validation results:

```javascript
{
  isValid: boolean,
  violations: [
    {
      type: 'god_component' | 'complex_hook' | 'type_safety' | 'memory_leak',
      message: 'Detailed explanation',
      severity: 'critical' | 'high' | 'medium' | 'low',
      fix: 'Specific fix instruction',
      codeExample: '// Example of correct implementation'
    }
  ],
  warnings: [...],
  suggestions: [...],
  metrics: {
    lines: number,
    complexity_score: number,
    agent_ready: boolean,
    performance_optimized: boolean
  }
}
```

## 🛠️ Integration Examples

### GitHub Copilot
```typescript
// When Copilot generates code, validate with:
// @SmugMugPhotoDiscoverySubagent check this component
export const PhotoGrid = ({ photos }: PhotoGridProps) => {
  // Copilot will follow subagent standards
  const memoizedPhotos = useMemo(() => 
    photos.filter(p => p.status === 'ready'), 
    [photos]
  );
  
  return <div>{/* Agent-compliant JSX */}</div>;
};
```

### Claude/Cursor
```typescript
// In your development environment:
const { inspect } = require('./activate-subagent.cjs');

// Real-time validation during coding
const validation = inspect(currentCode, { 
  verbose: true, 
  generateFixes: true 
});

if (!validation.isValid) {
  // Show architecture violations
  console.log(validation.violations);
}
```

### VS Code Extension
```json
// Add to settings.json
{
  "smugmug.subagent.enabled": true,
  "smugmug.subagent.path": "./activate-subagent.cjs",
  "smugmug.subagent.realTimeValidation": true
}
```

## 🚨 Architecture Violations

### Critical Issues (Immediate Rejection)
```typescript
// ❌ God Component (>200 lines)
export const MegaComponent = ({ photos, filters, operations }) => {
  // 300+ lines of mixed responsibilities - REJECTED
};

// ❌ Complex Hook (>3 dependencies)
useEffect(() => {
  // Complex logic
}, [photos, filters, operations, commands, state]); // REJECTED

// ❌ Type Safety Violation
const processData = (data: any) => { // REJECTED - no any types
  return data.operation.execute(data.params);
};
```

### Correct Patterns (Enforced)
```typescript
// ✅ Focused Component (<200 lines)
export const PhotoGrid = ({ photos, onSelect }: PhotoGridProps) => {
  const validPhotos = useMemo(() => 
    photos.filter(p => p.status === 'ready'), 
    [photos]
  );
  
  return <PhotoGridDisplay photos={validPhotos} onSelect={onSelect} />;
};

// ✅ Simple Hook (≤3 dependencies)
const usePhotoSearch = (query: string, filters: FilterState) => {
  const [results, setResults] = useState<Photo[]>([]);
  
  useEffect(() => {
    const controller = new AbortController();
    
    searchService.search(query, filters, { signal: controller.signal })
      .then(setResults)
      .catch(handleError);
    
    return () => controller.abort(); // Required cleanup
  }, [query, filters]); // ≤3 dependencies
  
  return { results };
};

// ✅ Type Safety (Explicit interfaces)
interface SearchParameters {
  semantic: {
    objects?: string[];
    scenes?: string[];
  };
  temporal: {
    startDate?: Date;
    endDate?: Date;
  };
}

const processSearch = (params: SearchParameters): Promise<Result<Photo[]>> => {
  // Fully typed implementation
};
```

## 🎛️ Configuration

The subagent is configured via `subagent-config.json`:

```json
{
  "critical_architecture_rules": {
    "component_limits": {
      "max_lines": 200,
      "max_props": 5,
      "single_responsibility": true
    },
    "hook_constraints": {
      "max_useeffect_dependencies": 3,
      "require_cleanup": true,
      "use_abort_controller": true
    },
    "type_safety": {
      "no_any_types": true,
      "explicit_interfaces": true,
      "result_pattern": true
    }
  }
}
```

## 📈 Success Metrics

The subagent tracks:
- **Zero Architecture Violations** (components, hooks, types)
- **100% Agent Compatibility** (dual interface coverage)
- **Performance Standards** (<100ms renders, <3s searches)
- **Test Coverage >90%** (behavior-driven tests)
- **Production Error Rate: 0%** (comprehensive error handling)

## 🔄 Continuous Integration

### Pre-Commit Hook
```bash
#!/bin/sh
# .git/hooks/pre-commit
node activate-subagent.cjs validate-project
if [ $? -ne 0 ]; then
  echo "❌ Subagent validation failed. Commit blocked."
  exit 1
fi
```

### GitHub Actions
```yaml
# .github/workflows/subagent-validation.yml
name: Subagent Architecture Validation
on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: node activate-subagent.cjs validate-all
```

## 🆘 Emergency Protocols

### Architecture Violation Detected
1. **Stop** - Halt code generation immediately
2. **Surface** - Show specific violation with examples
3. **Fix** - Provide correct implementation pattern
4. **Educate** - Explain why pattern is required
5. **Validate** - Ensure fix meets all requirements

### Legacy Code Conflicts
1. **Assess** - Determine impact on existing functionality
2. **Improve** - Apply minimal changes to meet standards
3. **Document** - Update relevant docs and tests
4. **Validate** - Ensure agent interfaces remain functional

## 📚 References

- **[Full Documentation](./SUBAGENT.md)** - Complete subagent specification
- **[Project Standards](./AGENTS.md)** - Architecture guidelines and code smells
- **[Configuration](./subagent-config.json)** - Technical configuration details

---

**Ready to enforce world-class architecture standards in your SmugMug Photo Discovery development! 🚀**