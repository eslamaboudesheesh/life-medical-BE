/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Brand } from './schema/brand.schema';
import { CounterService } from 'src/common/counter/counter.service';
import { CreateBrandDto } from './dto/brand.dto';
import { Product } from 'src/products/schemas/product.schema';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';

@Injectable()
export class BrandsService {
  constructor(
    @InjectModel(Brand.name) private brandModel: Model<Brand>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    private counterService: CounterService,
    private cloudinary: CloudinaryService,
  ) { }

  async create(
    dto: CreateBrandDto,
    companyId: string,
    imageUrl?: string,
    publicId?: string,
  ) {
    const nextId = await this.counterService.getNextSequence('brandId');

    return this.brandModel.create({
      brandId: nextId,
      name: dto.name,
      imageUrl,
      imagePublicId: publicId,
      company: new Types.ObjectId(companyId),
    });
  }

  async getAll(companyId: string) {
    return this.brandModel.find({ company: companyId }).sort({ createdAt: -1 });
  }

  async getByBrandId(brandId: number, companyId: string) {
    return this.brandModel.findOne({ brandId, company: companyId });
  }

  async update(
    brandId: number,
    companyId: string,
    dto: Partial<CreateBrandDto>,
    file?: Express.Multer.File,
  ) {
    const brand = await this.brandModel.findOne({ brandId, company: companyId });
    if (!brand) throw new NotFoundException('Brand not found');

    const updateData: any = {};
    if (dto.name) updateData.name = dto.name;

    // Handle new image
    if (file) {
      if (brand.imagePublicId) {
        await this.cloudinary.deleteImage(brand.imagePublicId);
      }

      const upload = await this.cloudinary.uploadImage(file, companyId, 'brands');
      updateData.imageUrl = upload.secure_url;
      updateData.imagePublicId = upload.public_id;
    }

    return this.brandModel.findOneAndUpdate(
      { brandId, company: companyId },
      { $set: updateData },
      { new: true },
    );
  }

  async delete(brandId: number, companyId: string) {
    const brand = await this.brandModel.findOne({ brandId, company: companyId });
    if (!brand) throw new NotFoundException('Brand not found');

    // Check usage in products
    const used = await this.productModel.findOne({
      brand: brand._id,
      company: companyId,
    });

    if (used) {
      throw new BadRequestException(
        'Cannot delete brand because it is linked to products',
      );
    }

    // Delete image
    if (brand.imagePublicId) {
      await this.cloudinary.deleteImage(brand.imagePublicId);
    }

    return this.brandModel.deleteOne({ brandId, company: companyId });
  }

  async bulkDelete(ids: number[], companyId: string) {
    const brandDocs = await this.brandModel.find({
      brandId: { $in: ids },
      company: companyId,
    });

    const brandObjectIds = brandDocs.map((b) => b._id);

    // Check if any brand is used
    const used = await this.productModel.findOne({
      brand: { $in: brandObjectIds },
      company: companyId,
    });

    if (used) {
      throw new BadRequestException(
        'Cannot delete brands that are linked to products.',
      );
    }

    // Delete all images
    for (const brand of brandDocs) {
      if (brand.imagePublicId) {
        await this.cloudinary.deleteImage(brand.imagePublicId);
      }
    }

    return this.brandModel.deleteMany({
      brandId: { $in: ids },
      company: companyId,
    });
  }
}
