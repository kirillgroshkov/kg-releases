import { bootstrapDone } from '@/bootstrapDone'
import { env, logEnvironment } from '@/environment/environment'
import { analyticsService } from '@/srv/analytics.service'
import { firebaseService } from '@/srv/firebase.service'
import { releasesService } from '@/srv/releases.service'
import { sentryService } from '@/srv/sentry.service'
import { st } from '@/store'
import { _Memo } from '@naturalcycles/js-lib'
import { pDelay } from '@naturalcycles/js-lib'

class BootstrapService {
  @_Memo()
  async init(): Promise<void> {
    if (!env.dev) logEnvironment()

    sentryService.init()

    analyticsService.init()

    document.body.classList.add('ontouchstart' in document.documentElement ? 'touch' : 'no-touch')

    await firebaseService.init()
    await firebaseService.authStateChanged

    if (st().user.uid) {
      void releasesService.init()
    }

    void this.hideLoader()
    bootstrapDone.resolve()
  }

  async hideLoader(): Promise<void> {
    const loader = document.querySelector('#loading0')!
    await pDelay(env.prod ? 500 : 500)
    loader.addEventListener('transitionend', () => loader.remove())
    loader.classList.add('opacity0')
  }
}

export const bootstrapService = new BootstrapService()
