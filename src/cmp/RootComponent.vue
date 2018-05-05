<template>
  <div>
    <vue-progress-bar></vue-progress-bar>

    <LayoutComponent></LayoutComponent>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import LayoutComponent from '@/cmp/LayoutComponent.vue'

@Component({
  components: {
    LayoutComponent,
  },
})
export default class RootComponent extends Vue {
  async mounted () {
    // this.loading = 'loading...'
    // await releasesService.fetchReleases()
    // this.loading = ''
  }
}
</script>
