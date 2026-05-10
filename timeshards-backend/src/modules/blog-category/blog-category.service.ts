import {
  Injectable,
  ConflictException,
  NotFoundException,
  Logger,
  OnModuleInit,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import {
  BlogCategory,
  BlogCategoryDocument,
} from "./schemas/blog-category.schema";
import { BlogPost, BlogPostDocument } from "../blog/schemas/blog-post.schema";
import { CreateCategoryDto } from "./dto/create-category.dto";

@Injectable()
export class BlogCategoryService implements OnModuleInit {
  private readonly logger = new Logger(BlogCategoryService.name);

  constructor(
    @InjectModel(BlogCategory.name)
    private blogCategoryModel: Model<BlogCategoryDocument>,
    @InjectModel(BlogPost.name)
    private blogPostModel: Model<BlogPostDocument>,
  ) {}

  async onModuleInit() {
    const count = await this.blogCategoryModel.countDocuments();
    if (count === 0) {
      await this.blogCategoryModel.insertMany([
        { name: "前端", slug: "frontend", sortOrder: 1 },
        { name: "工程化", slug: "engineering", sortOrder: 2 },
        { name: "AI 开发", slug: "ai-development", sortOrder: 3 },
        { name: "随笔", slug: "essay", sortOrder: 4 },
      ]);
      this.logger.log("Default blog categories seeded");
    }
  }

  async create(dto: CreateCategoryDto): Promise<BlogCategoryDocument> {
    const existing = await this.blogCategoryModel.findOne({ name: dto.name });
    if (existing) {
      throw new ConflictException(`分类 '${dto.name}' 已存在`);
    }

    const slug =
      dto.slug ||
      dto.name
        .toLowerCase()
        .replace(/[^a-z0-9一-龥]+/g, "-")
        .replace(/^-+|-+$/g, "") ||
      "cat-" + Date.now();

    const category = new this.blogCategoryModel({ ...dto, slug });
    const saved = await category.save();
    this.logger.log(`Blog category created: ${saved.name}`);
    return saved;
  }

  async findAll(): Promise<BlogCategoryDocument[]> {
    return this.blogCategoryModel.find().sort({ sortOrder: 1, name: 1 }).exec();
  }

  async remove(id: string): Promise<void> {
    const category = await this.blogCategoryModel.findById(id).exec();
    if (!category) {
      throw new NotFoundException(`分类 ID '${id}' 不存在`);
    }

    const postCount = await this.blogPostModel
      .countDocuments({ category: category.name })
      .exec();
    if (postCount > 0) {
      throw new ConflictException(
        `该分类下有 ${postCount} 篇文章，无法删除`,
      );
    }

    await this.blogCategoryModel.findByIdAndDelete(id).exec();
    this.logger.log(`Blog category deleted: ${category.name}`);
  }
}
