import { env } from '@/environment/environment'
import { FeedResp } from '@/srv/releases.service'
import { objectUtil } from '@/util/object.util'
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export interface GlobalState {
  counter: number
  ghostMode: boolean
  feedResp: FeedResp
}

const DEF_STATE: GlobalState = {
  counter: 0,
  ghostMode: false,
  feedResp: {
    rateLimit: {} as any,
    starredRepos: 0,
    releases: [],
    lastStarred: [],
  },
}

const PERSIST: string[] = [
  'counter',
  'feedResp',
]

const initialState: GlobalState = localStorage.getItem('state')
  ? JSON.parse(localStorage.getItem('state')!)
  : DEF_STATE

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
      Object.assign(state, {ghostMode})
    },
  },
})

// Persist
store.subscribe((m, state) => {
  // console.log('>>', m, JSON.stringify(state))
  localStorage.setItem('state', JSON.stringify(objectUtil.pick(state, PERSIST)))
})
