<template>
  <div>
    <div>Projects</div>
    <div v-for="r in starredRepos" :key="r.fullName">
      <router-link :to="`/projects/${r.fullName}`">{{r.fullName}}</router-link>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { releasesService, Repo } from '../srv/releases.service'
import { GlobalState, st, store } from '../store'
import { promiseUtil } from '../util/promise.util'

@Component
export default class ProjectsPage extends Vue {
  get starredRepos (): Repo[] {
    return st().starredRepos
  }

  async mounted () {
    await promiseUtil.delay(1000) // give time for animations to finish
    await releasesService.fetchRepos()
  }
}
</script>

<style lang="scss" scoped>

</style>
