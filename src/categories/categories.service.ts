/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category } from './schemas/category.schema';
import { CounterService } from 'src/common/counter/counter.service';
import slugify from 'slugify';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    private counterService: CounterService,
  ) {}

  async createCategory(name: string, imageUrl?: string): Promise<Category> {
    const nextId = await this.counterService.getNextSequence('categoryId');

    const slug = slugify(name, { lower: true, strict: true });

    const category = new this.categoryModel({
      categoryId: nextId,
      name,
      imageUrl,
      slug,
    });

    return category.save();
  }

  async getAll(): Promise<Category[]> {
    return this.categoryModel.find().sort({ categoryId: 1 });
  }

  async findByCategoryId(id: number): Promise<Category> {
    const category = await this.categoryModel.findOne({ categoryId: id });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }
    
  async updateCategory(
    id: number,
    data: { name?: string; imageUrl?: string }
  ): Promise<Category> {
    if (data.name) {
      data['slug'] = slugify(data.name, { lower: true, strict: true });
    }

    const updated = await this.categoryModel.findOneAndUpdate(
      { categoryId: id },
      { $set: data },
      { new: true }
    );

    if (!updated) throw new NotFoundException('Category not found');
    return updated;
  }

}
