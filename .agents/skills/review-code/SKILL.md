---
name: review-code
description: deep code review workflow for bugs, regressions, and missing tests.
---

# Review Code

## Process

1. Understand what changed and why.
2. Perform a mechanical pass: correctness, security, performance.
3. Perform a design pass: naming, architecture, maintainability.
4. Check test coverage for changed behavior.
5. Summarize findings by severity with file and line references.

## Report Format

- MUST FIX: blockers and high-risk defects.
- SHOULD FIX: maintainability or performance issues.
- CONSIDER: optional improvements.

## Rules

- Prioritize concrete findings over style nits.
- Include reproduction context when possible.
