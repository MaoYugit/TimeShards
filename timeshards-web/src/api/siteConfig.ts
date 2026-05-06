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

// 获取首页配置
export function getHomepageConfig() {
  return api.get<any, ApiResponse<HomepageConfig>>('/site-config/homepage')
}

export default api
