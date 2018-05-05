import { markdownService } from '@/srv/markdown.service'
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

Vue.filter('md', (s: string) => {
  return markdownService.parse(s)
})
