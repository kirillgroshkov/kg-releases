<template>
  <div class="form1">
    <md-field>
      <label>User ID</label>
      <md-input v-model="userFM.id" disabled></md-input>
    </md-field>

    <md-field>
      <label>Email for notifications</label>
      <md-input v-model="settings.notificationEmail" type="email" required></md-input>
    </md-field>

    <md-checkbox v-model="settings.notifyEmailRealtime">Notify on every release</md-checkbox><br />
    <md-checkbox v-model="settings.notifyEmailDaily">Notify once a day</md-checkbox><br />
    <p>
      Please check your SPAM folder and add our sending email address (noreply@inventix.ru) to your
      Contacts if you discover that it goes to SPAM folder.
    </p>

    <p>To unsubscribe - untick the boxes above and click save.</p>

    <md-button class="md-raised md-primary" @click="save()" :disabled="!saveEnabled">Save</md-button
    ><br />

    <br />
    <hr />
    <br />

    <md-button class="md-raised md-transparent" @click="logout()">Logout</md-button>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { Progress } from '../decorators/progress.decorator'
import { router } from '../router'
import { analyticsService } from '../srv/analytics.service'
import { firebaseService } from '../srv/firebase.service'
import { releasesService, UserFM, UserSettings } from '../srv/releases.service'
import { st } from '../store'
import { jsonify, objectUtil } from '../util/object.util'

@Component
export default class SettingsPage extends Vue {
  notificationEmail = ''
  a = ''

  // userFM: UserFM = {} as UserFM
  settings: UserSettings = {}

  get userFM() {
    return st().userFM
  }

  get saveEnabled(): boolean {
    return !objectUtil.deepEquals(this.settings, st().userFM.settings)
  }

  private init() {
    this.settings = { ...st().userFM.settings }
  }

  async mounted() {
    await releasesService.init()
    this.init()
  }
  // mount / enter > set notificationEmail

  // Save button (if changed!)

  async logout() {
    analyticsService.event('logoutClick')
    await firebaseService.logout()
    router.push('/')
  }

  @Progress()
  async save() {
    await releasesService.saveUserSettings(this.settings)
    this.init()
  }
}
</script>

<style lang="scss" scoped>
.form1 {
  max-width: 400px;
}
</style>
