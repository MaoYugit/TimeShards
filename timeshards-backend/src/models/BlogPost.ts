import mongoose, { Schema } from 'mongoose'

const CATEGORIES = ['前端', '工程化', 'AI 开发', '随笔'] as const

export type BlogCategory = (typeof CATEGORIES)[number]

export interface BlogPostDoc {
  slug: string
  title: string
  publishedAt: Date
  updatedAt: Date
  category: BlogCategory
  tags: string[]
  content: string
  published: boolean
}

const blogPostSchema = new Schema<BlogPostDoc>(
  {
    slug: { type: String, required: true, unique: true, trim: true, index: true },
    title: { type: String, required: true, trim: true },
    publishedAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true },
    category: {
      type: String,
      required: true,
      enum: CATEGORIES,
      default: '随笔',
    },
    tags: { type: [String], default: [] },
    content: { type: String, required: true },
    published: { type: Boolean, default: true },
  },
  { timestamps: false },
)

export const BlogPostModel = mongoose.model<BlogPostDoc>('BlogPost', blogPostSchema)
