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
 * Client ID of the "stars" GitHub App, which only has the "Starring" permission.
 * Connected on demand (on first unstar), not at login.
 */
export const GITHUB_STARS_APP_CLIENT_ID = 'Iv23liOSIla7gfRRN921'

/**
 * Backend ErrorData.code, which means that the "stars" GitHub App needs to be connected (again).
 */
export const GITHUB_STARS_NOT_CONNECTED = 'GITHUB_STARS_NOT_CONNECTED'

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
  releasesUpdaterLastFinished?: UnixTimestamp
  /**
   * Present if user's scanning was paused due to inactivity, and was recently resumed.
   */
  scanningResumedAt?: UnixTimestamp
}
