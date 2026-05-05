import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BlogPost, BlogPostDocument } from '../blog/schemas/blog-post.schema';
import { GuestbookEntry, GuestbookEntryDocument } from '../guestbook/schemas/guestbook-entry.schema';
import { ChatMessage, ChatMessageDocument } from '../chat/schemas/chat-message.schema';
import { PortfolioProject, PortfolioProjectDocument } from '../portfolio/schemas/portfolio-project.schema';

export interface DashboardStats {
  postCount: number;
  publishedPostCount: number;
  draftPostCount: number;
  guestbookCount: number;
  chatMessageCount: number;
  portfolioCount: number;
}

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectModel(BlogPost.name) private blogPostModel: Model<BlogPostDocument>,
    @InjectModel(GuestbookEntry.name) private guestbookModel: Model<GuestbookEntryDocument>,
    @InjectModel(ChatMessage.name) private chatMessageModel: Model<ChatMessageDocument>,
    @InjectModel(PortfolioProject.name) private portfolioModel: Model<PortfolioProjectDocument>,
  ) {}

  /**
   * 获取仪表盘统计数据
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const [
      postCount,
      publishedPostCount,
      draftPostCount,
      guestbookCount,
      chatMessageCount,
      portfolioCount,
    ] = await Promise.all([
      this.blogPostModel.countDocuments().exec(),
      this.blogPostModel.countDocuments({ status: 'published' }).exec(),
      this.blogPostModel.countDocuments({ status: 'draft' }).exec(),
      this.guestbookModel.countDocuments().exec(),
      this.chatMessageModel.countDocuments().exec(),
      this.portfolioModel.countDocuments().exec(),
    ]);

    return {
      postCount,
      publishedPostCount,
      draftPostCount,
      guestbookCount,
      chatMessageCount,
      portfolioCount,
    };
  }
}
