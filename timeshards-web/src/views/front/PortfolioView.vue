<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { portfolioProjects, type PortfolioProject } from '@/data/portfolio'

const isOpen = ref(false)
/** 0 = 目录跨页；1..n = 第 n 个项目 */
const spreadIndex = ref(0)

const projectCount = computed(() => portfolioProjects.length)
const spreadCount = computed(() => 1 + projectCount.value)

const currentProject = computed<PortfolioProject | null>(() => {
  const i = spreadIndex.value
  if (i < 1) return null
  return portfolioProjects[i - 1] ?? null
})

/** 桌面端：左/右页点击翻页；窄屏用手势 */
const prefersPageClick = ref(true)
let mq: MediaQueryList | null = null
function syncPageClickMode() {
  prefersPageClick.value = mq?.matches ?? true
}

/** 闭合卡片静止姿态（参考默认视觉：略后仰、右侧略近、左上微翘） */
const MINI_BASE = {
  perspective: 900,
  rotateX: 28,
  rotateY: 14,
  rotateZ: -14,
} as const

/** 闭合态：在 MINI_BASE 上叠加指针带来的增量（度） */
const tilt = ref({ x: 0, y: 0 })
const miniPointerDown = ref(false)
let miniOpenProbe: { pointerId: number; x: number; y: number; moved: boolean } | null = null

const miniTiltStyle = computed(() => ({
  transform: `perspective(${MINI_BASE.perspective}px) rotateX(${MINI_BASE.rotateX + tilt.value.x}deg) rotateY(${MINI_BASE.rotateY + tilt.value.y}deg) rotateZ(${MINI_BASE.rotateZ}deg)`,
}))

function updateMiniTilt(el: HTMLElement, clientX: number, clientY: number) {
  const r = el.getBoundingClientRect()
  const nx = (clientX - r.left) / Math.max(r.width, 1) - 0.5
  const ny = (clientY - r.top) / Math.max(r.height, 1) - 0.5
  // 线性映射 + 略增强四角方向（更灵活）
  const kx = 1 + Math.min(0.45, (nx * nx + ny * ny) * 1.2)
  tilt.value = {
    x: -ny * 28 * kx,
    y: nx * 32 * kx,
  }
}

function resetMiniTilt() {
  tilt.value = { x: 0, y: 0 }
}

function onMiniPointerMove(e: PointerEvent) {
  if (isOpen.value) return
  const el = e.currentTarget as HTMLElement
  updateMiniTilt(el, e.clientX, e.clientY)
  const d = miniOpenProbe
  if (d && e.pointerId === d.pointerId) {
    const dx = e.clientX - d.x
    const dy = e.clientY - d.y
    if (Math.hypot(dx, dy) > 12) d.moved = true
  }
}

function onMiniPointerDown(e: PointerEvent) {
  if (isOpen.value || e.button !== 0) return
  miniPointerDown.value = true
  miniOpenProbe = { pointerId: e.pointerId, x: e.clientX, y: e.clientY, moved: false }
  try {
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  } catch {
    /* ignore */
  }
}

function onMiniPointerUp(e: PointerEvent) {
  const el = e.currentTarget as HTMLElement
  miniPointerDown.value = false
  const d = miniOpenProbe
  miniOpenProbe = null
  try {
    el.releasePointerCapture(e.pointerId)
  } catch {
    /* ignore */
  }
  if (d && e.pointerId === d.pointerId && !d.moved) {
    openCard()
  } else {
    resetMiniTilt()
  }
}

function onMiniPointerCancel() {
  miniPointerDown.value = false
  miniOpenProbe = null
  resetMiniTilt()
}

function onMiniPointerLeave() {
  if (miniPointerDown.value) return
  resetMiniTilt()
}

const mainEl = ref<HTMLElement | null>(null)

function scrollPortfolioTop() {
  nextTick(() => {
    mainEl.value?.scrollTo({ top: 0, behavior: 'instant' })
  })
}

function openCard() {
  spreadIndex.value = 0
  isOpen.value = true
  resetMiniTilt()
  scrollPortfolioTop()
}

function closeCard() {
  isOpen.value = false
  spreadIndex.value = 0
  resetMiniTilt()
  scrollPortfolioTop()
}

function nextSpread() {
  if (spreadIndex.value < spreadCount.value - 1) spreadIndex.value += 1
}

function prevSpread() {
  if (spreadIndex.value > 0) spreadIndex.value -= 1
}

function goToProjectSpread(projectIndex: number) {
  const next = projectIndex + 1
  if (next >= 1 && next < spreadCount.value) spreadIndex.value = next
}

function onKeydown(e: KeyboardEvent) {
  if (!isOpen.value) return
  if (e.key === 'Escape') {
    e.preventDefault()
    closeCard()
    return
  }
  if (e.key === 'ArrowRight') {
    e.preventDefault()
    nextSpread()
  }
  if (e.key === 'ArrowLeft') {
    e.preventDefault()
    prevSpread()
  }
}

/** Web：点击左页上一页、右页下一页（避开链接与按钮） */
function onPageLeftClick(e: MouseEvent) {
  if (!prefersPageClick.value) return
  const el = e.target as HTMLElement
  if (el.closest('a, button')) return
  prevSpread()
}

function onPageRightClick(e: MouseEvent) {
  if (!prefersPageClick.value) return
  const el = e.target as HTMLElement
  if (el.closest('a, button')) return
  nextSpread()
}

const spreadSwipeRef = ref<HTMLElement | null>(null)
const swipeTouchStart = ref<{ x: number; y: number } | null>(null)
const swipePadScrollTop = new Map<Element, number>()

/** 手机：下滑上一页、上滑下一页（若页内未发生滚动） */
function onSwipeStart(e: TouchEvent) {
  if (prefersPageClick.value) return
  if (e.touches.length !== 1) return
  const t = e.touches.item(0)
  if (!t) return
  swipeTouchStart.value = { x: t.clientX, y: t.clientY }
  swipePadScrollTop.clear()
  spreadSwipeRef.value?.querySelectorAll('.page-pad').forEach((el) => {
    swipePadScrollTop.set(el, el.scrollTop)
  })
}

function onSwipeEnd(e: TouchEvent) {
  if (prefersPageClick.value) return
  const from = swipeTouchStart.value
  swipeTouchStart.value = null
  if (!from) return
  const t = e.changedTouches[0]
  if (!t) return

  let scrolled = false
  spreadSwipeRef.value?.querySelectorAll('.page-pad').forEach((el) => {
    const start = swipePadScrollTop.get(el) ?? 0
    if (Math.abs(el.scrollTop - start) > 12) scrolled = true
  })
  if (scrolled) return

  const dy = t.clientY - from.y
  const dx = t.clientX - from.x
  if (Math.abs(dy) < 52 || Math.abs(dy) < Math.abs(dx) * 1.1) return
  if (dy > 0) prevSpread()
  else nextSpread()
}

function onSwipeCancel() {
  swipeTouchStart.value = null
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  mq = window.matchMedia('(min-width: 721px)')
  syncPageClickMode()
  mq.addEventListener('change', syncPageClickMode)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  mq?.removeEventListener('change', syncPageClickMode)
})

function linkTarget(href: string) {
  return href.startsWith('http') ? '_blank' : undefined
}

function linkRel(href: string) {
  return href.startsWith('http') ? 'noopener noreferrer' : undefined
}
</script>

<template>
  <main ref="mainEl" class="portfolio page-container" :class="{ 'is-open': isOpen }">
    <!-- 展开时：点击空白处收起 -->
    <div
      v-if="isOpen"
      class="portfolio-backdrop"
      aria-hidden="true"
      @click="closeCard"
    />

    <!-- 初始：小卡片（指针倾斜 3D · 单击打开） -->
    <Transition name="fade">
      <div v-if="!isOpen" class="closed-layer">
        <p class="closed-kicker">Portfolio</p>
        <p class="closed-hint">移动指针倾斜卡片 · 单击打开</p>
        <button
          type="button"
          class="card-mini-hit"
          :class="{ 'is-pressing': miniPointerDown }"
          aria-label="打开作品集卡片"
          @pointerdown="onMiniPointerDown"
          @pointermove="onMiniPointerMove"
          @pointerup="onMiniPointerUp"
          @pointercancel="onMiniPointerCancel"
          @pointerleave="onMiniPointerLeave"
        >
          <div class="card-mini-ambient" aria-hidden="true">
            <div class="card-mini-shadow" />
            <div class="card-mini" :style="miniTiltStyle">
              <div class="card-mini-face">
                <span class="card-mini-title">作品集</span>
                <span class="card-mini-sub">TimeShards</span>
              </div>
            </div>
          </div>
        </button>
      </div>
    </Transition>

    <!-- 展开后 -->
    <Transition name="card-expand">
      <div
        v-if="isOpen"
        class="card-open"
        role="region"
        aria-label="作品集卡片"
        @click.stop
      >
        <div class="card-toolbar">
          <button type="button" class="btn-text" @click="closeCard">收起卡片</button>
          <span class="toolbar-hint toolbar-hint--desktop" aria-hidden="true"
            >← → 翻页 · Esc 收起 · 点空白收起 · 点左/右页翻页</span
          >
          <span class="toolbar-hint toolbar-hint--touch" aria-hidden="true"
            >上滑下一页 · 下滑上一页 · Esc 收起</span
          >
        </div>

        <div class="card-frame">
          <Transition mode="out-in" name="spread">
            <div
              :key="spreadIndex"
              ref="spreadSwipeRef"
              class="card-spread"
              @touchstart.passive="onSwipeStart"
              @touchend.passive="onSwipeEnd"
              @touchcancel.passive="onSwipeCancel"
            >
              <div
                class="page page-left"
                :class="{ 'page-flip-zone': prefersPageClick }"
                @click="onPageLeftClick"
              >
                <div class="page-pad">
                  <template v-if="spreadIndex === 0">
                    <div class="page-blank" aria-hidden="true" />
                    <p class="blank-caption">扉页留白</p>
                  </template>
                  <template v-else-if="currentProject">
                    <p class="page-kicker">Project</p>
                    <h2 class="page-title">{{ currentProject.title }}</h2>
                    <time class="page-time" :datetime="currentProject.period">{{
                      currentProject.period
                    }}</time>
                    <p class="page-body">{{ currentProject.summary }}</p>
                    <ul class="page-tags" aria-label="技术栈">
                      <li v-for="t in currentProject.tags" :key="t" class="page-tag">{{ t }}</li>
                    </ul>
                    <div v-if="currentProject.links?.length" class="page-links">
                      <a
                        v-for="link in currentProject.links"
                        :key="link.href + link.label"
                        class="page-link"
                        :href="link.href"
                        :target="linkTarget(link.href)"
                        :rel="linkRel(link.href)"
                      >
                        {{ link.label }}<span class="link-arrow">↗</span>
                      </a>
                    </div>
                  </template>
                </div>
              </div>

              <div class="card-spine" aria-hidden="true" />

              <div
                class="page page-right"
                :class="{ 'page-flip-zone': prefersPageClick }"
                @click="onPageRightClick"
              >
                <div class="page-pad">
                  <template v-if="spreadIndex === 0">
                    <h2 class="toc-title">目录</h2>
                    <p class="toc-lead">点击条目跳转到对应跨页</p>
                    <ol class="toc-list">
                      <li v-for="(p, i) in portfolioProjects" :key="p.id" class="toc-item">
                        <button type="button" class="toc-btn" @click="goToProjectSpread(i)">
                          <span class="toc-num">{{ String(i + 1).padStart(2, '0') }}</span>
                          <span class="toc-label">{{ p.title }}</span>
                        </button>
                      </li>
                    </ol>
                  </template>
                  <template v-else-if="currentProject">
                    <div
                      class="showcase"
                      :class="{ 'showcase--has-img': Boolean(currentProject.image) }"
                    >
                      <img
                        v-if="currentProject.image"
                        class="showcase-img"
                        :src="currentProject.image"
                        :alt="`${currentProject.title} 展示`"
                        loading="lazy"
                        decoding="async"
                      />
                      <div v-else class="showcase-placeholder">
                        <span class="showcase-ph-title">{{ currentProject.title }}</span>
                        <span class="showcase-ph-hint">在 portfolio.ts 中为该项目设置 image 字段以展示截图</span>
                      </div>
                      <p v-if="currentProject.showcaseNote" class="showcase-note">
                        {{ currentProject.showcaseNote }}
                      </p>
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </Transition>
        </div>

        <div class="card-nav">
          <button
            type="button"
            class="nav-btn"
            :disabled="spreadIndex <= 0"
            aria-label="上一页"
            @click="prevSpread"
          >
            ‹
          </button>
          <span class="nav-meta">{{ spreadIndex + 1 }} / {{ spreadCount }}</span>
          <button
            type="button"
            class="nav-btn"
            :disabled="spreadIndex >= spreadCount - 1"
            aria-label="下一页"
            @click="nextSpread"
          >
            ›
          </button>
        </div>
      </div>
    </Transition>
  </main>
</template>

<style scoped>
.page-container {
  position: relative;
  isolation: isolate;
  min-height: 100vh;
  min-height: 100dvh;
  max-height: 100vh;
  max-height: 100dvh;
  padding: clamp(16px, 3vw, 32px);
  padding-bottom: calc(
    clamp(16px, 3vw, 32px) + var(--dock-height) + env(safe-area-inset-bottom, 0px)
  );
  box-sizing: border-box;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  -webkit-overflow-scrolling: touch;
}

/* 始终 flex-start，闭合态靠 closed-layer 内部垂直居中，避免 is-open 切换时 justify 突变导致弹跳 */
.page-container:not(.is-open) {
  overflow-y: hidden;
}

.page-container.is-open {
  align-items: stretch;
  overflow-y: auto;
}

.portfolio {
  width: 100%;
}

.portfolio-backdrop {
  position: absolute;
  inset: 0;
  z-index: 0;
  cursor: default;
}

/* —— 闭合：平躺小卡片（占满主区域以便真正居中，避免 Transition 子项不参与 flex） —— */
.closed-layer {
  position: relative;
  z-index: 1;
  flex: 1;
  width: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  box-sizing: border-box;
}

.closed-kicker {
  margin: 0;
  font-size: 12px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--text-secondary);
}

.closed-hint {
  margin: 8px 0 0;
  font-size: 13px;
  color: color-mix(in srgb, var(--text-primary) 45%, var(--text-secondary));
}

.card-mini-hit {
  margin-top: 14px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: default;
  position: relative;
  transform-style: preserve-3d;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
}

.card-mini-hit.is-pressing {
  cursor: grab;
}

.card-mini-hit:focus-visible {
  outline: 2px solid color-mix(in srgb, #00f3ff 70%, transparent);
  outline-offset: 8px;
  border-radius: 16px;
}

/* 与背景粒子类似的慢速漂移律动（外层动 transform，内层仍由指针控制倾斜） */
.card-mini-ambient {
  position: relative;
  display: inline-block;
  transform-style: preserve-3d;
  animation: portfolio-card-drift 16s ease-in-out infinite;
}

.card-mini-hit.is-pressing .card-mini-ambient {
  animation-play-state: paused;
}

@keyframes portfolio-card-drift {
  0%,
  100% {
    transform: translate3d(0, 0, 0) rotateZ(0deg);
  }
  18% {
    transform: translate3d(5px, -9px, 0) rotateZ(0.55deg);
  }
  36% {
    transform: translate3d(-5px, 5px, 0) rotateZ(-0.4deg);
  }
  54% {
    transform: translate3d(-6px, -6px, 0) rotateZ(0.3deg);
  }
  72% {
    transform: translate3d(7px, 3px, 0) rotateZ(-0.25deg);
  }
  88% {
    transform: translate3d(-3px, 7px, 0) rotateZ(0.15deg);
  }
}

.card-mini-shadow {
  position: absolute;
  left: 50%;
  bottom: -10px;
  width: 72%;
  height: 22px;
  transform: translateX(-50%);
  background: radial-gradient(
    ellipse at center,
    color-mix(in srgb, #000 28%, transparent) 0%,
    transparent 72%
  );
  filter: blur(8px);
  pointer-events: none;
}

.card-mini {
  position: relative;
  width: min(280px, 78vw);
  height: min(168px, 46vw);
  transform-style: preserve-3d;
  /* 不设 transform transition：倾斜需即时响应，否则会发黏、不灵活 */
}

@media (min-width: 768px) {
  .card-mini {
    width: min(320px, 36vw);
    height: min(188px, 21vw);
  }
}

.card-mini-face {
  position: absolute;
  inset: 0;
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  animation: portfolio-card-glow 11s ease-in-out infinite alternate;
  background:
    linear-gradient(
      155deg,
      color-mix(in srgb, var(--glass-bg) 88%, transparent) 0%,
      color-mix(in srgb, var(--glass-bg) 62%, transparent) 100%
    ),
    radial-gradient(120% 80% at 20% 15%, color-mix(in srgb, #00f3ff 16%, transparent), transparent 55%);
  border: 1px solid var(--glass-border);
  /* box-shadow 由 portfolio-card-glow 关键帧驱动 */
  backdrop-filter: blur(calc(var(--glass-blur) + 2px));
  -webkit-backdrop-filter: blur(calc(var(--glass-blur) + 2px));
}

@keyframes portfolio-card-glow {
  0%,
  100% {
    box-shadow:
      var(--card-shadow),
      inset 0 1px 0 color-mix(in srgb, #fff 22%, transparent),
      0 0 0 0 color-mix(in srgb, #00f3ff 0%, transparent);
  }
  50% {
    box-shadow:
      var(--card-shadow),
      inset 0 1px 0 color-mix(in srgb, #fff 24%, transparent),
      0 0 28px color-mix(in srgb, #00f3ff 18%, transparent);
  }
}

@media (prefers-reduced-motion: reduce) {
  .card-mini-ambient {
    animation: none;
  }

  .card-mini-face {
    animation: none;
    box-shadow:
      var(--card-shadow),
      inset 0 1px 0 color-mix(in srgb, #fff 22%, transparent);
  }
}

.card-mini-title {
  font-size: clamp(17px, 4.2vw, 22px);
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--text-primary);
  text-shadow: 0 0 14px color-mix(in srgb, #00f3ff 25%, transparent);
}

.card-mini-sub {
  font-size: 12px;
  font-family: var(--font-code);
  color: var(--text-secondary);
  letter-spacing: 0.06em;
}

/* —— 展开容器 —— */
.card-open {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: min(1120px, 100%);
  margin-inline: auto;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  /* 首帧即占满可用高度，避免先矮后高的布局跳动 */
  min-height: calc(100dvh - var(--dock-height) - clamp(40px, 7vw, 64px));
}

@media (min-width: 769px) {
  .card-open {
    max-height: calc(100dvh - var(--dock-height) - clamp(24px, 4vw, 40px));
  }
}

.card-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-shrink: 0;
}

.btn-text {
  font: inherit;
  font-size: 13px;
  color: color-mix(in srgb, #00f3ff 90%, var(--accent-color));
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 6px 4px;
  border-radius: 8px;
  transition: var(--transition-smooth);
}

.btn-text:hover {
  color: #00f3ff;
  text-shadow: 0 0 10px color-mix(in srgb, #00f3ff 30%, transparent);
}

.toolbar-hint {
  font-size: 11px;
  color: var(--text-secondary);
  font-family: var(--font-code);
}

.toolbar-hint--desktop {
  display: inline;
}

.toolbar-hint--touch {
  display: none;
}

@media (max-width: 720px) {
  .toolbar-hint--desktop {
    display: none;
  }
  .toolbar-hint--touch {
    display: inline;
    font-size: 10px;
    max-width: 70vw;
    text-align: right;
    line-height: 1.35;
  }
}

.card-frame {
  flex: 1;
  min-height: 0;
  perspective: 1000px;
  border-radius: var(--radius-lg);
  background: color-mix(in srgb, var(--glass-bg) 78%, transparent);
  border: 1px solid var(--glass-border);
  box-shadow: var(--card-shadow);
  backdrop-filter: blur(calc(var(--glass-blur) + 4px));
  -webkit-backdrop-filter: blur(calc(var(--glass-blur) + 4px));
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.card-spread {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 1fr 10px 1fr;
  align-items: stretch;
}

.page {
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.page.page-left.page-flip-zone {
  cursor: w-resize;
}

.page.page-right.page-flip-zone {
  cursor: e-resize;
}

.page-pad {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: clamp(16px, 2.8vw, 24px);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.page-left .page-pad {
  background: linear-gradient(
    90deg,
    color-mix(in srgb, var(--glass-bg) 35%, transparent),
    transparent 88%
  );
}

.page-right .page-pad {
  background: linear-gradient(
    270deg,
    color-mix(in srgb, var(--glass-bg) 35%, transparent),
    transparent 88%
  );
}

.card-spine {
  background: linear-gradient(
    90deg,
    color-mix(in srgb, var(--text-primary) 8%, transparent),
    color-mix(in srgb, #00f3ff 12%, transparent),
    color-mix(in srgb, var(--text-primary) 8%, transparent)
  );
  box-shadow: inset 0 0 12px color-mix(in srgb, #000 18%, transparent);
}

.page-blank {
  flex: 1;
  min-height: 80px;
  border-radius: 12px;
  border: 1px dashed color-mix(in srgb, var(--glass-border) 85%, transparent);
  background: color-mix(in srgb, var(--glass-bg) 25%, transparent);
}

.blank-caption {
  margin: 0;
  font-size: 12px;
  color: var(--text-secondary);
  text-align: center;
}

.page-kicker {
  margin: 0;
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--text-secondary);
}

.page-title {
  margin: 0;
  font-size: clamp(18px, 2.4vw, 22px);
  letter-spacing: -0.02em;
  color: var(--text-primary);
  text-shadow: 0 0 16px color-mix(in srgb, #00f3ff 18%, transparent);
}

.page-time {
  font-size: 12px;
  font-family: var(--font-code);
  color: var(--text-secondary);
}

.page-body {
  margin: 0;
  font-size: 13px;
  line-height: 1.7;
  color: color-mix(in srgb, var(--text-primary) 82%, var(--text-secondary));
}

.page-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  list-style: none;
  margin: 0;
  padding: 0;
}

.page-tag {
  font-size: 11px;
  font-family: var(--font-code);
  padding: 4px 10px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--glass-bg) 50%, transparent);
  border: 1px solid color-mix(in srgb, var(--glass-border) 88%, transparent);
}

.page-links {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: auto;
  padding-top: 8px;
}

.page-link {
  font-size: 13px;
  font-weight: 500;
  color: color-mix(in srgb, #00f3ff 88%, var(--accent-color));
  text-decoration: none;
  transition: var(--transition-smooth);
}

.page-link:hover {
  color: #00f3ff;
}

.link-arrow {
  margin-left: 3px;
  font-size: 11px;
}

.toc-title {
  margin: 0;
  font-size: clamp(20px, 3vw, 26px);
  color: var(--text-primary);
  text-shadow: 0 0 14px color-mix(in srgb, #00f3ff 16%, transparent);
}

.toc-lead {
  margin: 0;
  font-size: 12px;
  color: var(--text-secondary);
}

.toc-list {
  margin: 8px 0 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.toc-item {
  margin: 0;
}

.toc-btn {
  width: 100%;
  display: flex;
  align-items: baseline;
  gap: 12px;
  text-align: left;
  padding: 12px 14px;
  border-radius: var(--radius-md);
  border: 1px solid color-mix(in srgb, var(--glass-border) 90%, transparent);
  background: color-mix(in srgb, var(--glass-bg) 45%, transparent);
  color: var(--text-primary);
  font: inherit;
  cursor: pointer;
  transition: var(--transition-smooth);
}

.toc-btn:hover {
  border-color: color-mix(in srgb, #00f3ff 45%, var(--glass-border));
  box-shadow: 0 0 0 1px color-mix(in srgb, #00f3ff 15%, transparent);
}

.toc-num {
  font-family: var(--font-code);
  font-size: 12px;
  color: color-mix(in srgb, #00f3ff 85%, var(--accent-color));
  flex-shrink: 0;
}

.toc-label {
  font-size: 14px;
  line-height: 1.4;
}

.showcase {
  flex: 1;
  min-height: 160px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.showcase-img {
  width: 100%;
  max-height: min(42vh, 320px);
  object-fit: cover;
  border-radius: var(--radius-md);
  border: 1px solid color-mix(in srgb, var(--glass-border) 92%, transparent);
  background: color-mix(in srgb, var(--glass-bg) 40%, transparent);
}

.showcase-placeholder {
  flex: 1;
  min-height: 180px;
  border-radius: var(--radius-md);
  border: 1px dashed color-mix(in srgb, var(--glass-border) 80%, transparent);
  background:
    radial-gradient(80% 60% at 30% 20%, color-mix(in srgb, #00f3ff 14%, transparent), transparent 60%),
    color-mix(in srgb, var(--glass-bg) 35%, transparent);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 20px;
  text-align: center;
}

.showcase-ph-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.showcase-ph-hint {
  font-size: 12px;
  line-height: 1.5;
  color: var(--text-secondary);
  max-width: 28ch;
}

.showcase-note {
  margin: 0;
  font-size: 12px;
  line-height: 1.55;
  color: color-mix(in srgb, var(--text-primary) 65%, var(--text-secondary));
}

.card-nav {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.nav-btn {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: 1px solid var(--glass-border);
  background: color-mix(in srgb, var(--glass-bg) 70%, transparent);
  color: var(--text-primary);
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  transition: var(--transition-smooth);
}

.nav-btn:hover:not(:disabled) {
  border-color: color-mix(in srgb, #00f3ff 50%, var(--glass-border));
  color: #00f3ff;
}

.nav-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.nav-meta {
  font-size: 12px;
  font-family: var(--font-code);
  color: var(--text-secondary);
  min-width: 5em;
  text-align: center;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.28s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 仅用淡入淡出，避免 scale 造成「先扁后弹」 */
.card-expand-enter-active,
.card-expand-leave-active {
  transition: opacity 0.32s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-expand-enter-from,
.card-expand-leave-to {
  opacity: 0;
}

/* 翻页：轻量交叉淡化，不再叠加 3D rotate 以免与布局抖动打架 */
.spread-enter-active,
.spread-leave-active {
  transition: opacity 0.2s ease-out;
}

.spread-enter-from,
.spread-leave-to {
  opacity: 0;
}

@media (max-width: 720px) {
  .card-spread {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto;
  }

  .card-spine {
    display: none;
  }

  .page-left .page-pad {
    border-bottom: 1px solid color-mix(in srgb, var(--glass-border) 70%, transparent);
  }

  .page-container.is-open {
    min-height: 100dvh;
    max-height: none;
    flex: 1;
  }

  .card-open {
    max-height: none;
  }

  .card-frame {
    min-height: 0;
    flex: 1;
  }
}
</style>
