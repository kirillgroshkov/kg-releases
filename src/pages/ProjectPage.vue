<script setup lang="ts">
import { pDelay } from '@naturalcycles/js-lib'
import { computed, onMounted, ref } from 'vue'
import type { Release } from '@/srv/model'
import { releasesService } from '@/srv/releases.service'

const releases = ref<Release[] | null>(null)

const fullName = computed(() => {
  // const p = router.currentRoute.params
  // return [p['ownerName'], p['projectName']].join('/')
  return ''
})

onMounted(async () => {
  await pDelay(500) // give time for animations to finish
  releases.value = await releasesService.getReleasesByRepo(fullName.value)
  console.log('releases:', [...releases.value])
})

async function fetchFromGithub(): Promise<void> {
  releases.value = await releasesService.fetchReleasesByRepo(fullName.value)
  console.log('releases:', [...releases.value])
}
</script>

<template>
  <div>
    <div>
      Project {{ fullName }}
      <a :href="`https://github.com/${fullName}`" target="_blank">github</a>
    </div>
    <div>
      <md-button class="md-raised md-primary" @click="fetchFromGithub()">
        Fetch from github
      </md-button>
    </div>
    <div v-if="releases">
      {{ releases.length }}
    </div>
    <div v-for="r of releases" :key="r.id">{{ r.id }} / {{ r.published }}</div>
  </div>
</template>

<style lang="scss" scoped></style>
