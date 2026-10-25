## Project Overview

**kg-releases** is a Preact web app that tracks GitHub release notifications for starred
repositories. Users log in with GitHub via Firebase Auth, and a separate backend (private repo)
fetches/caches releases and sends email notifications.

Live at: https://releases.netlify.app/

## Commands

```bash
pnpm dev              # Vite dev server on port 4100, auto-opens browser
pnpm build            # Production build → dist/ (also writes the bundle report dist/stats.html)
pnpm lint             # Oxlint + oxfmt (via dev-lib)
pnpm test             # Vitest unit tests (via dev-lib)
pnpm bt               # Build test: typecheck + vite build
pnpm check            # Check everything
```

Type checking separately:

```bash
dev-lib typecheck     # TypeScript check (tsc, covers .ts and .tsx)
```

Always run `pnpm check` before handing over the work.

## Code Style & Standards

- **Performance:** All code must be performance-optimized by default.
- **Consistency:** Strictly adhere to the existing codebase patterns.
- **Linting:** In-place rule overrides are permitted if necessary for working code; provide a brief
  justification for the override.

**Function ordering:** Follow top-down "newspaper style" - callers above callees. If function A
calls function B, A must appear above B in the file. Entry points and high-level logic at the top,
helper/implementation functions below. Read the file top-to-bottom like a newspaper: headline first,
then details.

```ts
// correct: caller above callee
function foo() {
  bar()
}
function bar() {}

// wrong: callee above caller
function bar() {}
function foo() {
  bar()
}
```

When changing code - DON'T remove pre-existing code comments, preserve them instead.

## Tech Stack

- **Preact 11** with TSX function components and hooks (core `preact`, not `preact/compat`)
- **@preact/signals** for state, **preact-iso** for routing
- **Vite** (built-in oxc JSX transform, `@prefresh/vite` HMR in dev), **TypeScript**, plain **CSS**
  (native nesting, no preprocessor)
- **pnpm** package manager
- **Firebase** for GitHub OAuth, **Sentry** (`@sentry/browser`) for error tracking
- **@naturalcycles/dev-lib** for shared lint/test/typecheck tooling
- Imports: Node subpath imports only. `#src/x.js` for `.ts` files, `#src/x.jsx` for `.tsx` files,
  assets with their real extension (`#src/css/global.css`). Never introduce `@/` aliases.

## Architecture

### Service Layer (`src/srv/`)

- `firebase.service.ts` — Firebase auth initialization and GitHub OAuth login
- `releases.service.ts` — API calls to kg-backend3 for release data
- `api.service.ts` — HTTP client with automatic auth headers
- `model.ts` — TypeScript interfaces (Release, UserSettings, etc.)

### State (`src/store.ts`)

Module-level `@preact/signals`: one `store` object with a signal per field, derived values as
`computed` (`releasesByDay`, `releasesLastDay`, `showScanningResumed`, `releasesCount`) and actions
as exported functions (`addReleases`, `onBackendResponse`, ...). A module-level `effect` persists
`counter`, `releases`, `starredRepos`, `user` and `scanningResumedDismissedAt` to localStorage under
the `state` key. `appReady` gates the router until bootstrap has finished. Never mutate nested
objects, replace the signal value: `store.user.value = { ...store.user.value, idToken }`.

### Routing (`src/router.tsx`)

preact-iso `Router`; each route component wraps its page in a `Guard`: `guestOnlyGuard` (`/`,
redirects logged-in users to `/releases`) and `loggedInGuard` (`/releases`, `/settings`, redirect
guests to `/`). Guards read the user with `peek()`, so they run on navigation only (like the former
`beforeEnter` guards), not reactively. `AppRouter` renders nothing until `appReady` is true.
Navigation inside components: `const { route } = useLocation()`, then `route('/releases')`.

### Pages (`src/pages/`)

- `HomePage.tsx` (+ `HomePage.css`) — Login screen (guest-only)
- `ReleasesPage.tsx` — Main releases feed grouped by date. `releasesLoader.ts` holds the day-walking
  fetch logic, the grouping and the unstar dialog state as module-level signals, so the component
  only renders.
- `SettingsPage.tsx` — Email notification preferences, logout

### CSS (`src/css/global.css`)

Tokens as custom properties on `:root` (light only; a dark block can redefine them later), base,
header, buttons, rows (`<details>/<summary>`), dialog, notice, forms and `.md` release notes.
Page-only rules live in a `*.css` next to the page, imported from the page module.

### Bootstrap Flow (`src/main.tsx`)

Imports `global.css` → `initSentry()` → `render(<App />)` → initializes Firebase auth or loads
releases depending on login state → hides the loader → `appReady.value = true`.

### Patterns

- `@_Memo()` decorator for memoizing service initialization
- `withProgress()` sets ghost mode during async operations and handles errors
- In components, read `signal.value` to subscribe; for attributes always use `.value`
  (`disabled={store.ghostMode.value}`). Never create module-level signals inside components.
- Preact core, not compat: `class` (not `className`), `onInput` for text inputs (`onChange` only
  fires on blur), `useRef<T>(null)` needs the explicit `null`.

## Deployment

Netlify deploys from `dist/` on push. Config in `netlify.toml`. Build command: `pnpm build-netlify`.
