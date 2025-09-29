#!/usr/bin/env node

/**
 * SmugMug Photo Discovery Subagent Activation Script
 * 
 * This script loads the subagent configuration and provides a simple interface
 * for AI coding assistants to validate code against project standards.
 */

const fs = require('fs');
const path = require('path');

class SmugMugPhotoDiscoverySubagent {
  constructor() {
    this.config = this.loadConfig();
    this.name = this.config.subagent.name;
    this.version = this.config.subagent.version;
  }

  loadConfig() {
    try {
      const configPath = path.join(__dirname, 'subagent-config.json');
      const configContent = fs.readFileSync(configPath, 'utf8');
      return JSON.parse(configContent);
    } catch (error) {
      console.error('Failed to load subagent configuration:', error.message);
      return null;
    }
  }

  /**
   * Main validation function for AI agents to call
   */
  validateCode(code, options = {}) {
    const results = {
      isValid: true,
      violations: [],
      warnings: [],
      suggestions: [],
      metrics: {}
    };

    // Component size validation
    if (code.includes('export const') || code.includes('export function')) {
      const lines = code.split('\n').length;
      if (lines > this.config.critical_architecture_rules.component_limits.max_lines) {
        results.violations.push({
          type: 'god_component',
          message: `Component has ${lines} lines, exceeds limit of ${this.config.critical_architecture_rules.component_limits.max_lines}`,
          severity: 'critical',
          fix: 'Break component into smaller, single-responsibility components'
        });
        results.isValid = false;
      }
    }

    // Hook complexity validation
    const useEffectMatches = code.match(/useEffect\([^,]+,\s*\[([^\]]*)\]/g);
    if (useEffectMatches) {
      useEffectMatches.forEach((match, index) => {
        const depsMatch = match.match(/\[([^\]]*)\]/);
        if (depsMatch && depsMatch[1]) {
          const deps = depsMatch[1].split(',').filter(d => d.trim()).length;
          if (deps > this.config.critical_architecture_rules.hook_constraints.max_useeffect_dependencies) {
            results.violations.push({
              type: 'complex_hook',
              message: `useEffect #${index + 1} has ${deps} dependencies, exceeds limit of ${this.config.critical_architecture_rules.hook_constraints.max_useeffect_dependencies}`,
              severity: 'high',
              fix: 'Extract complex logic into custom hooks with fewer dependencies'
            });
            results.isValid = false;
          }
        }
      });
    }

    // Type safety validation
    if (code.includes(': any') || code.includes('<any>')) {
      results.violations.push({
        type: 'type_safety',
        message: 'Found usage of "any" type in code',
        severity: 'high',
        fix: 'Replace any types with explicit TypeScript interfaces'
      });
      results.isValid = false;
    }

    // Memory leak detection
    const hasUseEffect = code.includes('useEffect');
    const hasCleanup = code.includes('return () =>') || code.includes('return function');
    if (hasUseEffect && !hasCleanup) {
      results.warnings.push({
        type: 'potential_memory_leak',
        message: 'useEffect detected without cleanup function',
        severity: 'medium',
        fix: 'Add cleanup function to prevent memory leaks'
      });
    }

    // Agent integration validation
    const hasAgentIntegration = code.includes('useDualInterface') || 
                              code.includes('AgentWrapper') ||
                              code.includes('agentInterface');
    
    if ((code.includes('export const') || code.includes('export function')) && !hasAgentIntegration) {
      results.suggestions.push({
        type: 'agent_integration',
        message: 'Component could benefit from agent-native capabilities',
        severity: 'low',
        fix: 'Add useDualInterface hook and AgentWrapper for agent compatibility'
      });
    }

    // Performance checks
    const hasExpensiveOps = code.includes('.filter(') || 
                          code.includes('.map(') || 
                          code.includes('.reduce(');
    const hasMemoization = code.includes('useMemo') || 
                         code.includes('useCallback') ||
                         code.includes('React.memo');
    
    if (hasExpensiveOps && !hasMemoization) {
      results.warnings.push({
        type: 'performance',
        message: 'Expensive operations detected without memoization',
        severity: 'medium',
        fix: 'Use useMemo/useCallback to optimize performance'
      });
    }

    // Calculate metrics
    results.metrics = {
      lines: code.split('\n').length,
      complexity_score: this.calculateComplexity(code),
      agent_ready: hasAgentIntegration,
      performance_optimized: hasMemoization
    };

    return results;
  }

  calculateComplexity(code) {
    let score = 0;
    
    // Count various complexity indicators
    const useStateCount = (code.match(/useState/g) || []).length;
    const useEffectCount = (code.match(/useEffect/g) || []).length;
    const conditionalCount = (code.match(/if\s*\(/g) || []).length;
    const loopCount = (code.match(/\.(map|filter|reduce|forEach)/g) || []).length;
    
    score = useStateCount * 2 + useEffectCount * 3 + conditionalCount + loopCount;
    
    return score;
  }

  /**
   * Generate suggested fixes for violations
   */
  generateFixes(violations) {
    return violations.map(violation => {
      switch (violation.type) {
        case 'god_component':
          return {
            ...violation,
            codeExample: `
// ❌ Before: God component
export const MegaComponent = ({ photos, filters, operations }) => {
  // 200+ lines of mixed responsibilities
};

// ✅ After: Broken into focused components  
export const PhotoGrid = ({ photos, onSelect }) => { /* <100 lines */ };
export const FilterPanel = ({ filters, onChange }) => { /* <100 lines */ };
export const OperationsPanel = ({ operations, onExecute }) => { /* <100 lines */ };
            `.trim()
          };

        case 'complex_hook':
          return {
            ...violation,
            codeExample: `
// ❌ Before: Complex useEffect
useEffect(() => {
  // Complex logic with many dependencies
}, [dep1, dep2, dep3, dep4, dep5]);

// ✅ After: Custom hook extraction
const useSearchResults = (photos, filters, engine) => {
  return useMemo(() => engine?.search(filters) || [], [photos, filters, engine]);
};
            `.trim()
          };

        case 'type_safety':
          return {
            ...violation,
            codeExample: `
// ❌ Before: any type
const processData = (data: any) => { /* ... */ };

// ✅ After: Explicit interface
interface ProcessingData {
  photos: Photo[];
  filters: FilterState;
}
const processData = (data: ProcessingData) => { /* ... */ };
            `.trim()
          };

        default:
          return violation;
      }
    });
  }

  /**
   * Main entry point for agent tools
   */
  inspect(code, options = {}) {
    const validation = this.validateCode(code, options);
    
    if (options.generateFixes && validation.violations.length > 0) {
      validation.fixSuggestions = this.generateFixes(validation.violations);
    }

    if (options.verbose) {
      console.log(`\n🤖 ${this.name} v${this.version} - Code Inspection Results`);
      console.log('='.repeat(60));
      
      if (validation.isValid) {
        console.log('✅ Code passes architecture compliance checks');
      } else {
        console.log(`❌ Found ${validation.violations.length} architecture violation(s)`);
        validation.violations.forEach((v, i) => {
          console.log(`\n${i + 1}. ${v.type.toUpperCase()}: ${v.message}`);
          console.log(`   Severity: ${v.severity}`);
          console.log(`   Fix: ${v.fix}`);
        });
      }

      if (validation.warnings.length > 0) {
        console.log(`\n⚠️ ${validation.warnings.length} warning(s):`);
        validation.warnings.forEach((w, i) => {
          console.log(`${i + 1}. ${w.message}`);
        });
      }

      if (validation.suggestions.length > 0) {
        console.log(`\n💡 ${validation.suggestions.length} suggestion(s):`);
        validation.suggestions.forEach((s, i) => {
          console.log(`${i + 1}. ${s.message}`);
        });
      }

      console.log('\n📊 Metrics:');
      console.log(`   Lines: ${validation.metrics.lines}`);
      console.log(`   Complexity: ${validation.metrics.complexity_score}`);
      console.log(`   Agent Ready: ${validation.metrics.agent_ready ? 'Yes' : 'No'}`);
      console.log(`   Performance Optimized: ${validation.metrics.performance_optimized ? 'Yes' : 'No'}`);
    }

    return validation;
  }

  /**
   * Get project configuration
   */
  getConfig() {
    return this.config;
  }

  /**
   * Get architecture rules
   */
  getArchitectureRules() {
    return this.config.critical_architecture_rules;
  }

  /**
   * Get agent-native requirements
   */
  getAgentNativeRequirements() {
    return this.config.agent_native_requirements;
  }
}

// CLI interface
if (require.main === module) {
  const subagent = new SmugMugPhotoDiscoverySubagent();
  
  if (process.argv[2] === 'config') {
    console.log(JSON.stringify(subagent.getConfig(), null, 2));
  } else if (process.argv[2] === 'test') {
    // Test with sample code
    const sampleCode = `
export const TestComponent = ({ photos, filters, operations, commands }) => {
  const [state1, setState1] = useState();
  const [state2, setState2] = useState(); 
  const [state3, setState3] = useState();
  
  useEffect(() => {
    // Complex logic
  }, [photos, filters, operations, commands, state1]);
  
  const expensiveOperation = photos.filter(p => 
    operations.every(op => isValidForPhoto(op, p))
  );
  
  return <div>{/* 100+ lines of JSX */}</div>;
};
    `;
    
    const result = subagent.inspect(sampleCode, { verbose: true, generateFixes: true });
    process.exit(result.isValid ? 0 : 1);
  } else {
    console.log(`
🤖 SmugMug Photo Discovery Subagent v${subagent.version}

Usage:
  node activate-subagent.js config    # Show configuration
  node activate-subagent.js test      # Run test validation

For AI Integration:
  const subagent = require('./activate-subagent.js');
  const result = subagent.inspect(code, { verbose: true });
    `);
  }
}

module.exports = SmugMugPhotoDiscoverySubagent;