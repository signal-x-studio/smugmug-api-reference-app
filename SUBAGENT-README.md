# Subagent for SmugMug Project Architecture

This subagent is a command-line tool and library used to enforce project-specific architectural standards for the SmugMug API Reference Application. It is designed to be used by developers and CI/CD pipelines to ensure code quality and consistency.

## Core Functionality

The subagent validates code against a configurable set of rules. Its primary function is to act as an automated architecture reviewer.

Key enforced standards include:

-   **Component Complexity**: Ensures components do not exceed a defined line count (e.g., 200 lines).
-   **Hook Complexity**: Limits the number of dependencies in `useEffect` hooks to encourage separation of concerns.
-   **Type Safety**: Disallows the use of `any` types.
-   **Memory Safety**: Requires that `useEffect` hooks with side effects have a proper cleanup function.
-   **Performance Patterns**: Checks for the use of `useMemo` and `useCallback` for expensive operations.

## Quick Start

### Command-Line Usage

```bash
# Validate the entire project
node activate-subagent.cjs validate-project

# Test the subagent against sample files
node activate-subagent.cjs test

# View the current configuration
node activate-subagent.cjs config
```

### Usage with AI Assistants

You can invoke the subagent within a prompt to an AI coding assistant to ensure its output conforms to project standards.

```
@SmugMugPhotoDiscoverySubagent Please validate the following component against our project's architectural standards:

[...paste code here...]
```

## Configuration

The subagent's rules are defined in `subagent-config.json`. This file allows for the configuration of thresholds such as line limits and dependency counts.

```json
{
  "critical_architecture_rules": {
    "component_limits": {
      "max_lines": 200
    },
    "hook_constraints": {
      "max_useeffect_dependencies": 3
    }
  }
}
```

For a detailed breakdown of all rules and configuration options, see the **[Subagent Technical Specification](./SUBAGENT.md)**.

## CI/CD Integration

The subagent can be used as a pre-commit hook or as a step in a GitHub Actions workflow to block code that does not meet the defined standards.

**Pre-commit Hook Example (`.git/hooks/pre-commit`)**:

```bash
#!/bin/sh
node activate-subagent.cjs validate-project
if [ $? -ne 0 ]; then
  echo "Subagent validation failed. Commit blocked."
  exit 1
fi
```
