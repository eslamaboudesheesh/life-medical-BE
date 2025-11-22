/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
    @ApiProperty({
        example: 'Panadol Extra',
        description: 'اسم المنتج',
    })
    @IsNotEmpty()
    name: string;

    @ApiProperty({
        example: '1234567890',
        description: 'الباركود الفريد للمنتج',
    })
    @IsNotEmpty()
    barcode: string;

    @ApiProperty({
        example: 100,
        description: 'سعر الشراء من المورد',
    })
    @IsNumber()
    purchasePrice: number;

    @ApiPropertyOptional({
        example: 115,
        description: 'سعر البيع للصيدلي (اختياري)',
    })
    @IsOptional()
    @IsNumber()
    pharmacyPrice?: number;

    @ApiPropertyOptional({
        example: 125,
        description: 'سعر البيع للجمهور (اختياري)',
    })
    @IsOptional()
    @IsNumber()
    publicPrice?: number;

    @ApiPropertyOptional({
        example: 105,
        description: 'سعر البيع التجاري (اختياري)',
    })
    @IsOptional()
    @IsNumber()
    tradePrice?: number;

    @ApiPropertyOptional({
        example: 15,
        description: 'نسبة الربح للصيدلي (اختياري)',
    })
    @IsOptional()
    @IsNumber()
    pharmacyRate?: number;

    @ApiPropertyOptional({
        example: 25,
        description: 'نسبة الربح للجمهور (اختياري)',
    })
    @IsOptional()
    @IsNumber()
    publicRate?: number;

    @ApiPropertyOptional({
        example: 5,
        description: 'نسبة الربح التجاري (اختياري)',
    })
    @IsOptional()
    @IsNumber()
    tradeRate?: number;

    @ApiPropertyOptional({
        example: 50,
        description: 'الكمية المتاحة في المخزون',
    })
    @IsOptional()
    @IsNumber()
    quantity?: number;


    @ApiPropertyOptional({ example: false })
    @IsOptional()
    @IsBoolean()
    isPublished?: boolean;

    @ApiPropertyOptional({ example: 'https://cloudinary.com/image.jpg' })
    @IsOptional()
    imageUrl?: string;

    @ApiPropertyOptional({ type: [String] })
    @IsOptional()
    gallery?: string[];


    @ApiProperty({
        example: 0,
        description: 'Category ID (starts from 0)',
    })
    @IsNumber()
    categoryId: number;

    @ApiPropertyOptional()
    @IsOptional()
    minStock?: number;

    @ApiPropertyOptional({
        example: '60d21b4667d0d8992e610c85',
        description: 'Brand ID',    
    })
    @IsOptional()
    @IsNotEmpty()
    brand?: string;
}
