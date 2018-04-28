/* tslint:disable:no-null-keyword */

export class ObjectUtil {
  // Picks just allowed fields and no other fields
  // pick<T> (obj: any, fields: string[], initialObject = {}): T {
  pick<T> (obj: T, fields: string[], initialObject: Partial<T> = {}): T {
    return fields.reduce(
      (res: any, name) => {
        if ((obj as any)[name] !== undefined) res[name] = (obj as any)[name]
        return res
      },
      initialObject as T,
    )
  }

  /**
   * Mutates and returns.
   * Removes "falsy" value from the object.
   */
  filterFalsyValues<T extends object> (o: T): T {
    for (const p in o) {
      if (!o.hasOwnProperty(p)) continue
      if (!o[p]) {
        delete o[p]
      }
    }

    return o
  }

  deepEquals (a: object, b: object): boolean {
    return JSON.stringify(this.sortObjectDeep(a)) === JSON.stringify(this.sortObjectDeep(b))
  }

  /**
   * Deep copy object (by json parse/stringify).
   */
  deepCopy<T> (o: T): T {
    return JSON.parse(JSON.stringify(o))
  }

  isObject (item: any): boolean {
    return item && typeof item === 'object' && !Array.isArray(item) && item !== null
  }

  isEmpty (obj: any): boolean {
    return obj && obj.constructor === Object && Object.keys(obj).length === 0
  }

  // from: https://gist.github.com/Salakar/1d7137de9cb8b704e48a
  mergeDeep (target: any, source: any): any {
    if (this.isObject(target) && this.isObject(source)) {
      Object.keys(source).forEach(key => {
        if (this.isObject(source[key])) {
          if (!target[key]) Object.assign(target, { [key]: {} })
          this.mergeDeep(target[key], source[key])
        } else {
          Object.assign(target, { [key]: source[key] })
        }
      })
    }
    return target
  }

  nl2br (s: string): string {
    return (s + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1<br>$2')
  }

  /**
   * Mutates
   */
  deepTrim (o: any): any {
    if (!o) return o

    if (typeof o === 'string') {
      return o.trim()
    } else if (typeof o === 'object') {
      Object.keys(o).forEach(k => {
        o[k] = this.deepTrim(o[k])
      })
    }

    return o
  }

  sortObject<T> (o: T): T {
    if (!o) return o
    return Object.keys(o)
      .sort()
      .reduce((r: any, k: any) => ((r[k] = (o as any)[k]), r), {} as any)
  }

  private defaultSortFn (a: any, b: any): number {
    return a.localeCompare(b)
  }

  // based on: https://github.com/IndigoUnited/js-deep-sort-object
  sortObjectDeep<T> (o: T): T {
    // array
    if (Array.isArray(o)) {
      return o.map(i => this.sortObjectDeep(i)) as any
    }

    if (this.isObject(o)) {
      const out: any = {}

      Object.keys(o)
        .sort((a, b) => this.defaultSortFn(a, b))
        .forEach(k => {
          out[k] = this.sortObjectDeep((o as any)[k])
        })

      return out
    }

    return o
  }

  // from: https://github.com/jonschlinkert/unset-value
  // mutates obj
  unsetValue (obj: any, prop: string): void {
    if (!this.isObject(obj)) {
      return
    }
    if (obj.hasOwnProperty(prop)) {
      delete obj[prop]
      return
    }

    const segs = prop.split('.')
    let last = segs.pop()
    while (segs.length && segs[segs.length - 1].slice(-1) === '\\') {
      last = segs.pop()!.slice(0, -1) + '.' + last
    }
    while (segs.length) obj = obj[(prop = segs.shift()!)]
    if (!this.isObject(obj)) return
    delete obj[last!]
  }

  /**
   * Warning! Mutates the object! Unless you pass "deepCopy = true"
   */
  mask<T extends object> (_o: T, exclude: string[], deepCopy = false): T {
    let o = { ...(_o as object) }
    if (deepCopy) o = this.deepCopy(o)

    exclude.forEach(e => {
      // eval(`delete o.${e}`)
      this.unsetValue(o, e)
    })
    return o as T
  }

  /**
   * Turns ['a', b'] into {a: true, b: true}
   */
  arrayToHash (a: any[] = []): { [k: string]: boolean } {
    return a.reduce((o, item) => {
      o[item] = true
      return o
    }, {})
  }
}

export const objectUtil = new ObjectUtil()
