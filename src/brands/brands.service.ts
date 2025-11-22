/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Brand } from './schema/brand.schema';
import { CounterService } from 'src/common/counter/counter.service';

@Injectable()
export class BrandsService {
  constructor(
    @InjectModel(Brand.name) private brandModel: Model<Brand>,
    private counterService: CounterService,
  ) {}

  async create(name: string, imageUrl?: string) {
    const id = await this.counterService.getNextSequence('brandId');

    return await this.brandModel.create({
      name,
      imageUrl,
      brandId: id,
    });
  }

  getAll() {
    return this.brandModel.find();
  }

  getById(id: string) {
    return this.brandModel.findById(id);
  }

  async update(id: string, data: any) {
    const updated = await this.brandModel.findByIdAndUpdate(id, data, {
      new: true,
    });
    if (!updated) throw new NotFoundException('Brand not found');
    return updated;
  }

  async delete(id: string) {
    const deleted = await this.brandModel.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException('Brand not found');
    return deleted;
  }
}
