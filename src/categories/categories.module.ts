/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Category, CategorySchema } from './schemas/category.schema';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { CloudinaryModule } from 'src/common/cloudinary/cloudinary.module';
import { CounterModule } from 'src/common/counter/counter.module';

@Module({
  imports: [
    CloudinaryModule,
    CounterModule,

    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
    ]),
  ],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService], 
})
export class CategoriesModule {}
