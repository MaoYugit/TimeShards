import { parseTagsField, splitFrontmatter } from '@/utils/frontmatter'

export type BlogCategory = '前端' | '工程化' | 'AI 开发' | '随笔'

export type BlogPost = {
  id: string
  title: string
  publishedAt: string
  updatedAt: string
  category: BlogCategory
  tags: string[]
  content: string
}

const modules = import.meta.glob('./blog/posts/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const CATEGORY_SET = new Set<BlogCategory>(['前端', '工程化', 'AI 开发', '随笔'])

function parseCategory(s: string | undefined): BlogCategory {
  const t = (s ?? '').trim() as BlogCategory
  return CATEGORY_SET.has(t) ? t : '随笔'
}

function buildPosts(): BlogPost[] {
  const list: BlogPost[] = []
  for (const [path, raw] of Object.entries(modules)) {
    const id = /posts\/([^/]+)\.md$/.exec(path)?.[1]
    if (!id) continue
    const { meta, body } = splitFrontmatter(typeof raw === 'string' ? raw : '')
    const title = meta.title?.trim() || id
    const publishedAt = meta.publishedAt?.trim() || new Date(0).toISOString()
    const updatedAt = meta.updatedAt?.trim() || publishedAt
    const category = parseCategory(meta.category)
    const tags = meta.tags ? parseTagsField(meta.tags) : []
    list.push({
      id,
      title,
      publishedAt,
      updatedAt,
      category,
      tags,
      content: body,
    })
  }
  return list.sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt))
}

export const blogPosts: BlogPost[] = buildPosts()

export const blogCategories: Array<'全部' | BlogCategory> = [
  '全部',
  ...Array.from(new Set(blogPosts.map((p) => p.category))),
]

export function getBlogPostById(id: string): BlogPost | undefined {
  return blogPosts.find((p) => p.id === id)
}

export function excerptFromMarkdown(md: string, max = 120): string {
  const plain = md
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*]\([^)]+\)/g, ' ')
    .replace(/\[[^\]]+]\([^)]+\)/g, '$1')
    .replace(/[#>*_\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return plain.length > max ? `${plain.slice(0, max).trimEnd()}...` : plain
}

export function postMatchesQuery(post: BlogPost, q: string): boolean {
  const needle = q.trim()
  if (!needle) return true
  if (post.title.includes(needle)) return true
  if (post.category.includes(needle)) return true
  if (post.tags.some((t) => t.includes(needle))) return true
  return excerptFromMarkdown(post.content, 100_000).includes(needle)
}
