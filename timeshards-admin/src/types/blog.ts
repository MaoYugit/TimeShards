export interface BlogPost {
  _id: string
  title: string
  slug: string
  summary: string
  status: 'draft' | 'published'
  publishedAt: string | null
  updatedAt: string
  viewCount: number
  category: string
  tags: string[]
  coverImage: string
  content: string
  authorId: string
  createdAt: string
}

export type BlogCategory = string

export interface CreatePostDto {
  title: string
  slug?: string
  summary?: string
  status?: 'draft' | 'published'
  category: string
  tags?: string[]
  coverImage?: string
  content: string
}

export interface UpdatePostDto {
  title?: string
  slug?: string
  summary?: string
  status?: 'draft' | 'published'
  category?: string
  tags?: string[]
  coverImage?: string
  content?: string
}

export interface QueryPostDto {
  page?: number
  pageSize?: number
  category?: string
  status?: 'draft' | 'published'
  q?: string
}

export interface BlogCategoryItem {
  _id: string
  name: string
  slug: string
  sortOrder: number
  createdAt: string
  updatedAt: string
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
