import { env } from '@/environment/environment'
import { st } from '@/store'
import { getKy } from '@naturalcycles/frontend-lib'
import { filterFalsyValues, HttpError } from '@naturalcycles/js-lib'
import { BeforeRequestHook } from 'ky'

const { apiUrl } = env()

export interface ResponseWithHttpError extends Response {
  httpError: HttpError
}

const beforeRequestHook: BeforeRequestHook = (req, _options) => {
  const { uid, idToken } = st().user
  const headers: Record<string, string> = filterFalsyValues({
    idToken,
    uid,
  })

  Object.keys(headers).forEach(k => {
    req.headers.set(k, headers[k])
  })
}

export const api = getKy({
  // logStart: true,
  logFinished: true,
  // logResponse: true,
  topbar: true,
  alertOnError: true,
}).extend({
  credentials: 'include',
  timeout: 30_000,
  prefixUrl: apiUrl,
  hooks: {
    beforeRequest: [beforeRequestHook],
  },
})
