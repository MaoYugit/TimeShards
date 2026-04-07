<script setup lang="ts">
import { computed } from 'vue'
import resumeMd from '@/data/简历.md?raw'
import resumePdfUrl from '@/data/简历.pdf?url'
import { renderMarkdown } from '@/utils/renderMarkdown'

const resumeHtml = computed(() => {
  const src = resumeMd.replace(/\.\/maoyu\.jpg/g, '/maoyu.jpg')
  return renderMarkdown(src)
})
</script>

<template>
  <main class="resume page-container">
    <div class="inner">
      <header class="hero">
        <div class="hero-row">
          <div class="hero-text">
            <p class="kicker">Resume</p>
            <h1 class="title">简历</h1>
            <p class="lead">Markdown 源：<span class="mono">src/data/简历.md</span> · 头像：<span class="mono">public/maoyu.jpg</span></p>
          </div>
          <a
            class="btn-download"
            :href="resumePdfUrl"
            download="毛宇-简历.pdf"
            rel="noopener noreferrer"
          >
            <span class="btn-icon" aria-hidden="true">↓</span>
            下载 PDF
          </a>
        </div>
      </header>

      <article class="card resume-body" aria-label="简历正文">
        <div class="resume-md" v-html="resumeHtml" />
      </article>
    </div>
  </main>
</template>

<style scoped>
.page-container {
  width: 100%;
  max-width: min(820px, 100%);
  margin: 0 auto;
  min-height: 100vh;
  min-height: 100dvh;
  padding: clamp(16px, 3vw, 28px);
  padding-bottom: calc(clamp(16px, 3vw, 28px) + var(--dock-height) + env(safe-area-inset-bottom, 0px));
  box-sizing: border-box;
}

.inner {
  display: flex;
  flex-direction: column;
  gap: clamp(14px, 2vw, 22px);
}

.hero-row {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.hero-text {
  min-width: 0;
  flex: 1;
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
  font-size: 13px;
  line-height: 1.6;
  color: color-mix(in srgb, var(--text-primary) 38%, var(--text-secondary));
}

.mono {
  font-family: var(--font-code);
  font-size: 11.5px;
  padding: 0.1em 0.35em;
  border-radius: 6px;
  background: color-mix(in srgb, var(--glass-bg) 62%, transparent);
  word-break: break-all;
}

.btn-download {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  align-self: flex-start;
  padding: 10px 20px;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, #00f3ff 42%, var(--glass-border));
  background: color-mix(in srgb, var(--glass-bg) 78%, transparent);
  color: var(--text-primary);
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  backdrop-filter: blur(calc(var(--glass-blur) + 4px));
  -webkit-backdrop-filter: blur(calc(var(--glass-blur) + 4px));
  box-shadow: var(--card-shadow);
  transition: var(--transition-smooth);
}

.btn-download:hover {
  border-color: color-mix(in srgb, #00f3ff 70%, transparent);
  color: #00f3ff;
}

.btn-icon {
  font-size: 15px;
  line-height: 1;
  opacity: 0.9;
}

.card {
  position: relative;
  padding: clamp(20px, 3.2vw, 32px);
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
    480px circle at 12% 0%,
    color-mix(in srgb, var(--accent-color) 11%, transparent),
    transparent 58%
  );
  pointer-events: none;
  opacity: 0.88;
}

.resume-body {
  position: relative;
  z-index: 1;
}

.resume-md {
  font-size: 14px;
  line-height: 1.68;
  color: color-mix(in srgb, var(--text-primary) 92%, var(--text-secondary));
  max-width: 52rem;
}

.resume-md :deep(h1),
.resume-md :deep(h2),
.resume-md :deep(h3) {
  margin: 1.35em 0 0.55em;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
  clear: both;
}

.resume-md :deep(h3) {
  font-size: 1.14rem;
  padding-bottom: 0.35em;
  border-bottom: 1px solid color-mix(in srgb, var(--glass-border) 75%, transparent);
}

.resume-md :deep(h1:first-child),
.resume-md :deep(h2:first-child),
.resume-md :deep(h3:first-child) {
  margin-top: 0;
}

.resume-md :deep(h4) {
  margin: 1.15em 0 0.5em;
  font-size: 1.03rem;
  font-weight: 650;
  color: var(--text-primary);
}

.resume-md :deep(p) {
  margin: 0.5em 0;
}

.resume-md :deep(ul),
.resume-md :deep(ol) {
  margin: 0.5em 0;
  padding-left: 1.35em;
}

.resume-md :deep(li) {
  margin: 0.32em 0;
}

.resume-md :deep(li::marker) {
  color: color-mix(in srgb, #00f3ff 55%, var(--text-secondary));
}

.resume-md :deep(blockquote) {
  margin: 0.75em 0;
  padding: 0.5em 0 0.5em 1em;
  border-left: 3px solid color-mix(in srgb, #00f3ff 45%, var(--glass-border));
  color: color-mix(in srgb, var(--text-primary) 88%, var(--text-secondary));
  background: color-mix(in srgb, var(--glass-bg) 35%, transparent);
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
}

.resume-md :deep(hr) {
  margin: 1.25em 0;
  border: none;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    color-mix(in srgb, var(--glass-border) 90%, transparent),
    transparent
  );
}

.resume-md :deep(table) {
  width: 100%;
  margin: 0.85em 0;
  border-collapse: collapse;
  font-size: 13px;
}

.resume-md :deep(th),
.resume-md :deep(td) {
  border: 1px solid color-mix(in srgb, var(--glass-border) 85%, transparent);
  padding: 8px 10px;
  text-align: left;
  vertical-align: top;
}

.resume-md :deep(th) {
  background: color-mix(in srgb, var(--glass-bg) 55%, transparent);
  font-weight: 600;
  color: var(--text-primary);
}

.resume-md :deep(tr:nth-child(even) td) {
  background: color-mix(in srgb, var(--glass-bg) 22%, transparent);
}

.resume-md :deep(code) {
  font-family: var(--font-code);
  font-size: 0.88em;
  padding: 0.12em 0.4em;
  border-radius: 6px;
  background: color-mix(in srgb, var(--glass-bg) 70%, transparent);
  border: 1px solid color-mix(in srgb, var(--glass-border) 65%, transparent);
}

.resume-md :deep(pre) {
  margin: 0.85em 0;
  padding: 14px 16px;
  border-radius: var(--radius-md);
  overflow-x: auto;
  background: color-mix(in srgb, var(--glass-bg) 72%, transparent);
  border: 1px solid color-mix(in srgb, var(--glass-border) 80%, transparent);
  -webkit-overflow-scrolling: touch;
}

.resume-md :deep(pre code) {
  padding: 0;
  border: none;
  background: none;
  font-size: 12.5px;
  line-height: 1.55;
}

.resume-md :deep(a) {
  color: color-mix(in srgb, #00f3ff 88%, var(--accent-color));
  text-decoration: none;
  word-break: break-word;
}

.resume-md :deep(a:hover) {
  text-decoration: underline;
}

.resume-md :deep(strong) {
  font-weight: 650;
  color: var(--text-primary);
}

.resume-md :deep(.resume-photo-float) {
  float: right;
  width: 120px;
  height: 135px;
  object-fit: cover;
  border-radius: 10px;
  margin: 2px 0 14px 16px;
  border: 1px solid color-mix(in srgb, var(--glass-border) 88%, transparent);
  box-shadow: 0 6px 20px color-mix(in srgb, #000 14%, transparent);
}

@media (max-width: 520px) {
  .resume-md :deep(.resume-photo-float) {
    float: none;
    display: block;
    margin: 0 auto 16px;
  }
}
</style>
