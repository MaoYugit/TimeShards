import axios from 'axios'
import type { ApiResponse, BlogCategoryItem } from '@/types/blog'

const api = axios.create({
  baseURL: '/api/blog-categories',
  timeout: 10000
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(new Error(error.response?.data?.message || '请求失败'))
)

// 获取所有分类
export function getCategories() {
  return api.get<any, ApiResponse<BlogCategoryItem[]>>('')
}

// 创建分类
export function createCategory(data: { name: string; slug?: string }) {
  return api.post<any, ApiResponse<BlogCategoryItem>>('', data)
}

// 删除分类
export function deleteCategory(id: string) {
  return api.delete<any, ApiResponse<{ success: boolean }>>(`/${id}`)
}
