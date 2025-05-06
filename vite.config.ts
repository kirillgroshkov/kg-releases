import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import { visualizer } from 'rollup-plugin-visualizer'
import replace from '@rollup/plugin-replace'

export default defineConfig({
  plugins: [
    vue(),
    vuetify(),
    replace({
      preventAssignment: true,
      __SENTRY_DEBUG__: false,
      __SENTRY_TRACING__: false,
      __RRWEB_EXCLUDE_IFRAME__: true,
      __RRWEB_EXCLUDE_SHADOW_DOM__: true,
      __SENTRY_EXCLUDE_REPLAY_WORKER__: true,
    }),
    visualizer({
      template: 'flamegraph',
      filename: 'dist/stats.html',
      gzipSize: true,
    }),
  ],

  resolve: {
    alias: {
      '@': `${import.meta.dirname}/src`,
    },
  },
})
