/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Category } from './schemas/category.schema';
import { CounterService } from 'src/common/counter/counter.service';
import slugify from 'slugify';
import { CreateCategoryDto } from './dto/category.dto';
import { Product } from 'src/products/schemas/product.schema';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    private counterService: CounterService,
    private cloudinary: CloudinaryService,
  ) { }

  async createCategory(dto: CreateCategoryDto, companyId: string, imageUrl?: string, publicId?: string) {
    const nextId = await this.counterService.getNextSequence('categoryId');

    const exists = await this.categoryModel.findOne({
      'name.ar': dto.name.ar,
      company: companyId,
    });

    if (exists) throw new BadRequestException('Category already exists');

    return await this.categoryModel.create({
      categoryId: nextId,
      name: dto.name,
      imageUrl,
      imagePublicId: publicId,
      slug: slugify(dto.name.en ?? dto.name.ar, { lower: true, strict: true }),
      company: new Types.ObjectId(companyId),
    });
  }

  async getAll(companyId: string, page = 1, limit = 20, search?: string) {
    const filter: any = { company: companyId };

    if (search) {
      filter.$or = [
        { 'name.ar': { $regex: search, $options: 'i' } },
        { 'name.en': { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const total = await this.categoryModel.countDocuments(filter);

    const categories = await this.categoryModel
      .find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    return {
      data: categories,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByCategoryId(categoryId: number, companyId: string) {
    return this.categoryModel.findOne({ categoryId, company: companyId });
  }

  async updateCategory(categoryId: number, companyId: string, dto: any, file?: Express.Multer.File) {
    const category = await this.categoryModel.findOne({ categoryId, company: companyId });

    if (!category) throw new NotFoundException('Category not found');

    const updateData: any = {};

    if (dto?.name) {
      updateData.name = dto.name;
      updateData.slug = slugify(dto.name.en ?? dto.name.ar, { lower: true, strict: true });
    }

    if (file) {
      // delete old image
      if (category.imagePublicId) {
        await this.cloudinary.deleteImage(category.imagePublicId);
      }

      const upload = await this.cloudinary.uploadImage(file, companyId, 'categories');
      updateData.imageUrl = upload.secure_url;
      updateData.imagePublicId = upload.public_id;
    }

    return this.categoryModel.findOneAndUpdate(
      { categoryId, company: companyId },
      { $set: updateData },
      { new: true },
    );
  }

  async bulkDelete(ids: number[], companyId: string) {
    const blocked: number[] = [];
    const deletable: number[] = [];

    for (const catId of ids) {
      const category = await this.categoryModel.findOne({ categoryId: catId, company: companyId });

      if (!category) continue;

      const used = await this.productModel.findOne({
        category: category._id,
        company: companyId,
      });

      if (used) blocked.push(catId);
      else deletable.push(catId);
    }

    if (deletable.length > 0) {
      await this.categoryModel.deleteMany({
        categoryId: { $in: deletable },
        company: companyId,
      });
    }

    return {
      deleted: deletable,
      blocked,
      message:
        blocked.length > 0
          ? 'Some categories were not deleted because they contain products'
          : 'All categories deleted successfully',
    };
  }

  async deleteCategory(categoryId: number, companyId: string) {
    const category = await this.categoryModel.findOne({ categoryId, company: companyId });
    if (!category) throw new NotFoundException('Category not found');

    const used = await this.productModel.findOne({
      category: category._id,
      company: companyId,
    });

    if (used) {
      throw new BadRequestException('Cannot delete a category that contains products');
    }

    if (category.imagePublicId) {
      await this.cloudinary.deleteImage(category.imagePublicId);
    }

    await this.categoryModel.deleteOne({ categoryId, company: companyId });

    return { message: 'Category deleted successfully', deletedCategoryId: categoryId };
  }
}
