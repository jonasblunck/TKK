## General guidelines
- Follow the coding style and conventions used in the existing codebase.
- Write clear, concise, and maintainable code.
- Always ask clarifying questions if any requirements or specifications are unclear.
- Don't start writing code until you have a complete understanding of the task at hand, and have confirmation from the user.

## Testing
- After making any code changes, always run the test suite: `node test/run-tests.js`
- Ensure all tests pass before considering a task complete.
- If a change breaks existing tests, fix the code or update the tests as appropriate. Always ask for confirmation before modifying existing tests.
- **When adding or modifying logic** (calculations, algorithms, data processing, etc.), add corresponding unit tests to cover the new/changed behavior.

## Repository layout
- Source code lives in the `src/` directory.
- Tests are located in the `test/` directory.
- The design and feature requirements are located in docs/design.md, which you must refer to when implementing features. You MUST also keep this document updated with any changes.
- Task breakdowns and progress tracking are in docs/tasks.md, organized by development phases. You must also keep this document updated as you identify and complete new tasks. 

