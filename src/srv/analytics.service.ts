import { env } from '@/environment/environment'

class AnalyticsService {
  init (): void {
    this.initHotjar()
  }

  private initHotjar (): void {
    if (!env().hotjarId) return
    ; (function (h, o, t, j) {
      h.hj =
        h.hj ||
        function () {
          (h.hj.q = h.hj.q || []).push(arguments)
        }
      h._hjSettings = { hjid: env().hotjarId, hjsv: 6 }
      const a = o.getElementsByTagName('head')[0]
      const r = o.createElement('script')
      r.async = 1
      r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv
      a.appendChild(r)
    })(window as any, document as any, 'https://static.hotjar.com/c/hotjar-', '.js?sv=')
  }
}

export const analyticsService = new AnalyticsService()
