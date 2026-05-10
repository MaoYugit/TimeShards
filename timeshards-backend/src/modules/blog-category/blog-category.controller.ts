import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
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
import { BlogCategoryService } from "./blog-category.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { BlogCategory } from "./schemas/blog-category.schema";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { Public } from "../../common/decorators/public.decorator";

@ApiTags("blog-categories")
@Controller("blog-categories")
export class BlogCategoryController {
  constructor(private readonly blogCategoryService: BlogCategoryService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: "获取所有分类" })
  @ApiResponse({
    status: 200,
    description: "成功获取分类列表",
  })
  async findAll(): Promise<BlogCategory[]> {
    return this.blogCategoryService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "创建分类" })
  @ApiResponse({
    status: 201,
    description: "分类创建成功",
  })
  @ApiResponse({
    status: 409,
    description: "分类名已存在",
  })
  async create(@Body() dto: CreateCategoryDto): Promise<BlogCategory> {
    return this.blogCategoryService.create(dto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("access-token")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "删除分类" })
  @ApiParam({ name: "id", description: "分类 ID" })
  @ApiResponse({
    status: 200,
    description: "分类删除成功",
  })
  @ApiResponse({
    status: 404,
    description: "分类不存在",
  })
  @ApiResponse({
    status: 409,
    description: "分类下有文章，无法删除",
  })
  async remove(@Param("id") id: string): Promise<{ success: boolean }> {
    await this.blogCategoryService.remove(id);
    return { success: true };
  }
}
