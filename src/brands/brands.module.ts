import { Module } from '@nestjs/common';
import { BrandsService } from './brands.service';
import { BrandsController } from './brands.controller';
import { Brand, BrandSchema } from './schema/brand.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { CounterModule } from 'src/common/counter/counter.module';
import { CloudinaryModule } from 'src/common/cloudinary/cloudinary.module';
import { Product, ProductSchema } from 'src/products/schemas/product.schema';

@Module({
  imports: [
    CloudinaryModule,
    CounterModule,
    MongooseModule.forFeature([
      { name: Brand.name, schema: BrandSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  providers: [BrandsService],
  controllers: [BrandsController],
  exports: [BrandsService, MongooseModule],
})
export class BrandsModule {}
