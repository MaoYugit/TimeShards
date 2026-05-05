import axios from 'axios'

export interface DashboardStats {
  postCount: number
  publishedPostCount: number
  draftPostCount: number
  guestbookCount: number
  chatMessageCount: number
  portfolioCount: number
}

export interface ApiResponse<T> {
  code: number
  data: T
  message: string
}

const api = axios.create({
  baseURL: '/api/admin',
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

// 获取仪表盘统计数据
export function getDashboardStats() {
  return api.get<any, ApiResponse<DashboardStats>>('/stats')
}

export default api
