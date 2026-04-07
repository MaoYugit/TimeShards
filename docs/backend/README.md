# 后端文档（Express + MongoDB）

实现目录：**`timeshards-backend/`**（与 `timeshards-web` 并列）。

## 技术栈

- **运行时**：Node.js ≥ 20  
- **框架**：Express 4  
- **数据库**：MongoDB，ODM 为 **Mongoose**  
- **语言**：TypeScript（开发用 `tsx watch`，生产 `tsc` + `node`）

## 快速开始

1. 安装并启动 MongoDB（本地默认 `mongodb://127.0.0.1:27017`）。  
2. 进入 `timeshards-backend`，复制 `.env.example` 为 `.env`，配置 `MONGODB_URI`。  
3. `pnpm install` → `pnpm dev`。  
4. 访问 `GET http://127.0.0.1:3001/api/health` 应返回 `{ "ok": true, ... }`。

完整命令、环境变量与 **REST API 列表** 见 **[timeshards-backend/README.md](../../timeshards-backend/README.md)**。

## 数据模型（概要）

| 集合 | 用途 |
|------|------|
| `blogposts` | 博客正文与元数据，`slug` 唯一，对应前端文章 `id` |
| `guestbookentries` | 留言板 |
| `chatmessages` | 公共聊天消息 |

## 安全与后续

- 生产环境务必设置 **`ADMIN_API_KEY`**，并对管理类接口强制校验（当前已实现 `X-API-Key`）。  
- 后续可补充：JWT 管理员登录、请求频率限制、Helmet/CORS 白名单与线上域名一致。  
- **Java 后端** 若与仓库中其他模块并存，请在本目录单独开文档说明职责划分，避免与 `timeshards-backend` 重复实现同一业务。

## 与前端的关系

`timeshards-web` 通过 **HTTP + CORS** 调用本服务；具体对接步骤见 `timeshards-backend/README.md` 中的「与前端对接」。
