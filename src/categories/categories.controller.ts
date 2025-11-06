/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Body, UseGuards, Put, Param } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UserRole } from '../users/schemas/user.schema';

@Controller('categories')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  createCategory(@Body('name') name: string) {
    return this.categoriesService.createCategory(name);
  }

  @Get()
  getAll() {
    return this.categoriesService.getAll();
    }
    
    @Put(':id')
    @Roles(UserRole.ADMIN, UserRole.MANAGER)
    updateCategory(@Param('id') id: string, @Body('name') name: string) {
        return this.categoriesService.updateCategory(id, name);
    }
}
