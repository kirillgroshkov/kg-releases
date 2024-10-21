import { loadGTag, loadHotjar } from '@naturalcycles/frontend-lib'
import { AnyObject } from '@naturalcycles/js-lib'
import mixpanel from 'mixpanel-browser'
import { prod } from '@/env'
let mp = mixpanel

// ;(window as any).mixpanel = mixpanel

const mixpanelToken = '20158c629a6a4226d9c975185238b7a7'
const hotjarId = 894902
const gaId = 'UA-6342858-21'

class AnalyticsService {
  init(): void {
    void loadGTag('UA-6342858-21', prod)

    // this.initGA()
    if (prod) {
      loadHotjar(hotjarId)
    }

    if (!prod) {
      mp = {
        identify() {},
        track() {},
        reset() {},
        get_distinct_id() {},
      } as any
      return
    }

    mixpanel.init(mixpanelToken, {
      api_host: 'https://api-eu.mixpanel.com',
      autotrack: false,
      disable_notifications: true,
      // track_pageview: false,
      cross_subdomain_cookie: false,
    })
  }

  setUserId(userId: string): void {
    mp.identify(userId)
    globalThis.gtag('set', { user_id: userId })
  }

  pageView(fullPath: string): void {
    mp.track(`pageview ${fullPath}`)
    globalThis.gtag('config', gaId, { page_path: fullPath })
  }

  event(eventName: string, data: AnyObject = {}): void {
    mp.track(eventName, data)
    globalThis.gtag('event', eventName, data)
  }
}

export const analyticsService = new AnalyticsService()

export { mp }
