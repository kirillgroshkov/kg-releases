<template>
  <pre v-if="loading">{{loading}}</pre>
  <div v-else>
    <div class="container">
      <div class="row">
        <div class="col">
          <pre>
Last updated: {{resp.lastCheckedReleases | unixtimePretty}}
Starred repos: {{resp.starredRepos}}
Rate limit remaining: {{resp.rateLimit.remaining}}
Rate limit reset: {{resp.rateLimit.reset | unixtimePretty}}
          </pre>
        </div>
      </div>

      <template v-for="r in resp.releases">
        <div class="row titleRow">
          <div class="col">
            <h1>
              <img :src="r.avatarUrl" width="80" height="80" class="img-thumbnail">
              <a :href="`https://github.com/${r.repoFullName}`" target="_blank">{{r.repoFullName}}</a>
              @
              <a :href="`https://github.com/${r.repoFullName}/releases/tag/${r.tagName || 'v' + r.v}`" target="_blank">{{r.v}}</a>
            </h1>
          </div>
        </div>

        <div class="row timeRow">
          <div class="col">
            {{r.published | unixtimePretty}} ({{r.published | timeAgo}} ago) {{r.name}}
          </div>
        </div>
        <div class="row descrRow">
          <div class="col" v-html="r.descr" style="padding-top: 20px; padding-bottom: 30px;">

          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { FeedResp, Release, releasesService } from "../srv/releases.service"

@Component
export default class RootComponent extends Vue {
  loading = 'loading...'
  resp: FeedResp = false as any

  async mounted () {
    this.loading = 'loading...'
    const r = await releasesService.fetchReleases()
    this.resp = r
    this.loading = ''
  }
}
</script>

<style lang="scss" scoped>
  @import "../scss/var";

  @include media-breakpoint-down(sm) {
    .titleRow h1 {
      // color: pink;
      font-size: 24px;
    }
    .titleRow img {
      width: 40px; height: 40px;
    }
  }

  @include media-breakpoint-down(xs) {
    .titleRow h1 {
      // color: pink;
      font-size: 18px;
    }
    .titleRow img {
      width: 40px; height: 40px;
    }

    .descrRow {
      font-size: 15px;
    }
  }

</style>
