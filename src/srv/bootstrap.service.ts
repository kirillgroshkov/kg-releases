import { bootstrapDoneDefer } from '@/bootstrapDone'
import { PromiseDecoratorResp } from '@/decorators/decorator.util'
import { initProgressDecorator } from '@/decorators/progress.decorator'
import { env, logEnvironment } from '@/environment/environment'
import { app } from '@/main'
import { router } from '@/router'
import { analyticsService } from '@/srv/analytics.service'
import { ResponseWithHttpError } from '@/srv/api.service'
import { firebaseService } from '@/srv/firebase.service'
import { releasesService } from '@/srv/releases.service'
import { sentryService } from '@/srv/sentry.service'
import { st, store } from '@/store'
import { HttpError, memo } from '@naturalcycles/js-lib'
import { pDelay } from '@naturalcycles/js-lib'
import { HTTPError } from 'ky'

class BootstrapService {
  @memo()
  async init(): Promise<void> {
    if (!env().dev) logEnvironment()

    sentryService.init()

    analyticsService.init()

    document.body.classList.add('ontouchstart' in document.documentElement! ? 'touch' : 'no-touch')

    this.initDecorators()

    await firebaseService.init()
    await firebaseService.authStateChanged

    if (st().user.uid) {
      void releasesService.init()
    }

    void this.hideLoader()
    bootstrapDoneDefer.resolve()
  }

  private initDecorators(): void {
    initProgressDecorator({
      beforeFn() {
        store.commit('setGhost')
        app.$Progress.start()
      },
      okFn(r: PromiseDecoratorResp) {
        store.commit('setGhost', false)
        let cls: string = r.target && r.target.constructor && r.target.constructor.name
        if (cls) cls += '.'
        const args: string = r.args && r.args.length ? JSON.stringify(r.args) + ' ' : ''
        console.log(`@${r.decoratorName} ${cls}${r.propertyKey}() ${args}took ${r.millis} ms`)
        app.$Progress.finish()
        return r.res
      },
      async errorFn(resp: PromiseDecoratorResp) {
        store.commit('setGhost', false)
        app.$Progress.fail()
        const tokens = [`@Progress() error in ${resp.target.constructor.name}.${resp.propertyKey}`]
        let httpError: HttpError | undefined

        const { err } = resp
        if (err instanceof HTTPError) {
          httpError = (err.response as ResponseWithHttpError).httpError
          if (httpError) {
            tokens.push(httpError.message)
          }
        }

        const msg = tokens.join('\n')
        console.warn(msg)
        alert(msg)

        if (httpError && httpError.data.httpStatusCode === 401) {
          await firebaseService.logout()
          router.push('/')
          return
        }

        return Promise.reject(msg)
      },
    })
  }

  async hideLoader(): Promise<void> {
    const loader = document.getElementById('loading0')!
    await pDelay(env().prod ? 500 : 500)
    loader.addEventListener('transitionend', () => loader.remove())
    loader.classList.add('opacity0')
  }
}

export const bootstrapService = new BootstrapService()
