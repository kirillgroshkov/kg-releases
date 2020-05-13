import { env } from '@/environment/environment'
import { _Memo } from '@naturalcycles/js-lib'
import * as Sentry from '@sentry/browser'
import * as Integrations from '@sentry/integrations'
import Vue from 'vue'

class SentryService {
  @_Memo()
  init(): void {
    // if (!this.enabled) return
    const { sentryDsn: dsn, name: environment } = env()

    Sentry.init({
      dsn,
      environment,
      integrations: [
        // new Integrations.CaptureConsole(),
        new Integrations.Vue({
          Vue,
          attachProps: true,
          logErrors: true,
        }),
      ],
    })
  }

  // Returns lastEventId
  captureException(err: Error): string | undefined {
    // debugger;
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
