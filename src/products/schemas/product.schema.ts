/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Category } from '../../categories/schemas/category.schema';
import { Brand } from 'src/brands/schema/brand.schema';

@Schema({ timestamps: true })
export class Product extends Document {

  @Prop({ required: true })
  productId: number; 
  
  @Prop({
    type: {
      ar: { type: String, required: true },
      en: { type: String, required: false },
    },
  })
  name: { ar: string; en?: string };

  @Prop({
    type: {
      ar: { type: String, required: false },
      en: { type: String, required: false },
    },
  })
  description?: { ar?: string; en?: string };

  @Prop({ required: true, unique: true })
  barcode: string;

  @Prop({ required: true })
  purchasePrice: number;
  @Prop({ type: Date, default: null })
  purchasePriceUpdatedAt: Date;
  @Prop()
  pharmacyPrice?: number;

  @Prop()
  publicPrice?: number;

  @Prop()
  tradePrice?: number;

  @Prop()
  quantity: number;

  @Prop()
  imageUrl: string;

  @Prop([String])
  gallery: string[];

  @Prop({ type: Boolean, default: false })
  isPublished: boolean;

  @Prop({ type: Types.ObjectId, ref: Category.name })
  category: Category;
  
  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ default: true })
  inStock: boolean;

  @Prop({ default: 0 })
  remaining: number;

  @Prop({ default: 5 })
  minStock: number;

  @Prop({ default: false })
  lowStock: boolean;



  @Prop({ type: Types.ObjectId, ref: Brand.name })
  brand: Brand;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
