import { env } from '@/environment/environment'
import { UserInfo } from '@/srv/firebase.service'
import { FeedResp, Repo } from '@/srv/releases.service'
import { objectUtil } from '@/util/object.util'
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export interface GlobalState {
  counter: number
  user: UserInfo
  ghostMode: boolean
  feedResp: FeedResp
  starredRepos: Repo[]
}

const DEF_STATE: GlobalState = {
  counter: 0,
  user: {} as any,
  ghostMode: false,
  feedResp: {
    rateLimit: {} as any,
    starredRepos: 0,
    releases: [],
    lastStarred: [],
  },
  starredRepos: [],
}

const PERSIST: string[] = [
  'counter',
  'feedResp',
  'starredRepos',
  // '',
]

const initialState: GlobalState = {
  ...DEF_STATE,
  ...JSON.parse(localStorage.getItem('state') || '{}'),
}

export const store = new Vuex.Store<GlobalState>({
  strict: env().dev,
  state: initialState,

  getters: {},

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
