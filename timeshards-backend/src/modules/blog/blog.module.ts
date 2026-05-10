import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { BlogController } from "./blog.controller";
import { BlogService } from "./blog.service";
import { BlogPost, BlogPostSchema } from "./schemas/blog-post.schema";
import { BlogCategoryModule } from "../blog-category/blog-category.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BlogPost.name, schema: BlogPostSchema },
    ]),
    BlogCategoryModule,
  ],
  controllers: [BlogController],
  providers: [BlogService],
  exports: [BlogService],
})
export class BlogModule {}
