# Code Quality Standards

This document outlines the code quality standards, static analysis configuration, and testing strategy for this project. The goal is to provide a clear, enforceable specification for all code contributed to the repository.

## 1. TypeScript Configuration

The project enforces TypeScript's `strict` mode to catch common errors at compile time and ensure type safety.

**Reasoning**: Strict mode eliminates entire classes of runtime bugs by enforcing explicit types, null checks, and more. This leads to more robust and self-documenting code.

**`tsconfig.json`**: Key settings include:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitReturns": true,
    "noUncheckedIndexedAccess": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

## 2. Linting Configuration

We use ESLint to enforce code style and prevent common programming errors. The configuration is designed to work with TypeScript and React.

**Reasoning**: Automated linting ensures consistency across the codebase, regardless of who wrote the code. It also helps enforce best practices, such as the rules for React hooks.

**`.eslintrc.json`**: Key rules include:

```json
{
  "extends": [
    "@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "error",
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  }
}
```

## 3. Formatting

All code is formatted automatically using Prettier. This ensures a consistent visual style and eliminates debates over formatting.

**Reasoning**: An auto-formatter saves time in code reviews and ensures that the codebase has a single, uniform style.

**`.prettierrc`**: A standard configuration is used.

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

## 4. Testing Strategy

Our testing strategy focuses on **behavior-driven testing** of components and business logic. We use **Vitest** as the test runner and **React Testing Library** for rendering components.

-   **Test Types**: Primarily **Unit Tests** for individual functions and components, and **Integration Tests** for workflows involving multiple components.
-   **Location**: Tests are located in `__tests__` directories alongside the code they are testing.

**Standard Unit Test Example**: The following example demonstrates testing component behavior, not its internal implementation.

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { PhotoGrid } from './PhotoGrid';

describe('PhotoGrid', () => {
  const mockPhotos = [
    { id: '1', title: 'Sunset' },
    { id: '2', title: 'Mountains' },
  ];

  it('should display all photos', () => {
    render(<PhotoGrid photos={mockPhotos} />);
    expect(screen.getAllByRole('img')).toHaveLength(2);
  });

  it('should call onSelectionChange when a photo is selected in selection mode', () => {
    const onSelectionChange = vi.fn();
    render(
      <PhotoGrid
        photos={mockPhotos}
        selectionMode={true}
        onSelectionChange={onSelectionChange}
      />
    );

    // Simulate a user clicking the checkbox for the first photo
    fireEvent.click(screen.getAllByRole('checkbox')[0]);

    // Assert that the callback was called with the correct photo ID
    expect(onSelectionChange).toHaveBeenCalledWith(['1']);
  });

  it('should display a message when there are no photos', () => {
    render(<PhotoGrid photos={[]} />);
    expect(screen.getByText(/no photos/i)).toBeInTheDocument();
  });
});
```

## 5. Performance Standards

To ensure a responsive user experience, the following performance optimization patterns are enforced where applicable.

-   **`React.memo`**: Components that are expensive to render and are rendered with the same props frequently must be wrapped in `React.memo`.

    ```typescript
    const MemoizedPhotoItem = React.memo(PhotoItem);
    ```

-   **`useMemo`**: Expensive calculations (e.g., filtering or transforming large arrays) must be memoized with `useMemo` to avoid re-computation on every render.

    ```typescript
    const filteredPhotos = useMemo(() =>
      photos.filter(photo => matchesFilters(photo, filters)),
      [photos, filters]
    );
    ```

-   **`useCallback`**: Event handler functions passed as props to child components must be wrapped in `useCallback` to prevent the child components from re-rendering unnecessarily.

    ```typescript
    const handlePhotoSelect = useCallback((photoId: string) => {
      onItemSelect(photoId);
    }, [onItemSelect]);
    ```
