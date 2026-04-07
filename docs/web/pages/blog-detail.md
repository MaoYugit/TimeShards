# 博客详情（Blog Detail）

## 路由与元信息

| 项 | 值 |
|----|-----|
| 路径 | `/blog/:id` |
| `name` | `blog-detail` |
| `meta.title` | `博客详情`（**会被组件内覆盖**，见下） |
| 组件文件 | `timeshards-web/src/views/front/BlogDetailView.vue` |

## 产品定位

展示单篇 Markdown 正文与元数据（标题、分类、发布时间、更新时间、标签）；支持返回列表；文章不存在时显示占位与返回按钮。

## 数据解析

- `const post = computed(() => getBlogPostById(String(route.params.id ?? '')))`。
- `src/data/blog.ts` 中 `getBlogPostById` 在 `blogPosts` 数组中查找；**`id` 必须与文件名**（不含 `.md`）一致。

## Markdown 渲染

| 文件 | 说明 |
|------|------|
| `src/utils/renderMarkdown.ts` | `renderBlogMarkdown(source)` |

行为要点：

- 使用独立 `Marked` 实例，`gfm: true`，`breaks: false`（单换行不自动变 `<br>`）。
- 每次渲染前重置 `blogHeadingSlugger`，为 **h2 / h3** 生成唯一 `id`（slug），便于将来锚点或站外链接；**当前前台未展示目录 TOC**。
- `patchExternalLinks`：为 `http(s)` 链接添加 `target="_blank"`、`rel="noopener noreferrer"`。
- 渲染结果通过 `v-html` 注入，**正文需来自可信 Markdown（仓库内文件）**。

## 文档标题（document.title）

`watch(() => post.value?.title, ...)`：

- 有标题：`${title} | TimeShards`。
- 无文章（或标题空）：`博客 | TimeShards`。

全局路由 `beforeEach` 仍会先执行，但进入详情后会被上述 `watch` 覆盖。

## 模板结构

- 有 `post`：`.detail.card` — 返回按钮、标题、meta 行、标签、`section.markdown` + `v-html`。
- 无 `post`：`.empty.card` — 提示 + 返回列表。

## 样式

- `.markdown` 下对 `h1`–`h4`、`p`、`pre`、`code`、`a`、`blockquote` 等做 scoped 深度选择（`:deep(...)`，以实际文件为准），保证与全局主题一致。

## 安全说明

- `v-html` 仅用于构建时打包的 Markdown；若未来改为用户上传或 HTML 直出，必须增加消毒（DOMPurify 等）。

## 扩展建议

- 上一篇 / 下一篇：在 `blogPosts` 中按发布时间找相邻项。
- 阅读进度条：监听 `scroll` 与文章高度。
- 与后台联动：详情数据改为 API，`id` 与 slug 策略需与后端一致。

## 相关文件

- `src/views/front/BlogDetailView.vue`
- `src/data/blog.ts`
- `src/utils/renderMarkdown.ts`
- `src/utils/headingSlug.ts`
