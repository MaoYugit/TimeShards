import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, FilterQuery } from "mongoose";
import {
  BlogPost,
  BlogPostDocument,
  BlogStatus,
} from "./schemas/blog-post.schema";
import { CreatePostDto } from "./dto/create-post.dto";
import { UpdatePostDto } from "./dto/update-post.dto";
import { QueryPostDto } from "./dto/query-post.dto";
import { PaginatedResponseDto } from "../../common/dto/pagination.dto";
import { BlogCategoryService } from "../blog-category/blog-category.service";

@Injectable()
export class BlogService {
  private readonly logger = new Logger(BlogService.name);

  constructor(
    @InjectModel(BlogPost.name) private blogPostModel: Model<BlogPostDocument>,
    private readonly blogCategoryService: BlogCategoryService,
  ) {}

  /**
   * 创建文章
   */
  async create(
    createPostDto: CreatePostDto,
    authorId: string,
  ): Promise<BlogPostDocument> {
    // 生成 slug
    let slug = createPostDto.slug;
    if (!slug) {
      slug = this.generateSlug(createPostDto.title);
    }

    // 检查 slug 是否已存在
    const existingPost = await this.blogPostModel.findOne({ slug });
    if (existingPost) {
      throw new ConflictException(`Slug '${slug}' 已存在`);
    }

    // 验证分类是否存在
    await this.validateCategory(createPostDto.category);

    // 自动生成摘要
    let summary = createPostDto.summary;
    if (!summary && createPostDto.content) {
      summary = this.generateSummary(createPostDto.content);
    }

    // 设置发布时间
    let publishedAt: Date | undefined = undefined;
    if (createPostDto.status === BlogStatus.PUBLISHED) {
      publishedAt = new Date();
    }

    const post = new this.blogPostModel({
      ...createPostDto,
      slug,
      summary,
      publishedAt,
      authorId,
    });

    const savedPost = await post.save();
    this.logger.log(`Blog post created: ${savedPost.title}`);
    return savedPost;
  }

  /**
   * 获取文章列表（分页、筛选、搜索）
   */
  async findAll(
    queryDto: QueryPostDto,
  ): Promise<PaginatedResponseDto<BlogPostDocument>> {
    const { category, status, q, page, pageSize, skip, limit } = queryDto;

    // 构建查询条件
    const filter: FilterQuery<BlogPostDocument> = {};

    if (category) {
      filter.category = category;
    }

    if (status) {
      filter.status = status;
    } else {
      // 默认只返回已发布的文章
      filter.status = BlogStatus.PUBLISHED;
    }

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { summary: { $regex: q, $options: "i" } },
        { content: { $regex: q, $options: "i" } },
      ];
    }

    // 执行查询
    const [items, total] = await Promise.all([
      this.blogPostModel
        .find(filter)
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-content") // 列表不返回正文
        .exec(),
      this.blogPostModel.countDocuments(filter).exec(),
    ]);

    return new PaginatedResponseDto(items, total, page || 1, pageSize || 10);
  }

  /**
   * 获取所有文章（管理员用，包含草稿）
   */
  async findAllAdmin(
    queryDto: QueryPostDto,
  ): Promise<PaginatedResponseDto<BlogPostDocument>> {
    const { category, status, q, page, pageSize, skip, limit } = queryDto;

    const filter: FilterQuery<BlogPostDocument> = {};

    if (category) {
      filter.category = category;
    }

    if (status) {
      filter.status = status;
    }

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { summary: { $regex: q, $options: "i" } },
      ];
    }

    const [items, total] = await Promise.all([
      this.blogPostModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-content")
        .exec(),
      this.blogPostModel.countDocuments(filter).exec(),
    ]);

    return new PaginatedResponseDto(items, total, page || 1, pageSize || 10);
  }

  /**
   * 根据 ID 获取文章详情
   */
  async findById(id: string): Promise<BlogPostDocument> {
    const post = await this.blogPostModel.findById(id).exec();

    if (!post) {
      throw new NotFoundException(`文章 ID '${id}' 不存在`);
    }

    // 增加阅读量
    await this.blogPostModel
      .findByIdAndUpdate(id, { $inc: { viewCount: 1 } })
      .exec();
    post.viewCount += 1;

    return post;
  }

  /**
   * 根据 slug 获取文章详情
   */
  async findBySlug(slug: string): Promise<BlogPostDocument> {
    const post = await this.blogPostModel.findOne({ slug }).exec();

    if (!post) {
      throw new NotFoundException(`文章 slug '${slug}' 不存在`);
    }

    // 增加阅读量
    await this.blogPostModel
      .findOneAndUpdate({ slug }, { $inc: { viewCount: 1 } })
      .exec();
    post.viewCount += 1;

    return post;
  }

  /**
   * 更新文章
   */
  async update(
    id: string,
    updatePostDto: UpdatePostDto,
  ): Promise<BlogPostDocument> {
    // 检查文章是否存在
    const existingPost = await this.blogPostModel.findById(id).exec();
    if (!existingPost) {
      throw new NotFoundException(`文章 ID '${id}' 不存在`);
    }

    // 检查 slug 是否冲突
    if (updatePostDto.slug && updatePostDto.slug !== existingPost.slug) {
      const slugConflict = await this.blogPostModel
        .findOne({ slug: updatePostDto.slug })
        .exec();
      if (slugConflict) {
        throw new ConflictException(`Slug '${updatePostDto.slug}' 已存在`);
      }
    }

    // 验证分类是否存在
    if (updatePostDto.category) {
      await this.validateCategory(updatePostDto.category);
    }

    // 如果状态从草稿变为发布，设置发布时间
    let publishedAt = existingPost.publishedAt;
    if (
      updatePostDto.status === BlogStatus.PUBLISHED &&
      existingPost.status === BlogStatus.DRAFT
    ) {
      publishedAt = new Date();
    }

    // 自动生成摘要
    let summary = updatePostDto.summary;
    if (!summary && updatePostDto.content && !existingPost.summary) {
      summary = this.generateSummary(updatePostDto.content);
    }

    const updatedPost = await this.blogPostModel
      .findByIdAndUpdate(
        id,
        {
          ...updatePostDto,
          summary: summary || existingPost.summary,
          publishedAt,
          updatedAt: new Date(),
        },
        { new: true },
      )
      .exec();

    if (!updatedPost) {
      throw new NotFoundException(`文章 ID '${id}' 不存在`);
    }

    this.logger.log(`Blog post updated: ${updatedPost.title}`);
    return updatedPost;
  }

  /**
   * 删除文章
   */
  async remove(id: string): Promise<void> {
    const post = await this.blogPostModel.findById(id).exec();
    if (!post) {
      throw new NotFoundException(`文章 ID '${id}' 不存在`);
    }

    await this.blogPostModel.findByIdAndDelete(id).exec();
    this.logger.log(`Blog post deleted: ${post.title}`);
  }

  /**
   * 获取所有分类
   */
  async getCategories(): Promise<string[]> {
    const categories = await this.blogCategoryService.findAll();
    return categories.map((c) => c.name);
  }

  /**
   * 验证分类是否存在
   */
  private async validateCategory(categoryName: string): Promise<void> {
    const categories = await this.blogCategoryService.findAll();
    const validNames = categories.map((c) => c.name);
    if (!validNames.includes(categoryName)) {
      throw new BadRequestException(`分类 '${categoryName}' 不存在`);
    }
  }

  /**
   * 生成 slug
   */
  private generateSlug(title: string): string {
    // 生成 slug：转小写，替换非字母数字中文为连字符
    let slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // 如果 slug 为空（例如纯中文标题），使用时间戳
    if (!slug) {
      slug = "post-" + Date.now();
    }

    return slug;
  }

  /**
   * 生成摘要（截取正文前 150 字）
   */
  private generateSummary(content: string): string {
    // 移除 Markdown 标记
    const plainText = content
      .replace(/#{1,6}\s+/g, "") // 标题
      .replace(/\*\*(.*?)\*\*/g, "$1") // 粗体
      .replace(/\*(.*?)\*/g, "$1") // 斜体
      .replace(/\[(.*?)\]\(.*?\)/g, "$1") // 链接
      .replace(/`{1,3}[^`]*`{1,3}/g, "") // 代码
      .replace(/\n+/g, " ") // 换行
      .trim();

    if (plainText.length <= 150) {
      return plainText;
    }

    return plainText.substring(0, 150) + "...";
  }
}
