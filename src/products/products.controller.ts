/* eslint-disable prettier/prettier */
import { Controller, Post, Body, Get, Param, UseGuards, Query, UploadedFile, UseInterceptors, Patch, Delete, Req } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';

@ApiBearerAuth() 
@ApiTags('Products')
@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
  constructor(private productsService: ProductsService, private cloudinaryService: CloudinaryService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateProductDto,
    @Req() req: any,
  ) {
    return this.productsService.createProduct(dto, file, req.user);
  }


  @Patch(':productId')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  update(
    @Param('productId') productId: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: Partial<CreateProductDto>,
    @Req() req: any,
  ) {
    return this.productsService.updateProduct(productId, dto, req.user, file );
  }

  
  @Get()
  @ApiOperation({ summary: 'Get all products with pagination, search, sorting, and category filter' })
  @ApiQuery({ name: 'page', required: false, example: 1, description: 'Page number for pagination' })
  @ApiQuery({ name: 'limit', required: false, example: 10, description: 'Number of products per page' })
  @ApiQuery({ name: 'search', required: false, example: 'Panadol', description: 'Search term by product name or barcode' })
  @ApiQuery({ name: 'category', required: false, example: '6737aa2d3b12...', description: 'Filter by category ID' })
  @ApiQuery({ name: 'order', required: false, example: 'desc', description: 'order by creation date (asc or desc)' })
  @ApiResponse({ status: 200, description: 'List of products retrieved successfully.' })
  getAll(@Query() query: any, @Req() req: any) {
        return this.productsService.getAllProducts(query , req.user);
    }

  @Get(':productId')
  @ApiOperation({ summary: 'Get single product by productId' })
  @ApiParam({ name: 'productId', description: 'The product productId', example: '6737ac2f6a52...' })
  @ApiResponse({ status: 200, description: 'Product found and returned.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  getById(@Param('productId') productId: number    , @Req() req: any
) {
    return this.productsService.getById(productId , req.user);
  }

  @Patch(':productId/publish')
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({ summary: 'Publish product' })
  publish(@Param('productId') productId: number, @Req() req: any) {
    return this.productsService.updatePublishState(productId, true , req.user);
  }

  @Patch(':productId/unpublish')
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({ summary: 'Unpublish product' })
  unpublish(@Param('productId') productId: number , @Req() req: any) {
    return this.productsService.updatePublishState(productId, false , req.user);
  }


  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get product by slug (Marketplace)' })
  getBySlug(@Param('slug') slug: string, @Req() req: any) {
    return this.productsService.getBySlug(slug , req.user);
  }


  @Patch('bulk/publish')
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({ summary: 'Bulk publish products' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        ids: {
          type: 'array',
          items: { type: 'string' },
          example: ['67b8e1f6c3d2f1a2b4cd1234', '67b8e20dc3d2f1a2b4cd1235'],
          description: 'List of product IDs to publish'
        }
      },
      required: ['ids']
    }
  })
  @ApiResponse({ status: 200, description: 'Products published successfully' })
  bulkPublish(@Body('ids') ids: string[], @Req() req: any) {
    return this.productsService.bulkPublish(ids, true , req.user);
  }
  @Patch('bulk/unpublish')
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({ summary: 'Bulk unpublish products' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        ids: {
          type: 'array',
          items: { type: 'string' },
          example: ['67b8e1f6c3d2f1a2b4cd1234'],
        }
      },
      required: ['ids']
    }
  })
  @ApiResponse({ status: 200, description: 'Products unpublished successfully' })
  bulkUnpublish(@Body('ids') ids: string[] ,@Req() req: any) {
    return this.productsService.bulkPublish(ids, false, req.user);
  }

  @Delete('bulk')
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({ summary: 'Bulk delete products' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        ids: {
          type: 'array',
          items: { type: 'string' },
          example: ['67b8e1f6c3d2f1a2b4cd1234'],
        }
      },
      required: ['ids']
    }
  })
  @ApiResponse({ status: 200, description: 'Products deleted successfully' })
  bulkDelete(@Body('ids') ids: string[], @Req() req: any) {
    return this.productsService.bulkDelete(ids , req.user);
  }


  @Patch(':id/publish')
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({ summary: 'Publish single product' })
  @ApiParam({ name: 'id', example: 101, description: 'productId' })
  @ApiResponse({ status: 200, description: 'Product published successfully' })

  publishOne(@Param('id') id: number, @Req() req: any) {
    return this.productsService.updatePublishState(id, true , req.user);
  }

  @Patch(':id/unpublish')
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({ summary: 'Unpublish single product' })
  @ApiParam({ name: 'id', example: 101 })
  @ApiResponse({ status: 200, description: 'Product unpublished successfully' })

  unpublishOne(@Param('id') id: number, @Req() req: any) {
    return this.productsService.updatePublishState(id, false ,  req.user);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({ summary: 'Delete a single product' })
  @ApiParam({ name: 'id', example: '67b8e1f6c3d2f1a2b4cd1234' })
  @ApiResponse({ status: 200, description: 'Product deleted successfully' })
  deleteOne(@Param('id') id: string, @Req() req: any) {
    return this.productsService.deleteProduct(id , req.user);
  }


  @Post(':id/duplicate')
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @ApiOperation({ summary: 'Duplicate product' })
  @ApiOperation({ summary: 'Duplicate product' })
  @ApiParam({ name: 'id', example: '67b8e1f6c3d2f1a2b4cd1234' })
  @ApiResponse({ status: 201, description: 'Product duplicated successfully' })
  duplicate(@Param('id') id: string, @Req() req: any) {
    return this.productsService.duplicateProduct(id , req.user);
  }

}
