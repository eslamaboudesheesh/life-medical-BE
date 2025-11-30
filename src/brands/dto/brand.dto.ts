/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsOptional } from 'class-validator';

export class  CreateBrandDto{
    @ApiProperty({
        example: { ar: 'جلاكسو', en: 'Glaxo' },
        description: 'Arabic & English names for the brand',
    })
    @IsObject()
    name: {
        ar: string;
        en?: string;
    };

    @ApiProperty({
        example: 'https://cloudinary.com/image.jpg',
        required: false,
    })
    @IsOptional()
    imageUrl?: string;
    
}
