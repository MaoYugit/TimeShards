import { marked } from 'marked'

marked.setOptions({
  gfm: true,
  breaks: false,
})

/** 外链新标签打开；mailto 保持默认 */
function patchExternalLinks(html: string): string {
  return html.replace(
    /<a href="(https?:\/\/[^"#?][^"]*)"/gi,
    '<a href="$1" target="_blank" rel="noopener noreferrer"',
  )
}

export function renderResumeMarkdown(source: string): string {
  const raw = marked.parse(source, { async: false }) as string
  return patchExternalLinks(raw)
}
