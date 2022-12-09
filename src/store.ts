import {
  StringMap,
  _by,
  _pick,
  _stringMapValues,
  localTime,
  _deepCopy,
  _sortBy,
  IsoDateString,
} from '@naturalcycles/js-lib'
import { defineStore } from 'pinia'
import { BackendResponse, Release, ReleasesByDay, Repo, UserFM } from '@/srv/model'
import { UserInfo } from '@/srv/firebase.service'

export interface GlobalState {
  counter: number
  user: UserInfo & { idToken?: string }
  userFM: UserFM
  ghostMode: boolean
  releasesUpdaterLastFinished?: number
  // rateLimit: RateLimit
  lastStarred: string[]
  // starredReposNumber: number
  releases: StringMap<Release>
  starredRepos: Repo[]
}

function getInitialState(): GlobalState {
  return {
    counter: 0,
    user: {} as any,
    userFM: {
      settings: {},
    } as any,
    ghostMode: false,
    // rateLimit: {} as any,
    // starredReposNumber: 0,
    releases: {},
    lastStarred: [],
    starredRepos: [],
  }
}

const persistKeys: (keyof GlobalState)[] = ['counter', 'releases', 'starredRepos']

const LS_ID = 'state'

export const useStore = defineStore('main', {
  state: () => {
    const state: GlobalState = {
      ...getInitialState(),
      ...JSON.parse(localStorage.getItem(LS_ID) || '{}'),
    }

    return state
  },

  getters: {
    getReleasesByDay: state => (): ReleasesByDay => {
      const m: ReleasesByDay = {}
      _stringMapValues(state.releases).forEach(r => {
        const day = localTime(r.published).toISODate()
        m[day] ||= []
        m[day]!.push(r)
      })

      // sort
      Object.values(m).forEach(releases => _sortBy(releases, r => r.published, true, true))

      return m
    },

    getReleasesLastDay: state => (): IsoDateString | null => {
      const days = (_stringMapValues(state.releases) || [])
        .map(r => localTime(r.published).toISODate())
        .sort()
      return days[0] || null
    },

    getReleasesCount: state => (): number => {
      return Object.keys(state.releases).length
    },
  },

  actions: {
    reset() {
      Object.assign(this, getInitialState())
    },

    setUser(uid: string): void {
      this.user = {
        ...this.user,
        uid,
      }
    },

    addReleases(releases: Release[] = []): void {
      this.releases = {
        ...this.releases,
        ..._by(releases, r => r.id),
      }
    },

    cleanAfterLastDay(lastDay: string): void {
      const releases: { [id: string]: Release } = {}

      _stringMapValues(this.releases).forEach(r => {
        const day = localTime(r.published).toISODate()
        if (day >= lastDay) {
          // include, otherwise exclude
          releases[r.id] = r
        }
      })

      this.releases = releases
    },

    onBackendResponse(br: BackendResponse = {}): void {
      console.log('onBackendResponse', br)
      const { userFM, releasesUpdaterLastFinished } = br

      if (userFM) {
        this.userFM = userFM
      }

      if (releasesUpdaterLastFinished) {
        this.releasesUpdaterLastFinished = releasesUpdaterLastFinished
      }
    },
  },
})

let previousState = ''

export function initStore(): void {
  const store = useStore()
  store.$subscribe((mutation, state) => {
    const newState = JSON.stringify(_pick(state, persistKeys))
    if (newState === previousState) return
    previousState = newState
    localStorage.setItem(LS_ID, newState)
    console.log('state >> ls')
  })
  ;(globalThis as any)['state'] = () => console.log(_deepCopy(store.$state))
}
