<script setup lang="ts">
import { onMounted } from 'vue'
import { withProgress } from '#src/decorators/decorators.js'
import { router } from '#src/router.js'
import { githubStarsService } from '#src/srv/githubStars.service.js'

// Read the query once and remove it from the URL, to not leak OAuth `code` (e.g to Sentry breadcrumbs)
const query = new URLSearchParams(location.search)
history.replaceState(history.state, '', location.pathname)

onMounted(async () => {
  await withProgress(async () => {
    await githubStarsService.onCallback(query)
  })
  await router.replace('/releases')
})
</script>

<template>
  <div style="padding: 16px">Connecting GitHub...</div>
</template>
