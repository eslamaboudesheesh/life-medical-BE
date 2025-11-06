/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Category } from '../../categories/schemas/category.schema';

@Schema({ timestamps: true })
export class Product extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  barcode: string;

  @Prop({ required: true })
  purchasePrice: number;

  @Prop()
  pharmacyPrice?: number;

  @Prop()
  publicPrice?: number;

  @Prop()
  tradePrice?: number;

  @Prop()
  quantity: number;

  @Prop({ type: Types.ObjectId, ref: Category.name })
  category: Category;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
