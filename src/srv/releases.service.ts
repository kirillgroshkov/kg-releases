import { Progress } from '@/decorators/progress.decorator'
import { apiService } from '@/srv/api.service'
import { markdownService } from '@/srv/markdown.service'
import { extendState, store } from '@/store'
import { memo } from '@naturalcycles/js-lib'

export interface ReleasesByDay {
  [day: string]: Release[]
}

export interface FeedResp {
  lastCheckedReleases: number
  rateLimit: RateLimit
  lastStarred: string[]
  starredRepos: number
  releases: Release[]
}

export interface RateLimit {
  limit: number
  remaining: number
  reset: number
}

export interface Release {
  // `${repoOwner}_${repoName}_${v}`
  id: string
  repoFullName: string
  created: number
  published: number
  v: string // semver
  descr: string // markdown
  githubId: number
  avatarUrl: string
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
}

class ReleasesService {
  // @Progress()
  async fetchReleases (minIncl: string, maxExcl?: string): Promise<FeedResp> {
    console.log(`fetchReleases [${minIncl}; ${maxExcl})`)
    /*const minIncl = DateTime.utc()
      .startOf('day')
      .minus({ days: 3 })
      .toFormat(LUXON_ISO_DATE_FORMAT)
    const maxExcl = DateTime.utc()
      .startOf('day')
      .plus({ days: 1 })
      .toFormat(LUXON_ISO_DATE_FORMAT)*/

    const feedResp = await apiService.get<FeedResp>(`/?minIncl=${minIncl}&maxExcl=${maxExcl || ''}`)
    feedResp.releases = feedResp.releases.map(r => this.mapRelease(r))

    store.commit('extendState', {
      rateLimit: feedResp.rateLimit,
      starredReposNumber: feedResp.starredRepos,
      lastStarred: feedResp.lastStarred,
      lastCheckedReleases: feedResp.lastCheckedReleases,
    })

    store.commit('addReleases', feedResp.releases)

    return feedResp
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

  private mapRelease (r: Release): Release {
    return {
      ...r,
      descr: markdownService.parse(r.descr || ''), // .substr(0, 2000)),
    }
  }
}

export const releasesService = new ReleasesService()
