class UrlUtil {
  qs(): Record<string, string> {
    const queryString = location.search
    const query: Record<string, string> = {}
    const pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&')
    for (const p of pairs) {
      const pair = p.split('=')
      const k = decodeURIComponent(pair[0])
      if (k) query[k] = decodeURIComponent(pair[1] || '')
    }
    return query
  }
}

export const urlUtil = new UrlUtil()
