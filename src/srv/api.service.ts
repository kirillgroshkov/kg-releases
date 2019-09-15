import { env } from '@/environment/environment'
import { st } from '@/store'
import { filterFalsyValues } from '@naturalcycles/js-lib'
import Ky from 'ky'

const { apiUrl } = env()

export const api = Ky.extend({
  credentials: 'include',
  timeout: 30000,
  prefixUrl: apiUrl,
  hooks: {
    beforeRequest: [
      (input, options) => {
        const { uid, idToken } = st().user
        const headers: Record<string, string> = filterFalsyValues({
          idToken,
          uid,
        })

        Object.keys(headers).forEach(k => {
          options.headers.set(k, headers[k])
        })
      },
    ],
  },
})
