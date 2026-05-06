import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SiteConfigService, HomepageConfig } from './site-config.service';
import { HomepageConfigDto } from './dto/update-site-config.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('site-config')
@Controller('site-config')
export class SiteConfigController {
  constructor(private readonly siteConfigService: SiteConfigService) {}

  @Get('homepage')
  @Public()
  @ApiOperation({ summary: '获取首页配置' })
  @ApiResponse({
    status: 200,
    description: '成功获取首页配置',
  })
  async getHomepageConfig(): Promise<HomepageConfig> {
    return this.siteConfigService.getHomepageConfig();
  }

  @Put('homepage')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '更新首页配置' })
  @ApiResponse({
    status: 200,
    description: '首页配置更新成功',
  })
  async updateHomepageConfig(
    @Body() dto: HomepageConfigDto,
  ): Promise<HomepageConfig> {
    return this.siteConfigService.updateHomepageConfig(dto);
  }
}
