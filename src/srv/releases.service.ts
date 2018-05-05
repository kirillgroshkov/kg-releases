import { apiService } from '@/srv/api.service'
import { markdownService } from '@/srv/markdown.service'
import { store } from '@/store'

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

class ReleasesService {
  async fetchReleases (): Promise<void> {
    const feedResp = await apiService.get<FeedResp>('')
    feedResp.releases = feedResp.releases.map(r => this.mapRelease(r)) // .slice(0, 5)

    store.commit('extendState', {
      feedResp,
    })
  }

  private mapRelease (r: Release): Release {
    return {
      ...r,
      descr: markdownService.parse((r.descr || '')), // .substr(0, 2000)),
    }
  }
}

export const releasesService = new ReleasesService()
