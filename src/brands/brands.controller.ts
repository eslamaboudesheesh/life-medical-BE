/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UploadedFile,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';
import { BrandsService } from './brands.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateBrandDto } from './dto/brand.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@ApiTags('Brands')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('brands')
export class BrandsController {
  constructor(
    private brandsService: BrandsService,
    private cloudinary: CloudinaryService,
  ) { }

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create brand (Arabic + English + Optional Image)' })
  async create(
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateBrandDto,
  ) {
    let imageUrl = null;
    let publicId = null;

    if (file) {
      const upload = await this.cloudinary.uploadImage(file, req.user.companyId, 'brands');
      imageUrl = upload.secure_url;
      publicId = upload.public_id;
    }

    return this.brandsService.create(dto, req.user.companyId, imageUrl, publicId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all brands for company' })
  getAll(@Req() req) {
    return this.brandsService.getAll(req.user.companyId);
  }

  @Put(':brandId')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update brand' })
  async update(
    @Param('brandId') brandId: number,
    @Req() req,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: Partial<CreateBrandDto>,
  ) {
    return this.brandsService.update(brandId, req.user.companyId, dto, file);
  }

  @Delete(':brandId')
  @ApiOperation({ summary: 'Delete brand safely (only if unused)' })
  async delete(@Param('brandId') brandId: number, @Req() req) {
    return this.brandsService.delete(brandId, req.user.companyId);
  }

  @Delete('bulk')
  @ApiOperation({ summary: 'Bulk delete brands safely' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        ids: { type: 'array', items: { type: 'number' } },
      },
      required: ['ids'],
    },
  })
  async bulkDelete(@Body('ids') ids: number[], @Req() req) {
    return this.brandsService.bulkDelete(ids, req.user.companyId);
  }
}
