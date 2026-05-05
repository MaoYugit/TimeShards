import axios from 'axios'

export interface GuestbookEntry {
  _id: string
  name: string
  email: string
  website: string
  content: string
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

export interface CreateGuestbookDto {
  name: string
  email?: string
  website?: string
  content: string
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

// 获取留言列表
export function getGuestbookEntries(params?: { page?: number; pageSize?: number }) {
  return api.get<any, ApiResponse<PaginatedResponse<GuestbookEntry>>>('/guestbook', { params })
}

// 提交留言
export function createGuestbookEntry(data: CreateGuestbookDto) {
  return api.post<any, ApiResponse<GuestbookEntry>>('/guestbook', data)
}

export default api
