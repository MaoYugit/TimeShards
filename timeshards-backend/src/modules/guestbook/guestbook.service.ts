import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GuestbookEntry, GuestbookEntryDocument } from './schemas/guestbook-entry.schema';
import { CreateGuestbookDto } from './dto/create-guestbook.dto';
import { QueryGuestbookDto } from './dto/query-guestbook.dto';
import { PaginatedResponseDto } from '../../common/dto/pagination.dto';

@Injectable()
export class GuestbookService {
  private readonly logger = new Logger(GuestbookService.name);

  constructor(
    @InjectModel(GuestbookEntry.name) private guestbookModel: Model<GuestbookEntryDocument>,
  ) {}

  /**
   * 创建留言
   */
  async create(createGuestbookDto: CreateGuestbookDto, ip?: string, userAgent?: string): Promise<GuestbookEntryDocument> {
    const entry = new this.guestbookModel({
      ...createGuestbookDto,
      ip,
      userAgent,
    });

    const savedEntry = await entry.save();
    this.logger.log(`Guestbook entry created by: ${createGuestbookDto.name}`);
    return savedEntry;
  }

  /**
   * 获取留言列表（分页）
   */
  async findAll(queryDto: QueryGuestbookDto): Promise<PaginatedResponseDto<GuestbookEntryDocument>> {
    const { page, pageSize, skip, limit } = queryDto;

    const [items, total] = await Promise.all([
      this.guestbookModel
        .find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.guestbookModel.countDocuments().exec(),
    ]);

    return new PaginatedResponseDto(items, total, page || 1, pageSize || 10);
  }

  /**
   * 删除留言（管理员）
   */
  async remove(id: string): Promise<void> {
    const entry = await this.guestbookModel.findById(id).exec();
    if (!entry) {
      throw new NotFoundException(`留言 ID '${id}' 不存在`);
    }

    await this.guestbookModel.findByIdAndDelete(id).exec();
    this.logger.log(`Guestbook entry deleted: ${id}`);
  }

  /**
   * 获取留言总数
   */
  async count(): Promise<number> {
    return this.guestbookModel.countDocuments().exec();
  }
}
