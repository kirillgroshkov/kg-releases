export class FetchService {
  async fetch<T = any> (method: string, url: string, _opt: RequestInit = {}): Promise<T> {
    // avoid mutation
    const opt = {
      method,
      credentials: 'include',
      ..._opt,
      headers: {
        'Content-Type': 'application/json',
        ..._opt.headers, // || {}
      },
    } as any

    // Stringify body
    if (opt.body && typeof opt.body === 'object') {
      opt.body = JSON.stringify(opt.body)
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
  async get<T = any> (url: string, opt: RequestInit = {}): Promise<T> {
    return this.fetch<T>('get', url, opt)
  }
  async post<T = any> (url: string, opt: RequestInit = {}): Promise<T> {
    return this.fetch<T>('post', url, opt)
  }
  async put<T = any> (url: string, opt: RequestInit = {}): Promise<T> {
    return this.fetch<T>('put', url, opt)
  }
  async patch<T = any> (url: string, opt: RequestInit = {}): Promise<T> {
    return this.fetch<T>('patch', url, opt)
  }
  async delete<T = any> (url: string, opt: RequestInit = {}): Promise<T> {
    return this.fetch<T>('delete', url, opt)
  }
}

export const fetchService = new FetchService()
