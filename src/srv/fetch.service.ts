export interface FetchBody extends RequestInit {
  body?: any
  headers?: any
}

export class FetchService {
  async fetch<T = any> (method: string, url: string, _opt: FetchBody = {}): Promise<T> {
    // avoid mutation
    const opt: FetchBody = {
      method,
      credentials: 'include',
      ..._opt,
      headers: {
        'Content-Type': 'application/json',
        ..._opt.headers,
      },
    }

    // Stringify body
    if (opt.body && typeof opt.body === 'object') {
      opt.body = JSON.stringify(opt.body)
    }

    const resp = await fetch(url, opt as any)

    if (!resp.ok) {
      const text = await resp.text()
      const t = [[resp.status, resp.statusText].join(' '), text].filter(t => !!t)

      const err = new Error(t.join('\n') || 'empty')
      ; (err as any).response = resp
      return Promise.reject(err)
    }

    return resp.json()
  }

  // convenience methods
  async get<T = any> (url: string, opt: FetchBody = {}): Promise<T> {
    return this.fetch<T>('get', url, opt)
  }
  async post<T = any> (url: string, opt: FetchBody = {}): Promise<T> {
    return this.fetch<T>('post', url, opt)
  }
  async put<T = any> (url: string, opt: FetchBody = {}): Promise<T> {
    return this.fetch<T>('put', url, opt)
  }
  async patch<T = any> (url: string, opt: FetchBody = {}): Promise<T> {
    return this.fetch<T>('patch', url, opt)
  }
  async delete<T = any> (url: string, opt: FetchBody = {}): Promise<T> {
    return this.fetch<T>('delete', url, opt)
  }

  async errorPopup (err: any): Promise<any> {
    alert(JSON.stringify((err && err.message) || {}, undefined, 2))
  }
}

export const fetchService = new FetchService()
