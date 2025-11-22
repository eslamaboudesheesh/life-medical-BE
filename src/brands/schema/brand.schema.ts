/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Brand extends Document {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ default: null })
  imageUrl: string;

  @Prop({ required: true })
  brandId: number;
}

export const BrandSchema = SchemaFactory.createForClass(Brand);
