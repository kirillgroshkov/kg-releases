import type { IsoDate, UnixTimestamp } from '@naturalcycles/js-lib/types'

// export interface ReleasesByDay {
//   [day: IsoDate]: Release[]
// }

export type ReleasesByDay = Record<IsoDate, Release[]>

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
  published: UnixTimestamp
  v: string // semver
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

/**
 * GitHub OAuth scope, required to star/unstar repos (GitHub has no narrower scope for stars).
 * Requested on demand (on first unstar), not at login.
 */
export const GITHUB_STARS_SCOPE = 'public_repo'

/**
 * Backend ErrorData.code, which means that GITHUB_STARS_SCOPE needs to be granted (or re-granted).
 */
export const GITHUB_INSUFFICIENT_SCOPE = 'GITHUB_INSUFFICIENT_SCOPE'

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
  /**
   * Repos (fullRepoNames) the user chose to hide: they stay starred on GitHub,
   * but their releases are excluded from the feed (unless FeedOptions.showHidden) and notifications.
   */
  hiddenRepos: string[]
  /**
   * Repos (fullRepoNames) the user marked as favorite (highlighted in the feed).
   * A repo cannot be both hidden and favorite.
   */
  favoriteRepos: string[]
  displayName?: string
  settings: UserSettings
}

/**
 * User's lists of repos (mutually exclusive), named as the Backend endpoints, e.g `PUT /hidden/:repo`.
 */
export type RepoList = 'hidden' | 'favorite'

/**
 * Options to tune the feed. Persisted in localStorage (per device), sent to the Backend as query
 * params (see the Backend's FeedOptions). New options are added here.
 */
export interface FeedOptions {
  /**
   * Include releases of the hidden repos (excluded by default).
   */
  showHidden?: boolean

  /**
   * Only releases with a canonical semver tag, e.g `1.2.3` or `pkg@1.2.3` (see isCanonicalSemverTag).
   */
  semverOnly?: boolean
}

/**
 * Canonical semver tag: MAJOR[.MINOR[.PATCH]] (numbers without leading zeros), with an optional `v`,
 * e.g `1.2.3`, `v1.2`, `v7`.
 *
 * Can be prefixed with a name and a separator (`-`, `@`, `_` or `/`), as monorepos do,
 * e.g `router-utils@1.163.0`, `agent-skills-v0.4440.0`, `jackson-module-kotlin-3.3.0`.
 * A prefixed version needs at least MAJOR.MINOR, as a bare number there is rather a build number
 * or a timestamp, e.g `2fc131eeb4a3-1794109014`.
 *
 * Nothing is allowed after the version, so pre-releases, nightlies, dev builds and hashes are not
 * canonical, e.g `1.2.3-beta.1`, `1.67.1.dev20261107`, `v0.0.0-0.nightly.2026.11.08`,
 * `cmux-app-ffi-b9867f610b60`.
 *
 * Keep in sync with the Backend's isCanonicalSemverTag.
 */
export function isCanonicalSemverTag(tagName: string): boolean {
  return canonicalSemverTagRegex.test(tagName)
}

const canonicalSemverTagRegex =
  /^v?(?:0|[1-9]\d*)(?:\.(?:0|[1-9]\d*)){0,2}$|[-@_/]v?(?:0|[1-9]\d*)(?:\.(?:0|[1-9]\d*)){1,2}$/i

export interface BackendResponse {
  newUser?: boolean
  userFM?: UserFM
  releases?: Release[]
  releasesUpdaterLastFinished?: UnixTimestamp
  /**
   * Present if user's scanning was paused due to inactivity, and was recently resumed.
   */
  scanningResumedAt?: UnixTimestamp
}
