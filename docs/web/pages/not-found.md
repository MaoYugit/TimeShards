# 404 未找到（Not Found）

## 路由与元信息

| 项 | 值 |
|----|-----|
| 路径 | `/:pathMatch(.*)*`（Vue Router 4 兜底） |
| `name` | `not-found` |
| 组件文件 | `timeshards-web/src/views/NotFoundView.vue` |
| `meta.title` | `404` |

## 当前实现状态

**占位页面**：空 `page-container`，无文案、无返回首页链接。

## 预期职责（规划）

- 友好提示「页面不存在」。
- 提供返回首页或上一页的按钮：`router.push('/')`、`router.back()`。
- 可选：记录错误路径用于分析（注意隐私）。

## SEO 与 HTTP 状态

- SPA 在静态托管上通常仍返回 **200**；若需真正 404 状态码，需在服务器 / CDN 层配置 `history` fallback 与自定义错误页。

## 相关文件

- `src/views/NotFoundView.vue`
- `src/router/index.ts`（兜底路由须放在路由表**最后**）
