import { mdiChevronDown } from '@mdi/js'
import type { IsoDate } from '@naturalcycles/js-lib/types'
import type { JSX } from 'preact'
import { useEffect, useRef } from 'preact/hooks'
import { Icon } from '#src/components/Icon.jsx'
import { timeHM, unixtimePretty } from '#src/filters/filters.js'
import {
  closeUnstarDialog,
  dayLoading,
  days,
  groupsByDay,
  loadMore,
  reload,
  unstarClick,
  unstarConfirm,
  unstarDialog,
} from '#src/pages/releasesLoader.js'
import type { ReleaseGroup } from '#src/pages/releasesLoader.js'
import type { Release } from '#src/srv/model.js'
import { dismissScanningResumed, releasesCount, showScanningResumed, store } from '#src/store.js'

export function ReleasesPage(): JSX.Element {
  useEffect(() => {
    void reload()
  }, [])

  useEffect(() => {
    // Auto-reload when the tab becomes visible again, at most once a minute
    let lastAutoReload = 0
    const onVisibilityChange = (): void => {
      if (document.visibilityState !== 'visible') return
      if (Date.now() - lastAutoReload < 60_000) return
      lastAutoReload = Date.now()
      void reload()
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [])

  return (
    <div class="container releases">
      {showScanningResumed.value && <ScanningResumedNotice />}

      <Stats />

      <div class="rows">
        {days.value.map(day => (
          <Day key={day} day={day} />
        ))}

        {!dayLoading.value && !releasesCount.value && <EmptyState />}

        <LoadMore />
      </div>

      <UnstarDialog />
    </div>
  )
}

function ScanningResumedNotice(): JSX.Element {
  return (
    <div class="notice" role="status">
      <div class="notice-title">Welcome back!</div>
      Scanning of your starred repos was paused while you were away (no visits in 30+ days). It is
      now resumed: missed releases will show up here within minutes.
      <button type="button" class="btn-icon" aria-label="Dismiss" onClick={dismissScanningResumed}>
        ×
      </button>
    </div>
  )
}

function Stats(): JSX.Element {
  const stats = [
    `Last updated: ${unixtimePretty(store.releasesUpdaterLastFinished.value)}`,
    `Starred repos: ${store.userFM.value.starredReposCount ?? ''}`,
  ].join('\n')

  return (
    <div class="stats-row">
      <pre class="stats">{stats}</pre>
      <button
        type="button"
        class="btn btn-primary"
        disabled={store.ghostMode.value}
        onClick={() => void reload()}
      >
        Reload
      </button>
    </div>
  )
}

function Day({ day }: { day: IsoDate }): JSX.Element | null {
  const groups = groupsByDay.value[day]
  if (!groups?.length) return null

  return (
    <section>
      <h2 class="day">{day}</h2>
      {groups.map(g =>
        // Ungrouped: single release from this repo. Grouped: multiple releases from this repo
        g.releases.length === 1 ? (
          <ReleaseRow key={g.repo} r={g.releases[0]!} />
        ) : (
          <GroupRow key={g.repo} group={g} />
        ),
      )}
    </section>
  )
}

function ReleaseRow({ r, child = false }: { r: Release; child?: boolean }): JSX.Element {
  return (
    <details class={child ? 'row child' : 'row'}>
      <summary>
        <img class="avatar" src={r.avatarUrl + '&s=80'} alt="" loading="lazy" />
        <div class="title">
          {!child && (
            <>
              {r.repoFullName}
              <br />
            </>
          )}
          <span class="ver">{r.tagName}</span>
        </div>
        <div class="time">
          {timeHM(r.published)}
          <Icon path={mdiChevronDown} class="chev" />
        </div>
      </summary>
      <div class="body">
        <div class="actions">
          <a class="btn" href={releaseUrl(r)} target="_blank" rel="noopener">
            view on github
          </a>
          <button type="button" class="btn" onClick={() => unstarClick(r.repoFullName)}>
            unstar
          </button>
        </div>

        {/* GitHub-rendered release notes, same trust level as the old v-html */}
        <div class="md" dangerouslySetInnerHTML={{ __html: r.descrHtml }} />
      </div>
    </details>
  )
}

function GroupRow({ group }: { group: ReleaseGroup }): JSX.Element {
  const { releases } = group

  return (
    <details class="row group">
      <summary>
        <img class="avatar" src={group.avatarUrl + '&s=80'} alt="" loading="lazy" />
        <div class="title">
          {group.repo}
          <div class="group-tags">
            {releases.slice(0, releases.length > 3 ? 2 : 3).map(r => (
              <span key={r.id} class="ver">
                {r.tagName}
              </span>
            ))}
            {releases.length > 3 && <span class="ver">+{releases.length - 2} more</span>}
          </div>
        </div>
        <div class="time">
          {timeHM(group.latestPublished)}
          <Icon path={mdiChevronDown} class="chev" />
        </div>
      </summary>
      {/* Expanded group: individual releases */}
      {releases.map(r => (
        <ReleaseRow key={r.id} r={r} child />
      ))}
    </details>
  )
}

function EmptyState(): JSX.Element {
  return (
    <p class="empty">
      You have 0 releases in last 30 days. Either you have too few starred projects or maybe there's
      a glitch in the system, so check back in 10 minutes.
    </p>
  )
}

function LoadMore(): JSX.Element {
  const day = dayLoading.value

  return (
    <div class="load-more">
      {day ? (
        `loading ${day}...`
      ) : (
        <button type="button" class="btn btn-primary" onClick={() => void loadMore()}>
          Load more
        </button>
      )}
    </div>
  )
}

function UnstarDialog(): JSX.Element {
  const ref = useRef<HTMLDialogElement>(null)
  const dialog = unstarDialog.value
  const open = !!dialog

  useEffect(() => {
    const el = ref.current!
    if (open) {
      // showModal() throws on an already open dialog
      if (!el.open) el.showModal()
    } else {
      el.close()
    }
  }, [open])

  return (
    <dialog
      ref={ref}
      class="dialog"
      onClose={closeUnstarDialog}
      onClick={e => {
        // The dialog has no padding, so a click on the element itself is a backdrop click
        if (e.target === ref.current) closeUnstarDialog()
      }}
    >
      {dialog && (
        <div class="dialog-body">
          <h2>{dialog.needsPermission ? 'GitHub permission needed' : 'Unstar repo'}</h2>
          {dialog.needsPermission ? (
            <>
              <p>
                To unstar from here, Releases needs the <b>public_repo</b> permission on GitHub.
                GitHub has no narrower permission for stars, and <b>public_repo</b> grants much more
                than that:
              </p>
              <ul>
                <li>
                  Read <b>and write</b> access to all <b>public</b> repositories you have write
                  access to (yours and your organizations'): code, releases, settings, webhooks,
                  collaborators.
                </li>
                <li>No access to private repositories.</li>
                <li>
                  Organizations that restrict third-party apps stay blocked, unless an owner
                  approves.
                </li>
              </ul>
              <p>
                The token is stored encrypted on the Releases server and only used to unstar. You
                can revoke it anytime in GitHub → Settings → Applications.
              </p>
              <p>Not sure? Keep unstarring manually on GitHub instead, it's one click there.</p>
            </>
          ) : (
            <p>
              Unstar <b>{dialog.repoFullName}</b> on GitHub? Its releases will no longer show up
              here.
            </p>
          )}
          <div class="dialog-actions">
            <button
              type="button"
              class="btn"
              disabled={store.ghostMode.value}
              onClick={closeUnstarDialog}
            >
              Cancel
            </button>
            {dialog.needsPermission && (
              <a
                class="btn"
                href={`https://github.com/${dialog.repoFullName}`}
                target="_blank"
                rel="noopener"
                onClick={closeUnstarDialog}
              >
                Unstar on GitHub
              </a>
            )}
            <button
              type="button"
              class="btn btn-primary"
              disabled={store.ghostMode.value}
              onClick={() => void unstarConfirm()}
            >
              {dialog.needsPermission ? 'Grant public_repo' : 'Unstar'}
            </button>
          </div>
        </div>
      )}
    </dialog>
  )
}

function releaseUrl(r: Release): string {
  return `https://github.com/${r.repoFullName}/releases/tag/${r.tagName || 'v' + r.v}`
}
