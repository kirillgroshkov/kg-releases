import prefresh from '@prefresh/vite'
import type { Plugin } from 'vite'
import { defineConfig } from 'vite'
// import { visualizer } from 'rollup-plugin-visualizer'
import { analyzer } from 'vite-bundle-analyzer'

// oxlint-disable-next-line import/no-default-export
export default defineConfig({
  define: {
    __SENTRY_DEBUG__: false,
    __SENTRY_TRACING__: false,
    __RRWEB_EXCLUDE_IFRAME__: true,
    __RRWEB_EXCLUDE_SHADOW_DOM__: true,
    __SENTRY_EXCLUDE_REPLAY_WORKER__: true,
  },
  // Explicit, although tsconfig already says so: @prefresh/vite derives the JSX runtime from
  // `oxc.jsx` (or `esbuild.jsx`) only, and falls back to the classic `h()` runtime without it,
  // which would break both dev and build ("h is not defined")
  oxc: {
    jsx: { runtime: 'automatic', importSource: 'preact' },
  },
  plugins: [
    // prefresh types its result as Promise<PluginOption>, a nested Thenable that Vite 8's PluginOption
    // type rejects; Vite flattens it at runtime, so the cast only narrows the type
    prefresh() as Promise<Plugin>,
    inlineCss(),
    analyzer({
      analyzerMode: 'static',
      fileName: 'stats.html',
      defaultSizes: 'gzip',
    }),
    // visualizer({
    //   template: 'flamegraph',
    //   filename: 'dist/stats.html',
    //   gzipSize: true,
    //   sourcemap: true,
    // }),
  ],
  // build: {
  //   sourcemap: true,
  // },
})

/**
 * Replaces the stylesheet <link> in index.html with an inline <style> and drops the .css file from
 * the build. The CSS is ~2 KB gzipped, so the extra bytes in the html cost less than the
 * render-blocking request. CSS urls are absolute (/static/...), so they resolve the same from the
 * html. Only stylesheets linked from the html are touched: CSS of lazy chunks stays a file.
 */
function inlineCss(): Plugin {
  return {
    name: 'inline-css',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        const { bundle } = ctx
        if (!bundle) return html
        return html.replaceAll(
          /<link rel="stylesheet"[^>]*href="\/([^"]+\.css)"[^>]*>/g,
          (tag, fileName: string) => {
            const asset = bundle[fileName]
            if (asset?.type !== 'asset') return tag
            delete bundle[fileName]
            return `<style>${asset.source}</style>`
          },
        )
      },
    },
  }
}
