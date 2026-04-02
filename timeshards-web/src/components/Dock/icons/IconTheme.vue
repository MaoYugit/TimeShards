<script setup lang="ts">
import type { ThemePreference } from '@/stores/theme'

defineProps<{
  preference: ThemePreference
  isDark: boolean
}>()
</script>

<template>
  <!-- A: system -->
  <svg
    v-if="preference === 'system'"
    viewBox="0 0 24 24"
    class="dock-svg"
    role="img"
    aria-label="跟随系统主题"
  >
    <path
      d="M12 3.2 4.2 20.6h2.5l1.8-4.1h7.1l1.8 4.1h2.5L12 3.2Zm-2.6 11.1L12 7.8l2.6 6.5H9.4Z"
      fill="currentColor"
      opacity="0.92"
    />
  </svg>

  <!-- 深色模式：月亮（夜晚） -->
  <svg
    v-else-if="isDark"
    viewBox="0 0 24 24"
    class="dock-svg"
    role="img"
    aria-label="当前深色模式，点击切换主题"
  >
    <path
      d="M20 13.1a7.5 7.5 0 0 1-9.1-9.1 7.7 7.7 0 1 0 9.1 9.1Z"
      fill="currentColor"
      opacity="0.9"
    />
    <path
      d="M20 13.1a7.5 7.5 0 0 1-9.1-9.1"
      fill="none"
      stroke="var(--dock-icon-accent, currentColor)"
      stroke-width="1.2"
      stroke-linecap="round"
      opacity="0.55"
    />
  </svg>

  <!-- 浅色模式：太阳（白天） -->
  <svg v-else viewBox="0 0 24 24" class="dock-svg" role="img" aria-label="当前浅色模式，点击切换主题">
    <path d="M12 7.2a4.8 4.8 0 1 0 0 9.6 4.8 4.8 0 0 0 0-9.6Z" fill="currentColor" opacity="0.9" />
    <path
      d="M12 2.6v2.1M12 19.3v2.1M21.4 12h-2.1M4.7 12H2.6M18.7 5.3l-1.5 1.5M6.8 17.2l-1.5 1.5M18.7 18.7l-1.5-1.5M6.8 6.8 5.3 5.3"
      fill="none"
      stroke="currentColor"
      stroke-width="1.4"
      stroke-linecap="round"
      opacity="0.9"
    />
  </svg>
</template>

<style scoped>
.dock-svg {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
