/* eslint-disable prettier/prettier */
import { Controller, Post, Body, Get, Param, UseGuards, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  create(@Body() dto: CreateProductDto) {
    return this.productsService.createProduct(dto);
  }

    @Get()
    getAll(@Query() query: any) {
        return this.productsService.getAllProducts(query);
    }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.productsService.getById(id);
  }
}
