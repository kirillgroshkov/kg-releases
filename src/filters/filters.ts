import { localTime } from '@naturalcycles/js-lib'

// Vue.filter('unixtimePretty', (v: number) => {
//   if (!v) return ''
//   return localTime(v).toPretty()
// })
//
// Vue.filter('timePretty', (v: number) => {
//   if (!v) return ''
//   return localTime(v).toISOTime()
// })
//
// Vue.filter('timeHM', (v: number) => {
//   if (!v) return ''
//   return localTime(v).toISOTime(false)
// })
//
// Vue.filter('timeAgo', (v: number) => {
//   if (!v) return ''
//   return localTime(v).fromNow()
// })

export function unixtimePretty(v?: number): string {
  if (!v) return ''
  return localTime(v).toPretty()
}

export function timeHM(v?: number): string {
  if (!v) return ''
  return localTime(v).toISOTime(false)
}
