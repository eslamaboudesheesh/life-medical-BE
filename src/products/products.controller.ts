/* eslint-disable prettier/prettier */
import { Controller, Post, Body, Get, Param, UseGuards, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth() 
@ApiTags('Products')
@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Create new product (Admin / Manager only)' })
  @ApiResponse({ status: 201, description: 'Product created successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Only Admins or Managers can access this endpoint.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
    
  create(@Body() dto: CreateProductDto) {
    return this.productsService.createProduct(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products with pagination, search, sorting, and category filter' })
  @ApiQuery({ name: 'page', required: false, example: 1, description: 'Page number for pagination' })
  @ApiQuery({ name: 'limit', required: false, example: 10, description: 'Number of products per page' })
  @ApiQuery({ name: 'search', required: false, example: 'Panadol', description: 'Search term by product name or barcode' })
  @ApiQuery({ name: 'category', required: false, example: '6737aa2d3b12...', description: 'Filter by category ID' })
  @ApiQuery({ name: 'sort', required: false, example: 'desc', description: 'Sort by creation date (asc or desc)' })
  @ApiResponse({ status: 200, description: 'List of products retrieved successfully.' })
    getAll(@Query() query: any) {
        return this.productsService.getAllProducts(query);
    }

  @Get(':id')
  @ApiOperation({ summary: 'Get single product by ID' })
  @ApiParam({ name: 'id', description: 'The product ID', example: '6737ac2f6a52...' })
  @ApiResponse({ status: 200, description: 'Product found and returned.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  getById(@Param('id') id: string) {
    return this.productsService.getById(id);
  }
}
