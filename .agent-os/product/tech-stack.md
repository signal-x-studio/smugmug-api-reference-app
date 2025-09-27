# Technical Stack

> Last Updated: 2025-09-27
> Version: 2.0.0 - Enhanced with AI Agent Architecture

## Application Framework

- **Framework:** React with TypeScript
- **Version:** React 18.x with TypeScript 5.x
- **Build Tool:** Vite
- **Import Strategy:** Node modules with ES6 imports
- **Architecture:** Hybrid SPA with Backend Agent Services

## Database

- **Primary Database:** PostgreSQL (for agent state and user data)
- **Agent State Storage:** Redis for real-time agent conversations
- **Vector Database:** For conversation context and user preferences (optional)
- **Data Source:** SmugMug API (external REST API)
- **Data Layer:** Service-based architecture with API clients and agent coordination
- **State Management:** React Hooks + AG-UI shared state protocol

## JavaScript

- **Framework:** React 18.x
- **Language:** TypeScript 5.x
- **Runtime:** Node.js v18+ (development environment)
- **Package Manager:** npm
- **Module System:** ES6 modules with Vite bundler

## CSS Framework

- **Framework:** Tailwind CSS
- **Configuration:** Custom Tailwind config for design system
- **Responsive Design:** Mobile-first approach
- **Build Integration:** PostCSS with Vite

## UI Components

- **Component Library:** Custom React components (no external library)
- **Design System:** Custom components following consistent patterns
- **Component Architecture:** Functional components with hooks
- **Styling Approach:** Tailwind utility classes

## Typography & Icons

- **Fonts Provider:** System fonts/default browser fonts
- **Icon Library:** To be determined (not specified in current implementation)
- **Font Loading:** Native system font stack for performance

## Authentication & Security

- **Authentication Protocol:** OAuth 1.0a
- **Implementation Constraint:** Requires server-side proxy for production
- **Current Status:** Development mode only (OAuth secrets exposed client-side)
- **Security Note:** Production deployment requires backend proxy to secure OAuth flow

## AI Integration

- **AI Provider:** Google Gemini API with ADK integration
- **Agent Framework:** Google ADK (Agent Development Kit)
- **Use Case:** Conversational photo management, metadata generation, and intelligent automation
- **Integration:** Backend agents with AG-UI protocol for frontend communication
- **Agent Types:** Metadata Agent, Curation Agent, Storytelling Agent

## Backend Agent Infrastructure

- **Agent Framework:** Google ADK (Agent Development Kit)
- **Agent Runtime:** Python 3.8+ or Node.js 18+ backend
- **Agent Protocol:** A2A (Agent-to-Agent) for multi-agent coordination
- **Frontend Protocol:** AG-UI for agent-user interaction
- **State Management:** Redis for real-time agent state
- **Containerization:** Docker for agent isolation and deployment
- **Orchestration:** Kubernetes for production scaling (Phase 4)

## Hosting & Deployment

### Phase 2: Development & Early Production
- **Frontend Hosting:** Vercel, Netlify, or similar static hosting
- **Backend Agent Hosting:** Railway, Render, or Google Cloud Run
- **Database Hosting:** Managed PostgreSQL (Supabase, Railway)
- **Asset Hosting:** CDN integration (Cloudflare, Vercel Edge)
- **Development Environment:** Local agent development with ADK

### Phase 3-4: Production & Enterprise
- **Frontend:** Multi-region CDN deployment
- **Backend Agents:** Kubernetes clusters with auto-scaling
- **Database:** PostgreSQL clusters with replication
- **Monitoring:** DataDog, New Relic, or similar enterprise monitoring
- **Security:** Enterprise security compliance and auditing

## Development Environment

### Frontend Development
- **Runtime:** Node.js v18+
- **Development Server:** Vite dev server with HMR
- **Package Manager:** npm
- **Code Repository:** Git with GitHub integration
- **Build Tool:** Vite with TypeScript and React plugins

### Backend Agent Development
- **Agent Framework:** ADK CLI and development tools
- **Runtime:** Python 3.8+ or Node.js 18+ for agent backend
- **Agent Protocol Libraries:** CopilotKit, AG-UI protocol dependencies
- **Local Agent Server:** ADK development server (typically port 8000)
- **Containerization:** Docker for local agent testing
- **Testing:** Agent testing frameworks and mock conversations

## Agent Dependencies

### Core Agent Libraries
- **Google ADK:** Agent Development Kit for agent orchestration
- **CopilotKit:** React integration for AG-UI protocol
- **ag-ui:** Agent-User Interaction Protocol implementation
- **WebSocket/SSE:** Real-time communication between agents and frontend

### Agent Development Tools
- **ADK CLI:** Agent development and deployment tools
- **Agent Testing:** Mock conversation frameworks and unit testing
- **Agent Monitoring:** Performance tracking and debugging tools
- **Agent Documentation:** ADK documentation and examples

## API Integration

- **Primary API:** SmugMug API v2
- **API Client:** Custom TypeScript service layer
- **HTTP Client:** Native fetch API with custom wrappers
- **Rate Limiting:** Handled by SmugMug API limits
- **Error Handling:** Custom error handling in service layer

## Architecture Decisions

### Client-Side Only Approach

- **Decision:** Pure client-side SPA architecture
- **Rationale:** Simplified development and deployment for API reference tool
- **Trade-off:** OAuth 1.0a requires client-side secret exposure in development

### No External UI Library

- **Decision:** Custom React components instead of Material-UI, Ant Design, etc.
- **Rationale:** Full control over design and smaller bundle size
- **Trade-off:** More development time for common UI patterns

### Vite Build Tool

- **Decision:** Vite over Create React App or Webpack
- **Rationale:** Faster development builds, modern ES modules, better TypeScript support
- **Benefits:** Hot Module Replacement, optimized production builds

### TypeScript Adoption

- **Decision:** Full TypeScript implementation
- **Rationale:** Better developer experience, API contract enforcement, reduced runtime errors
- **Coverage:** All components, services, and utility functions

### ADK Agent Architecture

- **Decision:** Google ADK for agent development over custom solutions
- **Rationale:** Mature framework, model-agnostic, excellent tooling and documentation
- **Benefits:** Multi-agent coordination, A2A protocol, production-ready deployment
- **Trade-off:** Additional infrastructure complexity and learning curve

### AG-UI Protocol Adoption

- **Decision:** AG-UI for agent-frontend communication over custom WebSocket implementation
- **Rationale:** Standardized protocol, CopilotKit integration, generative UI capabilities
- **Benefits:** Real-time state synchronization, conversational interfaces, human-in-the-loop
- **Implementation:** Hybrid approach maintaining traditional UI alongside conversational interface

### Multi-Agent Specialization

- **Decision:** Specialized agents (Metadata, Curation, Storytelling) over single general-purpose agent
- **Rationale:** Better performance, clearer responsibilities, easier testing and maintenance
- **Coordination:** A2A protocol for agent-to-agent communication and workflow handoffs
- **Scalability:** Individual agent scaling based on usage patterns

## Production Considerations

### OAuth 1.0a Constraint

The current implementation exposes OAuth secrets client-side, which is acceptable for development but requires a backend proxy for production:

- **Current:** Direct client-side OAuth (development only)
- **Required for Production:** Backend proxy server to handle OAuth flow
- **Impact:** Additional infrastructure requirement for production deployment

### Deployment Requirements

#### Phase 2: Basic Production
- **Frontend:** Static file hosting (Netlify, Vercel, S3 + CloudFront)
- **Backend Agents:** Container hosting (Cloud Run, Railway, Render)
- **OAuth Proxy:** Node.js/Express server for OAuth handling
- **Environment Variables:** Secure credential management for OAuth and AI APIs
- **Agent Communication:** WebSocket/SSE infrastructure

#### Phase 3-4: Enterprise Production
- **Frontend:** Multi-region CDN with edge computing
- **Backend Agents:** Kubernetes clusters with auto-scaling
- **Database:** PostgreSQL clusters with read replicas
- **Monitoring:** Enterprise monitoring and alerting
- **Security:** Enterprise compliance and security auditing

### Performance Optimizations

- **Bundle Splitting:** Vite automatic code splitting
- **Tree Shaking:** Unused code elimination
- **Asset Optimization:** Image and font optimization
- **Lazy Loading:** Component-level lazy loading for larger features

## Infrastructure Cost Considerations

### Development Phase (Phase 2)
- **Monthly Cost Range:** $30-125/month
- **Free Tier Options:** Vercel, Railway, Supabase free tiers
- **Paid Development:** $50-200/month for enhanced resources

### Production Deployment (Phase 3)
- **Small Scale (1K-10K users):** $200-600/month
- **Medium Scale (10K-100K users):** $1,000-5,000/month
- **Large Scale (100K+ users):** $5,000-15,000/month

### Enterprise Deployment (Phase 4)
- **Enterprise Infrastructure:** $15,000-50,000/month
- **Global Multi-Region:** $50,000-150,000/month
- **Custom Enterprise Requirements:** Variable based on compliance and scale

## Future Technical Considerations

### Near-Term Enhancements
- **Icon Library:** Heroicons or Lucide React integration
- **Agent Testing:** Comprehensive agent testing and mocking frameworks
- **Advanced Monitoring:** Agent performance analytics and optimization
- **Security Hardening:** Enhanced agent security and conversation encryption

### Long-Term Evolution
- **Edge Computing:** Agent deployment at edge locations for reduced latency
- **Custom Models:** Fine-tuned models for photo management specific tasks
- **Multi-Cloud:** Cross-cloud deployment for redundancy and optimization
- **Advanced Analytics:** User behavior analysis and agent learning optimization
