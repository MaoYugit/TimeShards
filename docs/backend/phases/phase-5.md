# Phase 5：Portfolio 模块（作品集）

**完成日期**：2026-05-05  
**状态**：✅ 已完成

---

## 一、本阶段目标

实现作品集管理功能，支持作品的 CRUD 操作，按排序权重展示。

### 主要任务

1. 创建 PortfolioProject Schema（作品数据模型）
2. 创建 DTO（CreatePortfolioDto、UpdatePortfolioDto）
3. 实现 Portfolio Service（业务逻辑）
4. 实现 Portfolio Controller（API 端点）
5. 创建 Portfolio Module

---

## 二、详细操作步骤

### 2.1 创建 PortfolioProject Schema

#### 创建 `src/modules/portfolio/schemas/portfolio-project.schema.ts`

**数据结构**：

```typescript
{
  _id: string              // 作品 ID
  title: string            // 项目名称（必填）
  period: string           // 时间段
  summary: string          // 项目简介
  tags: string[]           // 技术标签
  links: [{                // 项目链接
    label: string
    href: string
  }]
  image: string            // 展示图 URL
  showcaseNote: string     // 图片说明
  sortOrder: number        // 排序权重（默认 0）
  createdAt: Date          // 创建时间
  updatedAt: Date          // 更新时间
}
```

**索引**：
- `sortOrder`: 降序索引（按排序权重排序）
- `createdAt`: 降序索引

---

### 2.2 创建 DTO

#### 创建 `src/modules/portfolio/dto/create-portfolio.dto.ts`

**字段验证**：

| 字段 | 类型 | 必填 | 验证规则 |
|------|------|------|----------|
| title | string | 是 | 最大 200 字符 |
| period | string | 否 | 最大 50 字符 |
| summary | string | 否 | 最大 500 字符 |
| tags | string[] | 否 | 字符串数组 |
| links | ProjectLinkDto[] | 否 | 链接对象数组 |
| image | string | 否 | URL |
| showcaseNote | string | 否 | 最大 200 字符 |
| sortOrder | number | 否 | 数字 |

**ProjectLinkDto**：
```typescript
class ProjectLinkDto {
  label: string  // 链接标签
  href: string   // 链接地址
}
```

#### 创建 `src/modules/portfolio/dto/update-portfolio.dto.ts`

所有字段都是可选的，用于更新作品。

---

### 2.3 实现 Portfolio Service

#### 创建 `src/modules/portfolio/portfolio.service.ts`

**主要方法**：

```typescript
@Injectable()
export class PortfolioService {
  // 创建作品
  async create(createPortfolioDto: CreatePortfolioDto): Promise<PortfolioProjectDocument>

  // 获取作品列表（按排序权重降序）
  async findAll(): Promise<PortfolioProjectDocument[]>

  // 根据 ID 获取作品详情
  async findById(id: string): Promise<PortfolioProjectDocument>

  // 更新作品
  async update(id: string, updatePortfolioDto: UpdatePortfolioDto): Promise<PortfolioProjectDocument>

  // 删除作品
  async remove(id: string): Promise<void>

  // 获取作品总数
  async count(): Promise<number>
}
```

**关键功能**：

1. **按排序权重排序**：
   ```typescript
   async findAll(): Promise<PortfolioProjectDocument[]> {
     return this.portfolioModel
       .find()
       .sort({ sortOrder: -1, createdAt: -1 })
       .exec();
   }
   ```

---

### 2.4 实现 Portfolio Controller

#### 创建 `src/modules/portfolio/portfolio.controller.ts`

**API 端点**：

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| GET | `/api/portfolio` | 否 | 获取作品列表 |
| GET | `/api/portfolio/:id` | 否 | 获取作品详情 |
| POST | `/api/portfolio` | JWT | 创建作品 |
| PUT | `/api/portfolio/:id` | JWT | 更新作品 |
| DELETE | `/api/portfolio/:id` | JWT | 删除作品 |

---

### 2.5 创建 Portfolio Module

#### 创建 `src/modules/portfolio/portfolio.module.ts`

```typescript
@Module({
  imports: [
    MongooseModule.forFeature([{ name: PortfolioProject.name, schema: PortfolioProjectSchema }]),
  ],
  controllers: [PortfolioController],
  providers: [PortfolioService],
  exports: [PortfolioService],
})
export class PortfolioModule {}
```

---

### 2.6 更新 App Module

#### 更新 `src/app.module.ts`

```typescript
import { PortfolioModule } from './modules/portfolio/portfolio.module';

@Module({
  imports: [
    // ... 其他模块
    AuthModule,
    BlogModule,
    GuestbookModule,
    PortfolioModule,  // 新增
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
│   │   ├── guestbook/
│   │   └── portfolio/
│   │       ├── portfolio.module.ts
│   │       ├── portfolio.controller.ts
│   │       ├── portfolio.service.ts
│   │       ├── dto/
│   │       │   ├── create-portfolio.dto.ts
│   │       │   └── update-portfolio.dto.ts
│   │       └── schemas/
│   │           └── portfolio-project.schema.ts
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

### 4.2 测试获取作品列表

```bash
$ curl http://localhost:3001/api/portfolio

{
  "code": 200,
  "data": [],
  "message": "success"
}
```

### 4.3 测试创建作品

```bash
$ TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

$ curl -X POST http://localhost:3001/api/portfolio \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"TimeShards","period":"2024","summary":"个人博客系统","tags":["Vue","NestJS","MongoDB"],"sortOrder":1}'

{
  "code": 200,
  "data": {
    "title": "TimeShards",
    "period": "2024",
    "summary": "个人博客系统",
    "tags": ["Vue", "NestJS", "MongoDB"],
    "sortOrder": 1,
    "links": [],
    "_id": "69f9eb860d7355132f6c8cf6",
    "createdAt": "2026-05-05T13:07:18.646Z",
    "updatedAt": "2026-05-05T13:07:18.646Z",
    "__v": 0
  },
  "message": "success"
}
```

**验证点**：
- ✅ 返回统一格式响应
- ✅ 支持技术标签数组
- ✅ 支持排序权重

---

## 五、关键技术点

### 5.1 排序权重

使用 `sortOrder` 字段控制作品展示顺序：

```typescript
// 按排序权重降序，创建时间降序
.sort({ sortOrder: -1, createdAt: -1 })
```

**使用方式**：
- `sortOrder` 值越大越靠前
- 默认值为 0
- 相同 `sortOrder` 时按创建时间倒序

### 5.2 嵌套对象数组

使用 `@nestjs/mongoose` 的嵌套 Schema 支持：

```typescript
@Prop({ type: [{ label: String, href: String }], default: [] })
links: ProjectLink[];
```

在 DTO 中使用 `@ValidateNested` 和 `@Type` 进行验证：

```typescript
@IsArray()
@ValidateNested({ each: true })
@Type(() => ProjectLinkDto)
links?: ProjectLinkDto[];
```

---

## 六、常见问题

### Q1: 如何调整作品顺序？

**A**: 修改 `sortOrder` 字段值：

```bash
curl -X PUT http://localhost:3001/api/portfolio/作品ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"sortOrder": 10}'
```

### Q2: 如何添加项目链接？

**A**: 在创建或更新时传入 `links` 数组：

```json
{
  "title": "TimeShards",
  "links": [
    { "label": "GitHub", "href": "https://github.com/..." },
    { "label": "在线演示", "href": "https://demo.example.com" }
  ]
}
```

### Q3: 如何获取单个作品详情？

**A**: 使用 GET 请求：

```bash
curl http://localhost:3001/api/portfolio/作品ID
```

---

## 七、下一步

Phase 6 将实现 Chat 模块，包括：
- Socket.IO 网关
- WebSocket 认证
- 消息存储
- 历史消息查询
