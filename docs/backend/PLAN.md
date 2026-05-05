# TimeShards Backend — NestJS 重构计划

## 一、技术栈

| 组件 | 选择 | 版本 |
|------|------|------|
| 框架 | NestJS | 10+ |
| 语言 | TypeScript | 5.x |
| 数据库 | MongoDB | 6+ |
| ODM | Mongoose | 8.x |
| 认证 | @nestjs/jwt + passport | JWT |
| WebSocket | @nestjs/websockets + socket.io | 4.x |
| 验证 | class-validator + class-transformer | — |
| 速率限制 | @nestjs/throttler | 5.x |
| API 文档 | @nestjs/swagger | 7.x |
| 日志 | nestjs-pino / pino | — |
| 文件上传 | Multer（@nestjs/platform-express 内置） | — |
| 环境变量验证 | Joi | — |
| 包管理 | pnpm | — |

---

## 二、项目结构

```
timeshards-backend/
├── src/
│   ├── main.ts                            # 应用入口（Swagger、全局管道、拦截器、过滤器注册）
│   ├── app.module.ts                      # 根模块
│   │
│   ├── common/                            # 公共模块
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts          # JWT 认证守卫（全局通用）
│   │   │   └── ws-jwt.guard.ts            # WebSocket JWT 守卫
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts  # 获取当前用户装饰器
│   │   │   └── api-response.decorator.ts  # 统一响应装饰器
│   │   ├── interceptors/
│   │   │   └── transform.interceptor.ts   # 统一响应拦截器 { code, data, message }
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts   # 全局异常过滤器
│   │   ├── pipes/
│   │   │   └── validation.pipe.ts         # 全局验证管道
│   │   └── dto/
│   │       └── pagination.dto.ts          # 通用分页 DTO
│   │
│   ├── config/                            # 配置
│   │   ├── app.config.ts                  # 应用配置（含 Joi 验证）
│   │   ├── database.config.ts             # Mongoose 连接配置
│   │   └── swagger.config.ts              # Swagger 文档配置
│   │
│   ├── modules/
│   │   ├── auth/                          # 认证模块
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts         # POST /api/auth/login, /refresh, GET /profile
│   │   │   ├── auth.service.ts
│   │   │   ├── dto/
│   │   │   │   └── login.dto.ts
│   │   │   └── strategies/
│   │   │       └── jwt.strategy.ts        # Passport JWT 策略
│   │   │
│   │   ├── blog/                          # 博客模块
│   │   │   ├── blog.module.ts
│   │   │   ├── blog.controller.ts         # CRUD /api/posts
│   │   │   ├── blog.service.ts
│   │   │   ├── dto/
│   │   │   │   ├── create-post.dto.ts
│   │   │   │   └── update-post.dto.ts
│   │   │   └── schemas/
│   │   │       └── blog-post.schema.ts
│   │   │
│   │   ├── guestbook/                     # 留言板模块
│   │   │   ├── guestbook.module.ts
│   │   │   ├── guestbook.controller.ts    # GET/POST/DELETE /api/guestbook
│   │   │   ├── guestbook.service.ts
│   │   │   ├── dto/
│   │   │   │   └── create-guestbook.dto.ts
│   │   │   └── schemas/
│   │   │       └── guestbook-entry.schema.ts
│   │   │
│   │   ├── chat/                          # 聊天室模块
│   │   │   ├── chat.module.ts
│   │   │   ├── chat.controller.ts         # GET /api/chat/messages
│   │   │   ├── chat.service.ts
│   │   │   ├── chat.gateway.ts            # WebSocket 网关（Socket.IO）
│   │   │   ├── dto/
│   │   │   │   └── send-message.dto.ts
│   │   │   └── schemas/
│   │   │       └── chat-message.schema.ts
│   │   │
│   │   ├── portfolio/                     # 作品集模块
│   │   │   ├── portfolio.module.ts
│   │   │   ├── portfolio.controller.ts    # CRUD /api/portfolio
│   │   │   ├── portfolio.service.ts
│   │   │   ├── dto/
│   │   │   │   ├── create-portfolio.dto.ts
│   │   │   │   └── update-portfolio.dto.ts
│   │   │   └── schemas/
│   │   │       └── portfolio-project.schema.ts
│   │   │
│   │   ├── upload/                        # 文件上传模块
│   │   │   ├── upload.module.ts
│   │   │   ├── upload.controller.ts       # POST /api/upload
│   │   │   └── upload.service.ts          # 本地存储 / 云存储（预留）
│   │   │
│   │   └── admin/                         # 管理后台模块
│   │       ├── admin.module.ts
│   │       ├── admin.controller.ts        # GET /api/admin/stats
│   │       └── admin.service.ts
│   │
│   └── database/                          # 数据库
│       └── seeds/
│           └── admin.seed.ts              # 初始管理员账户种子
│
├── uploads/                               # 本地上传文件目录（.gitignore）
├── logs/                                  # 日志文件目录（.gitignore）
├── .env
├── .env.example
├── package.json
├── tsconfig.json
├── tsconfig.build.json
└── nest-cli.json
```

---

## 三、数据库 Schema 设计

### 3.1 Admin（管理员）

```typescript
{
  _id: ObjectId
  username: string           // 唯一，必填
  passwordHash: string       // bcrypt 加密，查询时默认排除
  role: 'admin'              // 默认 'admin'
  createdAt: Date
}

// Schema 配置：
// toJSON/toObject 时自动排除 passwordHash
// 查询时使用 .select('-passwordHash') 确保脱敏
```

### 3.2 BlogPost（博客文章）

```typescript
{
  _id: ObjectId
  title: string              // 必填
  slug: string               // URL 友好的标识符，唯一，自动生成
  summary: string            // 摘要，可选，不传时自动截取 content 前 150 字
  status: 'draft' | 'published'  // 状态，默认 'draft'
  publishedAt: Date          // 发布日期（status 变为 published 时设置）
  updatedAt: Date            // 更新日期
  viewCount: number          // 阅读量，默认 0
  category: enum             // '前端' | '工程化' | 'AI 开发' | '随笔'
  tags: string[]             // 标签数组
  coverImage: string         // 封面图 URL，可选
  content: string            // Markdown 正文
  authorId: ObjectId         // 关联 Admin
  createdAt: Date
}
```

### 3.3 GuestbookEntry（留言板条目）

```typescript
{
  _id: ObjectId
  name: string               // 1~32 字，必填
  email: string              // 可选，邮箱格式
  website: string            // 可选
  content: string            // 1~2000 字，必填
  ip: string                 // 记录 IP
  userAgent: string          // 记录 User-Agent，便于追溯
  createdAt: Date
}

// 速率限制：同一 IP 每分钟最多 3 条留言（ThrottlerModule）
```

### 3.4 ChatMessage（聊天消息）

```typescript
{
  _id: ObjectId
  userId: string             // 前端生成的用户 ID
  nickname: string           // 昵称
  avatarHue: number          // 0~359，头像色相
  text: string               // 1~2000 字
  createdAt: Date
}
```

### 3.5 PortfolioProject（作品集项目）

```typescript
{
  _id: ObjectId
  title: string              // 必填
  period: string             // 年份或时间段
  summary: string            // 简介
  tags: string[]             // 标签数组
  links: [{                  // 可选，项目链接
    label: string
    href: string
  }]
  image: string              // 展示图 URL
  showcaseNote: string       // 图片说明
  sortOrder: number          // 排序权重，默认 0
  createdAt: Date
}
```

---

## 四、API 端点设计

### 4.1 Auth 模块 — `/api/auth`

| 方法 | 端点 | 描述 | 认证 | 请求体 | 响应 |
|------|------|------|------|--------|------|
| POST | `/api/auth/login` | 管理员登录 | 否 | `{ username, password }` | `{ accessToken, expiresIn }` |
| POST | `/api/auth/refresh` | 刷新 Token | JWT | — | `{ accessToken }` |
| GET | `/api/auth/profile` | 获取当前用户 | JWT | — | `{ id, username, role }` |

### 4.2 Blog 模块 — `/api/posts`

| 方法 | 端点 | 描述 | 认证 | 请求参数 | 响应 |
|------|------|------|------|----------|------|
| GET | `/api/posts` | 文章列表 | 否 | Query: `?category=&q=&status=&page=&pageSize=` | `{ items: BlogPost[], total: number }` |
| GET | `/api/posts/:id` | 文章详情 | 否 | — | `BlogPost`（自动 +1 viewCount） |
| POST | `/api/posts` | 创建文章 | Admin | Body: `CreatePostDto` | `BlogPost` |
| PUT | `/api/posts/:id` | 更新文章 | Admin | Body: `UpdatePostDto` | `BlogPost` |
| DELETE | `/api/posts/:id` | 删除文章 | Admin | — | `{ success: true }` |

### 4.3 Guestbook 模块 — `/api/guestbook`

| 方法 | 端点 | 描述 | 认证 | 请求参数 | 响应 |
|------|------|------|------|----------|------|
| GET | `/api/guestbook` | 留言列表 | 否 | Query: `?page=&pageSize=` | `{ items: GuestbookEntry[], total: number }` |
| POST | `/api/guestbook` | 提交留言 | 否 | Body: `CreateGuestbookDto` | `GuestbookEntry` |
| DELETE | `/api/guestbook/:id` | 删除留言 | Admin | — | `{ success: true }` |

> **速率限制**：POST 接口同一 IP 每分钟最多 3 次

### 4.4 Chat 模块

| 类型 | 端点 | 描述 | 认证 | 参数 | 响应 |
|------|------|------|------|------|------|
| HTTP | `GET /api/chat/messages` | 历史消息 | 否 | Query: `?limit=&before=` | `{ items: ChatMessage[] }` |
| WS | `/chat` | WebSocket 实时聊天 | 临时 Token | 见下方 | 见下方 |

**WebSocket 事件协议**:

```
客户端 → 服务端:
  { type: 'join', payload: { nickname: string, token: string } }
  { type: 'message', payload: { text: string } }
  { type: 'ping' }

服务端 → 客户端:
  { type: 'message', payload: ChatMessage }
  { type: 'pong' }
  { type: 'error', payload: { message: string } }
  { type: 'system', payload: { text: string } }    // 系统通知（加入/退出）
```

> **WebSocket 安全**：连接时需通过 WS Guard 验证临时 Token（可从 `/api/auth/chat-token` 获取），防止脚本刷屏

### 4.5 Portfolio 模块 — `/api/portfolio`

| 方法 | 端点 | 描述 | 认证 | 请求参数 | 响应 |
|------|------|------|------|----------|------|
| GET | `/api/portfolio` | 作品列表 | 否 | — | `PortfolioProject[]` |
| POST | `/api/portfolio` | 创建作品 | Admin | Body: `CreatePortfolioDto` | `PortfolioProject` |
| PUT | `/api/portfolio/:id` | 更新作品 | Admin | Body: `UpdatePortfolioDto` | `PortfolioProject` |
| DELETE | `/api/portfolio/:id` | 删除作品 | Admin | — | `{ success: true }` |

### 4.6 Upload 模块 — `/api/upload`

| 方法 | 端点 | 描述 | 认证 | 请求参数 | 响应 |
|------|------|------|------|----------|------|
| POST | `/api/upload/image` | 上传图片 | Admin | FormData: `file` | `{ url: string, filename: string }` |

> **限制**：仅允许 jpg/png/gif/webp，最大 5MB

### 4.7 Admin 模块 — `/api/admin`

| 方法 | 端点 | 描述 | 认证 | 响应 |
|------|------|------|------|------|
| GET | `/api/admin/stats` | 仪表盘统计 | Admin | `{ postCount, guestbookCount, chatMessageCount, draftCount }` |

---

## 五、全局功能详解

### 5.1 统一响应格式

**成功响应**（由 `transform.interceptor.ts` 自动包装）：
```json
{
  "code": 200,
  "data": { /* 实际数据 */ },
  "message": "success"
}
```

**错误响应**（由 `http-exception.filter.ts` 统一处理）：
```json
{
  "code": 400,
  "data": null,
  "message": "用户名或密码错误",
  "error": "BadRequestException"
}
```

### 5.2 Swagger API 文档

- 访问地址：`http://localhost:3001/api/docs`
- 使用 `@nestjs/swagger` 装饰器标记 Controller 和 DTO
- 自动生成 OpenAPI 3.0 规范文档
- 支持在线调试（Try it out）

### 5.3 日志系统

- 使用 `nestjs-pino` 集成高性能 Pino 日志
- 开发环境：控制台彩色输出
- 生产环境：按天滚动写入 `logs/` 目录
- 记录：请求日志、错误堆栈、数据库操作

### 5.4 环境变量验证

使用 Joi 在应用启动时验证 `.env`：

```typescript
// config/app.config.ts
const envValidationSchema = Joi.object({
  PORT: Joi.number().default(3001),
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  MONGODB_URI: Joi.string().required(),
  JWT_SECRET: Joi.string().min(16).required(),
  JWT_EXPIRES_IN: Joi.string().default('7d'),
  ADMIN_USERNAME: Joi.string().required(),
  ADMIN_PASSWORD: Joi.string().min(6).required(),
  CORS_ORIGINS: Joi.string().required(),
})
```

---

## 六、环境变量

```env
# 应用
PORT=3001
NODE_ENV=development

# 数据库
MONGODB_URI=mongodb://127.0.0.1:27017/timeshards

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# 管理员初始账户（首次启动自动创建）
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123

# CORS（逗号分隔）
CORS_ORIGINS=http://localhost:5173,http://localhost:5174

# 日志级别（可选）
LOG_LEVEL=info
```

---

## 七、依赖清单

### dependencies

| 包名 | 用途 |
|------|------|
| `@nestjs/common` | NestJS 核心通用模块 |
| `@nestjs/core` | NestJS 核心 |
| `@nestjs/platform-express` | Express HTTP 适配器 |
| `@nestjs/mongoose` | Mongoose 集成 |
| `@nestjs/jwt` | JWT 令牌生成与验证 |
| `@nestjs/passport` | Passport 集成 |
| `@nestjs/config` | 环境变量配置管理 |
| `@nestjs/websockets` | WebSocket 支持 |
| `@nestjs/platform-socket.io` | Socket.IO 适配器 |
| `@nestjs/swagger` | Swagger API 文档自动生成 |
| `@nestjs/throttler` | 速率限制（防刷） |
| `mongoose` | MongoDB ODM |
| `passport` | 认证框架 |
| `passport-jwt` | JWT 策略 |
| `bcrypt` | 密码哈希 |
| `class-validator` | DTO 验证 |
| `class-transformer` | 数据转换 |
| `nestjs-pino` | 高性能日志集成 |
| `pino` | 日志核心 |
| `pino-pretty` | 开发环境日志美化 |
| `joi` | 环境变量验证 |
| `multer` | 文件上传（Express 内置，需安装类型） |

### devDependencies

| 包名 | 用途 |
|------|------|
| `@nestjs/cli` | NestJS CLI |
| `@nestjs/schematics` | 代码生成 |
| `@nestjs/testing` | 测试工具 |
| `@types/express` | Express 类型 |
| `@types/passport-jwt` | JWT 策略类型 |
| `@types/bcrypt` | bcrypt 类型 |
| `@types/multer` | 文件上传类型 |
| `typescript` | TypeScript 编译器 |
| `ts-node` | TS 运行时 |
| `tsx` | 热重载开发 |

---

## 八、实施顺序

| 阶段 | 内容 | 预计文件数 | 状态 |
|------|------|-----------|------|
| **Phase 1** | 项目初始化 + 环境变量验证 + Swagger 接入 | ~10 | ⬜ 待开始 |
| **Phase 2** | Auth 模块 + JWT 策略 + 全局拦截器/过滤器 | ~10 | ⬜ 待开始 |
| **Phase 3** | Blog 模块（CRUD + 分页搜索 + 图片上传） | ~10 | ⬜ 待开始 |
| **Phase 4** | Portfolio 模块 | ~6 | ⬜ 待开始 |
| **Phase 5** | Guestbook 模块（含速率限制防刷） | ~6 | ⬜ 待开始 |
| **Phase 6** | Chat 模块（WebSocket + 安全验证） | ~8 | ⬜ 待开始 |
| **Phase 7** | Admin 统计模块 + 种子数据 | ~4 | ⬜ 待开始 |

**总计约 54 个文件**

---

## 九、开发辅助工具建议

| 工具 | 用途 | 推荐 |
|------|------|------|
| MongoDB Compass | 数据库 GUI 管理 | ✅ 强烈推荐 |
| Postman / Insomnia | API 测试 | ✅ 推荐 |
| VS Code REST Client | 轻量级 API 测试 | ✅ 可选 |
| Swagger UI | 内置 API 文档调试 | ✅ 已集成 |

---

## 十、后续工作（不在本次范围内）

- [ ] 前端改造：创建 API 服务层，将 localStorage 替换为 API 调用
- [ ] 前端改造：实现管理后台页面（Login / Dashboard / PostManagement）
- [ ] 前端改造：集成 Socket.IO 客户端
- [ ] 部署配置：Dockerfile + docker-compose
- [ ] 生产环境：PM2 进程管理
- [ ] 单元测试与 E2E 测试
- [ ] 云存储集成（阿里云 OSS / 腾讯云 COS）
