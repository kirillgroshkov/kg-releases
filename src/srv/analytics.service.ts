import { env } from '@/environment/environment'

class AnalyticsService {
  init (): void {
    // this.initGA()
    this.initHotjar()
    ;(window as any).perfMetrics.onFirstInputDelay((delay: number, evt: Event) => {
      console.log({ delay, evt })

      this.event('perfMetrics', {
        eventCategory: 'Perf Metrics',
        eventAction: 'first-input-delay',
        eventLabel: evt.type,
        // Event values must be an integer.
        eventValue: Math.round(delay),
        // Exclude this event from bounce rate calculations.
        nonInteraction: true,
      })
    })
  }

  setUserId (userId: string): void {
    window.gtag('set', { user_id: userId })
  }

  pageView (pagePath: string): void {
    window.gtag('config', env().gaId, { page_path: pagePath })
  }

  event (eventName: string, params: any = {}): void {
    window.gtag('event', eventName, params)
  }

  /*
  private initGA (): void {
    window.dataLayer = window.dataLayer || []
    window.gtag = (...args: any[]) => window.dataLayer.push(...args)
    window.gtag('js', new Date())
    window.gtag('config', env().gaId)

    if (!env().gaId) return

    // Only load real script if it's enabled (gaId)
    void loadScript(`https://www.googletagmanager.com/gtag/js?id=${env().gaId}`)
  }*/

  private initHotjar (): void {
    if (!env().hotjarId) {
      return
    }
    ;(function (h, o, t, j) {
      h.hj =
        h.hj ||
        function () {
          ;(h.hj.q = h.hj.q || []).push(arguments)
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
