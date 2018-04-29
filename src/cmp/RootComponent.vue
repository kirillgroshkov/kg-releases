<template>
  <pre v-if="loading">{{loading}}</pre>
  <div v-else>
    <table border="1" cellpadding="10" cellspacing="0">
      <tr v-for="r in releases" :key="r.id">
        <td><img :src="r.avatarUrl" width="40" height="40"></td>
        <td>
          <a :href="`https://github.com/${r.repoFullName}`" target="_blank">{{r.repoFullName}}</a>
          @
          <a :href="`https://github.com/${r.repoFullName}/releases/tag/${r.tagName || 'v' + r.v}`" target="_blank">{{r.v}}</a><br>
          {{r.published | unixtimePretty}}<br>
          {{r.published | timeAgo}} ago
        </td>
        <td v-html="r.descr"></td>
      </tr>
    </table>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { Release, releasesService } from "../srv/releases.service"

@Component
export default class RootComponent extends Vue {
  loading = 'loading...'
  releases: Release[] = false as any

  async mounted () {
    this.loading = 'loading...'
    const r = await releasesService.fetchReleases()
    this.releases = r
    this.loading = ''
  }
}
</script>

<style lang="scss" scoped>

</style>
