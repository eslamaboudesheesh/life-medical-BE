/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, SortOrder, Types } from 'mongoose';
import { Product } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { CategoriesService } from '../categories/categories.service';
import slugify from 'slugify';
import { CloudinaryService } from 'src/common/cloudinary/cloudinary.service';
import { CounterService } from 'src/common/counter/counter.service';

const DEFAULT_RATES = {
  pharmacy: 10,
  public: 20,
  trade: 5,
};

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    private categoriesService: CategoriesService,
    private cloudinaryService: CloudinaryService,
    private counterService: CounterService,

  ) { }

  // ----------------------------------------------------------------
  // CREATE PRODUCT
  // ----------------------------------------------------------------
  async createProduct(dto: CreateProductDto, file?: Express.Multer.File) {
    const category = await this.categoriesService.findByCategoryId(dto.categoryId);
    if (!category) throw new NotFoundException('Category not found');
    const nextId = await this.counterService.getNextSequence('productId');

    let imageUrl = null;
    if (file) {
      const upload = await this.cloudinaryService.uploadImage(file);
      imageUrl = upload.secure_url;
    }

    const pharmacyPrice =
      dto.pharmacyPrice ??
      Number(
        (dto.purchasePrice * (1 + (dto.pharmacyRate ?? DEFAULT_RATES.pharmacy) / 100)).toFixed(2),
      );

    const publicPrice =
      dto.publicPrice ??
      Number(
        (dto.purchasePrice * (1 + (dto.publicRate ?? DEFAULT_RATES.public) / 100)).toFixed(2),
      );

    const tradePrice =
      dto.tradePrice ??
      Number(
        (dto.purchasePrice * (1 + (dto.tradeRate ?? DEFAULT_RATES.trade) / 100)).toFixed(2),
      );

    
    const quantity = dto.quantity ?? 0;
    const minStock = dto.minStock ?? 5;


    const product = new this.productModel({
      ...dto,
      productId: nextId,
      imageUrl,
      pharmacyPrice,
      publicPrice,
      tradePrice,
      quantity,
      inStock: quantity > 0,
      remaining: quantity,
      minStock,
      lowStock: quantity <= minStock,
      slug: slugify(dto.name, { lower: true, strict: true, trim: true }),
      category: category._id,
    });


    const saved = await product.save();
    return saved.populate('category', 'name categoryId');
  }

  // ----------------------------------------------------------------
  // UPDATE PRODUCT
  // ----------------------------------------------------------------
  async updateProduct(
    productId: number,
    dto: Partial<CreateProductDto>,
    file?: Express.Multer.File,
  ) {
    const product = await this.productModel.findOne({ productId });
    if (!product) throw new NotFoundException('Product not found');


    if (dto.categoryId !== undefined) {
      const categoryExists = await this.categoriesService.findByCategoryId(dto.categoryId);
      if (!categoryExists) throw new NotFoundException('Category not found');
      // Cast to any to satisfy the Product.category typing which may expect a populated Category object
      product.category = categoryExists._id as any;
    }


 
    if (dto.purchasePrice) {
      product.purchasePrice = dto.purchasePrice;

      product.pharmacyPrice =
        dto.pharmacyPrice ??
        Number(
          (
            product.purchasePrice *
            (1 + (dto.pharmacyRate ?? DEFAULT_RATES.pharmacy) / 100)
          ).toFixed(2),
        );

      product.publicPrice =
        dto.publicPrice ??
        Number(
          (
            product.purchasePrice *
            (1 + (dto.publicRate ?? DEFAULT_RATES.public) / 100)
          ).toFixed(2),
        );

      product.tradePrice =
        dto.tradePrice ??
        Number(
          (
            product.purchasePrice *
            (1 + (dto.tradeRate ?? DEFAULT_RATES.trade) / 100)
          ).toFixed(2),
        );
    }

  
    if (dto.name) {
      product.name = dto.name;
      product.slug = slugify(dto.name, {
        lower: true,
        strict: true,
        trim: true,
      });
    }

    if (dto.quantity !== undefined) {
      product.quantity = dto.quantity;
      product.remaining = dto.quantity;
      product.inStock = dto.quantity > 0;

      const minStock = dto.minStock ?? product.minStock;
      product.lowStock = product.quantity <= minStock;
    }
  
    if (dto.barcode) product.barcode = dto.barcode;
   
    if (dto.isPublished !== undefined) product.isPublished = dto.isPublished;

    
    if (file) {
      // ❗ Delete old image from Cloudinary (optional but recommended)
      if (product.imageUrl) {
        try {
          const publicId = product.imageUrl.split('/').pop().split('.')[0];
          await this.cloudinaryService.deleteImage(publicId);
        } catch (err) {
          console.log('⚠️ Failed to delete old image:', err.message);
        }
      }

      const upload = await this.cloudinaryService.uploadImage(file);
      product.imageUrl = upload.secure_url;
    }


    if (dto.gallery) {
      product.gallery = dto.gallery;
    }
   

    await product.save();
    return product.populate('category', 'name categoryId');
  }


  // ----------------------------------------------------------------
  // GET ALL PRODUCTS
  // ----------------------------------------------------------------
  async getAllProducts(query: any) {
    const { page = 1, limit = 10, search, category, order = 'desc', isPublished } = query;

    const skip = (page - 1) * limit;
    const filter: any = {};

    // SEARCH
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { barcode: { $regex: search, $options: 'i' } },
      ];
    }

    // FILTER BY CATEGORY
    if (category && Types.ObjectId.isValid(category)) {
      filter.category = new Types.ObjectId(category);
    }

    // FILTER BY PUBLISH STATE
    if (isPublished !== undefined) {
      filter.isPublished = isPublished === 'true';
    }

    const sortQuery: Record<string, SortOrder> = {
      createdAt: order === 'asc' ? 1 : -1,
    };

    const total = await this.productModel.countDocuments(filter);

    const products = await this.productModel
      .find(filter)
      .populate('category', 'name categoryId')
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

  // ----------------------------------------------------------------
  // GET PRODUCT BY ID
  // ----------------------------------------------------------------
  async getById(productId: number) {
    const product = await this.productModel
      .findOne({productId})
      .populate('category', 'name categoryId');

    if (!product) throw new NotFoundException('Product not found');

    return product;
  }

  async updatePublishState(productId: number, state: boolean) {
    const product = await this.productModel.findOne({productId});

    if (!product) throw new NotFoundException('Product not found');

    product.isPublished = state;

    await product.save();

    return product.populate('category', 'name categoryId');
  }


  async getBySlug(slug: string) {
    const product = await this.productModel
      .findOne({ slug })
      .populate('category', 'name categoryId');

    if (!product) throw new NotFoundException('Product not found');

    return product;
  }

}
