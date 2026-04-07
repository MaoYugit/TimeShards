<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useSiteAuthStore } from '@/stores/siteAuth'
import { useChatRoomStore, avatarHueFromUserId } from '@/stores/chatRoom'
import { getChatWsUrl } from '@/services/chatWs'

const auth = useSiteAuthStore()
const chat = useChatRoomStore()
const { user, isAuthenticated } = storeToRefs(auth)
const { messages } = storeToRefs(chat)

const nicknameInput = ref('')
const loginError = ref('')
const draft = ref('')
const sendError = ref('')
const listEl = ref<HTMLElement | null>(null)

let offChatTab: (() => void) | null = null
let offAuthTab: (() => void) | null = null

const wsHint = getChatWsUrl()

const selfHue = computed(() => (user.value ? avatarHueFromUserId(user.value.id) : 0))

onMounted(() => {
  offChatTab = chat.initCrossTab()
  offAuthTab = auth.initCrossTab()
  scrollToBottom()
})

onBeforeUnmount(() => {
  offChatTab?.()
  offAuthTab?.()
})

watch(
  () => messages.value.length,
  async () => {
    await nextTick()
    scrollToBottom()
  },
)

function scrollToBottom() {
  const el = listEl.value
  if (!el) return
  el.scrollTop = el.scrollHeight
}

function initials(nick: string) {
  const s = nick.trim()
  if (!s) return '?'
  return s.length > 1 ? s.slice(0, 2) : s.slice(0, 1)
}

function formatTime(ts: number) {
  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(ts))
}

function tryLogin() {
  loginError.value = ''
  const ok = auth.login(nicknameInput.value)
  if (!ok) loginError.value = '昵称需 2～24 个字符'
}

function logout() {
  auth.logout()
  nicknameInput.value = ''
}

function composerPreferSendOnEnter() {
  if (typeof window === 'undefined') return true
  const coarse = window.matchMedia('(pointer: coarse)').matches
  const noHover = window.matchMedia('(hover: none)').matches
  return !(coarse || noHover)
}

function onComposerKeydown(e: KeyboardEvent) {
  if (e.key !== 'Enter' || e.isComposing) return
  if (!composerPreferSendOnEnter()) return
  if (e.shiftKey) return
  e.preventDefault()
  send()
}

function send() {
  if (!user.value) return
  sendError.value = ''
  const ok = chat.send(user.value.id, user.value.nickname, draft.value)
  if (ok) draft.value = ''
  else sendError.value = '发送失败（可能无法写入本地存储）'
}
</script>

<template>
  <main class="chat page-container" :class="{ 'room-open': isAuthenticated }">
    <div class="inner" :class="{ 'gate-centered': !isAuthenticated }">
      <header class="hero">
        <p class="kicker">Chat</p>
        <h1 class="title">公共聊天室</h1>
        <p class="lead">
          登录后即可在群组中发言。当前为前端演示：消息保存在本机，多标签页可实时同步；接入后端 WebSocket 后可全站互通。
        </p>
      </header>

      <!-- 未登录 -->
      <section v-if="!isAuthenticated" class="card gate-card" aria-label="进入聊天室">
        <h2 class="card-title">以昵称加入</h2>
        <p class="hint">无需密码，仅用于在本机会话中标识你；请勿使用真实敏感信息。</p>
        <label class="field">
          <span class="label">昵称</span>
          <input
            v-model="nicknameInput"
            class="input"
            type="text"
            maxlength="24"
            autocomplete="username"
            placeholder="例如：访客_阿七"
            @keydown.enter.prevent="tryLogin"
          />
        </label>
        <p v-if="loginError" class="error" role="alert">{{ loginError }}</p>
        <button type="button" class="btn-primary" @click="tryLogin">进入聊天室</button>
      </section>

      <!-- 已登录 -->
      <template v-else>
        <section class="card room-card" aria-label="群组对话">
          <div class="room-head">
            <div class="who">
              <span
                class="avatar sm"
                :style="{
                  background: `linear-gradient(135deg, hsl(${selfHue}, 58%, 46%), hsl(${selfHue}, 70%, 36%))`,
                }"
              >
                {{ user ? initials(user.nickname) : '?' }}
              </span>
              <span class="nick">{{ user?.nickname }}</span>
            </div>
            <button type="button" class="btn-ghost" @click="logout">退出</button>
          </div>

          <div ref="listEl" class="msg-list" role="log" aria-live="polite" aria-relevant="additions">
            <p v-if="!messages.length" class="empty-room">暂无消息，打个招呼吧。</p>
            <div
              v-for="m in messages"
              :key="m.id"
              class="msg"
              :class="{ self: user != null && m.userId === user.id }"
            >
              <div
                class="avatar"
                :style="{
                  background: `linear-gradient(135deg, hsl(${m.avatarHue}, 58%, 46%), hsl(${m.avatarHue}, 70%, 36%))`,
                }"
                aria-hidden="true"
              >
                {{ initials(m.nickname) }}
              </div>
              <div class="bubble-wrap">
                <div class="meta">
                  <span class="mn">{{ m.nickname }}</span>
                  <time class="mt" :datetime="new Date(m.createdAt).toISOString()">{{
                    formatTime(m.createdAt)
                  }}</time>
                </div>
                <p class="bubble">{{ m.text }}</p>
              </div>
            </div>
          </div>

          <div class="composer">
            <textarea
              v-model="draft"
              class="draft"
              rows="2"
              maxlength="2000"
              placeholder="电脑：Enter 发送，Shift+Enter 换行 · 手机：键盘换行，点「发送」"
              enterkeyhint="send"
              @keydown="onComposerKeydown"
            />
            <button type="button" class="btn-send" :disabled="!draft.trim()" @click="send">发送</button>
          </div>
          <p v-if="sendError" class="send-err" role="alert">{{ sendError }}</p>
        </section>
      </template>

      <p class="foot-note">
        <template v-if="wsHint"> 已配置 WebSocket 地址，可在后续版本中对接服务端协议。 </template>
        <template v-else> 未配置 <code class="code">VITE_CHAT_WS_URL</code> 时仅为本地演示同步。 </template>
      </p>
    </div>
  </main>
</template>

<style scoped>
.page-container {
  width: 100%;
  max-width: 560px;
  margin: 0 auto;
  min-height: 100vh;
  min-height: 100dvh;
  padding: clamp(16px, 3vw, 28px);
  padding-bottom: calc(clamp(16px, 3vw, 28px) + var(--dock-height) + env(safe-area-inset-bottom, 0px));
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.page-container.room-open {
  max-width: min(720px, 94vw);
}

.inner {
  display: flex;
  flex-direction: column;
  gap: 14px;
  flex: 1;
  min-height: 0;
}

.inner.gate-centered {
  justify-content: center;
}

.hero {
  flex-shrink: 0;
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
  font-size: clamp(26px, 5vw, 32px);
  letter-spacing: -0.02em;
  color: var(--text-primary);
  text-shadow: 0 0 18px color-mix(in srgb, #00f3ff 18%, transparent);
}

.lead {
  margin: 10px 0 0;
  font-size: 13px;
  line-height: 1.6;
  color: color-mix(in srgb, var(--text-primary) 35%, var(--text-secondary));
}

.card {
  position: relative;
  padding: clamp(16px, 2.4vw, 20px);
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
    380px circle at 88% 8%,
    color-mix(in srgb, #00f3ff 12%, transparent),
    transparent 50%
  );
  pointer-events: none;
}

.card > * {
  position: relative;
  z-index: 1;
}

.card-title {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.hint {
  margin: 0 0 14px;
  font-size: 12px;
  line-height: 1.55;
  color: var(--text-secondary);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 10px;
}

.label {
  font-size: 13px;
  color: var(--text-secondary);
}

.input {
  font: inherit;
  font-size: 14px;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  border: 1px solid color-mix(in srgb, var(--glass-border) 90%, transparent);
  background: color-mix(in srgb, var(--glass-bg) 55%, transparent);
  color: var(--text-primary);
}

.input:focus {
  outline: none;
  border-color: color-mix(in srgb, #00f3ff 45%, var(--glass-border));
}

.error {
  margin: 0 0 10px;
  font-size: 13px;
  color: color-mix(in srgb, #ff6b6b 90%, var(--text-primary));
}

.gate-card {
  display: flex;
  flex-direction: column;
}

.btn-primary {
  align-self: flex-end;
  padding: 10px 22px;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, #00f3ff 45%, var(--glass-border));
  background: color-mix(in srgb, var(--glass-bg) 72%, transparent);
  color: var(--text-primary);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition-smooth);
}

.btn-primary:hover {
  color: #00f3ff;
}

.room-card {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: min(52vh, 420px);
  max-height: min(62vh, 520px);
}

@media (min-width: 768px) {
  .room-card {
    min-height: min(52vh, 480px);
    max-height: min(72vh, 640px);
  }
}

.room-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
  flex-shrink: 0;
}

.who {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.nick {
  font-weight: 600;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.btn-ghost {
  flex-shrink: 0;
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid var(--glass-border);
  background: transparent;
  color: var(--text-secondary);
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}

.btn-ghost:hover {
  color: #00f3ff;
  border-color: color-mix(in srgb, #00f3ff 35%, var(--glass-border));
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 1px 2px color-mix(in srgb, #000 35%, transparent);
  flex-shrink: 0;
}

.avatar.sm {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  font-size: 11px;
}

.msg-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 4px 2px 12px;
}

.empty-room {
  margin: auto;
  font-size: 13px;
  color: var(--text-secondary);
  text-align: center;
}

.msg {
  display: flex;
  gap: 10px;
  align-items: flex-end;
}

.msg.self {
  flex-direction: row-reverse;
}

.bubble-wrap {
  min-width: 0;
  max-width: calc(100% - 52px);
}

.meta {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 4px;
  padding: 0 4px;
}

.msg.self .meta {
  flex-direction: row-reverse;
}

.mn {
  font-size: 12px;
  font-weight: 600;
  color: color-mix(in srgb, var(--text-primary) 85%, var(--text-secondary));
}

.mt {
  font-size: 11px;
  font-family: var(--font-code);
  color: var(--text-secondary);
}

.bubble {
  margin: 0;
  padding: 10px 14px;
  border-radius: 14px;
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-primary);
  background: color-mix(in srgb, var(--glass-bg) 65%, transparent);
  border: 1px solid color-mix(in srgb, var(--glass-border) 85%, transparent);
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.msg.self .bubble {
  background: color-mix(in srgb, #00f3ff 14%, var(--glass-bg));
  border-color: color-mix(in srgb, #00f3ff 28%, var(--glass-border));
}

.composer {
  display: flex;
  gap: 10px;
  align-items: flex-end;
  flex-shrink: 0;
  margin-top: 8px;
  padding-top: 10px;
  border-top: 1px solid color-mix(in srgb, var(--glass-border) 70%, transparent);
}

.draft {
  flex: 1;
  min-width: 0;
  font: inherit;
  font-size: 14px;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  border: 1px solid color-mix(in srgb, var(--glass-border) 90%, transparent);
  background: color-mix(in srgb, var(--glass-bg) 50%, transparent);
  color: var(--text-primary);
  resize: none;
  line-height: 1.45;
}

.draft:focus {
  outline: none;
  border-color: color-mix(in srgb, #00f3ff 40%, var(--glass-border));
}

.btn-send {
  flex-shrink: 0;
  padding: 10px 18px;
  border-radius: 12px;
  border: 1px solid color-mix(in srgb, #00f3ff 45%, var(--glass-border));
  background: color-mix(in srgb, var(--glass-bg) 75%, transparent);
  color: var(--text-primary);
  font: inherit;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
}

.btn-send:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-send:not(:disabled):hover {
  color: #00f3ff;
}

.send-err {
  margin: 6px 0 0;
  font-size: 12px;
  color: color-mix(in srgb, #ff6b6b 90%, var(--text-primary));
}

.foot-note {
  margin: 0;
  font-size: 11px;
  line-height: 1.5;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.code {
  font-family: var(--font-code);
  font-size: 10px;
  padding: 0.1em 0.35em;
  border-radius: 6px;
  background: color-mix(in srgb, var(--glass-bg) 60%, transparent);
}
</style>
