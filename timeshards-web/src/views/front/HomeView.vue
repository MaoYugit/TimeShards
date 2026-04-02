<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const THEME_ATTR = 'data-theme'
const isDark = ref(false)

function readIsDark() {
  isDark.value = document.documentElement.getAttribute(THEME_ATTR) === 'dark'
}

let mo: MutationObserver | null = null
let mql: MediaQueryList | null = null
let onMqlChange: ((e: MediaQueryListEvent) => void) | null = null

onMounted(() => {
  readIsDark()

  // React to explicit theme toggles (html[data-theme])
  mo = new MutationObserver(() => readIsDark())
  mo.observe(document.documentElement, { attributes: true, attributeFilter: [THEME_ATTR] })

  // Fallback: if user never toggles, follow system preference changes.
  mql = window.matchMedia?.('(prefers-color-scheme: dark)') ?? null
  onMqlChange = () => {
    // Only apply when page has no explicit theme attribute
    if (!document.documentElement.hasAttribute(THEME_ATTR)) readIsDark()
  }
  mql?.addEventListener?.('change', onMqlChange)

  // Tick clock
  now.value = new Date()
  if (nowTimer != null) window.clearInterval(nowTimer)
  nowTimer = window.setInterval(() => {
    now.value = new Date()
  }, 1000)
})

onBeforeUnmount(() => {
  mo?.disconnect()
  mo = null
  if (mql && onMqlChange) mql.removeEventListener?.('change', onMqlChange)
  mql = null
  onMqlChange = null

  if (nowTimer != null) window.clearInterval(nowTimer)
  nowTimer = null
})

const snakeSrc = computed(() =>
  isDark.value
    ? 'https://raw.githubusercontent.com/MaoYugit/MaoYugit/main/dist/github-contribution-grid-snake-dark.svg'
    : 'https://raw.githubusercontent.com/MaoYugit/MaoYugit/main/dist/github-contribution-grid-snake.svg',
)

// Time + calendar
const now = ref(new Date())
let nowTimer: number | null = null

const timeText = computed(() => {
  const d = now.value
  return new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(d)
})

const dateText = computed(() => {
  const d = now.value
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  }).format(d)
})

/** 模拟钟表：指针 SVG 默认朝上（12 点），rotate 顺时针；角度从 12 点起算，勿再减 90° */
const analogAngles = computed(() => {
  const d = now.value
  const h = d.getHours()
  const m = d.getMinutes()
  const s = d.getSeconds()
  const sec = s * 6
  const min = (m + s / 60) * 6
  const hour = ((h % 12) + m / 60 + s / 3600) * 30
  return { hour, min, sec }
})

type CalendarCell = { key: string; day: number | null; isToday: boolean; isInMonth: boolean }

const monthTitle = computed(() => {
  const d = now.value
  return new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: 'long' }).format(d)
})

const weekdayLabels = ['一', '二', '三', '四', '五', '六', '日']

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

const calendarCells = computed<CalendarCell[]>(() => {
  const d = now.value
  const year = d.getFullYear()
  const month = d.getMonth()
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  const today = startOfDay(new Date())

  // Convert JS Sunday=0..Saturday=6 to Monday=0..Sunday=6
  const firstDow = (first.getDay() + 6) % 7
  const daysInMonth = last.getDate()

  const cells: CalendarCell[] = []
  const total = 42 // 6 rows * 7 days
  for (let i = 0; i < total; i++) {
    const dayIndex = i - firstDow + 1
    const inMonth = dayIndex >= 1 && dayIndex <= daysInMonth
    const cellDate = inMonth ? new Date(year, month, dayIndex) : null
    const isTodayCell = cellDate ? isSameDay(cellDate, today) : false

    cells.push({
      key: `${year}-${month}-${i}`,
      day: inMonth ? dayIndex : null,
      isToday: isTodayCell,
      isInMonth: inMonth,
    })
  }
  return cells
})
</script>

<template>
  <main class="home page-container">
    <section class="hero" aria-label="TimeShards">
      <div class="top-grid">
        <div class="hero-col">
          <div class="hero-card">
            <p class="kicker">Welcome to</p>
            <h1 class="title">TimeShards</h1>
            <p class="subtitle">Fragments of time, crystallized into code.</p>
          </div>

          <article class="welcome-card" aria-label="欢迎与介绍">
            <p class="welcome-quote">「欢迎来到 TimeShards —— 愿这片小站能成为你浏览路上的一处歇脚点。」</p>
            <p class="welcome-intro">
              这里是我的个人站点：记录作品集、博客与一些实验。界面偏简洁与玻璃拟态风格，希望阅读起来轻松一点。若你有想法或想交流技术，也欢迎留言互动。
            </p>
          </article>
        </div>

        <aside class="side">
          <div class="time-card" aria-label="当前时间">
            <div class="time-card-text">
              <div class="time-main">{{ timeText }}</div>
              <div class="time-sub">{{ dateText }}</div>
            </div>
            <div class="time-card-clock" aria-hidden="true">
              <svg class="analog-clock" viewBox="0 0 100 100">
                <circle
                  class="analog-face"
                  cx="50"
                  cy="50"
                  r="44"
                  fill="none"
                  stroke-width="1.5"
                />
                <g class="analog-ticks">
                  <line
                    v-for="i in 12"
                    :key="'t' + i"
                    x1="50"
                    :y1="8"
                    x2="50"
                    :y2="i % 3 === 0 ? 14 : 11"
                    stroke="currentColor"
                    stroke-width="1.2"
                    stroke-linecap="round"
                    :transform="`rotate(${(i - 1) * 30} 50 50)`"
                  />
                </g>
                <g :transform="`rotate(${analogAngles.hour} 50 50)`">
                  <line
                    class="analog-hand analog-hand-hour"
                    x1="50"
                    y1="50"
                    x2="50"
                    y2="30"
                    stroke-linecap="round"
                  />
                </g>
                <g :transform="`rotate(${analogAngles.min} 50 50)`">
                  <line
                    class="analog-hand analog-hand-minute"
                    x1="50"
                    y1="50"
                    x2="50"
                    y2="18"
                    stroke-linecap="round"
                  />
                </g>
                <g :transform="`rotate(${analogAngles.sec} 50 50)`">
                  <line
                    class="analog-hand analog-hand-second"
                    x1="50"
                    y1="50"
                    x2="50"
                    y2="14"
                    stroke-linecap="round"
                  />
                </g>
                <circle class="analog-pivot" cx="50" cy="50" r="2.2" />
              </svg>
            </div>
          </div>

          <div class="calendar-card" aria-label="日历">
            <div class="calendar-head">
              <div class="calendar-title">{{ monthTitle }}</div>
            </div>
            <div class="calendar-weekdays" aria-hidden="true">
              <div v-for="w in weekdayLabels" :key="w" class="calendar-weekday">{{ w }}</div>
            </div>
            <div class="calendar-grid" role="grid" aria-label="本月日历">
              <div
                v-for="c in calendarCells"
                :key="c.key"
                class="calendar-cell"
                :class="{ 'is-empty': !c.isInMonth, 'is-today': c.isToday }"
                role="gridcell"
                :aria-label="c.day ? String(c.day) : ''"
              >
                <span v-if="c.day != null" class="calendar-day">{{ c.day }}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <div class="snake-wrap" aria-label="GitHub contribution snake">
        <img class="snake" :src="snakeSrc" alt="snake animation" loading="lazy" decoding="async" />
      </div>
    </section>
  </main>
</template>

<style scoped>
.page-container {
  min-height: 100vh;
  padding: clamp(20px, 4vw, 44px);
  padding-bottom: calc(clamp(20px, 4vw, 44px) + var(--dock-height));
  display: grid;
  place-items: center;
}

.hero {
  width: min(1100px, 100%);
  display: grid;
  gap: clamp(18px, 3vw, 28px);
  align-items: center;
}

.top-grid {
  display: grid;
  grid-template-columns: 1.35fr 0.65fr;
  gap: clamp(14px, 2.6vw, 22px);
  align-items: stretch;
}

.hero-col {
  display: flex;
  flex-direction: column;
  gap: clamp(14px, 2.6vw, 22px);
  min-width: 0;
  align-self: stretch;
}

.welcome-card {
  position: relative;
  flex: 1;
  min-width: 0;
  min-height: 120px;
  padding: clamp(16px, 2.6vw, 22px);
  border-radius: var(--radius-lg);
  background: color-mix(in srgb, var(--glass-bg) 84%, transparent);
  border: 1px solid var(--glass-border);
  box-shadow: var(--card-shadow);
  backdrop-filter: blur(calc(var(--glass-blur) + 4px));
  -webkit-backdrop-filter: blur(calc(var(--glass-blur) + 4px));
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: clamp(12px, 2vw, 16px);
}

.welcome-card::before {
  content: '';
  position: absolute;
  inset: -2px;
  background: radial-gradient(
    480px circle at 12% 18%,
    color-mix(in srgb, var(--accent-color) 14%, transparent),
    transparent 58%
  );
  pointer-events: none;
  opacity: 0.85;
}

.welcome-card > * {
  position: relative;
  z-index: 1;
}

.welcome-quote {
  margin: 0;
  font-size: clamp(13px, 1.75vw, 15px);
  line-height: 1.65;
  color: color-mix(in srgb, var(--text-primary) 90%, var(--text-secondary));
  font-style: italic;
  border-left: 3px solid color-mix(in srgb, #00f3ff 50%, var(--glass-border));
  padding-left: 12px;
  overflow-wrap: break-word;
  word-break: break-word;
}

.welcome-intro {
  margin: 0;
  font-size: clamp(12px, 1.55vw, 14px);
  line-height: 1.7;
  color: color-mix(in srgb, var(--text-primary) 72%, var(--text-secondary));
  overflow-wrap: break-word;
  word-break: break-word;
}

.side {
  display: grid;
  gap: clamp(14px, 2.6vw, 22px);
  align-content: start;
}

.hero-card {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: clamp(18px, 3vw, 26px);
  border-radius: var(--radius-lg);
  background: color-mix(in srgb, var(--glass-bg) 86%, transparent);
  border: 1px solid var(--glass-border);
  box-shadow: var(--card-shadow);
  backdrop-filter: blur(calc(var(--glass-blur) + 4px));
  -webkit-backdrop-filter: blur(calc(var(--glass-blur) + 4px));
  overflow: hidden;
}

.hero-card::before {
  content: '';
  position: absolute;
  inset: -2px;
  background: radial-gradient(
      600px circle at 20% 10%,
      color-mix(in srgb, var(--accent-color) 22%, transparent),
      transparent 60%
    ),
    radial-gradient(520px circle at 85% 35%, rgba(0, 243, 255, 0.18), transparent 62%);
  pointer-events: none;
  opacity: 0.9;
}

.hero-card > * {
  position: relative;
  z-index: 1;
}

.time-card,
.calendar-card {
  border-radius: var(--radius-lg);
  background: color-mix(in srgb, var(--glass-bg) 82%, transparent);
  border: 1px solid var(--glass-border);
  box-shadow: var(--card-shadow);
  backdrop-filter: blur(calc(var(--glass-blur) + 4px));
  -webkit-backdrop-filter: blur(calc(var(--glass-blur) + 4px));
  overflow: hidden;
}

.time-card {
  padding: clamp(14px, 2.4vw, 18px);
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: clamp(10px, 2vw, 16px);
  min-height: 92px;
}

.time-card-text {
  flex: 1;
  min-width: 0;
  display: grid;
  gap: 6px;
}

.time-card-clock {
  flex-shrink: 0;
  width: clamp(56px, 12vw, 76px);
  height: clamp(56px, 12vw, 76px);
  border-radius: 50%;
  border: 1px solid color-mix(in srgb, var(--glass-border) 92%, transparent);
  background: color-mix(in srgb, var(--glass-bg) 40%, transparent);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, #00f3ff 12%, transparent);
  display: grid;
  place-items: center;
  padding: 4px;
}

.analog-clock {
  width: 100%;
  height: 100%;
  display: block;
  color: color-mix(in srgb, var(--text-secondary) 75%, transparent);
}

.analog-face {
  stroke: color-mix(in srgb, var(--text-secondary) 45%, transparent);
}

.analog-hand {
  stroke-width: 2.8;
  stroke: var(--text-primary);
}

.analog-hand-hour {
  stroke-width: 3.4;
  opacity: 0.95;
}

.analog-hand-minute {
  stroke-width: 2.4;
  opacity: 0.92;
}

.analog-hand-second {
  stroke-width: 1.4;
  stroke: #00f3ff;
  opacity: 0.95;
  filter: drop-shadow(0 0 4px color-mix(in srgb, #00f3ff 35%, transparent));
}

.analog-pivot {
  fill: var(--text-primary);
  stroke: color-mix(in srgb, #00f3ff 55%, var(--glass-border));
  stroke-width: 0.6;
}

.time-main {
  font-size: clamp(26px, 3.2vw, 34px);
  font-family: var(--font-code);
  letter-spacing: -0.02em;
  color: var(--text-primary);
  text-shadow: 0 0 18px color-mix(in srgb, #00f3ff 18%, transparent);
}

.time-sub {
  font-size: 13px;
  color: var(--text-secondary);
  letter-spacing: 0.02em;
}

.calendar-card {
  padding: clamp(14px, 2.4vw, 18px);
  aspect-ratio: 1 / 1;
  display: grid;
  gap: 10px;
}

.calendar-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.calendar-title {
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.01em;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
}

.calendar-weekday {
  font-size: 12px;
  color: var(--text-secondary);
  text-align: center;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-auto-rows: 1fr;
  gap: 6px;
  min-height: 0;
}

.calendar-cell {
  border-radius: 10px;
  background: color-mix(in srgb, var(--glass-bg) 52%, transparent);
  border: 1px solid color-mix(in srgb, var(--glass-border) 78%, transparent);
  display: grid;
  place-items: center;
  transition: var(--transition-smooth);
}

.calendar-cell.is-empty {
  opacity: 0.35;
  background: transparent;
  border-color: transparent;
}

.calendar-cell.is-today {
  border-color: color-mix(in srgb, #00f3ff 70%, var(--glass-border));
  box-shadow: 0 0 0 1px color-mix(in srgb, #00f3ff 30%, transparent) inset;
  background: radial-gradient(
    220px circle at 50% 30%,
    color-mix(in srgb, #00f3ff 22%, transparent),
    color-mix(in srgb, var(--glass-bg) 45%, transparent)
  );
}

.calendar-day {
  font-size: 13px;
  color: var(--text-primary);
  font-family: var(--font-code);
}

.kicker {
  align-self: flex-start;
  text-align: left;
  font-size: clamp(12px, 1.5vw, 14px);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-secondary);
}

.title {
  align-self: stretch;
  width: 100%;
  margin-top: 8px;
  text-align: center;
  font-size: clamp(40px, 7vw, 76px);
  line-height: 1.02;
  letter-spacing: -0.04em;
  color: var(--text-primary);
  text-shadow: 0 0 22px color-mix(in srgb, #00f3ff 22%, transparent);
}

.subtitle {
  align-self: stretch;
  width: 100%;
  margin-top: 10px;
  text-align: left;
  font-size: clamp(14px, 2.2vw, 18px);
  line-height: 1.55;
  color: color-mix(in srgb, var(--text-primary) 18%, var(--text-secondary));
}

.snake-wrap {
  border-radius: var(--radius-lg);
  background: color-mix(in srgb, var(--glass-bg) 78%, transparent);
  border: 1px solid var(--glass-border);
  box-shadow: var(--card-shadow);
  padding: clamp(10px, 2.4vw, 16px);
  overflow: hidden;
}

.snake {
  display: block;
  width: 100%;
  height: auto;
  max-height: min(42vh, 360px);
  object-fit: contain;
}

@media (max-width: 520px) {
  /* 长页面从顶部排布，配合 .app-wrapper 纵向滚动，避免内容被「居中」在视口内裁切感 */
  .home.page-container {
    place-items: start stretch;
    align-content: start;
    padding-top: 10px;
  }

  .top-grid {
    grid-template-columns: 1fr;
  }
  .calendar-card {
    aspect-ratio: auto;
    min-height: 320px;
  }
  .snake {
    max-height: 34vh;
  }
}
</style>
