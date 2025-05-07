import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  define: {
    __SENTRY_DEBUG__: false,
    __SENTRY_TRACING__: false,
    __RRWEB_EXCLUDE_IFRAME__: true,
    __RRWEB_EXCLUDE_SHADOW_DOM__: true,
    __SENTRY_EXCLUDE_REPLAY_WORKER__: true,
  },
  plugins: [
    vue(),
    vuetify(),
    visualizer({
      template: 'flamegraph',
      filename: 'dist/stats.html',
      gzipSize: true,
      sourcemap: true,
    }),
  ],
  build: {
    sourcemap: true,
  },
  resolve: {
    alias: {
      '@': `${import.meta.dirname}/src`,
    },
  },
})
