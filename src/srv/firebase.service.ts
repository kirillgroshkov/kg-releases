import { memo } from '@/decorators/memo.decorator'
import { Progress } from '@/decorators/progress.decorator'
import { releasesService } from '@/srv/releases.service'
import { commit } from '@/store'
import { jsonify, objectUtil } from '@/util/object.util'
import { promiseUtil } from '@/util/promise.util'
import firebase from 'firebase'

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

const githubAuthProvider = new firebase.auth.GithubAuthProvider()

class FirebaseService {
  private authStateChangedDeferred = promiseUtil.defer<void>()
  authStateChanged = this.authStateChangedDeferred.promise

  @memo()
  async init (): Promise<void> {
    firebase.initializeApp(CONFIG)
    firebase.auth().onAuthStateChanged(user => this.onAuthStateChanged(user as any))
  }

  async login (): Promise<any> {
    const r = await firebase.auth().signInWithPopup(githubAuthProvider)
    console.log(r)
    const idToken = await firebase.auth().currentUser!.getIdToken()
    console.log('idToken', idToken)

    await releasesService.auth({
      username: r.additionalUserInfo.username,
      accessToken: r.credential.accessToken,
      idToken,
    })

    return r
  }

  @Progress()
  async logout (): Promise<void> {
    await firebase.auth().signOut()
  }

  private async onAuthStateChanged (_user?: UserInfo): Promise<void> {
    console.log('onAuthStateChanged, user: ', jsonify(_user))
    this.authStateChangedDeferred.resolve()

    if (_user) {
      const idToken = await firebase.auth().currentUser!.getIdToken()
      // console.log('idToken', idToken)
      commit({
        user: {
          ...objectUtil.pick<UserInfo>(_user, USER_FIELDS),
          idToken,
        },
      })
    } else {
      commit({ user: {} as any })
    }
  }
}

export const firebaseService = new FirebaseService()
