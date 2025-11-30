/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Company } from 'src/company/schemas/company.schema';

@Schema({ timestamps: true })
export class Brand extends Document {
  @Prop({
    type: {
      ar: { type: String, required: true },
      en: { type: String, required: false },
    },
    required: true,
  })
  name: {
    ar: string;
    en?: string;
  };

  @Prop({ default: null })
  imageUrl: string;
  
  @Prop({ default: null })
  imagePublicId: string;

  @Prop({ required: true, unique: true })
  brandId: number;
  @Prop({ type: Types.ObjectId, ref: Company.name, required: true })
  company: Company;
}

export const BrandSchema = SchemaFactory.createForClass(Brand);
