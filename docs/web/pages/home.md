# 首页（Home）

## 路由与元信息

| 项 | 值 |
|----|-----|
| 路径 | `/` |
| `name` | `home` |
| 组件文件 | `timeshards-web/src/views/front/HomeView.vue` |
| `meta.title` | `首页`（经 `router.beforeEach` 拼为 `首页 \| TimeShards`） |

## 产品定位

站点落地页：品牌标题、简短欢迎文案、**实时时钟**、**月历**、以及 **GitHub Contribution Snake** 装饰图，整体风格与全站玻璃拟态一致。

## 依赖关系

- **无 Pinia**：主题通过 DOM 读取，不直接调用 `useThemeStore`（便于首页独立反映当前 `html[data-theme]` 与系统偏好）。
- **无路由子依赖**。

## 脚本逻辑（概要）

### 主题与蛇图

- 常量 `THEME_ATTR = 'data-theme'`。
- `isDark`：`document.documentElement.getAttribute('data-theme') === 'dark'`。
- `onMounted`：
  - `MutationObserver` 监听 `html` 的 `data-theme` 变化，同步 `isDark`。
  - `matchMedia('(prefers-color-scheme: dark)')`：当用户**从未**设置 `data-theme` 时，随系统深浅色变化（与 `theme` store 的「system」策略一致）。
- `snakeSrc`：暗色用 `...-dark.svg`，否则用亮色 URL（远程 `raw.githubusercontent.com`）。

### 时间

- `now`：`ref(new Date())`，`setInterval` 每秒更新（需在 `onBeforeUnmount` 清除）。
- `timeText` / `dateText`：`Intl.DateTimeFormat('zh-CN', ...)`。

### 模拟时钟

- `analogAngles`：由时、分、秒计算角度；注释说明 SVG 指针默认朝上，**不再减 90°**。

### 月历

- `calendarCells`：6 行 × 7 列，共 42 格；**周一为一周第一天**（将 JS `getDay()` 从周日=0 转为周一=0）。
- `isToday`：与当前本地日期比较。
- 非本月日期：`day` 为 `null`，样式类 `is-empty`。

## 模板结构

- `<main class="home page-container">`。
- `.top-grid`：宽屏两列（左：标题 + 欢迎卡片；右：时间卡片 + 日历）；窄屏由 CSS 媒体查询折叠。
- 蛇图区域 `.snake-wrap`：`<img :src="snakeSrc" loading="lazy">`。

## 样式要点

- `page-container`：`min-height: 100vh` + 底部为 Dock 预留 `padding-bottom: calc(... + var(--dock-height))`。
- 卡片使用 `var(--glass-bg)`、`backdrop-filter`、`var(--radius-lg)` 等与全站一致。

## 无障碍

- 主要区块带 `aria-label`；时钟/日历有语义化标签。
- 蛇图为装饰图，提供 `alt`。

## 扩展建议

- 将 GitHub 用户名/仓库改为可配置（环境变量或 `src/data` 配置）。
- 若需与 `useThemeStore` 强一致，可改为 `storeToRefs` 订阅，减少 DOM 观测；当前实现适合「任意方式修改 `data-theme`」的调试场景。

## 相关文件

- `src/views/front/HomeView.vue`（唯一实现文件）
