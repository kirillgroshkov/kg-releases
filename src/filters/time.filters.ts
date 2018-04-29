import { timeUtil } from '@/util/time.util'
import Vue from 'vue'

Vue.filter('unixtimePretty', (v: number) => {
  if (!v) return ''
  return timeUtil.unixtimePretty(v)
})

Vue.filter('timeAgo', (v: number) => {
  if (!v) return ''
  return timeUtil.timeBetween(Date.now(), v * 1000)
})
