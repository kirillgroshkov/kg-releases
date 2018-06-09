<template>
  <div>
    <div class="page-container">
      <md-app md-waterfall1 md-mode="fixed">
        <md-app-toolbar class="md-primary" v-if="user.uid">
          <!--
          <span class="md-title">My Title</span>
          -->

          <div class="md-toolbar-row">
            <div class="md-toolbar-section-start">
              <!--
              <md-button class="md-icon-button">
                <md-icon>menu</md-icon>
              </md-button>
              -->

              <md-tabs class="md-primary" style="flex: 4">
                <!--
                <md-tab md-label="Home" to="/" exact="true"></md-tab>
                -->
                <md-tab md-label="Releases" to="/releases"></md-tab>
                <md-tab md-label="Projects" to="/projects" v-if="false"></md-tab>
                <md-tab md-label="Settings" to="/settings"></md-tab>
              </md-tabs>
            </div>

            <div class="md-toolbar-section-end" style="flex: 0">
              <md-avatar v-if="user.uid" class="md-elevation-1">
                <img class="avatar" :src="user.photoURL" alt="user.displayName">
              </md-avatar>
            </div>
          </div>
        </md-app-toolbar>

        <md-app-content>
          <router-view></router-view>
        </md-app-content>
      </md-app>
    </div>


    <!--
    <div class="nav1">
      <div class="container">
        <div class="row">
          <div class="col nav1__col">
            <a class="nav1__menuItem" href="/">Releases</a>
            <a class="nav1__menuItem" href="/">Projects</a>
          </div>
        </div>
      </div>
    </div>

    <div class="cont1">
      <router-view></router-view>
    </div>-->
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { UserInfo } from '../srv/firebase.service'
import { st } from '../store'
import { jsonify } from '../util/object.util'

@Component
export default class LayoutComponent extends Vue {
  get user (): UserInfo {
    return st().user
  }

  async mounted () {
    // this.loading = 'loading...'
    // await releasesService.fetchReleases()
    // this.loading = ''
  }
}
</script>

<style lang="scss" scoped>
  // @import "../scss/var";

  /*.md-app-container {
    overflow-y: scroll;
    -webkit-overflow-scrolling: touch;
  }*/

  .md-app {
    // max-height: 400px;
    // min-height: 100vh;
    max-height: 100vh;
    // border: 1px solid rgba(#000, .12);
  }

  .avatar {
    // border: 10px solid black;
  }
  .md-avatar {
    // border: 1px solid black;
  }
</style>
