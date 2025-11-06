/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsNumber, IsOptional, IsMongoId } from 'class-validator';

export class CreateProductDto {
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    barcode: string;

    @IsNumber()
    purchasePrice: number;

    @IsOptional()
    @IsNumber()
    pharmacyPrice?: number;

    @IsOptional()
    @IsNumber()
    publicPrice?: number;

    @IsOptional()
    @IsNumber()
    tradePrice?: number;

    @IsOptional()
    @IsNumber()
    pharmacyRate?: number;

    @IsOptional()
    @IsNumber()
    publicRate?: number;

    @IsOptional()
    @IsNumber()
    tradeRate?: number;

    @IsOptional()
    @IsNumber()
    quantity?: number;

    @IsMongoId()
    category: string;
}
