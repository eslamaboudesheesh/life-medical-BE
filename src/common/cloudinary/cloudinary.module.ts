/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryService } from './cloudinary.service';

@Module({
    providers: [
        CloudinaryService,
        {
            provide: 'CLOUDINARY',
            useFactory: () => {
                cloudinary.config({
                    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
                    api_key: process.env.CLOUDINARY_API_KEY,
                    api_secret: process.env.CLOUDINARY_API_SECRET,
                });
                return cloudinary;
            },
        },
    ],
    exports: ['CLOUDINARY', CloudinaryService],
    
})
export class CloudinaryModule { }
