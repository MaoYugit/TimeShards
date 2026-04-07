# TimeShards Web 端开发文档（总览）

对应代码目录：`timeshards-web/`。

## 1. 技术栈

| 类别 | 选型 |
|------|------|
| 框架 | Vue 3（Composition API + `<script setup>`） |
| 构建 | Vite |
| 路由 | Vue Router 4（`createWebHistory`） |
| 状态 | Pinia |
| Markdown | `marked`（简历正文、博客正文） |
| 动画 / 交互 | 原生 `requestAnimationFrame`、CSS；部分使用 `@vueuse/core`（如 Dock 鼠标位置） |
| 背景 | `three`（四面体碎片逻辑保留在组件内）、`@tsparticles/vue3` + `@tsparticles/slim`（2D 粒子连线） |

## 2. 入口与根布局

| 文件 | 职责 |
|------|------|
| `src/main.ts` | 创建应用；`app.use(pinia)`、`app.use(router)`；注册 `VueParticles` 与 `loadSlim`；`useThemeStore(pinia).initTheme()` |
| `src/App.vue` | 自上而下：`GlobalBackground` → 包裹 `router-view` 的 `.app-wrapper` → `TheDock`（底部导航） |
| `index.html` | 挂载点 `#app`、主题色 meta 等（见主题 Store） |

页面内容渲染在 `<router-view />` 中；**Dock 与背景为全局常驻**，不参与路由切换卸载（除非后续改为条件渲染）。

## 3. 目录结构（核心）

```
timeshards-web/src/
├── assets/           # 全局样式等（如 main.css）
├── components/
│   ├── Background/   # GlobalBackground.vue
│   └── Dock/         # TheDock.vue、DockItem.vue、icons/
├── composables/      # 如 useGuestbookBubblePhysics.ts
├── data/             # 作品集、博客 md、简历 md/pdf
├── router/index.ts   # 路由表与全局 beforeEach（document.title）
├── services/         # 如 chatWs.ts（环境变量占位）
├── stores/           # theme、siteAuth、guestbook、chatRoom
├── utils/            # renderMarkdown、frontmatter、headingSlug
└── views/
    ├── front/        # 前台业务页
    └── admin/        # 管理端占位
```

## 4. 路由一览

完整定义见 `src/router/index.ts`。摘要：

| 路径 | name | 组件 | meta.title |
|------|------|------|------------|
| `/` | home | HomeView | 首页 |
| `/portfolio` | portfolio | PortfolioView | 作品集 |
| `/blog` | blog-list | BlogView | 博客列表 |
| `/blog/:id` | blog-detail | BlogDetailView | 博客详情 |
| `/guestbook` | guestbook | GuestbookView | 留言板 |
| `/chat` | chat | ChatView | 聊天室 |
| `/resume` | resume | ResumeView | 简历 |
| `/login` | login | LoginView | 登录 |
| `/dashboard` | dashboard | DashboardView | 数据面板 |
| `/post-management` | post-management | PostManagementView | 博客管理 |
| 兜底 | not-found | NotFoundView | 404 |

**全局行为：**

- `scrollBehavior`：导航后滚动到顶部。
- `beforeEach`：`document.title = ${meta.title} | TimeShards`（博客详情页内会再次按文章标题覆盖）。

## 5. Pinia Store

| Store | 文件 | 用途 |
|-------|------|------|
| `useThemeStore` | `stores/theme.ts` | 主题偏好 `light` / `dark` / `system`，写入 `localStorage`，设置 `html[data-theme]` 与 `theme-color` meta |
| `useSiteAuthStore` | `stores/siteAuth.ts` | 站点访客身份（昵称 + 随机 userId），用于聊天室；键 `timeshards-site-user` |
| `useGuestbookStore` | `stores/guestbook.ts` | 留言列表，键 `timeshards-guestbook-v1`，最多 200 条 |
| `useChatRoomStore` | `stores/chatRoom.ts` | 聊天消息，键 `timeshards-chat-messages-v1`，最多 400 条；`avatarHueFromUserId` |

跨标签同步：留言板与聊天室在各自 Store 内通过 `storage` 事件 + 自定义 `Event` 触发 `reload()`；`siteAuth` 仅 `storage` 同步。

## 6. 环境变量

| 变量 | 说明 |
|------|------|
| `VITE_CHAT_WS_URL` | 可选。配置后可在后续版本对接 WebSocket；未配置时聊天仍为本地存储 + 多标签同步。类型声明见 `env.d.ts` |

## 7. 命令行

在 `timeshards-web/` 目录：

```bash
pnpm install
pnpm dev          # 开发
pnpm build        # 生产构建
pnpm lint         # ESLint
```

根目录 `README.md` 会汇总各子项目命令。

## 8. 专题文档

| 文档 | 内容 |
|------|------|
| [全局背景](./global-background.md) | Three.js / tsParticles、层级、性能与指针适配 |
| [Dock 栏](./dock.md) | 路由项、主题切换、指针与移动端行为、z-index |

## 9. 分页面文档（深度）

每个路由对应一份说明，含数据流、交互、样式与扩展点：

| 页面 | 文档 |
|------|------|
| 索引 | [pages/README.md](./pages/README.md) |
| 首页 | [pages/home.md](./pages/home.md) |
| 作品集 | [pages/portfolio.md](./pages/portfolio.md) |
| 博客列表 | [pages/blog-list.md](./pages/blog-list.md) |
| 博客详情 | [pages/blog-detail.md](./pages/blog-detail.md) |
| 留言板 | [pages/guestbook.md](./pages/guestbook.md) |
| 聊天室 | [pages/chat.md](./pages/chat.md) |
| 简历 | [pages/resume.md](./pages/resume.md) |
| 管理端登录 / 面板 / 博文管理 | [pages/admin-login.md](./pages/admin-login.md) 等 |
| 404 | [pages/not-found.md](./pages/not-found.md) |

## 10. 与小程序 / 后端的关系

- 当前 Web 端留言与聊天 **不依赖** 后端 API，数据在浏览器 `localStorage`。
- 日后对接时：可保留 Pinia 为缓存层，将 `add` / `send` 改为 API，并增加鉴权与冲突处理；专题文档可在 `docs/backend/` 补充协议说明。
