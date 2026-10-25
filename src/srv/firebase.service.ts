import { _Memo } from '@naturalcycles/js-lib/decorators'
import { _pick } from '@naturalcycles/js-lib/object'
import { pDefer } from '@naturalcycles/js-lib/promise'
import type { User } from '@sentry/browser'
import type { Auth, UserInfo } from 'firebase/auth'
import { withProgress } from '#src/decorators/decorators.js'
import { sentry } from '#src/error.js'
import type { AuthInput } from '#src/srv/model.js'
import { store } from '#src/store.js'

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

  /**
   * Returns AuthInput, to be passed to the Backend (releasesService.auth).
   *
   * Extra scopes can be requested on demand (e.g `public_repo` to manage stars).
   * GitHub remembers granted scopes, so later logins without them still get a token with them.
   *
   * Should be called directly from a click handler, otherwise the popup can be blocked.
   */
  async signInWithGithub(scopes: string[] = []): Promise<AuthInput> {
    const auth = await this.getAuth()
    const { signInWithPopup, getAdditionalUserInfo, GithubAuthProvider } =
      await import('firebase/auth')
    const githubAuthProvider = new GithubAuthProvider()
    for (const scope of scopes) {
      githubAuthProvider.addScope(scope)
    }

    const result = await signInWithPopup(auth, githubAuthProvider)
    // const r = await firebase.auth!().signInWithRedirect(githubAuthProvider)
    console.log(result)
    const idToken = await auth.currentUser!.getIdToken()
    // console.log('idToken', idToken)

    const credential = GithubAuthProvider.credentialFromResult(result)!
    const additionalUserInfo = getAdditionalUserInfo(result)!

    return {
      username: additionalUserInfo.username!,
      accessToken: credential.accessToken!,
      idToken,
    }
  }

  /**
   * Updates the idToken in the store with a fresh (non-expired) one.
   * Must be called before calling "protected" Backend endpoints, which verify the idToken.
   */
  async refreshIdToken(): Promise<void> {
    const auth = await this.getAuth()
    await auth.authStateReady()
    // getIdToken() returns the cached token, or a new one if it's expired
    const idToken = await auth.currentUser?.getIdToken()
    store.user.value = { ...store.user.value, idToken }
  }

  async logout(): Promise<void> {
    await withProgress(async () => {
      const auth = await this.getAuth()
      await auth.signOut()
      sentry.setUser({})
    })
  }

  private async onAuthStateChanged(userInfo: UserInfo | null): Promise<void> {
    // console.log('onAuthStateChanged, user:', _deepCopy(_user))

    // debug!
    const qs = new URLSearchParams(location.search)
    const uid = qs.get('uid')
    if (uid) {
      console.log('debug: ?uid')

      sentry.setUser({ uid })

      store.user.value = {
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

      store.user.value = user
    } else {
      store.user.value = {} as any
      store.userFM.value = { settings: {} } as any
    }

    this.authStateChanged.resolve()
  }
}

export const firebaseService = new FirebaseService()
