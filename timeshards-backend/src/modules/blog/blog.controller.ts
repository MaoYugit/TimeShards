import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from "@nestjs/swagger";
import { BlogService } from "./blog.service";
import { CreatePostDto } from "./dto/create-post.dto";
import { UpdatePostDto } from "./dto/update-post.dto";
import { QueryPostDto } from "./dto/query-post.dto";
import { BlogPost } from "./schemas/blog-post.schema";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Public } from "../../common/decorators/public.decorator";
import { AdminDocument } from "../auth/schemas/admin.schema";
import { PaginatedResponseDto } from "../../common/dto/pagination.dto";

@ApiTags("blog")
@Controller("posts")
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: "获取文章列表" })
  @ApiResponse({
    status: 200,
    description: "成功获取文章列表",
  })
  async findAll(
    @Query() queryDto: QueryPostDto,
  ): Promise<PaginatedResponseDto<BlogPost>> {
    return this.blogService.findAll(queryDto);
  }

  @Get("admin")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "获取所有文章（管理员）" })
  @ApiResponse({
    status: 200,
    description: "成功获取所有文章（包含草稿）",
  })
  async findAllAdmin(
    @Query() queryDto: QueryPostDto,
  ): Promise<PaginatedResponseDto<BlogPost>> {
    return this.blogService.findAllAdmin(queryDto);
  }

  @Get("categories")
  @Public()
  @ApiOperation({ summary: "获取所有分类" })
  @ApiResponse({
    status: 200,
    description: "成功获取分类列表",
  })
  async getCategories(): Promise<string[]> {
    return this.blogService.getCategories();
  }

  @Get(":id")
  @Public()
  @ApiOperation({ summary: "根据 ID 获取文章详情" })
  @ApiParam({ name: "id", description: "文章 ID" })
  @ApiResponse({
    status: 200,
    description: "成功获取文章详情",
  })
  @ApiResponse({
    status: 404,
    description: "文章不存在",
  })
  async findById(@Param("id") id: string): Promise<BlogPost> {
    return this.blogService.findById(id);
  }

  @Get("slug/:slug")
  @Public()
  @ApiOperation({ summary: "根据 slug 获取文章详情" })
  @ApiParam({ name: "slug", description: "文章 slug" })
  @ApiResponse({
    status: 200,
    description: "成功获取文章详情",
  })
  @ApiResponse({
    status: 404,
    description: "文章不存在",
  })
  async findBySlug(@Param("slug") slug: string): Promise<BlogPost> {
    return this.blogService.findBySlug(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "创建文章" })
  @ApiResponse({
    status: 201,
    description: "文章创建成功",
  })
  @ApiResponse({
    status: 409,
    description: "Slug 已存在",
  })
  async create(
    @Body() createPostDto: CreatePostDto,
    @CurrentUser() admin: AdminDocument,
  ): Promise<BlogPost> {
    return this.blogService.create(createPostDto, admin._id.toString());
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "更新文章" })
  @ApiParam({ name: "id", description: "文章 ID" })
  @ApiResponse({
    status: 200,
    description: "文章更新成功",
  })
  @ApiResponse({
    status: 404,
    description: "文章不存在",
  })
  @ApiResponse({
    status: 409,
    description: "Slug 已存在",
  })
  async update(
    @Param("id") id: string,
    @Body() updatePostDto: UpdatePostDto,
  ): Promise<BlogPost> {
    return this.blogService.update(id, updatePostDto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("access-token")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "删除文章" })
  @ApiParam({ name: "id", description: "文章 ID" })
  @ApiResponse({
    status: 200,
    description: "文章删除成功",
  })
  @ApiResponse({
    status: 404,
    description: "文章不存在",
  })
  async remove(@Param("id") id: string): Promise<{ success: boolean }> {
    await this.blogService.remove(id);
    return { success: true };
  }
}
