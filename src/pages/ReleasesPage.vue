<template>
  <div>
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

        <table border="1" cellspacing="0" cellpadding="6">
          <tr v-for="r in feedResp.releases" :key="r.id">
            <td><img :src="r.avatarUrl" width="20" height="20"></td>
            <td>{{r.repoFullName}}</td>
            <td>{{r.v}}</td>
            <td>{{r.published | unixtimePretty}}</td>
          </tr>
        </table>

        <template v-for="r in feedResp.releases" v-if="false">
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
import { FeedResp, releasesService } from "../srv/releases.service"
import { st } from '../store'
import { promiseUtil } from '../util/promise.util';

@Component
export default class ReleasesPage extends Vue {
  get feedResp (): FeedResp {
    return st().feedResp
  }

  async mounted () {
    // this.loading = 'loading...'
    await promiseUtil.delay(1000) // give time for animations to finish
    await releasesService.fetchReleases()
    // this.loading = ''
  }
}
</script>

<style lang="scss" scoped>
  @import "../scss/var";

  .releases {
    // padding-top: 20px;
  }

  @media (max-width: 800px) {
    .titleRow h1 {
      // color: pink;
      font-size: 24px;
    }
    .titleRow img {
      width: 40px; height: 40px;
    }
  }

  @media (max-width: 500px) {
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
