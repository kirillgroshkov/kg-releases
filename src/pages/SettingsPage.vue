<template>
  <div>
    <md-button class="md-raised md-primary" @click="logout()">Logout</md-button>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { router } from '../router';
import { firebaseService } from '../srv/firebase.service'

@Component
export default class SettingsPage extends Vue {
  async logout () {
    await firebaseService.logout()
    router.push('/')
  }
}
</script>

<style lang="scss" scoped>

</style>