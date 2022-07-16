import { _stringifyAny } from '@naturalcycles/js-lib'
import * as sentry from '@sentry/vue'
import Vue from 'vue'
import { prod } from './env'

export function errorDialog(err: any): void {
  console.error(err)
  sentry.captureException(err)
  alert(_stringifyAny(err))
}

export function initSentry(): void {
  sentry.init({
    Vue,
    dsn: prod ? 'https://f15980b092a741ff8e903824cf2769fe@sentry.io/1214161' : undefined,
    environment: prod ? 'prod' : 'dev',
    attachProps: true,
    logErrors: true,
    maxValueLength: 2000, // default is 250
    maxBreadcrumbs: 50, // to prevent "413 Request Entity Too Large"
  })
}

export { sentry }
