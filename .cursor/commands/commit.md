---
description: Auto-commit changes with generated message
---

Check the current git branch and status, analyze all staged and unstaged changes, generate a concise and descriptive commit message following conventional commit format, stage all changes, and commit immediately without asking for confirmation.

Follow these rules:
1. Use conventional commit format: `type(scope): description`
2. Types: feat, fix, refactor, style, docs, test, chore, perf
3. Keep the message clear and under 72 characters for the subject
4. Stage all changes including untracked files
5. Commit immediately - do not ask for confirmation
6. If there are no changes to commit, inform the user

