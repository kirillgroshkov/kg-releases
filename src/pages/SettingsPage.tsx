import { _deepEquals } from '@naturalcycles/js-lib/object'
import type { Signal } from '@preact/signals'
import { useComputed, useSignal } from '@preact/signals'
import type { JSX } from 'preact'
import { useLocation } from 'preact-iso'
import { useEffect } from 'preact/hooks'
import { withProgress } from '#src/decorators/decorators.js'
import { firebaseService } from '#src/srv/firebase.service.js'
import type { UserSettings } from '#src/srv/model.js'
import { releasesService } from '#src/srv/releases.service.js'
import { store } from '#src/store.js'

export function SettingsPage(): JSX.Element {
  const { route } = useLocation()
  const settings = useSignal<UserSettings>({})
  const saveEnabled = useComputed(() => !_deepEquals(settings.value, store.userFM.value.settings))

  useEffect(() => {
    void releasesService.init().then(() => init(settings))
  }, [settings])

  async function logout(): Promise<void> {
    await firebaseService.logout()
    route('/')
  }

  async function save(): Promise<void> {
    await withProgress(async () => {
      await releasesService.saveUserSettings(settings.value)
      init(settings)
    })
  }

  return (
    <div class="container form1">
      <label class="field">
        <span>User ID</span>
        <input value={store.userFM.value.id ?? ''} disabled />
      </label>

      <label class="field">
        <span>Email for notifications</span>
        <input
          type="email"
          required
          value={settings.value.notificationEmail ?? ''}
          onInput={e => {
            settings.value = { ...settings.value, notificationEmail: e.currentTarget.value }
          }}
        />
      </label>

      {/*
      <md-checkbox v-model="settings.notifyEmailRealtime">Notify on every release</md-checkbox><br />
      */}
      <label class="check">
        <input
          type="checkbox"
          checked={!!settings.value.notifyEmailDaily}
          onChange={e => {
            settings.value = { ...settings.value, notifyEmailDaily: e.currentTarget.checked }
          }}
        />{' '}
        Notify once a day
      </label>

      <p>
        Please check your SPAM folder and add our sending email address (noreply@inventix.ru) to
        your Contacts if you discover that it goes to SPAM folder.
      </p>

      <p>To unsubscribe - untick the boxes above and click save.</p>

      <button
        type="button"
        class="btn btn-primary"
        disabled={!saveEnabled.value}
        onClick={() => void save()}
      >
        Save
      </button>

      <hr />

      <button type="button" class="btn" onClick={() => void logout()}>
        Logout
      </button>
    </div>
  )
}

/**
 * Resets the form to the saved settings.
 */
function init(settings: Signal<UserSettings>): void {
  settings.value = { ...store.userFM.value.settings }
}
