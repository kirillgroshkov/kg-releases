import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export interface State {
  counter: number
}

export const store = new Vuex.Store<State>({
  state: {
    counter: 0,
  },

  getters: {

  },

  mutations: {

  },
})
