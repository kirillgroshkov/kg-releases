import { PromiseDecoratorResp } from '@/decorators/decorator.util'
import { memo } from '@/decorators/memo.decorator'
import { initProgressDecorator } from '@/decorators/progress.decorator'
import { env, logEnvironment } from '@/environment/environment'
import { app } from '@/main'
import { analyticsService } from '@/srv/analytics.service'
import { firebaseService } from '@/srv/firebase.service'
import { sentryService } from '@/srv/sentry.service'
import { store } from '@/store'

class BootstrapService {
  @memo()
  async init (): Promise<void> {
    if (!env().dev) logEnvironment()

    sentryService.init()

    analyticsService.init()

    document.body.classList.add('ontouchstart' in document.documentElement ? 'touch' : 'no-touch')

    this.initDecorators()

    await firebaseService.init()
    await firebaseService.authStateChanged

    // await this.appInit()
  }

  /*@Progress()
  private async appInit (): Promise<void> {
    try {
      await releasesService.fetchReleases()
    } catch (err) {
      if (err && err.response && err.response.status === 401) {
        location.href = `${env().loginUrl}?autoLogin=1&return=${location.href}`
        return
      }
      throw err
    }
  }*/

  private initDecorators (): void {
    initProgressDecorator({
      beforeFn () {
        store.commit('setGhost')
        app.$Progress.start()
      },
      okFn (r: PromiseDecoratorResp) {
        store.commit('setGhost', false)
        let cls: string = r.target && r.target.constructor && r.target.constructor.name
        if (cls) cls += '.'
        const args: string = r.args && r.args.length ? JSON.stringify(r.args) + ' ' : ''
        console.log(`@${r.decoratorName} ${cls}${r.propertyKey}() ${args}took ${r.millis} ms`)
        app.$Progress.finish()
        return r.res
      },
      errorFn (r: PromiseDecoratorResp) {
        store.commit('setGhost', false)
        app.$Progress.fail()
        console.log('decccc', r)
        const t = [
          `@Progress() error in ${r.target.constructor.name}.${r.propertyKey}:`,
          (r.err && r.err.message) || JSON.stringify(r.err, undefined, 2),
        ]
        const msg = t.join('\n')
        alert(msg)
        return Promise.reject(r.err)
      },
    })
  }
}

export const bootstrapService = new BootstrapService()
