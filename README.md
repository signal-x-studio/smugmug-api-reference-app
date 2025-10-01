# SmugMug API Reference Application

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.1-61dafb)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646cff)](https://vitejs.dev/)
[![Live Demo](https://img.shields.io/badge/Live-Demo-blue)](https://signal-x-studio.github.io/smugmug-api-reference-app/)

> **Built in 72 hours by one developer + five AI agents**
>
> This isn't just a reference app—it's proof that solo developers can build enterprise-grade products by orchestrating AI agents as a virtual team.

## The Story

**Traditional approach:** 4 developers × 3 months = $144,000
**This approach:** 1 developer × 3 days + AI agents = $1,657 (98.8% cost reduction)

I didn't use AI to code faster. I **orchestrated specialized AI agents as a development team**, each with distinct roles: feature building, testing, code review, documentation, and DevOps.

**The result:** 20,000+ lines of production code, comprehensive testing, 78,000 words of documentation—in a weekend.

📖 **Read the full story:** [AI Development Case Study](./docs/AI-DEVELOPMENT-CASE-STUDY.md)

---

## Three Pillars of AI-Native Development

1.  **Building WITH AI**: Multi-agent workflow where each agent specializes (like hiring a team)
2.  **Building AI INTO Features**: Semantic photo search powered by Google Gemini
3.  **Building FOR AI**: Agent-native architecture with dual human/machine interfaces

## Core Features

-   **AI-Powered Photo Search**: Natural language search for photo discovery.
-   **Bulk Operations**: A virtualized interface for selecting and managing thousands of photos.
-   **SmugMug API Integration**: A complete reference implementation for OAuth 1.0a authentication.
-   **Agent-Native Design**: Components are built with a dual interface for both UI and programmatic control.
-   **AI-Enforced Architecture**: A portable subagent framework enforces project-specific coding standards.

## Live Demo

You can try the application live at: **[https://signal-x-studio.github.io/smugmug-api-reference-app/](https://signal-x-studio.github.io/smugmug-api-reference-app/)**

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/signal-x-studio/smugmug-api-reference-app.git
cd smugmug-api-reference-app

# 2. Install dependencies
npm install

# 3. Set up environment variables (optional)
# The app will use mock data if no API keys are provided.
cp .env.example .env

# 4. Start the development server
npm run dev
```

The application will be available at `http://localhost:3000`.

## Documentation

### For Developers Who Want to Replicate This

-   **[AI Development Case Study](./docs/AI-DEVELOPMENT-CASE-STUDY.md)**: How I built this in 72 hours with AI agents
-   **[Agent Team Architecture](./docs/AGENT-TEAM-ARCHITECTURE.md)**: My virtual team structure and orchestration workflow
-   **[Go-To-Market Guide](./docs/GO-TO-MARKET-GUIDE.md)**: How to share your own AI-assisted projects

### Technical Documentation

-   **[Technical Architecture](./docs/TECHNICAL-ARCHITECTURE.md)**: System design, patterns, code examples
-   **[Business Impact Analysis](./docs/BUSINESS-IMPACT-ANALYSIS.md)**: ROI calculations and strategic value
-   **[Production Readiness Review](./docs/PRODUCTION-READINESS-REVIEW.md)**: Operational maturity assessment
-   **[Tech Debt Backlog](./docs/TECH-DEBT-BACKLOG.md)**: Known gaps and remediation plans

For a full list of documents, see **[docs/README.md](./docs/README.md)**.

## Available Scripts

-   `npm run dev`: Start the development server.
-   `npm run build`: Build the application for production.
-   `npm run preview`: Preview the production build locally.
-   `npm run test`: Run the test suite with Vitest.

## Project Structure

```
src/
├── components/       # Feature-specific and shared React components
├── hooks/            # Custom React hooks
├── services/         # Business logic and API interactions (SmugMug, Gemini)
├── types/            # TypeScript type definitions
└── utils/            # Utility functions
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
