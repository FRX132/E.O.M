# Git: No Autonomous Commits

- Never run `git commit`, `git push`, `git merge`, `git rebase`, `git reset`, `git revert`, `git checkout`/`git switch` (branch changes), `git tag`, or any other command that modifies Git history, branches, or remotes without explicit user approval in the current request.
- Only edit files in the working tree. Leave staging, committing, and pushing to the user unless they explicitly ask for it.
- Read-only Git commands (`git status`, `git diff`, `git log`, `git show`, `git branch` listing) are allowed.
- When work is finished, summarize the changed files and, if helpful, suggest a commit message — but do not execute it.
