import type { JSX } from 'preact'
import { ErrorBoundary, LocationProvider, useLocation } from 'preact-iso'
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
