import { _by, _minOrUndefined, _sortBy } from '@naturalcycles/js-lib/array'
import { localTime } from '@naturalcycles/js-lib/datetime'
import { _stringMapValues } from '@naturalcycles/js-lib/types'
import type { IsoDate, StringMap, UnixTimestamp } from '@naturalcycles/js-lib/types'
import { batch, computed, effect, signal } from '@preact/signals'
import type { UserInfo } from '#src/srv/firebase.service.js'
import { isCanonicalSemverTag } from '#src/srv/model.js'
import type {
  BackendResponse,
  FeedOptions,
  Release,
  ReleasesByDay,
  Repo,
  UserFM,
} from '#src/srv/model.js'

export type StoreUser = UserInfo & { idToken?: string }

interface PersistedState {
  counter: number
  releases: StringMap<Release>
  starredRepos: Repo[]
  user: StoreUser
  feedOptions: FeedOptions
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
  feedOptions: signal<FeedOptions>(persisted.feedOptions ?? {}),
  /**
   * Repos (fullRepoNames) being unstarred right now. Their releases are hidden from the feed
   * optimistically, and come back if the unstar fails (see setRepoUnstarring).
   */
  unstarringRepos: signal<ReadonlySet<string>>(new Set()),
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

/**
 * Sets, for fast lookups by repoFullName (e.g when rendering every row).
 * userFM is not persisted, so they're empty until init() returns.
 */
export const hiddenRepoSet = computed(() => new Set(store.userFM.value.hiddenRepos))
export const favoriteRepoSet = computed(() => new Set(store.userFM.value.favoriteRepos))

/**
 * Releases shown in the feed. feedOptions are applied here too (not only by the Backend), as the
 * store can still have releases they exclude: fetched before the repo was hidden (e.g on another
 * device), or with other feedOptions. This also makes narrowing the feed instant (no reload).
 * Releases of repos being unstarred are excluded too (optimistically).
 */
export const feedReleases = computed((): Release[] => {
  const releases = _stringMapValues(store.releases.value)
  const { showHidden, semverOnly } = store.feedOptions.value
  const hidden: ReadonlySet<string> = showHidden ? new Set() : hiddenRepoSet.value
  const unstarring = store.unstarringRepos.value
  if (!hidden.size && !unstarring.size && !semverOnly) return releases
  return releases.filter(
    r =>
      !hidden.has(r.repoFullName) &&
      !unstarring.has(r.repoFullName) &&
      (!semverOnly || isCanonicalSemverTag(r.tagName)),
  )
})

export const releasesByDay = computed((): ReleasesByDay => {
  const m: ReleasesByDay = {}
  feedReleases.value.forEach(r => {
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
  return (
    _minOrUndefined(
      (_stringMapValues(store.releases.value) || []).map(r => localTime(r.published).toISODate()),
    ) || null
  )
})

export const showScanningResumed = computed(
  (): boolean =>
    !!store.scanningResumedAt.value &&
    store.scanningResumedAt.value > (store.scanningResumedDismissedAt.value || 0),
)

export const releasesCount = computed((): number => feedReleases.value.length)

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

/**
 * Optimistic unstar: hides the repo's releases from the feed while the unstar request is in flight.
 * They're kept in the store (and only removed from it on success, see removeRepoReleases), so
 * un-marking brings them back, and a reload in the meantime can't bring them back too early.
 */
export function setRepoUnstarring(repoFullName: string, unstarring: boolean): void {
  const repos = new Set(store.unstarringRepos.value)
  if (unstarring) {
    repos.add(repoFullName)
  } else {
    repos.delete(repoFullName)
  }
  store.unstarringRepos.value = repos
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
    store.feedOptions.value = {}
    store.unstarringRepos.value = new Set()
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

// Persistence: replaces Pinia $subscribe. The effect re-runs whenever one of the six signals changes.
let previousState = ''
effect(() => {
  const state: PersistedState = {
    counter: store.counter.value,
    releases: store.releases.value,
    starredRepos: store.starredRepos.value,
    user: store.user.value,
    feedOptions: store.feedOptions.value,
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
