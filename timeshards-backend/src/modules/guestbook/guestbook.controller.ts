import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { GuestbookService } from './guestbook.service';
import { CreateGuestbookDto } from './dto/create-guestbook.dto';
import { QueryGuestbookDto } from './dto/query-guestbook.dto';
import { GuestbookEntry } from './schemas/guestbook-entry.schema';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { PaginatedResponseDto } from '../../common/dto/pagination.dto';

@ApiTags('guestbook')
@Controller('guestbook')
export class GuestbookController {
  constructor(private readonly guestbookService: GuestbookService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: '获取留言列表' })
  @ApiResponse({
    status: 200,
    description: '成功获取留言列表',
  })
  async findAll(
    @Query() queryDto: QueryGuestbookDto,
  ): Promise<PaginatedResponseDto<GuestbookEntry>> {
    return this.guestbookService.findAll(queryDto);
  }

  @Post()
  @Public()
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 每分钟最多 3 条
  @ApiOperation({ summary: '提交留言' })
  @ApiResponse({
    status: 201,
    description: '留言提交成功',
  })
  @ApiResponse({
    status: 429,
    description: '请求过于频繁',
  })
  async create(
    @Body() createGuestbookDto: CreateGuestbookDto,
    @Req() req: Request,
  ): Promise<GuestbookEntry> {
    const ip = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    return this.guestbookService.create(createGuestbookDto, ip, userAgent);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '删除留言' })
  @ApiParam({ name: 'id', description: '留言 ID' })
  @ApiResponse({
    status: 200,
    description: '留言删除成功',
  })
  @ApiResponse({
    status: 404,
    description: '留言不存在',
  })
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.guestbookService.remove(id);
    return { success: true };
  }
}
