# 博客列表（Blog List）

## 路由与元信息

| 项 | 值 |
|----|-----|
| 路径 | `/blog` |
| `name` | `blog-list` |
| 组件文件 | `timeshards-web/src/views/front/BlogView.vue` |
| `meta.title` | `博客列表` |

## 产品定位

「掘金风格」的 **顶部分类 + 文章流列表**：从 `src/data/blog/posts/*.md` 构建文章元数据；支持按分类筛选与关键词搜索；点击进入详情页。

## 数据层

| 文件 | 说明 |
|------|------|
| `src/data/blog.ts` | `import.meta.glob('./blog/posts/*.md', { eager: true, query: '?raw' })` 聚合为 `blogPosts` |
| `src/data/blog/posts/*.md` | 单篇 Markdown；frontmatter + 正文 |
| `src/utils/frontmatter.ts` | `splitFrontmatter`、`parseTagsField` |

**Frontmatter 约定（键名）：** `title`、`publishedAt`、`updatedAt`、`category`、`tags`（支持 `[a, b]` 或逗号分隔字符串，见 `parseTagsField`）。

**分类类型 `BlogCategory`：** `'前端' | '工程化' | 'AI 开发' | '随笔'`。非法或缺失时解析为 `'随笔'`（`parseCategory`）。

**文章 `id`：** 文件名去掉 `.md`（正则 `posts/([^/]+)\.md$`），故 `welcome-to-timeshards.md` → `id = welcome-to-timeshards`。

**排序：** `buildPosts()` 按 `publishedAt` **降序**（新在前）。

**导出：**

- `blogPosts`：全部文章。
- `blogCategories`：`['全部', ...唯一分类]`。
- `excerptFromMarkdown(md, max)`：去代码块、链接、标记符号后截断摘要。
- `postMatchesQuery(post, q)`：在标题、分类、标签、正文摘要中子串匹配（正文通过 `excerptFromMarkdown` 长文本匹配关键词）。

## 组件状态

- `activeCategory`：`全部` 或某一 `BlogCategory`。
- `searchQuery`：与 `postMatchesQuery` 结合。

**过滤管道：** 先按分类，再按搜索。

## 导航

- `goDetail(id)`：`router.push({ name: 'blog-detail', params: { id } })`。

## 模板结构

- `<main class="blog page-container">`。
- `.search-row`：`type="search"`，`enterkeyhint="search"`。
- `.category-nav`：横向按钮列表，`aria-label="文章分类"`。
- `.list`：每篇 `article.post`，`role="button"` + `tabindex="0"`，支持 Enter 键；`@click` 进入详情。

## 样式与主题

- 使用全局 CSS 变量（玻璃卡片、`--text-primary` 等），随 `data-theme` 切换。
- 响应式：小屏分类区可横向滚动或换行（以实际样式为准）。

## 无障碍

- 搜索框有 `<label for>`。
- 空列表提示区分「无搜索结果」与「分类下无文章」。

## 扩展建议

- 分页或虚拟列表：文章量增大时避免一次渲染过多 DOM。
- RSS / Sitemap：可在构建脚本中扫描 `blogPosts` 生成静态文件。

## 相关文件

- `src/views/front/BlogView.vue`
- `src/data/blog.ts`
- `src/data/blog/posts/*.md`
- `src/utils/frontmatter.ts`
