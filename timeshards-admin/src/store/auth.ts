import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login as loginApi, getUserInfo } from '@/api/auth'
import type { UserInfo } from '@/api/auth'

export const useAuthStore = defineStore('auth', () => {
  // Token
  const token = ref(localStorage.getItem('token') || '')
  
  // 用户信息
  const userInfo = ref<UserInfo | null>(null)

  // 设置 Token
  function setToken(newToken: string) {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  // 清除 Token
  function clearToken() {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
  }

  // 登录
  async function login(username: string, password: string) {
    const res = await loginApi({ username, password })
    setToken(res.data.accessToken)
    return res
  }

  // 获取用户信息
  async function fetchUserInfo() {
    const res = await getUserInfo()
    userInfo.value = res.data
    return res.data
  }

  // 退出登录
  function logout() {
    clearToken()
  }

  // 检查是否已登录
  function isLoggedIn() {
    return !!token.value
  }

  return {
    token,
    userInfo,
    setToken,
    clearToken,
    login,
    fetchUserInfo,
    logout,
    isLoggedIn
  }
})
