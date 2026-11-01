import type { JSX } from 'preact'

interface Props {
  path: string
  class?: string
}

export function Icon(props: Props): JSX.Element {
  const { path, class: cls } = props

  return (
    <svg class={cls} viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
      <path d={path} fill="currentColor" />
    </svg>
  )
}
