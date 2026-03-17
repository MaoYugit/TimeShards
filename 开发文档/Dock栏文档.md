## Dock 栏（`timeshards-web`）

---

### 文件结构

- `timeshards-web/src/components/Dock/TheDock.vue`
- `timeshards-web/src/components/Dock/DockItem.vue`
- `timeshards-web/src/components/Dock/icons/`
  - `IconHome.vue`（首页）
  - `IconPortfolio.vue`（作品集）
  - `IconBlog.vue`（博客页）
  - `IconGuestbook.vue`（留言板）
  - `IconChat.vue`（对话页）
  - `IconResume.vue`（简历页）
  - `IconTheme.vue`（主题切换）

---

### 如何挂载

Dock 在 `timeshards-web/src/App.vue` 里全局挂载：

- `GlobalBackground` 负责背景
- `router-view` 渲染页面
- `TheDock` 固定在底部居中

---

### 图标

- **图标只维护一套 SVG**：所有 icon 都用 `fill="currentColor"` / `stroke="currentColor"`
- **主题差异用 CSS 变量控制**：
  - 日间：accent 偏蓝（`--dock-icon-accent`）
  - 夜间：accent 偏霓虹青（`--dock-icon-accent`）

这样可以做到：

- 不需要准备两套 svg 文件
- 主题切换瞬间生效
- 未来再加图标也不需要复制两份

当前实现里，“两套按钮”的差异通过 `TheDock.vue` 的 `.dock-container[data-theme='light'|'dark']` 变量完成。

---

### 路由按钮与 active 判定

Dock 按钮对应路由：

- 首页：`/`
- 作品集：`/portfolio`
- 博客页：`/blog`（同时匹配 `/blog/:id`）
- 留言板：`/guestbook`
- 对话页：`/chat`
- 简历页：`/resume`

active 逻辑：

- 普通路由：`route.path === item.to`
- 博客：`route.path.startsWith('/blog')`

---

### 主题切换逻辑

项目样式体系已经支持：

- `html[data-theme="dark"]` 进入深色模式（见 `timeshards-web/src/assets/main.css`）

Dock 的“主题切换”按钮做了这些事：

- 点击切换 `document.documentElement` 的 `data-theme`
- 保存到 `localStorage['timeshards-theme']`
- 首次进入优先读取 localStorage；没有则读取 DOM/系统偏好

---

### 响应式适配策略

Dock 的布局在不同尺寸下会做压缩：

- Dock 外框 **宽度会“贴合内容”**（`fit-content`），不会像全宽容器那样显得很长
- 图标 hover 放大会 **溢出外框**（外框 `overflow: visible`），但外框本身宽度不随 hover 变化
- `<= 560px`：减少 gap 与 padding
- `<= 420px`：隐藏 tooltip（避免遮挡/抖动）

后续想在手机上进一步提升体验（比如“横向可滚动”或“折叠更多按钮”），可以在 `TheDock.vue` 的 `.dock-container` 增加：

- `overflow-x: auto;`
- `scroll-snap-type: x mandatory;`

---


