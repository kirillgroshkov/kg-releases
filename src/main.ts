/* tslint:disable:ordered-imports */

// css
import './scss/global.scss'
import './scss/bootstrap.scss'

import '@/polyfills'
import { bootstrapService } from '@/srv/bootstrap.service'
import Vue from 'vue'
import './hooks' // must be defined BEFORE router is created!
import { router } from '@/router'
import { store } from '@/store'
import '@/filters/filters.ts'
import RootComponent from './cmp/RootComponent.vue'

// import 'jquery'
// import 'bootstrap'

Vue.config.productionTip = false

// Progress bar
const VueProgressBar = require('vue-progressbar')
Vue.use(VueProgressBar, {
  // color: '#3ffaf3',
  // failedColor: '#874b4b',
  thickness: '4px',
  transition: {
    speed: '0.2s',
    opacity: '0.6',
    termination: 500,
  },
})

export const app = new Vue({
  router,
  store,
  el: '#app',
  components: { RootComponent },
  template: '<RootComponent/>',
})

bootstrapService.init() // async

// Debug
const w: any = window
w.state = () => JSON.parse(JSON.stringify(store.state))
w.commit = (type: string, payload?: any) => {
  store.commit(type, payload)
  return w.state()
}
w.reset = () => {
  store.commit('reset')
  return w.state()
}
w.app = app
