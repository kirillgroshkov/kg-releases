export class FetchService {
  async fetch<T> (method: string, url: string, _opt: RequestInit = {}): Promise<T> {
    // avoid mutation
    const opt = {
      method,
      credentials: 'include',
      ..._opt,
    } as any

    // Stringify body
    if (opt.body && typeof opt.body === 'object') {
      opt.body = JSON.stringify(opt.body)
    }

    // Content-type: application/json
    if (!opt.headers) opt.headers = {}
    if (!opt.headers['Content-Type']) {
      opt.headers['Content-Type'] = 'application/json'
    }

    const resp = await fetch(url, opt)
    if (!resp.ok) {
      const err = new Error(resp.statusText)
      ; (err as any).response = resp
      return Promise.reject(err)
    }

    return resp.json()
  }

  // convenience methods
  async get<T> (url: string, opt: RequestInit = {}): Promise<T> {
    return this.fetch<T>('get', url, opt)
  }
  async post<T> (url: string, opt: RequestInit = {}): Promise<T> {
    return this.fetch<T>('post', url, opt)
  }
  async put<T> (url: string, opt: RequestInit = {}): Promise<T> {
    return this.fetch<T>('put', url, opt)
  }
  async patch<T> (url: string, opt: RequestInit = {}): Promise<T> {
    return this.fetch<T>('patch', url, opt)
  }
  async delete<T> (url: string, opt: RequestInit = {}): Promise<T> {
    return this.fetch<T>('delete', url, opt)
  }
}

export const fetchService = new FetchService()
