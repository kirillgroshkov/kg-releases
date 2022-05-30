import * as Sentry from '@sentry/vue'
import Vue from 'vue'
import { env } from '@/environment/environment'

class SentryService {
  init(): void {
    // if (!this.enabled) return
    const { sentryDsn: dsn, name: environment } = env

    Sentry.init({
      dsn,
      environment,
      Vue,
    })
  }

  // Returns lastEventId
  captureException(err: Error): string | undefined {
    console.log('error in sentryService.captureException:')
    console.error(err)

    // if (!this.enabled) return ''

    Sentry.captureException(err)
    return Sentry.lastEventId()
  }

  setUser(ctx: any): void {
    Sentry.setUser(ctx)
  }

  setExtras(ctx: any): void {
    Sentry.setExtras(ctx)
  }
}

export const sentryService = new SentryService()
