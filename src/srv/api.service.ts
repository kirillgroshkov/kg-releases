import { getKy } from '@naturalcycles/frontend-lib'
import { _filterFalsyValues } from '@naturalcycles/js-lib'
import { mp } from '@/srv/analytics.service'
import { env } from '@/environment/environment'
import { st } from '@/store'

const { apiUrl } = env

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
        const { uid, idToken } = st().user
        const headers = _filterFalsyValues({
          idToken,
          uid,
          distinctId: mp.get_distinct_id(),
        })

        Object.keys(headers).forEach(k => {
          req.headers.set(k, headers[k])
        })
      },
    ],
  },
})
