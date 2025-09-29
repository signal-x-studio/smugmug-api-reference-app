# AI Prompting Strategies

This document provides a technical guide to the prompting patterns used for AI-assisted development in this project. The goal is to create a reference that helps developers write effective prompts to get consistent, high-quality results from AI assistants.

## 1. Component Generation

**Purpose**: To generate a new React component with the correct structure, types, and adherence to project standards.

**Template**:

```
Create a new React component named '<ComponentName>'.

**Tech Stack**: React with TypeScript.

**Functionality**: The component should [describe the component's purpose and functionality in detail. e.g., 'display a grid of photos', 'render a login form with email and password fields'].

**Props**: It should accept the following props:
- `propName`: [type] - [description]
- `propName`: [type] - [description]

**State**: It should manage the following internal state:
- `stateName`: [type] - [description]

**Project Standards to Follow**:
- Use functional components with React Hooks.
- All props and state must be strictly typed with TypeScript.
- Use the `Result` type for any operations that can fail.
- Event handlers should be wrapped in `useCallback`.
- Any expensive calculations should be wrapped in `useMemo`.

Generate the complete code for the `.tsx` file.
```

**Common Pitfalls**:
-   **Vague Functionality**: Not clearly describing what the component should do.
-   **Missing Types**: Failing to specify the types for props and state.
-   **No Context**: Not telling the AI about project-specific standards (like the `Result` type), leading to generic code.

## 2. Code Refactoring

**Purpose**: To refactor a piece of existing code to meet a specific standard or improve its structure.

**Template**:

```
Refactor the following React component to meet our project standards.

**Code to Refactor**:
```typescript
[Paste the original code here]
```

**Refactoring Instructions**:
1.  [Specific instruction 1, e.g., "Extract the data fetching logic into a custom hook named `useAsyncData`."]
2.  [Specific instruction 2, e.g., "Ensure all event handlers are wrapped in `useCallback`."]
3.  [Specific instruction 3, e.g., "Replace the manual error handling with our standard `Result` type."]

Return the complete, refactored code.
```

**Common Pitfalls**:
-   **No Clear Goal**: Simply asking to "improve" the code is too vague. Provide specific, actionable instructions.
-   **Too Many Instructions**: Trying to do too much at once can confuse the AI. Break down complex refactoring into smaller, sequential prompts.
-   **Pasting Too Much Code**: Provide only the relevant component or function, not the entire file.

## 3. Architecture Analysis

**Purpose**: To ask the AI to analyze a code snippet for potential violations of our established architectural patterns.

**Template**:

```
Analyze the following code snippet for violations of our project's architectural standards.

**Our Standards**:
- Components must have a single responsibility.
- Business logic should be in service classes, not in components.
- Asynchronous operations must use the `Result` type for error handling.
- All side effects in `useEffect` must have a cleanup function.

**Code to Analyze**:
```typescript
[Paste the code snippet here]
```

List any violations you find and suggest how to fix them.
```

**Common Pitfalls**:
-   **Assuming Knowledge**: The AI doesn't know your standards unless you provide them. Always list the specific rules you want it to check for.
-   **Lack of Focus**: Asking for a general "review" is less effective than asking it to check for specific types of issues.

## 4. Debugging

**Purpose**: To get help debugging an error by providing the AI with the error message and the relevant code.

**Template**:

```
I am getting an error in my React application. Help me debug it.

**Error Message**:
```
[Paste the full error message and stack trace here]
```

**Relevant Code**:
This is the component where the error occurs:
```typescript
[Paste the component code here]
```

**What I've Tried**:
- [Describe any steps you have already taken to debug the issue.]

Explain the likely cause of the error and suggest a fix.
```

**Common Pitfalls**:
-   **Incomplete Error Message**: Not providing the full stack trace makes it hard for the AI to pinpoint the source of the error.
-   **Not Enough Code**: Providing only a single line of code is often not enough context. Include the whole function or component.

## 5. Documentation Generation

**Purpose**: To generate standardized documentation (e.g., JSDoc) for a function or component.

**Template**:

```
Generate a JSDoc comment block for the following TypeScript function.

**Function**:
```typescript
[Paste the function or component code here]
```

**Instructions**:
- Describe the function's purpose.
- Document each parameter using `@param`.
- Document the return value using `@returns`.
- Provide a clear `@example` showing how to use it.
```

**Common Pitfalls**:
-   **No Instructions**: Simply asking for "docs" might result in a poor format. Specify the exact format you need (e.g., JSDoc).
-   **Complex Code**: If the code is very complex, the AI may struggle to understand its purpose. It's best to document well-structured, single-responsibility functions.
```
