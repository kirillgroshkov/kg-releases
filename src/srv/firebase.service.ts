import { Progress } from '@/decorators/progress.decorator'
import { analyticsService } from '@/srv/analytics.service'
import { BackendResponse, releasesService } from '@/srv/releases.service'
import { sentryService } from '@/srv/sentry.service'
import { extendState } from '@/store'
import { jsonify, objectUtil } from '@/util/object.util'
import { promiseUtil } from '@/util/promise.util'
import { urlUtil } from '@/util/url.util'
import { memo } from '@naturalcycles/js-lib'
import firebase from 'firebase/app'
import 'firebase/auth'

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
}

const USER_FIELDS: (keyof UserInfo)[] = ['uid', 'displayName', 'email', 'photoURL']

const githubAuthProvider = new firebase.auth!.GithubAuthProvider()

class FirebaseService {
  private authStateChangedDeferred = promiseUtil.defer<void>()
  authStateChanged = this.authStateChangedDeferred.promise

  @memo()
  async init (): Promise<void> {
    firebase.initializeApp(CONFIG)
    firebase.auth().onAuthStateChanged(user => this.onAuthStateChanged(user as any))
  }

  async login (): Promise<BackendResponse> {
    const r = (await firebase.auth!().signInWithPopup(githubAuthProvider)) as any
    // const r = await firebase.auth!().signInWithRedirect(githubAuthProvider)
    console.log(r)
    const idToken = await firebase.auth!().currentUser!.getIdToken()
    // console.log('idToken', idToken)

    const br = await releasesService.auth({
      username: r.additionalUserInfo!.username,
      accessToken: r.credential!.accessToken,
      idToken,
    })

    return br
  }

  @Progress()
  async logout (): Promise<void> {
    await firebase.auth!().signOut()
    sentryService.setUserContext({})
  }

  private async onAuthStateChanged (_user?: UserInfo): Promise<void> {
    console.log('onAuthStateChanged, user: ', jsonify(_user))

    // debug!
    const qs = urlUtil.qs()
    if (qs.uid) {
      console.log('debug: ?uid')
      const user = {
        uid: qs.uid,
      } as UserInfo

      sentryService.setUserContext(user)
      analyticsService.setUserId(user.uid)

      extendState({
        user,
      })
    } else if (_user) {
      const idToken = await firebase.auth!().currentUser!.getIdToken()

      // console.log('idToken', idToken)
      const user = {
        ...objectUtil.pick<UserInfo>(_user, USER_FIELDS),
        idToken,
      }

      sentryService.setUserContext(user)
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

    this.authStateChangedDeferred.resolve()
  }
}

export const firebaseService = new FirebaseService()
