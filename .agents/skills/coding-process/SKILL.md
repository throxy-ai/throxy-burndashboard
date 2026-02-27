---
name: coding-process
description: canonical implementation workflow for planning, coding, verification, and review.
---

# Coding Process

Use this skill first for coding tasks.

## Core Workflow

1. Identify the task type (feature, bug, refactor, review).
2. Read the matching skill in .agents/skills/.
3. Read relevant .agents/common-mistakes/ files.
4. Implement the smallest change that solves the task.
5. Run verification commands (default: `bun run c`).
6. Update common mistakes when feedback reveals a recurring issue.

## Skills

- `plan-small`: self-contained feature or change.
- `fix-bug`: root-cause-first debugging workflow.
- `review-code`: correctness and risk-focused review.
- `skill-creator`: create new skills safely and consistently.
