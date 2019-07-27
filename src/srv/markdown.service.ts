import { memo } from '@naturalcycles/js-lib'
import * as marked from 'marked'

class MarkdownService {
  @memo()
  private parser (): typeof marked {
    // console.log('MDService init...')
    const renderer = new marked.Renderer()
    return marked.setOptions({ renderer })
  }

  parse (s: string): string {
    if (!s) return ''
    const html = this.parser().parse(s)
    return html
  }
}

export const markdownService = new MarkdownService()
