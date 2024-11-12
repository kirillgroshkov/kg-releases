import { IsoDate, UnixTimestamp } from '@naturalcycles/js-lib'

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
}
