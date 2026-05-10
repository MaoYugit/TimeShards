import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { ApiProperty } from "@nestjs/swagger";

export type BlogCategoryDocument = BlogCategory & Document;

@Schema({
  timestamps: true,
  collection: "blogcategories",
})
export class BlogCategory {
  @ApiProperty({ description: "分类 ID" })
  _id: string;

  @Prop({ required: true, unique: true, trim: true })
  @ApiProperty({ description: "分类名称", example: "前端" })
  name: string;

  @Prop({ unique: true, trim: true, lowercase: true })
  @ApiProperty({ description: "URL 友好标识符", example: "frontend" })
  slug: string;

  @Prop({ default: 0 })
  @ApiProperty({ description: "排序权重", example: 0 })
  sortOrder: number;

  @ApiProperty({ description: "创建时间" })
  createdAt: Date;

  @ApiProperty({ description: "更新时间" })
  updatedAt: Date;
}

export const BlogCategorySchema = SchemaFactory.createForClass(BlogCategory);
