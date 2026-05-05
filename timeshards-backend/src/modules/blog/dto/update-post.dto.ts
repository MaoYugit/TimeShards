import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  MaxLength,
  MinLength,
} from "class-validator";
import { BlogCategory, BlogStatus } from "../schemas/blog-post.schema";

export class UpdatePostDto {
  @ApiPropertyOptional({
    description: "文章标题",
    example: "更新后的标题",
    minLength: 1,
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({
    description: "URL 友好的标识符",
    example: "updated-slug",
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  slug?: string;

  @ApiPropertyOptional({
    description: "摘要",
    example: "更新后的摘要...",
    maxLength: 300,
  })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  summary?: string;

  @ApiPropertyOptional({
    description: "状态",
    enum: BlogStatus,
  })
  @IsOptional()
  @IsEnum(BlogStatus)
  status?: BlogStatus;

  @ApiPropertyOptional({
    description: "分类",
    enum: BlogCategory,
  })
  @IsOptional()
  @IsEnum(BlogCategory)
  category?: BlogCategory;

  @ApiPropertyOptional({
    description: "标签",
    example: ["Vue", "TypeScript"],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    description: "封面图 URL",
  })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiPropertyOptional({
    description: "Markdown 正文",
  })
  @IsOptional()
  @IsString()
  content?: string;
}
