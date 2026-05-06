import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SiteConfig, SiteConfigDocument } from './schemas/site-config.schema';
import { HomepageConfigDto } from './dto/update-site-config.dto';

export interface HomepageConfig {
  welcomeQuote: string;
  welcomeIntro: string;
}

@Injectable()
export class SiteConfigService {
  private readonly logger = new Logger(SiteConfigService.name);

  constructor(
    @InjectModel(SiteConfig.name) private siteConfigModel: Model<SiteConfigDocument>,
  ) {}

  /**
   * 获取首页配置
   */
  async getHomepageConfig(): Promise<HomepageConfig> {
    const config = await this.siteConfigModel.findOne({ key: 'homepage' }).exec();
    
    if (!config) {
      // 返回默认配置
      return {
        welcomeQuote: '「欢迎来到 TimeShards —— 愿这片小站能成为你浏览路上的一处歇脚点。」',
        welcomeIntro: '这里是我的个人站点：记录作品集、博客与一些实验。界面偏简洁与玻璃拟态风格，希望阅读起来轻松一点。若你有想法或想交流技术，也欢迎留言互动。',
      };
    }

    return {
      welcomeQuote: config.value?.welcomeQuote || '',
      welcomeIntro: config.value?.welcomeIntro || '',
    };
  }

  /**
   * 更新首页配置
   */
  async updateHomepageConfig(dto: HomepageConfigDto): Promise<HomepageConfig> {
    const config = await this.siteConfigModel.findOne({ key: 'homepage' }).exec();

    if (config) {
      // 更新现有配置
      config.value = {
        ...config.value,
        ...dto,
      };
      await config.save();
    } else {
      // 创建新配置
      await this.siteConfigModel.create({
        key: 'homepage',
        value: dto,
      });
    }

    this.logger.log('Homepage config updated');
    return this.getHomepageConfig();
  }
}
