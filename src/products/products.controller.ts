/* eslint-disable prettier/prettier */
import { Controller, Post, Body, Get, Param, UseGuards, Query, UploadedFile, UseInterceptors, Patch } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';

@ApiBearerAuth() 
@ApiTags('Products')
@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
  constructor(private productsService: ProductsService, private cloudinaryService: CloudinaryService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateProductDto,
  ) {
    return this.productsService.createProduct(dto, file);
  }


  @Patch(':productId')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  update(
    @Param('productId') productId: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: Partial<CreateProductDto>,
  ) {
    return this.productsService.updateProduct(productId, dto, file);
  }

  
  @Get()
  @ApiOperation({ summary: 'Get all products with pagination, search, sorting, and category filter' })
  @ApiQuery({ name: 'page', required: false, example: 1, description: 'Page number for pagination' })
  @ApiQuery({ name: 'limit', required: false, example: 10, description: 'Number of products per page' })
  @ApiQuery({ name: 'search', required: false, example: 'Panadol', description: 'Search term by product name or barcode' })
  @ApiQuery({ name: 'category', required: false, example: '6737aa2d3b12...', description: 'Filter by category ID' })
  @ApiQuery({ name: 'order', required: false, example: 'desc', description: 'order by creation date (asc or desc)' })
  @ApiResponse({ status: 200, description: 'List of products retrieved successfully.' })
    getAll(@Query() query: any) {
        return this.productsService.getAllProducts(query);
    }

  @Get(':productId')
  @ApiOperation({ summary: 'Get single product by productId' })
  @ApiParam({ name: 'productId', description: 'The product productId', example: '6737ac2f6a52...' })
  @ApiResponse({ status: 200, description: 'Product found and returned.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  getById(@Param('productId') productId: number) {
    return this.productsService.getById(productId);
  }

  @Patch(':productId/publish')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Publish product' })
  publish(@Param('productId') productId: number) {
    return this.productsService.updatePublishState(productId, true);
  }

  @Patch(':productId/unpublish')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Unpublish product' })
  unpublish(@Param('productId') productId: number) {
    return this.productsService.updatePublishState(productId, false);
  }


  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get product by slug (Marketplace)' })
  getBySlug(@Param('slug') slug: string) {
    return this.productsService.getBySlug(slug);
  }

}
