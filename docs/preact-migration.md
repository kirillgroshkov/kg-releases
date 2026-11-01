# Preact migration plan

Rewrite the kg-releases frontend from Vue 3 + Vuetify + Pinia + SCSS to **Preact 11 + Signals +
preact-iso + plain CSS**, keeping Vite, Firebase Auth, Sentry, `@naturalcycles/js-lib` and the
backend API exactly as they are.

This document is the single source of truth for the rewrite. It was written on 2026-10-25 after
reading every source file and running build spikes (see "Verified facts"). Everything under
"Decisions" is decided; do not re-litigate it. Background research (why Preact, bundle analysis,
alternatives) lives in the stack review artifact: https://claude.ai/artifact/5asbgFTt8mBVEzPcVe7K3v

How to execute: work through "Work order" top to bottom, on a branch, and tick the checkpoints.

## 1. Goal and non-goals

Goal: same product, same backend contract, same routes (`/`, `/releases`, `/settings`), same
persisted localStorage shape, far less framework and far less CSS. Expected result: about 100 KB
gzipped JS instead of 212 KB, about 3 KB CSS instead of 15 KB, ~2,400 lines of source instead of
~2,400 lines plus Vuetify, and one build tool (Vite) with no SFC compiler, no Sass, no vue-tsc.

Non-goals: no SSR/SSG, no new features, no backend changes, no dark mode, no new analytics, no
Cloudflare move (separate project).

## 2. Decisions

| Area            | Decision                                                                                                                                                                                                                                | Why                                                                                                                                                           |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| UI framework    | `preact` 11.0.2, TSX, function components + hooks                                                                                                                                                                                       | 4 KB runtime, React-shaped code that tooling and LLMs handle best. Spike bundle: Preact + Signals + preact-iso = 11.4 KB gz.                                  |
| State           | `@preact/signals` 2.11.3, module-level signals in `src/store.ts`, actions as plain exported functions                                                                                                                                   | Replaces Pinia 1:1 (state, getters as `computed`, actions as functions, `$subscribe` as `effect`). No provider, no hooks needed outside components.           |
| Router          | `preact-iso` 2.12.2 (`LocationProvider`, `Router`, `Route`, `useLocation`, `ErrorBoundary`)                                                                                                                                             | Official, 1.5 KB, intercepts `<a href>` clicks so nav links stay plain anchors.                                                                               |
| JSX transform   | Vite's built-in oxc transform driven by tsconfig `jsx: react-jsx` + `jsxImportSource: preact`. **No `@preact/preset-vite`**, no Babel.                                                                                                  | Verified: output identical with and without the preset. The preset only adds Babel and prerender tooling we do not need.                                      |
| HMR             | `@prefresh/vite` ^4 (rolldown-based, Babel-free)                                                                                                                                                                                        | Verified working on Vite 8.3.5 with no Babel installed. Dev-only.                                                                                             |
| Sentry          | Keep, switch `@sentry/vue` to `@sentry/browser` ^11, same DSN and options minus `app`/`attachProps`; add preact-iso `ErrorBoundary` with `onError: errorDialog`                                                                         | Measured 28.6 KB gz with the existing `define` flags (was 52.8 KB for the Vue SDK). Uncaught errors and unhandled rejections are captured by default.         |
| Firebase        | Unchanged (`firebase` ^13, same lazy `import('firebase/auth')`)                                                                                                                                                                         | Framework-independent already.                                                                                                                                |
| Services        | `api.service.ts`, `firebase.service.ts`, `releases.service.ts`, `decorators.ts`, `filters.ts`, `model.ts`, `env.ts` keep their files, classes and `@_Memo()` decorators; only `useStore()` call sites and one Sentry type import change | They are framework-independent; rewriting them adds risk without benefit. `experimentalDecorators` stays on via dev-lib's tsconfig and works in Vite 8 today. |
| Analytics       | Delete `analytics.service.ts`, the `mp` stub, the `distinctId` header and the `gtag`/`dataLayer` globals                                                                                                                                | It has been a no-op stub for years; `get_distinct_id()` returned `undefined`, so the header was never sent.                                                   |
| Dead pages      | Delete `ProjectPage.vue`, `ProjectsPage.vue` (routes have been commented out). Keep the three unused `releasesService` repo methods (one-liners that document backend endpoints).                                                       | Dead UI code; the `/projects/*` redirect line in `_redirects` is harmless and stays.                                                                          |
| Bootstrap gate  | `bootstrapDone` deferred promise replaced by an `appReady` signal; `<Router>` renders only when it is true                                                                                                                              | Same effect as `router.beforeEach(await bootstrapDone)` with no router hook API.                                                                              |
| Code splitting  | None; pages imported statically                                                                                                                                                                                                         | Whole app code is ~9 KB gz; a lazy chunk costs a round trip per navigation for nothing.                                                                       |
| Look            | "Terminal-lite": flat white surfaces, 48 px header with a 1 px bottom border (no fill), accent `#448aff` for links, active nav item and the primary button, 1 px-border buttons, hairline row separators, 6 px radius                   | Chosen by Kirill. Most of today's CSS was Material elevation/ripple/density machinery.                                                                        |
| Typography      | Body stays the current system sans stack at 14 px. Monospace (`ui-monospace` stack, replacing `'Courier New'`) only where it already is today: version tags, the stats `<pre>`, `code` in release notes, the home footer line           | Chosen by Kirill: keep the current feel, do not overuse mono.                                                                                                 |
| Color scheme    | Light only; colors defined as CSS custom properties on `:root` so dark can be added later                                                                                                                                               | Chosen by Kirill.                                                                                                                                             |
| Expand/collapse | Native `<details>/<summary>` for release rows and groups; chevron is one SVG rotated by CSS when `[open]`                                                                                                                               | Zero state, zero JS, keyboard accessible. Behaviour change: clicking the expanded body no longer collapses the row (only the header does). Acceptable.        |
| Unstar dialog   | Native `<dialog>` + `showModal()`; backdrop click and Esc close it; two-step "needs permission" state kept as a signal                                                                                                                  | Replaces `v-dialog`/`v-card`.                                                                                                                                 |
| Hover styling   | `@media (hover: hover)` replaces the `body.touch/no-touch` class and the SCSS `$active` variable                                                                                                                                        | Same intent, no JS.                                                                                                                                           |
| Icons           | Keep `@mdi/js` paths (only `mdiChevronDown` remains) through a 6-line `<Icon path>` component                                                                                                                                           | Tree-shaken SVG paths, no icon font.                                                                                                                          |
| CSS files       | `src/css/global.css` (tokens, base, header, buttons, rows, details, dialog, notice, forms, `.md`) plus one `*.css` next to each page for page-only rules, imported from the page module. Native nesting allowed.                        | Mirrors SFC `<style>` co-location. Vite 8's Lightning CSS flattens nesting for the baseline target (verified) and oxfmt formats `.css` (verified).            |
| Imports         | Keep Node subpath imports: `#src/x.js` for `.ts`, add `#src/x.jsx` for `.tsx`                                                                                                                                                           | Verified in tsc and Vite build. Never introduce `@/` aliases.                                                                                                 |
| Lint            | Replace the oxlint `vue` plugin with `react`; drop all `vue/*` rules                                                                                                                                                                    | oxlint ships `react/rules-of-hooks`, `react/exhaustive-deps`, `react/jsx-key`.                                                                                |
| Tests           | Add unit tests for the pure logic: store reducers/derivations and release grouping                                                                                                                                                      | First tests in the repo; cheap because the logic becomes plain functions.                                                                                     |
| Service worker  | Replace `public/sw.js` (2018 Workbox from a CDN, caches paths that no longer exist) with a 6-line self-unregistering worker                                                                                                             | Old clients may still have it registered; this clears it on their next visit.                                                                                 |
| Delivery        | Branch `preact`, conventional commits per phase, one PR with the Netlify deploy preview as QA environment                                                                                                                               | Master and production stay untouched until QA passes.                                                                                                         |

## 3. Repo rules that still apply

- Run `pnpm check` before handing over. It must be green at every checkpoint below.
- Newspaper ordering inside every file: callers above callees, entry points first.
- Do not remove pre-existing code comments; move them with the code they describe (including the
  commented-out debug blocks in `main.ts` and the Vue-era comments in `filters.ts`).
- Imports: `#src/...` subpath imports only. `.ts` files are imported as `.js`, `.tsx` as `.jsx`,
  assets with their real extension.
- Commit messages follow conventional commits (husky runs commitlint and lint-staged).
- pnpm has `minimumReleaseAge` configured; if a pinned version below is too fresh, take the newest
  version pnpm allows and note it in the PR.

## 4. Verified facts (do not re-verify)

Spikes were run on 2026-10-25 with Vite 8.3.5, TypeScript 6.0, Preact 11.0.2.

| Fact                                                                                                                      | Evidence                                                                                                                                                                                                                                                                                                |
| ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Vite 8 compiles TSX for Preact from tsconfig alone (`jsx: react-jsx`, `jsxImportSource: preact`)                          | Builds with empty vite config, with `oxc.jsx` config and with `@preact/preset-vite` produced byte-identical output.                                                                                                                                                                                     |
| Preact 11 + `@preact/signals` 2.11 + `preact-iso` 2.12 cost 11.4 KB gz (one lazy route adds 0.2 KB)                       | Spike build.                                                                                                                                                                                                                                                                                            |
| `@sentry/browser` 11 with `init`, `setUser`, `captureException` and the existing `define` flags costs 28.6 KB gz          | Spike build.                                                                                                                                                                                                                                                                                            |
| `@prefresh/vite` 4.0.1 injects HMR code with no Babel installed                                                           | Dev server served `/src/main.tsx` with 14 prefresh markers. Build output with the plugin present is unchanged.                                                                                                                                                                                          |
| `@prefresh/vite` logs "Failed to resolve dependency: @prefresh/core ... optimizeDeps.include" under pnpm                  | Harmless (modules load unoptimized). Silence it by adding `@prefresh/core` and `@prefresh/utils` as devDependencies.                                                                                                                                                                                    |
| `"#src/*.jsx": "./src/*.tsx"` in package.json `imports` resolves in tsc (`moduleResolution: bundler`) and in Vite         | Spike `tsc -p .` and `vite build` with `import('#src/settings.jsx')` and `#src/util.js`.                                                                                                                                                                                                                |
| Vite 8 (Lightning CSS) flattens native CSS nesting: `.row { &:hover {} }` becomes `.row:hover{}`                          | Spike CSS build.                                                                                                                                                                                                                                                                                        |
| `dev-lib lint` = oxlint + oxfmt (stylelint only if `stylelint.config.js` exists, which it does not). oxfmt formats `.css` | Read `dev-lib/dist/check.util.js`, `cfg/lint-staged.config.js`; `oxfmt --check x.css` reported format issues, i.e. it handles CSS.                                                                                                                                                                      |
| `dev-lib typecheck` runs `tsc` against `tsconfig.json`; `vue-tsc` is a separate script that goes away                     | Read `check.util.js`.                                                                                                                                                                                                                                                                                   |
| Preact 11 notes that matter here                                                                                          | ESM-only; `useRef` needs an initial value (`useRef<HTMLDialogElement>(null)`); `ref` is forwarded as a normal prop; `useEffect` cleanup runs after paint; JSX attribute types import from `preact` (e.g. `ButtonHTMLAttributes`), not `JSX.*`; style `px` auto-suffix moved to compat (we use classes). |
| preact-iso link interception                                                                                              | Handles same-origin `<a>` clicks without modifier keys; skips cross-origin, `target` other than `_self`, `download`, and `#` links. Our GitHub links have `target="_blank"` and are cross-origin, so they are never intercepted.                                                                        |

## 5. File map

| Today                                 | After                                                                             | Notes                                                                 |
| ------------------------------------- | --------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `index.html`                          | `index.html`                                                                      | Entry becomes `/src/main.tsx`; loader kept; `#loading0` bg `#fff`.    |
| `src/main.ts`                         | `src/main.tsx`                                                                    | Same bootstrap flow, `render()` instead of `createApp().mount()`.     |
| `src/App.vue`                         | `src/App.tsx`                                                                     | Shell: `LocationProvider`, `ErrorBoundary`, `Header`, `AppRouter`.    |
| `src/router.ts`                       | `src/router.tsx`                                                                  | `AppRouter`, `Guard`, route components.                               |
| `src/bootstrapDone.ts`                | removed                                                                           | `appReady` signal in `store.ts`.                                      |
| `src/store.ts`                        | `src/store.ts`                                                                    | Signals; same persisted shape.                                        |
| `src/error.ts`                        | `src/error.ts`                                                                    | `@sentry/browser`; `initSentry()` takes no app.                       |
| `src/decorators/decorators.ts`        | same                                                                              | `useStore().ghostMode = x` becomes `store.ghostMode.value = x`.       |
| `src/filters/filters.ts`              | same                                                                              | Unchanged.                                                            |
| `src/srv/api.service.ts`              | same                                                                              | Drop `mp`/`distinctId`; read `store.user.value`.                      |
| `src/srv/firebase.service.ts`         | same                                                                              | Sentry type from `@sentry/browser`; signal writes; drop analytics.    |
| `src/srv/releases.service.ts`         | same                                                                              | Store function calls instead of `useStore()`.                         |
| `src/srv/model.ts`, `env.ts`          | same                                                                              | Unchanged.                                                            |
| `src/srv/analytics.service.ts`        | removed                                                                           |                                                                       |
| `src/pages/HomePage.vue`              | `src/pages/HomePage.tsx` + `HomePage.css`                                         |                                                                       |
| `src/pages/ReleasesPage.vue`          | `src/pages/ReleasesPage.tsx` + `ReleasesPage.css` + `src/pages/releasesLoader.ts` | Loader = day-walking fetch logic + grouping as plain TS with signals. |
| `src/pages/SettingsPage.vue`          | `src/pages/SettingsPage.tsx`                                                      | Page-only CSS is tiny; put it in `global.css` under `/* Settings */`. |
| `src/pages/Project*.vue`              | removed                                                                           |                                                                       |
| `src/scss/*`                          | `src/css/global.css`                                                              |                                                                       |
| `src/shims-vue.d.ts`                  | removed                                                                           |                                                                       |
| new                                   | `src/components/Icon.tsx`                                                         | SVG path icon.                                                        |
| new                                   | `src/store.test.ts`, `src/pages/releasesLoader.test.ts`                           | Vitest via `dev-lib test`.                                            |
| `public/sw.js`                        | replaced                                                                          | Self-unregistering worker.                                            |
| `public/_headers`                     | edited                                                                            | Cache `/assets/*` immutable; drop `/js/*`, `/css/*`.                  |
| `CLAUDE.md`, `AGENTS.md`, `readme.md` | edited                                                                            | Stack and architecture sections.                                      |

Untouched: `src/cnst/paths.cnst.ts`, `scripts/*`, `public/_redirects`, `public/manifest.json`,
`netlify.toml`, `.browserslistrc`, `.husky/*`, `oxfmt.config.ts`, `pnpm-workspace.yaml` (unless a
peer-dependency warning needs `peerDependencyRules.ignoreMissing` for `preact-render-to-string`,
`@babel/core`, `@prefresh/babel-plugin`, which are optional peers we do not use).

## 6. Configuration changes

### package.json

Remove dependencies: `@sentry/vue`, `@vueuse/core`, `pinia`, `vue`, `vue-router`, `vuetify`. Remove
devDependencies: `@vitejs/plugin-vue`, `sass`, `vite-plugin-vuetify`, `vue-tsc`. Keep `tslib`
(tsconfig `importHelpers`), `tsx`, `@naturalcycles/nodejs-lib` (scripts), `vite-bundle-analyzer`,
`@types/node`, `@typescript/native-preview`, `husky`.

Add:

```json
"dependencies": {
  "@mdi/js": "^7",
  "@naturalcycles/js-lib": "^15",
  "@preact/signals": "^2.11",
  "@sentry/browser": "^11",
  "firebase": "^13",
  "preact": "^11",
  "preact-iso": "^2.12",
  "tslib": "^2"
},
"devDependencies": {
  "@prefresh/core": "^1.5",
  "@prefresh/utils": "^1.2",
  "@prefresh/vite": "^4",
  ...
},
"imports": {
  "#src/*.js": "./src/*.ts",
  "#src/*.jsx": "./src/*.tsx",
  "#src/*": "./src/*"
}
```

Scripts: `"bt": "dev-lib typecheck && pnpm build"` (drop `vue-tsc --noEmit`). Everything else
unchanged.

### tsconfig.json

```json
{
  "extends": "@naturalcycles/dev-lib/cfg/tsconfig.frontend.json",
  "compilerOptions": {
    "noEmit": true,
    "sourceMap": true,
    "outDir": "dist/tsc",
    "rootDir": ".",
    "jsx": "react-jsx",
    "jsxImportSource": "preact"
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "vite.config.ts"]
}
```

### vite.config.ts

```ts
import prefresh from '@prefresh/vite'
import { defineConfig } from 'vite'
// import { visualizer } from 'rollup-plugin-visualizer'
import { analyzer } from 'vite-bundle-analyzer'

// oxlint-disable-next-line import/no-default-export
export default defineConfig({
  define: {/* keep the five Sentry/rrweb flags exactly as today */},
  plugins: [
    prefresh(),
    analyzer({ analyzerMode: 'static', fileName: 'stats.html', defaultSizes: 'gzip' }),
    // keep the commented-out visualizer block
  ],
})
```

### oxlint.config.ts

```ts
import { defineOxlintConfig, sharedConfig } from '@naturalcycles/dev-lib/cfg/oxlint.config.js'

// oxlint-disable-next-line no-default-export
export default defineOxlintConfig({
  plugins: [...sharedConfig.plugins!, 'react'],
  rules: {
    'react/rules-of-hooks': 2,
    'react/exhaustive-deps': 2,
    'react/jsx-key': 2,
  },
})
```

If `react/no-unknown-property` fires on `class`, configure it with `{ ignore: ['class'] }` rather
than switching to `className`. `dangerouslySetInnerHTML` on the release body needs a
`// oxlint-disable-next-line react/no-danger -- GitHub-rendered release notes, same as the old v-html`
if that rule is enabled.

### index.html

Change `<script type="module" src="./src/main.ts">` to `/src/main.tsx`; set `#loading0` background
to `#fff`; drop the obsolete `X-UA-Compatible` meta. Keep everything else (manifest, icons, splash,
the SVG loader).

### public/_headers

```
/static/img/*
  cache-control: public, max-age=2592000

/assets/*
  cache-control: public, max-age=31536000, immutable
```

### public/sw.js

```js
// Legacy service worker (Workbox, 2018). Unregisters itself and clears its caches on old clients.
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {
      await self.registration.unregister()
      for (const key of await caches.keys()) await caches.delete(key)
      for (const client of await self.clients.matchAll({ type: 'window' }))
        client.navigate(client.url)
    })(),
  )
})
```

## 7. State (`src/store.ts`)

Design: one `store` object of signals (one per field of today's `GlobalState`), derived values as
`computed`, actions as exported functions, persistence as a module-level `effect`. The persisted
JSON must stay byte-compatible with today (`state` key; fields `counter`, `releases`,
`starredRepos`, `user`, `scanningResumedDismissedAt`) so existing logins survive the deploy.

```ts
import { _by, _sortBy } from '@naturalcycles/js-lib/array'
import { localTime } from '@naturalcycles/js-lib/datetime'
import { _stringMapValues } from '@naturalcycles/js-lib/types'
import type { IsoDate, StringMap, UnixTimestamp } from '@naturalcycles/js-lib/types'
import { batch, computed, effect, signal } from '@preact/signals'
import type { UserInfo } from '#src/srv/firebase.service.js'
import type { BackendResponse, Release, ReleasesByDay, Repo, UserFM } from '#src/srv/model.js'

export type StoreUser = UserInfo & { idToken?: string }

interface PersistedState {
  counter: number
  releases: StringMap<Release>
  starredRepos: Repo[]
  user: StoreUser
  scanningResumedDismissedAt?: UnixTimestamp
}

const LS_ID = 'state'
// `globalThis.localStorage?.` keeps the module importable in vitest (node env)
const persisted: Partial<PersistedState> = JSON.parse(
  globalThis.localStorage?.getItem(LS_ID) || '{}',
)

export const store = {
  counter: signal(persisted.counter ?? 0),
  user: signal<StoreUser>(persisted.user ?? ({} as StoreUser)),
  userFM: signal<UserFM>({ settings: {} } as UserFM),
  ghostMode: signal(false),
  releasesUpdaterLastFinished: signal<UnixTimestamp | undefined>(undefined),
  scanningResumedAt: signal<UnixTimestamp | undefined>(undefined),
  /**
   * The "scanning resumed" message is shown until dismissed.
   */
  scanningResumedDismissedAt: signal(persisted.scanningResumedDismissedAt),
  lastStarred: signal<string[]>([]),
  releases: signal<StringMap<Release>>(persisted.releases ?? {}),
  starredRepos: signal<Repo[]>(persisted.starredRepos ?? []),
}

/** True once main() finished bootstrap; the router renders only after that. */
export const appReady = signal(false)

export const releasesByDay = computed((): ReleasesByDay => {
  /* port of getReleasesByDay: group by localTime(r.published).toISODate(), sort each day desc */
})

export const releasesLastDay = computed((): IsoDate | null => {
  /* port of getReleasesLastDay */
})

export const showScanningResumed = computed(
  (): boolean =>
    !!store.scanningResumedAt.value &&
    store.scanningResumedAt.value > (store.scanningResumedDismissedAt.value || 0),
)

export const releasesCount = computed((): number => Object.keys(store.releases.value).length)

export function addReleases(releases: Release[] = []): void {
  store.releases.value = { ...store.releases.value, ..._by(releases, r => r.id) }
}

export function removeRepoReleases(repoFullName: string): void {
  /* port */
}

export function cleanAfterLastDay(lastDay: string): void {
  /* port */
}

export function onBackendResponse(br: BackendResponse = {}): void {
  console.log('onBackendResponse', br)
  const { userFM, releasesUpdaterLastFinished, scanningResumedAt } = br
  batch(() => {
    if (userFM) store.userFM.value = userFM
    if (releasesUpdaterLastFinished)
      store.releasesUpdaterLastFinished.value = releasesUpdaterLastFinished
    if (scanningResumedAt) store.scanningResumedAt.value = scanningResumedAt
  })
}

export function dismissScanningResumed(): void {
  store.scanningResumedDismissedAt.value = localTime.nowUnix()
}

export function resetStore(): void {
  /* batch(): assign every field its initial value */
}

// Persistence: replaces Pinia $subscribe. The effect re-runs whenever one of the five signals changes.
let previousState = ''
effect(() => {
  const state: PersistedState = {
    counter: store.counter.value,
    releases: store.releases.value,
    starredRepos: store.starredRepos.value,
    user: store.user.value,
    scanningResumedDismissedAt: store.scanningResumedDismissedAt.value,
  }
  const newState = JSON.stringify(state)
  if (newState === previousState) return
  previousState = newState
  globalThis.localStorage?.setItem(LS_ID, newState)
  console.log('state >> ls')
})
```

Rules for callers:

- Services never mutate nested objects. `useStore().user.idToken = x` becomes
  `store.user.value = { ...store.user.value, idToken: x }`.
- `setUser(uid)` (today's action) is unused; drop it. `counter`, `lastStarred`, `starredRepos` stay
  because they are persisted/typed today, even though nothing reads them.
- In components, read `signal.value` to subscribe; pass the signal itself as JSX text
  (`{store.ghostMode}`) only where a bare text node is wanted. For attributes always use `.value`
  (`disabled={store.ghostMode.value}`); the attribute-signal optimisation is experimental.
- Keep the `(globalThis as any)['state'] = ...` debug helper.

## 8. Bootstrap, shell and routing

### `src/main.tsx`

Same sequence as today, with Vue calls swapped:

1. `import '#src/css/global.css'` first.
2. `initSentry()` (no app argument). Keep the comment "Error handlers go first".
3. Keep the `unhandledrejection` listener verbatim.
4. `render(<App />, document.querySelector('#app')!)` with the "mount should happen after
   Sentry.init" comment.
5. Drop `analyticsService.init()` and the `body.touch/no-touch` class line.
6. Keep the
   `if (store.user.value.uid) void releasesService.init() else { await firebaseService.init(); await Promise.race([...]) }`
   block and its comments.
7. `void hideLoader()` unchanged; then `appReady.value = true`.
8. Keep the commented-out "Debug" block. Drop the
   `declare global { interface Window { dataLayer, gtag } }`.

### `src/App.tsx`

```tsx
import { ErrorBoundary, LocationProvider, useLocation } from 'preact-iso'
import { errorDialog } from '#src/error.js'
import { AppRouter } from '#src/router.jsx'
import { store } from '#src/store.js'

export function App() {
  return (
    <LocationProvider>
      <ErrorBoundary onError={errorDialog}>
        <Header />
        <main>
          <AppRouter />
        </main>
      </ErrorBoundary>
    </LocationProvider>
  )
}

function Header() {
  const { path } = useLocation()
  const user = store.user.value
  if (!user.uid) return null
  return (
    <header class="topbar">
      <nav>
        <a href="/releases" aria-current={path === '/releases' ? 'page' : undefined}>
          Releases
        </a>
        <a href="/settings" aria-current={path === '/settings' ? 'page' : undefined}>
          Settings
        </a>
      </nav>
      {user.photoURL && <img class="avatar" src={user.photoURL + '&s=80'} alt="" loading="lazy" />}
    </header>
  )
}
```

### `src/router.tsx`

```tsx
import type { ComponentChildren } from 'preact'
import { Route, Router, useLocation } from 'preact-iso'
import { useEffect } from 'preact/hooks'
import { HomePage } from '#src/pages/HomePage.jsx'
import { ReleasesPage } from '#src/pages/ReleasesPage.jsx'
import { SettingsPage } from '#src/pages/SettingsPage.jsx'
import { appReady, store } from '#src/store.js'

export function AppRouter() {
  // ensure Bootstrap is finished before rendering any route
  if (!appReady.value) return null
  return (
    <Router>
      <Route path="/" component={HomeRoute} />
      <Route path="/releases" component={ReleasesRoute} />
      <Route path="/settings" component={SettingsRoute} />
      <Route default component={DefaultRoute} />
    </Router>
  )
}

function HomeRoute() {
  return (
    <Guard allow={!store.user.value.uid} redirectTo="/releases" name="guestOnlyGuard">
      <HomePage />
    </Guard>
  )
}

function ReleasesRoute() {
  /* Guard allow={!!store.user.value.uid} redirectTo="/" name="loggedInGuard" */
}

function SettingsRoute() {
  /* same guard as ReleasesRoute */
}

function DefaultRoute() {
  const { route } = useLocation()
  useEffect(() => route('/', true), [route])
  return null
}

function Guard(props: {
  allow: boolean
  redirectTo: string
  name: string
  children: ComponentChildren
}) {
  const { route } = useLocation()
  const { allow, redirectTo, name, children } = props
  useEffect(() => {
    if (allow) return
    console.log(`GUARD: ${name}`)
    route(redirectTo, true)
  }, [allow, redirectTo, name, route])
  return allow ? <>{children}</> : null
}
```

Because `Guard` reads `store.user.value`, logging out on the Settings page redirects to `/`
automatically; `logout()` can still call `route('/')` explicitly as today.

Navigation inside components: `const { route } = useLocation()` then `route('/releases')` (replaces
`router.push`). Nothing outside components navigates today.

## 9. Services and error handling

- `error.ts`: `import * as sentry from '@sentry/browser'`; `initSentry(): void` calls
  `sentry.init({ dsn, environment, maxValueLength: 2000, maxBreadcrumbs: 50 })` with the existing
  comments; remove `attachProps` and the `App` type. `errorDialog` and
  `isGithubInsufficientScopeError` unchanged. Still `export { sentry }`.
- `firebase.service.ts`: `import type { User } from '@sentry/browser'`; replace every `useStore()`
  usage with `store.user.value = ...` / `store.userFM.value = ...`; delete the
  `analyticsService`/`mp` lines (`sentry.setUser` stays). Keep all comments, `@_Memo()`,
  `authStateChanged`, the `?uid=` debug branch and the "Should be called directly from a click
  handler" docs.
- `api.service.ts`: headers become `_filterFalsyValues({ idToken, uid })` from `store.user.value`;
  `topbar` show/hide unchanged.
- `releases.service.ts`: `useStore().addReleases(x)` becomes `addReleases(x)` and so on;
  `useStore().starredRepos = x` becomes `store.starredRepos.value = x`.
- `decorators.ts`: `store.ghostMode.value = true/false`.
- Component-level errors: preact-iso `ErrorBoundary onError={errorDialog}` replaces
  `app.config.errorHandler`. Async handler errors are already caught by `withProgress`.

## 10. Pages

### HomePage.tsx

Straight port of the template. `login()` is the same `withProgress` body with `route('/releases')`
instead of `router.push`; drop the `analyticsService.event` line. Markup changes:
`<v-btn color="primary">` becomes `<button type="button" class="btn btn-primary">`; the GitHub
corner SVG, screenshots and footer are kept as-is. Styles move to `HomePage.css` with the `.copy1`
font changed to `var(--font-mono)`. The `octocat-wave` keyframes and `.github-corner` rules move
from `global.scss` to `HomePage.css`.

### ReleasesPage.tsx + releasesLoader.ts

`releasesLoader.ts` holds the fetch logic that is currently inside the Vue component, as plain TS
with module-level signals, so the component only renders:

```ts
export const dayFirst = signal<IsoDate>('' as IsoDate)
export const dayLast = signal<IsoDate | null>('' as IsoDate)
export const dayLoading = signal<IsoDate>('' as IsoDate)
export const dayMax = signal<IsoDate>('' as IsoDate)
export const maxReleases = signal(30)
export const loading = signal(false)
export const unstarDialog = signal<UnstarDialog | null>(null)

export const days = computed((): IsoDate[] => {
  /* port of `days` */
})
export const groupsByDay = computed(() => groupReleases(days.value, releasesByDay.value))

export async function reload(): Promise<void> {
  /* port; `releasesByDay.value = store.getReleasesByDay()` lines disappear: the computed updates itself */
}
export async function loadMore(): Promise<void> {
  /* port */
}
export function unstarClick(repoFullName: string): void {
  /* port */
}
export function closeUnstarDialog(): void {
  /* port */
}
export async function unstarConfirm(): Promise<void> {
  /* port; `dialog.needsPermission = true` becomes `unstarDialog.value = { ...dialog, needsPermission: true }` */
}
export function groupReleases(
  days: IsoDate[],
  byDay: ReleasesByDay,
): Record<IsoDate, ReleaseGroup[]> {
  /* port of groupsByDay, pure, tested */
}
async function loadDay(day: LocalDate, loaded: number): Promise<IsoDate> {
  /* port */
}
```

Keep every comment from the Vue file, including the commented-out `dayNext` computed and the
`// a bit naive now` remark. `lastAutoReload` and the `visibilitychange` listener live in the
component in a `useEffect` with cleanup (replacing `useEventListener` from vueuse).

Component structure:

```tsx
export function ReleasesPage() {
  useEffect(() => {
    void reload()
  }, [])
  useEffect(() => {
    /* visibilitychange auto-reload, port of the vueuse listener; return the removeEventListener cleanup */
  }, [])
  return (
    <div class="container releases">
      {showScanningResumed.value && <ScanningResumedNotice />}
      <Stats /> {/* the <pre> with Last updated / Starred repos + Reload button */}
      {days.value.map(day => (
        <Day key={day} day={day} />
      ))}
      {!dayLoading.value && !releasesCount.value && <EmptyState />}
      <LoadMore /> {/* "loading {day}..." or the Load more button */}
      <UnstarDialog />
    </div>
  )
}

function Day({ day }) {
  const groups = groupsByDay.value[day]
  if (!groups?.length) return null
  return (
    <section>
      <h2 class="day">{day}</h2>
      {groups.map(g =>
        g.releases.length === 1 ? (
          <ReleaseRow key={g.repo} r={g.releases[0]!} />
        ) : (
          <GroupRow key={g.repo} group={g} />
        ),
      )}
    </section>
  )
}

function ReleaseRow({ r, child = false }: { r: Release; child?: boolean }) {
  return (
    <details class={child ? 'row child' : 'row'}>
      <summary>
        <img class="avatar" src={r.avatarUrl + '&s=80'} alt="" loading="lazy" />
        <div class="title">
          {!child && (
            <>
              {r.repoFullName}
              <br />
            </>
          )}
          <span class="ver">{r.tagName}</span>
        </div>
        <div class="time">
          {timeHM(r.published)}
          <Icon path={mdiChevronDown} class="chev" />
        </div>
      </summary>
      <div class="body">
        <div class="actions">
          <a class="btn" href={releaseUrl(r)} target="_blank" rel="noopener">
            view on github
          </a>
          <button type="button" class="btn" onClick={() => unstarClick(r.repoFullName)}>
            unstar
          </button>
        </div>
        {/* GitHub-rendered release notes, same trust level as the old v-html */}
        <div class="md" dangerouslySetInnerHTML={{ __html: r.descrHtml }} />
      </div>
    </details>
  )
}

function GroupRow({ group }) {
  /* <details class="row group"> whose summary shows repo, up to 3 tags or 2 tags + "+N more" (same slice rule as today), time of latestPublished, chevron;
     body = group.releases.map(r => <ReleaseRow key={r.id} r={r} child />) */
}
```

`releaseUrl(r)` = `https://github.com/${r.repoFullName}/releases/tag/${r.tagName || 'v' + r.v}`
(today's expression, written once). The `descrClick` stopPropagation handler is no longer needed:
clicks inside the body do not reach the summary.

`UnstarDialog`:

```tsx
function UnstarDialog() {
  const ref = useRef<HTMLDialogElement>(null)
  const dialog = unstarDialog.value
  useEffect(() => {
    if (dialog) ref.current?.showModal()
    else ref.current?.close()
  }, [dialog])
  return (
    <dialog
      ref={ref}
      class="dialog"
      onClose={closeUnstarDialog}
      onClick={e => {
        if (e.target === ref.current) closeUnstarDialog()
      }}
    >
      {dialog && (
        <div class="dialog-body">
          <h2>{dialog.needsPermission ? 'GitHub permission needed' : 'Unstar repo'}</h2>
          {/* the two text variants, copied verbatim from the Vue file (permission bullet list, "Not sure?" line, "Unstar <b>repo</b> on GitHub? ...") */}
          <div class="dialog-actions">
            <button
              type="button"
              class="btn"
              disabled={store.ghostMode.value}
              onClick={closeUnstarDialog}
            >
              Cancel
            </button>
            {dialog.needsPermission && (
              <a
                class="btn"
                href={`https://github.com/${dialog.repoFullName}`}
                target="_blank"
                rel="noopener"
                onClick={closeUnstarDialog}
              >
                Unstar on GitHub
              </a>
            )}
            <button
              type="button"
              class="btn btn-primary"
              disabled={store.ghostMode.value}
              onClick={unstarConfirm}
            >
              {dialog.needsPermission ? 'Grant public_repo' : 'Unstar'}
            </button>
          </div>
        </div>
      )}
    </dialog>
  )
}
```

The dialog has `padding: 0` and all content inside `.dialog-body`, so a click whose target is the
`<dialog>` element itself is a backdrop click. Esc triggers `onClose`, which nulls the signal.

`ScanningResumedNotice`: `<div class="notice" role="status">` with the "Welcome back!" title and the
existing text, plus a
`<button class="btn-icon" aria-label="Dismiss" onClick={dismissScanningResumed}>×</button>`.

Empty state and "0 releases in last 30 days" text copied verbatim.

### SettingsPage.tsx

```tsx
export function SettingsPage() {
  const { route } = useLocation()
  const settings = useSignal<UserSettings>({})
  const saveEnabled = useComputed(() => !_deepEquals(settings.value, store.userFM.value.settings))
  useEffect(() => {
    void releasesService.init().then(init)
  }, [])
  function init(): void {
    settings.value = { ...store.userFM.value.settings }
  }
  async function logout() {
    await firebaseService.logout()
    await route('/')
  } // drop analytics line
  async function save() {
    await withProgress(async () => {
      await releasesService.saveUserSettings(settings.value)
      init()
    })
  }
  return (
    <div class="container form1">
      <label class="field">
        <span>User ID</span>
        <input value={store.userFM.value.id ?? ''} disabled />
      </label>
      <label class="field">
        <span>Email for notifications</span>
        <input
          type="email"
          required
          value={settings.value.notificationEmail ?? ''}
          onInput={e =>
            (settings.value = { ...settings.value, notificationEmail: e.currentTarget.value })
          }
        />
      </label>
      {/* keep the commented-out md-checkbox "Notify on every release" as a JSX comment */}
      <label class="check">
        <input
          type="checkbox"
          checked={!!settings.value.notifyEmailDaily}
          onChange={e =>
            (settings.value = { ...settings.value, notifyEmailDaily: e.currentTarget.checked })
          }
        />{' '}
        Notify once a day
      </label>
      <p>Please check your SPAM folder ... (verbatim)</p>
      <p>To unsubscribe - untick the boxes above and click save.</p>
      <button type="button" class="btn btn-primary" disabled={!saveEnabled.value} onClick={save}>
        Save
      </button>
      <hr />
      <button type="button" class="btn" onClick={logout}>
        Logout
      </button>
    </div>
  )
}
```

Note: in core Preact (no compat) text inputs must use `onInput`; `onChange` only fires on blur.

### components/Icon.tsx

```tsx
export function Icon({ path, class: cls }: { path: string; class?: string }) {
  return (
    <svg class={cls} viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
      <path d={path} fill="currentColor" />
    </svg>
  )
}
```

## 11. CSS

One `src/css/global.css`, about 180 lines, authored with native nesting where it reads better.
Tokens first; everything references tokens so a dark block can be added later without touching
rules.

```css
:root {
  --font-sans: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  --font-mono: ui-monospace, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace;
  --fg: #212121;
  --fg-muted: #888;
  --bg: #fff;
  --bg-hover: rgba(0, 0, 0, 0.05);
  --bg-sub: rgba(0, 0, 0, 0.025);
  --border: #e0e0e0;
  --accent: #448aff;
  --accent-fg: #fff;
  --code-bg: #f0f0f0;
  --radius: 6px;
  --max-w: 500px;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}
html {
  -webkit-text-size-adjust: 100%;
}
body {
  margin: 0;
  font: 14px/1.5 var(--font-sans);
  color: var(--fg);
  background: var(--bg);
}
img {
  display: block;
}
a {
  color: var(--accent);
  text-decoration: none;
}
a:hover {
  text-decoration: underline;
}
:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

/* Header */
.topbar {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  height: 48px;
  padding: 0 8px;
  background: var(--bg);
  border-bottom: 1px solid var(--border);
}
.topbar nav {
  display: flex;
  gap: 4px;
}
.topbar nav a {
  padding: 6px 10px;
  border-radius: var(--radius);
  color: var(--fg);
}
.topbar nav a:hover {
  background: var(--bg-hover);
  text-decoration: none;
}
.topbar nav a[aria-current] {
  color: var(--accent);
}
.topbar .avatar {
  width: 32px;
  height: 32px;
  margin-left: auto;
  border-radius: 50%;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  height: 32px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg);
  color: var(--fg);
  font: inherit;
  cursor: pointer;
  text-decoration: none;
}
.btn:hover {
  background: var(--bg-hover);
  text-decoration: none;
}
.btn:disabled {
  opacity: 0.5;
  cursor: default;
}
.btn-primary {
  border-color: var(--accent);
  background: var(--accent);
  color: var(--accent-fg);
}
.btn-primary:hover {
  background: color-mix(in srgb, var(--accent), black 12%);
}
.btn-icon {
  width: 32px;
  padding: 0;
  justify-content: center;
  border: 0;
  background: none;
  font-size: 20px;
  cursor: pointer;
}

/* Layout */
.container {
  max-width: var(--max-w);
  padding: 16px;
}

/* Releases list */
.day {
  margin: 12px 0 4px;
  padding-left: 66px;
  font-size: 14px;
  font-weight: normal;
  color: var(--fg-muted);
}
.row {
  border-top: 1px solid var(--border);
}
.row > summary {
  display: grid;
  grid-template-columns: 40px 1fr auto;
  gap: 0 14px;
  align-items: start;
  padding: 8px 10px 8px 12px;
  cursor: pointer;
  list-style: none;
}
.row > summary::-webkit-details-marker {
  display: none;
}
@media (hover: hover) {
  .row > summary:hover {
    background: var(--bg-hover);
  }
}
.row > summary:active {
  background: var(--bg-hover);
}
.row .avatar {
  width: 40px;
  height: 40px;
  border-radius: 4px;
}
.row .time {
  display: flex;
  align-items: center;
  gap: 2px;
}
.row .chev {
  width: 20px;
  height: 20px;
  opacity: 0.4;
  transition: transform 0.15s;
}
.row[open] > summary .chev {
  transform: rotate(180deg);
}
.row .body {
  padding: 0 10px 10px 16px;
  overflow-wrap: break-word;
}
.row.child {
  background: var(--bg-sub);
}
.row.child > summary {
  grid-template-columns: 32px 1fr auto;
  padding: 4px 10px 4px 24px;
  align-items: center;
}
.row.child .avatar {
  width: 32px;
  height: 32px;
}
.row.child .body {
  padding-left: 24px;
}
.ver {
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: bold;
  color: var(--fg-muted);
  line-height: 1;
}
.group-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 10px;
  margin: 4px 0 2px;
}
.actions {
  display: flex;
  gap: 8px;
  margin: 6px 0 10px;
}
.stats {
  margin: 0;
  font-family: var(--font-mono);
}

/* Notice (scanning resumed) */
.notice {
  position: relative;
  margin-bottom: 12px;
  padding: 12px 44px 12px 16px;
  border: 1px solid color-mix(in srgb, var(--accent), transparent 60%);
  border-radius: var(--radius);
  background: color-mix(in srgb, var(--accent), transparent 92%);
}
.notice .btn-icon {
  position: absolute;
  top: 6px;
  right: 6px;
}

/* Dialog */
.dialog {
  width: calc(100% - 32px);
  max-width: 520px;
  padding: 0;
  border: 1px solid var(--border);
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  color: var(--fg);
}
.dialog::backdrop {
  background: rgba(0, 0, 0, 0.4);
}
.dialog-body {
  padding: 20px;
}
.dialog h2 {
  margin: 0 0 12px;
  font-size: 18px;
}
.dialog p {
  margin: 0 0 10px;
}
.dialog ul {
  margin: 0 0 10px;
  padding-left: 20px;
}
.dialog-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
}

/* Forms (Settings) */
.form1 {
  max-width: 400px;
}
.field {
  display: block;
  margin-bottom: 16px;
}
.field span {
  display: block;
  margin-bottom: 4px;
  font-size: 12px;
  color: var(--fg-muted);
}
.field input {
  width: 100%;
  height: 36px;
  padding: 0 10px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  font: inherit;
  color: var(--fg);
  background: var(--bg);
}
.field input:disabled {
  opacity: 0.6;
}
.check {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}
.check input {
  width: 18px;
  height: 18px;
  margin: 0;
  accent-color: var(--accent);
}
.form1 p {
  margin: 12px 0;
}
hr {
  margin: 20px 0;
  border: 0;
  border-top: 1px solid var(--border);
}

/* Release notes (GitHub HTML), ported from global.scss `.md` */
.md p {
  margin: 14px 0;
}
.md a {
  color: var(--accent);
}
.md ul {
  margin: 14px 0;
  padding-left: 24px;
}
.md code {
  padding: 0 3px 2px;
  font-family: var(--font-mono);
  background: var(--code-bg);
  border-radius: 2px;
}
.md h1,
.md h2 {
  margin: 12px 0 6px;
  font-size: 18px;
}
.md h3,
.md h4,
.md h5,
.md h6 {
  margin: 12px 0 6px;
  font-size: 14px;
}
.md img {
  max-width: 100%;
}
```

`HomePage.css` = the scoped styles of `HomePage.vue` (logo, descr, screens, copy, flag) with
`'Courier New'` replaced by `var(--font-mono)`, plus the `.github-corner` rules and `octocat-wave`
keyframes from `global.scss`. Keep the `@media (max-width: 500px)` corner rule.

`ReleasesPage.css` is only needed if something does not fit the global rules; prefer none.

Dropped on purpose: Vuetify core CSS, `.md-*` legacy rules, the `.slide-*` transition classes
(details open instantly), `.titleRow`/`.descrRow` media queries (no such elements).

## 12. Tests

`dev-lib test` runs vitest. Add:

- `src/store.test.ts`: `addReleases` merges by id; `removeRepoReleases`; `cleanAfterLastDay` keeps
  `day >= lastDay`; `releasesByDay` groups and sorts desc; `showScanningResumed` logic; the
  persistence effect writes exactly the five keys (mock `globalThis.localStorage` with a tiny
  in-memory object before importing the module via `vi.stubGlobal`).
- `src/pages/releasesLoader.test.ts`: `groupReleases` keeps insertion order, sets `avatarUrl` and
  `latestPublished` from the first release, and handles days with no releases.

No component tests; the manual QA list covers the UI.

## 13. Work order and checkpoints

Branch: `git switch -c preact`. One commit per phase (`chore:`/`refactor:`/`feat:` prefixes).

1. **Tooling skeleton** (≈1 h): package.json, tsconfig, vite.config, oxlint config, delete
   `shims-vue.d.ts`, `pnpm install`, `src/main.tsx` + `App.tsx` + `router.tsx` with placeholder
   pages and an empty `global.css`, delete all `.vue`, `scss/`, `analytics.service.ts`,
   `bootstrapDone.ts`. Store/services may not compile yet; use `// @ts-expect-error` nowhere, just
   proceed to phase 2 before running check.
2. **Store and services** (≈2 h): section 7 and 9. Checkpoint: `pnpm check` green with placeholder
   pages; `pnpm dev` shows the header after a reload with an existing localStorage session.
3. **Pages** (≈4 h): Home, Settings, Releases + loader + dialog + Icon. Checkpoint: `pnpm check`
   green; manual QA items 1–14 pass in `pnpm dev` (unstyled is fine).
4. **CSS** (≈2 h): section 11. Checkpoint: QA items 15–19; compare against the old site side by side
   at 375 px and 1024 px widths.
5. **Cleanup and docs** (≈1 h): `public/_headers`, `public/sw.js`, `index.html`, tests,
   `CLAUDE.md`/`AGENTS.md`/`readme.md` (stack, architecture, commands: drop `vue-tsc`), remove
   `tmp/` leftovers if any were created. Checkpoint: `pnpm check` green; `pnpm build` and read
   `dist/stats.html`: total JS ≤ 110 KB gz, CSS ≤ 5 KB gz.
6. **PR**: push, open PR, QA items on the Netlify deploy preview with a real login, merge.

## 14. Manual QA checklist

1. Logged out, open `/`: Home renders, loader fades out.
2. Logged out, open `/releases` or `/settings` directly: redirected to `/` (console shows
   `GUARD: loggedInGuard`).
3. Click "Login with github": popup, then redirected to `/releases`; new users see the welcome
   alert.
4. Logged in, open `/`: redirected to `/releases` (`GUARD: guestOnlyGuard`).
5. Releases load newest day first, up to 30 releases, walking back day by day, with "loading
   YYYY-MM-DD..." shown meanwhile; stats block shows "Last updated" and "Starred repos".
6. Repos with several releases on one day render as a group with up to three tags or two tags plus
   "+N more"; expanding shows child rows; expanding a child shows its notes.
7. Single release row expands to "view on github" (opens a new tab, router does not intercept) and
   "unstar" and the rendered notes; links inside notes open normally.
8. "Load more" extends the window by 30 releases/30 days; "Reload" resets to today.
9. Switch tabs away and back after 60 s: list reloads automatically; within 60 s it does not.
10. Unstar: dialog opens, Cancel closes, Esc closes, backdrop click closes. Confirm on a user
    without `public_repo` shows the permission text; "Grant public_repo" opens the GitHub popup in
    the same click; "Unstar on GitHub" opens the repo in a new tab and closes the dialog. After a
    successful unstar the repo's releases disappear from the list.
11. "Welcome back!" notice appears when the backend returns `scanningResumedAt`; dismiss persists
    across reloads (`scanningResumedDismissedAt` in localStorage).
12. Settings: User ID shown disabled; Save is disabled until a field changes; Save persists and
    disables again; email typing enables Save on each keystroke (`onInput`).
13. Logout returns to `/`; localStorage `state.user` is `{}`.
14. `/?uid=<someUid>` debug branch still sets the user.
15. Header: sticky, 48 px, hairline bottom border, active link in accent, avatar 32 px round.
16. Rows: hairline separators, hover tint on mouse only, chevron rotates when open, child rows
    tinted.
17. 375 px wide: no horizontal scroll, dialog fits, buttons wrap.
18. Keyboard: Tab reaches summaries and buttons; Enter/Space toggles a row; focus ring visible.
19. Existing session from the Vue build keeps working after deploy (no re-login).
20. Sentry: throw from the console (`setTimeout(() => { throw new Error('test') })`) and from an
    unhandled rejection; both appear in Sentry (prod only) and in the alert dialog.

## 15. Gotchas

- Preact core, not compat: `onInput` for text inputs, `class` attribute is fine, no `px` auto-suffix
  for numeric styles (we use classes).
- Hooks before early returns (`Header` calls `useLocation()` before `if (!user.uid) return null`).
- `useRef<HTMLDialogElement>(null)` needs the explicit `null` in Preact 11.
- `@preact/signals` must be imported before the first render; importing `store.ts` from `main.tsx`
  guarantees it.
- A `computed` read inside a component subscribes it; a `computed` read inside another `computed`
  chains. Never create module-level signals inside components.
- `effect()` for persistence runs once at import time, which writes the (identical) state back to
  localStorage; `previousState` dedupes after that.
- `<summary>` default marker must be hidden in Safari with `::-webkit-details-marker`.
- `dialog.close()` on an already-closed dialog is a no-op; `showModal()` on an open one throws, so
  the effect only calls `showModal()` when the signal became non-null.
- preact-iso `Route` components must be stable references (module-level functions), not inline
  arrows, or the page remounts on every parent render.
- oxlint `react/exhaustive-deps` will want `route` in effect deps; include it (it is stable).
- The `vite-bundle-analyzer` plugin writes `dist/stats.html` on every build; that is where to read
  sizes.

## 16. Docs to update at the end

- `CLAUDE.md` and `AGENTS.md` (identical content): Tech Stack (Preact 11, Signals, preact-iso, plain
  CSS, no SCSS), Commands (`pnpm bt` without `vue-tsc`), Architecture (`store.ts` signals,
  `router.tsx` guards, `main.tsx` bootstrap, `releasesLoader.ts`), Patterns (`withProgress`,
  `@_Memo()` unchanged), path alias line replaced by the `#src` import rule.
- `readme.md` "Stack (frontend)": Preact 11, Signals, TypeScript, Firebase Auth, Netlify.
- Delete this plan or move it under `docs/archive/` once merged.
