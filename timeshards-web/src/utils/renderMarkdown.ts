import { Marked, type Tokens } from 'marked'
import { createHeadingSlugger } from '@/utils/headingSlug'

const resumeMarked = new Marked({ gfm: true, breaks: false })

function patchExternalLinks(html: string): string {
  return html.replace(
    /<a href="(https?:\/\/[^"]*)"/gi,
    '<a href="$1" target="_blank" rel="noopener noreferrer"',
  )
}

export function renderMarkdown(source: string): string {
  const raw = resumeMarked.parse(source, { async: false }) as string
  return patchExternalLinks(raw)
}

let blogHeadingSlugger = createHeadingSlugger()

const blogMarked = new Marked({ gfm: true, breaks: false })
blogMarked.use({
  renderer: {
    heading(this: { parser: { parseInline: (tokens: Tokens.Generic[]) => string } }, token: Tokens.Heading) {
      if (token.depth !== 2 && token.depth !== 3) {
        return false
      }
      const id = blogHeadingSlugger.slug(token.text)
      const inner = this.parser.parseInline(token.tokens)
      return `<h${token.depth} id="${id}">${inner}</h${token.depth}>\n`
    },
  },
})

/** 博客正文：为 h2/h3 生成锚点 id，供目录跳转 */
export function renderBlogMarkdown(source: string): string {
  blogHeadingSlugger = createHeadingSlugger()
  const raw = blogMarked.parse(source, { async: false }) as string
  return patchExternalLinks(raw)
}
