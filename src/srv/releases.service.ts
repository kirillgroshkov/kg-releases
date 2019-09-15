import { Progress } from '@/decorators/progress.decorator'
import { api } from '@/srv/api.service'
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
  async fetchReleases (minIncl: string, maxExcl = ''): Promise<BackendResponse> {
    console.log(`fetchReleases [${minIncl}; ${maxExcl})`)

    const { releases } = await api
      .get('', {
        searchParams: {
          minIncl,
          maxExcl,
        },
      })
      .json<BackendResponse>()

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
    const starredRepos = await api.get('repos').json<Repo[]>()

    store.commit('extendState', {
      starredRepos,
    })
  }

  @Progress()
  async getReleasesByRepo (repoFullName: string): Promise<Release[]> {
    return api.get(`repos/${repoFullName}/releases`).json<Release[]>()
  }

  @Progress()
  async fetchReleasesByRepo (repoFullName: string): Promise<Release[]> {
    return api.get(`repos/${repoFullName}/releases/fetch`).json<Release[]>()
  }

  @Progress()
  async auth (json: AuthInput): Promise<BackendResponse> {
    const br = await api
      .post(`auth`, {
        json,
      })
      .json<BackendResponse>()
    // console.log('auth', br)

    this.onBackendResponse(br)

    return br
  }

  async saveUserSettings (json: UserSettings): Promise<BackendResponse> {
    const br = await api
      .put(`userSettings`, {
        json,
      })
      .json<BackendResponse>()

    this.onBackendResponse(br)

    return br
  }

  @memo()
  async init (): Promise<BackendResponse> {
    const br = await api.get(`init`).json<BackendResponse>()

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
