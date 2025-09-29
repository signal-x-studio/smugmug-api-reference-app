# Portable AI Subagent Framework

A generalized, tech-stack-agnostic framework for creating project-specific AI coding subagents that enforce architecture standards and ensure code quality.

## 🎯 Purpose

This framework allows you to create AI coding assistants (subagents) that:
- Enforce your project's specific architecture standards
- Prevent code smells and anti-patterns
- Ensure consistent code quality across team members
- Work with any AI coding tool (Copilot, Claude, Cursor, etc.)
- Integrate seamlessly with existing development workflows

## 📦 What's Included

### Core Framework
- **Configurable rule engine** for defining project-specific standards
- **Base validation engine** that works across programming languages
- **Template system** for rapid subagent generation
- **Integration patterns** for CI/CD and development workflows

### Tech Stack Templates
- React/TypeScript (proven with SmugMug Photo Discovery app)
- Python FastAPI
- Node.js Express
- Vue TypeScript
- Generic template for any tech stack

### Documentation & Examples
- Quick start guides for each tech stack
- Customization documentation
- Real-world implementation examples

## 🚀 Quick Start

### 1. Copy Framework to Your Project
```bash
# Copy the entire framework to your project
cp -r portable-subagent-framework /path/to/your/project/

# Or clone as standalone repository
git clone <this-framework-repo> your-project-subagent
```

### 2. Generate Your Subagent
```bash
cd portable-subagent-framework

# Interactive generation
node generators/create-subagent.js --interactive

# Or specify parameters
node generators/create-subagent.js \
  --tech-stack=python-fastapi \
  --project-name="MyMLService" \
  --output-dir="../"
```

### 3. Integrate with Your Development Workflow
```bash
# For projects with existing agent-os (Enhanced Integration)
node generators/integrate-agent-os.js --target="../.agent-os" --interactive

# For standalone usage  
node your-generated-subagent.cjs test

# For CI/CD integration
npm run validate
```

## 🛠️ Framework Structure

```
portable-subagent-framework/
├── README.md                     # This file
├── package.json                  # Framework dependencies
├── templates/                    # Tech stack templates
│   ├── react-typescript/        # React/TS template with SmugMug patterns
│   ├── python-fastapi/          # Python FastAPI template
│   ├── nodejs-express/          # Node.js Express template
│   ├── vue-typescript/          # Vue TypeScript template
│   └── generic/                 # Generic template for any language
├── generators/                   # Subagent generation tools
│   ├── create-subagent.js       # Main subagent generator
│   ├── config-generator.js      # Configuration file generator
│   ├── integrate-agent-os.js    # Agent-OS integration generator
│   └── template-engine.js       # Template processing engine
├── core/                        # Reusable framework components
│   ├── base-validator.js        # Language-agnostic validation engine
│   ├── rule-engine.js           # Configurable rule system
│   ├── pattern-detector.js      # Anti-pattern detection
│   └── integration-helpers.js   # Common integration utilities
├── docs/                        # Framework documentation
│   ├── quick-start.md           # Getting started guide
│   ├── customization-guide.md   # Detailed customization instructions
│   ├── api-reference.md         # Framework API documentation
│   └── tech-stack-guides/       # Specific implementation guides
│       ├── react-typescript.md  # React/TypeScript guide
│       ├── python-fastapi.md    # Python FastAPI guide
│       └── custom-stack.md      # Creating custom templates
└── examples/                    # Real-world implementations
    ├── react-e-commerce/        # React e-commerce subagent
    ├── python-ml-service/       # Python ML service subagent
    └── vue-dashboard/           # Vue dashboard subagent
```

## 🎛️ Key Features

### Tech Stack Agnostic
Works with any programming language or framework by using configurable templates and rules.

### Portable & Self-Contained
- No external dependencies on host project
- All configuration in framework directory
- Easy to copy between projects
- Can be version controlled separately

### AI Tool Compatible
Works seamlessly with:
- GitHub Copilot
- Claude (Anthropic)
- Cursor IDE
- Gemini Code Assist
- Any AI tool that accepts custom instructions

### Extensible Architecture
- Plugin system for custom rules
- Template inheritance for tech stack variations
- Configurable validation pipelines
- Custom integration patterns
- **Agent-OS Integration**: Seamless enhancement of existing agent-os installations

## 📋 Usage Patterns

### Pattern 1: Copy to Project
```bash
# Copy framework to your project
cp -r portable-subagent-framework ./subagent-framework

# Generate project-specific subagent
cd subagent-framework
node generators/create-subagent.js --project-config=../project-standards.json

# Use the generated subagent
cd ..
node subagent.cjs validate-code --file="src/components/MyComponent.tsx"
```

### Pattern 2: Standalone Repository
```bash
# Create dedicated subagent repository
git clone portable-subagent-framework my-project-standards
cd my-project-standards

# Customize for your organization
node generators/create-subagent.js --organization="MyCompany" --standards="enterprise"

# Publish as npm package or Docker image
npm publish
# or
docker build -t my-company/code-standards .
```

### Pattern 3: Agent-OS Integration (Enhanced)
**For projects with existing agent-os installations:**
```bash
# Enhance existing agent-os with subagent capabilities
cp -r portable-subagent-framework ./subagent-framework
cd subagent-framework

# Interactive integration with existing .agent-os
node generators/integrate-agent-os.js --interactive

# Seamlessly enhances:
# - Pre-flight: Adds subagent activation requirements
# - Task execution: Integrates validation steps
# - Post-flight: Adds compliance verification
# - Quality gates: Adds enforcement rules
# - Standards: Labels existing rules with subagent enforcement
```

## 🔧 Customization Examples

### Define Project Standards
```json
{
  "project": {
    "name": "MyEcommerceApp",
    "tech_stack": "react-typescript",
    "architecture_style": "clean-architecture"
  },
  "rules": {
    "component_complexity": {
      "max_lines": 150,
      "max_props": 7,
      "max_hooks": 5
    },
    "performance": {
      "require_memoization": true,
      "lazy_loading_threshold": 100
    },
    "accessibility": {
      "enforce_aria": true,
      "color_contrast_ratio": 4.5
    },
    "testing": {
      "min_coverage": 85,
      "require_integration_tests": true
    }
  }
}
```

### Custom Tech Stack Template
```javascript
// templates/my-custom-stack/validator.js
class MyStackValidator extends BaseValidator {
  validateComponent(code) {
    // Custom validation logic for your tech stack
    return this.runRules(code, this.config.rules);
  }
  
  generateFixes(violations) {
    // Custom fix suggestions
    return violations.map(v => this.createFix(v));
  }
}
```

## 🚀 Getting Started

1. **Copy the Framework**
   ```bash
   cp -r portable-subagent-framework /path/to/your/project/
   ```

2. **Install Dependencies**
   ```bash
   cd portable-subagent-framework
   npm install
   ```

3. **Generate Your Subagent**
   ```bash
   node generators/create-subagent.js --interactive
   ```

4. **Test with Sample Code**
   ```bash
   cd ..
   node subagent.cjs test --sample
   ```

## 📖 Documentation

- **[Quick Start Guide](docs/quick-start.md)** - Get up and running in 5 minutes
- **[Agent-OS Integration](docs/agent-os-integration.md)** - Enhance existing agent-os installations  
- **[Customization Guide](docs/customization-guide.md)** - Adapt for your specific needs  
- **[API Reference](docs/api-reference.md)** - Complete framework API
- **[Tech Stack Guides](docs/tech-stack-guides/)** - Implementation guides for specific stacks

## 🤝 Contributing

This framework is designed to be extended and improved. See the [contribution guide](CONTRIBUTING.md) for adding new tech stack templates or improving the core validation engine.

## 📄 License

MIT License - Feel free to use, modify, and distribute for any project.

---

**Built with the proven architecture standards from the SmugMug Photo Discovery project - now portable to any codebase.**