import '#src/css/global.css'
import { pDelay } from '@naturalcycles/js-lib/promise'
import { render } from 'preact'
import { App } from '#src/App.jsx'
import { prod } from '#src/env.js'
import { errorDialog, initSentry } from '#src/error.js'
import { firebaseService } from '#src/srv/firebase.service.js'
import { releasesService } from '#src/srv/releases.service.js'
import { appReady, store } from '#src/store.js'

// oxlint-disable-next-line unicorn/prefer-top-level-await
void main()

async function main(): Promise<void> {
  console.log({ prod })

  // Error handlers go first
  initSentry()

  globalThis.addEventListener('unhandledrejection', event => {
    console.log('unhandledRejection')
    const err = event.reason
    if (err) {
      event.preventDefault()
      errorDialog(err)
    }
    // otherwise - let it propagate
  })

  // mount should happen after Sentry.init, according to Sentry
  render(<App />, document.querySelector('#app')!)

  if (store.user.value.uid) {
    void releasesService.init()
  } else {
    // only init releasesService if user is NOT logged in
    await firebaseService.init()
    // Timeout prevents hanging on the splashscreen if Firebase auth stalls (e.g. iOS multi-tab IndexedDB contention)
    await Promise.race([firebaseService.authStateChanged, pDelay(10_000)])
  }

  void hideLoader()
  appReady.value = true
}

async function hideLoader(): Promise<void> {
  const loader = document.querySelector('#loading0')
  if (!loader) return
  // await pDelay(100)
  loader.addEventListener('transitionend', () => loader.remove(), { once: true })
  loader.classList.add('opacity0')
  // Fallback: transitionend may never fire (e.g. background tab, cancelled transition),
  // so don't rely on it alone. It's only a cleanup (pointer-events: none already unblocks clicks),
  // so the delay is generous: the main thread is often busy rendering right after this call,
  // which delays the start of the 100ms fade, and a short timer would cut it off.
  setTimeout(() => loader.remove(), 2000)
}

// Debug
// const w: any = window
// w.state = () => _deepCopy(store.state)
// w.commit = (type: string, payload?: any) => {
//   store.commit(type, payload)
//   return w.state()
// }
// w.reset = () => {
//   store.commit('reset')
//   return w.state()
// }
// w.getters = store.getters
// w.app = app
// w.clearReleases = () => {
//   store.commit('extendState', { releases: {} })
// }
// w.throwError = () => {
//   throw new Error('my error')
// }
