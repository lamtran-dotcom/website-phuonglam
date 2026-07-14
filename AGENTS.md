# AGENTS.md

## Core Memory Rule

Before doing any task, always read `CONTEXT.md` completely.

Treat `CONTEXT.md` as the source of truth for:
- project goal
- current state
- fixed decisions
- coding rules
- important files
- open issues
- next task

Do not rely on previous chat memory unless it is written in `CONTEXT.md`.

Every task/build must follow this loop:

1. Read `CONTEXT.md`.
2. Do only the current user task.
3. Inspect only directly relevant files.
4. Make the smallest safe change.
5. Run relevant checks/tests if available.
6. Summarize what changed.
7. Update `CONTEXT.md` after finishing.

## Work Scope Rules

- Do only the current user task.
- Do not refactor unrelated code.
- Do not rename files, change architecture, or redesign flows unless explicitly requested.
- Inspect only files directly relevant to the current task.
- If broader inspection is necessary, explain why before doing it.
- Prefer small, safe, reviewable changes.
- Do not create unnecessary source code unless the project stack is clear.
- If the stack is unclear, only update documentation and memory files.

## CodeGraph Rule

If `.codegraph/` exists, use CodeGraph first for codebase exploration before reading files manually.

Use CodeGraph to:
- find relevant files, symbols, and flows
- inspect callers and callees
- estimate the impact radius before editing
- avoid broad grep/read exploration unless CodeGraph is insufficient

Do not treat CodeGraph as project memory.
CodeGraph explains current code structure; `CONTEXT.md` explains project goal, decisions, current state, and next task.

## Documentation Update Rules

After every completed task:

- Update `CONTEXT.md` briefly.
- If a decision affects future development, update `docs/DECISIONS.md`.
- If architecture changes, update `docs/ARCHITECTURE.md`.
- If setup steps change, update `docs/SETUP.md`.
- If a task is completed, update `docs/CHANGELOG.md`.
- If new work is discovered, update `docs/TASKS.md`.

## Context Update Format

When updating `CONTEXT.md`, save only useful current memory:

- What was done
- Files changed
- New decisions
- Bugs or issues found
- Remaining work
- Suggested next task

Keep `CONTEXT.md` short and useful.
Do not turn it into a long diary.
If it gets too long, move older details to `docs/CHANGELOG.md` or `docs/DECISIONS.md`.

## Coding Style

- Prefer simple, readable code.
- Avoid over-engineering.
- Keep functions small.
- Add comments only when they clarify non-obvious logic.
- Do not introduce new dependencies unless necessary.
- Do not change secrets, API keys, environment files, or production configs unless explicitly requested.

## Safety

- Before risky changes, explain the risk.
- Do not delete large sections of code without a clear reason.
- Do not silently change business logic.
- Do not modify unrelated files.
