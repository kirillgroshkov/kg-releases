import type { ExportedHandler, IncomingRequestCfProperties } from '@cloudflare/workers-types'

/**
 * The dynamic part of the site, a Cloudflare Worker (see wrangler.jsonc).
 * Only /api/* requests run it (`run_worker_first`), everything else is served from the static
 * assets in dist/ without invoking it.
 */
// The Workers runtime requires the handler as the default export
// oxlint-disable-next-line import/no-default-export
export default {
  fetch(request) {
    const { pathname } = new URL(request.url)
    if (pathname === '/api/geo') return geo(request.cf)
    return Response.json({ error: 'Not found' }, { status: 404 })
  },
} satisfies ExportedHandler

/**
 * GET /api/geo, for testing: open it in a browser to see where Cloudflare thinks you are.
 * The app doesn't use it.
 */
interface Geo {
  /**
   * ISO 3166-1 alpha-2, e.g. `SE`. `T1` for Tor, `XX` for unknown.
   */
  country?: string
  city?: string
  region?: string
  /**
   * IANA time zone, e.g. `Europe/Stockholm`.
   */
  timezone?: string
  /**
   * IATA airport code of the Cloudflare data center that served the request, e.g. `ARN`.
   */
  colo?: string
}

/**
 * Where the visitor is, as Cloudflare sees it from their IP, and which Cloudflare data center
 * served them. Cloudflare fills in request.cf on every request: no lookup or third-party service.
 */
function geo(cf: IncomingRequestCfProperties | undefined): Response {
  const geo: Geo = {
    country: cf?.country,
    city: cf?.city,
    region: cf?.region,
    timezone: cf?.timezone,
    colo: cf?.colo,
  }

  // Indented, as it's meant to be read in a browser tab
  return new Response(JSON.stringify(geo, null, 2), {
    headers: {
      'content-type': 'application/json',
      // Differs per visitor, so no shared cache may store it
      'cache-control': 'private, no-store',
    },
  })
}
