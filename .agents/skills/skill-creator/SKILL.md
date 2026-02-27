---
name: skill-creator
description: create or update reusable agent skills with concise instructions and progressive disclosure.
---

# Skill Creator

Use this workflow when adding or updating skills in .agents/skills.

## Skill Requirements

1. Every skill must contain `SKILL.md` with frontmatter:
   - `name`
   - `description`
2. Keep instructions concise and procedural.
3. Add examples only when they improve execution quality.
4. Prefer reusable scripts/assets over repeating long instructions.

## Process

1. Define what the skill should do and when it should trigger.
2. Choose a short kebab-case folder name.
3. Create .agents/skills/<skill-name>/SKILL.md.
4. Add:
   - Goal
   - Inputs
   - Execution steps
   - Verification steps
   - Output format
5. Test by using the skill in one real task and refine.

## Guidelines

- Keep `SKILL.md` under 500 lines.
- Avoid unnecessary extra docs (README, changelog) inside skill folders.
- If the skill supports multiple variants, keep core workflow in `SKILL.md` and move variant details to separate reference files.
