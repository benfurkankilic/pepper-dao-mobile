---
description: Auto-create PR with generated title and description
---

Check the current git branch and status. If there are uncommitted changes (staged or unstaged), first commit them using conventional commit format. Then push the current branch to remote, analyze all commits since the target branch (default: dev), generate a concise PR title and descriptive PR body, and create a pull request immediately without asking for confirmation.

Follow these rules:
1. **Pre-commit check**: If there are uncommitted changes:
   - Stage all changes including untracked files
   - Generate commit message using conventional commit format: `type(scope): description`
   - Commit types: feat, fix, refactor, style, docs, test, chore, perf
   - Keep commit message clear and under 72 characters
   - Commit immediately without asking for confirmation

2. **Branch handling**:
   - Get the current branch name
   - Push the current branch to remote (create upstream if needed)
   - Default target branch is `dev`
   - Allow user to specify a different target branch via: `--target <branch>` or `-t <branch>`

3. **PR creation**:
   - Analyze all commits between target branch and current branch
   - Generate PR title following conventional commit format: `type(scope): description`
   - Generate PR description that includes:
     - Summary of changes
     - List of key changes/features
     - Any breaking changes (if applicable)
     - Testing notes (if applicable)
   - Use GitHub CLI (`gh pr create`) to create the PR
   - Set target branch (default: dev, or user-specified)
   - Create PR immediately - do not ask for confirmation

4. **Error handling**:
   - If already on target branch, inform user and exit
   - If no commits to create PR from, inform user
   - If GitHub CLI is not available, inform user to install it
   - If branch push fails, inform user and exit

5. **PR format**:
   - Title: Conventional commit format, under 72 characters
   - Description: Clear, structured markdown with sections for changes, breaking changes, and testing

