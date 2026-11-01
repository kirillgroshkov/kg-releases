import { _Memo } from '@naturalcycles/js-lib/decorators'
import { api } from '#src/srv/api.service.js'
import { firebaseService } from '#src/srv/firebase.service.js'
import { GITHUB_STARS_SCOPE } from '#src/srv/model.js'
import type { AuthInput, BackendResponse, Release, Repo, UserSettings } from '#src/srv/model.js'
import { addReleases, onBackendResponse, removeRepoReleases, store } from '#src/store.js'

class ReleasesService {
  async fetchReleases(minIncl: string, maxExcl = ''): Promise<BackendResponse> {
    // console.log(`fetchReleases [${minIncl}; ${maxExcl})`)

    const { releases } = await api.get<BackendResponse>(``, {
      searchParams: {
        minIncl,
        maxExcl,
      },
    })

    addReleases(releases)

    return {
      releases,
    }
  }

  async fetchRepos(): Promise<void> {
    const starredRepos = await api.get<Repo[]>('repos')

    store.starredRepos.value = starredRepos
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

  /**
   * Re-login with GITHUB_STARS_SCOPE, which updates the accessToken in the Backend.
   * Should be called directly from a click handler, otherwise the popup can be blocked.
   */
  async grantStarsPermission(): Promise<void> {
    await this.auth(await firebaseService.signInWithGithub([GITHUB_STARS_SCOPE]))
  }

  async auth(json: AuthInput): Promise<BackendResponse> {
    const br = await api.post<BackendResponse>(`auth`, {
      json,
    })
    // console.log('auth', br)

    onBackendResponse(br)

    return br
  }

  async saveUserSettings(json: UserSettings): Promise<BackendResponse> {
    await firebaseService.refreshIdToken() // protected endpoint
    const br = await api.put<BackendResponse>(`userSettings`, {
      json,
    })

    onBackendResponse(br)

    return br
  }

  /**
   * Unstars the repo on GitHub (for real).
   * Throws error with code GITHUB_INSUFFICIENT_SCOPE, if grantStarsPermission is needed first.
   */
  async unstarRepo(repoFullName: string): Promise<BackendResponse> {
    await firebaseService.refreshIdToken() // protected endpoint
    const br = await api.delete<BackendResponse>(`starred/${repoFullName}`)

    onBackendResponse(br)
    removeRepoReleases(repoFullName)

    return br
  }

  @_Memo()
  async init(): Promise<BackendResponse> {
    const br = await api.get<BackendResponse>(`init`)

    onBackendResponse(br)

    return br
  }
}

export const releasesService = new ReleasesService()
