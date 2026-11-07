import { localDate } from '@naturalcycles/js-lib/datetime'
import type { IsoDate, UnixTimestamp } from '@naturalcycles/js-lib/types'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Release } from '#src/srv/model.js'

// In-memory localStorage, stubbed before the store module is imported: the module reads it at
// import time, and the persistence effect writes to it on every change
const ls = new Map<string, string>()
const localStorageMock = {
  getItem: (k: string): string | null => ls.get(k) ?? null,
  setItem: (k: string, v: string): void => void ls.set(k, v),
  removeItem: (k: string): void => void ls.delete(k),
  clear: (): void => ls.clear(),
}
vi.stubGlobal('localStorage', localStorageMock)

const {
  store,
  addReleases,
  removeRepoReleases,
  cleanAfterLastDay,
  onBackendResponse,
  dismissScanningResumed,
  resetStore,
  releasesByDay,
  releasesLastDay,
  releasesCount,
  showScanningResumed,
} = await import('#src/store.js')

// `hour` is in UTC: localDate.unix is the 00:00:00 UTC of that day
const ts = (isoDay: string, hour = 12): UnixTimestamp =>
  (localDate(isoDay as IsoDate).unix + hour * 3600) as UnixTimestamp

function release(id: string, repoFullName: string, published: UnixTimestamp): Release {
  return { id, repoFullName, published, v: '1.0.0', tagName: 'v1.0.0', descrHtml: '', author: 'a' }
}

const a1 = release('a_1', 'org/a', ts('2026-10-25', 10))
const a2 = release('a_2', 'org/a', ts('2026-10-25', 14))
const b1 = release('b_1', 'org/b', ts('2026-10-24'))
const c1 = release('c_1', 'org/c', ts('2026-10-20'))

beforeEach(() => {
  // dev-lib's vitest config unstubs globals before each test
  vi.stubGlobal('localStorage', localStorageMock)
  ls.clear()
  resetStore()
})

describe('releases actions', () => {
  it('should merge by id in addReleases', () => {
    addReleases([a1, b1])
    addReleases([{ ...a1, tagName: 'v1.0.1' }, c1])
    expect(Object.keys(store.releases.value).sort()).toEqual(['a_1', 'b_1', 'c_1'])
    expect(store.releases.value['a_1']!.tagName).toBe('v1.0.1')
    expect(releasesCount.value).toBe(3)
  })

  it('should be a no-op when addReleases has no arguments', () => {
    addReleases()
    expect(store.releases.value).toEqual({})
  })

  it('should remove only that repo in removeRepoReleases', () => {
    addReleases([a1, a2, b1])
    removeRepoReleases('org/a')
    expect(Object.keys(store.releases.value)).toEqual(['b_1'])
  })

  it('should keep releases with day >= lastDay in cleanAfterLastDay', () => {
    addReleases([a1, b1, c1])
    cleanAfterLastDay('2026-10-24')
    expect(Object.keys(store.releases.value).sort()).toEqual(['a_1', 'b_1'])
  })
})

describe('derived values', () => {
  it('should group releasesByDay by day, newest first within each day', () => {
    addReleases([a1, b1, a2])
    expect(Object.keys(releasesByDay.value).sort()).toEqual(['2026-10-24', '2026-10-25'])
    expect(releasesByDay.value['2026-10-25' as IsoDate]!.map(r => r.id)).toEqual(['a_2', 'a_1'])
  })

  it('should return the earliest day as releasesLastDay, or null when empty', () => {
    expect(releasesLastDay.value).toBeNull()
    addReleases([a1, c1, b1])
    expect(releasesLastDay.value).toBe('2026-10-20')
  })

  it('should show scanningResumed until dismissed', () => {
    expect(showScanningResumed.value).toBe(false)
    onBackendResponse({ scanningResumedAt: ts('2026-10-01') })
    expect(showScanningResumed.value).toBe(true)
    dismissScanningResumed()
    expect(showScanningResumed.value).toBe(false)
  })

  it('should apply only the fields present in onBackendResponse', () => {
    onBackendResponse({ releasesUpdaterLastFinished: ts('2026-10-25') })
    expect(store.releasesUpdaterLastFinished.value).toBe(ts('2026-10-25'))
    expect(store.userFM.value).toEqual({ settings: {} })
    onBackendResponse()
    expect(store.releasesUpdaterLastFinished.value).toBe(ts('2026-10-25'))
  })
})

describe('persistence', () => {
  it('should write exactly the persisted keys under "state"', () => {
    store.counter.value = 5
    const persisted = JSON.parse(ls.get('state')!)
    expect(Object.keys(persisted)).toEqual(['counter', 'releases', 'starredRepos', 'user'])
    expect(persisted.counter).toBe(5)

    dismissScanningResumed()
    expect(Object.keys(JSON.parse(ls.get('state')!))).toEqual([
      'counter',
      'releases',
      'starredRepos',
      'user',
      'scanningResumedDismissedAt',
    ])
  })

  it('should not write when non-persisted fields change', () => {
    store.counter.value = 7
    const before = ls.get('state')
    store.ghostMode.value = true
    store.userFM.value = { settings: {} } as any
    expect(ls.get('state')).toBe(before)
  })
})
