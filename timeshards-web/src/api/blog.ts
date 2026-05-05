import axios from 'axios'

export type BlogCategory = '前端' | '工程化' | 'AI 开发' | '随笔'

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

export interface QueryParams {
  page?: number
  pageSize?: number
  category?: BlogCategory
  q?: string
}

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

// 响应拦截器
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || '请求失败'
    return Promise.reject(new Error(message))
  }
)

// 获取文章列表
export function getPosts(params?: QueryParams) {
  return api.get<any, ApiResponse<PaginatedResponse<BlogPost>>>('/posts', { params })
}

// 根据 ID 获取文章详情
export function getPostById(id: string) {
  return api.get<any, ApiResponse<BlogPost>>(`/posts/${id}`)
}

// 根据 slug 获取文章详情
export function getPostBySlug(slug: string) {
  return api.get<any, ApiResponse<BlogPost>>(`/posts/slug/${slug}`)
}

// 获取分类列表
export function getCategories() {
  return api.get<any, ApiResponse<string[]>>('/posts/categories')
}

export default api
