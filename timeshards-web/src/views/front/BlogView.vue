<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  blogCategories,
  blogPosts,
  excerptFromMarkdown,
  postMatchesQuery,
  type BlogCategory,
} from '@/data/blog'

const router = useRouter()
const activeCategory = ref<'全部' | BlogCategory>('全部')
const searchQuery = ref('')

const filteredPosts = computed(() => {
  const byCat =
    activeCategory.value === '全部' ? blogPosts : blogPosts.filter((p) => p.category === activeCategory.value)
  return byCat.filter((p) => postMatchesQuery(p, searchQuery.value))
})

function formatDate(input: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(input))
}

function goDetail(id: string) {
  router.push({ name: 'blog-detail', params: { id } })
}
</script>

<template>
  <main class="blog page-container">
    <div class="inner">
      <header class="hero">
        <p class="kicker">Blog</p>
        <h1 class="title">博客</h1>
        <p class="lead">顶部分类切换、下方文章列表；支持按标题、标签、正文关键词搜索。</p>
      </header>

      <div class="search-row card">
        <label class="search-label" for="blog-search">搜索</label>
        <input
          id="blog-search"
          v-model="searchQuery"
          class="search-input"
          type="search"
          placeholder="标题 / 标签 / 正文…"
          autocomplete="off"
          enterkeyhint="search"
        />
      </div>

      <nav class="category-nav card" aria-label="文章分类">
        <button
          v-for="c in blogCategories"
          :key="c"
          type="button"
          class="cat-item"
          :class="{ active: c === activeCategory }"
          @click="activeCategory = c"
        >
          {{ c }}
        </button>
      </nav>

      <section class="list" aria-label="文章列表">
        <article
          v-for="p in filteredPosts"
          :key="p.id"
          class="post card"
          role="button"
          tabindex="0"
          @click="goDetail(p.id)"
          @keydown.enter.prevent="goDetail(p.id)"
        >
          <h2 class="post-title">{{ p.title }}</h2>
          <p class="post-excerpt">{{ excerptFromMarkdown(p.content, 132) }}</p>

          <div class="meta-row">
            <span class="chip category">{{ p.category }}</span>
            <span class="meta">发布：{{ formatDate(p.publishedAt) }}</span>
            <span class="meta">更新：{{ formatDate(p.updatedAt) }}</span>
          </div>
          <div class="tags">
            <span v-for="t in p.tags" :key="`${p.id}-${t}`" class="chip tag"># {{ t }}</span>
          </div>
        </article>

        <p v-if="!filteredPosts.length" class="empty">
          {{ searchQuery.trim() ? '没有匹配的文章，试试其它关键词。' : '该分类下暂无文章。' }}
        </p>
      </section>
    </div>
  </main>
</template>

<style scoped>
.page-container {
  width: 100%;
  max-width: 860px;
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
  gap: 14px;
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
  color: color-mix(in srgb, var(--text-primary) 35%, var(--text-secondary));
}

.search-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  flex-wrap: wrap;
}

.search-label {
  font-size: 13px;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  min-width: 0;
  font: inherit;
  font-size: 14px;
  padding: 10px 14px;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--glass-border) 88%, transparent);
  background: color-mix(in srgb, var(--glass-bg) 60%, transparent);
  color: var(--text-primary);
}

.search-input:focus {
  outline: none;
  border-color: color-mix(in srgb, #00f3ff 45%, var(--glass-border));
  box-shadow: 0 0 0 1px color-mix(in srgb, #00f3ff 12%, transparent);
}

.card {
  position: relative;
  border-radius: var(--radius-lg);
  border: 1px solid var(--glass-border);
  background: color-mix(in srgb, var(--glass-bg) 84%, transparent);
  box-shadow: var(--card-shadow);
  backdrop-filter: blur(calc(var(--glass-blur) + 4px));
  -webkit-backdrop-filter: blur(calc(var(--glass-blur) + 4px));
}

.category-nav {
  position: sticky;
  top: 12px;
  z-index: 5;
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 10px;
  -webkit-overflow-scrolling: touch;
}

.cat-item {
  flex: 0 0 auto;
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--glass-border) 85%, transparent);
  background: color-mix(in srgb, var(--glass-bg) 65%, transparent);
  color: var(--text-secondary);
  font: inherit;
  font-size: 13px;
  cursor: pointer;
}

.cat-item.active {
  color: #00f3ff;
  border-color: color-mix(in srgb, #00f3ff 65%, transparent);
}

.list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.post {
  padding: 16px 18px;
  cursor: pointer;
  transition: var(--transition-smooth);
}

.post:hover {
  border-color: color-mix(in srgb, #00f3ff 35%, var(--glass-border));
}

.post-title {
  margin: 0;
  font-size: clamp(17px, 2.2vw, 20px);
  color: var(--text-primary);
}

.post-excerpt {
  margin: 9px 0 0;
  font-size: 14px;
  line-height: 1.62;
  color: color-mix(in srgb, var(--text-primary) 86%, var(--text-secondary));
}

.meta-row {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
  align-items: center;
}

.meta {
  font-family: var(--font-code);
  font-size: 11px;
  color: var(--text-secondary);
}

.chip {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 11px;
}

.chip.category {
  color: #00f3ff;
  border: 1px solid color-mix(in srgb, #00f3ff 52%, transparent);
}

.tags {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip.tag {
  color: color-mix(in srgb, var(--text-primary) 88%, var(--text-secondary));
  border: 1px solid color-mix(in srgb, var(--glass-border) 85%, transparent);
}

.empty {
  margin: 6px 0 0;
  color: var(--text-secondary);
  font-size: 14px;
}
</style>
