import { nanoidBrowser } from '@naturalcycles/js-lib/nanoid'
import { api } from '#src/srv/api.service.js'
import { firebaseService } from '#src/srv/firebase.service.js'
import { GITHUB_STARS_APP_CLIENT_ID } from '#src/srv/model.js'
import { releasesService } from '#src/srv/releases.service.js'

const SS_KEY = 'githubStarsConnect'

/**
 * Stored in sessionStorage, while the user is on GitHub authorizing the app.
 */
interface PendingConnect {
  state: string
  codeVerifier: string
  /**
   * Unstar that triggered the connect, completed after it.
   */
  repoFullName: string
}

/**
 * Connects the "stars" GitHub App (only has the "Starring" permission),
 * via the web flow with PKCE: redirect to GitHub, back to /github-callback,
 * then the Backend exchanges the code for a token.
 */
class GithubStarsService {
  /**
   * Redirects to GitHub. After authorization GitHub redirects back to /github-callback.
   */
  async connect(repoFullName: string): Promise<void> {
    const state = nanoidBrowser()
    // PKCE requires 43-128 chars of [A-Za-z0-9-._~], nanoid alphabet is a subset of it
    const codeVerifier = nanoidBrowser(43)
    const pending: PendingConnect = { state, codeVerifier, repoFullName }
    sessionStorage.setItem(SS_KEY, JSON.stringify(pending))

    const params = new URLSearchParams({
      client_id: GITHUB_STARS_APP_CLIENT_ID,
      redirect_uri: `${location.origin}/github-callback`,
      state,
      code_challenge: await sha256Base64Url(codeVerifier),
      code_challenge_method: 'S256',
    })
    location.href = `https://github.com/login/oauth/authorize?${params}`
  }

  /**
   * Called on /github-callback: connects the app, then completes the pending unstar.
   * Returns repoFullName of the unstarred repo.
   */
  async onCallback(query: URLSearchParams): Promise<string> {
    const pending = JSON.parse(sessionStorage.getItem(SS_KEY) || 'null') as PendingConnect | null
    sessionStorage.removeItem(SS_KEY)

    if (!pending || query.get('state') !== pending.state) {
      throw new Error('GitHub authorization failed (state mismatch), please try again')
    }

    const code = query.get('code')
    if (!code) {
      // e.g ?error=access_denied, if the user cancelled
      throw new Error(`GitHub authorization was not completed: ${query.get('error') || 'no code'}`)
    }

    await firebaseService.refreshIdToken() // protected endpoint
    await api.post('githubStars/connect', {
      json: {
        code,
        codeVerifier: pending.codeVerifier,
      },
    })

    await releasesService.unstarRepo(pending.repoFullName)
    return pending.repoFullName
  }
}

export const githubStarsService = new GithubStarsService()

async function sha256Base64Url(s: string): Promise<string> {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s))
  return new Uint8Array(hash).toBase64({ alphabet: 'base64url', omitPadding: true })
}
