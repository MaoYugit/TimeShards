import axios from 'axios'

export interface ChatMessage {
  _id: string
  userId: string
  nickname: string
  avatarHue: number
  text: string
  createdAt: string
  updatedAt: string
}

export interface ApiResponse<T> {
  code: number
  data: T
  message: string
}

const api = axios.create({
  baseURL: '/api/chat',
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

// 获取历史消息
export function getChatMessages(params?: { limit?: number; before?: string }) {
  return api.get<any, ApiResponse<{ items: ChatMessage[] }>>('/messages', { params })
}

export default api
