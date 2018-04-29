<template>
  <pre v-if="loading">{{loading}}</pre>
  <div v-else>
    <table border="1" cellpadding="10" cellspacing="0">
      <tr v-for="r in releases" :key="r.id">
        <td><img :src="r.avatarUrl" width="40" height="40"></td>
        <td>{{r.repoFullName}}@{{r.v}}</td>
        <td>{{r.published | timeAgo}} ago</td>
        <td>{{r.published | unixtimePretty}}</td>
      </tr>
    </table>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { apiService } from '../srv/api.service'
import { Release } from "../srv/releases.service";

@Component
export default class RootComponent extends Vue {
  loading = 'loading...'
  releases: Release[] = false as any

  async mounted () {
    this.loading = 'loading...'
    const r = await apiService.get<Release[]>('')
    this.releases = r
    this.loading = ''
  }
}
</script>

<style lang="scss" scoped>

</style>
