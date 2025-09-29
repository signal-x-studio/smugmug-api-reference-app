#!/bin/bash
# generate-dual-docs.sh - Automated setup for dual-purpose documentation methodology

set -e
echo "🚀 Dual-Purpose Documentation Generator"
echo "======================================"

# Check if project context exists
if [ ! -f "project-context.yml" ]; then
    echo "📋 Creating project context template..."
    cp docs/meta/project-context-template.yml project-context.yml
    echo "⚠️  Please edit project-context.yml with your project details before proceeding"
    exit 1
fi

echo "📁 Creating documentation structure..."
mkdir -p docs/{architecture,development,enterprise,guides,reference,meta}
mkdir -p scripts ai-prompts

# Check for root pollution and offer to clean
ROOT_DOCS=$(find . -maxdepth 1 -name "*.md" -not -name "README.md" | wc -l)
if [ $ROOT_DOCS -gt 0 ]; then
    echo "⚠️  Found $ROOT_DOCS markdown files in root directory"
    read -p "Move them to docs/development/? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        find . -maxdepth 1 -name "*.md" -not -name "README.md" -exec mv {} docs/development/ \;
        echo "✅ Moved files to docs/development/"
    fi
fi

echo "📝 Creating AI prompt templates..."
cat > agent-framework/prompts/README.md << 'EOF'
# AI Prompts for Dual-Purpose Documentation

This directory contains templates for generating both practical developer documentation and enterprise showcase documentation using different AI tools.

## Usage

1. **Edit project-context.yml** with your specific project details
2. **Use gemini-prompts.md** with Gemini for practical, accessible documentation  
3. **Use claude-prompts.md** with Claude for comprehensive, enterprise-grade documentation
4. **Place outputs** in appropriate docs subdirectories
5. **Cross-reference** between layers for strategic navigation

## File Organization

- `gemini-prompts.md` - Practical developer-focused documentation prompts
- `claude-prompts.md` - Enterprise showcase and ROI-focused documentation prompts  
- `validation-checklist.md` - Quality assurance checklist for generated documentation
EOF

# Generate validation script
cat > scripts/validate-docs-org.sh << 'EOF'
#!/bin/bash
# validate-docs-org.sh - Validate documentation organization

echo "🔍 Validating documentation organization..."

# Check for root pollution
ROOT_DOCS=$(find . -maxdepth 1 -name "*.md" -not -name "README.md" | wc -l)
if [ $ROOT_DOCS -gt 0 ]; then
    echo "⚠️  Warning: $ROOT_DOCS documentation files in root directory"
    find . -maxdepth 1 -name "*.md" -not -name "README.md"
    echo "   Consider moving to docs/ subdirectories"
else
    echo "✅ Root directory is clean"
fi

# Check required structure  
REQUIRED_DIRS=("docs/architecture" "docs/development" "docs/enterprise" "docs/guides")
for dir in "${REQUIRED_DIRS[@]}"; do
    if [ ! -d "$dir" ]; then
        echo "❌ Missing required directory: $dir"
    else
        DOC_COUNT=$(find "$dir" -name "*.md" | wc -l)
        echo "✅ Found: $dir ($DOC_COUNT documents)"
    fi
done

# Check documentation index
if [ -f "docs/README.md" ]; then
    echo "✅ Documentation index exists"
else
    echo "❌ Missing documentation index: docs/README.md"  
fi

# Check project context
if [ -f "project-context.yml" ]; then
    echo "✅ Project context file exists"
else
    echo "⚠️  Missing project-context.yml (run generate-dual-docs.sh first)"
fi

echo "📊 Documentation organization validation complete"
EOF

chmod +x scripts/validate-docs-org.sh

echo ""
echo "✅ Setup Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Edit project-context.yml with your project details"
echo "2. Use prompts in agent-framework/prompts/ with appropriate AI tools"
echo "3. Place generated docs in proper directories"
echo "4. Run ./scripts/validate-docs-org.sh to verify setup"
echo ""
echo "🎯 Goal: Create documentation serving both developers and enterprise decision-makers!"