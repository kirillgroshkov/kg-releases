/* tslint:disable:ordered-imports */
import '@/scss/global.scss'
import '@/polyfills'
import Vue from 'vue'
import './hooks' // must be defined BEFORE router is created!
import { router } from '@/router'
import { store } from '@/store'
import '@/filters/time.filters.ts'
import RootComponent from './cmp/RootComponent.vue'

Vue.config.productionTip = false

export const app = new Vue({
  router,
  store,
  el: '#app',
  components: { RootComponent },
  template: '<RootComponent/>',
})
