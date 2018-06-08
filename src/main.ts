/* tslint:disable:ordered-imports */

// css
import './scss/global.scss'

import '@/polyfills'
import { bootstrapService } from '@/srv/bootstrap.service'
import { jsonify } from '@/util/object.util'
import Vue from 'vue'
import './hooks' // must be defined BEFORE router is created!
import { router } from '@/router'
import { store } from '@/store'
import '@/filters/filters.ts'
import RootComponent from './cmp/RootComponent.vue'

Vue.config.productionTip = false

// Material
// import VueMaterial from 'vue-material'
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
  render: h => h(RootComponent),
}).$mount('#app')

bootstrapService.init() // async

// Debug
const w: any = window
w.state = () => jsonify(store.state)
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
