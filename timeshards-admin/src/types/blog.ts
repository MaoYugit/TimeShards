export interface BlogPost {
  _id: string
  title: string
  slug: string
  summary: string
  status: 'draft' | 'published'
  publishedAt: string | null
  updatedAt: string
  viewCount: number
  category: BlogCategory
  tags: string[]
  coverImage: string
  content: string
  authorId: string
  createdAt: string
}

export type BlogCategory = '前端' | '工程化' | 'AI 开发' | '随笔'

export interface CreatePostDto {
  title: string
  slug?: string
  summary?: string
  status?: 'draft' | 'published'
  category: BlogCategory
  tags?: string[]
  coverImage?: string
  content: string
}

export interface UpdatePostDto {
  title?: string
  slug?: string
  summary?: string
  status?: 'draft' | 'published'
  category?: BlogCategory
  tags?: string[]
  coverImage?: string
  content?: string
}

export interface QueryPostDto {
  page?: number
  pageSize?: number
  category?: BlogCategory
  status?: 'draft' | 'published'
  q?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ApiResponse<T> {
  code: number
  data: T
  message: string
}
