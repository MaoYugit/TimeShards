<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getBlogPostById } from '@/data/blog'
import { renderBlogMarkdown } from '@/utils/renderMarkdown'

const route = useRoute()
const router = useRouter()

const post = computed(() => getBlogPostById(String(route.params.id ?? '')))
const html = computed(() => (post.value ? renderBlogMarkdown(post.value.content) : ''))

const baseTitle = 'TimeShards'

watch(
  () => post.value?.title,
  (t) => {
    document.title = t ? `${t} | ${baseTitle}` : `博客 | ${baseTitle}`
  },
  { immediate: true },
)

function formatDate(input: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(input))
}
</script>

<template>
  <main class="page-container">
    <article v-if="post" class="detail card">
      <button type="button" class="btn-back" @click="router.push({ name: 'blog-list' })">← 返回列表</button>

      <header class="head">
        <h1 class="title">{{ post.title }}</h1>
        <div class="meta">
          <span class="chip">{{ post.category }}</span>
          <span>发布：{{ formatDate(post.publishedAt) }}</span>
          <span>更新：{{ formatDate(post.updatedAt) }}</span>
        </div>
        <div class="tags">
          <span v-for="t in post.tags" :key="t" class="tag"># {{ t }}</span>
        </div>
      </header>

      <section class="markdown" v-html="html" />
    </article>

    <section v-else class="empty card">
      <p>文章不存在或已被移除。</p>
      <button type="button" class="btn-back" @click="router.push({ name: 'blog-list' })">返回博客列表</button>
    </section>
  </main>
</template>

<style scoped>
.page-container {
  width: 100%;
  max-width: 1080px;
  margin: 0 auto;
  min-height: 100vh;
  min-height: 100dvh;
  padding: clamp(16px, 3vw, 28px);
  padding-bottom: calc(clamp(16px, 3vw, 28px) + var(--dock-height) + env(safe-area-inset-bottom, 0px));
  box-sizing: border-box;
}

.card {
  border-radius: var(--radius-lg);
  border: 1px solid var(--glass-border);
  background: color-mix(in srgb, var(--glass-bg) 84%, transparent);
  box-shadow: var(--card-shadow);
  backdrop-filter: blur(calc(var(--glass-blur) + 4px));
  -webkit-backdrop-filter: blur(calc(var(--glass-blur) + 4px));
}

.detail {
  padding: clamp(18px, 3vw, 30px);
}

.btn-back {
  border: 1px solid color-mix(in srgb, var(--glass-border) 88%, transparent);
  background: color-mix(in srgb, var(--glass-bg) 62%, transparent);
  color: var(--text-secondary);
  border-radius: 999px;
  padding: 8px 14px;
  font: inherit;
  font-size: 13px;
  cursor: pointer;
}

.head {
  margin-top: 14px;
}

.title {
  margin: 0;
  font-size: clamp(26px, 4.2vw, 38px);
  line-height: 1.25;
  color: var(--text-primary);
}

.meta {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
  color: var(--text-secondary);
  font-size: 12px;
  font-family: var(--font-code);
}

.chip {
  color: #00f3ff;
  border: 1px solid color-mix(in srgb, #00f3ff 55%, transparent);
  border-radius: 999px;
  padding: 4px 10px;
  font-family: var(--font-main);
}

.tags {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 11px;
  border: 1px solid color-mix(in srgb, var(--glass-border) 85%, transparent);
  color: color-mix(in srgb, var(--text-primary) 88%, var(--text-secondary));
}

.markdown {
  margin-top: 20px;
  color: color-mix(in srgb, var(--text-primary) 92%, var(--text-secondary));
  line-height: 1.75;
  font-size: 15px;
  min-width: 0;
}

.markdown :deep(h1),
.markdown :deep(h2),
.markdown :deep(h3) {
  margin: 1.2em 0 0.45em;
  color: var(--text-primary);
}

.markdown :deep(h2[id]),
.markdown :deep(h3[id]) {
  scroll-margin-top: 1rem;
}

.markdown :deep(p) {
  margin: 0.55em 0;
}

.markdown :deep(ul),
.markdown :deep(ol) {
  margin: 0.5em 0;
  padding-left: 1.35em;
}

.markdown :deep(code) {
  font-family: var(--font-code);
  font-size: 0.9em;
  padding: 0.12em 0.4em;
  border-radius: 6px;
  background: color-mix(in srgb, var(--glass-bg) 72%, transparent);
}

.markdown :deep(pre) {
  margin: 0.8em 0;
  padding: 14px;
  border-radius: var(--radius-md);
  overflow-x: auto;
  background: color-mix(in srgb, var(--glass-bg) 76%, transparent);
  border: 1px solid color-mix(in srgb, var(--glass-border) 82%, transparent);
}

.markdown :deep(pre code) {
  background: none;
  padding: 0;
}

.markdown :deep(a) {
  color: color-mix(in srgb, #00f3ff 88%, var(--accent-color));
}

.empty {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  color: var(--text-secondary);
}
</style>
