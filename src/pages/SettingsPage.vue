<script setup lang="ts">
import { _deepEquals } from '@naturalcycles/js-lib'
import { computed, onMounted, ref } from 'vue'
import { withProgress } from '@/decorators/decorators'
import { router } from '@/router'
import { analyticsService } from '@/srv/analytics.service'
import { firebaseService } from '@/srv/firebase.service'
import { UserSettings } from '@/srv/model'
import { releasesService } from '@/srv/releases.service'
import { useStore } from '@/store'

const store = useStore()
const settings = ref<UserSettings>({})

const saveEnabled = computed(() => !_deepEquals(settings.value, store.userFM.settings))

function init(): void {
  settings.value = { ...store.userFM.settings }
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
    <v-text-field v-model="store.userFM.id" label="User ID" disabled></v-text-field>

    <v-text-field
      v-model="settings.notificationEmail"
      style="margin-top: -10px"
      label="Email for notifications"
      type="email"
      required
    ></v-text-field>

    <!--
    <md-checkbox v-model="settings.notifyEmailRealtime">Notify on every release</md-checkbox><br />
    -->
    <v-checkbox
      v-model="settings.notifyEmailDaily"
      label="Notify once a day"
      style="margin-top: -20px"
    ></v-checkbox>

    <p style="margin-top: -20px">
      Please check your SPAM folder and add our sending email address (noreply@inventix.ru) to your
      Contacts if you discover that it goes to SPAM folder.
    </p>

    <p style="margin-bottom: 20px">To unsubscribe - untick the boxes above and click save.</p>

    <v-btn class="md-raised md-primary" :disabled="!saveEnabled" @click="save()">Save</v-btn><br />

    <br />
    <v-divider></v-divider>
    <br />

    <v-btn variant="flat" @click="logout()">Logout</v-btn>
  </div>
</template>

<style lang="scss" scoped>
.form1 {
  padding: 16px;
  max-width: 400px;
}

p {
  // font-size: 12px;
  margin: 12px 0;
}
</style>
