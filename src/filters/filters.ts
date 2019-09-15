import { dayjs } from '@naturalcycles/time-lib'
import Vue from 'vue'

Vue.filter('unixtimePretty', (v: number) => {
  if (!v) return ''
  return dayjs.unix(v).toPretty()
})

Vue.filter('timePretty', (v: number) => {
  if (!v) return ''
  return dayjs.unix(v).format('HH:mm:ss')
})

Vue.filter('timeHM', (v: number) => {
  if (!v) return ''
  return dayjs.unix(v).format('HH:mm')
})

Vue.filter('timeAgo', (v: number) => {
  if (!v) return ''
  return dayjs.unix(v).fromNow()
})
