import axios from 'axios'

export interface GuestbookEntry {
  _id: string
  name: string
  email: string
  website: string
  content: string
  ip: string
  userAgent: string
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

export interface QueryParams {
  page?: number
  pageSize?: number
}

const api = axios.create({
  baseURL: '/api/guestbook',
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

// 获取留言列表
export function getGuestbookEntries(params?: QueryParams) {
  return api.get<any, ApiResponse<PaginatedResponse<GuestbookEntry>>>('/', { params })
}

// 删除留言
export function deleteGuestbookEntry(id: string) {
  return api.delete<any, ApiResponse<{ success: boolean }>>(`/${id}`)
}

export default api
