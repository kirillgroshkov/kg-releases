import { env } from '@/environment/environment'
import { memo } from '@naturalcycles/js-lib'
import { RavenOptions } from 'raven-js'
import * as Raven from 'raven-js'
import Vue from 'vue'
const RavenVue = require('raven-js/plugins/vue')

class SentryService {
  get enabled (): boolean {
    // return env().sentryEnabled && !!env().sentryDsn
    return !!env().sentryDsn
  }

  @memo()
  init (): void {
    // if (!this.enabled) return

    Raven.config(env().sentryDsn!, {
      // release: buildInfo.ver,
      environment: env().name,
      tags: {
        // buildInfo_ver: buildInfo.ver,
        // buildInfo_env: buildInfo.env,
      },
      // whitelistUrls: [],
      // debug: true,
    } as RavenOptions)
      .addPlugin(RavenVue, Vue)
      .install()
  }

  // Returns lastEventId
  captureException (err: Error): string {
    // debugger;
    console.log('error in sentryService.captureException:')
    console.error(err)

    // if (!this.enabled) return ''

    Raven.captureException(err)
    return Raven.lastEventId()
  }

  setUserContext (ctx: any): void {
    Raven.setUserContext(ctx)
  }

  setExtraContext (ctx: any): void {
    Raven.setExtraContext(ctx)
  }
}

export const sentryService = new SentryService()
