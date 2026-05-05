# Phase 7：Admin 统计模块 + 种子数据

**完成日期**：2026-05-05  
**状态**：✅ 已完成

---

## 一、本阶段目标

实现管理后台仪表盘统计数据接口，以及数据库种子数据脚本。

### 主要任务

1. 创建 Admin 模块
2. 实现统计接口
3. 完善种子数据脚本

---

## 二、详细操作步骤

### 2.1 创建 Admin Service

#### 创建 `src/modules/admin/admin.service.ts`

**功能**：
- 统计各模块数据总数
- 提供仪表盘数据

**主要方法**：

```typescript
@Injectable()
export class AdminService {
  constructor(
    @InjectModel(BlogPost.name) private blogPostModel: Model<BlogPostDocument>,
    @InjectModel(GuestbookEntry.name) private guestbookModel: Model<GuestbookEntryDocument>,
    @InjectModel(ChatMessage.name) private chatMessageModel: Model<ChatMessageDocument>,
    @InjectModel(PortfolioProject.name) private portfolioModel: Model<PortfolioProjectDocument>,
  ) {}

  async getDashboardStats(): Promise<DashboardStats> {
    const [
      postCount,
      publishedPostCount,
      draftPostCount,
      guestbookCount,
      chatMessageCount,
      portfolioCount,
    ] = await Promise.all([
      this.blogPostModel.countDocuments().exec(),
      this.blogPostModel.countDocuments({ status: 'published' }).exec(),
      this.blogPostModel.countDocuments({ status: 'draft' }).exec(),
      this.guestbookModel.countDocuments().exec(),
      this.chatMessageModel.countDocuments().exec(),
      this.portfolioModel.countDocuments().exec(),
    ]);

    return {
      postCount,
      publishedPostCount,
      draftPostCount,
      guestbookCount,
      chatMessageCount,
      portfolioCount,
    };
  }
}
```

**统计数据结构**：

```typescript
export interface DashboardStats {
  postCount: number;          // 文章总数
  publishedPostCount: number; // 已发布文章数
  draftPostCount: number;     // 草稿文章数
  guestbookCount: number;     // 留言总数
  chatMessageCount: number;   // 聊天消息总数
  portfolioCount: number;     // 作品总数
}
```

---

### 2.2 创建 Admin Controller

#### 创建 `src/modules/admin/admin.controller.ts`

**API 端点**：

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| GET | `/api/admin/stats` | JWT | 获取仪表盘统计数据 |

**关键代码**：

```typescript
@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '获取仪表盘统计数据' })
  async getDashboardStats(): Promise<DashboardStats> {
    return this.adminService.getDashboardStats();
  }
}
```

---

### 2.3 创建 Admin Module

#### 创建 `src/modules/admin/admin.module.ts`

```typescript
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BlogPost.name, schema: BlogPostSchema },
      { name: GuestbookEntry.name, schema: GuestbookEntrySchema },
      { name: ChatMessage.name, schema: ChatMessageSchema },
      { name: PortfolioProject.name, schema: PortfolioProjectSchema },
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
```

---

### 2.4 更新 App Module

#### 更新 `src/app.module.ts`

```typescript
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    // ... 其他模块
    AuthModule,
    BlogModule,
    GuestbookModule,
    PortfolioModule,
    ChatModule,
    AdminModule,  // 新增
  ],
})
export class AppModule {}
```

---

### 2.5 种子数据脚本

#### 更新 `src/database/seeds/admin.seed.ts`

种子数据脚本会：
1. 创建应用上下文
2. 触发所有模块的 `onModuleInit`
3. `AuthService.onModuleInit()` 自动创建默认管理员

```typescript
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from '../../app.module';

async function seed() {
  const logger = new Logger('Seed');

  try {
    logger.log('Starting database seeding...');

    // 创建应用上下文会触发所有模块的 onModuleInit
    // AuthService.onModuleInit() 会自动创建默认管理员
    const app = await NestFactory.createApplicationContext(AppModule);

    logger.log('Database seeding completed');

    await app.close();
    process.exit(0);
  } catch (error) {
    logger.error('Database seeding failed', error);
    process.exit(1);
  }
}

seed();
```

**运行种子数据**：

```bash
# 编译后运行
node dist/database/seeds/admin.seed.js
```

---

## 三、项目结构

```
timeshards-backend/
├── src/
│   ├── modules/
│   │   ├── auth/
│   │   ├── blog/
│   │   ├── guestbook/
│   │   ├── portfolio/
│   │   ├── chat/
│   │   └── admin/
│   │       ├── admin.module.ts
│   │       ├── admin.controller.ts
│   │       └── admin.service.ts
│   └── database/
│       └── seeds/
│           └── admin.seed.ts
└── ...
```

---

## 四、验证测试

### 4.1 编译检查

```bash
$ pnpm run build
> nest build

# 构建成功
```

### 4.2 测试统计接口

```bash
$ TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

$ curl http://localhost:3001/api/admin/stats \
  -H "Authorization: Bearer $TOKEN"

{
  "code": 200,
  "data": {
    "postCount": 2,
    "publishedPostCount": 2,
    "draftPostCount": 0,
    "guestbookCount": 1,
    "chatMessageCount": 0,
    "portfolioCount": 1
  },
  "message": "success"
}
```

**验证点**：
- ✅ 返回统一格式响应
- ✅ 统计数据准确
- ✅ 需要 JWT 认证

### 4.3 运行种子数据

```bash
$ node dist/database/seeds/admin.seed.js

[Nest] INFO [Seed] Starting database seeding...
[Nest] INFO [AuthService] Default admin user 'admin' created
[Nest] INFO [Seed] Database seeding completed
```

---

## 五、关键技术点

### 5.1 并行统计

使用 `Promise.all` 并行执行多个统计查询：

```typescript
const [
  postCount,
  publishedPostCount,
  draftPostCount,
  guestbookCount,
  chatMessageCount,
  portfolioCount,
] = await Promise.all([
  this.blogPostModel.countDocuments().exec(),
  this.blogPostModel.countDocuments({ status: 'published' }).exec(),
  this.blogPostModel.countDocuments({ status: 'draft' }).exec(),
  this.guestbookModel.countDocuments().exec(),
  this.chatMessageModel.countDocuments().exec(),
  this.portfolioModel.countDocuments().exec(),
]);
```

### 5.2 种子数据机制

种子数据通过以下机制工作：

1. `NestFactory.createApplicationContext(AppModule)` 创建应用上下文
2. 触发所有模块的 `onModuleInit` 生命周期
3. `AuthService.onModuleInit()` 检查并创建默认管理员

### 5.3 默认管理员创建

在 `AuthService` 中：

```typescript
async onModuleInit() {
  await this.ensureAdminExists();
}

private async ensureAdminExists() {
  const adminCount = await this.adminModel.countDocuments();
  if (adminCount === 0) {
    const username = this.configService.get<string>('app.adminUsername');
    const password = this.configService.get<string>('app.adminPassword');
    // ...
  }
}
```

---

## 六、常见问题

### Q1: 如何手动运行种子数据？

**A**:

```bash
# 开发环境
pnpm run build && node dist/database/seeds/admin.seed.js

# 或者使用 ts-node
npx ts-node src/database/seeds/admin.seed.ts
```

### Q2: 如何重置管理员密码？

**A**: 直接在 MongoDB 中修改：

```javascript
db.admins.updateOne(
  { username: 'admin' },
  { $set: { passwordHash: '新的bcrypt哈希值' } }
)
```

### Q3: 如何添加更多统计数据？

**A**: 在 `AdminService` 中添加新的统计方法：

```typescript
async getRecentPosts(limit: number = 5) {
  return this.blogPostModel
    .find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('-content')
    .exec();
}
```

---

## 七、总结

### 所有完成的 Phase

| Phase | 模块 | 状态 |
|-------|------|------|
| 1 | 项目初始化 + 基础设施 | ✅ |
| 2 | Auth 模块（JWT 登录鉴权） | ✅ |
| 3 | Blog 模块（CRUD + 分页搜索） | ✅ |
| 4 | Guestbook 模块（留言板） | ✅ |
| 5 | Portfolio 模块（作品集） | ✅ |
| 6 | Chat 模块（Socket.IO 实时通信） | ✅ |
| 7 | Admin 统计模块 + 种子数据 | ✅ |

### API 端点汇总

| 模块 | 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|------|
| Auth | POST | `/api/auth/login` | 否 | 登录 |
| Auth | POST | `/api/auth/refresh` | JWT | 刷新 Token |
| Auth | GET | `/api/auth/profile` | JWT | 获取用户信息 |
| Blog | GET | `/api/posts` | 否 | 文章列表 |
| Blog | GET | `/api/posts/admin` | JWT | 管理员文章列表 |
| Blog | GET | `/api/posts/:id` | 否 | 文章详情 |
| Blog | POST | `/api/posts` | JWT | 创建文章 |
| Blog | PUT | `/api/posts/:id` | JWT | 更新文章 |
| Blog | DELETE | `/api/posts/:id` | JWT | 删除文章 |
| Guestbook | GET | `/api/guestbook` | 否 | 留言列表 |
| Guestbook | POST | `/api/guestbook` | 否 | 提交留言 |
| Guestbook | DELETE | `/api/guestbook/:id` | JWT | 删除留言 |
| Portfolio | GET | `/api/portfolio` | 否 | 作品列表 |
| Portfolio | GET | `/api/portfolio/:id` | 否 | 作品详情 |
| Portfolio | POST | `/api/portfolio` | JWT | 创建作品 |
| Portfolio | PUT | `/api/portfolio/:id` | JWT | 更新作品 |
| Portfolio | DELETE | `/api/portfolio/:id` | JWT | 删除作品 |
| Chat | GET | `/api/chat/messages` | 否 | 历史消息 |
| Chat | WS | `/chat` | 否 | WebSocket 聊天 |
| Admin | GET | `/api/admin/stats` | JWT | 仪表盘统计 |
