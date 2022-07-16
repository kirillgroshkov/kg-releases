<script setup lang="ts">
import { _deepEquals } from '@naturalcycles/js-lib'
import { computed, onMounted, ref } from 'vue'
import { UserSettings } from '@/srv/model'
import { withProgress } from '@/decorators/decorators'
import { router } from '@/router'
import { analyticsService } from '@/srv/analytics.service'
import { firebaseService } from '@/srv/firebase.service'
import { releasesService } from '@/srv/releases.service'
import { st } from '@/store'

const settings = ref<UserSettings>({})

const userFM = computed(() => st().userFM)
const saveEnabled = computed(() => !_deepEquals(settings.value, st().userFM.settings))

function init(): void {
  settings.value = { ...st().userFM.settings }
}

onMounted(async () => {
  await releasesService.init()
  init()
})

async function logout(): Promise<void> {
  analyticsService.event('logoutClick')
  await firebaseService.logout()
  await router.push('/')
}

async function save(): Promise<void> {
  await withProgress(async () => {
    await releasesService.saveUserSettings(settings.value)
    init()
  })
}
</script>

<template>
  <div class="form1">
    <md-field>
      <label>User ID</label>
      <md-input v-model="userFM.id" disabled />
    </md-field>

    <md-field>
      <label>Email for notifications</label>
      <md-input v-model="settings.notificationEmail" type="email" required />
    </md-field>

    <!--
    <md-checkbox v-model="settings.notifyEmailRealtime">Notify on every release</md-checkbox><br />
    -->
    <md-checkbox v-model="settings.notifyEmailDaily"> Notify once a day </md-checkbox><br />
    <p>
      Please check your SPAM folder and add our sending email address (noreply@inventix.ru) to your
      Contacts if you discover that it goes to SPAM folder.
    </p>

    <p>To unsubscribe - untick the boxes above and click save.</p>

    <md-button class="md-raised md-primary" :disabled="!saveEnabled" @click="save()">
      Save </md-button
    ><br />

    <br />
    <hr />
    <br />

    <md-button class="md-raised md-transparent" @click="logout()"> Logout </md-button>
  </div>
</template>

<style lang="scss" scoped>
.form1 {
  max-width: 400px;
}
</style>
