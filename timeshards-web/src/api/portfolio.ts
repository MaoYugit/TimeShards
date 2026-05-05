import axios from 'axios'

export interface ProjectLink {
  label: string
  href: string
}

export interface PortfolioProject {
  _id: string
  title: string
  period: string
  summary: string
  tags: string[]
  links: ProjectLink[]
  image: string
  showcaseNote: string
  sortOrder: number
  createdAt: string
  updatedAt: string
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

// 获取作品列表
export function getPortfolioProjects() {
  return api.get<any, ApiResponse<PortfolioProject[]>>('/portfolio')
}

export default api
