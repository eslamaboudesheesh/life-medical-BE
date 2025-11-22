/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';
import { BrandsService } from './brands.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Brands')
@ApiBearerAuth()
@Controller('brands')
export class BrandsController {
  constructor(
    private brandsService: BrandsService,
    private cloudinary: CloudinaryService,
  ) {}
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Create a new brand with optional image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Pfizer' },
        image: {
          type: 'string',
          format: 'binary',
          description: 'Brand image (optional)',
        },
      },
      required: ['name'],
    },
  })
  @ApiResponse({ status: 201, description: 'Brand created successfully' })
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body('name') name: string,
  ) {
    let imageUrl = null;
    if (file) imageUrl = (await this.cloudinary.uploadImage(file)).secure_url;

    return this.brandsService.create(name, imageUrl);
  }

  @Get()
  @ApiOperation({ summary: 'Get all brands' })
  @ApiResponse({
    status: 200,
    description: 'List of all brands',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '67bf9d33f4032e...' },
          name: { type: 'string', example: 'Pfizer' },
          imageUrl: { type: 'string', example: 'https://cloudinary/...jpg' },
          brandId: { type: 'number', example: 3 },
        },
      },
    },
  })
  getAll() {
    return this.brandsService.getAll();
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Update brand name and/or image' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', example: '67bf9d33f4032e...' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Novartis' },
        image: {
          type: 'string',
          format: 'binary',
          description: 'Brand image (optional)',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Brand updated successfully' })
 async update(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('name') name?: string,
  ) {
    const data: any = {};
    if (name) data.name = name;
    if (file)
      data.imageUrl = (await this.cloudinary.uploadImage(file)).secure_url;

    return this.brandsService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a brand' })
  @ApiParam({ name: 'id', example: '67bf9d33f4032e...' })
  @ApiResponse({ status: 200, description: 'Brand deleted successfully' })
  delete(@Param('id') id: string) {
    return this.brandsService.delete(id);
  }
}
