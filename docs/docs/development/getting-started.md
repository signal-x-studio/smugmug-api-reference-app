# Getting Started

This guide will help you set up the SmugMug API Reference Application for local development.

## Prerequisites

### Required Software
- **Node.js** 18+ (recommended: 20+)
- **npm** 8+ (comes with Node.js)
- **Git** for version control

### Development Tools (Recommended)
- **VS Code** with extensions:
  - TypeScript and JavaScript Language Features
  - ES7+ React/Redux/React-Native snippets
  - Tailwind CSS IntelliSense
  - Auto Rename Tag

## Installation

### 1. Clone Repository
```bash
git clone https://github.com/signal-x-studio/smugmug-api-reference-app.git
cd smugmug-api-reference-app
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
```bash
# Copy environment template
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# SmugMug API Credentials (optional for basic features)
VITE_SMUGMUG_API_KEY=your_api_key_here
VITE_SMUGMUG_API_SECRET=your_api_secret_here

# Gemini AI API Key (optional for AI features)
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Application Settings
VITE_APP_TITLE=SmugMug API Reference
VITE_APP_VERSION=1.0.0
```

### 4. Start Development Server
```bash
npm run dev
```

The application will be available at: http://localhost:3000

## Development Workflow

### Available Scripts
```bash
# Development
npm run dev          # Start dev server with hot reload
npm run build        # Build for production
npm run preview      # Preview production build locally

# Testing  
npm run test         # Run tests in watch mode
npm run test:run     # Run tests once (CI mode)

# Linting (if configured)
npm run lint         # Run ESLint
npm run lint:fix     # Fix auto-fixable lint issues
```

### Project Structure Overview
```
src/
├── components/           # React components
│   ├── FilterPanel.tsx   # Advanced filtering interface
│   ├── BulkOperations.tsx # Multi-select and bulk ops
│   └── __tests__/        # Component tests
├── utils/
│   └── agent-native/     # Agent integration layer
├── hooks/               # Custom React hooks
├── types/               # TypeScript definitions
└── src/services/            # Business logic
```

## Key Features to Explore

### 1. **Natural Language Search**
- Try searching: "Find sunset beach photos"
- Explore semantic matching capabilities
- Test fuzzy search with typos

### 2. **Advanced Filtering**
- Use the filter panel for dynamic filtering
- Test mobile responsive design
- Observe real-time filter updates

### 3. **Bulk Operations**
- Select multiple photos using checkboxes
- Try bulk operations (download, tag, etc.)
- Test keyboard navigation (Space to select)

### 4. **Agent Integration**
- Open browser dev tools
- Check `window.agentState` for exposed APIs
- Test natural language commands in console

## Development Guidelines

### Code Quality Standards
- **Components**: Keep under 200 lines
- **Hooks**: Maximum 3 dependencies per useEffect
- **Types**: No `any` types in production code
- **Performance**: Memoize expensive operations
- **Testing**: Write behavior-focused tests

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: add your feature description"

# Push and create PR
git push origin feature/your-feature-name
```

### Testing
```bash
# Run all tests
npm run test

# Run specific test file
npm run test -- FilterPanel.test.tsx

# Run tests with coverage
npm run test -- --coverage
```

## Common Tasks

### Adding a New Component
1. Create component file in `src/components/`
2. Add corresponding test file in `src/components/__tests__/`
3. Export from `src/components/index.ts` (if exists)
4. Follow the component template patterns

### Adding a New Hook
1. Create hook file in `src/hooks/`
2. Add test file in `src/hooks/__tests__/`
3. Follow single responsibility principle
4. Include proper cleanup and error handling

### Adding New Types
1. Add to existing type file or create new in `src/types/`
2. Use explicit interfaces over `any` types
3. Export from main types file
4. Document complex types with JSDoc comments

## Troubleshooting

### Common Issues
- **Port 3000 in use**: Try `npm run dev -- --port 3001`
- **Module not found**: Delete `node_modules` and run `npm install`
- **Build fails**: Check TypeScript errors with `npx tsc --noEmit`

### Performance Issues
- **Slow development**: Clear Vite cache with `rm -rf node_modules/.vite`
- **Large bundle**: Analyze with `npm run build && npx vite build --analyze`

### More Help
- See [Common Issues](../troubleshooting/common-issues.md)
- Check [Development Workflow](./workflow.md)
- Review [Code Quality Standards](./code-quality.md)

## Next Steps

1. **Explore the Codebase**: Start with `src/components/` and `src/utils/agent-native/`
2. **Read Architecture Docs**: [Technical Architecture](../architecture/technical-architecture.md)
3. **Understand Agent Integration**: [Agent-Native Design](../architecture/agent-native-design.md)
4. **Learn AI Development**: [AI Development Process](./ai-development-process.md)

---

**Ready to contribute?** Check out our [Development Workflow](./workflow.md) and [Code Quality Standards](./code-quality.md)!