import { _Memo } from '@naturalcycles/js-lib/decorators'
import { api } from '#src/srv/api.service.js'
import { firebaseService } from '#src/srv/firebase.service.js'
import type { AuthInput, BackendResponse, Release, Repo, UserSettings } from '#src/srv/model.js'
import { useStore } from '#src/store.js'

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

  async login(): Promise<BackendResponse> {
    return await this.auth(await firebaseService.signInWithGithub())
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
    await firebaseService.refreshIdToken() // protected endpoint
    const br = await api.put<BackendResponse>(`userSettings`, {
      json,
    })

    useStore().onBackendResponse(br)

    return br
  }

  /**
   * Unstars the repo on GitHub (for real).
   * Throws error with code GITHUB_STARS_NOT_CONNECTED, if githubStarsService.connect is needed first.
   */
  async unstarRepo(repoFullName: string): Promise<BackendResponse> {
    await firebaseService.refreshIdToken() // protected endpoint
    const br = await api.delete<BackendResponse>(`starred/${repoFullName}`)

    const store = useStore()
    store.onBackendResponse(br)
    store.removeRepoReleases(repoFullName)

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
