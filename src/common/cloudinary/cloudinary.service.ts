/* eslint-disable prettier/prettier */
import { Injectable, Inject } from '@nestjs/common';
import { UploadApiResponse, UploadApiErrorResponse, v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  constructor(
    @Inject('CLOUDINARY') private cloudinaryClient: typeof cloudinary,
  ) {}

  uploadImage(file: Express.Multer.File, companyId: string , type: 'products' | 'categories' | 'brands'): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const upload = this.cloudinaryClient.uploader.upload_stream(
        {
          folder: `life-medical/${companyId}/${type}`,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );

      Readable.from(file.buffer).pipe(upload);
    });
  }

    
  async deleteImage(publicId: string): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return this.cloudinaryClient.uploader.destroy(publicId);
  }

}
