import { ref } from 'vue'
import { defineStore } from 'pinia'

const STORAGE_KEY = 'timeshards-guestbook-v1'
const MAX_ENTRIES = 200

export type GuestbookEntry = {
  id: string
  name: string
  email: string
  website: string
  content: string
  createdAt: number
}

function loadRaw(): GuestbookEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw) as GuestbookEntry[]
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

function persist(entries: GuestbookEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  window.dispatchEvent(new Event('timeshards-guestbook-sync'))
}

export const useGuestbookStore = defineStore('guestbook', () => {
  const entries = ref<GuestbookEntry[]>(loadRaw())

  function reload() {
    entries.value = loadRaw()
  }

  function add(entry: Omit<GuestbookEntry, 'id' | 'createdAt'>): boolean {
    const next: GuestbookEntry = {
      ...entry,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    }
    const list = [next, ...entries.value].slice(0, MAX_ENTRIES)
    try {
      persist(list)
      entries.value = list
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
    window.addEventListener('timeshards-guestbook-sync', onSync)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('timeshards-guestbook-sync', onSync)
    }
  }

  return { entries, add, reload, initCrossTab }
})
