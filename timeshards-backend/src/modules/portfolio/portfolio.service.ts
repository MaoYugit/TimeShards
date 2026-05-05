import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PortfolioProject, PortfolioProjectDocument } from './schemas/portfolio-project.schema';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';

@Injectable()
export class PortfolioService {
  private readonly logger = new Logger(PortfolioService.name);

  constructor(
    @InjectModel(PortfolioProject.name) private portfolioModel: Model<PortfolioProjectDocument>,
  ) {}

  /**
   * 创建作品
   */
  async create(createPortfolioDto: CreatePortfolioDto): Promise<PortfolioProjectDocument> {
    const project = new this.portfolioModel(createPortfolioDto);
    const savedProject = await project.save();
    this.logger.log(`Portfolio project created: ${createPortfolioDto.title}`);
    return savedProject;
  }

  /**
   * 获取作品列表（按排序权重降序）
   */
  async findAll(): Promise<PortfolioProjectDocument[]> {
    return this.portfolioModel
      .find()
      .sort({ sortOrder: -1, createdAt: -1 })
      .exec();
  }

  /**
   * 根据 ID 获取作品详情
   */
  async findById(id: string): Promise<PortfolioProjectDocument> {
    const project = await this.portfolioModel.findById(id).exec();
    if (!project) {
      throw new NotFoundException(`作品 ID '${id}' 不存在`);
    }
    return project;
  }

  /**
   * 更新作品
   */
  async update(id: string, updatePortfolioDto: UpdatePortfolioDto): Promise<PortfolioProjectDocument> {
    const project = await this.portfolioModel.findById(id).exec();
    if (!project) {
      throw new NotFoundException(`作品 ID '${id}' 不存在`);
    }

    const updatedProject = await this.portfolioModel
      .findByIdAndUpdate(id, updatePortfolioDto, { new: true })
      .exec();

    if (!updatedProject) {
      throw new NotFoundException(`作品 ID '${id}' 不存在`);
    }

    this.logger.log(`Portfolio project updated: ${updatedProject.title}`);
    return updatedProject;
  }

  /**
   * 删除作品
   */
  async remove(id: string): Promise<void> {
    const project = await this.portfolioModel.findById(id).exec();
    if (!project) {
      throw new NotFoundException(`作品 ID '${id}' 不存在`);
    }

    await this.portfolioModel.findByIdAndDelete(id).exec();
    this.logger.log(`Portfolio project deleted: ${project.title}`);
  }

  /**
   * 获取作品总数
   */
  async count(): Promise<number> {
    return this.portfolioModel.countDocuments().exec();
  }
}
