import { ref } from 'vue'
import { defineStore } from 'pinia'

const STORAGE_KEY = 'timeshards-chat-messages-v1'
const MAX_MESSAGES = 400

export type ChatMessage = {
  id: string
  userId: string
  nickname: string
  avatarHue: number
  text: string
  createdAt: number
}

function loadRaw(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw) as ChatMessage[]
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

function persist(list: ChatMessage[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  window.dispatchEvent(new Event('timeshards-chat-sync'))
}

/** 由 userId 稳定生成头像色相 */
export function avatarHueFromUserId(userId: string): number {
  let h = 0
  for (let i = 0; i < userId.length; i++) h = (h * 31 + userId.charCodeAt(i)) >>> 0
  return h % 360
}

export const useChatRoomStore = defineStore('chatRoom', () => {
  const messages = ref<ChatMessage[]>(loadRaw())

  function reload() {
    messages.value = loadRaw()
  }

  function send(userId: string, nickname: string, text: string) {
    const trimmed = text.trim()
    if (!trimmed || trimmed.length > 2000) return false
    const avatarHue = avatarHueFromUserId(userId)
    const msg: ChatMessage = {
      id: crypto.randomUUID(),
      userId,
      nickname: nickname.trim() || '匿名',
      avatarHue,
      text: trimmed,
      createdAt: Date.now(),
    }
    const next = [...messages.value, msg].slice(-MAX_MESSAGES)
    try {
      persist(next)
      messages.value = next
      return true
    } catch {
      return false
    }
  }

  function initCrossTab() {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) reload()
    }
    const onSync = () => reload()
    window.addEventListener('storage', onStorage)
    window.addEventListener('timeshards-chat-sync', onSync)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('timeshards-chat-sync', onSync)
    }
  }

  return { messages, send, reload, initCrossTab }
})
