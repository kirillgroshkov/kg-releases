import { _Memo } from '@naturalcycles/js-lib'
import { AuthInput, BackendResponse, Release, Repo, UserSettings } from './model'
import { useStore } from '@/store'
import { api } from '@/srv/api.service'

class ReleasesService {
  async fetchReleases(minIncl: string, maxExcl = ''): Promise<BackendResponse> {
    // console.log(`fetchReleases [${minIncl}; ${maxExcl})`)

    const { releases } = await api
      .get('', {
        searchParams: {
          minIncl,
          maxExcl,
        },
      })
      .json<BackendResponse>()

    useStore().addReleases(releases)

    return {
      releases,
    }
  }

  async fetchRepos(): Promise<void> {
    const starredRepos = await api.get('repos').json<Repo[]>()

    useStore().starredRepos = starredRepos
  }

  async getReleasesByRepo(repoFullName: string): Promise<Release[]> {
    return await api.get(`repos/${repoFullName}/releases`).json<Release[]>()
  }

  async fetchReleasesByRepo(repoFullName: string): Promise<Release[]> {
    return await api.get(`repos/${repoFullName}/releases/fetch`).json<Release[]>()
  }

  async auth(json: AuthInput): Promise<BackendResponse> {
    const br = await api
      .post(`auth`, {
        json,
      })
      .json<BackendResponse>()
    // console.log('auth', br)

    useStore().onBackendResponse(br)

    return br
  }

  async saveUserSettings(json: UserSettings): Promise<BackendResponse> {
    const br = await api
      .put(`userSettings`, {
        json,
      })
      .json<BackendResponse>()

    useStore().onBackendResponse(br)

    return br
  }

  @_Memo()
  async init(): Promise<BackendResponse> {
    const br = await api.get(`init`).json<BackendResponse>()

    useStore().onBackendResponse(br)

    return br
  }
}

export const releasesService = new ReleasesService()
