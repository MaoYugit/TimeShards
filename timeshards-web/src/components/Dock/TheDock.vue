<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useMouse } from '@vueuse/core'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useThemeStore } from '@/stores/theme'

import DockItem from './DockItem.vue'
import IconHome from './icons/IconHome.vue'
import IconPortfolio from './icons/IconPortfolio.vue'
import IconBlog from './icons/IconBlog.vue'
import IconGuestbook from './icons/IconGuestbook.vue'
import IconChat from './icons/IconChat.vue'
import IconResume from './icons/IconResume.vue'
import IconTheme from './icons/IconTheme.vue'

type DockAction =
  | { type: 'route'; label: string; icon: unknown; to: string; match?: (path: string) => boolean }
  | { type: 'action'; label: string; icon: unknown; onClick: () => void; isActive?: () => boolean }

const router = useRouter()
const route = useRoute()
const { x, y } = useMouse()
const mouseX = ref(0)
const mouseY = ref(0)
const dockEl = ref<HTMLElement | null>(null)
const useMouseSource = ref(true) // desktop mouse by default
const touchActive = ref(false)
const touchHoverActive = ref(false)
const touchStart = ref<{ x: number; y: number } | null>(null)
const activePointerType = ref<PointerEvent['pointerType'] | null>(null)

const themeStore = useThemeStore()
const { isDark, preference } = storeToRefs(themeStore)

function cycleTheme() {
  const next = preference.value === 'light' ? 'dark' : preference.value === 'dark' ? 'system' : 'light'
  themeStore.setPreference(next)
}

const resetMouse = () => {
  mouseX.value = 0
  mouseY.value = 0
}

const onVisibility = () => {
  if (document.visibilityState !== 'visible') resetMouse()
}

watch([x, y], ([nx, ny]) => {
  if (!useMouseSource.value) return
  mouseX.value = nx
  mouseY.value = ny
})

function setFromClientPoint(clientX: number, clientY: number) {
  mouseX.value = clientX
  mouseY.value = clientY
}

function onDockPointerDown(e: PointerEvent) {
  activePointerType.value = e.pointerType

  // Mouse: use vueuse mouse source
  if (e.pointerType === 'mouse') {
    useMouseSource.value = true
    return
  }

  // Touch/Pen: do NOT trigger hover on tap; only enable hover after a drag threshold.
  if (e.pointerType === 'touch' || e.pointerType === 'pen') {
    // Keep receiving pointermove even if finger leaves element
    try {
      dockEl.value?.setPointerCapture?.(e.pointerId)
    } catch {
      // ignore
    }
    useMouseSource.value = false
    touchActive.value = true
    touchHoverActive.value = false
    touchStart.value = { x: e.clientX, y: e.clientY }
  }
}

function onDockPointerMove(e: PointerEvent) {
  if (!touchActive.value) return
  if (!touchHoverActive.value) {
    const start = touchStart.value
    if (!start) return
    const dx = e.clientX - start.x
    const dy = e.clientY - start.y
    const dist = Math.hypot(dx, dy)
    if (dist < 8) return // tap jitter: ignore
    touchHoverActive.value = true
  }
  setFromClientPoint(e.clientX, e.clientY)
}

function onDockPointerUpOrCancel() {
  if (!touchActive.value) return
  touchActive.value = false
  touchHoverActive.value = false
  touchStart.value = null
  resetMouse()
  try {
    // releasePointerCapture is optional; safe-guard
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(dockEl.value as any)?.releasePointerCapture?.()
  } catch {
    // ignore
  }
  // IMPORTANT: on mobile, vueuse useMouse may keep last touch point.
  // Keep useMouseSource disabled after tap, so we don't re-apply stale coords.
  useMouseSource.value = activePointerType.value === 'mouse'
  activePointerType.value = null
}

onMounted(() => {
  window.addEventListener('mouseleave', resetMouse)
  window.addEventListener('blur', resetMouse)
  window.addEventListener('pointerup', onDockPointerUpOrCancel, { passive: true })
  window.addEventListener('pointercancel', onDockPointerUpOrCancel, { passive: true })
  window.addEventListener('touchend', onDockPointerUpOrCancel, { passive: true })
  window.addEventListener('touchcancel', onDockPointerUpOrCancel, { passive: true })
  document.addEventListener('visibilitychange', onVisibility)
})

onBeforeUnmount(() => {
  window.removeEventListener('mouseleave', resetMouse)
  window.removeEventListener('blur', resetMouse)
  window.removeEventListener('pointerup', onDockPointerUpOrCancel)
  window.removeEventListener('pointercancel', onDockPointerUpOrCancel)
  window.removeEventListener('touchend', onDockPointerUpOrCancel)
  window.removeEventListener('touchcancel', onDockPointerUpOrCancel)
  // visibilitychange listener is lightweight; keep symmetrical removal anyway
  document.removeEventListener('visibilitychange', onVisibility)
})

const items = computed<DockAction[]>(() => [
  { type: 'route', label: '首页', icon: IconHome, to: '/', match: (p) => p === '/' },
  { type: 'route', label: '作品集', icon: IconPortfolio, to: '/portfolio' },
  { type: 'route', label: '博客页', icon: IconBlog, to: '/blog', match: (p) => p.startsWith('/blog') },
  { type: 'route', label: '留言板', icon: IconGuestbook, to: '/guestbook' },
  { type: 'route', label: '对话页', icon: IconChat, to: '/chat' },
  { type: 'route', label: '简历页', icon: IconResume, to: '/resume' },
  { type: 'action', label: '主题切换', icon: IconTheme, onClick: cycleTheme, isActive: () => false },
])

function isActive(item: DockAction) {
  if (item.type === 'action') return item.isActive?.() ?? false
  const path = route.path
  if (item.match) return item.match(path)
  return path === item.to
}

function onClick(item: DockAction) {
  if (item.type === 'action') item.onClick()
  else router.push(item.to)
  // Desktop: keep hover state until mouse leaves window.
  // Touch: always reset on tap to avoid stuck magnification.
  if (touchActive.value || !useMouseSource.value) resetMouse()
}
</script>

<template>
  <footer class="dock-wrapper" aria-label="Dock">
    <div
      ref="dockEl"
      class="dock-container"
      :data-theme="isDark ? 'dark' : 'light'"
      @pointerdown.passive="onDockPointerDown"
      @pointermove.passive="onDockPointerMove"
      @pointerup.passive="onDockPointerUpOrCancel"
      @pointercancel.passive="onDockPointerUpOrCancel"
    >
      <DockItem
        v-for="item in items"
        :key="item.label"
        :mouseX="mouseX"
        :mouseY="mouseY"
        :label="item.label"
        :active="isActive(item)"
        @click="onClick(item)"
      >
        <component :is="item.icon" class="dock-icon" :isDark="isDark" :preference="preference" />
      </DockItem>
    </div>
  </footer>
</template>

<style scoped>
.dock-wrapper {
  position: fixed;
  left: 50%;
  bottom: max(16px, env(safe-area-inset-bottom));
  transform: translateX(-50%);
  z-index: 5000;
  padding: 0 12px;
  width: fit-content;
  max-width: calc(100% - 24px);
  /* 仅占位条形容器接收点击，避免宽条区域挡住底部两侧的 FAB / 按钮 */
  pointer-events: none;
}

.dock-container {
  position: relative;
  display: flex;
  pointer-events: auto;
  align-items: flex-end;
  justify-content: center;
  gap: 12px;
  --dock-base-size: 40px;
  --dock-pad-y: 10px;
  --dock-pad-x: 12px;
  height: calc(var(--dock-base-size) + var(--dock-pad-y) * 2);
  padding: var(--dock-pad-y) var(--dock-pad-x);
  border-radius: 32px;
  overflow: visible;
  touch-action: none;
}

.dock-container::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 32px;
  background: color-mix(in srgb, var(--glass-bg) 68%, transparent);
  backdrop-filter: blur(calc(var(--glass-blur) + 6px));
  -webkit-backdrop-filter: blur(calc(var(--glass-blur) + 6px));
  border: 1px solid var(--glass-border);
  box-shadow:
    0 18px 44px rgba(0, 0, 0, 0.22),
    inset 0 1px 0 rgba(255, 255, 255, 0.18);
  pointer-events: none;
}

.dock-container > * {
  position: relative;
  z-index: 1;
}

.dock-icon {
  width: 100%;
  height: 100%;
  color: currentColor;
  filter: drop-shadow(0 0 10px color-mix(in srgb, var(--dock-icon-accent, var(--accent-color)) 22%, transparent));
}

/* Theme-specific accents (two “sets” via CSS variables) */
.dock-container[data-theme='light'] {
  --dock-icon-accent: #0071e3;
  --dock-icon-hover: color-mix(in srgb, #0071e3 85%, #00f3ff);
  --dock-icon-color: rgba(29, 29, 31, 0.92);
  --dock-active-border: #00f3ff;
  --dock-active-glow: #00f3ff;
}

.dock-container[data-theme='dark'] {
  --dock-icon-accent: #00f3ff;
  --dock-icon-hover: color-mix(in srgb, #00f3ff 88%, #0a84ff);
  --dock-icon-color: rgba(245, 245, 247, 0.92);
  --dock-active-border: #00f3ff;
  --dock-active-glow: #00f3ff;
}

@media (max-width: 560px) {
  .dock-container {
    gap: 10px;
    padding: 10px 12px;
  }
}

@media (max-width: 420px) {
  .dock-wrapper {
    width: 100%;
  }
  .dock-container {
    gap: 8px;
    padding: 10px 10px;
    border-radius: 28px;
  }
}
</style>

