import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
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
import { PortfolioService } from './portfolio.service';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { PortfolioProject } from './schemas/portfolio-project.schema';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('portfolio')
@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: '获取作品列表' })
  @ApiResponse({
    status: 200,
    description: '成功获取作品列表',
  })
  async findAll(): Promise<PortfolioProject[]> {
    return this.portfolioService.findAll();
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: '获取作品详情' })
  @ApiParam({ name: 'id', description: '作品 ID' })
  @ApiResponse({
    status: 200,
    description: '成功获取作品详情',
  })
  @ApiResponse({
    status: 404,
    description: '作品不存在',
  })
  async findById(@Param('id') id: string): Promise<PortfolioProject> {
    return this.portfolioService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '创建作品' })
  @ApiResponse({
    status: 201,
    description: '作品创建成功',
  })
  async create(@Body() createPortfolioDto: CreatePortfolioDto): Promise<PortfolioProject> {
    return this.portfolioService.create(createPortfolioDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '更新作品' })
  @ApiParam({ name: 'id', description: '作品 ID' })
  @ApiResponse({
    status: 200,
    description: '作品更新成功',
  })
  @ApiResponse({
    status: 404,
    description: '作品不存在',
  })
  async update(
    @Param('id') id: string,
    @Body() updatePortfolioDto: UpdatePortfolioDto,
  ): Promise<PortfolioProject> {
    return this.portfolioService.update(id, updatePortfolioDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '删除作品' })
  @ApiParam({ name: 'id', description: '作品 ID' })
  @ApiResponse({
    status: 200,
    description: '作品删除成功',
  })
  @ApiResponse({
    status: 404,
    description: '作品不存在',
  })
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.portfolioService.remove(id);
    return { success: true };
  }
}
