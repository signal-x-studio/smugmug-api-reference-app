# Prompting Strategies

This document provides a set of proven, actionable prompting techniques used to develop the SmugMug API Reference App. Effective prompting is the most critical skill for successful human-AI collaboration. The strategies outlined here are designed to be adapted by other developers building sophisticated, domain-specific applications.

Our success was rooted in treating prompts not as simple commands, but as detailed specifications for a junior developer who is talented but lacks context. This approach ensures the AI returns code that is specific, context-aware, and structurally correct.

---

### Core Principles of Effective Prompting

1.  **Be Specific & Unambiguous:** Vague prompts lead to generic, often useless, code. Your prompt should be a detailed set of instructions.
2.  **Provide Context:** The AI doesn't know your project's architecture. You must provide it with the necessary context, such as existing patterns, data structures, or style guides.
3.  **Define the Output Structure:** Never leave the output format to chance. Specify the exact function signature, component props, or JSON schema you expect.
4.  **Assign a Persona:** Telling the AI to act as an "expert" in a specific domain (e.g., "You are an expert photo archivist") primes the model to generate more relevant and higher-quality content.

### Proven Prompting Patterns

Here are the specific, reusable prompt patterns that were most effective in this project.

#### Pattern 1: The Vision-First Component Generator

This pattern is used to generate new React components that align with the project's architecture and styling.

*   **Goal:** Create a new, styled React component with correct props and behavior.
*   **Template:**
    > "Create a React functional component in TypeScript named `[ComponentName]`. It must be fully typed.
    > 
    > **Props:** It should accept the following props: `[propName: Type, ...]`. Refer to `types.ts` for existing types.
    > 
    > **Styling:** Use Tailwind CSS to achieve `[clear, descriptive layout, e.g., 'a responsive 3-column grid with a gap of 4']`.
    > 
    > **Behavior:** It should map over the `[propName]` array and for each item, render a `<[ChildComponent] />`, passing the item as a prop. 
    > 
    > **Edge Case:** If the `[propName]` array is empty, it should display a message: `'[Empty state message]'`.
    > 
    > **Style Guide:** Follow the existing code style found in the `AlbumList.tsx` component."

*   **Why it works:** This prompt provides the AI with a complete specification, including its name, data contract (props), visual design (Tailwind), logic, edge case handling, and a reference for its coding style.

#### Pattern 2: The AI Vision Analyst (Schema-Enforced)

This is the most important pattern for creating reliable AI features. It forces the AI to return predictable, structured data from an image.

*   **Goal:** Generate a structured JSON object from an image analysis.
*   **Template:**
    > "You are an `[Expert Persona, e.g., 'expert photo archivist']`. Analyze the attached image with the goal of `[specific goal, e.g., 'generating metadata for a photo library']`.
    > 
    > Your response **MUST** be a single JSON object that strictly conforms to the following JSON schema. Do not include any other text or explanations in your response.
    > 
    > **JSON Schema:**
    > ```json
    > [Your JSON schema here]
    > ```
    > 
    > **Content Guidelines:**
    > - The `title` should be short and descriptive.
    > - The `description` should be a 2-3 sentence narrative.
    > - The `keywords` array should contain 5-7 relevant terms, focusing on `[specific content to look for, e.g., 'main subjects, colors, and time of day']`."

*   **Why it works:** The combination of a persona, a strict JSON schema, and clear content guidelines constrains the model, turning its probabilistic output into a deterministic and reliable API call.

#### Pattern 3: The Architectural Discovery Method

This pattern is used when starting a new feature to get architectural suggestions.

*   **Goal:** Brainstorm implementation strategies for a new feature that fit the existing codebase.
*   **Template:**
    > "I need to implement a `[feature name, e.g., 'batch photo processing']` feature in my React/TypeScript application.
    > 
    > **Current Architecture:**
    > - State is managed centrally in `App.tsx`.
    > - API calls are handled in a `services/` directory.
    > - Components are functional and use hooks.
    > 
    > **Requirements:**
    > - The user needs to select multiple photos from the `ImageGrid`.
    > - A button should trigger the processing for all selected photos.
    > - The UI must show the status of each photo (pending, processing, complete, error).
    > 
    > **Question:** Propose a plan for implementing this. What new state variables would I need in `App.tsx`? What new components should I create? How should I manage the asynchronous processing of multiple API calls?"

*   **Why it works:** Instead of asking the AI to write the code, you ask it to *plan* the code. This is useful for complex features and allows you to validate the AI's proposed architecture before committing to an implementation.

### Anti-Patterns (What to Avoid)

*   **Vague Commands:** "Make a photo gallery." (Too generic).
*   **Assuming Context:** "Fix the bug in the modal." (Which modal? What bug?).
*   **No Format Definition:** "Describe this image." (You will get back unstructured text that is difficult to parse).
*   **Overloading the AI:** "Build me a complete SmugMug client with AI features." (Break down the problem into smaller, manageable tasks).

By adopting these structured prompting strategies, you can transform AI agents from simple code completers into powerful development partners.
