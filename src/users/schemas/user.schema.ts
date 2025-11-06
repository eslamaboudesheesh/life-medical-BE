/* eslint-disable prettier/prettier */

import { Prop, Schema, SchemaFactory  } from '@nestjs/mongoose';


export type UserDocument = User & Document;

export enum UserRole {
    ADMIN = 'admin',
    MANAGER = 'manager',
    EMPLOYEE = 'employee',
}

@Schema({  timestamps: true})
export class User {
    @Prop({lowercase: true, type: String, required: true})
    name: string;

    @Prop({lowercase: true, type: String, required: true})
    email: string;

    @Prop({ type: String, required: true })
    password: string;

    @Prop({ enum: UserRole, default: UserRole.EMPLOYEE })
    role: UserRole;
}

export const UserSchema = SchemaFactory.createForClass(User);
