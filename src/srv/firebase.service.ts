import { pDefer, _Memo, _pick } from '@naturalcycles/js-lib'
import { initializeApp } from 'firebase/app'
import {
  getAdditionalUserInfo,
  getAuth,
  GithubAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
} from 'firebase/auth'
import { getPerformance } from 'firebase/performance'
import { Progress } from '@/decorators/decorators'
import { analyticsService, mp } from '@/srv/analytics.service'
import { BackendResponse } from '@/srv/model'
import { releasesService } from '@/srv/releases.service'
import { sentryService } from '@/srv/sentry.service'
import { extendState } from '@/store'

export interface UserInfo {
  uid: string
  displayName: string
  email: string
  photoURL: string
  idToken: string
}

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
    onAuthStateChanged(auth, user => this.onAuthStateChanged(user as any))

    if (window.prod) {
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

  @Progress()
  async logout(): Promise<void> {
    await auth.signOut()
    sentryService.setUser({})
    mp.reset()
  }

  private async onAuthStateChanged(_user?: UserInfo): Promise<void> {
    // console.log('onAuthStateChanged, user:', _deepCopy(_user))

    // debug!
    const qs = new URLSearchParams(location.search)
    const uid = qs.get('uid')
    if (uid) {
      console.log('debug: ?uid')
      const user = {
        uid,
      } as UserInfo

      sentryService.setUser(user)
      analyticsService.setUserId(user.uid)

      extendState({
        user,
      })
    } else if (_user) {
      const idToken = await auth.currentUser!.getIdToken()

      // console.log('idToken', idToken)
      const user = {
        ..._pick(_user, USER_FIELDS),
        idToken,
      }

      sentryService.setUser(user)
      analyticsService.setUserId(user.uid)

      extendState({
        user,
      })
    } else {
      extendState({
        user: {} as any,
        userFM: { settings: {} } as any,
      })
    }

    this.authStateChanged.resolve()
  }
}

export const firebaseService = new FirebaseService()
