import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, IsEnum } from "class-validator";
import { BlogStatus } from "../schemas/blog-post.schema";
import { PaginationDto } from "../../../common/dto/pagination.dto";

export class QueryPostDto extends PaginationDto {
  @ApiPropertyOptional({
    description: "分类筛选",
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: "状态筛选",
    enum: BlogStatus,
  })
  @IsOptional()
  @IsEnum(BlogStatus)
  status?: BlogStatus;

  @ApiPropertyOptional({
    description: "关键词搜索（标题和内容）",
    example: "Vue",
  })
  @IsOptional()
  @IsString()
  q?: string;
}
