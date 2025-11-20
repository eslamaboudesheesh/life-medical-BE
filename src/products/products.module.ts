/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './schemas/product.schema';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { CategoriesModule } from '../categories/categories.module';
import { CloudinaryModule } from 'src/common/cloudinary/cloudinary.module';
import { CounterModule } from 'src/common/counter/counter.module';

@Module({
  imports: [
    CategoriesModule,
    CloudinaryModule, 
    CounterModule,
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
