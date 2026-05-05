import {
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChatMessage, ChatMessageDocument } from './schemas/chat-message.schema';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @InjectModel(ChatMessage.name) private chatMessageModel: Model<ChatMessageDocument>,
  ) {}

  /**
   * 保存消息
   */
  async saveMessage(sendMessageDto: SendMessageDto): Promise<ChatMessageDocument> {
    const message = new this.chatMessageModel(sendMessageDto);
    const savedMessage = await message.save();
    this.logger.log(`Chat message saved from: ${sendMessageDto.nickname}`);
    return savedMessage;
  }

  /**
   * 获取历史消息
   */
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

  /**
   * 获取消息总数
   */
  async count(): Promise<number> {
    return this.chatMessageModel.countDocuments().exec();
  }
}
