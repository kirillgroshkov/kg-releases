import '@/polyfills'
import { pDelay } from '@naturalcycles/js-lib'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'
import App from './App.vue'
import { initStore, useStore } from '@/store'
import { bootstrapDone } from '@/bootstrapDone'
import { prod } from '@/env'
import { initSentry } from '@/error'
import { analyticsService } from '@/srv/analytics.service'
import { firebaseService } from '@/srv/firebase.service'
import { releasesService } from '@/srv/releases.service'
import { router } from '@/router'
import 'vuetify/styles'
import './scss/global.scss'

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

// eslint-disable-next-line unicorn/prefer-top-level-await
void main()

async function main() {
  console.log({ prod })

  initStore()
  initSentry(app)

  // mount should happen after Sentry.init, according to Sentry
  app.mount('#app')

  analyticsService.init()

  document.body.classList.add('ontouchstart' in document.documentElement ? 'touch' : 'no-touch')

  await firebaseService.init()
  await firebaseService.authStateChanged

  const store = useStore()
  if (store.user.uid) {
    void releasesService.init()
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
    gtag(...args: any[]): void
  }
}
