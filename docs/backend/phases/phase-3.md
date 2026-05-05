# Phase 3：Blog 模块（CRUD + 分页搜索）

**完成日期**：2026-05-05  
**状态**：✅ 已完成

---

## 一、本阶段目标

实现博客文章的完整 CRUD 操作，支持分页查询、分类筛选、关键词搜索。

### 主要任务

1. 创建 BlogPost Schema（博客文章数据模型）
2. 创建 DTO（CreatePostDto、UpdatePostDto、QueryPostDto）
3. 实现 Blog Service（业务逻辑）
4. 实现 Blog Controller（API 端点）
5. 创建 Blog Module
6. 测试所有接口

---

## 二、详细操作步骤

### 2.1 创建 BlogPost Schema

#### 创建 `src/modules/blog/schemas/blog-post.schema.ts`

**功能**：
- 定义博客文章数据模型
- 支持枚举类型（分类、状态）
- 自动生成 slug 和摘要

**数据结构**：

```typescript
{
  _id: string                    // 文章 ID
  title: string                  // 标题（必填）
  slug: string                   // URL 友好的标识符（自动生成）
  summary: string                // 摘要（自动生成）
  status: 'draft' | 'published'  // 状态
  publishedAt: Date              // 发布日期
  updatedAt: Date                // 更新日期
  viewCount: number              // 阅读量
  category: '前端' | '工程化' | 'AI 开发' | '随笔'  // 分类
  tags: string[]                 // 标签数组
  coverImage: string             // 封面图 URL
  content: string                // Markdown 正文
  authorId: string               // 作者 ID（关联 Admin）
  createdAt: Date                // 创建时间
}
```

**枚举定义**：

```typescript
export enum BlogCategory {
  FRONTEND = '前端',
  ENGINEERING = '工程化',
  AI_DEVELOPMENT = 'AI 开发',
  ESSAY = '随笔',
}

export enum BlogStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
}
```

**索引**：
- `slug`: 唯一索引
- `category + status`: 复合索引
- `publishedAt`: 降序索引
- `createdAt`: 降序索引

---

### 2.2 创建 DTO

#### 创建 `src/modules/blog/dto/create-post.dto.ts`

**字段验证**：

| 字段 | 类型 | 必填 | 验证规则 |
|------|------|------|----------|
| title | string | 是 | 1-200 字符 |
| slug | string | 否 | 最大 200 字符 |
| summary | string | 否 | 最大 300 字符 |
| status | enum | 否 | draft 或 published |
| category | enum | 是 | 前端/工程化/AI 开发/随笔 |
| tags | string[] | 否 | 字符串数组 |
| coverImage | string | 否 | 字符串 |
| content | string | 是 | 非空 |

#### 创建 `src/modules/blog/dto/update-post.dto.ts`

所有字段都是可选的，用于更新文章。

#### 创建 `src/modules/blog/dto/query-post.dto.ts`

继承 `PaginationDto`，添加筛选字段：

| 字段 | 类型 | 说明 |
|------|------|------|
| category | enum | 分类筛选 |
| status | enum | 状态筛选 |
| q | string | 关键词搜索 |

---

### 2.3 实现 Blog Service

#### 创建 `src/modules/blog/blog.service.ts`

**主要方法**：

```typescript
@Injectable()
export class BlogService {
  constructor(
    @InjectModel(BlogPost.name) private blogPostModel: Model<BlogPostDocument>,
  ) {}

  // 创建文章
  async create(createPostDto: CreatePostDto, authorId: string): Promise<BlogPostDocument>

  // 获取文章列表（公开，只返回已发布）
  async findAll(queryDto: QueryPostDto): Promise<PaginatedResponseDto<BlogPostDocument>>

  // 获取所有文章（管理员，包含草稿）
  async findAllAdmin(queryDto: QueryPostDto): Promise<PaginatedResponseDto<BlogPostDocument>>

  // 根据 ID 获取文章详情
  async findById(id: string): Promise<BlogPostDocument>

  // 根据 slug 获取文章详情
  async findBySlug(slug: string): Promise<BlogPostDocument>

  // 更新文章
  async update(id: string, updatePostDto: UpdatePostDto): Promise<BlogPostDocument>

  // 删除文章
  async remove(id: string): Promise<void>

  // 获取所有分类
  async getCategories(): Promise<string[]>

  // 生成 slug
  private generateSlug(title: string): string

  // 生成摘要
  private generateSummary(content: string): string
}
```

**关键功能**：

1. **自动生成 slug**：
   ```typescript
   private generateSlug(title: string): string {
     let slug = title
       .toLowerCase()
       .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
       .replace(/^-+|-+$/g, '');

     if (!slug) {
       slug = 'post-' + Date.now();
     }

     return slug;
   }
   ```

2. **自动生成摘要**：
   ```typescript
   private generateSummary(content: string): string {
     const plainText = content
       .replace(/#{1,6}\s+/g, '')
       .replace(/\*\*(.*?)\*\*/g, '$1')
       .replace(/\*(.*?)\*/g, '$1')
       .replace(/\[(.*?)\]\(.*?\)/g, '$1')
       .replace(/`{1,3}[^`]*`{1,3}/g, '')
       .replace(/\n+/g, ' ')
       .trim();

     if (plainText.length <= 150) {
       return plainText;
     }

     return plainText.substring(0, 150) + '...';
   }
   ```

3. **自动增加阅读量**：
   ```typescript
   async findById(id: string): Promise<BlogPostDocument> {
     const post = await this.blogPostModel.findById(id).exec();

     if (!post) {
       throw new NotFoundException(`文章 ID '${id}' 不存在`);
     }

     // 增加阅读量
     await this.blogPostModel.findByIdAndUpdate(id, { $inc: { viewCount: 1 } }).exec();
     post.viewCount += 1;

     return post;
   }
   ```

4. **分页查询**：
   ```typescript
   async findAll(queryDto: QueryPostDto): Promise<PaginatedResponseDto<BlogPostDocument>> {
     const { category, status, q, page, pageSize, skip, limit } = queryDto;

     const filter: FilterQuery<BlogPostDocument> = {};

     if (category) {
       filter.category = category;
     }

     if (status) {
       filter.status = status;
     } else {
       filter.status = BlogStatus.PUBLISHED;
     }

     if (q) {
       filter.$or = [
         { title: { $regex: q, $options: 'i' } },
         { summary: { $regex: q, $options: 'i' } },
         { content: { $regex: q, $options: 'i' } },
       ];
     }

     const [items, total] = await Promise.all([
       this.blogPostModel
         .find(filter)
         .sort({ publishedAt: -1, createdAt: -1 })
         .skip(skip)
         .limit(limit)
         .select('-content')
         .exec(),
       this.blogPostModel.countDocuments(filter).exec(),
     ]);

     return new PaginatedResponseDto(items, total, page || 1, pageSize || 10);
   }
   ```

---

### 2.4 实现 Blog Controller

#### 创建 `src/modules/blog/blog.controller.ts`

**API 端点**：

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| GET | `/api/posts` | 否 | 获取文章列表（只返回已发布） |
| GET | `/api/posts/admin` | JWT | 获取所有文章（包含草稿） |
| GET | `/api/posts/categories` | 否 | 获取所有分类 |
| GET | `/api/posts/:id` | 否 | 根据 ID 获取文章详情 |
| GET | `/api/posts/slug/:slug` | 否 | 根据 slug 获取文章详情 |
| POST | `/api/posts` | JWT | 创建文章 |
| PUT | `/api/posts/:id` | JWT | 更新文章 |
| DELETE | `/api/posts/:id` | JWT | 删除文章 |

**关键代码**：

```typescript
@ApiTags('blog')
@Controller('posts')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: '获取文章列表' })
  async findAll(@Query() queryDto: QueryPostDto): Promise<PaginatedResponseDto<BlogPost>> {
    return this.blogService.findAll(queryDto);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '创建文章' })
  async create(
    @Body() createPostDto: CreatePostDto,
    @CurrentUser() admin: AdminDocument,
  ): Promise<BlogPost> {
    return this.blogService.create(createPostDto, admin._id.toString());
  }
}
```

---

### 2.5 创建 Blog Module

#### 创建 `src/modules/blog/blog.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogController } from './blog.controller';
import { BlogService } from './blog.service';
import { BlogPost, BlogPostSchema } from './schemas/blog-post.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: BlogPost.name, schema: BlogPostSchema }]),
  ],
  controllers: [BlogController],
  providers: [BlogService],
  exports: [BlogService],
})
export class BlogModule {}
```

---

### 2.6 更新 App Module

#### 更新 `src/app.module.ts`

导入 BlogModule：

```typescript
import { BlogModule } from './modules/blog/blog.module';

@Module({
  imports: [
    // ... 其他模块
    AuthModule,
    BlogModule,
  ],
  // ...
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
│   │   └── blog/
│   │       ├── blog.module.ts               # Blog 模块定义
│   │       ├── blog.controller.ts           # 博客控制器
│   │       ├── blog.service.ts              # 博客服务
│   │       ├── dto/
│   │       │   ├── create-post.dto.ts       # 创建文章 DTO
│   │       │   ├── update-post.dto.ts       # 更新文章 DTO
│   │       │   └── query-post.dto.ts        # 查询文章 DTO
│   │       └── schemas/
│   │           └── blog-post.schema.ts      # 博客文章 Schema
│   └── common/
│       └── dto/
│           └── pagination.dto.ts            # 通用分页 DTO
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

### 4.2 启动服务

```bash
$ node dist/main.js

[Nest] INFO Mapped {/api/posts, GET} route
[Nest] INFO Mapped {/api/posts/admin, GET} route
[Nest] INFO Mapped {/api/posts/categories, GET} route
[Nest] INFO Mapped {/api/posts/:id, GET} route
[Nest] INFO Mapped {/api/posts/slug/:slug, GET} route
[Nest] INFO Mapped {/api/posts, POST} route
[Nest] INFO Mapped {/api/posts/:id, PUT} route
[Nest] INFO Mapped {/api/posts/:id, DELETE} route
```

### 4.3 测试创建文章接口

```bash
$ TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

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
```

**验证点**：
- ✅ 返回统一格式响应
- ✅ 自动生成 slug（`my-first-post`）
- ✅ 自动生成摘要（`Title This is content...`）
- ✅ 设置发布时间
- ✅ 关联作者 ID

### 4.4 测试获取文章列表接口

```bash
$ curl http://localhost:3001/api/posts

{
  "code": 200,
  "data": {
    "items": [
      {
        "_id": "69f98042e961a07aff0bce1f",
        "title": "My First Post",
        "slug": "my-first-post",
        "summary": "Title This is content...",
        "status": "published",
        "publishedAt": "2026-05-05T05:29:38.591Z",
        "viewCount": 0,
        "category": "前端",
        "tags": ["Vue", "TypeScript"],
        "authorId": "69f977fcbdf41ded731aa362",
        "createdAt": "2026-05-05T05:29:38.600Z",
        "updatedAt": "2026-05-05T05:29:38.600Z",
        "__v": 0
      }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 10,
    "totalPages": 1
  },
  "message": "success"
}
```

**验证点**：
- ✅ 返回分页数据结构
- ✅ 列表不包含正文（`content` 字段被过滤）
- ✅ 按发布时间降序排序

---

## 五、关键技术点

### 5.1 自动生成 slug

```typescript
private generateSlug(title: string): string {
  // 转小写，替换非字母数字中文为连字符
  let slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '');

  // 如果 slug 为空（例如纯中文标题），使用时间戳
  if (!slug) {
    slug = 'post-' + Date.now();
  }

  return slug;
}
```

**示例**：
- `My First Post` → `my-first-post`
- `Vue 3 性能优化` → `vue-3-性能优化`
- `🎉 新功能` → `post-1234567890`

### 5.2 自动生成摘要

```typescript
private generateSummary(content: string): string {
  // 移除 Markdown 标记
  const plainText = content
    .replace(/#{1,6}\s+/g, '') // 标题
    .replace(/\*\*(.*?)\*\*/g, '$1') // 粗体
    .replace(/\*(.*?)\*/g, '$1') // 斜体
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // 链接
    .replace(/`{1,3}[^`]*`{1,3}/g, '') // 代码
    .replace(/\n+/g, ' ') // 换行
    .trim();

  if (plainText.length <= 150) {
    return plainText;
  }

  return plainText.substring(0, 150) + '...';
}
```

### 5.3 分页查询

```typescript
const [items, total] = await Promise.all([
  this.blogPostModel
    .find(filter)
    .sort({ publishedAt: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .select('-content') // 列表不返回正文
    .exec(),
  this.blogPostModel.countDocuments(filter).exec(),
]);

return new PaginatedResponseDto(items, total, page || 1, pageSize || 10);
```

### 5.4 关键词搜索

```typescript
if (q) {
  filter.$or = [
    { title: { $regex: q, $options: 'i' } },
    { summary: { $regex: q, $options: 'i' } },
    { content: { $regex: q, $options: 'i' } },
  ];
}
```

**说明**：
- 使用 MongoDB 的 `$regex` 进行模糊匹配
- `$options: 'i'` 表示不区分大小写
- 在标题、摘要、正文中搜索

---

## 六、常见问题

### Q1: 如何修改每页数量？

**A**: 在请求中添加 `pageSize` 参数：

```bash
curl "http://localhost:3001/api/posts?pageSize=20"
```

### Q2: 如何按分类筛选？

**A**: 在请求中添加 `category` 参数：

```bash
curl "http://localhost:3001/api/posts?category=前端"
```

### Q3: 如何搜索文章？

**A**: 在请求中添加 `q` 参数：

```bash
curl "http://localhost:3001/api/posts?q=Vue"
```

### Q4: 如何获取草稿文章？

**A**: 使用管理员接口：

```bash
curl "http://localhost:3001/api/posts/admin?status=draft" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 七、下一步

Phase 4 将实现 Guestbook 模块，包括：
- 留言 Schema 设计
- 提交留言接口
- 留言列表接口
- 管理员删除接口
- 速率限制防刷
