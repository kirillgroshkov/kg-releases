import { loadHotjar } from '@naturalcycles/frontend-lib'
import { env } from '@/environment/environment'

const { hotjarId } = env

class AnalyticsService {
  init(): void {
    // this.initGA()
    if (hotjarId) {
      loadHotjar(hotjarId)
    }
  }

  setUserId(userId: string): void {
    window.gtag('set', { user_id: userId })
  }

  pageView(pagePath: string): void {
    window.gtag('config', env.gaId, { page_path: pagePath })
  }

  event(eventName: string, params: any = {}): void {
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
}

export const analyticsService = new AnalyticsService()
