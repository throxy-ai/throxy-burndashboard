---
name: fix-bug
description: investigate symptoms, confirm root cause, and apply minimal bug fixes.
---

# Fix Bug

## Process

1. Capture the symptom: observed vs expected behavior.
2. Create 3 to 5 hypotheses before deep code reading.
3. Test hypotheses in rank order and confirm root cause with evidence.
4. Implement the smallest reliable fix.
5. Search for the same bug pattern in nearby code.
6. Run `bun run c` and report verification steps.

## Rules

- Do not skip hypothesis generation.
- Avoid refactors unless they are required for the fix.
