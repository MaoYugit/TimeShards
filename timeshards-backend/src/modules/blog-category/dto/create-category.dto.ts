import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsOptional, MaxLength } from "class-validator";

export class CreateCategoryDto {
  @ApiProperty({
    description: "分类名称",
    example: "前端",
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @ApiPropertyOptional({
    description: "URL 友好标识符（留空自动生成）",
    example: "frontend",
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  slug?: string;
}
