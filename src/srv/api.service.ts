import { env } from '@/environment/environment'
import { FetchService } from '@/srv/fetch.service'

class ApiService extends FetchService {
  async fetch<T> (method: string, _url: string, _opt: RequestInit = {}): Promise<T> {
    const url = `${env().apiUrl}/${_url}`
    return super.fetch<T>(method, url, _opt)
  }
}

export const apiService = new ApiService()
