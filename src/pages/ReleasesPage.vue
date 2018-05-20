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

        <div class="tableRow" style="margin: 0 -16px;">
          <table border="0" cellspacing="0" cellpadding="6" style="width: 100% !important; max-width: 500px; table-layout: fixed; background-color1: pink">
            <template v-for="r in feedResp.releases">
              <tr class="mainTr" @click="toggleClick(r.id)">
                <td style="width: 66px; padding: 10px 0 10px 12px; vertical-align: top;">
                  <img :src="r.avatarUrl" style="width: 40px; height: 40px;">
                </td>
                <td style="vertical-align: top; padding: 8px 0 0;">
                  {{r.repoFullName}}<br>
                  <span class="ver">{{r.v}}</span>
                </td>
                <td style="width: 80px; text-align: right; vertical-align: top; padding-top: 7px;">
                  {{r.published | timeHM}}
                  <md-icon style="opacity: 0.4" v-if="expandedRow === r.id">expand_less</md-icon>
                  <md-icon style="opacity: 0.4" v-else>expand_more</md-icon>
                </td>
              </tr>

              <transition name="slide">
                <tr v-if="expandedRow === r.id" @click="toggleClick(r.id)">
                  <td colspan="3" style="padding: 0 10px 10px 16px; word-wrap: break-word;">
                    <div>
                      <md-button
                        class="md-dense md-primary1 md-raised"
                        style="margin-left: -4px; margin-top: 10px;"
                        :href="`https://github.com/${r.repoFullName}/releases/tag/${r.tagName || 'v' + r.v}`" target="_blank"
                      >
                        view on github
                      </md-button>
                    </div>

                    <div class="md" v-html="r.descr"></div>
                  </td>
                </tr>
              </transition>
            </template>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { DateTime } from 'luxon';
import Vue from 'vue'
import Component from 'vue-class-component'
import { FeedResp, releasesService } from "../srv/releases.service"
import { st } from '../store'
import { promiseUtil } from '../util/promise.util';
import { LUXON_ISO_DATE_FORMAT } from '../util/time.util';

@Component
export default class ReleasesPage extends Vue {
  expandedRow?: string = ''

  get feedResp (): FeedResp {
    return st().feedResp
  }

  get days(): string[] {
    return [
      DateTime.local(),
      DateTime.local().minus({days: 1}),
      DateTime.local().minus({days: 2}),
    ].map(dt => dt.toFormat(LUXON_ISO_DATE_FORMAT))
  }

  async mounted () {
    // this.loading = 'loading...'
    await promiseUtil.delay(1000) // give time for animations to finish
    await releasesService.fetchReleases()
    // this.loading = ''
  }

  toggleClick (id: string) {
    if (this.expandedRow === id) {
      this.expandedRow = ''
    } else {
      this.expandedRow = id
    }

  }
}
</script>

<style lang="scss" scoped>
  @import "../scss/var";

  .releases {
    // padding-top: 20px;
  }

  .ver {
    font-family: "Courier New";
    font-size: 12px;
    font-weight: bold;
    color: #888;
    line-height: 1;
  }

  .mainTr {
    transition: all .3s ease-out;

    #{$active} {
      background-color: rgba(0, 0, 0, 0.05);
      cursor: pointer;
      transition: all .1s ease-in;
    }
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
