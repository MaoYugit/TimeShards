<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useGuestbookStore, type GuestbookEntry } from '@/stores/guestbook'
import { useGuestbookBubblePhysics } from '@/composables/useGuestbookBubblePhysics'

const gb = useGuestbookStore()
const { entries } = storeToRefs(gb)

const name = ref('')
const email = ref('')
const website = ref('')
const content = ref('')
const submitError = ref('')
const submitted = ref(false)
const showModal = ref(false)
const nameInputRef = ref<HTMLInputElement | null>(null)
const floatStageRef = ref<HTMLElement | null>(null)

let offCrossTab: (() => void) | null = null

onMounted(() => {
  offCrossTab = gb.initCrossTab()
})

const sortedEntries = computed(() => [...entries.value].sort((a, b) => b.createdAt - a.createdAt))

const { setBubbleRoot } = useGuestbookBubblePhysics(floatStageRef, sortedEntries)

function formatTime(ts: number) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(ts))
}

function normalizeWebsite(w: string) {
  const t = w.trim()
  if (!t) return ''
  if (/^https?:\/\//i.test(t)) return t
  return `https://${t}`
}

function onBubbleClick(e: GuestbookEntry) {
  const url = normalizeWebsite(e.website)
  if (url) {
    window.open(url, '_blank', 'noopener,noreferrer')
  }
}

function bubbleHint(e: GuestbookEntry) {
  return normalizeWebsite(e.website) ? `访问 ${e.name} 的个人网站` : '未填写个人网站，无法跳转'
}

function onSubmit() {
  submitError.value = ''
  submitted.value = false
  const n = name.value.trim()
  const c = content.value.trim()
  if (n.length < 1 || n.length > 32) {
    submitError.value = '昵称长度为 1～32 字'
    return
  }
  if (c.length < 1 || c.length > 2000) {
    submitError.value = '留言内容为 1～2000 字'
    return
  }
  const em = email.value.trim()
  if (em && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
    submitError.value = '邮箱格式不太对'
    return
  }
  const saved = gb.add({
    name: n,
    email: em,
    website: website.value.trim(),
    content: c,
  })
  if (!saved) {
    submitError.value = '无法保存（例如浏览器禁止本地存储），请检查隐私模式或存储权限'
    return
  }
  name.value = ''
  email.value = ''
  website.value = ''
  content.value = ''
  submitted.value = true
  window.setTimeout(() => {
    showModal.value = false
    submitted.value = false
  }, 1200)
}

function closeModal() {
  showModal.value = false
}

function onGlobalKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && showModal.value) closeModal()
}

function shouldLockBodyScroll() {
  if (typeof window === 'undefined') return false
  const coarse = window.matchMedia('(pointer: coarse)').matches
  const noHover = window.matchMedia('(hover: none)').matches
  return !coarse && !noHover
}

watch(showModal, (open) => {
  if (open) {
    submitError.value = ''
    submitted.value = false
    if (shouldLockBodyScroll()) {
      document.documentElement.style.overflow = 'hidden'
    }
    window.addEventListener('keydown', onGlobalKeydown)
    nextTick(() => nameInputRef.value?.focus())
  } else {
    document.documentElement.style.overflow = ''
    window.removeEventListener('keydown', onGlobalKeydown)
  }
})

onBeforeUnmount(() => {
  offCrossTab?.()
  window.removeEventListener('keydown', onGlobalKeydown)
  document.documentElement.style.overflow = ''
})
</script>

<template>
  <main class="guestbook">
    <div class="hero-wrap">
      <header class="hero">
        <p class="kicker">Guestbook</p>
        <h1 class="title">留言板</h1>
        <p class="lead">
          留言会在页面中轻轻漂游，相互靠近时会弹开避免堆叠；若对方填写了个人网站，点击卡片可前往。写留言请点右下角按钮。
        </p>
      </header>
    </div>

    <div ref="floatStageRef" class="float-stage" aria-label="留言漂浮展示">
      <p v-if="!sortedEntries.length" class="empty-float">还没有留言，点右下角「我要留言」做第一个吧。</p>
      <div
        v-for="e in sortedEntries"
        :key="e.id"
        class="float-anchor"
        :ref="(el) => setBubbleRoot(e.id, el)"
      >
        <button
          type="button"
          class="float-bubble"
          :class="{ 'has-site': !!normalizeWebsite(e.website) }"
          :title="bubbleHint(e)"
          @click="onBubbleClick(e)"
        >
          <span class="bubble-name">{{ e.name }}</span>
          <time class="bubble-time" :datetime="new Date(e.createdAt).toISOString()">{{
            formatTime(e.createdAt)
          }}</time>
          <p class="bubble-body">{{ e.content }}</p>
        </button>
      </div>
    </div>

    <button type="button" class="fab" @click="showModal = true">
      <span class="fab-text">我要留言</span>
    </button>

    <Teleport to="body">
      <div v-show="showModal" class="modal-root" role="presentation">
        <div class="modal-backdrop" aria-hidden="true" @click="closeModal" />
        <div
          class="modal-panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="guestbook-form-title"
          tabindex="-1"
          @click.stop
        >
          <div class="card form-card">
            <div class="modal-head">
              <h2 id="guestbook-form-title" class="card-title">写一条留言</h2>
              <button type="button" class="modal-close" aria-label="关闭" @click="closeModal">×</button>
            </div>
            <form class="form" @submit.prevent="onSubmit">
              <label class="field">
                <span class="label">称呼 <em class="req">*</em></span>
                <input
                  ref="nameInputRef"
                  v-model="name"
                  class="input"
                  type="text"
                  maxlength="32"
                  autocomplete="nickname"
                />
              </label>
              <label class="field">
                <span class="label">邮箱（选填）</span>
                <input v-model="email" class="input" type="email" autocomplete="email" />
              </label>
              <label class="field">
                <span class="label">个人网站（选填）</span>
                <input v-model="website" class="input" type="text" placeholder="https://" />
              </label>
              <label class="field">
                <span class="label">留言内容 <em class="req">*</em></span>
                <textarea
                  v-model="content"
                  class="textarea"
                  rows="5"
                  maxlength="2000"
                  placeholder="想对站长说的话…"
                />
              </label>
              <p v-if="submitError" class="error" role="alert">{{ submitError }}</p>
              <p v-if="submitted" class="ok">已保存，感谢留言。</p>
              <button type="submit" class="btn-submit">发布留言</button>
            </form>
          </div>
        </div>
      </div>
    </Teleport>
  </main>
</template>

<style scoped>
.guestbook {
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  padding-bottom: calc(clamp(16px, 3vw, 28px) + var(--dock-height) + env(safe-area-inset-bottom, 0px));
  box-sizing: border-box;
  position: relative;
}

.hero-wrap {
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
  padding: clamp(16px, 3vw, 28px);
  padding-bottom: 0;
  position: relative;
  z-index: 2;
}

.hero {
  text-align: left;
}

.kicker {
  margin: 0;
  font-size: 12px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--text-secondary);
}

.title {
  margin: 8px 0 0;
  font-size: clamp(26px, 5vw, 34px);
  letter-spacing: -0.02em;
  color: var(--text-primary);
  text-shadow: 0 0 18px color-mix(in srgb, #00f3ff 18%, transparent);
}

.lead {
  margin: 10px 0 0;
  font-size: 14px;
  line-height: 1.65;
  color: color-mix(in srgb, var(--text-primary) 35%, var(--text-secondary));
}

.float-stage {
  position: relative;
  width: 100%;
  min-height: max(360px, calc(100dvh - clamp(140px, 22vw, 200px)));
  margin-top: clamp(8px, 2vw, 16px);
  overflow: hidden;
  isolation: isolate;
}

.empty-float {
  position: absolute;
  left: 50%;
  top: 42%;
  transform: translate(-50%, -50%);
  margin: 0;
  max-width: 280px;
  text-align: center;
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-secondary);
  z-index: 0;
  pointer-events: none;
}

.float-anchor {
  position: absolute;
  left: 0;
  top: 0;
  width: min(288px, 42vw);
  max-width: 100%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  will-change: left, top;
}

.float-bubble {
  width: 100%;
  margin: 0;
  padding: 12px 14px;
  text-align: left;
  border-radius: var(--radius-md);
  border: 1px solid color-mix(in srgb, var(--glass-border) 88%, transparent);
  background: color-mix(in srgb, var(--glass-bg) 52%, transparent);
  backdrop-filter: blur(calc(var(--glass-blur) + 2px));
  -webkit-backdrop-filter: blur(calc(var(--glass-blur) + 2px));
  box-shadow: var(--card-shadow);
  color: inherit;
  font: inherit;
  cursor: default;
  pointer-events: auto;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

.float-bubble.has-site {
  cursor: pointer;
}

.float-bubble.has-site:hover {
  border-color: color-mix(in srgb, #00f3ff 45%, var(--glass-border));
  box-shadow:
    var(--card-shadow),
    0 0 24px color-mix(in srgb, #00f3ff 12%, transparent);
  transform: scale(1.02);
}

.float-bubble:focus-visible {
  outline: 2px solid color-mix(in srgb, #00f3ff 65%, transparent);
  outline-offset: 2px;
}

.bubble-name {
  display: block;
  font-weight: 600;
  font-size: 14px;
  color: var(--text-primary);
}

.bubble-time {
  display: block;
  margin-top: 2px;
  font-size: 11px;
  font-family: var(--font-code);
  color: var(--text-secondary);
}

.bubble-body {
  margin: 8px 0 0;
  font-size: 13px;
  line-height: 1.55;
  color: color-mix(in srgb, var(--text-primary) 88%, var(--text-secondary));
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 5;
  line-clamp: 5;
  overflow: hidden;
}

.fab {
  position: fixed;
  z-index: 5500;
  right: max(16px, env(safe-area-inset-right, 0px));
  bottom: calc(var(--dock-height) + env(safe-area-inset-bottom, 0px) + 16px);
  padding: 12px 20px;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, #00f3ff 42%, var(--glass-border));
  background: color-mix(in srgb, var(--glass-bg) 78%, transparent);
  backdrop-filter: blur(calc(var(--glass-blur) + 6px));
  -webkit-backdrop-filter: blur(calc(var(--glass-blur) + 6px));
  color: var(--text-primary);
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  box-shadow:
    var(--card-shadow),
    0 0 28px color-mix(in srgb, #00f3ff 10%, transparent);
  transition: var(--transition-smooth);
}

.fab:hover {
  border-color: color-mix(in srgb, #00f3ff 70%, transparent);
  color: #00f3ff;
}

.fab:focus-visible {
  outline: 2px solid color-mix(in srgb, #00f3ff 55%, transparent);
  outline-offset: 3px;
}

.modal-root {
  position: fixed;
  inset: 0;
  z-index: 5600;
  display: grid;
  place-items: center;
  padding: clamp(16px, 4vw, 32px);
  box-sizing: border-box;
}

.modal-backdrop {
  position: absolute;
  inset: 0;
  background: color-mix(in srgb, #0a0e14 72%, transparent);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.modal-panel {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 520px;
  max-height: min(90dvh, 640px);
  overflow: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
  touch-action: manipulation;
}

.modal-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.modal-head .card-title {
  margin-bottom: 0;
  flex: 1;
}

.modal-close {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  margin: -6px -6px 0 0;
  padding: 0;
  border: none;
  border-radius: 10px;
  background: color-mix(in srgb, var(--glass-bg) 50%, transparent);
  color: var(--text-secondary);
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  transition: var(--transition-smooth);
}

.modal-close:hover {
  color: var(--text-primary);
  background: color-mix(in srgb, var(--glass-bg) 70%, transparent);
}

.card {
  position: relative;
  padding: clamp(16px, 2.4vw, 22px);
  border-radius: var(--radius-lg);
  background: color-mix(in srgb, var(--glass-bg) 84%, transparent);
  border: 1px solid var(--glass-border);
  box-shadow: var(--card-shadow);
  backdrop-filter: blur(calc(var(--glass-blur) + 4px));
  -webkit-backdrop-filter: blur(calc(var(--glass-blur) + 4px));
  overflow: hidden;
}

.card::before {
  content: '';
  position: absolute;
  inset: -2px;
  background: radial-gradient(
    400px circle at 12% 12%,
    color-mix(in srgb, var(--accent-color) 10%, transparent),
    transparent 55%
  );
  pointer-events: none;
  opacity: 0.85;
}

.card > * {
  position: relative;
  z-index: 1;
}

.card-title {
  margin: 0 0 14px;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.label {
  font-size: 13px;
  color: var(--text-secondary);
}

.req {
  color: color-mix(in srgb, #00f3ff 80%, var(--accent-color));
  font-style: normal;
}

.input,
.textarea {
  font: inherit;
  font-size: 14px;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  border: 1px solid color-mix(in srgb, var(--glass-border) 90%, transparent);
  background: color-mix(in srgb, var(--glass-bg) 55%, transparent);
  color: var(--text-primary);
  width: 100%;
  box-sizing: border-box;
}

.textarea {
  resize: vertical;
  min-height: 120px;
  line-height: 1.55;
}

.input:focus,
.textarea:focus {
  outline: none;
  border-color: color-mix(in srgb, #00f3ff 45%, var(--glass-border));
  box-shadow: 0 0 0 1px color-mix(in srgb, #00f3ff 12%, transparent);
}

.error {
  margin: 0;
  font-size: 13px;
  color: color-mix(in srgb, #ff6b6b 90%, var(--text-primary));
}

.ok {
  margin: 0;
  font-size: 13px;
  color: color-mix(in srgb, #00f3ff 85%, var(--accent-color));
}

.btn-submit {
  align-self: flex-end;
  margin-top: 4px;
  padding: 10px 22px;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, #00f3ff 40%, var(--glass-border));
  background: color-mix(in srgb, var(--glass-bg) 70%, transparent);
  color: var(--text-primary);
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition-smooth);
}

.btn-submit:hover {
  border-color: color-mix(in srgb, #00f3ff 65%, transparent);
  color: #00f3ff;
}
</style>
