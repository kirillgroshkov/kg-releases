import { localTime } from '@naturalcycles/js-lib'
import Vue from 'vue'

Vue.filter('unixtimePretty', (v: number) => {
  if (!v) return ''
  return localTime(v).toPretty()
})

Vue.filter('timePretty', (v: number) => {
  if (!v) return ''
  return localTime(v).toISOTime()
})

Vue.filter('timeHM', (v: number) => {
  if (!v) return ''
  return localTime(v).toISOTime(false)
})

Vue.filter('timeAgo', (v: number) => {
  if (!v) return ''
  return localTime(v).fromNow()
})
