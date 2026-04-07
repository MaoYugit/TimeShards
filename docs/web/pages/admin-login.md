# 管理端 · 登录（占位）

## 路由与元信息

| 项 | 值 |
|----|-----|
| 路径 | `/login` |
| `name` | `login` |
| 组件文件 | `timeshards-web/src/views/admin/LoginView.vue` |
| `meta.title` | `登录` |

## 当前实现状态

**占位页面**：模板仅为 `<div class="page-container"></div>`，无表单、无路由守卫、无与后端对接。

## 预期职责（规划）

- 管理员账号密码或 OAuth 登录。
- 登录成功后写入会话（Cookie / localStorage / memory），并跳转 `/dashboard` 或 `redirect` 查询参数目标。
- 与 `useSiteAuthStore`（访客身份）**隔离**，避免混用。

## 实现时需补充

| 项 | 说明 |
|----|------|
| 路由元字段 | 如 `meta: { requiresGuest: true }` 已登录管理员访问登录页时重定向 |
| 全局守卫 | `router.beforeEach` 校验管理端路由 |
| API | 与 Java 后端约定登录接口与 Token 刷新 |
| UI | 表单、错误提示、加载态、无障碍 |

## 相关文件

- `src/views/admin/LoginView.vue`
- `src/router/index.ts`（注册路由；后续在此扩展 `meta` 与守卫）
