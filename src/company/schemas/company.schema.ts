/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Company extends Document {

    @Prop({ required: true, unique: true })
    name: string;

    @Prop({ required: true, unique: true })
    subdomain: string;

    @Prop({ default: true })
    isActive: boolean;

    @Prop({
        type: {
            plan: { type: String, default: 'free' },
            expiresAt: { type: Date, default: null },
            isActive: { type: Boolean, default: true },
        },
    })
    subscription: {
        plan: string;
        expiresAt: Date | null;
        isActive: boolean;
    };

}

export const CompanySchema = SchemaFactory.createForClass(Company);
