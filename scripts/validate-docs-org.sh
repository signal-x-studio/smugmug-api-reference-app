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