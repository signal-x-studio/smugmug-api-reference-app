# AGENTS.md

## Project Overview
This is a React-based SmugMug API reference application that demonstrates OAuth 1.0a authentication patterns, AI-powered photo metadata generation, and modern React development practices. The app serves as both an educational tool and a working example for developers integrating with SmugMug's API.

## Setup Commands
- Install dependencies: `npm install`
- Start dev server: `npm run dev`
- Build for production: `npm run build`
- Preview production build: `npm run preview`

## Environment Setup
- Create `.env` file in project root
- Add required environment variable: `API_KEY="your_google_gemini_api_key"`
- The API_KEY is used for AI features via Google Gemini API
- Never commit the `.env` file to version control

## Code Style & Patterns
- TypeScript strict mode enabled
- Use functional components with React Hooks
- Centralized state management in `App.tsx`
- Service layer pattern for API interactions (`services/` directory)
- Tailwind CSS for styling with utility-first approach
- Props passed down from main App component, callbacks bubble up

## File Structure Guidelines
- `components/` - Reusable React UI components
- `services/` - External API integration layer
  - `mockSmugMugService.ts` - Default service (active)
  - `smugmugService.ts` - Real OAuth 1.0a reference implementation
  - `geminiService.ts` - AI/Gemini API integration
- `types.ts` - All TypeScript interfaces and enums
- `App.tsx` - Main application with centralized state
- `.agent-os/` - Agent OS configuration and development workflows

## Multi-Agent Development Approach

### GitHub Copilot Usage
- Excellent for code completion and individual function generation
- Use for generating TypeScript interfaces and React component boilerplate
- Leverage for test generation and JSDoc comments
- Works seamlessly with existing patterns in `components/` and `services/`

### Claude Code (CLI) Usage
- Use for complex multi-file feature implementation
- Best for architectural changes and refactoring across multiple components
- Handles coordination between React components and service layer
- Use when implementing new features from `.agent-os/product/roadmap.md`

### Gemini CLI Usage
- Specialized for AI feature development and optimization
- Use for improving prompts in `services/geminiService.ts`
- Optimize AI workflows like metadata generation and smart album creation
- Performance tuning for batch photo processing

## Key Architecture Patterns

### State Management
- All state centralized in `App.tsx` using React Hooks
- Data flows down via props, events bubble up via callbacks
- No external state management library (Redux, Zustand)
- Photo status managed through `PhotoStatus` enum

### Service Layer
- `mockSmugMugService.ts` is the active service for development
- `smugmugService.ts` provides OAuth 1.0a reference (browser limitations)
- All API calls go through service layer, never direct fetch in components
- Error handling standardized across all services

### AI Integration
- Three distinct AI patterns: single photo, batch processing, smart matching
- All AI calls use structured JSON responses with `responseSchema`
- Custom instructions, keyword deny/allow lists supported
- Gemini API key loaded via environment variable only

## Development Workflow

### When Adding New Features
1. Check `.agent-os/product/roadmap.md` for feature specifications
2. Follow TDD approach: write tests first (if applicable)  
3. Implement in service layer first, then UI components
4. Update TypeScript interfaces in `types.ts` as needed
5. Test with mock data before integrating real APIs

### When Working with AI Features
1. Use `gemini-cli` for prompt optimization and testing
2. Test with different image types and content scenarios
3. Validate JSON schema responses work consistently
4. Consider rate limiting and error handling for production

### OAuth 1.0a Considerations
- Current implementation uses mock service for development
- Real OAuth requires server-side proxy (security constraint)
- `smugmugService.ts` provides reference for backend implementation
- Never expose OAuth secrets client-side in production

## Testing Guidelines
- Component tests focus on user interactions and state changes
- Service tests mock external API calls
- AI service tests use sample images and validate response structure
- Test error handling paths, especially for API failures
- Run tests before committing: components should handle loading/error states

## Common Patterns to Follow

### Component Structure
```typescript
interface ComponentProps {
  // Props interface first
}

const Component: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  // Hooks at top
  // Event handlers
  // Render with early returns for loading/error states
};
```

### Service Integration
```typescript
// Always handle errors in service layer
try {
  const result = await serviceMethod();
  return result;
} catch (error) {
  console.error('Context:', error);
  throw new Error('User-friendly message');
}
```

### AI Integration Pattern
```typescript
// Use structured responses with validation
const response = await geminiModel.generateContent({
  contents: [prompt, imagePart],
  responseSchema: definedSchema
});
```

## Agent Coordination Tips
- **GitHub Copilot**: Use for individual file edits and completions
- **Claude Code**: Use for feature implementation spanning multiple files
- **Gemini CLI**: Use specifically for AI prompt optimization and testing
- Check `.agent-os/instructions/` for detailed workflow patterns
- Each agent should respect existing architecture and patterns

## Production Deployment Notes
- Requires backend proxy for OAuth 1.0a (security requirement)
- Environment variables must be properly configured
- AI API keys need rate limiting and usage monitoring
- Static hosting sufficient for frontend (Vercel, Netlify)
- Consider image optimization for photo loading performance