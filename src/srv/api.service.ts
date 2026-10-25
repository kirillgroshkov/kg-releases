import { topbar } from '@naturalcycles/js-lib/browser'
import { getFetcher } from '@naturalcycles/js-lib/http'
import { _filterFalsyValues } from '@naturalcycles/js-lib/object'
import { store } from '#src/store.js'

const baseUrl = 'https://kg-backend3.appspot.com/releases'

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

    topbar.show()
  })
  .onAfterResponse(() => {
    topbar.hide()
  })
