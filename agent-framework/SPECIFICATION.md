# Subagent Technical Specification

## 1. Overview

This document provides the technical specification for the SmugMug Photo Discovery Subagent. The subagent is a static analysis tool responsible for enforcing the project's specific architectural and code quality standards. It is used as both a developer utility and an automated gate in the CI/CD pipeline.

## 2. Enforced Rules

The following rules are enforced by the subagent. Each rule is configurable in `subagent-config.json`.

### 2.1. Component Complexity

-   **Rule**: `component_limits.max_lines`
-   **Description**: Restricts the maximum number of lines in a single component file to prevent overly complex "god components."
-   **Default Threshold**: 200 lines.
-   **Rationale**: Promotes the single-responsibility principle and encourages developers to create smaller, more reusable components.

    ```typescript
    // ❌ FAIL: A component file with more than 200 lines.
    export const MegaComponent = () => { /* 300 lines of code */ };

    // ✅ PASS: A component file with less than 200 lines.
    export const FocusedComponent = () => { /* 150 lines of code */ };
    ```

### 2.2. Hook Complexity

-   **Rule**: `hook_constraints.max_useeffect_dependencies`
-   **Description**: Limits the number of dependencies in a `useEffect` hook's dependency array.
-   **Default Threshold**: 3 dependencies.
-   **Rationale**: A large number of dependencies is often a sign that the effect is doing too much. This rule encourages developers to separate concerns into multiple, more focused `useEffect` hooks or custom hooks.

    ```typescript
    // ❌ FAIL: useEffect with more than 3 dependencies.
    useEffect(() => {
      // ...
    }, [var1, var2, var3, var4]);

    // ✅ PASS: useEffect with 3 or fewer dependencies.
    useEffect(() => {
      // ...
    }, [var1, var2]);
    ```

### 2.3. Side Effect Cleanup

-   **Rule**: `hook_constraints.require_cleanup`
-   **Description**: Enforces that any `useEffect` hook that sets up a subscription, timer, or event listener must return a cleanup function.
-   **Default Threshold**: `true`.
-   **Rationale**: Prevents memory leaks and unexpected behavior from side effects that persist after a component has unmounted.

    ```typescript
    // ❌ FAIL: useEffect sets up a listener without returning a cleanup function.
    useEffect(() => {
      window.addEventListener('resize', handleResize);
    }, []);

    // ✅ PASS: The effect returns a function to remove the event listener.
    useEffect(() => {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);
    ```

### 2.4. Type Safety

-   **Rule**: `type_safety.no_any_types`
-   **Description**: Disallows the use of the `any` type.
-   **Default Threshold**: `true`.
-   **Rationale**: The `any` type disables TypeScript's type checking, defeating its purpose. This rule forces developers to use more specific types or `unknown`.

    ```typescript
    // ❌ FAIL: Function parameter uses the `any` type.
    function process(data: any) { /* ... */ }

    // ✅ PASS: Function uses a specific type or `unknown`.
    function process(data: MyType) { /* ... */ }
    function process(data: unknown) { /* ... */ }
    ```

## 3. Validation Output

When run, the subagent produces a JSON object detailing the results of the validation.

**Schema**:

```json
{
  "isValid": "boolean",
  "violations": [
    {
      "type": "string (e.g., 'god_component')",
      "message": "string",
      "file": "string",
      "line": "number"
    }
  ],
  "metrics": {
    "filesScanned": "number",
    "totalViolations": "number"
  }
}
```

## 4. Configuration

The subagent is configured via the `subagent-config.json` file. This file defines which rules are active and their specific thresholds.

**Example `subagent-config.json`**:

```json
{
  "critical_architecture_rules": {
    "component_limits": {
      "max_lines": 200,
      "max_props": 5
    },
    "hook_constraints": {
      "max_useeffect_dependencies": 3,
      "require_cleanup": true
    },
    "type_safety": {
      "no_any_types": true
    }
  }
}
```

## 5. CI/CD Integration

To automate enforcement, the subagent should be integrated into the CI/CD pipeline.

### GitHub Actions Example

The following job can be added to a GitHub Actions workflow to run the subagent on every push and pull request.

```yaml
# .github/workflows/subagent-validation.yml
name: Subagent Architecture Validation

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - name: Install dependencies
        run: npm install
      - name: Run Subagent Validation
        run: node activate-subagent.cjs validate-project
```
