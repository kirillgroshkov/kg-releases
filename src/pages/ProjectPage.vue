<template>
  <div>
    <div>
      Project {{ fullName }}
      <a :href="`https://github.com/${fullName}`" target="_blank" rel="noopener">github</a>
    </div>
    <div>
      <md-button class="md-raised md-primary" @click="fetchFromGithub()"
        >Fetch from github</md-button
      >
    </div>
    <div v-if="releases">{{ releases.length }}</div>
    <div v-for="r in releases" :key="r.id">
      {{ r.id }} / {{ r.published | unixtimePretty }} / {{ r.created | unixtimePretty }}
    </div>
  </div>
</template>

<script lang="ts">
import { Release } from '@/srv/model'
import { pDelay } from '@naturalcycles/js-lib'
import Vue from 'vue'
import Component from 'vue-class-component'
import { releasesService } from '../srv/releases.service'

@Component
export default class ProjectPage extends Vue {
  releases: Release[] = false as any

  get fullName(): string {
    const p = this.$route.params
    return [p['ownerName'], p['projectName']].join('/')
  }

  async mounted() {
    await pDelay(500) // give time for animations to finish
    this.releases = await releasesService.getReleasesByRepo(this.fullName)
    console.log('releases: ', [...this.releases])
  }

  async fetchFromGithub() {
    this.releases = await releasesService.fetchReleasesByRepo(this.fullName)
    console.log('releases: ', [...this.releases])
  }
}
</script>

<style lang="scss" scoped></style>
