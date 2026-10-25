import { localDate } from '@naturalcycles/js-lib/datetime'
import type { LocalDate } from '@naturalcycles/js-lib/datetime'
import type { IsoDate, UnixTimestamp } from '@naturalcycles/js-lib/types'
import { computed, signal } from '@preact/signals'
import { withProgress } from '#src/decorators/decorators.js'
import { isGithubInsufficientScopeError } from '#src/error.js'
import type { Release, ReleasesByDay } from '#src/srv/model.js'
import { releasesService } from '#src/srv/releases.service.js'
import { cleanAfterLastDay, releasesByDay, releasesLastDay, store } from '#src/store.js'

/**
 * Fetch logic of the Releases page (day-walking loader, grouping, unstar dialog state), as plain
 * TS with module-level signals, so the page component only renders.
 */

export interface UnstarDialog {
  repoFullName: string
  /**
   * True if the `public_repo` scope needs to be granted first.
   */
  needsPermission: boolean
}

export interface ReleaseGroup {
  repo: string
  avatarUrl?: string
  latestPublished: UnixTimestamp
  releases: Release[]
}

export const maxReleases = signal(30)
export const dayFirst = signal<IsoDate>('' as IsoDate)
export const dayLast = signal<IsoDate | null>('' as IsoDate)
export const dayLoading = signal<IsoDate>('' as IsoDate)
export const dayMax = signal<IsoDate>('' as IsoDate)
export const loading = signal(false)
export const unstarDialog = signal<UnstarDialog | null>(null)

// const dayNext = computed((): IsoDate => {
//   if (!dayLast.value) return ''
//
//   return localDate(dayLast.value).subtract(1, 'day').toISODate()
// })

export const days = computed((): IsoDate[] => {
  if (!dayFirst.value || !dayLast.value) return []

  return localDate
    .range(dayLast.value, dayFirst.value, '[]')
    .map(d => d.toISODate())
    .reverse()
})

export const groupsByDay = computed((): Record<IsoDate, ReleaseGroup[]> =>
  groupReleases(days.value, releasesByDay.value),
)

export async function reload(): Promise<void> {
  if (loading.value) return // don't start new request
  loading.value = true // a bit naive now
  await withProgress(async () => {
    maxReleases.value = 30
    const today = localDate.todayInUTC()
    const todayStr = today.toISODate()
    dayMax.value = today.minus(30, 'day').toISODate()
    dayFirst.value = todayStr
    dayLast.value = releasesLastDay.value || todayStr

    // await pDelay(1000) // give time for animations to finish
    dayLast.value = await loadDay(today, 0)
    dayLoading.value = '' as IsoDate
    // console.log('dayLast end: ' + this.dayLast)

    // cleanAfterLastDay
    cleanAfterLastDay(dayLast.value)
  })
  loading.value = false
}

export async function loadMore(): Promise<void> {
  const releasesCount = Object.keys(store.releases.value).length
  maxReleases.value = releasesCount + 30
  dayMax.value = localDate(dayMax.value).minus(30, 'day').toISODate()
  const dayNext = localDate(dayLast.value!).minus(1, 'day')
  dayLast.value = await loadDay(dayNext, releasesCount)
  dayLoading.value = '' as IsoDate
}

export function unstarClick(repoFullName: string): void {
  unstarDialog.value = { repoFullName, needsPermission: false }
}

export function closeUnstarDialog(): void {
  unstarDialog.value = null
}

export async function unstarConfirm(): Promise<void> {
  const dialog = unstarDialog.value!

  await withProgress(async () => {
    try {
      // GitHub popup must be opened right in the click handler, otherwise the browser can block it
      if (dialog.needsPermission) await releasesService.grantStarsPermission()
      await releasesService.unstarRepo(dialog.repoFullName)
    } catch (err) {
      if (isGithubInsufficientScopeError(err)) {
        // Keep the dialog open, now asking to grant the permission (with a new click)
        unstarDialog.value = { ...dialog, needsPermission: true }
        return
      }
      unstarDialog.value = null
      throw err
    }

    unstarDialog.value = null
  })
}

/**
 * Groups each day's releases by repo, keeping the order of first appearance (releases within a day
 * are sorted newest first, so the first release of a group is also its latest).
 */
export function groupReleases(
  days: IsoDate[],
  byDay: ReleasesByDay,
): Record<IsoDate, ReleaseGroup[]> {
  const result: Record<IsoDate, ReleaseGroup[]> = {}

  for (const day of days) {
    const releases = byDay[day] || []
    const repoMap: Record<string, Release[]> = {}

    for (const r of releases) {
      ;(repoMap[r.repoFullName] ||= []).push(r)
    }

    result[day] = Object.entries(repoMap).map(([repo, groupReleases]) => ({
      repo,
      avatarUrl: groupReleases[0]!.avatarUrl,
      latestPublished: groupReleases[0]!.published,
      releases: groupReleases,
    }))
  }

  return result
}

async function loadDay(day: LocalDate, loaded: number): Promise<IsoDate> {
  const dayStr = day.toISODate()
  dayLoading.value = dayStr
  const nextDay = day.plus(1, 'day')
  const nextDayStr = nextDay.toISODate()
  // this.loading = 'loading...'
  // _this.dayLast = dayStr
  dayLast.value = releasesLastDay.value
  // console.log('dayLast: ' + this.dayLast)

  const { releases = [] } = await releasesService.fetchReleases(dayStr, nextDayStr)
  // this.loading = ''
  // const releasesCount = Object.keys(st().releases).length
  loaded += releases.length
  // console.log('loaded: ' + loaded)

  if (loaded < maxReleases.value && dayStr > dayMax.value) {
    const yesterday = day.minus(1, 'day')
    return await loadDay(yesterday, loaded)
  }

  return dayStr
}
