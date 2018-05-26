import { memo } from '@/decorators/memo.decorator'
import { Progress } from '@/decorators/progress.decorator'
import { analyticsService } from '@/srv/analytics.service'
import { AuthResp, releasesService } from '@/srv/releases.service'
import { sentryService } from '@/srv/sentry.service'
import { commit } from '@/store'
import { jsonify, objectUtil } from '@/util/object.util'
import { promiseUtil } from '@/util/promise.util'
import { urlUtil } from '@/util/url.util'
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
    firebase.auth!().onAuthStateChanged(user => this.onAuthStateChanged(user as any))
  }

  async login (): Promise<AuthResp> {
    const r = await firebase.auth!().signInWithPopup(githubAuthProvider)
    // const r = await firebase.auth!().signInWithRedirect(githubAuthProvider)
    console.log(r)
    const idToken = await firebase.auth!().currentUser!.getIdToken()
    console.log('idToken', idToken)

    const authResp = await releasesService.auth({
      username: r.additionalUserInfo.username,
      accessToken: r.credential.accessToken,
      idToken,
    })

    return authResp
  }

  @Progress()
  async logout (): Promise<void> {
    await firebase.auth!().signOut()
    sentryService.setUserContext({})
  }

  private async onAuthStateChanged (_user?: UserInfo): Promise<void> {
    console.log('onAuthStateChanged, user: ', jsonify(_user))
    this.authStateChangedDeferred.resolve()

    if (_user) {
      const idToken = await firebase.auth!().currentUser!.getIdToken()

      // console.log('idToken', idToken)
      const user = {
        ...objectUtil.pick<UserInfo>(_user, USER_FIELDS),
        idToken,
      }

      sentryService.setUserContext(user)
      analyticsService.setUserId(user.uid)

      // debug!
      const qs = urlUtil.qs()
      // console.log('qs', qs, _user)
      if (qs.testUid) {
        user.uid = qs.testUid
      }

      commit({
        user,
      })
    } else {
      commit({ user: {} as any })
    }
  }
}

export const firebaseService = new FirebaseService()
