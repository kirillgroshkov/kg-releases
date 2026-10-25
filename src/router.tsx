import type { ComponentChildren, JSX } from 'preact'
import { Route, Router, useLocation } from 'preact-iso'
import { useEffect } from 'preact/hooks'
import { HomePage } from '#src/pages/HomePage.jsx'
import { ReleasesPage } from '#src/pages/ReleasesPage.jsx'
import { SettingsPage } from '#src/pages/SettingsPage.jsx'
import { appReady, store } from '#src/store.js'

export function AppRouter(): JSX.Element | null {
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

// The guards read the user with `peek()` on purpose: like the Vue `beforeEnter` guards they ran as,
// they are evaluated on navigation only, not reactively. During login the Firebase user lands in the
// store before the Backend `auth` call completes, and a reactive guard would redirect to /releases
// (and start fetching) too early. Logout navigates to `/` explicitly, so it needs no reactivity either.
function HomeRoute(): JSX.Element {
  return (
    <Guard allow={!store.user.peek().uid} redirectTo="/releases" name="guestOnlyGuard">
      <HomePage />
    </Guard>
  )
}

function ReleasesRoute(): JSX.Element {
  return (
    <Guard allow={!!store.user.peek().uid} redirectTo="/" name="loggedInGuard">
      <ReleasesPage />
    </Guard>
  )
}

function SettingsRoute(): JSX.Element {
  return (
    <Guard allow={!!store.user.peek().uid} redirectTo="/" name="loggedInGuard">
      <SettingsPage />
    </Guard>
  )
}

function DefaultRoute(): null {
  const { route } = useLocation()
  useEffect(() => route('/', true), [route])
  return null
}

function Guard(props: {
  allow: boolean
  redirectTo: string
  name: string
  children: ComponentChildren
}): JSX.Element | null {
  const { route } = useLocation()
  const { allow, redirectTo, name, children } = props
  useEffect(() => {
    if (allow) return
    console.log(`GUARD: ${name}`)
    route(redirectTo, true)
  }, [allow, redirectTo, name, route])
  return allow ? <>{children}</> : null
}
