// Based on:
// https://github.com/mgechev/memo-decorator/blob/master/index.ts
// http://decodize.com/blog/2012/08/27/javascript-memoization-caching-results-for-better-performance/
// http://inlehmansterms.net/2015/03/01/javascript-memoization/
/* tslint:disable:no-invalid-this */
import * as LRU from 'lru-cache'

type Resolver = (...args: any[]) => any

interface MemoOpts {
  cacheKeyFn?: Resolver
  ttl?: number
  maxSize?: number
}

function jsonCacheKey (args: any[]): string {
  return JSON.stringify(args)
}

export const memo = (opts: MemoOpts = {}) => (
  target: any,
  key: string,
  descriptor: PropertyDescriptor,
): PropertyDescriptor => {
  if (typeof descriptor.value !== 'function') {
    throw new Error('Memoization can be applied only to methods')
  }

  const originalFn = descriptor.value

  if (!opts.cacheKeyFn) opts.cacheKeyFn = jsonCacheKey

  const lruOpts: LRU.Options = {
    max: opts.maxSize || 100,
    maxAge: opts.ttl || Infinity,
  }
  const cache = new LRU<string, any>(lruOpts)

  // descriptor.value = memoize(descriptor.value, opts.resolver)
  descriptor.value = function (...args: any[]): any {
    const cacheKey = opts.cacheKeyFn!(args)

    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey)
      // console.log('returning value from cache: ', cacheKey, key)
      return cached
    }

    const res: any = originalFn.apply(this, args)
    cache.set(cacheKey, res)
    return res
  }

  return descriptor
}
