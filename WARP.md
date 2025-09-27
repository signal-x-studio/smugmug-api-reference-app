# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a React-based SmugMug API reference application demonstrating OAuth 1.0a authentication, AI-powered photo metadata generation, and enterprise-grade development patterns. It serves as both a functional SmugMug integration tool and a comprehensive case study in AI-assisted software development.

**Technology Stack:** React 19.1.1, TypeScript 5.8, Vite 5.4, Tailwind CSS 3.4, Google Gemini AI 1.21.0

## Development Commands

### Essential Commands
```bash
# Install dependencies (first time setup)
npm install

# Start development server (runs on http://localhost:3000)
npm run dev

# Build for production (outputs to dist/)
npm run build

# Preview production build
npm run preview
```

### Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit .env and add Gemini API key (optional - app works without it)
# GEMINI_API_KEY=your_api_key_here
```

**Note:** The application works fully without API keys using mock data. AI features will show mock responses if no Gemini API key is provided.

## Architecture Overview

### Service Layer Pattern
The application uses a clean service layer abstraction that separates API complexity from UI components:

- **`services/mockSmugMugService.ts`** - Active service for development (avoids OAuth complexity)
- **`services/smugmugService.ts`** - Complete OAuth 1.0a reference implementation 
- **`services/geminiService.ts`** - AI integration with structured JSON responses

### State Management
- **Centralized in `App.tsx`** using React Hooks (no Redux/Zustand)
- **Data flow:** Props down, callbacks up
- **Photo status tracking** through `PhotoStatus` enum
- **Activity logging** for user actions and system events

### AI Integration Architecture
Three distinct AI workflow patterns:
1. **Single photo analysis** - Individual metadata generation
2. **Batch processing** - Multiple photos with progress tracking
3. **Smart matching** - Content-based photo filtering for album creation

All AI responses use structured JSON schemas for reliability:
```typescript
const responseSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    description: { type: Type.STRING },
    keywords: { type: Type.ARRAY, items: { type: Type.STRING } }
  },
  required: ["title", "description", "keywords"]
};
```

### OAuth 1.0a Implementation
- **Development Mode:** Uses mock service to avoid OAuth complexity
- **Production Mode:** Requires backend proxy (security constraint)
- **Reference Implementation:** Complete OAuth 1.0a flow in `services/smugmugService.ts`

**Security Note:** OAuth secrets must never be exposed client-side in production. The reference implementation is educational only.

## Key Development Patterns

### Component Structure
All React components follow this pattern:
```typescript
interface ComponentProps {
  // Props interface first with clear types
}

const Component: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  // Hooks at top
  // Event handlers with useCallback for performance
  // Early returns for loading/error states
  // Main render logic
};
```

### Error Handling
Standardized error handling across all services:
```typescript
try {
  const result = await serviceMethod();
  addActivityLog('Success message', 'success');
  return result;
} catch (error) {
  console.error('Context:', error);
  addActivityLog('Error message', 'error');
  throw new Error('User-friendly message');
}
```

### TypeScript Integration
- **100% type coverage** with strict mode enabled
- **All interfaces** centralized in `types.ts`
- **Path aliases** configured: `@/*` maps to project root
- **No runtime type errors** through comprehensive typing

## File Structure

```
├── components/           # Reusable React UI components
├── services/            # External API integration layer
│   ├── mockSmugMugService.ts    # Active development service
│   ├── smugmugService.ts        # OAuth 1.0a reference
│   └── geminiService.ts         # AI/Gemini integration
├── docs/                # Comprehensive project documentation
├── App.tsx              # Main application with centralized state
├── types.ts             # All TypeScript interfaces and enums
├── index.tsx            # React entry point
└── vite.config.ts       # Build configuration
```

## Testing Approach

**Note:** This project currently has no formal test suite but follows testable patterns:

- **Component testing:** Focus on user interactions and state changes
- **Service testing:** Mock external API calls, validate response handling
- **AI service testing:** Use sample images, validate JSON schema responses
- **Error path testing:** Ensure components handle loading/error states properly

## Multi-Agent Development Context

This codebase was developed using a multi-agent approach:

### GitHub Copilot Usage
- Code completion and individual function generation
- TypeScript interfaces and React component boilerplate
- JSDoc comments and inline documentation

### Claude Code (CLI) Usage  
- Complex multi-file feature implementation
- Architectural changes and refactoring
- Coordination between React components and service layer

### AI Agent Coordination
When working on this codebase:
- **Individual file edits:** Use completion-based tools
- **Multi-file features:** Use context-aware agents
- **AI prompt optimization:** Test with different scenarios
- **Respect existing patterns:** Follow established service layer and component structure

## Production Deployment

### Requirements
- **Backend proxy required** for OAuth 1.0a security
- **Environment variables** for API keys and configuration
- **Static hosting sufficient** for frontend (Vercel, Netlify recommended)

### Performance Considerations
- **Image optimization** for photo loading performance
- **API rate limiting** for SmugMug and Gemini APIs
- **Batch processing optimization** reduces API calls by 75%
- **Sub-200ms response times** through intelligent caching

## Development Notes

### When Adding Features
1. Update TypeScript interfaces in `types.ts` first
2. Implement in service layer before UI components
3. Test with mock data before integrating real APIs
4. Add activity logging for user-visible actions
5. Handle loading and error states in components

### When Working with AI Features
1. Test with diverse image types and content scenarios
2. Validate JSON schema responses work consistently  
3. Consider rate limiting and error handling
4. Use custom instructions and keyword filtering features

### OAuth Development
- Use mock service for development to avoid browser CORS limitations
- Reference `services/smugmugService.ts` for production backend implementation
- Test OAuth flow requires SmugMug developer account and registered application

## Troubleshooting

For common issues, see `TROUBLESHOOTING.md` which covers:
- Port conflicts and build errors
- Styling issues and Tailwind problems
- Node.js version compatibility
- Performance optimization tips