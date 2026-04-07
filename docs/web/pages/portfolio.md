# 作品集（Portfolio）

## 路由与元信息

| 项 | 值 |
|----|-----|
| 路径 | `/portfolio` |
| `name` | `portfolio` |
| 组件文件 | `timeshards-web/src/views/front/PortfolioView.vue` |
| `meta.title` | `作品集` |

## 产品定位

以 **立体书 / 翻页** 隐喻展示多个项目：数据源为 `src/data/portfolio.ts` 中的 `portfolioProjects` 数组；支持目录跨页与每个项目独立跨页，含封面、简介、标签、外链与可选截图。

## 数据源

| 文件 | 说明 |
|------|------|
| `src/data/portfolio.ts` | 导出 `PortfolioProject` 类型与 `portfolioProjects` 常量 |

**类型字段（节选）：** `id`、`title`、`period`、`summary`、`tags`、`links[]`、`image?`（`public/` 下 URL）、`showcaseNote?`。

增删改项目：仅编辑该 TS 文件即可，无需改路由。

## 核心交互状态

- `isOpen`：是否从「封面卡片」进入书本展开态。
- `spreadIndex`：`0` 表示目录跨页；`1..n` 对应第 `n` 个项目。
- `prefersPageClick`：通过 `matchMedia`（如 `min-width`）区分桌面「点击左右翻页」与窄屏手势模式（具体断点以组件内为准）。

## 封面卡片（闭合态）

- 3D 倾斜：常量 `MINI_BASE`（`perspective`、`rotateX/Y/Z`）叠加指针驱动的 `tilt`。
- `pointer` 事件：`pointerdown` / `move` / `up` / `leave` / `cancel`；短按无移动则 `openCard()`，否则复位倾斜。
- 使用 `setPointerCapture` 兼容触摸拖拽。

## 展开态（翻页）

- 左右页内容来自 `currentProject` 与目录逻辑（具体 DOM 结构见模板）。
- `scrollPortfolioTop`：翻页或打开时滚动容器回顶。

## 样式与性能

- 大量 `transform`、`transition`；注意移动端 `touch-action` 与 `will-change`（以组件为准）。
- 图片使用 `public` 路径时无需 Vite import。

## 无障碍

- 翻页控件与按钮应保证可聚焦；若后续增强，请为图标按钮补 `aria-label`。

## 扩展建议

- CMS 或后端下发 JSON：可将 `portfolioProjects` 改为异步请求 + loading 状态。
- 项目详情页：可增加 `path: '/portfolio/:id'` 与独立 `PortfolioDetailView`（当前未实现）。

## 相关文件

- `src/views/front/PortfolioView.vue`
- `src/data/portfolio.ts`
