import { _Memo } from '@naturalcycles/js-lib'
import { AuthInput, BackendResponse, Release, Repo, UserSettings } from './model'
import { useStore } from '@/store'
import { api } from '@/srv/api.service'

class ReleasesService {
  async fetchReleases(minIncl: string, maxExcl = ''): Promise<BackendResponse> {
    // console.log(`fetchReleases [${minIncl}; ${maxExcl})`)

    const { releases } = await api.getJson<BackendResponse>(``, {
      searchParams: {
        minIncl,
        maxExcl,
      },
    })

    useStore().addReleases(releases)

    return {
      releases,
    }
  }

  async fetchRepos(): Promise<void> {
    const starredRepos = await api.getJson<Repo[]>('repos')

    useStore().starredRepos = starredRepos
  }

  async getReleasesByRepo(repoFullName: string): Promise<Release[]> {
    return await api.getJson<Release[]>(`repos/${repoFullName}/releases`)
  }

  async fetchReleasesByRepo(repoFullName: string): Promise<Release[]> {
    return await api.getJson<Release[]>(`repos/${repoFullName}/releases/fetch`)
  }

  async auth(json: AuthInput): Promise<BackendResponse> {
    const br = await api.postJson<BackendResponse>(`auth`, {
      json,
    })
    // console.log('auth', br)

    useStore().onBackendResponse(br)

    return br
  }

  async saveUserSettings(json: UserSettings): Promise<BackendResponse> {
    const br = await api.putJson<BackendResponse>(`userSettings`, {
      json,
    })

    useStore().onBackendResponse(br)

    return br
  }

  @_Memo()
  async init(): Promise<BackendResponse> {
    const br = await api.getJson<BackendResponse>(`init`)

    useStore().onBackendResponse(br)

    return br
  }
}

export const releasesService = new ReleasesService()
