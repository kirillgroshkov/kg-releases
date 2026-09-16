import { topbar } from '@naturalcycles/js-lib/browser'
import { getFetcher } from '@naturalcycles/js-lib/http'
import { _filterFalsyValues } from '@naturalcycles/js-lib/object'
import { mp } from '#src/srv/analytics.service.js'
import { useStore } from '#src/store.js'

const baseUrl = 'https://kg-backend3.appspot.com/releases'

export const api = getFetcher({
  logResponse: true,
  baseUrl,
  credentials: 'include',
})
  .onBeforeRequest(req => {
    const { uid, idToken } = useStore().user
    Object.assign(
      req.init.headers,
      _filterFalsyValues({
        idToken,
        uid,
        distinctId: mp.get_distinct_id(),
      }),
    )

    topbar.show()
  })
  .onAfterResponse(() => {
    topbar.hide()
  })
