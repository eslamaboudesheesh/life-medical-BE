/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category } from './schemas/category.schema';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
  ) {}

  async createCategory(name: string): Promise<Category> {
    const category = new this.categoryModel({ name });
    return category.save();
  }

  async getAll(): Promise<Category[]> {
    return this.categoryModel.find();
  }

  async findById(id: string): Promise<Category | null> {
    return this.categoryModel.findById(id);
    }
    
    async updateCategory(id: string, name: string): Promise<Category> {
        const category = await this.categoryModel.findByIdAndUpdate(
            id,
            { name },
            { new: true } 
        );
        if (!category) throw new NotFoundException('Category not found');
        return category;
    }
}
