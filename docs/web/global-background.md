# 全局背景（GlobalBackground）

## 文件位置

- `timeshards-web/src/components/Background/GlobalBackground.vue`
- 挂载：`App.vue` 中置于最底层，全屏覆盖。
- 引擎初始化：`main.ts` 内 `VueParticles(app, { init: loadSlim })`。

## 设计目标

- 提供**不遮挡页面操作**的氛围背景（玻璃拟态页面浮在其上）。
- 组合 **WebGL（Three.js）** 与 **2D 粒子（tsParticles）**；实际展示以模板为准。

## 层级与指针

- 根节点 `.background-wrapper`：`position: fixed; inset: 0; z-index: 0; pointer-events: none;`
- **禁止**对背景使用负 `z-index`，否则可能落到 `html`/`body` 实色背景下方导致「背景消失」（注释已说明）。
- 因 `pointer-events: none`，背景不接收点击；粒子「点击增加」若仍生效，属于 tsParticles 内部对 canvas 的处理；若需完全禁用可再调 `interactivity` 或单独覆盖。

## Three.js 层（时间碎片）

脚本中保留完整 `initThree` / `animate` / `disposeThree`：

- 场景：雾、`PerspectiveCamera`、环境光 + 点光。
- 物体：约 50 个 `TetrahedronGeometry` + `MeshPhongMaterial`，带随机位置、缩放、旋转速度与上下漂浮。
- 动画：`requestAnimationFrame` 循环中更新旋转与 Y 位置，超出范围则循环。

**模板注意：** 若 `<div ref="threeContainer" class="three-container">` 被注释，则 `threeContainer` 为 `null`，`initThree` 会立即 `return`，**不会创建 WebGL 场景**。需要四面体背景时，应恢复该节点并确认 `z-index`（`.three-container` 在粒子下方）。

## tsParticles 层

- 组件标签：`vue-particles`（`@tsparticles/vue3` v3 全局注册）。
- `particleOptions` 为 `computed`，依赖 `isCoarsePointer`：粗指针（多为触摸）时粒子数量约 110，否则约 240，以兼顾手机性能。
- 交互：`onClick` push 粒子、`onHover` repulse；`resize: true`。
- **渐进清理**：`onParticlesLoaded` 后 `setInterval`（约 450ms）若粒子总数超过基准，则每次少量 `removeQuantity`，避免连线无限变密。

## 生命周期

- `onMounted`：监听 `(pointer: coarse)` 变化；调用 `initThree()`；`resize` 监听。
- `onBeforeUnmount`：清除粒子清理定时器；`disposeThree()` 释放 WebGL 资源。

## 依赖（package.json）

- `three`、`@types/three`
- `@tsparticles/vue3`、`@tsparticles/slim`

## 扩展建议

- 主题联动：可监听 `data-theme` 或 `useThemeStore`，调整粒子颜色、背景径向渐变 CSS 变量（当前 `--global-bg-center` / `--global-bg-edge` 在全局样式中定义）。
- 性能：低端机可进一步降低 `fpsLimit`、粒子数或关闭 hover。
