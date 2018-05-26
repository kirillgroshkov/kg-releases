declare module '*.vue' {
  import Vue from 'vue'
  export default Vue
}

interface Window {
  dataLayer: any[]
  gtag (...args: any[]): void
}
