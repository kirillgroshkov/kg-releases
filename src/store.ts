import { env } from '@/environment/environment'
import { UserInfo } from '@/srv/firebase.service'
import { FeedResp, RateLimit, Release, ReleasesByDay, Repo } from '@/srv/releases.service'
import { by, objectUtil } from '@/util/object.util'
import { timeUtil } from '@/util/time.util'
import { urlUtil } from '@/util/url.util'
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export interface GlobalState {
  counter: number
  user: UserInfo
  ghostMode: boolean
  lastCheckedReleases: number
  rateLimit: RateLimit
  lastStarred: string[]
  starredReposNumber: number
  releases: { [id: string]: Release }
  starredRepos: Repo[]
}

const DEF_STATE: GlobalState = {
  counter: 0,
  user: {} as any,
  ghostMode: false,
  lastCheckedReleases: 0,
  rateLimit: {} as any,
  starredReposNumber: 0,
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

export const store = new Vuex.Store<GlobalState>({
  strict: env().dev,
  state: initialState,

  getters: {
    getReleasesByDay: (state: GlobalState) => (): ReleasesByDay => {
      const m: ReleasesByDay = {}
      Object.values(state.releases).forEach(r => {
        const day = timeUtil.unixtimeToDay(r.published)
        if (!m[day]) m[day] = []
        m[day].push(r)
      })

      return m
    },

    getReleasesLastDay: (state: GlobalState) => (): string | undefined => {
      const days = (Object.values(state.releases) || []).map(r => timeUtil.unixtimeToDay(r.published)).sort()
      return days.length ? days[0] : undefined
    },

    getReleasesCount: (state: GlobalState) => (): number => {
      return Object.keys(state.releases).length
    },
  },

  mutations: {
    extendState (state: GlobalState, extension: Partial<GlobalState>): void {
      Object.assign(state, extension)
    },

    reset (state: GlobalState): void {
      Object.assign(state, DEF_STATE)
    },

    setGhost (state: GlobalState, ghostMode = true): void {
      Object.assign(state, { ghostMode })
    },

    setUser (state: GlobalState, uid: string): void {
      state.user = {
        ...state.user,
        uid,
      }
    },

    addReleases (state: GlobalState, releases: Release[] = []): void {
      state.releases = {
        ...state.releases,
        ...by(releases, 'id'),
      }
    },

    cleanAfterLastDay (state: GlobalState, lastDay: string): void {
      const releases: { [id: string]: Release } = {}

      Object.values(state.releases).forEach(r => {
        const day = timeUtil.unixtimeToDay(r.published)
        if (day >= lastDay) {
          // include, otherwise exclude
          releases[r.id] = r
        }
      })

      state.releases = releases
    },
  },
})

// Shortcut function to get State, properly typed
export function st (): GlobalState {
  return store.state
}

// Shortcut
export function commit (payload: Partial<GlobalState>): void {
  store.commit('extendState', payload)
}

// Persist
store.subscribe((m, state) => {
  // console.log('>>', m, JSON.stringify(state))
  localStorage.setItem('state', JSON.stringify(objectUtil.pick(state, PERSIST)))
})
