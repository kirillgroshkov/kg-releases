class ScriptUtil {
  async loadScript (src: string, async = true): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const s = document.createElement('script')
      s.src = src
      s.onload = resolve as any
      s.onerror = reject
      if (async) s.async = true
      document.head!.appendChild(s)
    })
  }
}

export const scriptUtil = new ScriptUtil()
