import { topbar } from '@naturalcycles/frontend-lib'
import { _filterFalsyValues, getFetcher } from '@naturalcycles/js-lib'
import { useStore } from '@/store'
import { mp } from '@/srv/analytics.service'

const baseUrl = 'https://kg-backend3.appspot.com/releases'

export const api = getFetcher({
  logResponse: true,
  baseUrl,
  init: {
    credentials: 'include',
  },
  hooks: {
    beforeRequest(req) {
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
    },
    beforeResponse() {
      topbar.hide()
    },
  },
})
