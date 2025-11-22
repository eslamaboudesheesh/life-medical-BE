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
import { BrandsService } from 'src/brands/brands.service';

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
    private brandsService: BrandsService,

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

    // ─────────────────────────────────────────────
    // 1) HANDLE BRAND
    // ─────────────────────────────────────────────
    let brandId = null;

    if (dto.brand) {
      const brand = await this.brandsService.getById(dto.brand);
      if (!brand) throw new NotFoundException('Brand not found');
      brandId = brand._id;  //  ObjectId
    }

    // ─────────────────────────────────────────────
    // 2) PRICE CALCULATIONS
    // ─────────────────────────────────────────────

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

    // ─────────────────────────────────────────────
    // 3) STOCK MANAGEMENT
    // ─────────────────────────────────────────────

    const quantity = dto.quantity ?? 0;
    const minStock = dto.minStock ?? 5;

    // ─────────────────────────────────────────────
    // 4) CREATE PRODUCT
    // ─────────────────────────────────────────────

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
      slug: slugify(dto.name.en ?? dto.name.ar, { lower: true, strict: true, trim: true }),
      category: category._id,
      brand: brandId, // ← ObjectId فقط
      purchasePriceUpdatedAt: new Date(),
    });

    const saved = await product.save();
    return saved.populate([
      { path: 'category', select: 'name categoryId' },
      { path: 'brand', select: 'name brandId' },
    ]);
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


    if (dto.purchasePrice !== undefined) {
      if (dto.purchasePrice !== product.purchasePrice) {
        product.purchasePrice = dto.purchasePrice;
        product.purchasePriceUpdatedAt = new Date();
      }
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
      product.slug = slugify(dto.name.en ?? dto.name.ar, {
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
   
    if (dto.brand) {
      const brand = await this.brandsService.getById(dto.brand);
      if (!brand) throw new NotFoundException('Brand not found');
      product.brand = brand._id as any;
    }
    
 
    await product.save();
    return product.populate([
      { path: 'category', select: 'name categoryId' },
      { path: 'brand', select: 'name brandId imageUrl' },
    ]);
  }


  // ----------------------------------------------------------------
  // GET ALL PRODUCTS
  // ----------------------------------------------------------------
  async getAllProducts(query: any) {
    const { page = 1, limit = 10, search, category, order = 'desc', isPublished ,brand } = query;

    const skip = (page - 1) * limit;
    const filter: any = {};

    // SEARCH
    if (search) {
      filter.$or = [
        { 'name.ar': { $regex: search, $options: 'i' } },
        { 'name.en': { $regex: search, $options: 'i' } },
        { barcode: { $regex: search, $options: 'i' } },
      ];
    }


    // FILTER BY CATEGORY
    if (category && Types.ObjectId.isValid(category)) {
      filter.category = new Types.ObjectId(category);
    }
    if (brand && Types.ObjectId.isValid(brand)) {
      filter.brand = brand;
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
      .populate([
        { path: 'category', select: 'name categoryId' },
        { path: 'brand', select: 'name brandId' },
      ])
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

  async bulkPublish(ids: string[], state: boolean) {
    return this.productModel.updateMany(
      { _id: { $in: ids } },
      { $set: { isPublished: state } },
    );
  }

  async bulkDelete(ids: string[]) {
    return this.productModel.deleteMany({
      _id: { $in: ids },
    });
  }


  async deleteProduct(id: string) {
    const product = await this.productModel.findById(id);
    if (!product) throw new NotFoundException('Product not found');

    // Delete Cloudinary image
    if (product.imageUrl) {
      try {
        const publicId = product.imageUrl.split('/').pop().split('.')[0];
        await this.cloudinaryService.deleteImage(publicId);
      } catch (e) {
        console.log("Delete image error:", e.message);
      }
    }

    return this.productModel.findByIdAndDelete(id);
  }


  async duplicateProduct(id: string) {
    const original = await this.productModel.findById(id);

    if (!original) throw new NotFoundException("Original product not found");

    const nextId = await this.counterService.getNextSequence("productId");
    const newName = {
      ar: `${original.name.ar} (نسخة)`,
      en: original.name.en ? `${original.name.en} (copy)` : undefined,
    };

    const duplicated = new this.productModel({
      productId: nextId,
      name: newName,
      slug: slugify(newName.en ?? newName.ar, { lower: true, strict: true }),
      barcode: undefined, 
      purchasePrice: original.purchasePrice,
      pharmacyPrice: original.pharmacyPrice,
      publicPrice: original.publicPrice,
      tradePrice: original.tradePrice,
      quantity: 0, 
      inStock: false,
      remaining: 0,

      imageUrl: original.imageUrl,
      gallery: original.gallery,
      isPublished: false,

      brand: original.brand,
      category: original.category,

      minStock: original.minStock,
      lowStock: false,

      purchasePriceUpdatedAt: new Date(),
    });

    const saved = await duplicated.save();
    return saved.populate('category brand');
  }

}
