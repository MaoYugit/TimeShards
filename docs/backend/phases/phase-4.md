# Phase 4：Guestbook 模块（留言板）

**完成日期**：2026-05-05  
**状态**：✅ 已完成

---

## 一、本阶段目标

实现留言板功能，支持访客提交留言、查看留言列表，管理员删除留言，并添加速率限制防刷。

### 主要任务

1. 创建 GuestbookEntry Schema（留言数据模型）
2. 创建 DTO（CreateGuestbookDto、QueryGuestbookDto）
3. 实现 Guestbook Service（业务逻辑）
4. 实现 Guestbook Controller（API 端点）
5. 创建 Guestbook Module
6. 添加速率限制

---

## 二、详细操作步骤

### 2.1 创建 GuestbookEntry Schema

#### 创建 `src/modules/guestbook/schemas/guestbook-entry.schema.ts`

**数据结构**：

```typescript
{
  _id: string           // 留言 ID
  name: string          // 昵称（必填，1-32 字）
  email: string         // 邮箱（可选）
  website: string       // 个人网站（可选）
  content: string       // 留言内容（必填，1-2000 字）
  ip: string            // IP 地址（自动记录）
  userAgent: string     // User-Agent（自动记录）
  createdAt: Date       // 创建时间
  updatedAt: Date       // 更新时间
}
```

**索引**：
- `createdAt`: 降序索引（按时间倒序）

---

### 2.2 创建 DTO

#### 创建 `src/modules/guestbook/dto/create-guestbook.dto.ts`

**字段验证**：

| 字段 | 类型 | 必填 | 验证规则 |
|------|------|------|----------|
| name | string | 是 | 1-32 字符 |
| email | string | 否 | 邮箱格式 |
| website | string | 否 | URL 格式 |
| content | string | 是 | 1-2000 字符 |

#### 创建 `src/modules/guestbook/dto/query-guestbook.dto.ts`

继承 `PaginationDto`，支持分页查询。

---

### 2.3 实现 Guestbook Service

#### 创建 `src/modules/guestbook/guestbook.service.ts`

**主要方法**：

```typescript
@Injectable()
export class GuestbookService {
  // 创建留言
  async create(createGuestbookDto: CreateGuestbookDto, ip?: string, userAgent?: string): Promise<GuestbookEntryDocument>

  // 获取留言列表（分页）
  async findAll(queryDto: QueryGuestbookDto): Promise<PaginatedResponseDto<GuestbookEntryDocument>>

  // 删除留言（管理员）
  async remove(id: string): Promise<void>

  // 获取留言总数
  async count(): Promise<number>
}
```

**关键功能**：

1. **自动记录 IP 和 User-Agent**：
   ```typescript
   async create(createGuestbookDto: CreateGuestbookDto, ip?: string, userAgent?: string) {
     const entry = new this.guestbookModel({
       ...createGuestbookDto,
       ip,
       userAgent,
     });
     return entry.save();
   }
   ```

2. **分页查询**：
   ```typescript
   async findAll(queryDto: QueryGuestbookDto) {
     const { page, pageSize, skip, limit } = queryDto;
     const [items, total] = await Promise.all([
       this.guestbookModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
       this.guestbookModel.countDocuments().exec(),
     ]);
     return new PaginatedResponseDto(items, total, page || 1, pageSize || 10);
   }
   ```

---

### 2.4 实现 Guestbook Controller

#### 创建 `src/modules/guestbook/guestbook.controller.ts`

**API 端点**：

| 方法 | 路径 | 认证 | 限流 | 说明 |
|------|------|------|------|------|
| GET | `/api/guestbook` | 否 | 通用 | 获取留言列表 |
| POST | `/api/guestbook` | 否 | 3次/分钟 | 提交留言 |
| DELETE | `/api/guestbook/:id` | JWT | 通用 | 删除留言 |

**关键代码**：

```typescript
@ApiTags('guestbook')
@Controller('guestbook')
export class GuestbookController {
  @Get()
  @Public()
  @ApiOperation({ summary: '获取留言列表' })
  async findAll(@Query() queryDto: QueryGuestbookDto) {
    return this.guestbookService.findAll(queryDto);
  }

  @Post()
  @Public()
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 每分钟最多 3 条
  @ApiOperation({ summary: '提交留言' })
  async create(@Body() createGuestbookDto: CreateGuestbookDto, @Req() req: Request) {
    const ip = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    return this.guestbookService.create(createGuestbookDto, ip, userAgent);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '删除留言' })
  async remove(@Param('id') id: string) {
    await this.guestbookService.remove(id);
    return { success: true };
  }
}
```

---

### 2.5 创建 Guestbook Module

#### 创建 `src/modules/guestbook/guestbook.module.ts`

```typescript
@Module({
  imports: [
    MongooseModule.forFeature([{ name: GuestbookEntry.name, schema: GuestbookEntrySchema }]),
  ],
  controllers: [GuestbookController],
  providers: [GuestbookService],
  exports: [GuestbookService],
})
export class GuestbookModule {}
```

---

### 2.6 更新 App Module

#### 更新 `src/app.module.ts`

```typescript
import { GuestbookModule } from './modules/guestbook/guestbook.module';

@Module({
  imports: [
    // ... 其他模块
    AuthModule,
    BlogModule,
    GuestbookModule,  // 新增
  ],
})
export class AppModule {}
```

---

## 三、项目结构

```
timeshards-backend/
├── src/
│   ├── modules/
│   │   ├── auth/
│   │   ├── blog/
│   │   └── guestbook/
│   │       ├── guestbook.module.ts
│   │       ├── guestbook.controller.ts
│   │       ├── guestbook.service.ts
│   │       ├── dto/
│   │       │   ├── create-guestbook.dto.ts
│   │       │   └── query-guestbook.dto.ts
│   │       └── schemas/
│   │           └── guestbook-entry.schema.ts
│   └── ...
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

### 4.2 测试获取留言列表

```bash
$ curl http://localhost:3001/api/guestbook

{
  "code": 200,
  "data": {
    "items": [],
    "total": 0,
    "page": 1,
    "pageSize": 10,
    "totalPages": 0
  },
  "message": "success"
}
```

### 4.3 测试提交留言

```bash
$ curl -X POST http://localhost:3001/api/guestbook \
  -H "Content-Type: application/json" \
  -d '{"name":"测试用户","content":"这是一条测试留言","email":"test@example.com"}'

{
  "code": 200,
  "data": {
    "name": "测试用户",
    "email": "test@example.com",
    "content": "这是一条测试留言",
    "ip": "::1",
    "userAgent": "curl/8.14.1",
    "_id": "69f9e8692973a68472df4a1a",
    "createdAt": "2026-05-05T12:54:01.019Z",
    "updatedAt": "2026-05-05T12:54:01.019Z",
    "__v": 0
  },
  "message": "success"
}
```

**验证点**：
- ✅ 返回统一格式响应
- ✅ 自动记录 IP 地址
- ✅ 自动记录 User-Agent

### 4.4 测试速率限制

```bash
# 快速发送 4 条留言
$ for i in {1..4}; do
  curl -X POST http://localhost:3001/api/guestbook \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"用户$i\",\"content\":\"留言$i\"}"
done

# 第 4 条应该返回 429 错误
{"code":429,"data":null,"message":"ThrottlerException: Too Many Requests","error":"Too Many Requests"}
```

---

## 五、关键技术点

### 5.1 速率限制

使用 `@nestjs/throttler` 的 `@Throttle` 装饰器：

```typescript
@Post()
@Public()
@Throttle({ default: { limit: 3, ttl: 60000 } }) // 每分钟最多 3 条
async create(...) {
  // ...
}
```

**参数说明**：
- `limit`: 在时间窗口内允许的最大请求数
- `ttl`: 时间窗口（毫秒）

### 5.2 获取客户端 IP

```typescript
@Req() req: Request

const ip = req.ip || req.socket.remoteAddress;
const userAgent = req.headers['user-agent'];
```

### 5.3 记录 IP 和 User-Agent

在 Schema 中添加字段，创建留言时自动填充：

```typescript
@Prop()
ip: string;

@Prop()
userAgent: string;
```

---

## 六、常见问题

### Q1: 如何修改速率限制？

**A**: 修改 `@Throttle` 装饰器的参数：

```typescript
// 每分钟最多 5 条
@Throttle({ default: { limit: 5, ttl: 60000 } })

// 每小时最多 10 条
@Throttle({ default: { limit: 10, ttl: 3600000 } })
```

### Q2: 如何跳过速率限制？

**A**: 使用 `@SkipThrottle()` 装饰器：

```typescript
@Get()
@SkipThrottle()
async findAll() {
  // ...
}
```

### Q3: 如何获取真实 IP（反向代理）？

**A**: 在 `main.ts` 中启用信任代理：

```typescript
app.set('trust proxy', 1);
```

---

## 七、下一步

Phase 5 将实现 Portfolio 模块，包括：
- 作品集 Schema 设计
- CRUD 接口
- 排序功能
