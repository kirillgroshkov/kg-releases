/* tslint:disable:ordered-imports */

// css
import './scss/global.scss'

import '@/polyfills'
import { pDelay } from '@naturalcycles/js-lib'
import { createPinia, PiniaVuePlugin } from 'pinia'
import Vue from 'vue'
import {
  MdApp,
  MdContent,
  MdToolbar,
  MdButton,
  MdIcon,
  MdTabs,
  MdAvatar,
  MdField,
  MdCheckbox,
} from 'vue-material/dist/components'
import RootComponent from './cmp/RootComponent.vue'
import { initStore, useStore } from '@/store'
import { bootstrapDone } from '@/bootstrapDone'
import { prod } from '@/env'
import { initSentry } from '@/error'
import { analyticsService } from '@/srv/analytics.service'
import { firebaseService } from '@/srv/firebase.service'
import { releasesService } from '@/srv/releases.service'
import { router } from '@/router'
import '@/filters/filters.ts'

Vue.config.productionTip = false

// Material
// import VueMaterial from 'vue-material'
import 'vue-material/dist/vue-material.min.css'
import 'vue-material/dist/theme/default.css'
// Vue.use(VueMaterial)
Vue.use(MdApp)
Vue.use(MdContent)
Vue.use(MdToolbar)
Vue.use(MdTabs)
Vue.use(MdAvatar)
Vue.use(MdButton)
Vue.use(MdIcon)
Vue.use(MdField)
Vue.use(MdCheckbox)

Vue.use(PiniaVuePlugin)

const pinia = createPinia()

new Vue({
  el: '#app',
  router,
  render: h => h(RootComponent),
  pinia,
})

// eslint-disable-next-line unicorn/prefer-top-level-await
void main()

async function main() {
  console.log({ prod })

  initStore()
  initSentry()

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
