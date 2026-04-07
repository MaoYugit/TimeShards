/** 与博客 Markdown 渲染器一致的标题 slug，保证目录锚点与 h2/h3 id 一致 */

export function createHeadingSlugger() {
  const counts = new Map<string, number>()

  return {
    reset() {
      counts.clear()
    },
    slug(text: string): string {
      let base = text
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-zA-Z0-9\u4e00-\u9fff-]/g, '')
        .slice(0, 64) || 'section'
      const n = counts.get(base) ?? 0
      counts.set(base, n + 1)
      return n === 0 ? base : `${base}-${n}`
    },
  }
}

/** 从正文（无 frontmatter）提取 ## / ###，顺序与渲染时 slug 规则一致 */
export function extractTocFromMarkdown(md: string): { id: string; text: string; depth: 2 | 3 }[] {
  const slugger = createHeadingSlugger()
  const out: { id: string; text: string; depth: 2 | 3 }[] = []
  for (const line of md.replace(/\r\n/g, '\n').split('\n')) {
    const m = /^(#{2,3})\s+(.+)$/.exec(line.trim())
    if (!m?.[1] || !m[2]) continue
    const depth = m[1].length as 2 | 3
    if (depth !== 2 && depth !== 3) continue
    const raw = m[2]
    const plain = raw
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
      .trim()
    const id = slugger.slug(plain)
    out.push({ id, text: plain, depth })
  }
  return out
}
