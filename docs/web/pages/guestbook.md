# 留言板（Guestbook）

## 路由与元信息

| 项 | 值 |
|----|-----|
| 路径 | `/guestbook` |
| `name` | `guestbook` |
| 组件文件 | `timeshards-web/src/views/front/GuestbookView.vue` |
| `meta.title` | `留言板` |

## 产品定位

访客可发布留言；留言以 **玻璃气泡** 形式在 `.float-stage` 区域内 **随机初始位置 + 持续漂游**，**允许重叠**；**越新的留言 `z-index` 越高**（始终在最上层）。若填写个人网站，点击气泡在新标签页打开（自动补全 `https://`）。右下角 **「我要留言」** FAB 打开模态表单。

## 数据层：Pinia

| Store | `timeshards-web/src/stores/guestbook.ts` |
|-------|------------------------------------------|

- **存储键：** `timeshards-guestbook-v1`（`localStorage`）。
- **最大条数：** `MAX_ENTRIES = 200`；新留言插在列表**头部**（`add` 内 `[next, ...].slice(0, MAX)`）。
- **类型 `GuestbookEntry`：** `id`（`crypto.randomUUID()`）、`name`、`email`、`website`、`content`、`createdAt`。
- **`add(...)`：** 成功返回 `true`，失败（如隐私模式禁止存储）返回 `false`。
- **跨标签同步：** `initCrossTab()` 监听 `storage`（同源其他标签写入）+ 自定义事件 `timeshards-guestbook-sync`（本标签 `persist` 内 `dispatchEvent`）。

页面 `onMounted` 注册 `initCrossTab`，`onBeforeUnmount` 注销。

## 展示顺序与物理效果

- `sortedEntries`：`computed` 为 `[...entries].sort((a,b) => b.createdAt - a.createdAt)`，**新在前**。
- **Composable：** `useGuestbookBubblePhysics(floatStageRef, sortedEntries)`（`src/composables/useGuestbookBubblePhysics.ts`）。

### 物理模型（摘要）

- 每条留言对应 `Body`：`x,y` 为中心坐标，`vx,vy` 速度，`halfW/halfH` 碰撞半宽（用于**贴边**，非气泡互推），`phase`、`om` 控制漂游相位与频率。
- 新留言：`ensureBodies` 用 `entryHash(id)` 派生 **稳定随机** 初始位置（在舞台宽高的矩形内），避免每帧抖动。
- **每帧 `tick`：** 正弦/余弦对速度施力（`drift`、`moveScale`），速度阻尼，积分更新位置；`maxSpeed` 限制最大速度；**无**气泡间碰撞解析，故可重叠。
- **贴边：** `wallClamp`：出界则位置钳制，速度反向并乘以衰减系数。
- **DOM：** `syncDOM(false)` 每帧只更新 `transform: translate3d(x - halfW, y - halfH, 0)`，减少布局抖动；**仅在留言 id 集合变化时** `syncDOM(true)` 更新 `z-index`（新列表顺序 → 新留言在上）。
- **尺寸：** `measureHalfSizes` 读取 `.float-bubble` 的 `getBoundingClientRect()`，更新 `halfW/halfH`（含少量 padding）；舞台 `ResizeObserver` 时重新测量并 `wallClamp`。

### 与模态 / Dock 的层级

- FAB、模态根节点 z-index 在组件样式中高于 Dock（见 `GuestbookView.vue` scoped 样式）。
- Dock 的 `.dock-wrapper` 为 `pointer-events: none`，避免挡 FAB。

## 表单与校验

| 字段 | 规则 |
|------|------|
| 称呼 | 必填，1～32 字 |
| 邮箱 | 可选；若填则需通过简单正则 |
| 个人网站 | 可选；展示点击用 `normalizeWebsite` |
| 内容 | 必填，1～2000 字 |

提交：`gb.add({...})`；失败显示存储错误提示。

## 模态行为

- `Teleport to="body"`；背景点击、`×`、成功约 1.2s 后自动关闭；`Escape` 全局监听。
- `shouldLockBodyScroll()`：在**非**「粗指针且不可悬停」设备上打开模态时锁定 `document.documentElement.style.overflow = 'hidden'`（避免桌面滚动穿透）；典型手机不锁，避免地址栏/滚动异常。

## 无障碍

- 漂浮气泡为 `<button type="button">`；有网站时 `has-site` 样式与 `title` 提示。
- 模态 `role="dialog"`、`aria-modal="true"`、`aria-labelledby` 指向标题。

## 扩展建议

- 后端持久化：将 `add` 改为 API，成功后再写入本地缓存或仅服务端。
- 密度过高：可限制展示条数、缩小卡片、或提供「列表模式」开关。
- 若恢复气泡互斥碰撞，可在 composable 中重新引入成对解析（注意性能）。

## 相关文件

- `src/views/front/GuestbookView.vue`
- `src/stores/guestbook.ts`
- `src/composables/useGuestbookBubblePhysics.ts`
