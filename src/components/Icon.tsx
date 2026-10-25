import type { JSX } from 'preact'

export function Icon({ path, class: cls }: { path: string; class?: string }): JSX.Element {
  return (
    <svg class={cls} viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
      <path d={path} fill="currentColor" />
    </svg>
  )
}
