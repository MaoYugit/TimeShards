/** 极简 YAML frontmatter（仅 key: value 单行），用于博客文章元数据 */

export function splitFrontmatter(raw: string): { meta: Record<string, string>; body: string } {
  const lines = raw.replace(/\r\n/g, '\n').split('\n')
  if (lines[0]?.trim() !== '---') {
    return { meta: {}, body: raw }
  }
  let i = 1
  const meta: Record<string, string> = {}
  while (i < lines.length) {
    const line = lines[i] ?? ''
    if (line.trim() === '---') break
    const m = /^([a-zA-Z_]+):\s*(.*)$/.exec(line)
    if (m?.[1]) meta[m[1]] = (m[2] ?? '').trim()
    i++
  }
  if (i >= lines.length || lines[i]?.trim() !== '---') {
    return { meta: {}, body: raw }
  }
  const body = lines.slice(i + 1).join('\n').replace(/^\n+/, '')
  return { meta, body }
}

export function parseTagsField(s: string): string[] {
  const t = s.trim()
  if (t.startsWith('[') && t.endsWith(']')) {
    return t
      .slice(1, -1)
      .split(/[,，]/)
      .map((x) => x.trim())
      .filter(Boolean)
  }
  return t.split(/[,，]/).map((x) => x.trim()).filter(Boolean)
}
