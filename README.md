# SmugMug API Reference Application

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.1-61dafb)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646cff)](https://vitejs.dev/)
[![Live Demo](https://img.shields.io/badge/Live-Demo-blue)](https://signal-x-studio.github.io/smugmug-api-reference-app/)

This project is a reference application and case study for building an **AI-native** system. It demonstrates a holistic AI-first strategy with three core pillars:

1.  **Building WITH AI**: Using a multi-agent workflow and a custom subagent to enforce architectural standards and accelerate development.
2.  **Building AI INTO Features**: Integrating AI for core application functionality, like semantic photo search.
3.  **Building FOR AI**: Architecting the application with a dual (human/machine) interface to be natively controllable by external AI agents.

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

## Key Documentation

This project's documentation explains the principles and patterns used in its construction.

-   **[AI-Native Case Study](./AI-NATIVE-CASE-STUDY.md)**: A high-level overview of the project's AI-first strategy.
-   **[Technical Decisions](./docs/architecture/technical-decisions.md)**: Explains the core architectural choices, such as the service layer and state management.
-   **[Code Quality Standards](./docs/development/code-quality.md)**: Outlines the configuration for TypeScript, linting, and testing.
-   **[AI-Assisted Workflow](./docs/development/ai-workflow.md)**: Describes the process for using AI tools in the development cycle.

For a full list of documents, see the **[Documentation Index](./docs/README.md)**.

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
