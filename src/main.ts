/* tslint:disable:ordered-imports */

// css
import './scss/global.scss'

import '@/polyfills'
import { _deepCopy } from '@naturalcycles/js-lib'
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
import { bootstrapService } from '@/srv/bootstrap.service'
import './hooks' // must be defined BEFORE router is created!
import { router } from '@/router'
import { store } from '@/store'
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

export const app = new Vue({
  router,
  store,
  render: h => h(RootComponent),
}).$mount('#app')

void bootstrapService.init()

// Debug
const w: any = window
w.state = () => _deepCopy(store.state)
w.commit = (type: string, payload?: any) => {
  store.commit(type, payload)
  return w.state()
}
w.reset = () => {
  store.commit('reset')
  return w.state()
}
w.getters = store.getters
w.app = app
w.clearReleases = () => {
  store.commit('extendState', { releases: {} })
}

declare global {
  interface Window {
    prod: boolean
    dataLayer: any[]
    gtag(...args: any[]): void
  }
}
