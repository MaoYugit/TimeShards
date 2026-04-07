import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

const STORAGE_KEY = 'timeshards-site-user'

export type SiteUser = {
  id: string
  nickname: string
  joinedAt: number
}

function randomId() {
  return `u_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
}

function readStored(): SiteUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const o = JSON.parse(raw) as SiteUser
    if (o && typeof o.id === 'string' && typeof o.nickname === 'string') return o
  } catch {
    /* ignore */
  }
  return null
}

/** 站点访客身份（聊天室等），与后台管理员登录无关 */
export const useSiteAuthStore = defineStore('siteAuth', () => {
  const user = ref<SiteUser | null>(readStored())

  const isAuthenticated = computed(() => user.value != null)

  function persist() {
    if (user.value) localStorage.setItem(STORAGE_KEY, JSON.stringify(user.value))
    else localStorage.removeItem(STORAGE_KEY)
  }

  function login(nickname: string) {
    const trimmed = nickname.trim()
    if (trimmed.length < 2 || trimmed.length > 24) return false
    user.value = {
      id: randomId(),
      nickname: trimmed,
      joinedAt: Date.now(),
    }
    persist()
    return true
  }

  function logout() {
    user.value = null
    persist()
  }

  /** 刷新后从 localStorage 恢复（多标签同登） */
  function syncFromStorage() {
    user.value = readStored()
  }

  function initCrossTab() {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) syncFromStorage()
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }

  return { user, isAuthenticated, login, logout, syncFromStorage, initCrossTab }
})
