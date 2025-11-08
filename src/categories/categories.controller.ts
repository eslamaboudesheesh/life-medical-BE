/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Put,
  Param
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UserRole } from '../users/schemas/user.schema';

@ApiBearerAuth() 
@ApiTags('Categories') 
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) { }

  // ✅ Create category
  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new category (Admin only)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Painkillers', description: 'Category name' },
      },
      required: ['name'],
    },
  })
  @ApiResponse({ status: 201, description: 'Category created successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Only admin can create categories.' })
  createCategory(@Body('name') name: string) {
    return this.categoriesService.createCategory(name);
  }

  // ✅ Get all categories
  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({
    status: 200,
    description: 'List of categories',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '6737aa2d3b12f9e0a8a2b4d1' },
          name: { type: 'string', example: 'Painkillers' },
          createdAt: { type: 'string', example: '2025-11-07T12:30:45.123Z' },
        },
      },
    },
  })
  getAll() {
    return this.categoriesService.getAll();
  }

  // ✅ Update category
  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update a category (Admin / Manager)' })
  @ApiParam({
    name: 'id',
    description: 'Category ID',
    example: '6737aa2d3b12f9e0a8a2b4d1',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Antibiotics', description: 'New category name' },
      },
      required: ['name'],
    },
  })
  @ApiResponse({ status: 200, description: 'Category updated successfully.' })
  @ApiResponse({ status: 404, description: 'Category not found.' })
  updateCategory(@Param('id') id: string, @Body('name') name: string) {
    return this.categoriesService.updateCategory(id, name);
  }
}
