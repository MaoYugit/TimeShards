# Dock 底部导航（TheDock）

## 文件位置

- `timeshards-web/src/components/Dock/TheDock.vue`
- 子组件：`DockItem.vue`，图标：`components/Dock/icons/*.vue`

## 挂载与层级

- 在 `App.vue` 中全局渲染，`position: fixed`，`z-index: 5000`（高于普通页面内容，留言板 FAB / 模态等另有更高 z-index 设计）。
- `.dock-wrapper`：`pointer-events: none`，仅窄条居中占位；**可点击区域**为 `.dock-container`：`pointer-events: auto`。避免宽条挡住页面底部两侧的「我要留言」等按钮。

## 导航项配置

`computed` 返回 `DockAction[]`：

- **路由项**：`type: 'route'`，含 `to`、`label`、`icon`；博客使用 `match: (p) => p.startsWith('/blog')` 以覆盖列表与详情。
- **操作项**：`type: 'action'`，当前仅「主题切换」，`onClick: cycleTheme`。

主题循环顺序：**light → dark → system → light**（`cycleTheme` 内实现）。

## 激活态

`isActive(item)`：路由项用 `route.path` 与 `match` 或精确相等；操作项用可选 `isActive`（主题按钮当前恒为 false）。

## 鼠标与触摸（放大镜 / 跟随）

- 使用 `@vueuse/core` 的 `useMouse` 得到 `x, y`，再写入 `mouseX/mouseY` 传给 `DockItem`（用于图标随指针位置轻微位移或高亮，具体见 `DockItem.vue`）。
- **桌面**：默认 `useMouseSource = true`，用 vueuse 坐标。
- **触摸 / 笔**：`pointerdown` 时可能 `setPointerCapture`，`useMouseSource = false`，避免轻点后仍用陈旧坐标；滑动超过约 8px 才启用 `touchHoverActive` 并用手动坐标，减少误触 hover。
- 文档隐藏、窗口 `blur`、指针结束时 `resetMouse`，避免 Dock 状态卡住。

## 样式与主题

- `.dock-container` 使用玻璃拟态：`backdrop-filter`、圆角胶囊、`::before` 做底。
- `data-theme`：`light` / `dark` 两套 CSS 变量（`--dock-icon-accent` 等），与 `useThemeStore` 的 `isDark` 绑定。
- 图标组件接收 `isDark`、`preference`，用 `currentColor` 与变量着色，**无需两套 SVG 文件**。

## 与页面协作

- 页面底部 padding 常使用 `var(--dock-height)`（在 `main.css` 或各页 scoped 中定义），避免正文被 Dock 遮挡。
- 需要压在 Dock「之上」的控件（如留言 FAB）：设置更高 `z-index`（如 5500+），并依赖 `.dock-wrapper` 的 `pointer-events: none` 保证可点。

## 扩展新入口

1. 在 `icons/` 增加 SVG 组件（`fill`/`stroke` 用 `currentColor`）。
2. 在 `items` 数组中追加一项 `{ type: 'route', label, icon, to, match? }`。
3. 在 `router/index.ts` 注册对应路由。
