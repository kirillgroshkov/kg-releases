## Project Overview

**kg-releases** is a Vue 3 web app that tracks GitHub release notifications for starred
repositories. Users log in with GitHub via Firebase Auth, and a separate backend (private repo)
fetches/caches releases and sends email notifications.

Live at: https://releases.netlify.app/

## Commands

```bash
pnpm dev              # Vite dev server on port 4100, auto-opens browser
pnpm build            # Production build → dist/
pnpm lint             # Oxlint + Prettier check (via dev-lib)
pnpm test             # Run tests (via dev-lib)
pnpm bt               # Build test: typecheck + vue-tsc + vite build
pnpm check            # Check everything
```

Type checking separately:

```bash
dev-lib typecheck     # TypeScript check
vue-tsc --noEmit      # Vue SFC type check
```

## Tech Stack

- **Vue 3** with `<script setup>` composition API, **Vuetify 3** (Material Design), **Pinia** state
  management, **Vue Router 4**
- **Vite** build tool, **TypeScript**, **SCSS**
- **pnpm** package manager
- **Firebase** for GitHub OAuth, **Sentry** for error tracking
- **@naturalcycles/dev-lib** for shared lint/test/typecheck tooling
- Path alias: `@/` → `src/`

## Architecture

### Service Layer (`src/srv/`)

- `firebase.service.ts` — Firebase auth initialization and GitHub OAuth login
- `releases.service.ts` — API calls to kg-backend3 for release data
- `api.service.ts` — HTTP client with automatic auth headers
- `analytics.service.ts` — Analytics tracking (Sentry, Hotjar)
- `model.ts` — TypeScript interfaces (Release, UserSettings, etc.)

### State (`src/store.ts`)

Pinia store holding user auth, releases, starred repos, and settings. Key state is persisted to
localStorage under the `state` key.

### Routing (`src/router.ts`)

Route guards: `loggedInGuard` (redirects guests to home), `guestOnlyGuard` (redirects logged-in
users to releases). All guards await `bootstrapDone` promise before resolving.

### Pages (`src/pages/`)

- `HomePage.vue` — Login screen (guest-only)
- `ReleasesPage.vue` — Main releases feed grouped by date
- `SettingsPage.vue` — Email notification preferences, logout

### Bootstrap Flow (`src/main.ts`)

Creates Vue app → installs plugins (Pinia, Router, Vuetify, Sentry) → mounts → initializes Firebase
auth or loads releases depending on login state → resolves `bootstrapDone`.

### Patterns

- `@_Memo()` decorator for memoizing service initialization
- `withProgress()` decorator sets ghost mode during async operations and handles errors

## Deployment

Netlify deploys from `dist/` on push. Config in `netlify.toml`. Build command: `pnpm build-netlify`.
