import { getKy } from '@naturalcycles/frontend-lib'
import { _filterFalsyValues, _objectKeys } from '@naturalcycles/js-lib'
import { useStore } from '@/store'
import { mp } from '@/srv/analytics.service'

const apiUrl = 'https://kg-backend3.appspot.com/releases'

export const api = getKy({
  // logStart: true,
  logFinished: true,
  // logResponse: true,
  topbar: true,
  alertOnError: true,
  credentials: 'include',
  timeout: 30_000,
  prefixUrl: apiUrl,
  hooks: {
    beforeRequest: [
      (req, _options) => {
        const { uid, idToken } = useStore().user
        const headers = _filterFalsyValues({
          idToken,
          uid,
          distinctId: mp.get_distinct_id(),
        })

        _objectKeys(headers).forEach(k => {
          req.headers.set(k, headers[k])
        })
      },
    ],
  },
})
