<template>
  <div>
    <div class="nav1">
      <div class="container">
        <div class="row">
          <div class="col nav1__col">
            <a class="nav1__menuItem" href="/">Releases</a>
            <a class="nav1__menuItem" href="/">Projects</a>
          </div>
        </div>
      </div>
    </div>

    <div class="cont1">
      <router-view></router-view>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'

@Component
export default class LayoutComponent extends Vue {

  async mounted () {
    // this.loading = 'loading...'
    // await releasesService.fetchReleases()
    // this.loading = ''
  }
}
</script>

<style lang="scss" scoped>
  // @import "../scss/var";

  $navbarHeight: 40px;
  $menuItemPadding: 10px;

  .nav1 {
    position: fixed;
    z-index: 100;
    width: 100%;
    height: $navbarHeight;
    background-color: rgba(200, 200, 200, 0.95);
  }

  .nav1__col {
    margin: 0 (-$menuItemPadding);
  }

  .nav1__menuItem {
    display: inline-block;
    line-height: $navbarHeight;
    padding: 0 $menuItemPadding;

  }

  .cont1 {
    padding-top: $navbarHeight;
  }
</style>
