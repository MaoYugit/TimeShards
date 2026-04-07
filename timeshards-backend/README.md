# timeshards-backend

TimeShards 站点自建后端：**Express 4 + MongoDB（Mongoose）+ TypeScript**。

## 前置条件

- Node.js **≥ 20**
- 本机或远程可访问的 **MongoDB**（如 `mongodb://127.0.0.1:27017/timeshards`）

## 安装与运行

```bash
cd timeshards-backend
pnpm install
cp .env.example .env
# 编辑 .env：至少设置 MONGODB_URI；生产环境务必设置 ADMIN_API_KEY
pnpm dev
```

默认监听 **http://127.0.0.1:3001**（可用 `PORT` 修改）。

生产构建：

```bash
pnpm build
pnpm start
```

## 环境变量

见根目录 `.env.example`。

| 变量 | 说明 |
|------|------|
| `PORT` | HTTP 端口，默认 `3001` |
| `MONGODB_URI` | MongoDB 连接串 |
| `ADMIN_API_KEY` | 若设置，则 **创建/更新/删除文章** 需请求头 `X-API-Key: <值>`；未设置时不校验（仅便于本地开发） |
| `CORS_ORIGINS` | 逗号分隔的前端源，如 `http://localhost:5173` |

## HTTP API（摘要）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/health` | 健康检查 |
| GET | `/api/posts` | 已发布文章列表；可选 `?category=前端`；可选 `?q=` 关键词 |
| GET | `/api/posts/:slug` | 单篇（`slug` 与前端文章 `id` 一致） |
| POST | `/api/posts` | 新建文章（建议配置 `ADMIN_API_KEY`） |
| PUT | `/api/posts/:slug` | 更新 |
| DELETE | `/api/posts/:slug` | 删除 |
| GET | `/api/guestbook` | 留言列表（最多 200 条，新在前） |
| POST | `/api/guestbook` | 发布留言 |
| GET | `/api/chat/messages` | 聊天消息（最多 400 条，时间升序） |
| POST | `/api/chat/messages` | 发送消息（body：`userId`, `nickname`, `text`） |

JSON 字段与 `timeshards-web` 中现有类型对齐：`BlogPost` 使用 `id` 字段对外表示，值等于 `slug`。

## 与前端对接（下一步）

`timeshards-web` 目前仍从本地 `import.meta.glob` 读博客、从 `localStorage` 读留言与聊天。对接时需要：

1. 配置 `VITE_API_BASE_URL`（或类似）指向本服务。
2. 博客列表/详情改为 `fetch` 上述接口。
3. 留言板、聊天室改为调用 API，并可保留 `localStorage` 作离线降级（可选）。

## 目录结构

```
src/
  app.ts           # Express 应用与中间件
  index.ts         # 启动、连接数据库
  config/          # env、db
  models/          # Mongoose 模型
  routes/          # blog / guestbook / chat
  middleware/      # 管理端 API Key
  utils/
```
