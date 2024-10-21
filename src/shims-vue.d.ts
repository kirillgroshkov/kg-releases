/* eslint-disable */
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  // biome-ignore lint/style/noDefaultExport: ok
  export default component
}
