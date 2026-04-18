// ...existing code...
# Life Planner OS 🧠

A minimalist, Notion-inspired desktop app to gamify and organize your life. Built with React, Zustand and Electron — local-first, privacy-focused, and extensible.

## Highlights
- RPG-style radial Skill Tree (Health, Social, Career, Spirit, Mental)
- Dynamic Habit Tracker connected to Skill Tree
- Expense Tracker and Goal Planner
- Profile customization and local persistence (Zustand + LocalStorage)
- Dark-mode first, glassmorphism UI

## Tech Stack
- React, Vite
- Zustand (persist middleware)
- Electron (desktop wrapper)
- @xyflow/react + dagre for node graph layouts

## Quick start (developer)
1. Clone
```sh
git clone https://github.com/FRX132/E.O.M.git
cd E.O.M
```
2. Install
```sh
npm install
```
3. Dev (Vite + Electron)
```sh
npm run electron:dev
```

## Build & Release (recommended)
- Produce web build:
```sh
npm run build
```
- Package Electron app (example):
```sh
npm run package
# or: npm run dist
```
- Publish platform binaries via GitHub Releases (preferred) or use Git LFS for large assets.

## Git / Large files
- Do NOT commit `node_modules/` (huge, platform-specific). Keep it in `.gitignore`.
- Binary releases and large artifacts (>100 MB) should be uploaded to GitHub Releases or tracked with Git LFS.
- To move existing large files to LFS:
```sh
brew install git-lfs
git lfs install
git lfs track "release/**" "*.exe" "*.dmg" "*.app"
git add .gitattributes
git commit -m "Track large binaries with Git LFS"
# migrate history if needed:
git lfs migrate import --include="release/**,*.exe,*.dmg,*.app" --include-ref=refs/heads/main
git push origin main --force
```

## Project layout
- src/components/ — UI widgets (SkillTree, HabitTracker, ExpenseTracker, ...)
- src/store.js — Zustand store + persistence + factory reset
- src/App.jsx — Router and main app shell
- electron/ — Electron main & preload scripts

## Contributing
- Open an issue for feature requests or bugs.
- For history-rewrites (LFS / large-file removal) coordinate with all contributors — they will need to re-clone.

## Troubleshooting
- Push rejected with "file exceeds 100 MB" → use Git LFS or remove the file from history (BFG/git-filter-repo) and force-push.
- If builds differ between platforms, publish platform-specific release artifacts instead of checking them into git.

## License
MIT — see LICENSE.
// ...existing code...
```// filepath: /Users/_freakzy_/Desktop/Antigravity Agents/OS/README.md
// ...existing code...
# Life Planner OS 🧠

A minimalist, Notion-inspired desktop app to gamify and organize your life. Built with React, Zustand and Electron — local-first, privacy-focused, and extensible.

## Highlights
- RPG-style radial Skill Tree (Health, Social, Career, Spirit, Mental)
- Dynamic Habit Tracker connected to Skill Tree
- Expense Tracker and Goal Planner
- Profile customization and local persistence (Zustand + LocalStorage)
- Dark-mode first, glassmorphism UI

## Tech Stack
- React, Vite
- Zustand (persist middleware)
- Electron (desktop wrapper)
- @xyflow/react + dagre for node graph layouts

## Quick start (developer)
1. Clone
```sh
git clone https://github.com/FRX132/E.O.M.git
cd E.O.M
```
2. Install
```sh
npm install
```
3. Dev (Vite + Electron)
```sh
npm run electron:dev
```

## Build & Release (recommended)
- Produce web build:
```sh
npm run build
```
- Package Electron app (example):
```sh
npm run package
# or: npm run dist
```
- Publish platform binaries via GitHub Releases (preferred) or use Git LFS for large assets.

## Git / Large files
- Do NOT commit `node_modules/` (huge, platform-specific). Keep it in `.gitignore`.
- Binary releases and large artifacts (>100 MB) should be uploaded to GitHub Releases or tracked with Git LFS.
- To move existing large files to LFS:
```sh
brew install git-lfs
git lfs install
git lfs track "release/**" "*.exe" "*.dmg" "*.app"
git add .gitattributes
git commit -m "Track large binaries with Git LFS"
# migrate history if needed:
git lfs migrate import --include="release/**,*.exe,*.dmg,*.app" --include-ref=refs/heads/main
git push origin main --force
```

## Project layout
- src/components/ — UI widgets (SkillTree, HabitTracker, ExpenseTracker, ...)
- src/store.js — Zustand store + persistence + factory reset
- src/App.jsx — Router and main app shell
- electron/ — Electron main & preload scripts

## Contributing
- Open an issue for feature requests or bugs.
- For history-rewrites (LFS / large-file removal) coordinate with all contributors — they will need to re-clone.

## Troubleshooting
- Push rejected with "file exceeds 100 MB" → use Git LFS or remove the file from history (BFG/git-filter-repo) and force-push.
- If builds differ between platforms, publish platform-specific release artifacts instead of checking them into git.

## License
MIT — see LICENSE.
// ...existing code...