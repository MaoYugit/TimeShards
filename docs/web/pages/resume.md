# 简历（Resume）

## 路由与元信息

| 项 | 值 |
|----|-----|
| 路径 | `/resume` |
| `name` | `resume` |
| 组件文件 | `timeshards-web/src/views/front/ResumeView.vue` |
| `meta.title` | `简历` |

## 产品定位

从仓库内 **Markdown 源文件** 渲染 HTML 展示；提供 **PDF 下载** 按钮；样式与全站玻璃拟态一致，并对 Markdown 各元素做阅读优化。

## 资源文件

| 资源 | 路径 | 说明 |
|------|------|------|
| Markdown | `src/data/简历.md` | `import ... from '@/data/简历.md?raw'` |
| PDF | `src/data/简历.pdf` | `import resumePdfUrl from '@/data/简历.pdf?url'` → 用于 `<a :href="download>` |
| 头像（示例） | `public/maoyu.jpg` | 文中图片路径在组件内将 `./maoyu.jpg` 替换为 `/maoyu.jpg` |

Vite：`?raw` 得到字符串；`?url` 得到构建后资源 URL。

## Markdown 渲染

| 工具 | `src/utils/renderMarkdown.ts` |
|------|------------------------------|
| 函数 | `renderMarkdown(source)` |
| 引擎 | `marked`，`gfm: true`，`breaks: false` |
| 后处理 | `patchExternalLinks`：外链新窗口打开 |

与博客共用不同实例：简历使用默认 `Marked`，无 h2/h3 自定义 slug 逻辑。

## 组件逻辑

```ts
const resumeHtml = computed(() => {
  const src = resumeMd.replace(/\.\/maoyu\.jpg/g, '/maoyu.jpg')
  return renderMarkdown(src)
})
```

模板中 `<div class="resume-md" v-html="resumeHtml" />`。

## 下载按钮

- `<a class="btn-download" :href="resumePdfUrl" download="毛宇-简历.pdf" ...>`  
- 文件名可按需修改 `download` 属性。

## 样式要点

- `.resume-body` / `.resume-md`：标题层级、`pre`/`code`、`table`、`blockquote`、列表等（见组件 scoped + `:deep`）。
- 头像类名（如 `.resume-photo-float`）与 Markdown 内 `class` 对应时需与 `简历.md` 同步。

## 安全

- 与博客详情相同：`v-html` 仅适用于可信本地 md；若改为在线编辑，需消毒。

## 扩展建议

- 多语言简历：路由 `/resume/:locale` 或独立 md 文件 + `computed` 选择。
- 打印样式：`@media print` 单独优化。

## 相关文件

- `src/views/front/ResumeView.vue`
- `src/data/简历.md`
- `src/data/简历.pdf`
- `public/maoyu.jpg`（若使用）
- `src/utils/renderMarkdown.ts`
