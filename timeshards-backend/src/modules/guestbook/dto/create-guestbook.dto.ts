import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateGuestbookDto {
  @ApiProperty({
    description: '昵称',
    example: '访客',
    minLength: 1,
    maxLength: 32,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(32)
  name: string;

  @ApiPropertyOptional({
    description: '邮箱',
    example: 'user@example.com',
  })
  @IsOptional()
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  email?: string;

  @ApiPropertyOptional({
    description: '个人网站',
    example: 'https://example.com',
  })
  @IsOptional()
  @IsUrl({}, { message: '请输入有效的网址' })
  website?: string;

  @ApiProperty({
    description: '留言内容',
    example: '你好！',
    minLength: 1,
    maxLength: 2000,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(2000)
  content: string;
}
