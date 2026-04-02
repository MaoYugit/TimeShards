import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export type ThemeMode = 'light' | 'dark'
export type ThemePreference = ThemeMode | 'system'

const STORAGE_KEY = 'timeshards-theme'
const MEDIA_QUERY = '(prefers-color-scheme: dark)'

function applyToDom(mode: ThemeMode) {
  const el = document.documentElement
  if (mode === 'dark') el.setAttribute('data-theme', 'dark')
  else el.removeAttribute('data-theme')
  // 手机浏览器地址栏/安全区底色，换肤更明显
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) {
    meta.setAttribute('content', mode === 'dark' ? '#000000' : '#f5f5f7')
  }
}

function getSystemPref(): ThemeMode {
  return window.matchMedia?.(MEDIA_QUERY)?.matches ? 'dark' : 'light'
}

function readSaved(): ThemePreference | null {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved === 'dark' || saved === 'light' || saved === 'system') return saved
  return null
}

export const useThemeStore = defineStore('theme', () => {
  const preference = ref<ThemePreference>('system')
  const mode = ref<ThemeMode>('light') // effective mode applied to DOM
  const isDark = computed(() => mode.value === 'dark')

  let mql: MediaQueryList | null = null
  let mqlListener: ((e: MediaQueryListEvent) => void) | null = null

  function stopSystemSync() {
    if (!mql || !mqlListener) return
    mql.removeEventListener?.('change', mqlListener)
    mql = null
    mqlListener = null
  }

  function startSystemSync() {
    if (mql) return
    mql = window.matchMedia?.(MEDIA_QUERY) ?? null
    if (!mql) return
    mqlListener = (e: MediaQueryListEvent) => {
      if (preference.value !== 'system') return
      setMode(e.matches ? 'dark' : 'light')
    }
    mql.addEventListener?.('change', mqlListener)
  }

  function setMode(next: ThemeMode) {
    mode.value = next
    applyToDom(next)
  }

  function setPreference(next: ThemePreference) {
    preference.value = next
    localStorage.setItem(STORAGE_KEY, next)

    if (next === 'system') {
      startSystemSync()
      setMode(getSystemPref())
      return
    }

    stopSystemSync()
    setMode(next)
  }

  function toggleTheme() {
    // Toggle always becomes an explicit preference (exits "system").
    setPreference(isDark.value ? 'light' : 'dark')
  }

  /**
   * Call once on app startup (client only).
   * Priority: saved preference > existing DOM > system preference.
   */
  function initTheme() {
    const saved = readSaved()
    if (saved) {
      setPreference(saved)
      return
    }

    const domDark = document.documentElement.getAttribute('data-theme') === 'dark'
    // Default: follow existing DOM if set; otherwise follow system.
    if (domDark) setPreference('dark')
    else setPreference('system')
  }

  return { preference, mode, isDark, initTheme, setPreference, toggleTheme }
})
