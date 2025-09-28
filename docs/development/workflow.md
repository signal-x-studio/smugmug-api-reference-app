# Development Workflow

This document outlines the development workflow, Git practices, and CI/CD processes for the SmugMug API Reference Application.

## Git Workflow

### Branch Strategy
We use **GitHub Flow** - a simplified Git workflow perfect for continuous deployment:

```
main (production-ready)
├── feature/photo-discovery-search
├── feature/bulk-operations  
├── hotfix/auth-token-refresh
└── docs/api-documentation
```

### Branch Naming Conventions
```
feature/description-of-feature    # New features
bugfix/description-of-bug        # Bug fixes
hotfix/critical-issue            # Critical production fixes
docs/documentation-update        # Documentation changes
refactor/component-name          # Code refactoring
perf/optimization-area           # Performance improvements
```

### Commit Message Format
Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements  
- `test`: Adding or modifying tests
- `chore`: Maintenance tasks

**Examples:**
```bash
feat(search): add natural language query parsing
fix(auth): resolve token refresh infinite loop
docs(api): update endpoint documentation
refactor(components): extract reusable PhotoGrid component
perf(search): optimize indexing for large photo sets
test(bulk-ops): add integration tests for bulk operations
```

## Development Process

### 1. **Feature Development**
```bash
# 1. Create feature branch from main
git checkout main
git pull origin main
git checkout -b feature/your-feature-name

# 2. Develop with frequent commits
git add .
git commit -m "feat: implement basic search functionality"

# 3. Push branch and create PR
git push origin feature/your-feature-name
# Create PR via GitHub UI
```

### 2. **Code Review Process**
- **All changes** require code review via Pull Requests
- **No direct commits** to main branch
- **Reviewers check**:
  - Architecture compliance (see [agents.md](../../agents.md))
  - Code quality standards
  - Test coverage
  - Documentation updates

### 3. **Pull Request Requirements**
- [ ] **Tests pass** (CI checks)
- [ ] **Code coverage** maintained (>90%)
- [ ] **TypeScript** compiles without errors
- [ ] **Documentation** updated if needed
- [ ] **Architecture smells** check passed
- [ ] **Performance** benchmarks met

### 4. **Merge Strategy**
- Use **"Squash and merge"** for feature branches
- Use **"Merge commit"** for hotfixes (to preserve history)
- Delete feature branches after merge

## Testing Strategy

### Test Types & Coverage
```typescript
// Unit Tests - Individual component/function testing
describe('PhotoSearchEngine', () => {
  it('should parse natural language queries', () => {
    // Test implementation
  });
});

// Integration Tests - Component interaction testing  
describe('SearchWorkflow', () => {
  it('should complete full search and filter flow', () => {
    // Test workflow
  });
});

// E2E Tests - Full user journey (if applicable)
describe('PhotoDiscovery', () => {
  it('should allow user to search, filter, and bulk download', () => {
    // End-to-end test
  });
});
```

### Test Requirements
- **Unit Tests**: >90% code coverage
- **Integration Tests**: Critical workflows covered
- **Component Tests**: All public APIs tested
- **Performance Tests**: Search < 3s, render < 100ms

### Running Tests
```bash
# Development (watch mode)
npm run test

# CI mode (run once)
npm run test:run

# Coverage report
npm run test -- --coverage

# Specific test file
npm run test -- SearchEngine.test.ts
```

## Quality Gates

### Pre-Commit Checks
```bash
# Automated checks before each commit
npm run lint         # ESLint validation
npm run type-check   # TypeScript compilation
npm run test:run     # Full test suite
npm run build        # Production build test
```

### Architecture Compliance
Before committing, verify against [Architecture Smells Rubric](../../.agent-os/standards/architecture-smells.md):

- [ ] Components <200 lines
- [ ] useEffect ≤3 dependencies  
- [ ] No `any` types in production
- [ ] Proper memoization
- [ ] Error handling with cleanup

### Performance Benchmarks
- **Search Response**: <3 seconds for 10k+ photos
- **Component Render**: <100ms for complex components  
- **Memory Usage**: <5MB growth per operation
- **Bundle Size**: <1MB per route

## CI/CD Pipeline

### GitHub Actions Workflow
```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      - name: Install dependencies
        run: npm install
      - name: Run tests
        run: npm run test:run
      - name: Build project  
        run: npm run build
```

### Deployment Pipeline
```bash
# Automatic deployment on main branch merge
main branch → GitHub Actions → GitHub Pages

# Manual deployment  
npm run build
npm run deploy  # If configured
```

## Code Review Guidelines

### For Authors
- [ ] **Self-review** code before requesting review
- [ ] **Write descriptive** PR description and commit messages
- [ ] **Update documentation** for API changes
- [ ] **Add tests** for new functionality
- [ ] **Check architecture compliance** against smells rubric

### For Reviewers
- [ ] **Verify functionality** works as intended
- [ ] **Check architecture** follows established patterns
- [ ] **Review test coverage** and quality
- [ ] **Validate performance** impact
- [ ] **Ensure documentation** is updated

### Review Checklist
```markdown
## Code Review Checklist

### Architecture & Design
- [ ] Single Responsibility Principle followed
- [ ] Components <200 lines with clear purpose
- [ ] Proper separation of concerns
- [ ] Consistent with existing patterns

### Performance  
- [ ] Expensive operations memoized
- [ ] No unnecessary re-renders
- [ ] Proper cleanup in useEffect
- [ ] Bundle size impact acceptable

### Type Safety
- [ ] No `any` types in production code
- [ ] All props have explicit interfaces
- [ ] Error handling with Result<T,E> pattern
- [ ] TypeScript strict mode compliance

### Testing
- [ ] New features have tests
- [ ] Tests are behavior-focused  
- [ ] Test coverage >90% maintained
- [ ] Edge cases covered

### Documentation
- [ ] API changes documented
- [ ] Complex logic explained
- [ ] Usage examples provided
- [ ] README updated if needed
```

## Release Process

### Version Management
```bash
# Semantic versioning: MAJOR.MINOR.PATCH
1.0.0  # Major release (breaking changes)
1.1.0  # Minor release (new features)  
1.1.1  # Patch release (bug fixes)
```

### Release Steps
1. **Create release branch**: `git checkout -b release/1.1.0`
2. **Update version**: Update `package.json` version
3. **Update changelog**: Document new features/fixes
4. **Final testing**: Run full test suite
5. **Merge to main**: Create PR and merge
6. **Tag release**: `git tag v1.1.0`
7. **Deploy**: Automatic via GitHub Actions

## Emergency Procedures

### Hotfix Process
```bash
# For critical production issues
git checkout main
git checkout -b hotfix/critical-auth-fix
# Make minimal fix
git commit -m "fix: resolve critical auth token issue"
git push origin hotfix/critical-auth-fix
# Create PR with "HOTFIX" label for expedited review
```

### Rollback Process
```bash
# If deployment issues occur
git revert <commit-hash>  # Revert problematic commit
git push origin main      # Deploy rollback
```

## Tools & Integrations

### Development Tools
- **VS Code**: Primary IDE with recommended extensions
- **Vite**: Build tool and dev server
- **Vitest**: Testing framework
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **TypeScript**: Type checking

### Monitoring & Analytics  
- **GitHub Actions**: CI/CD automation
- **GitHub Pages**: Static site hosting
- **Bundle Analyzer**: Bundle size monitoring
- **Performance API**: Runtime performance tracking

---

**Need Help?** 
- Check [Common Issues](../troubleshooting/common-issues.md)
- Review [Code Quality Standards](./code-quality.md)  
- See [Architecture Documentation](../architecture/technical-architecture.md)