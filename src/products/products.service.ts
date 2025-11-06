/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, SortOrder, Types } from 'mongoose';
import { Product } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { CategoriesService } from '../categories/categories.service';

const DEFAULT_RATES = {
  pharmacy: 10, // %
  public: 20,
  trade: 5,
};

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    private categoriesService: CategoriesService,
  ) {}

  async createProduct(dto: CreateProductDto) {
    const category = await this.categoriesService.findById(dto.category);
    if (!category) throw new NotFoundException('Category not found');

    const {
      name,
      barcode,
      purchasePrice,
      pharmacyPrice,
      publicPrice,
      tradePrice,
      pharmacyRate,
      publicRate,
      tradeRate,
      quantity,
    } = dto;

      const finalPharmacyPrice = pharmacyPrice ??
          Number((purchasePrice * (1 + ((pharmacyRate ?? DEFAULT_RATES.pharmacy) / 100))).toFixed(2));

      const finalPublicPrice = publicPrice ??
          Number((purchasePrice * (1 + ((publicRate ?? DEFAULT_RATES.public) / 100))).toFixed(2));

      const finalTradePrice = tradePrice ??
          Number((purchasePrice * (1 + ((tradeRate ?? DEFAULT_RATES.trade) / 100))).toFixed(2));


    const product = new this.productModel({
      name,
      barcode,
      purchasePrice,
      pharmacyPrice: finalPharmacyPrice,
      publicPrice: finalPublicPrice,
      tradePrice: finalTradePrice,
      quantity: quantity ?? 0,
      category: category._id,
    });
      const savedProduct = await product.save();
      return savedProduct.populate('category', 'name');
  }

    async getAllProducts(query: any) {
        const { page = 1, limit = 10, search, category, order = 'desc' } = query;

        const skip = (page - 1) * limit;
        const filter: any = {};

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { barcode: { $regex: search, $options: 'i' } },
            ];
        }

        if (category && Types.ObjectId.isValid(category)) {
            filter.category = new Types.ObjectId(category);
        }

        const sortQuery: Record<string, SortOrder> = {
            createdAt: order === 'asc' ? 1 : -1,
        };
        console.log(filter)
        const total = await this.productModel.countDocuments(filter);

        const products = await this.productModel
            .find(filter)
            .populate('category', 'name')
            .sort(sortQuery)
            .skip(Number(skip))
            .limit(Number(limit));

        return {
            data: products,
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / limit),
        };
    }


  async getById(id: string) {
    const product = await this.productModel
      .findById(id)
      .populate('category', 'name');
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }
}
