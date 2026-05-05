# Phase 6：Chat 模块（Socket.IO 实时通信）

**完成日期**：2026-05-05  
**状态**：✅ 已完成

---

## 一、本阶段目标

实现实时聊天功能，基于 Socket.IO WebSocket，支持消息存储和历史消息查询。

### 主要任务

1. 创建 ChatMessage Schema（聊天消息数据模型）
2. 创建 DTO（SendMessageDto）
3. 实现 Chat Service（业务逻辑）
4. 实现 Chat Gateway（WebSocket 网关）
5. 实现 Chat Controller（HTTP 接口）
6. 创建 Chat Module

---

## 二、详细操作步骤

### 2.1 创建 ChatMessage Schema

#### 创建 `src/modules/chat/schemas/chat-message.schema.ts`

**数据结构**：

```typescript
{
  _id: string           // 消息 ID
  userId: string        // 用户 ID
  nickname: string      // 昵称（1-32 字）
  avatarHue: number     // 头像色相（0-359）
  text: string          // 消息内容（1-2000 字）
  createdAt: Date       // 创建时间
  updatedAt: Date       // 更新时间
}
```

**索引**：
- `createdAt`: 降序索引（按时间倒序）

---

### 2.2 创建 DTO

#### 创建 `src/modules/chat/dto/send-message.dto.ts`

**字段验证**：

| 字段 | 类型 | 必填 | 验证规则 |
|------|------|------|----------|
| userId | string | 是 | 非空 |
| nickname | string | 是 | 最大 32 字符 |
| avatarHue | number | 否 | 0-359 |
| text | string | 是 | 最大 2000 字符 |

---

### 2.3 实现 Chat Service

#### 创建 `src/modules/chat/chat.service.ts`

**主要方法**：

```typescript
@Injectable()
export class ChatService {
  // 保存消息
  async saveMessage(sendMessageDto: SendMessageDto): Promise<ChatMessageDocument>

  // 获取历史消息
  async getHistory(limit: number = 50, before?: string): Promise<ChatMessageDocument[]>

  // 获取消息总数
  async count(): Promise<number>
}
```

---

### 2.4 实现 Chat Gateway（WebSocket 网关）

#### 创建 `src/modules/chat/chat.gateway.ts`

**WebSocket 事件**：

| 事件 | 方向 | 说明 |
|------|------|------|
| `join` | 客户端 → 服务端 | 加入聊天室 |
| `message` | 客户端 → 服务端 | 发送消息 |
| `ping` | 客户端 → 服务端 | 心跳 |
| `system` | 服务端 → 客户端 | 系统通知（加入/离开） |
| `message` | 服务端 → 客户端 | 广播消息 |
| `pong` | 服务端 → 客户端 | 心跳响应 |

**关键代码**：

```typescript
@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, { userId: string; nickname: string }>();

  // 客户端连接
  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  // 客户端断开
  handleDisconnect(client: Socket) {
    const user = this.connectedUsers.get(client.id);
    if (user) {
      this.connectedUsers.delete(client.id);
      this.server.emit('system', {
        type: 'leave',
        userId: user.userId,
        nickname: user.nickname,
        message: `${user.nickname} 离开了聊天室`,
      });
    }
  }

  // 加入聊天室
  @SubscribeMessage('join')
  async handleJoin(client: Socket, data: { userId: string; nickname: string }) {
    this.connectedUsers.set(client.id, data);
    this.server.emit('system', {
      type: 'join',
      userId: data.userId,
      nickname: data.nickname,
      message: `${data.nickname} 加入了聊天室`,
    });
    return { onlineCount: this.connectedUsers.size };
  }

  // 发送消息
  @SubscribeMessage('message')
  async handleMessage(client: Socket, data: SendMessageDto) {
    const savedMessage = await this.chatService.saveMessage(data);
    this.server.emit('message', {
      _id: savedMessage._id,
      userId: savedMessage.userId,
      nickname: savedMessage.nickname,
      avatarHue: savedMessage.avatarHue,
      text: savedMessage.text,
      createdAt: savedMessage.createdAt,
    });
  }

  // 心跳
  @SubscribeMessage('ping')
  handlePing() {
    return { timestamp: new Date().toISOString() };
  }
}
```

---

### 2.5 实现 Chat Controller（HTTP 接口）

#### 创建 `src/modules/chat/chat.controller.ts`

**API 端点**：

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| GET | `/api/chat/messages` | 否 | 获取历史消息 |

**查询参数**：

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| limit | number | 50 | 消息数量限制 |
| before | string | - | 获取此时间之前的消息 |

---

### 2.6 创建 Chat Module

#### 创建 `src/modules/chat/chat.module.ts`

```typescript
@Module({
  imports: [
    MongooseModule.forFeature([{ name: ChatMessage.name, schema: ChatMessageSchema }]),
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway],
  exports: [ChatService],
})
export class ChatModule {}
```

---

### 2.7 更新 App Module

#### 更新 `src/app.module.ts`

```typescript
import { ChatModule } from './modules/chat/chat.module';

@Module({
  imports: [
    // ... 其他模块
    AuthModule,
    BlogModule,
    GuestbookModule,
    PortfolioModule,
    ChatModule,  // 新增
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
│   │   ├── portfolio/
│   │   └── chat/
│   │       ├── chat.module.ts
│   │       ├── chat.controller.ts
│   │       ├── chat.service.ts
│   │       ├── chat.gateway.ts
│   │       ├── dto/
│   │       │   └── send-message.dto.ts
│   │       └── schemas/
│   │           └── chat-message.schema.ts
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

### 4.2 测试获取历史消息

```bash
$ curl http://localhost:3001/api/chat/messages

{
  "code": 200,
  "data": {
    "items": []
  },
  "message": "success"
}
```

### 4.3 测试 WebSocket 连接

使用 Socket.IO 客户端测试：

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001/chat');

// 加入聊天室
socket.emit('join', { userId: 'user_123', nickname: '测试用户' });

// 发送消息
socket.emit('message', {
  userId: 'user_123',
  nickname: '测试用户',
  text: '你好！',
  avatarHue: 180
});

// 监听消息
socket.on('message', (data) => {
  console.log('收到消息:', data);
});

// 监听系统通知
socket.on('system', (data) => {
  console.log('系统通知:', data);
});
```

---

## 五、关键技术点

### 5.1 Socket.IO 命名空间

使用命名空间隔离不同的 WebSocket 功能：

```typescript
@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/chat',
})
```

客户端连接时需要指定命名空间：
```javascript
const socket = io('http://localhost:3001/chat');
```

### 5.2 在线用户管理

使用 Map 存储在线用户：

```typescript
private connectedUsers = new Map<string, { userId: string; nickname: string }>();
```

- 用户连接时添加
- 用户断开时删除
- 可获取在线用户数

### 5.3 消息持久化

所有消息都会保存到 MongoDB：

```typescript
async saveMessage(sendMessageDto: SendMessageDto): Promise<ChatMessageDocument> {
  const message = new this.chatMessageModel(sendMessageDto);
  return message.save();
}
```

### 5.4 历史消息查询

支持分页查询历史消息：

```typescript
async getHistory(limit: number = 50, before?: string): Promise<ChatMessageDocument[]> {
  const query: any = {};
  if (before) {
    query.createdAt = { $lt: new Date(before) };
  }
  return this.chatMessageModel
    .find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .exec();
}
```

---

## 六、常见问题

### Q1: 如何修改跨域设置？

**A**: 修改 `ChatGateway` 的 `cors` 配置：

```typescript
@WebSocketGateway({
  cors: {
    origin: ['http://localhost:5174', 'http://localhost:5175'],
    credentials: true,
  },
})
```

### Q2: 如何限制消息频率？

**A**: 可以在 `handleMessage` 方法中添加频率限制逻辑：

```typescript
private lastMessageTime = new Map<string, number>();

@SubscribeMessage('message')
async handleMessage(client: Socket, data: SendMessageDto) {
  const now = Date.now();
  const lastTime = this.lastMessageTime.get(client.id) || 0;
  if (now - lastTime < 1000) {
    return { error: '消息发送太频繁' };
  }
  this.lastMessageTime.set(client.id, now);
  // ...
}
```

### Q3: 如何添加房间功能？

**A**: 使用 Socket.IO 的房间功能：

```typescript
// 加入房间
client.join('room-name');

// 向房间发送消息
this.server.to('room-name').emit('message', data);
```

---

## 七、下一步

Phase 7 将实现 Admin 统计模块，包括：
- 统计接口
- 种子数据
