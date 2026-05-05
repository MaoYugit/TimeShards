import axios from 'axios'

export interface LoginDto {
  username: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  expiresIn: number
  tokenType: string
}

export interface UserInfo {
  id: string
  username: string
  role: string
  createdAt: string
  updatedAt: string
}

export interface ApiResponse<T> {
  code: number
  data: T
  message: string
}

const api = axios.create({
  baseURL: '/api/auth',
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

// 登录
export function login(data: LoginDto) {
  return api.post<any, ApiResponse<LoginResponse>>('/login', data)
}

// 获取用户信息
export function getUserInfo() {
  return api.get<any, ApiResponse<UserInfo>>('/profile')
}

// 刷新 Token
export function refreshToken() {
  return api.post<any, ApiResponse<LoginResponse>>('/refresh')
}

export default api
