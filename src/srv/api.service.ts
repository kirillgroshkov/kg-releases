import { BeforeRequestHook, getKy } from '@naturalcycles/frontend-lib'
import { HttpError, _filterFalsyValues } from '@naturalcycles/js-lib'
import { env } from '@/environment/environment'
import { st } from '@/store'

const { apiUrl } = env

export interface ResponseWithHttpError extends Response {
  httpError: HttpError
}

const beforeRequestHook: BeforeRequestHook = (req, _options) => {
  const { uid, idToken } = st().user
  const headers = _filterFalsyValues({
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
  credentials: 'include',
  timeout: 30_000,
  prefixUrl: apiUrl,
  hooks: {
    beforeRequest: [beforeRequestHook],
  },
})
