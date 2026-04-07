# 管理端 · 数据面板（占位）

## 路由与元信息

| 项 | 值 |
|----|-----|
| 路径 | `/dashboard` |
| `name` | `dashboard` |
| 组件文件 | `timeshards-web/src/views/admin/DashboardView.vue` |
| `meta.title` | `数据面板` |

## 当前实现状态

**占位页面**：空 `page-container`，无鉴权、无数据展示。

## 预期职责（规划）

- 登录后可见的概览：访问量、文章数、留言统计等（依赖后端）。
- 快捷入口到「博客管理」等子模块。

## 实现时需补充

- `meta.requiresAuth`（或 `requiresAdmin`）+ 全局 `beforeEach` 跳转 `/login`。
- 布局：可选择 **管理端独立布局**（不显示前台 Dock），在 `App.vue` 或嵌套路由中切换。

## 相关文件

- `src/views/admin/DashboardView.vue`
- `src/router/index.ts`
