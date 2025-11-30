/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Put,
  Param,
  UploadedFile,
  UseInterceptors,
  Req,
  Query,
  Delete,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CategoriesService } from './categories.service';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UserRole } from '../users/schemas/user.schema';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';
import { CreateCategoryDto } from './dto/category.dto';

@ApiBearerAuth()
@ApiTags('Categories')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('categories')
export class CategoriesController {
  constructor(
    private categoriesService: CategoriesService,
    private cloudinaryService: CloudinaryService,
  ) { }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @UseInterceptors(FileInterceptor('image'))
  async createCategory(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateCategoryDto,
    @Req() req: any,
  ) {
    let imageUrl = null;
    let publicId = null;

    if (file) {
      const upload = await this.cloudinaryService.uploadImage(file, req.user.companyId , 'categories');
      imageUrl = upload.secure_url;
      publicId = upload.public_id;
    }

    return this.categoriesService.createCategory(
      dto,
      req.user.companyId,
      imageUrl,
      publicId,
    );
  }

  @Get()
  getAll(
    @Req() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.categoriesService.getAll(
      req.user.companyId,
      Number(page),
      Number(limit),
      search,
    );
  }

  @Put(':categoryId')
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @UseInterceptors(FileInterceptor('image'))
  async updateCategory(
    @Param('categoryId') categoryId: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: Partial<CreateCategoryDto>,
    @Req() req: any,
  ) {
    return this.categoriesService.updateCategory(
      categoryId,
      req.user.companyId,
      dto,
      file,
    );
  }

  @Delete('bulk')
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  bulkDelete(@Body('ids') ids: number[], @Req() req: any) {
    return this.categoriesService.bulkDelete(ids, req.user.companyId);
  }

  @Delete(':categoryId')
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  deleteOne(@Param('categoryId') categoryId: number, @Req() req: any) {
    return this.categoriesService.deleteCategory(categoryId, req.user.companyId);
  }
}
