import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type ChatMessageDocument = ChatMessage & Document;

@Schema({
  timestamps: true,
  collection: 'chatmessages',
})
export class ChatMessage {
  @ApiProperty({ description: '消息 ID' })
  _id: string;

  @Prop({ required: true })
  @ApiProperty({ description: '用户 ID', example: 'user_123' })
  userId: string;

  @Prop({ required: true, trim: true, maxlength: 32 })
  @ApiProperty({ description: '昵称', example: '访客' })
  nickname: string;

  @Prop({ min: 0, max: 359, default: 0 })
  @ApiProperty({ description: '头像色相', example: 180 })
  avatarHue: number;

  @Prop({ required: true, maxlength: 2000 })
  @ApiProperty({ description: '消息内容', example: '你好！' })
  text: string;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  updatedAt: Date;
}

export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);

// 创建索引
ChatMessageSchema.index({ createdAt: -1 });
