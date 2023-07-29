<script setup lang="ts">
import { useStore } from '@/store'

const store = useStore()
</script>

<template>
  <div>
    <div class="page-container">
      <v-app>
        <v-app-bar v-if="store.user.uid" color="primary" density="compact">
          <v-btn to="/releases">Releases</v-btn>
          <v-btn to="/settings">Settings</v-btn>

          <v-spacer></v-spacer>

          <v-avatar
            v-if="store.user.photoURL"
            color="grey"
            class="elevation-1"
            style="margin-right: 8px"
          >
            <img class="avatar" :src="store.user.photoURL" alt="user.displayName" loading="lazy" />
          </v-avatar>
        </v-app-bar>

        <v-main>
          <router-view />
        </v-main>
      </v-app>
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
    </div> -->
  </div>
</template>

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
  width: 40px;
  height: 40px;
}
.md-avatar {
  // border: 1px solid black;
}
</style>
