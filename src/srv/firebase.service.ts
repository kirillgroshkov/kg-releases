import { Progress } from '@/decorators/progress.decorator'
import { analyticsService } from '@/srv/analytics.service'
import { BackendResponse } from '@/srv/model'
import { releasesService } from '@/srv/releases.service'
import { sentryService } from '@/srv/sentry.service'
import { extendState } from '@/store'
import { urlUtil } from '@/util/url.util'
import { pDefer, _deepCopy, _Memo, _pick } from '@naturalcycles/js-lib'
import * as firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/performance'

export interface UserInfo {
  uid: string
  displayName: string
  email: string
  photoURL: string
  idToken: string
}

const CONFIG = {
  apiKey: 'AIzaSyC_ooKU2uYbczwRQVfAa6VjGbxfkV-9cYI',
  authDomain: 'test124-1621f.firebaseapp.com',
  projectId: 'test124-1621f',
  appId: '1:755695435449:web:734140edc18237cc',
}

const USER_FIELDS: (keyof UserInfo)[] = ['uid', 'displayName', 'email', 'photoURL']

const githubAuthProvider = new firebase.auth.GithubAuthProvider()

class FirebaseService {
  authStateChanged = pDefer()

  @_Memo()
  async init(): Promise<void> {
    firebase.initializeApp(CONFIG)
    firebase.auth().onAuthStateChanged(user => this.onAuthStateChanged(user as any))

    if (window.prod) {
      firebase.performance()
    }
  }

  async login(): Promise<BackendResponse> {
    const userCredential = await firebase.auth().signInWithPopup(githubAuthProvider)
    // const r = await firebase.auth!().signInWithRedirect(githubAuthProvider)
    console.log(userCredential)
    const idToken = await firebase.auth().currentUser!.getIdToken()
    // console.log('idToken', idToken)

    const br = await releasesService.auth({
      username: userCredential.additionalUserInfo!.username!,
      accessToken: (userCredential.credential as any).accessToken,
      idToken,
    })

    return br
  }

  @Progress()
  async logout(): Promise<void> {
    await firebase.auth().signOut()
    sentryService.setUser({})
  }

  private async onAuthStateChanged(_user?: UserInfo): Promise<void> {
    console.log('onAuthStateChanged, user: ', _deepCopy(_user))

    // debug!
    const qs = urlUtil.qs()
    if (qs.uid) {
      console.log('debug: ?uid')
      const user = {
        uid: qs.uid,
      } as UserInfo

      sentryService.setUser(user)
      analyticsService.setUserId(user.uid)

      extendState({
        user,
      })
    } else if (_user) {
      const idToken = await firebase.auth().currentUser!.getIdToken()

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
