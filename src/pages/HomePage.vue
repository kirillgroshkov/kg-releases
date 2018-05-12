<template>
  <div>
    <md-button class="md-raised md-primary" @click="login()">Login</md-button>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { router } from '../router';
import { firebaseService } from '../srv/firebase.service'
import { releasesService } from '../srv/releases.service';

@Component
export default class HomePage extends Vue {
  async login () {
    const authResp = await firebaseService.login()
    if (authResp.newUser) {
      alert('newUser intro!')
    }
    router.push('/releases')
  }

}
</script>

<style lang="scss" scoped>

</style>
