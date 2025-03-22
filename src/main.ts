import 'vuetify/styles'
import './scss/global.scss'
import { pDelay } from '@naturalcycles/js-lib'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'
import { bootstrapDone } from '@/bootstrapDone'
import { prod } from '@/env'
import { errorDialog, initSentry } from '@/error'
import { router } from '@/router'
import { analyticsService } from '@/srv/analytics.service'
import { firebaseService } from '@/srv/firebase.service'
import { releasesService } from '@/srv/releases.service'
import { initStore, useStore } from '@/store'
import App from './App.vue'

// eslint-disable-next-line unicorn/prefer-top-level-await
void main()

async function main(): Promise<void> {
  console.log({ prod })

  const vuetify = createVuetify({
    icons: {
      defaultSet: 'mdi',
      aliases,
      sets: {
        mdi,
      },
    },
    theme: {
      themes: {
        light: {
          colors: {
            primary: '#448aff',
          },
        },
      },
    },
  })

  const app = createApp(App).use(createPinia()).use(router).use(vuetify)

  // Error handlers go first
  initSentry(app)

  app.config.errorHandler = (err, _instance, info) => {
    if (info) console.log('error info:', info)
    errorDialog(err)
  }

  globalThis.addEventListener('unhandledrejection', event => {
    console.log('unhandledRejection')
    const err = event.reason
    if (err) {
      event.preventDefault()
      errorDialog(err)
    }
    // otherwise - let it propagate
  })

  initStore()

  // mount should happen after Sentry.init, according to Sentry
  app.mount('#app')

  analyticsService.init()

  document.body.classList.add('ontouchstart' in document.documentElement ? 'touch' : 'no-touch')

  const store = useStore()
  if (store.user.uid) {
    void releasesService.init()
  } else {
    // only init releasesService if user is NOT logged in
    await firebaseService.init()
    await firebaseService.authStateChanged
  }

  void hideLoader()
  bootstrapDone.resolve()
}

async function hideLoader(): Promise<void> {
  const loader = document.querySelector('#loading0')!
  await pDelay(500)
  loader.addEventListener('transitionend', () => loader.remove())
  loader.classList.add('opacity0')
}

// Debug
// const w: any = window
// w.state = () => _deepCopy(store.state)
// w.commit = (type: string, payload?: any) => {
//   store.commit(type, payload)
//   return w.state()
// }
// w.reset = () => {
//   store.commit('reset')
//   return w.state()
// }
// w.getters = store.getters
// w.app = app
// w.clearReleases = () => {
//   store.commit('extendState', { releases: {} })
// }
// w.throwError = () => {
//   throw new Error('my error')
// }

declare global {
  interface Window {
    dataLayer: any[]
    gtag: (...args: any[]) => void
  }
}
