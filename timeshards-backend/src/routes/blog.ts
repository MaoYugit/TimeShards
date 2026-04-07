import express from 'express'
import { BlogPostModel } from '../models/BlogPost.js'
import { requireAdmin } from '../middleware/adminAuth.js'

const router = express.Router()

const CATEGORIES = ['前端', '工程化', 'AI 开发', '随笔'] as const

function normalizeCategory(input: unknown): (typeof CATEGORIES)[number] {
  const t = typeof input === 'string' ? input.trim() : ''
  return CATEGORIES.includes(t as (typeof CATEGORIES)[number]) ? (t as (typeof CATEGORIES)[number]) : '随笔'
}

/** 列表与前端 blog.ts 字段对齐：id = slug */
router.get('/', async (req, res, next) => {
  try {
    const category = typeof req.query.category === 'string' ? req.query.category.trim() : ''
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : ''

    const filter: Record<string, unknown> = { published: true }
    if (category && category !== '全部' && CATEGORIES.includes(category as (typeof CATEGORIES)[number])) {
      filter.category = category
    }

    const posts = await BlogPostModel.find(filter).sort({ publishedAt: -1 }).lean().exec()

    const mapped = posts.map((p) => ({
      id: p.slug,
      title: p.title,
      publishedAt: p.publishedAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      category: p.category,
      tags: p.tags,
      content: p.content,
    }))

    if (!q) {
      res.json(mapped)
      return
    }

    const needle = q.toLowerCase()
    const filtered = mapped.filter((p) => {
      if (p.title.toLowerCase().includes(needle)) return true
      if (p.category.toLowerCase().includes(needle)) return true
      if (p.tags.some((t) => t.toLowerCase().includes(needle))) return true
      if (p.content.toLowerCase().includes(needle)) return true
      return false
    })
    res.json(filtered)
  } catch (e) {
    next(e)
  }
})

router.get('/:slug', async (req, res, next) => {
  try {
    const doc = await BlogPostModel.findOne({ slug: req.params.slug, published: true }).lean().exec()
    if (!doc) {
      res.status(404).json({ error: 'Not found' })
      return
    }
    res.json({
      id: doc.slug,
      title: doc.title,
      publishedAt: doc.publishedAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
      category: doc.category,
      tags: doc.tags,
      content: doc.content,
    })
  } catch (e) {
    next(e)
  }
})

router.post('/', requireAdmin, async (req, res, next) => {
  try {
    const body = req.body as Record<string, unknown>
    const slug = typeof body.slug === 'string' ? body.slug.trim() : ''
    const title = typeof body.title === 'string' ? body.title.trim() : ''
    const content = typeof body.content === 'string' ? body.content : ''
    if (!slug || !title || !content) {
      res.status(400).json({ error: 'slug, title, content required' })
      return
    }

    const now = new Date()
    const publishedAt =
      typeof body.publishedAt === 'string' && body.publishedAt ? new Date(body.publishedAt) : now
    const updatedAt =
      typeof body.updatedAt === 'string' && body.updatedAt ? new Date(body.updatedAt) : now

    const doc = await BlogPostModel.create({
      slug,
      title,
      content,
      publishedAt,
      updatedAt,
      category: normalizeCategory(body.category),
      tags: Array.isArray(body.tags) ? body.tags.map(String) : [],
      published: body.published !== false,
    })

    res.status(201).json({
      id: doc.slug,
      title: doc.title,
      publishedAt: doc.publishedAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
      category: doc.category,
      tags: doc.tags,
      content: doc.content,
    })
  } catch (e: unknown) {
    if (typeof e === 'object' && e !== null && 'code' in e && (e as { code: number }).code === 11000) {
      res.status(409).json({ error: 'slug already exists' })
      return
    }
    next(e)
  }
})

router.put('/:slug', requireAdmin, async (req, res, next) => {
  try {
    const body = req.body as Record<string, unknown>
    const updates: Record<string, unknown> = {}
    if (typeof body.title === 'string') updates.title = body.title.trim()
    if (typeof body.content === 'string') updates.content = body.content
    if (body.category !== undefined) updates.category = normalizeCategory(body.category)
    if (Array.isArray(body.tags)) updates.tags = body.tags.map(String)
    if (typeof body.publishedAt === 'string') updates.publishedAt = new Date(body.publishedAt)
    if (typeof body.updatedAt === 'string') updates.updatedAt = new Date(body.updatedAt)
    else updates.updatedAt = new Date()
    if (typeof body.published === 'boolean') updates.published = body.published

    const doc = await BlogPostModel.findOneAndUpdate({ slug: req.params.slug }, updates, {
      new: true,
    })
      .lean()
      .exec()
    if (!doc) {
      res.status(404).json({ error: 'Not found' })
      return
    }
    res.json({
      id: doc.slug,
      title: doc.title,
      publishedAt: doc.publishedAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
      category: doc.category,
      tags: doc.tags,
      content: doc.content,
    })
  } catch (e) {
    next(e)
  }
})

router.delete('/:slug', requireAdmin, async (req, res, next) => {
  try {
    const r = await BlogPostModel.deleteOne({ slug: req.params.slug })
    if (r.deletedCount === 0) {
      res.status(404).json({ error: 'Not found' })
      return
    }
    res.status(204).end()
  } catch (e) {
    next(e)
  }
})

export const blogRouter: express.Router = router
