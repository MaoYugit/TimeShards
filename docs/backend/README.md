# TimeShards Backend 技术文档

![image-20260505183815341](C:\Users\28745\AppData\Roaming\Typora\typora-user-images\image-20260505183815341.png)

## 目录

- [项目概述](#项目概述)
- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [环境配置](#环境配置)
- [开发指南](#开发指南)
- [API 文档](#api-文档)
- [数据库设计](#数据库设计)
- [认证机制](#认证机制)
- [部署指南](#部署指南)

---

## 项目概述

TimeShards Backend 是 TimeShards 个人站点的后端服务，基于 NestJS 框架构建，提供 RESTful API 和 WebSocket 实时通信服务。

### 核心功能

- 博客文章管理（CRUD + 分页搜索）
- 留言板（提交、列表、删除）
- 聊天室（WebSocket 实时通信）
- 作品集管理
- 管理员认证（JWT）
- 文件上传

---

## 技术栈

| 组件 | 技术 | 版本 | 说明 |
|------|------|------|------|
| 框架 | NestJS | 10+ | 企业级 Node.js 框架 |
| 语言 | TypeScript | 5.x | 类型安全 |
| 运行时 | Node.js | 20+ | LTS 版本 |
| 数据库 | MongoDB | 6+ | 文档型数据库 |
| ODM | Mongoose | 8.x | MongoDB 对象建模 |
| 认证 | JWT + Passport | — | 无状态认证 |
| WebSocket | Socket.IO | 4.x | 实时双向通信 |
| API 文档 | Swagger | 7.x | 自动生成接口文档 |
| 日志 | Pino | — | 高性能日志 |
| 验证 | class-validator | — | 声明式验证 |
| 速率限制 | @nestjs/throttler | 5.x | API 防刷 |

---

## 项目结构

```
timeshards-backend/
├── src/
│   ├── main.ts                        # 应用入口
│   ├── app.module.ts                  # 根模块
│   ├── common/                        # 公共模块
│   │   ├── guards/                    # 守卫
│   │   ├── interceptors/              # 拦截器
│   │   ├── filters/                   # 过滤器
│   │   ├── decorators/                # 装饰器
│   │   ├── pipes/                     # 管道
│   │   └── dto/                       # 公共 DTO
│   ├── config/                        # 配置
│   ├── modules/                       # 业务模块
│   │   ├── auth/                      # 认证模块
│   │   ├── blog/                      # 博客模块
│   │   ├── guestbook/                 # 留言板模块
│   │   ├── chat/                      # 聊天室模块
│   │   ├── portfolio/                 # 作品集模块
│   │   ├── upload/                    # 文件上传模块
│   │   └── admin/                     # 管理后台模块
│   └── database/                      # 数据库种子
├── uploads/                           # 上传文件目录
├── logs/                              # 日志目录
├── .env                               # 环境变量
├── .env.example                       # 环境变量模板
├── package.json
├── tsconfig.json
└── nest-cli.json
```

---

## 环境配置

### 环境变量说明

| 变量名 | 必填 | 默认值 | 说明 |
|--------|------|--------|------|
| `PORT` | 否 | 3001 | 服务端口 |
| `NODE_ENV` | 否 | development | 运行环境 |
| `MONGODB_URI` | 是 | — | MongoDB 连接字符串 |
| `JWT_SECRET` | 是 | — | JWT 密钥（最少 16 字符） |
| `JWT_EXPIRES_IN` | 否 | 7d | JWT 过期时间 |
| `ADMIN_USERNAME` | 是 | — | 初始管理员用户名 |
| `ADMIN_PASSWORD` | 是 | — | 初始管理员密码（最少 6 位） |
| `CORS_ORIGINS` | 是 | — | 允许的跨域源（逗号分隔） |
| `LOG_LEVEL` | 否 | info | 日志级别 |

### 环境变量验证

应用启动时会使用 Joi 验证环境变量，缺失或格式错误的变量会导致启动失败并输出详细错误信息。

---

## 开发指南

### 安装依赖

```bash
cd timeshards-backend
pnpm install
```

### 启动开发服务器

```bash
pnpm run start:dev
```

### 构建生产版本

```bash
pnpm run build
pnpm run start:prod
```

### 常用命令

| 命令 | 说明 |
|------|------|
| `pnpm run start:dev` | 开发模式（热重载） |
| `pnpm run build` | 构建生产版本 |
| `pnpm run start:prod` | 启动生产服务器 |
| `pnpm run lint` | 代码检查 |
| `pnpm run format` | 代码格式化 |

---

## API 文档

### Swagger UI

启动服务后访问：`http://localhost:3001/api/docs`

Swagger UI 提供：
- 所有 API 端点列表
- 请求/响应格式说明
- 在线调试功能（Try it out）
- 认证测试（输入 JWT Token）

### API 响应格式

**成功响应**：
```json
{
  "code": 200,
  "data": { ... },
  "message": "success"
}
```

**错误响应**：
```json
{
  "code": 400,
  "data": null,
  "message": "错误信息",
  "error": "BadRequestException"
}
```

---

## 数据库设计

### 集合列表

| 集合 | 说明 | 主要字段 |
|------|------|----------|
| `admins` | 管理员 | username, passwordHash, role |
| `blogposts` | 博客文章 | title, slug, content, category, status, viewCount |
| `guestbookentries` | 留言 | name, email, content, ip, userAgent |
| `chatmessages` | 聊天消息 | userId, nickname, avatarHue, text |
| `portfolioprojects` | 作品集 | title, summary, tags, links, image |

### 索引建议

```javascript
// BlogPost
db.blogposts.createIndex({ slug: 1 }, { unique: true })
db.blogposts.createIndex({ category: 1, status: 1 })
db.blogposts.createIndex({ publishedAt: -1 })

// GuestbookEntry
db.guestbookentries.createIndex({ createdAt: -1 })

// ChatMessage
db.chatmessages.createIndex({ createdAt: -1 })
```

---

## 认证机制

### JWT 认证流程

1. 管理员通过 `/api/auth/login` 获取 JWT Token
2. 后续请求在 Header 中携带：`Authorization: Bearer <token>`
3. Token 默认 7 天过期，可通过 `/api/auth/refresh` 刷新

### 权限级别

| 级别 | 说明 | 使用场景 |
|------|------|----------|
| 公开 | 无需认证 | GET 请求（文章列表、留言列表等） |
| 管理员 | 需要 JWT | POST/PUT/DELETE 请求 |

### WebSocket 认证

聊天室使用临时 Token 机制：
1. 通过 HTTP 接口获取临时 Token
2. 连接 WebSocket 时携带 Token 验证身份

---

## 部署指南

### 环境要求

- Node.js 20+
- MongoDB 6+
- pnpm（推荐）

### 生产环境配置

```env
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb://your-mongo-host:27017/timeshards
JWT_SECRET=your-very-long-and-secure-secret-key
CORS_ORIGINS=https://your-domain.com
```

### Docker 部署（后续）

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3001
CMD ["node", "dist/main"]
```

---

## 开发阶段记录

### Phase 1：项目初始化 + 基础设施 ✅

**完成日期**：2026-05-05

**完成内容**：
- [x] NestJS 项目初始化
- [x] 环境变量配置 + Joi 验证
- [x] Swagger API 文档集成
- [x] 统一响应拦截器
- [x] 全局异常过滤器
- [x] 全局验证管道
- [x] CORS 配置
- [x] 速率限制配置
- [x] Pino 日志系统集成

**关键文件**：
- `src/main.ts` — 应用入口，注册全局组件
- `src/app.module.ts` — 根模块，导入配置
- `src/app.controller.ts` — 健康检查接口
- `src/app.service.ts` — 健康检查服务
- `src/config/app.config.ts` — 环境变量配置 + Joi 验证
- `src/config/swagger.config.ts` — Swagger 配置
- `src/common/interceptors/transform.interceptor.ts` — 统一响应拦截器
- `src/common/filters/http-exception.filter.ts` — 全局异常过滤器
- `src/common/pipes/validation.pipe.ts` — 全局验证管道
- `src/common/dto/pagination.dto.ts` — 通用分页 DTO

**验证结果**：
```bash
# 健康检查接口测试通过
$ curl http://localhost:3001/api/health
{
  "code": 200,
  "data": {
    "status": "ok",
    "timestamp": "2026-05-05T03:51:49.086Z",
    "environment": "development",
    "version": "1.0.0"
  },
  "message": "success"
}
```

**下一步**：Phase 2 — Auth 模块（JWT 登录鉴权）

### Phase 2：Auth 模块 ✅

**完成日期**：2026-05-05

**完成内容**：
- [x] Admin Schema 设计（管理员数据模型）
- [x] JWT 认证策略
- [x] 管理员登录接口
- [x] Token 刷新机制
- [x] JWT 守卫
- [x] CurrentUser 装饰器
- [x] Public 装饰器
- [x] 密码加密（bcryptjs）
- [x] 默认管理员自动创建

**关键文件**：
- `src/modules/auth/auth.module.ts` — Auth 模块定义
- `src/modules/auth/auth.controller.ts` — 认证控制器
- `src/modules/auth/auth.service.ts` — 认证服务
- `src/modules/auth/schemas/admin.schema.ts` — 管理员 Schema
- `src/modules/auth/strategies/jwt.strategy.ts` — JWT 策略
- `src/modules/auth/dto/login.dto.ts` — 登录请求 DTO
- `src/modules/auth/dto/login-response.dto.ts` — 登录响应 DTO
- `src/common/guards/jwt-auth.guard.ts` — JWT 守卫
- `src/common/decorators/current-user.decorator.ts` — 获取当前用户装饰器
- `src/common/decorators/public.decorator.ts` — 公开接口装饰器

**验证结果**：
```bash
# 登录接口测试通过
$ curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
{
  "code": 200,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 604800000,
    "tokenType": "Bearer"
  },
  "message": "success"
}

# 获取管理员信息测试通过
$ curl http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer $TOKEN"
{
  "code": 200,
  "data": {
    "id": "69f977fcbdf41ded731aa362",
    "username": "admin",
    "role": "admin",
    "createdAt": "2026-05-05T04:54:20.696Z",
    "updatedAt": "2026-05-05T04:54:20.696Z"
  },
  "message": "success"
}
```

**下一步**：Phase 3 — Blog 模块（CRUD + 分页搜索）

### Phase 3：Blog 模块 ✅

**完成日期**：2026-05-05

**完成内容**：
- [x] BlogPost Schema 设计（博客文章数据模型）
- [x] CreatePostDto、UpdatePostDto、QueryPostDto
- [x] Blog Service（CRUD + 分页搜索）
- [x] Blog Controller（8 个 API 端点）
- [x] 自动生成 slug
- [x] 自动生成摘要
- [x] 阅读量统计
- [x] 关键词搜索

**关键文件**：
- `src/modules/blog/blog.module.ts` — Blog 模块定义
- `src/modules/blog/blog.controller.ts` — 博客控制器
- `src/modules/blog/blog.service.ts` — 博客服务
- `src/modules/blog/schemas/blog-post.schema.ts` — 博客文章 Schema
- `src/modules/blog/dto/create-post.dto.ts` — 创建文章 DTO
- `src/modules/blog/dto/update-post.dto.ts` — 更新文章 DTO
- `src/modules/blog/dto/query-post.dto.ts` — 查询文章 DTO

**验证结果**：
```bash
# 创建文章测试通过
$ curl -X POST http://localhost:3001/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"My First Post","category":"前端","tags":["Vue","TypeScript"],"content":"# Title\n\nThis is content...","status":"published"}'
{
  "code": 200,
  "data": {
    "title": "My First Post",
    "slug": "my-first-post",
    "summary": "Title This is content...",
    "status": "published",
    "publishedAt": "2026-05-05T05:29:38.591Z",
    "viewCount": 0,
    "category": "前端",
    "tags": ["Vue", "TypeScript"],
    "content": "# Title\n\nThis is content...",
    "authorId": "69f977fcbdf41ded731aa362",
    "_id": "69f98042e961a07aff0bce1f",
    "createdAt": "2026-05-05T05:29:38.600Z",
    "updatedAt": "2026-05-05T05:29:38.600Z",
    "__v": 0
  },
  "message": "success"
}

# 获取文章列表测试通过
$ curl http://localhost:3001/api/posts
{
  "code": 200,
  "data": {
    "items": [...],
    "total": 1,
    "page": 1,
    "pageSize": 10,
    "totalPages": 1
  },
  "message": "success"
}
```

**下一步**：Phase 4 — Guestbook 模块（留言板）

### Phase 4：Guestbook 模块（待开发）

**计划内容**：
- [ ] 留言 Schema
- [ ] 提交留言接口
- [ ] 留言列表接口
- [ ] 管理员删除接口
- [ ] 速率限制

### Phase 5：Portfolio 模块（待开发）

**计划内容**：
- [ ] 作品集 Schema
- [ ] CRUD 接口
- [ ] 排序功能

### Phase 6：Chat 模块（待开发）

**计划内容**：
- [ ] Socket.IO 网关
- [ ] WebSocket 认证
- [ ] 消息存储
- [ ] 历史消息查询

### Phase 7：Admin 统计模块（待开发）

**计划内容**：
- [ ] 统计接口
- [ ] 种子数据
