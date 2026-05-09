import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export type SiteConfigDocument = SiteConfig & Document;

@Schema({
  timestamps: true,
  collection: 'siteconfigs',
})
export class SiteConfig {
  @ApiProperty({ description: '配置 ID' })
  _id: string;

  @Prop({ required: true, unique: true })
  @ApiProperty({ description: '配置键', example: 'homepage' })
  key: string;

  @Prop({ type: Object, default: {} })
  @ApiProperty({ description: '配置值' })
  value: Record<string, any>;

  @ApiProperty({ description: '创建时间' })
  createdAt: Date;

  @ApiProperty({ description: '更新时间' })
  updatedAt: Date;
}

export const SiteConfigSchema = SchemaFactory.createForClass(SiteConfig);
