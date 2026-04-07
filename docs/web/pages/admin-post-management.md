# 管理端 · 博客管理（占位）

## 路由与元信息

| 项 | 值 |
|----|-----|
| 路径 | `/post-management` |
| `name` | `post-management` |
| 组件文件 | `timeshards-web/src/views/admin/PostManagementView.vue` |
| `meta.title` | `博客管理` |

## 当前实现状态

**占位页面**：空 `page-container`。

前台博客数据当前来自 **构建时打包的 `src/data/blog/posts/*.md`**，无运行时 CRUD。

## 预期职责（规划）

- 列表：文章标题、状态、发布时间、操作（编辑/删除）。
- 编辑：Markdown 编辑器、frontmatter 字段表单、预览。
- 保存：调用后端 API 或 CI 触发；若仍静态部署，需生成 md 并提交仓库的流水线（视架构而定）。

## 与前台数据的关系

- 若改为 **CMS / 数据库**：前台 `blog.ts` 需改为 API 拉取或 SSG 构建时拉取。
- 若保持 **Git 托管 Markdown**：管理端可实现「提交到仓库」类高级功能（权限与审计要求高）。

## 相关文件

- `src/views/admin/PostManagementView.vue`
- `src/data/blog.ts`（当前数据源）
- `docs/web/pages/blog-list.md`、`blog-detail.md`（前台行为）
