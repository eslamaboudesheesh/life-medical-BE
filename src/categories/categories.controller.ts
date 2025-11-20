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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CategoriesService } from './categories.service';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UserRole } from '../users/schemas/user.schema';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';

@ApiBearerAuth()
@ApiTags('Categories')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('categories')
export class CategoriesController {
  constructor(
    private categoriesService: CategoriesService,
    private cloudinaryService: CloudinaryService,
  ) {}

  // CREATE -----------------------------------------
  @Post()
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Create new category with optional image' })
  async createCategory(
    @UploadedFile() file: Express.Multer.File,
    @Body('name') name: string,
  ) {
    let imageUrl = null;

    if (file) {
      const upload = await this.cloudinaryService.uploadImage(file);
      imageUrl = upload.secure_url;
    }

    return this.categoriesService.createCategory(name, imageUrl);
  }

  // GET ALL -----------------------------------------
  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  getAll() {
    return this.categoriesService.getAll();
  }

  // UPDATE -----------------------------------------
  @Put(':categoryId')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Update category name or image' })
  async updateCategory(
    @Param('categoryId') categoryId: number,
    @UploadedFile() file: Express.Multer.File,
    @Body('name') name?: string,
  ) {
    const updateData: any = {};

    if (name) updateData.name = name;
    if (file) {
      const upload = await this.cloudinaryService.uploadImage(file);
      updateData.imageUrl = upload.secure_url;
    }

    return this.categoriesService.updateCategory(categoryId, updateData);
  }
}
