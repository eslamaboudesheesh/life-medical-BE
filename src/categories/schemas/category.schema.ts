/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Category extends Document {
  @Prop({ required: true })
  categoryId: number; // Auto-Increment

  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ default: null })
  imageUrl: string;

  @Prop({ unique: true })
  slug: string;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
