import { Progress } from '@/decorators/progress.decorator'
import { apiService } from '@/srv/api.service'
import { markdownService } from '@/srv/markdown.service'
import { st, store } from '@/store'
import { objectUtil } from '@/util/object.util'

export interface FeedResp {
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

export interface AuthResp {
  newUser: boolean
}

class ReleasesService {
  @Progress()
  async fetchReleases (): Promise<void> {
    const feedResp = await apiService.get<FeedResp>('')
    feedResp.releases = feedResp.releases.map(r => this.mapRelease(r)) // .slice(0, 5)

    store.commit('extendState', {
      feedResp,
    })
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
  async auth (body: AuthInput): Promise<AuthResp> {
    const r = await apiService.post<AuthResp>(`/auth`, {
      body,
    })
    console.log('auth', r)
    return r
  }

  private mapRelease (r: Release): Release {
    return {
      ...r,
      descr: markdownService.parse(r.descr || ''), // .substr(0, 2000)),
    }
  }
}

export const releasesService = new ReleasesService()
