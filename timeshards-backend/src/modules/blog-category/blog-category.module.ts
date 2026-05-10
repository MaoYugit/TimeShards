import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { BlogCategoryController } from "./blog-category.controller";
import { BlogCategoryService } from "./blog-category.service";
import {
  BlogCategory,
  BlogCategorySchema,
} from "./schemas/blog-category.schema";
import { BlogPost, BlogPostSchema } from "../blog/schemas/blog-post.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BlogCategory.name, schema: BlogCategorySchema },
      { name: BlogPost.name, schema: BlogPostSchema },
    ]),
  ],
  controllers: [BlogCategoryController],
  providers: [BlogCategoryService],
  exports: [BlogCategoryService],
})
export class BlogCategoryModule {}
