import { _by, _sortBy } from '@naturalcycles/js-lib/array'
import { localTime } from '@naturalcycles/js-lib/datetime'
import { _stringMapValues } from '@naturalcycles/js-lib/types'
import type { IsoDate, StringMap, UnixTimestamp } from '@naturalcycles/js-lib/types'
import { batch, computed, effect, signal } from '@preact/signals'
import type { UserInfo } from '#src/srv/firebase.service.js'
import type { BackendResponse, Release, ReleasesByDay, Repo, UserFM } from '#src/srv/model.js'

export type StoreUser = UserInfo & { idToken?: string }

interface PersistedState {
  counter: number
  releases: StringMap<Release>
  starredRepos: Repo[]
  user: StoreUser
  scanningResumedDismissedAt?: UnixTimestamp
}

const LS_ID = 'state'
// `globalThis.localStorage?.` keeps the module importable in vitest (node env)
const persisted: Partial<PersistedState> = JSON.parse(
  globalThis.localStorage?.getItem(LS_ID) || '{}',
)

export const store = {
  counter: signal(persisted.counter ?? 0),
  user: signal<StoreUser>(persisted.user ?? ({} as StoreUser)),
  userFM: signal<UserFM>({ settings: {} } as UserFM),
  ghostMode: signal(false),
  releasesUpdaterLastFinished: signal<UnixTimestamp | undefined>(undefined),
  scanningResumedAt: signal<UnixTimestamp | undefined>(undefined),
  /**
   * The "scanning resumed" message is shown until dismissed.
   */
  scanningResumedDismissedAt: signal(persisted.scanningResumedDismissedAt),
  // rateLimit: RateLimit
  lastStarred: signal<string[]>([]),
  // starredReposNumber: number
  releases: signal<StringMap<Release>>(persisted.releases ?? {}),
  starredRepos: signal<Repo[]>(persisted.starredRepos ?? []),
}

/** True once main() finished bootstrap; the router renders only after that. */
export const appReady = signal(false)

export const releasesByDay = computed((): ReleasesByDay => {
  const m: ReleasesByDay = {}
  _stringMapValues(store.releases.value).forEach(r => {
    const day = localTime(r.published).toISODate()
    m[day] ||= []
    m[day].push(r)
  })

  // sort
  Object.values(m).forEach(releases =>
    _sortBy(releases, r => r.published, { mutate: true, dir: 'desc' }),
  )

  return m
})

export const releasesLastDay = computed((): IsoDate | null => {
  const days = (_stringMapValues(store.releases.value) || [])
    .map(r => localTime(r.published).toISODate())
    .sort()
  return days[0] || null
})

export const showScanningResumed = computed(
  (): boolean =>
    !!store.scanningResumedAt.value &&
    store.scanningResumedAt.value > (store.scanningResumedDismissedAt.value || 0),
)

export const releasesCount = computed((): number => Object.keys(store.releases.value).length)

export function addReleases(releases: Release[] = []): void {
  store.releases.value = {
    ...store.releases.value,
    ..._by(releases, r => r.id),
  }
}

export function removeRepoReleases(repoFullName: string): void {
  store.releases.value = _by(
    _stringMapValues(store.releases.value).filter(r => r.repoFullName !== repoFullName),
    r => r.id,
  )
}

export function cleanAfterLastDay(lastDay: string): void {
  const releases: { [id: string]: Release } = {}

  _stringMapValues(store.releases.value).forEach(r => {
    const day = localTime(r.published).toISODate()
    if (day >= lastDay) {
      // include, otherwise exclude
      releases[r.id] = r
    }
  })

  store.releases.value = releases
}

export function onBackendResponse(br: BackendResponse = {}): void {
  console.log('onBackendResponse', br)
  const { userFM, releasesUpdaterLastFinished, scanningResumedAt } = br

  batch(() => {
    if (userFM) {
      store.userFM.value = userFM
    }

    if (releasesUpdaterLastFinished) {
      store.releasesUpdaterLastFinished.value = releasesUpdaterLastFinished
    }

    if (scanningResumedAt) {
      store.scanningResumedAt.value = scanningResumedAt
    }
  })
}

export function dismissScanningResumed(): void {
  store.scanningResumedDismissedAt.value = localTime.nowUnix()
}

export function resetStore(): void {
  batch(() => {
    store.counter.value = 0
    store.user.value = {} as StoreUser
    store.userFM.value = { settings: {} } as UserFM
    store.ghostMode.value = false
    store.releasesUpdaterLastFinished.value = undefined
    store.scanningResumedAt.value = undefined
    store.scanningResumedDismissedAt.value = undefined
    // rateLimit: {} as any,
    // starredReposNumber: 0,
    store.releases.value = {}
    store.lastStarred.value = []
    store.starredRepos.value = []
  })
}

// Persistence: replaces Pinia $subscribe. The effect re-runs whenever one of the five signals changes.
let previousState = ''
effect(() => {
  const state: PersistedState = {
    counter: store.counter.value,
    releases: store.releases.value,
    starredRepos: store.starredRepos.value,
    user: store.user.value,
    scanningResumedDismissedAt: store.scanningResumedDismissedAt.value,
  }
  const newState = JSON.stringify(state)
  if (newState === previousState) return
  previousState = newState
  globalThis.localStorage?.setItem(LS_ID, newState)
  console.log('state >> ls')
})

// Debug helper: `state()` in the console logs the current store
;(globalThis as any)['state'] = () =>
  console.log(Object.fromEntries(Object.entries(store).map(([k, s]) => [k, s.value])))
