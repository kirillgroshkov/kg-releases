import { env } from '@/environment/environment'
import { st } from '@/store'
import {
  errorObjectToHttpError,
  filterFalsyValues,
  HttpError,
  HttpErrorResponse,
} from '@naturalcycles/js-lib'
import Ky, { AfterResponseHook, BeforeRequestHook } from 'ky'

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

const afterResponseHook: AfterResponseHook = async (input, options, response) => {
  // This hook will try it's best to attach `httpError` property to `response`

  if (response.ok) return response

  console.warn('errorResponse', response)

  const tokens = [
    `<< ${options.method} ${input.url} ERROR (${response.status} ${response.statusText})`,
  ] // generic error message

  let text: string
  let json: any
  let httpError: HttpError | undefined

  try {
    text = await response.text()

    if (text) {
      json = JSON.parse(text)
      if (json) {
        if ((json as HttpErrorResponse).error) {
          httpError = errorObjectToHttpError(json.error)
        } else {
          tokens.push(JSON.stringify(json, null, 2))
        }
      } else {
        tokens.push(text)
      }
    }
  } catch (_) {}

  httpError =
    httpError ||
    new HttpError(tokens.join('\n'), {
      httpStatusCode: response.status,
    })

  return Object.assign(response, {
    httpError,
  })
}

export const api = Ky.extend({
  credentials: 'include',
  timeout: 30000,
  prefixUrl: apiUrl,
  hooks: {
    beforeRequest: [beforeRequestHook],
    afterResponse: [afterResponseHook],
  },
})
