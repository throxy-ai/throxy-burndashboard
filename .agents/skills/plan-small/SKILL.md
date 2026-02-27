---
name: plan-small
description: plan and implement a small or medium change in one focused PR.
---

# Plan Small

Use for self-contained features, utilities, component additions, and config updates.

## Process

1. Clarify intent and constraints.
2. List files to change and why.
3. Call out edge cases and possible regressions.
4. Implement in small steps.
5. Run `bun run c` (or the narrowest relevant checks).
6. Summarize what changed and how to verify manually.

## Rules

- Do not mix unrelated cleanup into the same change.
- Keep behavior changes explicit and documented.
