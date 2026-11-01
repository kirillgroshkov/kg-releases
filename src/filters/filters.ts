import { localTime } from '@naturalcycles/js-lib/datetime'
import type { UnixTimestamp } from '@naturalcycles/js-lib/types'

export function unixtimePretty(v?: UnixTimestamp): string {
  if (!v) return ''
  return localTime(v).toPretty()
}

export function timeHM(v?: UnixTimestamp): string {
  if (!v) return ''
  return localTime(v).toISOTime(false)
}
