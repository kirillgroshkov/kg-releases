import { HttpRequestError } from '@naturalcycles/js-lib/error'
import { _stringify } from '@naturalcycles/js-lib/string'
import * as sentry from '@sentry/browser'
import { prod } from '#src/env.js'
import { GITHUB_INSUFFICIENT_SCOPE } from '#src/srv/model.js'

export function errorDialog(err: any): void {
  console.error(err)
  sentry.captureException(err)
  alert(_stringify(err))
}

export function isGithubInsufficientScopeError(err: unknown): boolean {
  return err instanceof HttpRequestError && err.cause.data.code === GITHUB_INSUFFICIENT_SCOPE
}

export function initSentry(): void {
  sentry.init({
    dsn: prod ? 'https://f15980b092a741ff8e903824cf2769fe@sentry.io/1214161' : undefined,
    environment: prod ? 'prod' : 'dev',
    maxValueLength: 2000, // default is 250
    maxBreadcrumbs: 50, // to prevent "413 Request Entity Too Large"
  })
}

export { sentry }
