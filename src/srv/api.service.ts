import { topbar } from '@naturalcycles/js-lib/browser'
import { getFetcher } from '@naturalcycles/js-lib/http'
import { _filterFalsyValues } from '@naturalcycles/js-lib/object'
import { store } from '#src/store.js'

const baseUrl = 'https://kg-backend3.appspot.com/releases'

/**
 * Requests can overlap (e.g. a background unstar during a reload), so the topbar is hidden only
 * when the last one finishes. afterResponse runs once per request, for errors too.
 */
let pendingRequests = 0

export const api = getFetcher({
  logResponse: true,
  baseUrl,
  credentials: 'include',
})
  .onBeforeRequest(req => {
    const { uid, idToken } = store.user.value
    Object.assign(
      req.init.headers,
      _filterFalsyValues({
        idToken,
        uid,
      }),
    )

    pendingRequests++
    topbar.show()
  })
  .onAfterResponse(() => {
    if (--pendingRequests === 0) topbar.hide()
  })
