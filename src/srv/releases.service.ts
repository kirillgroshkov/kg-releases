import { _Memo } from '@naturalcycles/js-lib'
import { api } from '@/srv/api.service'
import { useStore } from '@/store'
import type { AuthInput, BackendResponse, Release, Repo, UserSettings } from './model.ts'

class ReleasesService {
  async fetchReleases(minIncl: string, maxExcl = ''): Promise<BackendResponse> {
    // console.log(`fetchReleases [${minIncl}; ${maxExcl})`)

    const { releases } = await api.get<BackendResponse>(``, {
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
    const starredRepos = await api.get<Repo[]>('repos')

    useStore().starredRepos = starredRepos
  }

  async getReleasesByRepo(repoFullName: string): Promise<Release[]> {
    return await api.get<Release[]>(`repos/${repoFullName}/releases`)
  }

  async fetchReleasesByRepo(repoFullName: string): Promise<Release[]> {
    return await api.get<Release[]>(`repos/${repoFullName}/releases/fetch`)
  }

  async auth(json: AuthInput): Promise<BackendResponse> {
    const br = await api.post<BackendResponse>(`auth`, {
      json,
    })
    // console.log('auth', br)

    useStore().onBackendResponse(br)

    return br
  }

  async saveUserSettings(json: UserSettings): Promise<BackendResponse> {
    const br = await api.put<BackendResponse>(`userSettings`, {
      json,
    })

    useStore().onBackendResponse(br)

    return br
  }

  @_Memo()
  async init(): Promise<BackendResponse> {
    const br = await api.get<BackendResponse>(`init`)

    useStore().onBackendResponse(br)

    return br
  }
}

export const releasesService = new ReleasesService()
