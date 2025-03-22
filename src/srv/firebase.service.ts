import { _Memo, _pick, pDefer } from '@naturalcycles/js-lib'
import { User } from '@sentry/vue'
import type { Auth, UserInfo } from 'firebase/auth'
import { withProgress } from '@/decorators/decorators'
import { sentry } from '@/error'
import { analyticsService, mp } from '@/srv/analytics.service'
import { BackendResponse } from '@/srv/model'
import { releasesService } from '@/srv/releases.service'
import { useStore } from '@/store'
export type { UserInfo }

const USER_FIELDS: (keyof UserInfo)[] = ['uid', 'displayName', 'email', 'photoURL']

class FirebaseService {
  authStateChanged = pDefer()

  @_Memo()
  async init(): Promise<void> {
    await this.getAuth()
  }

  @_Memo()
  private async getAuth(): Promise<Auth> {
    const { initializeApp } = await import('firebase/app')
    const { getAuth, onAuthStateChanged } = await import('firebase/auth')

    const firebaseApp = initializeApp({
      apiKey: 'AIzaSyC_ooKU2uYbczwRQVfAa6VjGbxfkV-9cYI',
      authDomain: 'test124-1621f.firebaseapp.com',
      projectId: 'test124-1621f',
      appId: '1:755695435449:web:734140edc18237cc',
    })

    const auth = getAuth(firebaseApp)

    onAuthStateChanged(auth, user => this.onAuthStateChanged(user))

    // Firebase Performance is disabled as no longer being observed
    // if (prod) {
    //   const _perf = getPerformance(firebaseApp)
    // }

    return auth
  }

  async login(): Promise<BackendResponse> {
    const auth = await this.getAuth()
    const { signInWithPopup, getAdditionalUserInfo, GithubAuthProvider } = await import(
      'firebase/auth'
    )
    const githubAuthProvider = new GithubAuthProvider()

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
      const auth = await this.getAuth()
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
      const auth = await this.getAuth()
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
