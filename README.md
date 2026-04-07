# TimeShards

个人站点相关的多模块仓库：**Web（Vue 3 + Vite）**、**小程序（uni-app）** 与 **后端（Java）** 等并列维护。

## 文档

| 文档 | 说明 |
|------|------|
| [**仓库文档总入口**](docs/README.md) | 多模块导航、目录约定 |
| [**Web 端开发文档**](docs/web/README.md) | `timeshards-web` 架构、路由、Store、构建与**分页面详解** |
| [全局背景](docs/web/global-background.md) | Three.js / tsParticles 背景 |
| [Dock 栏](docs/web/dock.md) | 底部导航与主题切换 |
| [Web 页面索引](docs/web/pages/README.md) | 每个路由对应一份深度文档 |
| [小程序（占位）](docs/miniapp/README.md) | 待补充 |
| [后端（占位）](docs/backend/README.md) | 待补充 |

## 仓库结构（概览）

```
TimeShards/
├── docs/                    # 开发文档（按模块拆分）
├── timeshards-web/          # Web 前端（Vue 3 + Vite + Pinia）
├── …                        # 小程序、后端等（以实际克隆结果为准）
└── README.md
```

## Web 端（timeshards-web）

```bash
cd timeshards-web
pnpm install
pnpm dev
```

其他命令见 [`timeshards-web/README.md`](timeshards-web/README.md)（构建、`lint` 等）。

**技术要点简述：** Vue Router、`Pinia`、Markdown（`marked`）、全局玻璃拟态 UI、底部 Dock 导航、全局动态背景；留言板与聊天室当前为浏览器 `localStorage` + 多标签同步（可选后续对接 `VITE_CHAT_WS_URL` 等）。

## 小程序端

文档入口：[docs/miniapp/README.md](docs/miniapp/README.md)。项目路径与命令以仓库内实际目录为准。

## Java 后端

文档入口：[docs/backend/README.md](docs/backend/README.md)。模块与启动方式以仓库内实际代码为准。

## 许可与贡献

按项目约定执行；提交涉及用户可见行为或路由变更时，请同步更新 `docs/` 下对应说明。
