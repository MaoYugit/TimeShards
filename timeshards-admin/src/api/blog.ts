import axios from 'axios'
import type {
  BlogPost,
  CreatePostDto,
  UpdatePostDto,
  QueryPostDto,
  PaginatedResponse,
  ApiResponse
} from '@/types/blog'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

// 请求拦截器 - 添加 token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || '请求失败'
    return Promise.reject(new Error(message))
  }
)

// 获取文章列表（管理员）
export function getPostsAdmin(params?: QueryPostDto) {
  return api.get<any, ApiResponse<PaginatedResponse<BlogPost>>>('/posts/admin', { params })
}

// 获取文章列表（公开）
export function getPosts(params?: QueryPostDto) {
  return api.get<any, ApiResponse<PaginatedResponse<BlogPost>>>('/posts', { params })
}

// 获取文章详情
export function getPostById(id: string) {
  return api.get<any, ApiResponse<BlogPost>>(`/posts/${id}`)
}

// 创建文章
export function createPost(data: CreatePostDto) {
  return api.post<any, ApiResponse<BlogPost>>('/posts', data)
}

// 更新文章
export function updatePost(id: string, data: UpdatePostDto) {
  return api.put<any, ApiResponse<BlogPost>>(`/posts/${id}`, data)
}

// 删除文章
export function deletePost(id: string) {
  return api.delete<any, ApiResponse<{ success: boolean }>>(`/posts/${id}`)
}

// 获取分类列表
export function getCategories() {
  return api.get<any, ApiResponse<string[]>>('/posts/categories')
}

export default api
