<template>
  <div>
    <!--
    <nav class="navbar navbar-expand-sm navbar-light bg-light">
      <a class="navbar-brand" href="#">Navbar</a>
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav mr-auto">
          <li class="nav-item active">
            <a class="nav-link" href="#">Home <span class="sr-only">(current)</span></a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#">Link</a>
          </li>
        </ul>
      </div>
    </nav>
    -->

    <div>
      <div class="container releases">
        <div class="row" v-if="feedResp.rateLimit">
          <div class="col">
            <pre>
Last updated: {{feedResp.lastCheckedReleases | unixtimePretty}}
Starred repos: {{feedResp.starredRepos}}
Rate limit remaining: {{feedResp.rateLimit.remaining}}
Rate limit reset: {{feedResp.rateLimit.reset | unixtimePretty}}
            </pre>
          </div>
        </div>

        <template v-for="r in feedResp.releases">
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
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { FeedResp } from "../srv/releases.service"

@Component
export default class ReleasesPage extends Vue {
  get feedResp (): FeedResp {
    return this.$store.state.feedResp
  }

  async mounted () {
    // this.loading = 'loading...'
    // await releasesService.fetchReleases()
    // this.loading = ''
  }
}
</script>

<style lang="scss" scoped>
  @import "../scss/var";

  .releases {
    padding-top: 20px;
  }

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
