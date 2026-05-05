# Phase 2：Auth 模块（JWT 登录鉴权）

**完成日期**：2026-05-05  
**状态**：✅ 已完成

---

## 一、本阶段目标

实现管理员认证系统，包括 JWT Token 生成、验证、刷新机制。

### 主要任务

1. 创建 Admin Schema（管理员数据模型）
2. 实现 JWT 认证策略
3. 实现登录接口
4. 实现 Token 刷新机制
5. 创建 JWT 守卫
6. 创建 CurrentUser 装饰器
7. 创建种子数据脚本

---

## 二、详细操作步骤

### 2.1 创建 Admin Schema

#### 创建 `src/modules/auth/schemas/admin.schema.ts`

**功能**：
- 定义管理员数据模型
- 自动排除密码字段（JSON 序列化时）
- 创建唯一索引

**关键代码**：

```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type AdminDocument = Admin & Document;

@Schema({
  timestamps: true,
  collection: 'admins',
  toJSON: {
    transform: (_doc: any, ret: any) => {
      delete ret.passwordHash;
      delete ret.__v;
      return ret;
    },
  },
})
export class {
  @ApiProperty({ description: '管理员 ID' })
  _id: string;

  @Prop({ required: true, unique: true, trim: true })
  @ApiProperty({ description: '用户名', example: 'admin' })
  username: string;

  @Prop({ required: true, select: false })
  passwordHash: string;

  @Prop({ default: 'admin', enum: ['admin'] })
  @ApiProperty({ description: '角色', example: 'admin' })
  role: string;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  updatedAt: Date;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);

// 创建索引
AdminSchema.index({ username: 1 }, { unique: true });
```

**重要说明**：
- `select: false` 确保密码哈希不会在查询中返回
- `toJSON.transform` 在序列化时自动删除敏感字段
- 使用 `@ApiProperty()` 装饰器支持 Swagger 文档

---

### 2.2 创建 DTO

#### 创建 `src/modules/auth/dto/login.dto.ts`

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: '用户名',
    example: 'admin',
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  username: string;

  @ApiProperty({
    description: '密码',
    example: 'admin123',
    minLength: 6,
    maxLength: 100,
  })
  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password: string;
}
```

#### 创建 `src/modules/auth/dto/login-response.dto.ts`

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({ description: 'JWT 访问令牌' })
  accessToken: string;

  @ApiProperty({ description: '过期时间（秒）', example: 604800 })
  expiresIn: number;

  @ApiProperty({ description: '令牌类型', example: 'Bearer' })
  tokenType: string;
}
```

---

### 2.3 实现 JWT 策略

#### 创建 `src/modules/auth/strategies/jwt.strategy.ts`

**功能**：
- 从 Authorization Header 提取 JWT Token
- 验证 Token 签名和过期时间
- 解析 Token 负载并返回用户信息

**关键代码**：

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Admin, AdminDocument } from '../schemas/admin.schema';

export interface JwtPayload {
  sub: string;
  username: string;
  role: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('app.jwtSecret'),
    });
  }

  async validate(payload: JwtPayload): Promise<AdminDocument> {
    const { sub: id } = payload;

    const admin = await this.adminModel.findById(id).select('+passwordHash');

    if (!admin) {
      throw new UnauthorizedException('用户不存在或已被删除');
    }

    return admin;
  }
}
```

**JWT 负载结构**：

```typescript
{
  sub: "管理员ID",
  username: "admin",
  role: "admin",
  iat: 1234567890,  // 签发时间
  exp: 1234567890   // 过期时间
}
```

---

### 2.4 实现 Auth Service

#### 创建 `src/modules/auth/auth.service.ts`

**功能**：
- 模块初始化时自动创建默认管理员
- 管理员登录验证
- JWT Token 生成和刷新
- 密码加密（bcryptjs）

**关键方法**：

```typescript
@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * 模块初始化时检查是否需要创建默认管理员
   */
  async onModuleInit() {
    await this.ensureAdminExists();
  }

  /**
   * 确保存在管理员账户
   */
  private async ensureAdminExists() {
    const adminCount = await this.adminModel.countDocuments();

    if (adminCount === 0) {
      const username = this.configService.get<string>('app.adminUsername');
      const password = this.configService.get<string>('app.adminPassword');

      if (!username || !password) {
        this.logger.warn(
          'ADMIN_USERNAME or ADMIN_PASSWORD not set, skipping default admin creation',
        );
        return;
      }

      const passwordHash = await bcrypt.hash(password, 10);

      await this.adminModel.create({
        username,
        passwordHash,
        role: 'admin',
      });

      this.logger.log(`Default admin user '${username}' created`);
    }
  }

  /**
   * 管理员登录
   */
  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const { username, password } = loginDto;

    // 查找管理员（包含密码字段）
    const admin = await this.adminModel
      .findOne({ username })
      .select('+passwordHash');

    if (!admin) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 生成 JWT
    const payload: JwtPayload = {
      sub: admin._id.toString(),
      username: admin.username,
      role: admin.role,
    };

    const expiresIn = this.configService.get<string>('app.jwtExpiresIn', '7d');
    const expiresInMs = this.parseExpiresIn(expiresIn);

    const accessToken = this.jwtService.sign(payload, {
      expiresIn,
    });

    this.logger.log(`Admin '${username}' logged in successfully`);

    return {
      accessToken,
      expiresIn: expiresInMs,
      tokenType: 'Bearer',
    };
  }

  /**
   * 刷新 Token
   */
  async refreshToken(admin: AdminDocument): Promise<LoginResponseDto> {
    const payload: JwtPayload = {
      sub: admin._id.toString(),
      username: admin.username,
      role: admin.role,
    };

    const expiresIn = this.configService.get<string>('app.jwtExpiresIn', '7d');
    const expiresInMs = this.parseExpiresIn(expiresIn);

    const accessToken = this.jwtService.sign(payload, {
      expiresIn,
    });

    return {
      accessToken,
      expiresIn: expiresInMs,
      tokenType: 'Bearer',
    };
  }

  /**
   * 获取管理员信息
   */
  async getProfile(admin: AdminDocument) {
    return {
      id: admin._id,
      username: admin.username,
      role: admin.role,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
    };
  }

  /**
   * 解析过期时间字符串为毫秒数
   */
  private parseExpiresIn(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);

    if (!match) {
      return 7 * 24 * 60 * 60 * 1000; // 默认 7 天
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value * 1000;
      case 'm':
        return value * 60 * 1000;
      case 'h':
        return value * 60 * 60 * 1000;
      case 'd':
        return value * 24 * 60 * 60 * 1000;
      default:
        return 7 * 24 * 60 * 60 * 1000;
    }
  }
}
```

**密码加密**：
- 使用 `bcryptjs`（纯 JavaScript 实现，无需原生编译）
- 盐值轮数：10
- 自动在 `onModuleInit` 时创建默认管理员

---

### 2.5 实现 Auth Controller

#### 创建 `src/modules/auth/auth.controller.ts`

**功能**：
- 定义认证相关 API 端点
- 使用 Swagger 装饰器生成文档
- 应用 JWT 守卫保护需要认证的接口

**API 端点**：

```typescript
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '管理员登录' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: '登录成功',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: '用户名或密码错误',
  })
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '刷新 Token' })
  @ApiResponse({
    status: 200,
    description: '刷新成功',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: '未授权',
  })
  async refreshToken(
    @CurrentUser() admin: AdminDocument,
  ): Promise<LoginResponseDto> {
    return this.authService.refreshToken(admin);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '获取当前管理员信息' })
  @ApiResponse({
    status: 200,
    description: '成功获取管理员信息',
  })
  @ApiResponse({
    status: 401,
    description: '未授权',
  })
  async getProfile(@CurrentUser() admin: AdminDocument) {
    return this.authService.getProfile(admin);
  }
}
```

**路由说明**：

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| POST | `/api/auth/login` | 否 | 管理员登录 |
| POST | `/api/auth/refresh` | JWT | 刷新 Token |
| GET | `/api/auth/profile` | JWT | 获取当前管理员信息 |

---

### 2.6 创建 JWT 守卫

#### 创建 `src/common/guards/jwt-auth.guard.ts`

**功能**：
- 验证 JWT Token
- 支持 `@Public()` 装饰器跳过认证
- 统一处理认证错误

**关键代码**：

```typescript
import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('请先登录');
    }
    return user;
  }
}
```

---

### 2.7 创建装饰器

#### 创建 `src/common/decorators/current-user.decorator.ts`

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (data) {
      return user?.[data];
    }

    return user;
  },
);
```

#### 创建 `src/common/decorators/public.decorator.ts`

```typescript
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

---

### 2.8 创建 Auth 模块

#### 创建 `src/modules/auth/auth.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { Admin, AdminSchema } from './schemas/admin.schema';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('app.jwtSecret'),
        signOptions: {
          expiresIn: configService.get<string>('app.jwtExpiresIn', '7d'),
        },
      }),
    }),
    MongooseModule.forFeature([{ name: Admin.name, schema: AdminSchema }]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
```

---

### 2.9 更新 App Module

#### 更新 `src/app.module.ts`

导入 AuthModule：

```typescript
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    // ... 其他模块
    AuthModule,
  ],
  // ...
})
export class AppModule {}
```

---

### 2.10 创建种子数据脚本

#### 创建 `src/database/seeds/admin.seed.ts`

```typescript
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from '../../app.module';
import { AuthService } from '../../modules/auth/auth.service';

async function seed() {
  const logger = new Logger('Seed');

  try {
    logger.log('Starting database seeding...');

    const app = await NestFactory.createApplicationContext(AppModule);

    // AuthService.onModuleInit() 会自动创建默认管理员
    const authService = app.get(AuthService);

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

---

## 三、项目结构

```
timeshards-backend/
├── src/
│   ├── modules/
│   │   └── auth/
│   │       ├── auth.module.ts               # Auth 模块定义
│   │       ├── auth.controller.ts           # 认证控制器
│   │       ├── auth.service.ts              # 认证服务
│   │       ├── dto/
│   │       │   ├── login.dto.ts             # 登录请求 DTO
│   │       │   └── login-response.dto.ts    # 登录响应 DTO
│   │       ├── schemas/
│   │       │   └── admin.schema.ts          # 管理员 Schema
│   │       └── strategies/
│   │           └── jwt.strategy.ts          # JWT 策略
│   ├── common/
│   │   ├── guards/
│   │   │   └── jwt-auth.guard.ts            # JWT 守卫
│   │   └── decorators/
│   │       ├── current-user.decorator.ts    # 获取当前用户装饰器
│   │       └── public.decorator.ts          # 公开接口装饰器
│   └── database/
│       └── seeds/
│           └── admin.seed.ts                # 种子数据脚本
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

[Nest] INFO [2026-05-05 13:08:05.029 +0800] Starting Nest application...
[Nest] INFO [2026-05-05 13:08:05.030 +0800] AuthModule dependencies initialized
[Nest] INFO [2026-05-05 13:08:05.030 +0800] Mapped {/api/auth/login, POST} route
[Nest] INFO [2026-05-05 13:08:05.030 +0800] Mapped {/api/auth/refresh, POST} route
[Nest] INFO [2026-05-05 13:08:05.030 +0800] Mapped {/api/auth/profile, GET} route
[Nest] INFO [2026-05-05 13:08:05.030 +0800] Application is running on: http://localhost:3001
[Nest] INFO [2026-05-05 13:08:05.030 +0800] Swagger docs: http://localhost:3001/api/docs
```

### 4.3 测试登录接口

```bash
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
```

**验证点**：
- ✅ 返回统一格式响应
- ✅ 包含 JWT Token
- ✅ 过期时间为 7 天（604800000 毫秒）

### 4.4 测试获取管理员信息接口

```bash
$ TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

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

**验证点**：
- ✅ JWT Token 验证成功
- ✅ 返回管理员信息
- ✅ 密码字段未返回（select: false）

---

## 五、关键技术点

### 5.1 JWT 认证流程

```
┌─────────────┐    POST /api/auth/login     ┌─────────────┐
│             │ ──────────────────────────── >│             │
│   Client    │    { username, password }    │   Server    │
│             │ <────────────────────────────│             │
└─────────────┘    { accessToken, expiresIn }└─────────────┘
       │                                          │
       │  GET /api/auth/profile                   │
       │  Authorization: Bearer <token>           │
       │ ──────────────────────────────────────── >│
       │                                          │
       │  { id, username, role, ... }             │
       │ <────────────────────────────────────────│
```

### 5.2 密码加密

- 使用 `bcryptjs`（纯 JavaScript 实现）
- 盐值轮数：10
- 哈希算法：bcrypt

```typescript
// 加密
const passwordHash = await bcrypt.hash(password, 10);

// 验证
const isValid = await bcrypt.compare(password, passwordHash);
```

### 5.3 默认管理员创建

应用启动时自动检查并创建默认管理员：

```typescript
async onModuleInit() {
  await this.ensureAdminExists();
}

private async ensureAdminExists() {
  const adminCount = await this.adminModel.countDocuments();

  if (adminCount === 0) {
    const username = this.configService.get<string>('app.adminUsername');
    const password = this.configService.get<string>('app.adminPassword');

    if (!username || !password) {
      this.logger.warn('ADMIN_USERNAME or ADMIN_PASSWORD not set');
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await this.adminModel.create({
      username,
      passwordHash,
      role: 'admin',
    });

    this.logger.log(`Default admin user '${username}' created`);
  }
}
```

### 5.4 JWT 守卫与 @Public() 装饰器

**工作原理**：

1. `JwtAuthGuard` 继承自 `AuthGuard('jwt')`
2. 在 `canActivate` 方法中检查是否有 `@Public()` 装饰器
3. 如果有 `@Public()`，直接返回 `true`（跳过认证）
4. 否则调用父类的 `canActivate` 进行 JWT 验证

**使用方式**：

```typescript
// 需要认证的接口
@Post('refresh')
@UseGuards(JwtAuthGuard)
async refreshToken(@CurrentUser() admin: AdminDocument) {
  // ...
}

// 公开接口
@Post('login')
@Public()
async login(@Body() loginDto: LoginDto) {
  // ...
}
```

---

## 六、常见问题

### Q1: bcrypt 安装失败怎么办？

**A**: 使用 `bcryptjs` 替代 `bcrypt`，它是纯 JavaScript 实现，无需原生编译。

```bash
pnpm add bcryptjs
```

然后修改 import：

```typescript
// 原来
import * as bcrypt from 'bcrypt';

// 改为
import * as bcrypt from 'bcryptjs';
```

### Q2: 如何修改 JWT 过期时间？

**A**: 修改 `.env` 文件中的 `JWT_EXPIRES_IN` 变量：

```env
# 7 天
JWT_EXPIRES_IN=7d

# 1 小时
JWT_EXPIRES_IN=1h

# 30 分钟
JWT_EXPIRES_IN=30m
```

### Q3: 如何添加更多管理员？

**A**: 直接在 MongoDB 中插入文档，或创建一个新的 API 端点。

---

## 七、下一步

Phase 3 将实现 Blog 模块，包括：
- BlogPost Schema 设计
- CRUD 接口
- 分页查询
- 分类筛选
- 关键词搜索
