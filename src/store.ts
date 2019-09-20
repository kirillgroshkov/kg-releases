import { env } from '@/environment/environment'
import { UserInfo } from '@/srv/firebase.service'
import { BackendResponse, Release, ReleasesByDay, Repo, UserFM } from '@/srv/model'
import { _pick, by } from '@naturalcycles/js-lib'
import { dayjs } from '@naturalcycles/time-lib'
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export interface GlobalState {
  counter: number
  user: UserInfo
  userFM: UserFM
  ghostMode: boolean
  releasesUpdaterLastFinished?: number
  // rateLimit: RateLimit
  lastStarred: string[]
  // starredReposNumber: number
  releases: { [id: string]: Release }
  starredRepos: Repo[]
}

const DEF_STATE: GlobalState = {
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

const PERSIST: string[] = [
  'counter',
  'releases',
  'starredRepos',
  // '',
]

const initialState: GlobalState = {
  ...DEF_STATE,
  ...JSON.parse(localStorage.getItem('state') || '{}'),
}

// const qs = urlUtil.qs()
// if (qs.testUid) initialState = {...DEF_STATE}

const releaseCompareDesc = (a: Release, b: Release) => b.published - a.published

export const store = new Vuex.Store<GlobalState>({
  strict: env().dev,
  state: initialState,

  getters: {
    getReleasesByDay: (state: GlobalState) => (): ReleasesByDay => {
      const m: ReleasesByDay = {}
      Object.values(state.releases).forEach(r => {
        const day = dayjs.unix(r.published).toISODate()
        if (!m[day]) m[day] = []
        m[day].push(r)
      })

      // sort
      Object.values(m).forEach(releases => releases.sort(releaseCompareDesc))

      return m
    },

    getReleasesLastDay: (state: GlobalState) => (): string | undefined => {
      const days = (Object.values(state.releases) || [])
        .map(r => dayjs.unix(r.published).toISODate())
        .sort()
      return days.length ? days[0] : undefined
    },

    getReleasesCount: (state: GlobalState) => (): number => {
      return Object.keys(state.releases).length
    },
  },

  mutations: {
    extendState(state: GlobalState, extension: Partial<GlobalState>): void {
      Object.assign(state, extension)
    },

    reset(state: GlobalState): void {
      Object.assign(state, DEF_STATE)
    },

    setGhost(state: GlobalState, ghostMode = true): void {
      Object.assign(state, { ghostMode })
    },

    setUser(state: GlobalState, uid: string): void {
      state.user = {
        ...state.user,
        uid,
      }
    },

    addReleases(state: GlobalState, releases: Release[] = []): void {
      state.releases = {
        ...state.releases,
        ...by(releases, r => r.id),
      }
    },

    cleanAfterLastDay(state: GlobalState, lastDay: string): void {
      const releases: { [id: string]: Release } = {}

      Object.values(state.releases).forEach(r => {
        const day = dayjs.unix(r.published).toISODate()
        if (day >= lastDay) {
          // include, otherwise exclude
          releases[r.id] = r
        }
      })

      state.releases = releases
    },

    onBackendResponse(state: GlobalState, br: BackendResponse = {}): void {
      console.log('onBackendResponse', br)
      const { userFM, releasesUpdaterLastFinished } = br

      if (userFM) {
        Object.assign(state, { userFM })
      }

      if (releasesUpdaterLastFinished) {
        Object.assign(state, { releasesUpdaterLastFinished })
      }
    },
  },
})

// Shortcut function to get State, properly typed
export function st(): GlobalState {
  return store.state
}

// Shortcut
export function extendState(payload: Partial<GlobalState>): void {
  store.commit('extendState', payload)
}

// Persist
store.subscribe((m, state) => {
  // console.log('>>', m, JSON.stringify(state))
  localStorage.setItem('state', JSON.stringify(_pick(state, PERSIST as any)))
})
