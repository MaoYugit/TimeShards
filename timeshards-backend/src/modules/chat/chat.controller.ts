import {
  Controller,
  Get,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { ChatMessage } from './schemas/chat-message.schema';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('messages')
  @Public()
  @ApiOperation({ summary: '获取历史消息' })
  @ApiQuery({ name: 'limit', required: false, description: '消息数量限制', example: 50 })
  @ApiQuery({ name: 'before', required: false, description: '获取此时间之前的消息' })
  @ApiResponse({
    status: 200,
    description: '成功获取历史消息',
  })
  async getHistory(
    @Query('limit') limit?: number,
    @Query('before') before?: string,
  ): Promise<{ items: ChatMessage[] }> {
    const messages = await this.chatService.getHistory(limit || 50, before);
    return { items: messages };
  }
}
