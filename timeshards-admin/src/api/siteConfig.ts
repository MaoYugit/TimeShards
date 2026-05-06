import axios from 'axios'

export interface HomepageConfig {
  welcomeQuote: string
  welcomeIntro: string
}

export interface ApiResponse<T> {
  code: number
  data: T
  message: string
}

const api = axios.create({
  baseURL: '/api/site-config',
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

// 获取首页配置
export function getHomepageConfig() {
  return api.get<any, ApiResponse<HomepageConfig>>('/homepage')
}

// 更新首页配置
export function updateHomepageConfig(data: Partial<HomepageConfig>) {
  return api.put<any, ApiResponse<HomepageConfig>>('/homepage', data)
}

export default api
