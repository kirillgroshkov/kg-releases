import type { JSX } from 'preact'
import { ErrorBoundary, LocationProvider } from 'preact-iso'
import { NavLink } from '#src/components/NavLink.jsx'
import { errorDialog } from '#src/error.js'
import { AppRouter } from '#src/router.jsx'
import { store } from '#src/store.js'

export function App(): JSX.Element {
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

function Header(): JSX.Element | null {
  const user = store.user.value
  if (!user.uid) return null

  return (
    <header class="topbar">
      <nav>
        <NavLink href="/releases">Releases</NavLink>
        <NavLink href="/settings">Settings</NavLink>
      </nav>
      {user.photoURL && <img class="avatar" src={user.photoURL + '&s=80'} alt="" loading="lazy" />}
    </header>
  )
}
