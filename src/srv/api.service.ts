import { topbar } from '@naturalcycles/frontend-lib'
import { _filterFalsyValues, getFetcher } from '@naturalcycles/js-lib'
import { mp } from '@/srv/analytics.service'
import { useStore } from '@/store'

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
