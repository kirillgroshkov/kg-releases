import { HttpRequestError } from '@naturalcycles/js-lib/error'
import { _stringify } from '@naturalcycles/js-lib/string'
import type { User } from '@sentry/browser'
import { prod } from '#src/env.js'
import type * as SentryModule from '#src/sentry.js'
import { GITHUB_INSUFFICIENT_SCOPE } from '#src/srv/model.js'

type Sentry = typeof SentryModule

/**
 * Sentry (~29 kB gzip, half of the main chunk) is loaded lazily, on the first captured error,
 * so it stays off the critical path. Trade-off: breadcrumbs from before that first error are lost.
 */
let sentryPromise: Promise<Sentry> | undefined
let sentry: Sentry | undefined
// Remembered until Sentry is loaded, then applied on init
let sentryUser: User = {}

export function errorDialog(err: unknown): void {
  console.error(err)
  captureException(err)
  alert(_stringify(err))
}

export function isGithubInsufficientScopeError(err: unknown): boolean {
  return err instanceof HttpRequestError && err.cause.data.code === GITHUB_INSUFFICIENT_SCOPE
}

/**
 * Replaces Sentry's GlobalHandlers integration (excluded in loadSentry), which can only start
 * listening once Sentry is loaded.
 * unhandledrejection is handled in main.tsx, via errorDialog.
 */
export function initErrorHandlers(): void {
  globalThis.addEventListener('error', event => {
    captureException(event.error ?? event.message)
  })
}

export function captureException(err: unknown): void {
  if (!prod) return

  loadSentry().then(
    sentry => sentry.captureException(err),
    (loadErr: unknown) => console.error('Failed to load Sentry', loadErr),
  )
}

export function setSentryUser(user: User): void {
  sentryUser = user
  sentry?.setUser(user)
}

async function loadSentry(): Promise<Sentry> {
  sentryPromise ??= import('#src/sentry.js').then(
    s => {
      s.init({
        dsn: 'https://f15980b092a741ff8e903824cf2769fe@sentry.io/1214161',
        environment: 'prod',
        maxValueLength: 2000, // default is 250
        maxBreadcrumbs: 50, // to prevent "413 Request Entity Too Large"
        dataCollection: { userInfo: false },
        // Global errors are forwarded by initErrorHandlers, this would report them twice
        integrations: integrations => integrations.filter(i => i.name !== 'GlobalHandlers'),
      })
      s.setUser(sentryUser)
      sentry = s
      return s
    },
    (err: unknown) => {
      // Allow the next error to retry (e.g. a network blip while fetching the chunk)
      sentryPromise = undefined
      throw err
    },
  )
  return sentryPromise
}
