import { env } from '@/environment/environment'
import { FetchBody, FetchService } from '@/srv/fetch.service'
import { st } from '@/store'
import { filterFalsyValues } from '@naturalcycles/js-lib'

class ApiService extends FetchService {
  private get headers (): any {
    return filterFalsyValues({
      idToken: st().user.idToken,
      uid: st().user.uid,
    })
  }

  async fetch<T = any> (method: string, _url: string, _opt: FetchBody = {}): Promise<T> {
    const url = `${env().apiUrl}${_url}`
    return super.fetch<T>(method, url, {
      ..._opt,
      headers: {
        ...this.headers,
        ..._opt.headers,
      },
    })
  }
}

export const apiService = new ApiService()
