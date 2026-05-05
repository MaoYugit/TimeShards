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

export interface CreatePortfolioDto {
  title: string
  period?: string
  summary?: string
  tags?: string[]
  links?: ProjectLink[]
  image?: string
  showcaseNote?: string
  sortOrder?: number
}

export interface UpdatePortfolioDto {
  title?: string
  period?: string
  summary?: string
  tags?: string[]
  links?: ProjectLink[]
  image?: string
  showcaseNote?: string
  sortOrder?: number
}

const api = axios.create({
  baseURL: '/api/portfolio',
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

// 获取作品列表
export function getPortfolioProjects() {
  return api.get<any, ApiResponse<PortfolioProject[]>>('/')
}

// 获取作品详情
export function getPortfolioProjectById(id: string) {
  return api.get<any, ApiResponse<PortfolioProject>>(`/${id}`)
}

// 创建作品
export function createPortfolioProject(data: CreatePortfolioDto) {
  return api.post<any, ApiResponse<PortfolioProject>>('/', data)
}

// 更新作品
export function updatePortfolioProject(id: string, data: UpdatePortfolioDto) {
  return api.put<any, ApiResponse<PortfolioProject>>(`/${id}`, data)
}

// 删除作品
export function deletePortfolioProject(id: string) {
  return api.delete<any, ApiResponse<{ success: boolean }>>(`/${id}`)
}

export default api
