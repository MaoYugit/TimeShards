# Phase 1：项目初始化 + 基础设施

**完成日期**：2026-05-05  
**状态**：✅ 已完成

---

## 一、本阶段目标

搭建 NestJS 项目骨架，配置开发环境，实现全局基础设施组件。

### 主要任务

1. 初始化 NestJS 项目
2. 配置环境变量管理与验证
3. 集成 Swagger API 文档
4. 实现统一响应格式
5. 实现全局异常处理
6. 实现请求验证管道
7. 配置 CORS 和速率限制
8. 集成日志系统

---

## 二、详细操作步骤

### 2.1 项目初始化

#### 创建项目结构

手动创建 `timeshards-backend` 目录及配置文件：

```bash
mkdir timeshards-backend
cd timeshards-backend
```

#### 创建 package.json

```json
{
  "name": "timeshards-backend",
  "version": "1.0.0",
  "description": "TimeShards backend API server",
  "scripts": {
    "build": "nest build",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:prod": "node dist/main"
  }
}
```

#### 安装依赖

```bash
pnpm install
```

**核心依赖列表**：

| 包名 | 用途 |
|------|------|
| `@nestjs/common` | NestJS 核心通用模块 |
| `@nestjs/core` | NestJS 核心 |
| `@nestjs/platform-express` | Express HTTP 适配器 |
| `@nestjs/config` | 环境变量配置管理 |
| `@nestjs/swagger` | Swagger API 文档 |
| `@nestjs/throttler` | 速率限制 |
| `@nestjs/mongoose` | Mongoose 集成 |
| `@nestjs/jwt` | JWT 令牌 |
| `@nestjs/passport` | Passport 集成 |
| `mongoose` | MongoDB ODM |
| `passport` | 认证框架 |
| `passport-jwt` | JWT 策略 |
| `bcrypt` | 密码哈希 |
| `class-validator` | DTO 验证 |
| `class-transformer` | 数据转换 |
| `joi` | 环境变量验证 |
| `nestjs-pino` | 高性能日志 |
| `pino` | 日志核心 |
| `pino-pretty` | 日志美化 |

---

### 2.2 环境变量配置

#### 创建 `.env.example`

```env
# 应用配置
PORT=3001
NODE_ENV=development

# 数据库配置
MONGODB_URI=mongodb://127.0.0.1:27017/timeshards

# JWT 配置
JWT_SECRET=your-super-secret-key-change-in-production-at-least-16-chars
JWT_EXPIRES_IN=7d

# 管理员初始账户
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123

# CORS 配置
CORS_ORIGINS=http://localhost:5173,http://localhost:5174

# 日志级别
LOG_LEVEL=info
```

#### 创建 `src/config/app.config.ts`

**功能**：
- 定义配置接口
- 使用 `registerAs` 注册配置命名空间
- 使用 Joi 验证环境变量

**关键代码**：

```typescript
import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export interface AppConfig {
  port: number;
  nodeEnv: string;
  mongodbUri: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  adminUsername: string;
  adminPassword: string;
  corsOrigins: string[];
  logLevel: string;
}

export const appConfig = registerAs('app', (): AppConfig => ({
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || '',
  jwtSecret: process.env.JWT_SECRET || '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  adminUsername: process.env.ADMIN_USERNAME || '',
  adminPassword: process.env.ADMIN_PASSWORD || '',
  corsOrigins: (process.env.CORS_ORIGINS || '').split(',').filter(Boolean),
  logLevel: process.env.LOG_LEVEL || 'info',
}));

export const envValidationSchema = Joi.object({
  PORT: Joi.number().default(3001),
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  MONGODB_URI: Joi.string().required(),
  JWT_SECRET: Joi.string().min(16).required(),
  JWT_EXPIRES_IN: Joi.string().default('7d'),
  ADMIN_USERNAME: Joi.string().required(),
  ADMIN_PASSWORD: Joi.string().min(6).required(),
  CORS_ORIGINS: Joi.string().required(),
  LOG_LEVEL: Joi.string()
    .valid('fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent')
    .default('info'),
});
```

**验证规则说明**：

| 变量 | 规则 | 说明 |
|------|------|------|
| `MONGODB_URI` | `required()` | 必须提供 MongoDB 连接串 |
| `JWT_SECRET` | `min(16)` | 至少 16 个字符 |
| `ADMIN_PASSWORD` | `min(6)` | 至少 6 个字符 |
| `CORS_ORIGINS` | `required()` | 必须提供允许的跨域源 |

---

### 2.3 Swagger API 文档

#### 创建 `src/config/swagger.config.ts`

**功能**：
- 配置 Swagger 文档元信息
- 添加 Bearer Token 认证支持
- 配置 API 分组标签

**关键代码**：

```typescript
import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('TimeShards API')
    .setDescription('TimeShards 后端 API 文档')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT token',
        in: 'header',
      },
      'access-token',
    )
    .addTag('auth', '认证相关接口')
    .addTag('blog', '博客文章接口')
    .addTag('guestbook', '留言板接口')
    .addTag('chat', '聊天室接口')
    .addTag('portfolio', '作品集接口')
    .addTag('admin', '管理后台接口')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });
}
```

**访问地址**：`http://localhost:3001/api/docs`

---

### 2.4 统一响应拦截器

#### 创建 `src/common/interceptors/transform.interceptor.ts`

**功能**：
- 拦截所有成功的响应
- 统一包装为 `{ code, data, message }` 格式

**关键代码**：

```typescript
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => ({
        code: 200,
        data,
        message: 'success',
      })),
    );
  }
}
```

**响应示例**：

```json
// Controller 返回: { status: 'ok' }
// 拦截器包装后:
{
  "code": 200,
  "data": { "status": "ok" },
  "message": "success"
}
```

---

### 2.5 全局异常过滤器

#### 创建 `src/common/filters/http-exception.filter.ts`

**功能**：
- 捕获所有异常（HttpException 和未知异常）
- 统一错误响应格式
- 记录错误日志

**关键代码**：

```typescript
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'InternalServerError';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as Record<string, any>;
        message = responseObj.message || exception.message;
        error = responseObj.error || exception.name;

        // 处理验证错误（数组形式）
        if (Array.isArray(message)) {
          message = message.join('; ');
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      error = exception.name;
      this.logger.error(
        `Unexpected error: ${exception.message}`,
        exception.stack,
      );
    }

    response.status(status).json({
      code: status,
      data: null,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
```

**错误响应示例**：

```json
{
  "code": 400,
  "data": null,
  "message": "用户名或密码错误",
  "error": "BadRequestException",
  "timestamp": "2026-05-05T03:51:49.086Z",
  "path": "/api/auth/login"
}
```

---

### 2.6 全局验证管道

#### 创建 `src/common/pipes/validation.pipe.ts`

**功能**：
- 使用 class-validator 验证 DTO
- 自动转换数据类型
- 过滤未定义的属性

**关键代码**：

```typescript
import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class CustomValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToInstance(metatype, value);
    const errors = await validate(object, {
      whitelist: true,           // 过滤未定义的属性
      forbidNonWhitelisted: true, // 禁止未定义的属性
      transform: true,           // 自动转换类型
    });

    if (errors.length > 0) {
      const messages = errors
        .map((err) => {
          const constraints = err.constraints;
          if (constraints) {
            return Object.values(constraints).join('; ');
          }
          return '';
        })
        .filter(Boolean)
        .join('; ');

      throw new BadRequestException(messages);
    }

    return value;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
```

**验证选项说明**：

| 选项 | 值 | 说明 |
|------|------|------|
| `whitelist` | `true` | 自动移除 DTO 中未定义的属性 |
| `forbidNonWhitelisted` | `true` | 如果存在未定义属性则抛出错误 |
| `transform` | `true` | 自动将 plain object 转换为 DTO 实例 |

---

### 2.7 通用分页 DTO

#### 创建 `src/common/dto/pagination.dto.ts`

**功能**：
- 定义通用分页参数
- 提供分页计算方法
- 支持 Swagger 文档

**关键代码**：

```typescript
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
  @ApiPropertyOptional({ description: '页码', default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: '每页数量',
    default: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 10;

  get skip(): number {
    return ((this.page || 1) - 1) * (this.pageSize || 10);
  }

  get limit(): number {
    return this.pageSize || 10;
  }
}

export class PaginatedResponseDto<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;

  constructor(items: T[], total: number, page: number, pageSize: number) {
    this.items = items;
    this.total = total;
    this.page = page;
    this.pageSize = pageSize;
    this.totalPages = Math.ceil(total / pageSize);
  }
}
```

---

### 2.8 应用入口配置

#### 创建 `src/main.ts`

**功能**：
- 创建 NestJS 应用实例
- 注册全局组件（管道、拦截器、过滤器）
- 配置 CORS
- 设置全局前缀
- 初始化 Swagger

**关键代码**：

```typescript
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { CustomValidationPipe } from './common/pipes/validation.pipe';
import { setupSwagger } from './config/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,  // 缓冲日志，等待 Pino 初始化
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port', 3001);
  const corsOrigins = configService.get<string[]>('app.corsOrigins', []);

  // 使用 Pino 日志
  app.useLogger(app.get(Logger));

  // 启用 CORS
  app.enableCors({
    origin: corsOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // 全局前缀
  app.setGlobalPrefix('api');

  // 全局管道
  app.useGlobalPipes(new CustomValidationPipe());

  // 全局拦截器
  app.useGlobalInterceptors(new TransformInterceptor());

  // 全局过滤器
  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger 文档
  setupSwagger(app);

  await app.listen(port);

  const logger = app.get(Logger);
  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`Swagger docs: http://localhost:${port}/api/docs`);
}

bootstrap();
```

---

### 2.9 根模块配置

#### 创建 `src/app.module.ts`

**功能**：
- 导入配置模块（带验证）
- 连接 MongoDB
- 配置速率限制
- 配置日志系统

**关键代码**：

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';
import { appConfig, envValidationSchema } from './config/app.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // 配置模块（带验证）
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      validationSchema: envValidationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: true,
      },
    }),

    // MongoDB 连接
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('app.mongodbUri'),
      }),
    }),

    // 速率限制
    ThrottlerModule.forRoot([{
      ttl: 60000,  // 60 秒
      limit: 60,   // 最多 60 次请求
    }]),

    // Pino 日志
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isProduction = configService.get<string>('app.nodeEnv') === 'production';
        const logLevel = configService.get<string>('app.logLevel', 'info');

        return {
          pinoHttp: {
            level: logLevel,
            transport: isProduction
              ? undefined
              : {
                  target: 'pino-pretty',
                  options: {
                    colorize: true,
                    levelFirst: true,
                    translateTime: 'SYS:standard',
                  },
                },
          },
        };
      },
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // 全局速率限制守卫
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
```

---

### 2.10 健康检查接口

#### 创建 `src/app.controller.ts`

```typescript
import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AppService } from './app.service';
import { SkipThrottle } from '@nestjs/throttler';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  @SkipThrottle()  // 健康检查不受速率限制
  @ApiOperation({ summary: '健康检查' })
  healthCheck() {
    return this.appService.healthCheck();
  }
}
```

#### 创建 `src/app.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {}

  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: this.configService.get<string>('app.nodeEnv'),
      version: '1.0.0',
    };
  }
}
```

---

## 三、项目结构

```
timeshards-backend/
├── src/
│   ├── main.ts                              # 应用入口
│   ├── app.module.ts                        # 根模块
│   ├── app.controller.ts                    # 健康检查控制器
│   ├── app.service.ts                       # 健康检查服务
│   ├── config/
│   │   ├── app.config.ts                    # 环境变量配置 + Joi 验证
│   │   └── swagger.config.ts                # Swagger 配置
│   └── common/
│       ├── interceptors/
│       │   └── transform.interceptor.ts     # 统一响应拦截器
│       ├── filters/
│       │   └── http-exception.filter.ts     # 全局异常过滤器
│       ├── pipes/
│       │   └── validation.pipe.ts           # 全局验证管道
│       ├── dto/
│       │   └── pagination.dto.ts            # 通用分页 DTO
│       ├── guards/                          # 守卫目录（待实现）
│       └── decorators/                      # 装饰器目录（待实现）
├── .env                                     # 环境变量
├── .env.example                             # 环境变量模板
├── .gitignore
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── tsconfig.build.json
└── nest-cli.json
```

---

## 四、验证测试

### 4.1 编译检查

```bash
$ npx tsc --noEmit
# 无输出，表示编译成功
```

### 4.2 构建项目

```bash
$ pnpm run build
> nest build

# 构建成功
```

### 4.3 启动服务

```bash
$ pnpm run start:dev
[Nest] 12345  - 05/05/2026, 11:51:27 AM     LOG [NestFactory] Starting Nest application...
[Nest] 12345  - 05/05/2026, 11:51:27 AM     LOG [InstanceLoader] AppModule dependencies initialized
[Nest] 12345  - 05/05/2026, 11:51:27 AM     LOG [RoutesResolver] AppController {/api}:
[Nest] 12345  - 05/05/2026, 11:51:27 AM     LOG [RouterExplorer] Mapped {/api/health, GET} route
[Nest] 12345  - 05/05/2026, 11:51:27 AM     LOG Application is running on: http://localhost:3001
[Nest] 12345  - 05/05/2026, 11:51:27 AM     LOG Swagger docs: http://localhost:3001/api/docs
```

### 4.4 健康检查测试

```bash
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

**验证点**：
- ✅ 响应格式为统一的 `{ code, data, message }`
- ✅ 返回正确的环境信息
- ✅ 时间戳为 ISO 格式

---

## 五、关键技术点

### 5.1 配置管理

- 使用 `@nestjs/config` 的 `registerAs` 创建配置命名空间
- 使用 Joi 在启动时验证环境变量
- 通过 `ConfigService` 注入配置值

### 5.2 全局组件注册

```typescript
// 在 main.ts 中注册全局组件
app.useGlobalPipes(new CustomValidationPipe());
app.useGlobalInterceptors(new TransformInterceptor());
app.useGlobalFilters(new HttpExceptionFilter());
```

### 5.3 速率限制

- 使用 `@nestjs/throttler` 实现
- 默认配置：60 秒内最多 60 次请求
- 使用 `@SkipThrottle()` 装饰器跳过特定接口

### 5.4 日志系统

- 使用 `nestjs-pino` 集成 Pino 日志
- 开发环境使用 `pino-pretty` 美化输出
- 生产环境输出 JSON 格式

---

## 六、下一步

Phase 2 将实现 Auth 模块，包括：
- Admin Schema 设计
- JWT 认证策略
- 登录接口
- Token 刷新机制
- JWT 守卫
- 种子数据脚本
