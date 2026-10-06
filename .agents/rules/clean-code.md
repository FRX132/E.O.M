# Clean Code & Readability

Readable, well-structured code has priority over clever or compact code.

## Structure
- One responsibility per file, component, and function. Split components that grow beyond ~300 lines or mix unrelated concerns.
- Keep business logic out of JSX: move data transformation, calculations, and API calls into `src/services/`, custom hooks, or helper functions.
- Don't duplicate logic. If the same mapping/config appears twice, extract it into a shared constant or function.
- Respect the existing folder structure (`src/components/<Area>/`, `src/services/`, `src/store`). Don't create new top-level patterns without asking.

## Naming
- Use descriptive English names for variables, functions, components, and files (`calculatePerformanceScore`, not `calcLz` or `x`).
- Booleans start with `is`, `has`, `should`, `can`. Event handlers start with `handle` (internal) or `on` (props).
- Components in `PascalCase`, functions/variables in `camelCase`, constants in `UPPER_SNAKE_CASE`.

## Functions
- Keep functions short and focused. Prefer early returns over deep nesting.
- Avoid magic numbers and strings — name them as constants.
- Keep side effects explicit and contained (`useEffect`, services), never during render.

## React
- Keep node/state data serializable; no functions or refs stored in persisted state.
- Don't access `ref.current` during render.
- Prefer existing hooks (`useNavigate`, `useReactFlow`, store selectors) over passing callbacks through data.
- Extract large inline style objects into constants or CSS when they are reused or clutter the JSX.

## Comments & Language
- All code, comments, UI strings, and logs are in English.
- Comments explain *why*, not *what*. Remove dead code and commented-out blocks instead of leaving them.
- Preserve existing meaningful comments and docstrings unrelated to the change.
- All `<img>` elements need a descriptive `alt` text.

## Changes
- Make minimal, focused changes; don't reformat or refactor unrelated code unprompted.
- If a larger refactor would improve clarity, propose it first instead of doing it silently.
- Verify with `npm run build` after non-trivial changes.
