import { Progress } from '@/decorators/progress.decorator'
import { apiService } from '@/srv/api.service'
import { extendState, store } from '@/store'
import { memo } from '@naturalcycles/js-lib'

export interface ReleasesByDay {
  [day: string]: Release[]
}

export interface RateLimit {
  limit: number
  remaining: number
  reset: number
}

export enum ReleaseType {
  RELEASE = 'RELEASE',
  TAG = 'TAG',
}

export interface Release {
  // ${repoFullName}_${tagName}
  id: string
  repoFullName: string
  // created: number
  published: number
  // v: string // semver
  tagName: string
  descrHtml: string
  author: string
  authorThumb?: string
  // githubId: number
  avatarUrl?: string
  // type: ReleaseType
}

export interface Repo {
  githubId: number
  fullName: string
  descr: string
  homepage: string
  stargazersCount: number
  avatarUrl: string
  starredAt: number
}

export interface AuthInput {
  username: string
  accessToken: string
  idToken: string
}

export interface UserSettings {
  notificationEmail?: string
  notifyEmailRealtime?: boolean
  notifyEmailDaily?: boolean
}

// frontend model of User
export interface UserFM {
  id: string
  username: string
  starredReposCount: number
  displayName?: string
  settings: UserSettings
}

export interface BackendResponse {
  newUser?: boolean
  userFM?: UserFM
  releases?: Release[]
}

class ReleasesService {
  // @Progress()
  async fetchReleases (minIncl: string, maxExcl?: string): Promise<BackendResponse> {
    console.log(`fetchReleases [${minIncl}; ${maxExcl})`)

    const { releases } = await apiService.get<BackendResponse>(
      `/?minIncl=${minIncl}&maxExcl=${maxExcl || ''}`,
    )

    // store.commit('extendState', {
    //   rateLimit: feedResp.rateLimit,
    //   starredReposNumber: feedResp.starredRepos,
    //   lastStarred: feedResp.lastStarred,
    //   lastCheckedReleases: feedResp.lastCheckedReleases,
    // })

    store.commit('addReleases', releases)

    return {
      releases,
    }
  }

  @Progress()
  async fetchRepos (): Promise<void> {
    const starredRepos = await apiService.get<Repo[]>('/repos')

    store.commit('extendState', {
      starredRepos,
    })
  }

  @Progress()
  async getReleasesByRepo (repoFullName: string): Promise<Release[]> {
    return apiService.get<Release[]>(`/repos/${repoFullName}/releases`)
  }

  @Progress()
  async fetchReleasesByRepo (repoFullName: string): Promise<Release[]> {
    return apiService.get<Release[]>(`/repos/${repoFullName}/releases/fetch`)
  }

  @Progress()
  async auth (body: AuthInput): Promise<BackendResponse> {
    const br = await apiService.post<BackendResponse>(`/auth`, {
      body,
    })
    console.log('auth', br)

    this.onBackendResponse(br)

    return br
  }

  async saveUserSettings (body: UserSettings): Promise<BackendResponse> {
    const br = await apiService.put<BackendResponse>(`/userSettings`, {
      body,
    })

    this.onBackendResponse(br)

    return br
  }

  @memo()
  async init (): Promise<BackendResponse> {
    const br = await apiService.get<BackendResponse>(`/init`)

    this.onBackendResponse(br)

    return br
  }

  onBackendResponse (br: BackendResponse): void {
    if (br.userFM) {
      extendState({
        userFM: br.userFM,
      })
    }
  }
}

export const releasesService = new ReleasesService()
