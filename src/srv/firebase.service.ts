import { _Memo, _pick, pDefer } from '@naturalcycles/js-lib'
import { User } from '@sentry/vue'
import { initializeApp } from 'firebase/app'
import {
  getAdditionalUserInfo,
  getAuth,
  GithubAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  UserInfo,
} from 'firebase/auth'
import { getPerformance } from 'firebase/performance'
import { withProgress } from '@/decorators/decorators'
import { prod } from '@/env'
import { sentry } from '@/error'
import { analyticsService, mp } from '@/srv/analytics.service'
import { BackendResponse } from '@/srv/model'
import { releasesService } from '@/srv/releases.service'
import { useStore } from '@/store'
export type { UserInfo }

// export interface UserInfo {
//   uid: string
//   displayName: string
//   email: string
//   photoURL: string
//   idToken: string
// }

const USER_FIELDS: (keyof UserInfo)[] = ['uid', 'displayName', 'email', 'photoURL']

const firebaseApp = initializeApp({
  apiKey: 'AIzaSyC_ooKU2uYbczwRQVfAa6VjGbxfkV-9cYI',
  authDomain: 'test124-1621f.firebaseapp.com',
  projectId: 'test124-1621f',
  appId: '1:755695435449:web:734140edc18237cc',
})
const auth = getAuth(firebaseApp)
const githubAuthProvider = new GithubAuthProvider()

class FirebaseService {
  authStateChanged = pDefer()

  @_Memo()
  async init(): Promise<void> {
    onAuthStateChanged(auth, user => this.onAuthStateChanged(user))

    if (prod) {
      const _perf = getPerformance(firebaseApp)
    }
  }

  async login(): Promise<BackendResponse> {
    const result = await signInWithPopup(auth, githubAuthProvider)
    // const r = await firebase.auth!().signInWithRedirect(githubAuthProvider)
    console.log(result)
    const idToken = await auth.currentUser!.getIdToken()
    // console.log('idToken', idToken)

    const credential = GithubAuthProvider.credentialFromResult(result)!
    const additionalUserInfo = getAdditionalUserInfo(result)!

    const br = await releasesService.auth({
      username: additionalUserInfo.username!,
      accessToken: credential.accessToken!,
      idToken,
    })

    return br
  }

  async logout(): Promise<void> {
    await withProgress(async () => {
      await auth.signOut()
      sentry.setUser({})
      mp.reset()
    })
  }

  private async onAuthStateChanged(userInfo: UserInfo | null): Promise<void> {
    // console.log('onAuthStateChanged, user:', _deepCopy(_user))
    const store = useStore()

    // debug!
    const qs = new URLSearchParams(location.search)
    const uid = qs.get('uid')
    if (uid) {
      console.log('debug: ?uid')

      sentry.setUser({ uid })
      analyticsService.setUserId(uid)

      store.user = {
        uid,
      } as UserInfo
    } else if (userInfo) {
      const idToken = await auth.currentUser!.getIdToken()

      // console.log('idToken', idToken)
      const user = {
        ..._pick(userInfo, USER_FIELDS),
        idToken,
      }

      sentry.setUser(user as User)
      analyticsService.setUserId(user.uid)

      store.user = user
    } else {
      store.user = {} as any
      store.userFM = { settings: {} } as any
    }

    this.authStateChanged.resolve()
  }
}

export const firebaseService = new FirebaseService()
