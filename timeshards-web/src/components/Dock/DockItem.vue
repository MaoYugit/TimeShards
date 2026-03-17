<script setup lang="ts">
import { computed, ref } from 'vue'
import { useElementBounding } from '@vueuse/core'

const props = defineProps<{
  mouseX: number
  mouseY: number
  label: string
  active?: boolean
  disabled?: boolean
}>()

const emit = defineEmits<{
  click: []
}>()

const el = ref<HTMLElement | null>(null)
const isBouncing = ref(false)

const { left, top, width, height } = useElementBounding(el)

const BASE_SIZE = 40
const MAX_ADDITIONAL_SIZE = 24
const DISTANCE_LIMIT = 150

const size = computed(() => {
  if (props.mouseX === 0 && props.mouseY === 0) return BASE_SIZE

  const centerX = left.value + width.value / 2
  const centerY = top.value + height.value / 2
  const distance = Math.sqrt((props.mouseX - centerX) ** 2 + (props.mouseY - centerY) ** 2)
  if (distance > DISTANCE_LIMIT) return BASE_SIZE

  const relDistance = distance / DISTANCE_LIMIT
  const scale = (Math.cos(relDistance * Math.PI) + 1) / 2
  return BASE_SIZE + scale * MAX_ADDITIONAL_SIZE
})

const itemStyle = computed(() => ({
  width: `${size.value}px`,
  height: `${size.value}px`,
}))

function handleClick() {
  if (props.disabled) return
  emit('click')
  if (isBouncing.value) return
  isBouncing.value = true
  window.setTimeout(() => (isBouncing.value = false), 600)
}
</script>

<template>
  <button
    ref="el"
    class="dock-item"
    type="button"
    :class="{ 'is-bouncing': isBouncing, 'is-active': !!active }"
    :disabled="disabled"
    :aria-label="label"
    :data-label="label"
    @click="handleClick"
  >
    <span class="dock-item-bg" :style="itemStyle"></span>
    <span class="dock-item-content" :style="itemStyle">
      <slot />
    </span>
  </button>
</template>

<style scoped>
.dock-item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  align-self: flex-end;
  border: 0;
  padding: 0;
  background: transparent;
  color: var(--dock-icon-color, var(--text-primary));
  will-change: transform;
}

.dock-item:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.dock-item-bg {
  position: absolute;
  border-radius: 999px;
  z-index: 1;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  box-shadow: var(--card-shadow);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  transition: transform 0.2s ease, background 0.2s ease, border-color 0.2s ease;
}

.dock-item.is-active .dock-item-bg {
  border-color: var(--dock-active-border, var(--dock-icon-accent, var(--accent-color)));
  box-shadow:
    0 0 0 2px color-mix(in srgb, var(--dock-active-border, var(--dock-icon-accent, var(--accent-color))) 70%, transparent),
    0 0 24px color-mix(in srgb, var(--dock-active-glow, var(--dock-icon-accent, var(--accent-color))) 45%, transparent),
    0 18px 42px color-mix(in srgb, var(--dock-active-glow, var(--dock-icon-accent, var(--accent-color))) 22%, transparent);
}

.dock-item-content {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  box-sizing: border-box;
}

.dock-item:hover {
  color: var(--dock-icon-hover, var(--dock-icon-accent, var(--accent-color)));
}

.dock-item:focus-visible .dock-item-bg {
  outline: 2px solid color-mix(in srgb, var(--dock-icon-accent, var(--accent-color)) 70%, transparent);
  outline-offset: 2px;
}

/* Tooltip */
.dock-item::after {
  content: attr(data-label);
  position: absolute;
  left: 50%;
  bottom: calc(100% + 10px);
  transform: translateX(-50%) translateY(4px);
  padding: 6px 10px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--glass-bg) 92%, transparent);
  border: 1px solid var(--glass-border);
  color: var(--text-primary);
  font-size: 12px;
  letter-spacing: 0.2px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.dock-item:hover::after,
.dock-item:focus-visible::after {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

/* Bounce */
.is-bouncing {
  animation: dock-bounce 0.6s cubic-bezier(0.19, 1, 0.22, 1);
}

@keyframes dock-bounce {
  0% {
    transform: translateY(0);
  }
  20% {
    transform: translateY(-26px);
  }
  50% {
    transform: translateY(7px);
  }
  80% {
    transform: translateY(-3px);
  }
  100% {
    transform: translateY(0);
  }
}

@media (max-width: 420px) {
  .dock-item::after {
    display: none;
  }
}
</style>
