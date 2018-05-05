<template>
  <div>
    <md-button class="md-raised md-primary" @click="login()" :disabled="!!$store.state.user.uid">Login</md-button>
    <md-button class="md-raised md-primary" @click="logout()" :disabled="!$store.state.user.uid">Logout</md-button>
    <md-button class="md-raised md-primary" @click="auth()">Auth</md-button>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { firebaseService } from '../srv/firebase.service'
import { releasesService } from '../srv/releases.service';

@Component
export default class HomePage extends Vue {
  login (): void {
    firebaseService.login()
  }

  logout () {
    firebaseService.logout()
  }

  auth () {
    releasesService.auth()
  }
}
</script>

<style lang="scss" scoped>

</style>
