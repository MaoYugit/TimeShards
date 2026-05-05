import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';

// 使用 any 类型避免 socket.io 类型问题
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Server = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Socket = any;

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private connectedUsers = new Map<string, { userId: string; nickname: string }>();

  constructor(private readonly chatService: ChatService) {}

  /**
   * 客户端连接
   */
  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  /**
   * 客户端断开
   */
  handleDisconnect(client: Socket) {
    const user = this.connectedUsers.get(client.id);
    if (user) {
      this.connectedUsers.delete(client.id);
      // 广播用户离开
      this.server.emit('system', {
        type: 'leave',
        userId: user.userId,
        nickname: user.nickname,
        message: `${user.nickname} 离开了聊天室`,
        timestamp: new Date().toISOString(),
      });
    }
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /**
   * 加入聊天室
   */
  @SubscribeMessage('join')
  async handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string; nickname: string },
  ) {
    this.connectedUsers.set(client.id, {
      userId: data.userId,
      nickname: data.nickname,
    });

    // 广播用户加入
    this.server.emit('system', {
      type: 'join',
      userId: data.userId,
      nickname: data.nickname,
      message: `${data.nickname} 加入了聊天室`,
      timestamp: new Date().toISOString(),
    });

    // 返回在线用户数
    return {
      event: 'joined',
      data: {
        onlineCount: this.connectedUsers.size,
      },
    };
  }

  /**
   * 发送消息
   */
  @SubscribeMessage('message')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: SendMessageDto,
  ) {
    // 保存消息到数据库
    const savedMessage = await this.chatService.saveMessage(data);

    // 广播消息
    this.server.emit('message', {
      _id: savedMessage._id,
      userId: savedMessage.userId,
      nickname: savedMessage.nickname,
      avatarHue: savedMessage.avatarHue,
      text: savedMessage.text,
      createdAt: savedMessage.createdAt,
    });

    return {
      event: 'messageSent',
      data: { success: true },
    };
  }

  /**
   * 心跳
   */
  @SubscribeMessage('ping')
  handlePing() {
    return {
      event: 'pong',
      data: { timestamp: new Date().toISOString() },
    };
  }
}
