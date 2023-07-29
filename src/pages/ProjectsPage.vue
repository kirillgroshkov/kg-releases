<script setup lang="ts">
import { pDelay } from '@naturalcycles/js-lib'
import { onMounted } from 'vue'
import { useStore } from '@/store'
import { releasesService } from '@/srv/releases.service'

const store = useStore()

onMounted(async () => {
  await pDelay(1000) // give time for animations to finish
  await releasesService.fetchRepos()
})
</script>

<template>
  <div>
    <div>Projects</div>
    <div v-for="r of store.starredRepos" :key="r.fullName">
      <router-link :to="`/projects/${r.fullName}`">
        {{ r.fullName }}
      </router-link>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
