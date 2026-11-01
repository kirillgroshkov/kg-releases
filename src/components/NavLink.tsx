import type { AnchorHTMLAttributes, JSX } from 'preact'
import { useLocation } from 'preact-iso'

// `AnchorHTMLAttributes` is an intersection type (not an interface), so it cannot be `extends`-ed
type Props = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }

/**
 * Navigation link that marks the current page (`aria-current="page"`, styled via `a[aria-current]`)
 * and disables navigation to it.
 *
 * Links have no `disabled` attribute, and `aria-disabled` would leave a dead link in the tab order.
 * The accessible way to "disable" a link is to not make it one: an `<a>` without `href` is an HTML
 * placeholder link, which is not focusable, not clickable and read as plain text, while staying the
 * same element for styling. `aria-current` tells assistive tech why it is not a link.
 *
 * Navigation itself needs no component: preact-iso's LocationProvider intercepts clicks on
 * same-origin `<a href>` tags (and ignores anchors without href).
 */
export function NavLink(props: Props): JSX.Element {
  const { href, ...rest } = props
  const { path } = useLocation()
  if (path === href) return <a {...rest} aria-current="page" />
  return <a {...rest} href={href} />
}
