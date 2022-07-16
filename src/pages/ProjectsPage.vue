<script setup lang="ts">
import { pDelay } from '@naturalcycles/js-lib'
import { computed, onMounted } from 'vue'
import { releasesService } from '@/srv/releases.service'
import { st } from '@/store'

const starredRepos = computed(() => st().starredRepos)

onMounted(async () => {
  await pDelay(1000) // give time for animations to finish
  await releasesService.fetchRepos()
})
</script>

<template>
  <div>
    <div>Projects</div>
    <div v-for="r in starredRepos" :key="r.fullName">
      <router-link :to="`/projects/${r.fullName}`">
        {{ r.fullName }}
      </router-link>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
