# TimeShards 仓库文档

本仓库为 **TimeShards** 个人站点相关的多模块代码：**Web（Vue 3）**、**小程序（uni-app）** 与 **后端（Java）** 等将并列维护。文档按模块拆分，便于各端独立迭代。

## 文档导航

| 文档 | 说明 |
|------|------|
| [Web 端开发文档](./web/README.md) | `timeshards-web` 技术架构、目录、构建运行、与页面级文档索引 |
| [小程序端（占位）](./miniapp/README.md) | uni-app 等；待代码纳入后补全 |
| [后端（Express + MongoDB）](./backend/README.md) | `timeshards-backend` 与文档入口 |

## 仓库结构（概览）

```
TimeShards/
├── docs/                 # 本目录：跨模块与分模块开发文档
├── timeshards-web/       # Web 前端（Vue 3 + Vite + Pinia）
├── …                     # 小程序、后端等（以仓库实际目录为准）
└── README.md             # 仓库入口说明（克隆、安装、各子项目命令）
```

## 约定

- **路径**：文档中的文件路径以仓库根目录为基准，Web 子项目内路径写作 `timeshards-web/src/...`。
- **更新**：变更路由、公共布局、全局 Store 行为时，请同步更新 `docs/web/README.md` 与受影响页面文档。

## 版本与分支

以团队实际流程为准；建议在合并涉及用户可见行为的改动时，在对应模块文档中追加一行「变更摘要」或指向 PR。
