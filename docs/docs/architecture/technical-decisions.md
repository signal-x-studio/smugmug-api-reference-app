# Technical Decisions

This document explains the core architectural choices for the SmugMug API Reference Application, a single-page application built with React and TypeScript.

The goal is to provide a reference for developers to understand the system's design principles.

## Core Architectural Patterns

### 1. React with TypeScript Strict Mode

**Decision:** The application is built using React and TypeScript with `strict` mode enabled in `tsconfig.json`.

**Principle:** This combination enforces type safety at compile time, which is crucial for building maintainable and scalable applications. Strict mode eliminates entire classes of runtime errors by ensuring, for example, that variables cannot be implicitly `any` and that `null` and `undefined` are handled explicitly.

**Trade-offs:** The primary trade-off is a steeper initial learning curve and increased verbosity, as all types must be clearly defined. However, this initial investment pays off significantly in larger projects by improving code quality and making refactoring safer.

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    /* ... */
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    /* ... */
  }
}
```

### 2. Service Layer Abstraction

**Decision:** Application logic is separated into a dedicated service layer, distinct from the UI components.

**Principle:** This follows the principle of **separation of concerns**. Services (e.g., `smugmugService.ts`, `geminiService.ts`) encapsulate all interactions with external APIs. This decouples the UI from the implementation details of data fetching, caching, and business logic.

**Benefits:**
-   **Testability:** Services can be tested in isolation, without needing to render UI components.
-   **Reusability:** The same service can be used by multiple components.
-   **Maintainability:** API logic is centralized, making it easier to update or replace.

```typescript
// services/smugmugService.ts
// This service encapsulates all logic for interacting with the SmugMug API.
class SmugMugAuthManager {
  // ... methods for auth, data fetching, etc.
}

// components/LoginScreen.tsx
// The component consumes the service, but has no knowledge of the underlying API calls.
import { smugmugService } from '../services/smugmugService';

const LoginScreen = () => {
  const handleLogin = async () => {
    const result = await smugmugService.initiateAuth();
    // ...
  };
};
```

### 3. Centralized State Management

**Decision:** Global application state is managed using a combination of React Context and the `useReducer` hook.

**Principle:** For applications with a moderate level of state complexity, this built-in React pattern provides a predictable and centralized way to manage state without adding external dependencies like Redux or MobX.

**Trade-offs:**
-   **Pros:** No third-party libraries needed. It's well-integrated into the React ecosystem.
-   **Cons:** For very high-frequency updates or extremely complex state, performance can be a concern, as any update to the context will cause all consuming components to re-render. In such cases, a library like Redux with more optimized subscription models might be a better fit.

```typescript
// Example of a state provider
interface AppState { /* ... */ }

const AppStateContext = createContext<AppState | undefined>(undefined);

export const AppStateProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppStateContext.Provider value={state}>
      {children}
    </AppStateContext.Provider>
  );
};
```

### 4. Component Organization

**Decision:** Components are organized by feature in the `src/components/` directory and are expected to adhere to the single-responsibility principle.

**Principle:** Each component should do one thing well. This makes components easier to understand, test, and reuse. We avoid "god components" that manage excessive state and logic for multiple unrelated features.

**Rules:**
-   **Directory Structure:** Components are grouped by feature (e.g., `AlbumList.tsx`, `ImageGrid.tsx`).
-   **Single Responsibility:** A component should be responsible for one piece of functionality.
-   **Composition:** Complex UI is built by composing smaller, simpler components.

### 5. Systematic Error Handling

**Decision:** The application uses a combination of a `Result` type for function-level errors and React Error Boundaries for component-level exceptions.

**Principle:** This two-level strategy provides comprehensive error handling. The `Result` type makes expected errors (e.g., a failed network request) an explicit part of the function's return signature, forcing the developer to handle them. Error Boundaries act as a safety net for unexpected exceptions, preventing the entire application from crashing.

```typescript
// 1. Result type for predictable errors
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

async function searchPhotos(query: string): Promise<Result<Photo[]>> {
  try {
    const photos = await searchService.search(query);
    return { success: true, data: photos };
  } catch (error) {
    return { success: false, error: new Error('Search failed') };
  }
}

// 2. Error Boundary for unexpected exceptions
class GlobalErrorBoundary extends React.Component {
  componentDidCatch(error: Error) {
    // Log the error and display a fallback UI.
  }

  render() {
    // ...
  }
}
```
