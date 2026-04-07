# TimeShards Web（timeshards-web）

Vue 3 + TypeScript + Vite 单页应用，站点前台与（占位）管理端路由均在 `src/router`。

## 开发文档（仓库级）

完整说明见仓库根目录 **[`../docs/web/README.md`](../docs/web/README.md)**，包括：

- 技术栈、目录结构、路由与 Pinia Store
- [全局背景](../docs/web/global-background.md)、[Dock](../docs/web/dock.md)
- [每个页面的详细文档](../docs/web/pages/README.md)

## 本地运行

```sh
pnpm install
pnpm dev
```

## 构建与检查

```sh
pnpm build
pnpm lint
```

TypeScript / Vue 类型检查由构建与 IDE（Volar）配合完成；详见 Vite 官方文档。

## 推荐环境

- 编辑器：[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar)（勿与旧版 Vetur 同时用于 Vue 3）
- 浏览器：Chromium 系安装 [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd) 便于调试

## 环境变量

可选：`VITE_CHAT_WS_URL`（聊天室 WebSocket，未配置时使用本地存储方案）。类型见 `env.d.ts`。
