# AI-Assisted Development Workflow

This document describes the process and tools for AI-assisted development in this project. The goal is to provide a practical guide for team members to use AI tools effectively and consistently.

## 1. Tool Roles

Different AI tools are used for specific tasks to maximize efficiency. The primary tools and their roles are:

-   **GitHub Copilot (or similar IDE-based assistant)**
    -   **Task**: Real-time code completion, boilerplate generation, and writing small, well-defined functions.
    -   **Use Case**: Used continuously during coding to accelerate the implementation of familiar patterns.

-   **Advanced LLM (e.g., Claude, Gemini)**
    -   **Task**: More complex, conversational tasks like refactoring, architectural analysis, and documentation.
    -   **Use Cases**:
        -   **Refactoring**: Pasting a component and asking for it to be refactored according to project standards (e.g., "Refactor this component to use the `Result` type for error handling").
        -   **Analysis**: Asking the model to check for architectural violations or suggest performance improvements.
        -   **Documentation**: Generating documentation blocks for functions and components.

## 2. Workflow Integration

Our workflow is **human-led and AI-assisted**. The developer is always in control and responsible for the final code.

1.  **Define the Task**: The developer first defines the goal, whether it's creating a new component, refactoring a function, or fixing a bug.

2.  **Generate with AI**: The developer uses the appropriate AI tool to generate the initial code. This might be a real-time suggestion from Copilot or a larger block of code from a prompt to Gemini/Claude.

3.  **Review and Validate (Critical Step)**: The developer critically reviews the AI-generated code. This is not a passive step. See the validation process below.

4.  **Refine and Test**: The developer refactors, corrects, and refines the generated code to ensure it fully meets project standards. They then write or update tests to cover the new code.

5.  **Commit**: Once the developer fully understands and takes ownership of the code, it is committed to the repository.

## 3. Validation of AI-Generated Code

All AI-generated code must be treated as if it were written by a new team member. It must be rigorously validated against the following criteria before being accepted:

-   **[ ] Correctness**: Does the code actually work and solve the intended problem?
-   **[ ] Adherence to Standards**: Does the code comply with all standards defined in `CODE-QUALITY.md` (linting, formatting, TypeScript strictness)?
-   **[ ] Architectural Alignment**: Does the code follow the patterns outlined in `TECHNICAL-DECISIONS.md` (e.g., service layer abstraction, Result pattern)?
-   **[ ] Readability and Simplicity**: Is the code easy to understand? Or is it overly complex and in need of simplification?
-   **[ ] No Hallucinations**: Does the code use non-existent functions, incorrect APIs, or inappropriate libraries?
-   **[ ] Test Coverage**: Is the code accompanied by meaningful unit or integration tests?
-   **[ ] Developer Understanding**: The developer integrating the code must be able to explain how it works and why it is correct. **Do not commit code you do not understand.**

## 4. Prompting Strategies

Effective prompting is key to getting useful results from AI tools. For detailed guidance and templates, refer to the `prompting-strategies.md` document.
